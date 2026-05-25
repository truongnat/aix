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
    Anthropic,
    AzureOpenAI,
    Bedrock,
}

impl LlmProvider {
    fn as_str(&self) -> &'static str {
        match self {
            LlmProvider::Ollama => "ollama",
            LlmProvider::OpenAI => "openai",
            LlmProvider::Gemini => "gemini",
            LlmProvider::Anthropic => "anthropic",
            LlmProvider::AzureOpenAI => "azure_openai",
            LlmProvider::Bedrock => "bedrock",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum FallbackPolicy {
    Always,
    TransientOnly,
    Never,
}

impl FallbackPolicy {
    fn as_str(self) -> &'static str {
        match self {
            FallbackPolicy::Always => "always",
            FallbackPolicy::TransientOnly => "transient_only",
            FallbackPolicy::Never => "never",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum LlmErrorClass {
    Auth,
    Validation,
    RateLimit,
    Server,
    Timeout,
    Network,
    Configuration,
    EmptyResponse,
    Unknown,
}

impl LlmErrorClass {
    fn as_str(self) -> &'static str {
        match self {
            LlmErrorClass::Auth => "auth",
            LlmErrorClass::Validation => "validation",
            LlmErrorClass::RateLimit => "rate_limit",
            LlmErrorClass::Server => "server",
            LlmErrorClass::Timeout => "timeout",
            LlmErrorClass::Network => "network",
            LlmErrorClass::Configuration => "configuration",
            LlmErrorClass::EmptyResponse => "empty_response",
            LlmErrorClass::Unknown => "unknown",
        }
    }

    fn is_transient(self) -> bool {
        matches!(
            self,
            LlmErrorClass::RateLimit
                | LlmErrorClass::Server
                | LlmErrorClass::Timeout
                | LlmErrorClass::Network
                | LlmErrorClass::Unknown
        )
    }
}

#[derive(Debug, Clone)]
struct RouterConfig {
    timeout_ms: u64,
    max_retries: u32,
    fallback_policy: FallbackPolicy,
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
    replay_cache: Option<std::sync::Arc<crate::engine::replay_cache::ReplayCache>>,
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
    #[serde(skip_serializing_if = "Option::is_none")]
    seed: Option<i64>,
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

#[derive(Debug, Serialize)]
struct AnthropicMessageRequest {
    model: String,
    max_tokens: u32,
    temperature: f32,
    messages: Vec<AnthropicMessage>,
}

#[derive(Debug, Serialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicMessageResponse {
    #[serde(default)]
    content: Vec<AnthropicContentBlock>,
    #[serde(default)]
    usage: Option<AnthropicUsage>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContentBlock {
    #[serde(rename = "type")]
    kind: String,
    #[serde(default)]
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AnthropicUsage {
    #[serde(default)]
    input_tokens: u32,
    #[serde(default)]
    output_tokens: u32,
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

#[derive(Debug, Clone)]
pub struct SynthesizedText {
    pub provider: String,
    pub model: String,
    pub text: String,
    pub attempts: u32,
    pub fallback_used: bool,
}

#[derive(Debug, Clone)]
struct ProviderCallFailure {
    provider: LlmProvider,
    model: String,
    message: String,
    class: LlmErrorClass,
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
        "anthropic" | "claude" => LlmProvider::Anthropic,
        "azure" | "azure_openai" => LlmProvider::AzureOpenAI,
        "bedrock" | "aws_bedrock" => LlmProvider::Bedrock,
        _ => LlmProvider::Ollama,
    }
}

fn default_model_for_provider(provider: LlmProvider) -> &'static str {
    match provider {
        LlmProvider::Ollama => "qwen3:8b",
        LlmProvider::OpenAI => "gpt-4o-mini",
        LlmProvider::Gemini => "gemini-1.5-flash",
        LlmProvider::Anthropic => "claude-3-5-haiku-latest",
        LlmProvider::AzureOpenAI => "gpt-4o-mini",
        LlmProvider::Bedrock => "anthropic.claude-3-haiku-20240307-v1:0",
    }
}

fn model_env_for_provider(provider: LlmProvider) -> &'static str {
    match provider {
        LlmProvider::Ollama => "AGENTIC_SDLC_LLM_MODEL_OLLAMA",
        LlmProvider::OpenAI => "AGENTIC_SDLC_LLM_MODEL_OPENAI",
        LlmProvider::Gemini => "AGENTIC_SDLC_LLM_MODEL_GEMINI",
        LlmProvider::Anthropic => "AGENTIC_SDLC_LLM_MODEL_ANTHROPIC",
        LlmProvider::AzureOpenAI => "AGENTIC_SDLC_LLM_MODEL_AZURE",
        LlmProvider::Bedrock => "AGENTIC_SDLC_LLM_MODEL_BEDROCK",
    }
}

fn resolve_ollama_host() -> String {
    let host = std::env::var("AGENTIC_SDLC_OLLAMA_HOST")
        .ok()
        .or_else(|| std::env::var("OLLAMA_HOST").ok())
        .unwrap_or_else(|| "http://localhost:11434".to_string());
    host.trim().trim_end_matches('/').to_string()
}

fn parse_provider_list(raw: Option<String>) -> Vec<LlmProvider> {
    raw.unwrap_or_default()
        .split(',')
        .filter_map(|v| match v.trim().to_ascii_lowercase().as_str() {
            "ollama" => Some(LlmProvider::Ollama),
            "openai" => Some(LlmProvider::OpenAI),
            "gemini" => Some(LlmProvider::Gemini),
            "anthropic" | "claude" => Some(LlmProvider::Anthropic),
            "azure" | "azure_openai" => Some(LlmProvider::AzureOpenAI),
            "bedrock" | "aws_bedrock" => Some(LlmProvider::Bedrock),
            _ => None,
        })
        .collect()
}

fn parse_fallback_policy(raw: Option<String>) -> FallbackPolicy {
    match raw
        .as_deref()
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase()
        .as_str()
    {
        "always" => FallbackPolicy::Always,
        "never" => FallbackPolicy::Never,
        _ => FallbackPolicy::TransientOnly,
    }
}

fn should_attempt_fallback(policy: FallbackPolicy, class: LlmErrorClass) -> bool {
    match policy {
        FallbackPolicy::Always => true,
        FallbackPolicy::Never => false,
        FallbackPolicy::TransientOnly => class.is_transient(),
    }
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

/// Resolve temperature from environment or use default
/// Default is 0.0 for deterministic mode
fn resolve_temperature() -> f32 {
    std::env::var("AGENTIC_SDLC_LLM_TEMPERATURE")
        .ok()
        .and_then(|v| v.trim().parse::<f32>().ok())
        .unwrap_or(0.0)
        .clamp(0.0, 2.0)
}

/// Generate deterministic seed from trace_id and step_id
/// This ensures same inputs produce same outputs
fn generate_seed(trace_id: &str, step_id: &str) -> Option<i64> {
    // Allow override via environment
    if let Ok(seed_str) = std::env::var("AGENTIC_SDLC_LLM_SEED") {
        if let Ok(seed) = seed_str.trim().parse::<i64>() {
            return Some(seed);
        }
    }

    // Generate from trace_id + step_id for determinism
    let combined = format!("{}:{}", trace_id, step_id);
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in combined.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    Some((hash & 0x7FFFFFFFFFFFFFFF) as i64)
}

/// Check if deterministic mode is enabled
#[allow(dead_code)]
fn is_deterministic_mode() -> bool {
    resolve_temperature() == 0.0
}

fn build_http_client() -> Result<reqwest::Client> {
    // Disable implicit proxy/system lookup to avoid platform-specific panics.
    Ok(reqwest::Client::builder().no_proxy().build()?)
}

fn classify_http_status(status_code: u16) -> LlmErrorClass {
    match status_code {
        401 | 403 => LlmErrorClass::Auth,
        429 => LlmErrorClass::RateLimit,
        500..=599 => LlmErrorClass::Server,
        400 | 404 | 422 => LlmErrorClass::Validation,
        _ => LlmErrorClass::Unknown,
    }
}

fn provider_failure(
    provider: LlmProvider,
    model: &str,
    class: LlmErrorClass,
    message: impl Into<String>,
) -> ProviderCallFailure {
    ProviderCallFailure {
        provider,
        model: model.to_string(),
        message: message.into(),
        class,
        attempts: 1,
    }
}

fn map_reqwest_error(
    provider: LlmProvider,
    model: &str,
    err: reqwest::Error,
) -> ProviderCallFailure {
    let class = if err.is_timeout() || err.is_connect() {
        LlmErrorClass::Network
    } else {
        LlmErrorClass::Unknown
    };
    provider_failure(provider, model, class, err.to_string())
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
        LlmProvider::Anthropic => {
            if model_lower.contains("haiku") {
                (0.00025, 0.00125)
            } else if model_lower.contains("sonnet") {
                (0.003, 0.015)
            } else {
                (0.001, 0.005)
            }
        }
        LlmProvider::AzureOpenAI => {
            // Same pricing as OpenAI
            if model_lower.contains("gpt-4o-mini") {
                (0.00015, 0.00060)
            } else if model_lower.contains("gpt-4.1-mini") {
                (0.0004, 0.0016)
            } else {
                (0.001, 0.002)
            }
        }
        LlmProvider::Bedrock => {
            // Claude pricing on Bedrock
            if model_lower.contains("haiku") {
                (0.00025, 0.00125)
            } else if model_lower.contains("sonnet") {
                (0.003, 0.015)
            } else {
                (0.001, 0.005)
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

fn build_prompt(
    role_name: &str,
    role_prompt: &str,
    instruction_input: &str,
    discipline: Option<&str>,
) -> String {
    let mut parts = Vec::new();

    if let Some(d) = discipline {
        parts.push(format!("Discipline Guidelines:\n{}", d));
    }

    parts.push(format!("Role: {}", role_name));
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

/// Extract a JSON object from raw LLM text.
/// Handles:
///   - Plain JSON: `{"summary":...}`
///   - Markdown-fenced JSON: ```json\n{...}\n```
///   - JSON embedded anywhere in prose text
///
/// Returns None if no valid JSON object can be found.
fn extract_llm_json(text: &str) -> Option<serde_json::Value> {
    let text = text.trim();

    // 1. Direct parse — model returned clean JSON
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(text) {
        if v.is_object() {
            return Some(v);
        }
    }

    // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
    let stripped = strip_markdown_code_fence(text);
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(stripped.trim()) {
        if v.is_object() {
            return Some(v);
        }
    }

    // 3. Find first '{' ... last '}' in the text (JSON embedded in prose)
    if let Some(start) = text.find('{') {
        if let Some(end) = text.rfind('}') {
            if end > start {
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&text[start..=end]) {
                    if v.is_object() {
                        return Some(v);
                    }
                }
            }
        }
    }

    None
}

/// Remove markdown code fences from a string, returning the inner content.
fn strip_markdown_code_fence(text: &str) -> &str {
    let text = text.trim();
    // Match ``` optionally followed by a language tag
    if let Some(after_fence) = text.strip_prefix("```") {
        // Skip optional language label on first line
        let body = if let Some(newline) = after_fence.find('\n') {
            &after_fence[newline + 1..]
        } else {
            after_fence
        };
        // Strip trailing ```
        if let Some(end) = body.rfind("```") {
            return body[..end].trim();
        }
        return body.trim();
    }
    text
}

/// Extract `actions` array from a parsed JSON value.
/// Returns an empty Vec if the field is absent or not an array of strings.
fn extract_string_array(value: &serde_json::Value, key: &str) -> Vec<serde_json::Value> {
    value
        .get(key)
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default()
}

fn load_karpathy_discipline_if_enabled(project_root: &str) -> Option<String> {
    let rule_path = std::path::Path::new(project_root).join(".agents/rules/karpathy_rules.md");
    if !rule_path.exists() {
        return None;
    }

    let content = std::fs::read_to_string(&rule_path).ok()?;
    if !content.contains("\"require_karpathy_discipline\": true") {
        return None;
    }

    let skill_path =
        std::path::Path::new(project_root).join(".agents/skills/karpathy_discipline/SKILL.md");
    let skill_content = std::fs::read_to_string(&skill_path).ok()?;

    if let Some(idx) = skill_content.find("## System Prompt (Injected)") {
        return Some(skill_content[idx + 27..].trim().to_string());
    }

    None
}

impl LlmSubAgentSkill {
    pub fn new() -> Self {
        let provider = parse_llm_provider(std::env::var("AGENTIC_SDLC_LLM_PROVIDER").ok());
        let model = std::env::var("AGENTIC_SDLC_LLM_MODEL")
            .ok()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| default_model_for_provider(provider).to_string());
        let timeout_ms = std::env::var("AGENTIC_SDLC_LLM_TIMEOUT_MS")
            .ok()
            .and_then(|v| v.trim().parse::<u64>().ok())
            .filter(|v| *v > 0)
            .unwrap_or(120_000);
        let max_retries = std::env::var("AGENTIC_SDLC_LLM_MAX_RETRIES")
            .ok()
            .and_then(|v| v.trim().parse::<u32>().ok())
            .unwrap_or(1);
        let fallback_providers =
            parse_provider_list(std::env::var("AGENTIC_SDLC_LLM_FALLBACK").ok());
        let fallback_policy =
            parse_fallback_policy(std::env::var("AGENTIC_SDLC_LLM_FALLBACK_POLICY").ok());
        Self {
            default_role: "software-engineer".to_string(),
            model,
            provider,
            temperature: resolve_temperature(),
            roles_dir: PathBuf::from(
                std::env::var("AGENTIC_SDLC_ROLES_DIR")
                    .ok()
                    .unwrap_or_else(|| ".agents/roles".to_string()),
            ),
            fallback_providers,
            simulation_fallback: parse_simulation_fallback(
                std::env::var("AGENTIC_SDLC_LLM_SIMULATION_FALLBACK").ok(),
            ),
            router_config: RouterConfig {
                timeout_ms,
                max_retries,
                fallback_policy,
            },
            replay_cache: None, // Will be set by CLI if replay mode enabled
        }
    }

    /// Set replay cache (called by CLI)
    pub fn with_replay_cache(
        mut self,
        cache: std::sync::Arc<crate::engine::replay_cache::ReplayCache>,
    ) -> Self {
        self.replay_cache = Some(cache);
        self
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
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let mut attempts = 0_u32;
        let max_attempts = self.router_config.max_retries.saturating_add(1);
        let mut last_failure: Option<ProviderCallFailure> = None;

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
                Ok(Err(mut failure)) => {
                    failure.attempts = attempts;
                    last_failure = Some(failure);
                }
                Err(_) => {
                    last_failure = Some(ProviderCallFailure {
                        provider,
                        model: model.to_string(),
                        message: format!(
                            "provider timeout after {}ms",
                            self.router_config.timeout_ms
                        ),
                        class: LlmErrorClass::Timeout,
                        attempts,
                    });
                }
            }

            let retryable = last_failure
                .as_ref()
                .map(|failure| failure.class.is_transient())
                .unwrap_or(false);
            if attempt + 1 < max_attempts && retryable {
                let backoff = 200_u64.saturating_mul(1_u64 << attempt.min(5));
                sleep(Duration::from_millis(backoff)).await;
            } else {
                break;
            }
        }

        Err(last_failure.unwrap_or_else(|| ProviderCallFailure {
            provider,
            model: model.to_string(),
            message: "provider failed with unknown error".to_string(),
            class: LlmErrorClass::Unknown,
            attempts,
        }))
    }

    async fn call_provider_once(
        &self,
        provider: LlmProvider,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        match provider {
            LlmProvider::Ollama => self.call_ollama(model, prompt, temperature).await,
            LlmProvider::OpenAI => self.call_openai(model, prompt, temperature).await,
            LlmProvider::Gemini => self.call_gemini(model, prompt, temperature).await,
            LlmProvider::Anthropic => self.call_anthropic(model, prompt, temperature).await,
            LlmProvider::AzureOpenAI => self.call_azure_openai(model, prompt, temperature).await,
            LlmProvider::Bedrock => self.call_bedrock(model, prompt, temperature).await,
        }
    }

    pub async fn synthesize_text(&self, prompt: &str) -> Result<SynthesizedText> {
        let primary_provider = self.provider;
        let temperature = self.temperature;
        let chain = build_provider_chain(primary_provider, &self.fallback_providers);
        let mut errors = Vec::new();
        let mut total_attempts = 0_u32;

        for (idx, provider) in chain.iter().enumerate() {
            let model = self.resolve_model_for_provider(*provider, primary_provider, None);
            match self
                .call_provider_with_retry(*provider, &model, prompt, temperature)
                .await
            {
                Ok(result) => {
                    total_attempts = total_attempts.saturating_add(result.attempts);
                    return Ok(SynthesizedText {
                        provider: result.provider.as_str().to_string(),
                        model: result.model,
                        text: result.text,
                        attempts: total_attempts.max(result.attempts),
                        fallback_used: idx > 0,
                    });
                }
                Err(failure) => {
                    total_attempts = total_attempts.saturating_add(failure.attempts);
                    errors.push(format!(
                        "provider={} model={} class={} transient={} message={}",
                        failure.provider.as_str(),
                        failure.model,
                        failure.class.as_str(),
                        failure.class.is_transient(),
                        failure.message
                    ));
                    let has_next_provider = idx + 1 < chain.len();
                    if has_next_provider
                        && !should_attempt_fallback(
                            self.router_config.fallback_policy,
                            failure.class,
                        )
                    {
                        break;
                    }
                }
            }
        }

        Err(anyhow!(
            "llm router failed across providers [{}]",
            errors.join(" | ")
        ))
    }

    async fn call_ollama(
        &self,
        model_requested: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let ollama_client = super::ollama::OllamaClient::new();
        let model = ollama_client
            .resolve_model(model_requested)
            .await
            .unwrap_or_else(|_| model_requested.to_string());

        let client = build_http_client().map_err(|err| {
            provider_failure(
                LlmProvider::Ollama,
                &model,
                LlmErrorClass::Configuration,
                err.to_string(),
            )
        })?;
        let request = OllamaRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: false,
            options: Some(OllamaOptions { temperature }),
        };
        let response = client
            .post(format!("{}/api/generate", resolve_ollama_host()))
            .json(&request)
            .send()
            .await
            .map_err(|err| map_reqwest_error(LlmProvider::Ollama, &model, err))?;
        let status = response.status();
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(provider_failure(
                LlmProvider::Ollama,
                &model,
                classify_http_status(status.as_u16()),
                format!(
                    "ollama request failed (status={}): {}",
                    status.as_u16(),
                    body
                ),
            ));
        }
        let payload: OllamaResponse = response.json().await.map_err(|err| {
            provider_failure(
                LlmProvider::Ollama,
                &model,
                LlmErrorClass::Validation,
                format!("ollama response parse failed: {}", err),
            )
        })?;
        if let Some(err) = payload.error {
            return Err(provider_failure(
                LlmProvider::Ollama,
                &model,
                LlmErrorClass::Validation,
                format!("ollama error: {}", err),
            ));
        }
        let text = payload.response.unwrap_or_default().trim().to_string();
        if text.is_empty() {
            return Err(provider_failure(
                LlmProvider::Ollama,
                &model,
                LlmErrorClass::EmptyResponse,
                "ollama returned empty response",
            ));
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
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let api_key = std::env::var("OPENAI_API_KEY").map_err(|_| {
            provider_failure(
                LlmProvider::OpenAI,
                model,
                LlmErrorClass::Configuration,
                "OPENAI_API_KEY is not set",
            )
        })?;
        let request = OpenAiChatRequest {
            model: model.to_string(),
            messages: vec![OpenAiMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature,
            seed: None, // TODO: Pass seed from context
        };
        let client = build_http_client().map_err(|err| {
            provider_failure(
                LlmProvider::OpenAI,
                model,
                LlmErrorClass::Configuration,
                err.to_string(),
            )
        })?;
        let response = client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(api_key)
            .json(&request)
            .send()
            .await
            .map_err(|err| map_reqwest_error(LlmProvider::OpenAI, model, err))?;
        let status = response.status();
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(provider_failure(
                LlmProvider::OpenAI,
                model,
                classify_http_status(status.as_u16()),
                format!(
                    "openai request failed (status={}): {}",
                    status.as_u16(),
                    body
                ),
            ));
        }
        let payload: OpenAiChatResponse = response.json().await.map_err(|err| {
            provider_failure(
                LlmProvider::OpenAI,
                model,
                LlmErrorClass::Validation,
                format!("openai response parse failed: {}", err),
            )
        })?;
        let text = payload
            .choices
            .first()
            .map(|choice| choice.message.content.trim().to_string())
            .filter(|v| !v.is_empty())
            .ok_or_else(|| {
                provider_failure(
                    LlmProvider::OpenAI,
                    model,
                    LlmErrorClass::EmptyResponse,
                    "openai returned empty choices",
                )
            })?;
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
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let api_key = std::env::var("GEMINI_API_KEY").map_err(|_| {
            provider_failure(
                LlmProvider::Gemini,
                model,
                LlmErrorClass::Configuration,
                "GEMINI_API_KEY is not set",
            )
        })?;
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
        let client = build_http_client().map_err(|err| {
            provider_failure(
                LlmProvider::Gemini,
                model,
                LlmErrorClass::Configuration,
                err.to_string(),
            )
        })?;
        let response = client
            .post(url)
            .json(&request)
            .send()
            .await
            .map_err(|err| map_reqwest_error(LlmProvider::Gemini, model, err))?;
        let status = response.status();
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(provider_failure(
                LlmProvider::Gemini,
                model,
                classify_http_status(status.as_u16()),
                format!(
                    "gemini request failed (status={}): {}",
                    status.as_u16(),
                    body
                ),
            ));
        }
        let payload: GeminiGenerateResponse = response.json().await.map_err(|err| {
            provider_failure(
                LlmProvider::Gemini,
                model,
                LlmErrorClass::Validation,
                format!("gemini response parse failed: {}", err),
            )
        })?;
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
            .ok_or_else(|| {
                provider_failure(
                    LlmProvider::Gemini,
                    model,
                    LlmErrorClass::EmptyResponse,
                    "gemini returned empty candidates",
                )
            })?;
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

    async fn call_anthropic(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let api_key = std::env::var("ANTHROPIC_API_KEY").map_err(|_| {
            provider_failure(
                LlmProvider::Anthropic,
                model,
                LlmErrorClass::Configuration,
                "ANTHROPIC_API_KEY is not set",
            )
        })?;
        let request = AnthropicMessageRequest {
            model: model.to_string(),
            max_tokens: 1024,
            temperature,
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
        };
        let client = build_http_client().map_err(|err| {
            provider_failure(
                LlmProvider::Anthropic,
                model,
                LlmErrorClass::Configuration,
                err.to_string(),
            )
        })?;
        let response = client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .json(&request)
            .send()
            .await
            .map_err(|err| map_reqwest_error(LlmProvider::Anthropic, model, err))?;
        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(provider_failure(
                LlmProvider::Anthropic,
                model,
                classify_http_status(status.as_u16()),
                format!(
                    "anthropic request failed (status={}): {}",
                    status.as_u16(),
                    body
                ),
            ));
        }
        let payload: AnthropicMessageResponse = response.json().await.map_err(|err| {
            provider_failure(
                LlmProvider::Anthropic,
                model,
                LlmErrorClass::Validation,
                format!("anthropic response parse failed: {}", err),
            )
        })?;
        let text = payload
            .content
            .iter()
            .filter(|block| block.kind == "text")
            .filter_map(|block| block.text.clone())
            .collect::<Vec<_>>()
            .join("\n")
            .trim()
            .to_string();
        if text.is_empty() {
            return Err(provider_failure(
                LlmProvider::Anthropic,
                model,
                LlmErrorClass::EmptyResponse,
                "anthropic returned empty content blocks",
            ));
        }
        let usage = payload.usage.unwrap_or(AnthropicUsage {
            input_tokens: 0,
            output_tokens: 0,
        });
        Ok(ProviderCallResult {
            provider: LlmProvider::Anthropic,
            model: model.to_string(),
            text,
            usage: ProviderUsage {
                input_tokens: usage.input_tokens,
                output_tokens: usage.output_tokens,
                total_tokens: usage.input_tokens.saturating_add(usage.output_tokens),
            },
            attempts: 1,
        })
    }

    // ============================================================================
    // Azure OpenAI Implementation
    // ============================================================================

    async fn call_azure_openai(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        let api_key = std::env::var("AZURE_OPENAI_API_KEY").map_err(|_| {
            provider_failure(
                LlmProvider::AzureOpenAI,
                model,
                LlmErrorClass::Configuration,
                "AZURE_OPENAI_API_KEY is not set",
            )
        })?;

        let endpoint = std::env::var("AZURE_OPENAI_ENDPOINT").map_err(|_| {
            provider_failure(
                LlmProvider::AzureOpenAI,
                model,
                LlmErrorClass::Configuration,
                "AZURE_OPENAI_ENDPOINT is not set (format: https://<resource>.openai.azure.com)",
            )
        })?;

        let deployment = std::env::var("AZURE_OPENAI_DEPLOYMENT").unwrap_or_else(|_| {
            // Use model as deployment name if not specified
            model.to_string()
        });

        let api_version = std::env::var("AZURE_OPENAI_API_VERSION")
            .unwrap_or_else(|_| "2024-02-15-preview".to_string());

        let request = OpenAiChatRequest {
            model: deployment.clone(),
            messages: vec![OpenAiMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature,
            seed: None, // TODO: Pass seed from context
        };

        let client = build_http_client().map_err(|err| {
            provider_failure(
                LlmProvider::AzureOpenAI,
                model,
                LlmErrorClass::Configuration,
                err.to_string(),
            )
        })?;

        let url = format!(
            "{}/openai/deployments/{}/chat/completions?api-version={}",
            endpoint.trim_end_matches('/'),
            deployment,
            api_version
        );

        let response = client
            .post(&url)
            .header("api-key", api_key)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|err| map_reqwest_error(LlmProvider::AzureOpenAI, model, err))?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(provider_failure(
                LlmProvider::AzureOpenAI,
                model,
                classify_http_status(status.as_u16()),
                format!(
                    "azure openai request failed (status={}): {}",
                    status.as_u16(),
                    body
                ),
            ));
        }

        let payload: OpenAiChatResponse = response.json().await.map_err(|err| {
            provider_failure(
                LlmProvider::AzureOpenAI,
                model,
                LlmErrorClass::Validation,
                format!("azure openai response parse failed: {}", err),
            )
        })?;

        let text = payload
            .choices
            .first()
            .map(|choice| choice.message.content.trim().to_string())
            .filter(|v| !v.is_empty())
            .ok_or_else(|| {
                provider_failure(
                    LlmProvider::AzureOpenAI,
                    model,
                    LlmErrorClass::EmptyResponse,
                    "azure openai returned empty choices",
                )
            })?;

        let usage = payload.usage.unwrap_or(OpenAiUsage {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
        });

        Ok(ProviderCallResult {
            provider: LlmProvider::AzureOpenAI,
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

    // ============================================================================
    // AWS Bedrock Implementation
    // ============================================================================

    async fn call_bedrock(
        &self,
        model: &str,
        prompt: &str,
        temperature: f32,
    ) -> Result<ProviderCallResult, ProviderCallFailure> {
        use aws_sdk_bedrockruntime::primitives::Blob;
        use aws_sdk_bedrockruntime::Client;

        let region_str = std::env::var("AWS_REGION")
            .or_else(|_| std::env::var("AWS_DEFAULT_REGION"))
            .unwrap_or_else(|_| "us-east-1".to_string());

        let config = aws_config::defaults(aws_config::BehaviorVersion::latest())
            .region(aws_config::Region::new(region_str))
            .load()
            .await;

        let client = Client::new(&config);

        // Parse model to determine provider format
        // Format: provider.model (e.g., anthropic.claude-3-haiku-20240307-v1:0)
        let (provider_name, model_id) = if model.contains('.') {
            let parts: Vec<&str> = model.splitn(2, '.').collect();
            if parts.len() == 2 {
                (parts[0], model)
            } else {
                ("anthropic", model)
            }
        } else {
            ("anthropic", model)
        };

        let request_body = match provider_name {
            "anthropic" => {
                serde_json::json!({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 1024,
                    "messages": [{
                        "role": "user",
                        "content": prompt
                    }],
                    "temperature": temperature
                })
            }
            "ai21" | "cohere" | "meta" | "mistral" => {
                // Generic format for other Bedrock models
                serde_json::json!({
                    "prompt": prompt,
                    "max_tokens": 1024,
                    "temperature": temperature
                })
            }
            _ => {
                // Default to Anthropic format
                serde_json::json!({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 1024,
                    "messages": [{
                        "role": "user",
                        "content": prompt
                    }],
                    "temperature": temperature
                })
            }
        };

        let body_bytes = serde_json::to_vec(&request_body).map_err(|err| {
            provider_failure(
                LlmProvider::Bedrock,
                model,
                LlmErrorClass::Validation,
                format!("failed to serialize bedrock request: {}", err),
            )
        })?;

        let result = client
            .invoke_model()
            .model_id(model_id)
            .body(Blob::new(body_bytes))
            .send()
            .await
            .map_err(|err| {
                // AWS SDK error handling - check error message
                let err_msg = err.to_string();
                let class = if err_msg.contains("timeout") || err_msg.contains("Timeout") {
                    LlmErrorClass::Timeout
                } else if err_msg.contains("not found") || err_msg.contains("NotFound") {
                    LlmErrorClass::Validation
                } else if err_msg.contains("throttl") || err_msg.contains("rate") {
                    LlmErrorClass::RateLimit
                } else {
                    LlmErrorClass::Unknown
                };
                provider_failure(
                    LlmProvider::Bedrock,
                    model,
                    class,
                    format!("bedrock invoke failed: {}", err),
                )
            })?;

        let response_body = result.body().as_ref();
        let response_str = String::from_utf8_lossy(response_body);

        // Parse response based on provider
        let text = match provider_name {
            "anthropic" => {
                #[allow(dead_code)]
                #[derive(Deserialize)]
                struct AnthropicBedrockResponse {
                    #[serde(default)]
                    content: Option<Vec<AnthropicBedrockContent>>,
                    #[serde(default)]
                    usage: Option<AnthropicBedrockUsage>,
                }
                #[allow(dead_code)]
                #[derive(Deserialize)]
                struct AnthropicBedrockContent {
                    #[serde(rename = "type", default)]
                    kind: Option<String>,
                    #[serde(default)]
                    text: Option<String>,
                }
                #[allow(dead_code)]
                #[derive(Deserialize)]
                struct AnthropicBedrockUsage {
                    #[serde(default, rename = "input_tokens")]
                    input_tokens: Option<u32>,
                    #[serde(default, rename = "output_tokens")]
                    output_tokens: Option<u32>,
                }

                let parsed: AnthropicBedrockResponse = serde_json::from_str(&response_str)
                    .map_err(|err| {
                        provider_failure(
                            LlmProvider::Bedrock,
                            model,
                            LlmErrorClass::Validation,
                            format!("failed to parse bedrock response: {}", err),
                        )
                    })?;

                parsed
                    .content
                    .as_ref()
                    .and_then(|c| c.first())
                    .and_then(|block| block.text.clone())
                    .unwrap_or_default()
            }
            _ => {
                // Generic parsing for other providers
                #[derive(Deserialize)]
                struct GenericBedrockResponse {
                    #[serde(default)]
                    completion: Option<String>,
                    #[serde(default)]
                    generated_text: Option<String>,
                }
                let parsed: GenericBedrockResponse =
                    serde_json::from_str(&response_str).map_err(|err| {
                        provider_failure(
                            LlmProvider::Bedrock,
                            model,
                            LlmErrorClass::Validation,
                            format!("failed to parse bedrock response: {}", err),
                        )
                    })?;

                parsed
                    .completion
                    .or(parsed.generated_text)
                    .unwrap_or_default()
            }
        };

        let text = text.trim().to_string();
        if text.is_empty() {
            return Err(provider_failure(
                LlmProvider::Bedrock,
                model,
                LlmErrorClass::EmptyResponse,
                "bedrock returned empty response",
            ));
        }

        // Bedrock doesn't always return usage info, estimate from prompt length
        let estimated_input_tokens = (prompt.len() / 4) as u32;
        let estimated_output_tokens = (text.len() / 4) as u32;

        Ok(ProviderCallResult {
            provider: LlmProvider::Bedrock,
            model: model.to_string(),
            text,
            usage: ProviderUsage {
                input_tokens: estimated_input_tokens,
                output_tokens: estimated_output_tokens,
                total_tokens: estimated_input_tokens.saturating_add(estimated_output_tokens),
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

        let discipline = load_karpathy_discipline_if_enabled(&ctx.project_root);
        let prompt = build_prompt(
            &role_name,
            &role_prompt,
            &instruction_input,
            discipline.as_deref(),
        );

        // Check replay cache before calling providers
        if let Some(cache) = &self.replay_cache {
            let seed = generate_seed(&ctx.workflow_instance_id, &ctx.step_id);
            let request_hash = crate::engine::replay_store::compute_request_hash(
                primary_provider.as_str(),
                &self.resolve_model_for_provider(
                    primary_provider,
                    primary_provider,
                    role_model_override.as_deref(),
                ),
                &prompt,
                temperature,
                seed,
            );

            // Try to get from cache
            if let Some(snapshot) = cache.check_cache(&request_hash) {
                // Return cached response
                let usage = ProviderUsage {
                    input_tokens: snapshot.tokens / 2, // Rough estimate
                    output_tokens: snapshot.tokens / 2,
                    total_tokens: snapshot.tokens,
                };

                let cached_parsed = extract_llm_json(&snapshot.response);
                let cached_summary = cached_parsed
                    .as_ref()
                    .and_then(|v| v.get("summary"))
                    .and_then(|v| v.as_str())
                    .map(|s| s.trim().to_string())
                    .unwrap_or_else(|| snapshot.response.trim().to_string());
                let cached_actions = cached_parsed
                    .as_ref()
                    .map(|v| extract_string_array(v, "actions"))
                    .unwrap_or_default();
                let cached_risks = cached_parsed
                    .as_ref()
                    .map(|v| extract_string_array(v, "risks"))
                    .unwrap_or_default();

                return Ok(SkillOutput::json(json!({
                    "schema": "llm_router.v1",
                    "provider": snapshot.provider,
                    "model": snapshot.model,
                    "role": role_name,
                    "summary": cached_summary,
                    "actions": cached_actions,
                    "risks": cached_risks,
                    "usage": {
                        "input_tokens": usage.input_tokens,
                        "output_tokens": usage.output_tokens,
                        "total_tokens": usage.total_tokens
                    },
                    "cost": {
                        "estimated_usd": snapshot.cost_usd,
                        "input_rate_per_1k": 0.0,
                        "output_rate_per_1k": 0.0,
                        "currency": "USD",
                        "source": "replay_cache"
                    },
                    "router": {
                        "primary_provider": primary_provider.as_str(),
                        "attempts": 0,
                        "max_retries": 0,
                        "timeout_ms": 0,
                        "fallback_policy": "none",
                        "fallback_used": false,
                        "fallback_blocked_by_policy": false,
                        "simulation_fallback": false,
                        "replay_cache_hit": true,
                        "errors": [],
                    }
                })));
            }
        }

        let chain = build_provider_chain(primary_provider, &self.fallback_providers);
        let mut errors = Vec::new();
        let mut fallback_used = false;
        let mut fallback_blocked_by_policy = false;
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
                Err(failure) => {
                    errors.push(format!(
                        "provider={} model={} class={} transient={} message={}",
                        failure.provider.as_str(),
                        failure.model,
                        failure.class.as_str(),
                        failure.class.is_transient(),
                        failure.message
                    ));
                    total_attempts = total_attempts.saturating_add(failure.attempts);
                    let has_next_provider = idx + 1 < chain.len();
                    if has_next_provider
                        && !should_attempt_fallback(
                            self.router_config.fallback_policy,
                            failure.class,
                        )
                    {
                        fallback_blocked_by_policy = true;
                        break;
                    }
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
                    "fallback_policy": self.router_config.fallback_policy.as_str(),
                    "fallback_used": false,
                    "fallback_blocked_by_policy": fallback_blocked_by_policy,
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

        // Save to replay cache if in record mode
        if let Some(cache) = &self.replay_cache {
            let seed = generate_seed(&ctx.workflow_instance_id, &ctx.step_id);
            let request_hash = crate::engine::replay_store::compute_request_hash(
                result.provider.as_str(),
                &result.model,
                &prompt,
                temperature,
                seed,
            );

            let snapshot = crate::engine::replay_store::LlmSnapshot {
                trace_id: ctx.workflow_instance_id.clone(),
                step_id: ctx.step_id.clone(),
                request_hash,
                provider: result.provider.as_str().to_string(),
                model: result.model.clone(),
                prompt: prompt.clone(),
                response: result.text.clone(),
                timestamp_ms: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .map(|d| d.as_millis() as u64)
                    .unwrap_or(0),
                tokens: result.usage.total_tokens,
                cost_usd: estimated_usd,
            };

            let _ = cache.add_to_cache(snapshot.request_hash.clone(), snapshot);
        }

        // Parse JSON from the raw LLM text response.
        // phi4-mini and other small models often wrap JSON in markdown fences
        // or embed it in prose — extract_llm_json handles all these cases.
        let parsed = extract_llm_json(result.text.trim());
        let summary = parsed
            .as_ref()
            .and_then(|v| v.get("summary"))
            .and_then(|v| v.as_str())
            .map(|s| s.trim().to_string())
            .unwrap_or_else(|| result.text.trim().to_string());
        let actions = parsed
            .as_ref()
            .map(|v| extract_string_array(v, "actions"))
            .unwrap_or_default();
        let risks = parsed
            .as_ref()
            .map(|v| extract_string_array(v, "risks"))
            .unwrap_or_default();

        Ok(SkillOutput::json(json!({
            "schema": "llm_router.v1",
            "provider": result.provider.as_str(),
            "model": result.model,
            "role": role_name,
            "summary": summary,
            "actions": actions,
            "risks": risks,
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
                "fallback_policy": self.router_config.fallback_policy.as_str(),
                "fallback_used": fallback_used,
                "fallback_blocked_by_policy": fallback_blocked_by_policy,
                "simulation_fallback": false,
                "errors": errors,
            }
        })))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        build_provider_chain, estimate_cost_usd, parse_fallback_policy, parse_input_payload,
        parse_provider_list, parse_role_prefixed_input, should_attempt_fallback, FallbackPolicy,
        LlmErrorClass, LlmProvider, LlmSubAgentSkill, ProviderUsage, RouterConfig,
    };
    use crate::skill::io::SkillInput;
    use serde_json::json;
    use std::path::PathBuf;

    fn live_smoke_enabled() -> bool {
        std::env::var("AGENTIC_SDLC_RUN_LIVE_LLM_TESTS")
            .ok()
            .as_deref()
            == Some("1")
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
                fallback_policy: FallbackPolicy::TransientOnly,
            },
            replay_cache: None,
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
        let parsed =
            parse_provider_list(Some("openai, ,unknown,gemini,anthropic,claude".to_string()));
        assert_eq!(
            parsed,
            vec![
                LlmProvider::OpenAI,
                LlmProvider::Gemini,
                LlmProvider::Anthropic,
                LlmProvider::Anthropic
            ]
        );

        let parsed_empty = parse_provider_list(None);
        assert!(parsed_empty.is_empty());
    }

    #[test]
    fn cost_estimation_is_zero_for_ollama_and_positive_for_hosted_providers() {
        let usage = ProviderUsage {
            input_tokens: 1000,
            output_tokens: 1000,
            total_tokens: 2000,
        };
        let (ollama_cost, _, _) = estimate_cost_usd(LlmProvider::Ollama, "qwen3:8b", usage);
        let (openai_cost, _, _) = estimate_cost_usd(LlmProvider::OpenAI, "gpt-4o-mini", usage);
        let (anthropic_cost, _, _) =
            estimate_cost_usd(LlmProvider::Anthropic, "claude-3-5-haiku-latest", usage);
        assert_eq!(ollama_cost, 0.0);
        assert!(openai_cost > 0.0);
        assert!(anthropic_cost > 0.0);
    }

    #[test]
    fn resolve_temperature_defaults_to_zero() {
        std::env::remove_var("AGENTIC_SDLC_LLM_TEMPERATURE");
        let temp = super::resolve_temperature();
        assert_eq!(temp, 0.0);
    }

    #[test]
    fn resolve_temperature_reads_from_env() {
        std::env::set_var("AGENTIC_SDLC_LLM_TEMPERATURE", "0.7");
        let temp = super::resolve_temperature();
        assert_eq!(temp, 0.7);
        std::env::remove_var("AGENTIC_SDLC_LLM_TEMPERATURE");
    }

    #[test]
    fn resolve_temperature_clamps_to_valid_range() {
        // Test upper bound
        std::env::set_var("AGENTIC_SDLC_LLM_TEMPERATURE", "3.0");
        let temp = super::resolve_temperature();
        assert_eq!(temp, 2.0);
        std::env::remove_var("AGENTIC_SDLC_LLM_TEMPERATURE");

        // Test lower bound
        std::env::set_var("AGENTIC_SDLC_LLM_TEMPERATURE", "-1.0");
        let temp = super::resolve_temperature();
        assert_eq!(temp, 0.0);
        std::env::remove_var("AGENTIC_SDLC_LLM_TEMPERATURE");
    }

    #[test]
    fn generate_seed_is_deterministic() {
        let seed1 = super::generate_seed("trace_123", "step_1");
        let seed2 = super::generate_seed("trace_123", "step_1");
        assert_eq!(seed1, seed2);

        let seed3 = super::generate_seed("trace_123", "step_2");
        assert_ne!(seed1, seed3);
    }

    #[test]
    fn generate_seed_respects_env_override() {
        std::env::set_var("AGENTIC_SDLC_LLM_SEED", "42");
        let seed = super::generate_seed("trace_123", "step_1");
        assert_eq!(seed, Some(42));
        std::env::remove_var("AGENTIC_SDLC_LLM_SEED");
    }

    #[test]
    fn is_deterministic_mode_when_temperature_zero() {
        std::env::set_var("AGENTIC_SDLC_LLM_TEMPERATURE", "0.0");
        assert!(super::is_deterministic_mode());

        std::env::set_var("AGENTIC_SDLC_LLM_TEMPERATURE", "0.7");
        assert!(!super::is_deterministic_mode());

        std::env::remove_var("AGENTIC_SDLC_LLM_TEMPERATURE");
    }

    #[test]
    fn fallback_policy_transient_only_blocks_auth_errors() {
        assert_eq!(
            parse_fallback_policy(Some("always".to_string())),
            FallbackPolicy::Always
        );
        assert_eq!(
            parse_fallback_policy(Some("never".to_string())),
            FallbackPolicy::Never
        );
        assert_eq!(
            parse_fallback_policy(Some("transient_only".to_string())),
            FallbackPolicy::TransientOnly
        );
        assert_eq!(parse_fallback_policy(None), FallbackPolicy::TransientOnly);

        assert!(should_attempt_fallback(
            FallbackPolicy::TransientOnly,
            LlmErrorClass::Timeout
        ));
        assert!(!should_attempt_fallback(
            FallbackPolicy::TransientOnly,
            LlmErrorClass::Auth
        ));
    }

    #[tokio::test]
    async fn llm_subagent_live_smoke_openai() {
        if !live_smoke_enabled() {
            eprintln!("skipped: set AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 to run live provider tests");
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
            eprintln!("skipped: set AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 to run live provider tests");
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

    #[tokio::test]
    async fn llm_subagent_live_smoke_anthropic() {
        if !live_smoke_enabled() {
            eprintln!("skipped: set AGENTIC_SDLC_RUN_LIVE_LLM_TESTS=1 to run live provider tests");
            return;
        }
        if !has_env_var("ANTHROPIC_API_KEY") {
            eprintln!("skipped: ANTHROPIC_API_KEY is not set");
            return;
        }
        let skill = live_skill(LlmProvider::Anthropic);
        let result = skill
            .call_provider_with_retry(
                LlmProvider::Anthropic,
                &skill.model,
                r#"Return exactly this JSON object and nothing else: {"summary":"smoke","actions":[],"risks":[]}"#,
                0.0,
            )
            .await
            .expect("anthropic live smoke call");
        assert_eq!(result.provider, LlmProvider::Anthropic);
        assert!(!result.text.trim().is_empty());
    }
}
