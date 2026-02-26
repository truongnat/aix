use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use crate::skills::role_loader::load_role_profile_if_exists;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::path::PathBuf;
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LlmProvider {
    Ollama,
    OpenAI,
    Gemini,
}

impl LlmProvider {
    fn as_str(&self) -> &'static str {
        match self {
            LlmProvider::Ollama => "ollama",
            LlmProvider::OpenAI => "openai",
            LlmProvider::Gemini => "gemini",
        }
    }
}

#[derive(Debug, Clone)]
struct RouterConfig {
    timeout_ms: u64,
    max_retries: u32,
}

#[derive(Debug, Clone)]
pub struct LlmSubAgentSkill {
    default_role: String,
    model: String,
    provider: LlmProvider,
    temperature: f32,
    roles_dir: PathBuf,
    fallback_providers: Vec<LlmProvider>,
    simulation_fallback: bool,
    router_config: RouterConfig,
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
    response: Option<String>,
    #[serde(default)]
    prompt_eval_count: Option<u32>,
    #[serde(default)]
    eval_count: Option<u32>,
    #[serde(default)]
    error: Option<String>,
}

#[derive(Debug, Serialize)]
struct OpenAiChatRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    temperature: f32,
}

#[derive(Debug, Serialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiChatResponse {
    choices: Vec<OpenAiChoice>,
    #[serde(default)]
    usage: Option<OpenAiUsage>,
}

#[derive(Debug, Deserialize)]
struct OpenAiChoice {
    message: OpenAiChoiceMessage,
}

#[derive(Debug, Deserialize)]
struct OpenAiChoiceMessage {
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiUsage {
    #[serde(default)]
    prompt_tokens: u32,
    #[serde(default)]
    completion_tokens: u32,
    #[serde(default)]
    total_tokens: u32,
}

#[derive(Debug, Serialize)]
struct GeminiGenerateRequest {
    contents: Vec<GeminiContent>,
    #[serde(rename = "generationConfig")]
    generation_config: GeminiGenerationConfig,
}

#[derive(Debug, Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Debug, Serialize)]
struct GeminiGenerationConfig {
    temperature: f32,
}

#[derive(Debug, Deserialize)]
struct GeminiGenerateResponse {
    #[serde(default)]
    candidates: Vec<GeminiCandidate>,
    #[serde(default, rename = "usageMetadata")]
    usage_metadata: Option<GeminiUsageMetadata>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    #[serde(default)]
    content: Option<GeminiCandidateContent>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidateContent {
    #[serde(default)]
    parts: Vec<GeminiPartResponse>,
}

#[derive(Debug, Deserialize)]
struct GeminiPartResponse {
    #[serde(default)]
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GeminiUsageMetadata {
    #[serde(default, rename = "promptTokenCount")]
    prompt_token_count: u32,
    #[serde(default, rename = "candidatesTokenCount")]
    candidates_token_count: u32,
    #[serde(default, rename = "totalTokenCount")]
    total_token_count: u32,
}

#[derive(Debug, Clone, Copy, Default)]
struct ProviderUsage {
    input_tokens: u32,
    output_tokens: u32,
    total_tokens: u32,
}

#[derive(Debug, Clone)]
struct ProviderCallResult {
    provider: LlmProvider,
    model: String,
    text: String,
    usage: ProviderUsage,
    attempts: u32,
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

fn model_env_for_provider(provider: LlmProvider) -> &'static str {
    match provider {
        LlmProvider::Ollama => "ANTIGRAV_LLM_MODEL_OLLAMA",
        LlmProvider::OpenAI => "ANTIGRAV_LLM_MODEL_OPENAI",
        LlmProvider::Gemini => "ANTIGRAV_LLM_MODEL_GEMINI",
    }
}

fn parse_provider_list(raw: Option<String>) -> Vec<LlmProvider> {
    raw.unwrap_or_default()
        .split(',')
        .filter_map(|v| match v.trim().to_ascii_lowercase().as_str() {
            "ollama" => Some(LlmProvider::Ollama),
            "openai" => Some(LlmProvider::OpenAI),
            "gemini" => Some(LlmProvider::Gemini),
            _ => None,
        })
        .collect()
}

fn parse_simulation_fallback(raw: Option<String>) -> bool {
    raw.map(|v| matches!(v.trim(), "1" | "true" | "TRUE" | "yes" | "YES"))
        .unwrap_or(true)
}

fn build_provider_chain(primary: LlmProvider, fallbacks: &[LlmProvider]) -> Vec<LlmProvider> {
    let mut chain = vec![primary];
    for provider in fallbacks {
        if !chain.contains(provider) {
            chain.push(*provider);
        }
    }
    chain
}

fn round6(value: f64) -> f64 {
    (value * 1_000_000.0).round() / 1_000_000.0
}

fn build_http_client() -> Result<reqwest::Client> {
    // Disable implicit proxy/system lookup to avoid platform-specific panics.
    Ok(reqwest::Client::builder().no_proxy().build()?)
}

fn estimate_cost_usd(provider: LlmProvider, model: &str, usage: ProviderUsage) -> (f64, f64, f64) {
    let model_lower = model.to_ascii_lowercase();
    let (input_rate_per_1k, output_rate_per_1k) = match provider {
        LlmProvider::Ollama => (0.0_f64, 0.0_f64),
        LlmProvider::OpenAI => {
            if model_lower.contains("gpt-4o-mini") {
                (0.00015, 0.00060)
            } else if model_lower.contains("gpt-4.1-mini") {
                (0.0004, 0.0016)
            } else {
                (0.001, 0.002)
            }
        }
        LlmProvider::Gemini => {
            if model_lower.contains("flash") {
                (0.000075, 0.0003)
            } else {
                (0.00025, 0.001)
            }
        }
    };

    let input_cost = f64::from(usage.input_tokens) / 1000.0 * input_rate_per_1k;
    let output_cost = f64::from(usage.output_tokens) / 1000.0 * output_rate_per_1k;
    let total = round6(input_cost + output_cost);
    (total, input_rate_per_1k, output_rate_per_1k)
}

fn parse_role_prefixed_input(input: &str) -> (Option<String>, String) {
    if let Some((role, rest)) = input.split_once(":::") {
        let role = role.trim().to_string();
        let rest = rest.trim().to_string();
        if !role.is_empty() {
            return (Some(role), rest);
        }
    }
    (None, input.trim().to_string())
}

fn parse_input_payload(input: &SkillInput) -> Result<(Option<String>, String)> {
    match input {
        SkillInput::Text(text) => Ok(parse_role_prefixed_input(text)),
        SkillInput::Json(value) => Ok((None, serde_json::to_string_pretty(value)?)),
        SkillInput::Number(value) => Ok((None, value.to_string())),
        SkillInput::Boolean(value) => Ok((None, value.to_string())),
    }
}

fn build_prompt(role_name: &str, role_prompt: &str, instruction_input: &str) -> String {
    let mut parts = vec![format!("Role: {}", role_name)];
    let trimmed_role_prompt = role_prompt.trim();
    if !trimmed_role_prompt.is_empty() {
        parts.push(format!("Role Instructions:\n{}", trimmed_role_prompt));
    }
    parts.push(format!("Input:\n{}", instruction_input.trim()));
    parts.push(
        "Output strict JSON object with fields {summary:string, actions:string[], risks:string[]}."
            .to_string(),
    );
    parts.join("\n\n")
}

impl LlmSubAgentSkill {
    pub fn new() -> Self {
        let provider = parse_llm_provider(std::env::var("ANTIGRAV_LLM_PROVIDER").ok());
        let model = std::env::var("ANTIGRAV_LLM_MODEL")
            .ok()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| default_model_for_provider(provider).to_string());
        let timeout_ms = std::env::var("ANTIGRAV_LLM_TIMEOUT_MS")
            .ok()
            .and_then(|v| v.trim().parse::<u64>().ok())
            .filter(|v| *v > 0)
            .unwrap_or(30_000);
        let max_retries = std::env::var("ANTIGRAV_LLM_MAX_RETRIES")
            .ok()
            .and_then(|v| v.trim().parse::<u32>().ok())
            .unwrap_or(2);
        let fallback_providers = parse_provider_list(std::env::var("ANTIGRAV_LLM_FALLBACK").ok());
        Self {
            default_role: "software-engineer".to_string(),
            model,
            provider,
            temperature: 0.1,
            roles_dir: PathBuf::from(
                std::env::var("ANTIGRAV_ROLES_DIR")
                    .ok()
                    .unwrap_or_else(|| ".agents/roles".to_string()),
            ),
            fallback_providers,
            simulation_fallback: parse_simulation_fallback(
                std::env::var("ANTIGRAV_LLM_SIMULATION_FALLBACK").ok(),
            ),
            router_config: RouterConfig {
                timeout_ms,
                max_retries,
            },
        }
    }

    fn resolve_model_for_provider(
        &self,
        provider: LlmProvider,
        primary_provider: LlmProvider,
        role_model_override: Option<&str>,
    ) -> String {
        if provider == primary_provider {
            if let Some(override_model) = role_model_override {
                if !override_model.trim().is_empty() {
                    return override_model.trim().to_string();
                }
            }
            return self.model.clone();
        }

        if let Ok(value) = std::env::var(model_env_for_provider(provider)) {
            let trimmed = value.trim();
            if !trimmed.is_empty() {
                return trimmed.to_string();
            }
        }
        default_model_for_provider(provider).to_string()
    }

    async fn call_provider_with_retry(
        &self,
        provider: LlmProvider,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult> {
        let mut attempts = 0_u32;
        let max_attempts = self.router_config.max_retries.saturating_add(1);
        let mut last_error = String::new();

        for attempt in 0..max_attempts {
            attempts = attempts.saturating_add(1);
            let one_call = self.call_provider_once(provider, model, prompt, temperature);
            let timed = tokio::time::timeout(
                Duration::from_millis(self.router_config.timeout_ms),
                one_call,
            )
            .await;
            match timed {
                Ok(Ok(mut result)) => {
                    result.attempts = attempts;
                    return Ok(result);
                }
                Ok(Err(err)) => {
                    last_error = err.to_string();
                }
                Err(_) => {
                    last_error =
                        format!("provider timeout after {}ms", self.router_config.timeout_ms);
                }
            }

            if attempt + 1 < max_attempts {
                let backoff = 200_u64.saturating_mul(1_u64 << attempt.min(5));
                sleep(Duration::from_millis(backoff)).await;
            }
        }

        Err(anyhow!(
            "provider={} model={} failed after {} attempt(s): {}",
            provider.as_str(),
            model,
            attempts,
            last_error
        ))
    }

    async fn call_provider_once(
        &self,
        provider: LlmProvider,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult> {
        match provider {
            LlmProvider::Ollama => self.call_ollama(model, prompt, temperature).await,
            LlmProvider::OpenAI => self.call_openai(model, prompt, temperature).await,
            LlmProvider::Gemini => self.call_gemini(model, prompt, temperature).await,
        }
    }

    async fn call_ollama(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult> {
        let client = build_http_client()?;
        let request = OllamaRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
            options: Some(OllamaOptions { temperature }),
        };
        let response = client
            .post("http://localhost:11434/api/generate")
            .json(&request)
            .send()
            .await?;
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(anyhow!("ollama request failed: {}", body));
        }
        let payload: OllamaResponse = response.json().await?;
        if let Some(err) = payload.error {
            return Err(anyhow!("ollama error: {}", err));
        }
        let text = payload.response.unwrap_or_default().trim().to_string();
        if text.is_empty() {
            return Err(anyhow!("ollama returned empty response"));
        }
        let usage = ProviderUsage {
            input_tokens: payload.prompt_eval_count.unwrap_or(0),
            output_tokens: payload.eval_count.unwrap_or(0),
            total_tokens: payload
                .prompt_eval_count
                .unwrap_or(0)
                .saturating_add(payload.eval_count.unwrap_or(0)),
        };
        Ok(ProviderCallResult {
            provider: LlmProvider::Ollama,
            model: model.to_string(),
            text,
            usage,
            attempts: 1,
        })
    }

    async fn call_openai(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult> {
        let api_key =
            std::env::var("OPENAI_API_KEY").map_err(|_| anyhow!("OPENAI_API_KEY is not set"))?;
        let request = OpenAiChatRequest {
            model: model.to_string(),
            messages: vec![OpenAiMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature,
        };
        let client = build_http_client()?;
        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(api_key)
            .json(&request)
            .send()
            .await?;
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(anyhow!("openai request failed: {}", body));
        }
        let payload: OpenAiChatResponse = response.json().await?;
        let text = payload
            .choices
            .first()
            .map(|choice| choice.message.content.trim().to_string())
            .filter(|v| !v.is_empty())
            .ok_or_else(|| anyhow!("openai returned empty choices"))?;
        let usage = payload.usage.unwrap_or(OpenAiUsage {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
        });
        Ok(ProviderCallResult {
            provider: LlmProvider::OpenAI,
            model: model.to_string(),
            text,
            usage: ProviderUsage {
                input_tokens: usage.prompt_tokens,
                output_tokens: usage.completion_tokens,
                total_tokens: usage.total_tokens,
            },
            attempts: 1,
        })
    }

    async fn call_gemini(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult> {
        let api_key =
            std::env::var("GEMINI_API_KEY").map_err(|_| anyhow!("GEMINI_API_KEY is not set"))?;
        let model_path = if model.starts_with("models/") {
            model.to_string()
        } else {
            format!("models/{}", model)
        };
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/{}:generateContent?key={}",
            model_path, api_key
        );
        let request = GeminiGenerateRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: GeminiGenerationConfig { temperature },
        };
        let client = build_http_client()?;
        let response = client.post(url).json(&request).send().await?;
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(anyhow!("gemini request failed: {}", body));
        }
        let payload: GeminiGenerateResponse = response.json().await?;
        let text = payload
            .candidates
            .first()
            .and_then(|candidate| candidate.content.as_ref())
            .map(|content| {
                content
                    .parts
                    .iter()
                    .filter_map(|part| part.text.clone())
                    .collect::<Vec<_>>()
                    .join("\n")
            })
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .ok_or_else(|| anyhow!("gemini returned empty candidates"))?;
        let usage = payload.usage_metadata.unwrap_or(GeminiUsageMetadata {
            prompt_token_count: 0,
            candidates_token_count: 0,
            total_token_count: 0,
        });
        Ok(ProviderCallResult {
            provider: LlmProvider::Gemini,
            model: model.to_string(),
            text,
            usage: ProviderUsage {
                input_tokens: usage.prompt_token_count,
                output_tokens: usage.candidates_token_count,
                total_tokens: usage.total_token_count,
            },
            attempts: 1,
        })
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
            "LLM sub-agent provider router with role/profile support",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(false, false, true, false, false),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_network()?;
        let (requested_role, instruction_input) = parse_input_payload(&input)?;

        let mut role_name = requested_role
            .clone()
            .filter(|v| !v.trim().is_empty())
            .unwrap_or_else(|| self.default_role.clone());
        let mut role_prompt = String::new();
        let mut primary_provider = self.provider;
        let mut role_model_override: Option<String> = None;
        let mut temperature = self.temperature;

        if let Some(role_ref) = requested_role {
            if let Some(profile) = load_role_profile_if_exists(&role_ref, &self.roles_dir)? {
                role_name = profile.name;
                role_prompt = profile.prompt;
                if let Some(provider_raw) = profile.provider {
                    primary_provider = parse_llm_provider(Some(provider_raw));
                }
                if let Some(model_raw) = profile.model {
                    if !model_raw.trim().is_empty() {
                        role_model_override = Some(model_raw);
                    }
                }
                if let Some(temp) = profile.temperature {
                    temperature = temp;
                }
            }
        }

        let prompt = build_prompt(&role_name, &role_prompt, &instruction_input);
        let chain = build_provider_chain(primary_provider, &self.fallback_providers);
        let mut errors = Vec::new();
        let mut fallback_used = false;
        let mut total_attempts = 0_u32;
        let mut success: Option<ProviderCallResult> = None;

        for (idx, provider) in chain.iter().enumerate() {
            let model = self.resolve_model_for_provider(
                *provider,
                primary_provider,
                role_model_override.as_deref(),
            );
            match self
                .call_provider_with_retry(*provider, &model, &prompt, temperature)
                .await
            {
                Ok(result) => {
                    fallback_used = idx > 0;
                    total_attempts = total_attempts.saturating_add(result.attempts);
                    success = Some(result);
                    break;
                }
                Err(err) => {
                    errors.push(err.to_string());
                    total_attempts = total_attempts
                        .saturating_add(self.router_config.max_retries.saturating_add(1));
                }
            }
        }

        if success.is_none() && self.simulation_fallback {
            let provider_name = primary_provider.as_str();
            return Ok(SkillOutput::json(json!({
                "schema": "llm_router.v1",
                "provider": provider_name,
                "model": self.resolve_model_for_provider(
                    primary_provider,
                    primary_provider,
                    role_model_override.as_deref()
                ),
                "role": role_name,
                "summary": format!(
                    "Simulated sub-agent response. providers_failed={} input_len={}",
                    errors.len(),
                    instruction_input.len()
                ),
                "actions": ["verify provider credentials", "retry with healthy provider"],
                "risks": ["simulation_fallback_used"],
                "usage": {
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "total_tokens": 0
                },
                "cost": {
                    "estimated_usd": 0.0,
                    "input_rate_per_1k": 0.0,
                    "output_rate_per_1k": 0.0,
                    "currency": "USD",
                    "source": "simulation"
                },
                "router": {
                    "primary_provider": primary_provider.as_str(),
                    "attempts": total_attempts,
                    "max_retries": self.router_config.max_retries,
                    "timeout_ms": self.router_config.timeout_ms,
                    "fallback_used": false,
                    "simulation_fallback": true,
                    "errors": errors,
                }
            })));
        }

        let result = success.ok_or_else(|| {
            anyhow!(
                "llm router failed across providers [{}]",
                errors.join(" | ")
            )
        })?;

        let (estimated_usd, input_rate_per_1k, output_rate_per_1k) =
            estimate_cost_usd(result.provider, &result.model, result.usage);

        Ok(SkillOutput::json(json!({
            "schema": "llm_router.v1",
            "provider": result.provider.as_str(),
            "model": result.model,
            "role": role_name,
            "summary": result.text.trim(),
            "actions": [],
            "risks": [],
            "usage": {
                "input_tokens": result.usage.input_tokens,
                "output_tokens": result.usage.output_tokens,
                "total_tokens": result.usage.total_tokens
            },
            "cost": {
                "estimated_usd": estimated_usd,
                "input_rate_per_1k": input_rate_per_1k,
                "output_rate_per_1k": output_rate_per_1k,
                "currency": "USD",
                "source": "estimated"
            },
            "router": {
                "primary_provider": primary_provider.as_str(),
                "attempts": total_attempts.max(result.attempts),
                "max_retries": self.router_config.max_retries,
                "timeout_ms": self.router_config.timeout_ms,
                "fallback_used": fallback_used,
                "simulation_fallback": false,
                "errors": errors,
            }
        })))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        build_provider_chain, estimate_cost_usd, parse_input_payload, parse_provider_list,
        parse_role_prefixed_input, LlmProvider, LlmSubAgentSkill, ProviderUsage, RouterConfig,
    };
    use crate::skill::io::SkillInput;
    use serde_json::json;
    use std::path::PathBuf;

    fn live_smoke_enabled() -> bool {
        std::env::var("ANTIGRAV_RUN_LIVE_LLM_TESTS").ok().as_deref() == Some("1")
    }

    fn has_env_var(name: &str) -> bool {
        std::env::var(name)
            .ok()
            .map(|v| !v.trim().is_empty())
            .unwrap_or(false)
    }

    fn model_for_live_provider(provider: LlmProvider) -> String {
        std::env::var(super::model_env_for_provider(provider))
            .ok()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| super::default_model_for_provider(provider).to_string())
    }

    fn live_skill(provider: LlmProvider) -> LlmSubAgentSkill {
        LlmSubAgentSkill {
            default_role: "software-engineer".to_string(),
            model: model_for_live_provider(provider),
            provider,
            temperature: 0.0,
            roles_dir: PathBuf::from(".agents/roles"),
            fallback_providers: Vec::new(),
            simulation_fallback: false,
            router_config: RouterConfig {
                timeout_ms: 30_000,
                max_retries: 0,
            },
        }
    }

    #[test]
    fn parses_role_prefixed_text_payload() {
        let (role, payload) = parse_role_prefixed_input("architect:::plan changes");
        assert_eq!(role.as_deref(), Some("architect"));
        assert_eq!(payload, "plan changes");
    }

    #[test]
    fn parse_input_payload_supports_json() {
        let input = SkillInput::Json(json!({"count": 2}));
        let (role, payload) = parse_input_payload(&input).expect("payload");
        assert!(role.is_none());
        assert!(payload.contains("\"count\": 2"));
    }

    #[test]
    fn provider_chain_deduplicates_providers() {
        let chain = build_provider_chain(
            LlmProvider::OpenAI,
            &[
                LlmProvider::OpenAI,
                LlmProvider::Gemini,
                LlmProvider::Ollama,
            ],
        );
        assert_eq!(
            chain,
            vec![
                LlmProvider::OpenAI,
                LlmProvider::Gemini,
                LlmProvider::Ollama
            ]
        );
    }

    #[test]
    fn provider_list_ignores_empty_and_unknown_values() {
        let parsed = parse_provider_list(Some("openai, ,unknown,gemini".to_string()));
        assert_eq!(parsed, vec![LlmProvider::OpenAI, LlmProvider::Gemini]);

        let parsed_empty = parse_provider_list(None);
        assert!(parsed_empty.is_empty());
    }

    #[test]
    fn cost_estimation_is_zero_for_ollama_and_positive_for_openai() {
        let usage = ProviderUsage {
            input_tokens: 1000,
            output_tokens: 1000,
            total_tokens: 2000,
        };
        let (ollama_cost, _, _) = estimate_cost_usd(LlmProvider::Ollama, "qwen3:8b", usage);
        let (openai_cost, _, _) = estimate_cost_usd(LlmProvider::OpenAI, "gpt-4o-mini", usage);
        assert_eq!(ollama_cost, 0.0);
        assert!(openai_cost > 0.0);
    }

    #[tokio::test]
    async fn llm_subagent_live_smoke_openai() {
        if !live_smoke_enabled() {
            eprintln!("skipped: set ANTIGRAV_RUN_LIVE_LLM_TESTS=1 to run live provider tests");
            return;
        }
        if !has_env_var("OPENAI_API_KEY") {
            eprintln!("skipped: OPENAI_API_KEY is not set");
            return;
        }
        let skill = live_skill(LlmProvider::OpenAI);
        let result = skill
            .call_provider_with_retry(
                LlmProvider::OpenAI,
                &skill.model,
                r#"Return exactly this JSON object and nothing else: {"summary":"smoke","actions":[],"risks":[]}"#,
                0.0,
            )
            .await
            .expect("openai live smoke call");
        assert_eq!(result.provider, LlmProvider::OpenAI);
        assert!(!result.text.trim().is_empty());
    }

    #[tokio::test]
    async fn llm_subagent_live_smoke_gemini() {
        if !live_smoke_enabled() {
            eprintln!("skipped: set ANTIGRAV_RUN_LIVE_LLM_TESTS=1 to run live provider tests");
            return;
        }
        if !has_env_var("GEMINI_API_KEY") {
            eprintln!("skipped: GEMINI_API_KEY is not set");
            return;
        }
        let skill = live_skill(LlmProvider::Gemini);
        let result = skill
            .call_provider_with_retry(
                LlmProvider::Gemini,
                &skill.model,
                r#"Return exactly this JSON object and nothing else: {"summary":"smoke","actions":[],"risks":[]}"#,
                0.0,
            )
            .await
            .expect("gemini live smoke call");
        assert_eq!(result.provider, LlmProvider::Gemini);
        assert!(!result.text.trim().is_empty());
    }
}
