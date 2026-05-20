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
use serde_json::{json, Value};
use std::time::Duration;

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillMeta {
    pub name: String,
    pub domain: String,
    pub executor: String,
    pub description: Option<String>,
    pub risk: Option<String>,
    pub source: Option<String>,
    pub source_requested: Option<String>,
    pub source_commit: Option<String>,
    pub source_path: Option<String>,
    pub source_license: Option<String>,
    pub imported_at_ms: Option<u64>,
    pub tags: Option<Vec<String>>,
    pub version: Option<String>,
    pub author: Option<String>,
    pub license: Option<String>,
    pub dependencies: Option<Vec<String>>,
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

fn ollama_timeout_ms() -> u64 {
    std::env::var("AGENTIC_SDLC_OLLAMA_TIMEOUT_MS")
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|v| *v > 0)
        .or_else(|| {
            std::env::var("AGENTIC_SDLC_LLM_TIMEOUT_MS")
                .ok()
                .and_then(|v| v.trim().parse::<u64>().ok())
                .filter(|v| *v > 0)
        })
        .unwrap_or(120_000)
}

fn extract_json_code_fence(raw: &str) -> Option<String> {
    let mut in_fence = false;
    let mut allow_fence = false;
    let mut body = String::new();
    for line in raw.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("```") {
            if !in_fence {
                in_fence = true;
                let lang = rest.trim().to_ascii_lowercase();
                allow_fence = lang.is_empty() || lang == "json";
                body.clear();
                continue;
            }
            if allow_fence {
                let payload = body.trim();
                if !payload.is_empty() {
                    return Some(payload.to_string());
                }
            }
            in_fence = false;
            allow_fence = false;
            body.clear();
            continue;
        }
        if in_fence && allow_fence {
            body.push_str(line);
            body.push('\n');
        }
    }
    None
}

fn parse_json_like_response(raw: &str) -> Result<Value> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err(anyhow!("Expected JSON output but got empty response"));
    }
    if let Ok(value) = serde_json::from_str::<Value>(trimmed) {
        return Ok(value);
    }
    if let Some(fenced) = extract_json_code_fence(trimmed) {
        if let Ok(value) = serde_json::from_str::<Value>(&fenced) {
            return Ok(value);
        }
    }
    if let (Some(start), Some(end)) = (trimmed.find('{'), trimmed.rfind('}')) {
        if end > start {
            let candidate = &trimmed[start..=end];
            if let Ok(value) = serde_json::from_str::<Value>(candidate) {
                return Ok(value);
            }
        }
    }
    if let (Some(start), Some(end)) = (trimmed.find('['), trimmed.rfind(']')) {
        if end > start {
            let candidate = &trimmed[start..=end];
            if let Ok(value) = serde_json::from_str::<Value>(candidate) {
                return Ok(value);
            }
        }
    }
    let preview = trimmed.chars().take(220).collect::<String>();
    Err(anyhow!(
        "Expected JSON output but model returned non-JSON text: '{}'",
        preview
    ))
}

fn coerce_output_from_text(meta: &SkillMeta, raw: &str) -> Result<SkillOutput> {
    let trimmed = raw.trim();
    match meta.get_output_type() {
        SkillIOType::Text => Ok(SkillOutput::text(trimmed.to_string())),
        SkillIOType::Json => Ok(SkillOutput::json(parse_json_like_response(trimmed)?)),
        SkillIOType::Number => {
            if let Ok(value) = trimmed.parse::<f64>() {
                return Ok(SkillOutput::number(value));
            }
            let value = parse_json_like_response(trimmed)?;
            let number = value
                .as_f64()
                .ok_or_else(|| anyhow!("Expected Number output but got non-number JSON"))?;
            Ok(SkillOutput::number(number))
        }
        SkillIOType::Boolean => {
            let normalized = trimmed.to_ascii_lowercase();
            if normalized == "true" || normalized == "1" {
                return Ok(SkillOutput::boolean(true));
            }
            if normalized == "false" || normalized == "0" {
                return Ok(SkillOutput::boolean(false));
            }
            let value = parse_json_like_response(trimmed)?;
            let boolean = value
                .as_bool()
                .ok_or_else(|| anyhow!("Expected Boolean output but got non-boolean JSON"))?;
            Ok(SkillOutput::boolean(boolean))
        }
    }
}

fn simulated_output(meta: &SkillMeta, reason: &str) -> SkillOutput {
    match meta.get_output_type() {
        SkillIOType::Json => SkillOutput::json(json!({
            "summary": format!(
                "Simulated response for skill [{}]. Live model output unavailable: {}",
                meta.name, reason
            ),
            "actions": [
                "verify_ollama_health: run `ollama list` and confirm model availability",
                "retry_workflow_step: rerun after provider recovery to replace simulated output",
                "review_blockers: treat this step as incomplete for release-critical decisions"
            ],
            "risks": [
                reason,
                "llm_backend_unavailable",
                "output_confidence_reduced"
            ]
        })),
        SkillIOType::Number => SkillOutput::number(0.0),
        SkillIOType::Boolean => SkillOutput::boolean(false),
        SkillIOType::Text => SkillOutput::text(format!(
            "Simulated response for skill [{}]. {}",
            meta.name, reason
        )),
    }
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
                let model_requested = self
                    .meta
                    .model
                    .clone()
                    .unwrap_or_else(|| "mistral".to_string());
                
                let ollama = super::ollama::OllamaClient::new();
                let model = ollama.resolve_model(&model_requested).await.unwrap_or_else(|_| model_requested.clone());
                
                let timeout_ms = ollama_timeout_ms();
                println!(
                    "🤖 [OLLAMA] Calling model: {} (requested={}) (timeout={}ms)",
                    model, model_requested, timeout_ms
                );

                let client = reqwest::Client::builder()
                    .no_proxy()
                    .timeout(Duration::from_millis(timeout_ms))
                    .build()?;
                let request = OllamaRequest {
                    model,
                    prompt,
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
                        match res.json::<OllamaResponse>().await {
                            Ok(ollama_res) => {
                                coerce_output_from_text(&self.meta, &ollama_res.response)
                            }
                            Err(err) => {
                                println!(
                                    "⚠️ [OLLAMA] Invalid response payload: {}. Falling back to simulation.",
                                    err
                                );
                                Ok(simulated_output(
                                    &self.meta,
                                    "Ollama response payload was invalid.",
                                ))
                            }
                        }
                    }
                    Ok(res) => {
                        let status = res.status();
                        let body = res.text().await.unwrap_or_default();
                        println!(
                            "⚠️ [OLLAMA] API error status={} body={}. Falling back to simulation.",
                            status, body
                        );
                        Ok(simulated_output(
                            &self.meta,
                            &format!("Ollama API returned status {}.", status),
                        ))
                    }
                    _ => {
                        println!(
                            "⚠️ [OLLAMA] API unreachable/timeout after {}ms. Falling back to simulation.",
                            timeout_ms
                        );
                        Ok(simulated_output(
                            &self.meta,
                            "Ollama API was unreachable or timed out.",
                        ))
                    }
                }
            }
            _ => Err(anyhow!("Unknown executor: {}", self.meta.executor)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{coerce_output_from_text, parse_json_like_response, simulated_output, SkillMeta};
    use crate::skill::io::SkillOutput;

    fn sample_meta(output_type: &str) -> SkillMeta {
        SkillMeta {
            name: "sample".to_string(),
            domain: "agent".to_string(),
            executor: "ollama".to_string(),
            description: None,
            risk: None,
            source: None,
            source_requested: None,
            source_commit: None,
            source_path: None,
            source_license: None,
            imported_at_ms: None,
            tags: None,
            version: None,
            author: None,
            license: None,
            dependencies: None,
            model: None,
            temperature: None,
            command: None,
            input_type: Some("text".to_string()),
            output_type: Some(output_type.to_string()),
            estimated_cost: None,
            estimated_latency_ms: None,
            allow_fs_read: None,
            allow_fs_write: None,
            allow_network: None,
            allow_env: None,
            allow_process_spawn: None,
            side_effect_class: None,
            trust_tier: None,
        }
    }

    #[test]
    fn parses_json_from_fenced_response() {
        let raw =
            "Some explanation\n```json\n{\"summary\":\"ok\",\"actions\":[],\"risks\":[]}\n```";
        let parsed = parse_json_like_response(raw).expect("parse JSON");
        assert_eq!(parsed["summary"], "ok");
    }

    #[test]
    fn json_output_coercion_returns_json_output() {
        let meta = sample_meta("json");
        let output =
            coerce_output_from_text(&meta, "{\"summary\":\"x\",\"actions\":[],\"risks\":[]}")
                .expect("coerce");
        match output {
            SkillOutput::Json(value) => assert_eq!(value["summary"], "x"),
            other => panic!("expected json output, got {:?}", other),
        }
    }

    #[test]
    fn json_output_coercion_rejects_non_json_text() {
        let meta = sample_meta("json");
        let err = coerce_output_from_text(&meta, "not-json").expect_err("should fail");
        assert!(err.to_string().contains("Expected JSON output"));
    }

    #[test]
    fn simulated_json_output_contains_actionable_fallback() {
        let meta = sample_meta("json");
        let output = simulated_output(&meta, "provider timeout");
        match output {
            SkillOutput::Json(value) => {
                assert_eq!(value["actions"].as_array().map(|v| v.len()), Some(3));
                assert!(value["summary"]
                    .as_str()
                    .unwrap_or_default()
                    .contains("Live model output unavailable"));
            }
            other => panic!("expected json output, got {:?}", other),
        }
    }
}
