use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Copy)]
pub enum LlmProvider {
    Ollama,
    OpenAI,
    Gemini,
}

#[derive(Debug, Clone)]
pub struct LlmSubAgentSkill {
    role: String,
    prompt_template: String,
    model: String,
    provider: LlmProvider,
    temperature: f32,
}

#[derive(Debug, Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
    options: Option<OllamaOptions>,
}

#[derive(Debug, Serialize)]
struct OllamaOptions {
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    response: String,
}

fn parse_llm_provider(raw: Option<String>) -> LlmProvider {
    let normalized = raw
        .as_deref()
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase();
    match normalized.as_str() {
        "openai" => LlmProvider::OpenAI,
        "gemini" => LlmProvider::Gemini,
        _ => LlmProvider::Ollama,
    }
}

fn default_model_for_provider(provider: LlmProvider) -> &'static str {
    match provider {
        LlmProvider::Ollama => "qwen3:8b",
        LlmProvider::OpenAI => "gpt-4o-mini",
        LlmProvider::Gemini => "gemini-1.5-flash",
    }
}

impl LlmSubAgentSkill {
    pub fn new() -> Self {
        let provider = parse_llm_provider(std::env::var("ANTIGRAV_LLM_PROVIDER").ok());
        let model = std::env::var("ANTIGRAV_LLM_MODEL")
            .ok()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| default_model_for_provider(provider).to_string());
        Self {
            role: "software-engineer".to_string(),
            prompt_template: "Role: {{role}}\nInput:\n{{input}}\nOutput JSON with fields {summary, actions, risks}.".to_string(),
            model,
            provider,
            temperature: 0.1,
        }
    }
}

#[async_trait]
impl Skill for LlmSubAgentSkill {
    fn name(&self) -> &str {
        "llm_subagent"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "LLM sub-agent with role/prompt/schema wrapper",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(false, false, true, false, false),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_network()?;
        let text = input.as_text().unwrap_or_default();
        let prompt = self
            .prompt_template
            .replace("{{role}}", &self.role)
            .replace("{{input}}", text);

        let provider = match self.provider {
            LlmProvider::Ollama => "ollama",
            LlmProvider::OpenAI => "openai",
            LlmProvider::Gemini => "gemini",
        };

        if let LlmProvider::Ollama = self.provider {
            let client = reqwest::Client::new();
            let request = OllamaRequest {
                model: self.model.clone(),
                prompt: prompt.clone(),
                stream: false,
                options: Some(OllamaOptions {
                    temperature: self.temperature,
                }),
            };
            let res = client
                .post("http://localhost:11434/api/generate")
                .json(&request)
                .send()
                .await;
            if let Ok(ok_res) = res {
                if ok_res.status().is_success() {
                    let payload: OllamaResponse = ok_res.json().await?;
                    return Ok(SkillOutput::json(json!({
                        "provider": provider,
                        "model": self.model,
                        "role": self.role,
                        "summary": payload.response.trim(),
                        "actions": [],
                        "risks": []
                    })));
                }
            }
        }

        Ok(SkillOutput::json(json!({
            "provider": provider,
            "model": self.model,
            "role": self.role,
            "summary": format!("Simulated sub-agent response for input length={}", text.len()),
            "actions": ["verify local llm endpoint", "retry with fallback model"],
            "risks": ["provider unavailable"]
        })))
    }
}
