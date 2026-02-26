use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill as SkillTrait;
use crate::skill::SubprocessCommand;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMeta {
    pub name: String,
    pub domain: String,
    pub executor: String,
    pub description: Option<String>,
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub command: Option<String>,
    pub input_type: Option<String>,
    pub output_type: Option<String>,
    pub estimated_cost: Option<u32>,
    pub estimated_latency_ms: Option<u32>,
    pub allow_fs_read: Option<bool>,
    pub allow_fs_write: Option<bool>,
    pub allow_network: Option<bool>,
    pub allow_env: Option<bool>,
    pub allow_process_spawn: Option<bool>,
    pub side_effect_class: Option<String>,
    pub trust_tier: Option<String>,
}

impl SkillMeta {
    fn get_input_type(&self) -> SkillIOType {
        match self.input_type.as_deref() {
            Some("json") => SkillIOType::Json,
            Some("number") => SkillIOType::Number,
            Some("boolean") => SkillIOType::Boolean,
            _ => SkillIOType::Text,
        }
    }

    fn get_output_type(&self) -> SkillIOType {
        match self.output_type.as_deref() {
            Some("json") => SkillIOType::Json,
            Some("number") => SkillIOType::Number,
            Some("boolean") => SkillIOType::Boolean,
            _ => SkillIOType::Text,
        }
    }

    fn get_permissions(&self) -> CapabilityPermissions {
        let default = match self.executor.as_str() {
            "script" => CapabilityPermissions::new(false, false, false, false, true),
            "ollama" => CapabilityPermissions::new(false, false, true, false, false),
            _ => CapabilityPermissions::none(),
        };

        CapabilityPermissions::new(
            self.allow_fs_read.unwrap_or(default.allow_fs_read),
            self.allow_fs_write.unwrap_or(default.allow_fs_write),
            self.allow_network.unwrap_or(default.allow_network),
            self.allow_env.unwrap_or(default.allow_env),
            self.allow_process_spawn
                .unwrap_or(default.allow_process_spawn),
        )
    }

    fn get_side_effect_class(&self) -> SideEffectClass {
        match self.side_effect_class.as_deref() {
            Some("Pure") => SideEffectClass::Pure,
            Some("ExternalMutation") => SideEffectClass::ExternalMutation,
            Some("Idempotent") => SideEffectClass::Idempotent,
            _ => match self.executor.as_str() {
                "script" => SideEffectClass::ExternalMutation,
                "ollama" => SideEffectClass::Idempotent,
                _ => SideEffectClass::Pure,
            },
        }
    }

    fn get_trust_tier(&self) -> TrustTier {
        match self.trust_tier.as_deref() {
            Some("Constrained") => TrustTier::Constrained,
            Some("Untrusted") => TrustTier::Untrusted,
            _ => TrustTier::Trusted,
        }
    }
}

#[allow(dead_code)]
#[derive(Debug)]
pub struct FileSkill {
    pub meta: SkillMeta,
    pub body: String,
}

#[allow(dead_code)]
#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: Option<OllamaOptions>,
}

#[allow(dead_code)]
#[derive(Serialize)]
struct OllamaOptions {
    temperature: f32,
}

#[allow(dead_code)]
#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
}

#[async_trait]
impl SkillTrait for FileSkill {
    fn name(&self) -> &str {
        &self.meta.name
    }

    fn capability(&self) -> SkillCapability {
        let mut cap = SkillCapability::new(
            &self.meta.name,
            self.meta.description.as_deref().unwrap_or(""),
            self.meta.get_input_type(),
            self.meta.get_output_type(),
            self.meta.get_permissions(),
            self.meta.get_side_effect_class(),
        );

        if let Some(cost) = self.meta.estimated_cost {
            cap.estimated_cost = cost;
        }

        if let Some(latency) = self.meta.estimated_latency_ms {
            cap.estimated_latency_ms = latency;
        }

        cap.trust_tier = self.meta.get_trust_tier();
        cap
    }

    fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
        None
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let text = input.as_text().unwrap_or_default();
        let prompt = self.body.replace("{{input}}", text);

        match self.meta.executor.as_str() {
            "script" => {
                ctx.require_process_spawn()?;
                Err(anyhow!(
                    "Custom markdown skills with executor='script' are disabled for safety. Use 'agent.run_script' in workflows so command policy/timeout controls are enforced."
                ))
            }
            "ollama" => {
                ctx.require_network()?;
                let model = self
                    .meta
                    .model
                    .clone()
                    .unwrap_or_else(|| "mistral".to_string());
                println!("🤖 [OLLAMA] Calling model: {}", model);

                let client = reqwest::Client::new();
                let request = OllamaRequest {
                    model,
                    prompt: prompt.clone(),
                    stream: false,
                    options: self
                        .meta
                        .temperature
                        .map(|t| OllamaOptions { temperature: t }),
                };

                let res_result = client
                    .post("http://localhost:11434/api/generate")
                    .json(&request)
                    .send()
                    .await;

                match res_result {
                    Ok(res) if res.status().is_success() => {
                        let ollama_res: OllamaResponse = res.json().await?;
                        Ok(SkillOutput::text(ollama_res.response.trim().to_string()))
                    }
                    _ => {
                        println!("⚠️ [OLLAMA] API unreachable. Falling back to simulation.");
                        Ok(SkillOutput::text(format!(
                            "Simulated response for skill [{}]. Ollama API was unreachable.",
                            self.meta.name
                        )))
                    }
                }
            }
            _ => Err(anyhow!("Unknown executor: {}", self.meta.executor)),
        }
    }
}
