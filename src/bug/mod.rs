mod analyzer;
mod templates;
mod types;

use anyhow::Result;
use serde::Deserialize;
use std::time::Duration;
use templates::{render_analysis, render_plan, render_prompt, render_reply};
use types::LoadedBugInput;

#[derive(Debug, Deserialize)]
struct OllamaGenerateResponse {
    response: String,
}

pub(crate) async fn run_analyze(input_file: &str) -> Result<()> {
    render_and_print(input_file, "analyze").await
}

pub(crate) async fn run_plan(input_file: &str) -> Result<()> {
    render_and_print(input_file, "plan").await
}

pub(crate) async fn run_reply(input_file: &str) -> Result<()> {
    render_and_print(input_file, "reply").await
}

pub(crate) async fn run_prompt(input_file: &str) -> Result<()> {
    render_and_print(input_file, "prompt").await
}

async fn render_and_print(input_file: &str, action: &str) -> Result<()> {
    let input = LoadedBugInput::from_file(input_file)?;
    let signals = analyzer::analyze_input(&input);
    let base = match action {
        "analyze" => render_analysis(&input, &signals),
        "plan" => render_plan(&input, &signals),
        "reply" => render_reply(&input, &signals),
        "prompt" => render_prompt(&input, &signals),
        _ => unreachable!("unknown bug action"),
    };

    if let Some(extra) = maybe_ollama_enhancement(action, &input, &base).await {
        println!("{}\n\nLocal Ollama note\n1. {}", base, extra.trim());
    } else {
        println!("{}", base);
    }
    Ok(())
}

fn ollama_enhancement_enabled() -> bool {
    matches!(
        std::env::var("AGENTIC_SDLC_BUG_USE_OLLAMA")
            .unwrap_or_default()
            .trim()
            .to_ascii_lowercase()
            .as_str(),
        "1" | "true" | "yes" | "on"
    )
}

async fn maybe_ollama_enhancement(
    action: &str,
    input: &LoadedBugInput,
    base: &str,
) -> Option<String> {
    if !ollama_enhancement_enabled() {
        return None;
    }

    let host = std::env::var("AGENTIC_SDLC_OLLAMA_HOST")
        .ok()
        .or_else(|| std::env::var("OLLAMA_HOST").ok())
        .unwrap_or_else(|| "http://localhost:11434".to_string());
    let model =
        std::env::var("AGENTIC_SDLC_BUG_OLLAMA_MODEL").unwrap_or_else(|_| "qwen3:8b".to_string());

    let client = reqwest::Client::builder()
        .no_proxy()
        .timeout(Duration::from_millis(1500))
        .build()
        .ok()?;
    let prompt = format!(
        "Refine this {} output for a developer bug triage assistant. Keep it short, concrete, and aligned with the existing structure. Ticket input:\n{}\n\nCurrent output:\n{}",
        action, input.raw, base
    );
    let response = client
        .post(format!("{}/api/generate", host.trim_end_matches('/')))
        .json(&serde_json::json!({
            "model": model,
            "prompt": prompt,
            "stream": false
        }))
        .send()
        .await
        .ok()?;
    if !response.status().is_success() {
        return None;
    }
    let payload: OllamaGenerateResponse = response.json().await.ok()?;
    let trimmed = payload.response.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::ollama_enhancement_enabled;

    #[test]
    fn no_network_requirement_by_default() {
        let previous = std::env::var("AGENTIC_SDLC_BUG_USE_OLLAMA").ok();
        std::env::remove_var("AGENTIC_SDLC_BUG_USE_OLLAMA");
        assert!(!ollama_enhancement_enabled());
        if let Some(value) = previous {
            std::env::set_var("AGENTIC_SDLC_BUG_USE_OLLAMA", value);
        }
    }
}
