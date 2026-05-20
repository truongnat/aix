use anyhow::{anyhow, Result};
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Deserialize)]
pub struct OllamaModel {
    pub name: String,
    pub details: Option<OllamaModelDetails>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct OllamaModelDetails {
    pub parameter_size: Option<String>,
    pub family: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OllamaListResponse {
    models: Vec<OllamaModel>,
}

pub struct OllamaClient {
    host: String,
    model_cache: Arc<Mutex<Option<Vec<OllamaModel>>>>,
}

impl OllamaClient {
    pub fn new() -> Self {
        let host = std::env::var("AGENTIC_SDLC_OLLAMA_HOST")
            .ok()
            .or_else(|| std::env::var("OLLAMA_HOST").ok())
            .unwrap_or_else(|| "http://localhost:11434".to_string())
            .trim()
            .trim_end_matches('/')
            .to_string();

        Self {
            host,
            model_cache: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn list_models(&self) -> Result<Vec<OllamaModel>> {
        let mut cache = self.model_cache.lock().await;
        if let Some(models) = &*cache {
            return Ok(models.clone());
        }

        let client = reqwest::Client::builder()
            .no_proxy()
            .timeout(Duration::from_millis(ollama_http_timeout_ms()))
            .build()?;
        let res = client
            .get(format!("{}/api/tags", self.host))
            .send()
            .await?;

        if !res.status().is_success() {
            return Err(anyhow!("Failed to list Ollama models: status {}", res.status()));
        }

        let payload: OllamaListResponse = res.json().await?;
        *cache = Some(payload.models.clone());
        Ok(payload.models)
    }

    pub async fn resolve_model(&self, requested: &str) -> Result<String> {
        let state_path = std::path::Path::new(".agents/state/ollama_resolution.json");
        
        // 1. Check persistent cache
        if let Ok(content) = std::fs::read_to_string(state_path) {
            if let Ok(cache) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(resolved) = cache.get(requested).and_then(|v| v.as_str()) {
                    // Quick check if this model still exists in local list (lazy refresh)
                    let models = self.list_models().await?;
                    if models.iter().any(|m| m.name == resolved) {
                        return Ok(resolved.to_string());
                    }
                }
            }
        }

        let models = self.list_models().await?;
        
        // 2. Exact match
        if models.iter().any(|m| m.name == requested) {
            return Ok(requested.to_string());
        }

        // 3. Try to pull if missing and auto-pull is enabled
        if std::env::var("AGENTIC_SDLC_OLLAMA_AUTO_PULL").map(|v| v == "true").unwrap_or(false) {
            match self.pull_model(requested).await {
                Ok(_) => {
                    // Refresh cache after pull
                    {
                        let mut cache = self.model_cache.lock().await;
                        *cache = None;
                    }
                    return Ok(requested.to_string());
                }
                Err(err) => {
                    println!("⚠️ [OLLAMA] Failed to pull requested model '{}': {}. Proceeding to fallback.", requested, err);
                }
            }
        }

        // 4. Base name match (ignoring tag)
        let requested_base = requested.split(':').next().unwrap_or(requested);
        let mut resolved = None;
        if let Some(m) = models.iter().find(|m| m.name.starts_with(requested_base)) {
            println!("💡 [OLLAMA] Requested model '{}' not found, falling back to base match '{}'", requested, m.name);
            resolved = Some(m.name.clone());
        }

        // 5. Scoring fallback
        if resolved.is_none() && !models.is_empty() {
            let mut best_model = &models[0];
            let mut best_score = score_model(&best_model.name);

            for model in &models[1..] {
                let score = score_model(&model.name);
                if score > best_score {
                    best_score = score;
                    best_model = model;
                }
            }

            println!("💡 [OLLAMA] Requested model '{}' not found, using best available model '{}' (score={})", requested, best_model.name, best_score);
            resolved = Some(best_model.name.clone());
        }

        if let Some(res) = resolved {
            // Save to persistent cache
            let mut cache = if let Ok(content) = std::fs::read_to_string(state_path) {
                serde_json::from_str::<serde_json::Value>(&content).unwrap_or(serde_json::json!({}))
            } else {
                serde_json::json!({})
            };
            
            if let Some(obj) = cache.as_object_mut() {
                obj.insert(requested.to_string(), serde_json::json!(res));
                if let Some(parent) = state_path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }
                let _ = std::fs::write(state_path, serde_json::to_string_pretty(&cache).unwrap_or_default());
            }
            
            return Ok(res);
        }

        Err(anyhow!("Model '{}' not found and no local models available to fallback", requested))
    }

    pub async fn pull_model(&self, name: &str) -> Result<()> {
        println!("🤖 [OLLAMA] Pulling model '{}'...", name);
        let client = reqwest::Client::builder()
            .no_proxy()
            .timeout(Duration::from_millis(ollama_http_timeout_ms()))
            .build()?;
        let res = client
            .post(format!("{}/api/pull", self.host))
            .json(&serde_json::json!({ "name": name, "stream": false }))
            .send()
            .await?;

        if !res.status().is_success() {
            return Err(anyhow!("Failed to pull model '{}': status {}", name, res.status()));
        }

        println!("✅ [OLLAMA] Successfully pulled model '{}'", name);
        Ok(())
    }
}

fn score_model(name: &str) -> u32 {
    let name = name.to_lowercase();
    
    // Base preference list
    let base_scores = [
        ("qwen2.5-coder", 110),
        ("qwen2.5", 105),
        ("llama3.1", 100),
        ("llama3.2", 95),
        ("llama3", 90),
        ("qwen2", 85),
        ("phi4", 80),
        ("mistral", 75),
        ("phi3", 70),
        ("codellama", 65),
    ];

    let mut score: u32 = 50; // Default
    for (pattern, s) in base_scores {
        if name.contains(pattern) {
            score = s;
            break;
        }
    }

    // Heuristic boosts/penalties
    if name.contains("coder") { score += 5; }
    if name.contains("instruct") { score += 2; }
    
    if name.contains("mini") { score = score.saturating_sub(15); }
    if name.contains("tiny") { score = score.saturating_sub(20); }
    
    // Parameter size boosts
    if name.contains("70b") { score += 30; }
    if name.contains("32b") { score += 20; }
    if name.contains("14b") { score += 10; }
    if name.contains("8b") { score += 5; }
    if name.contains("7b") { score += 3; }

    score
}

fn ollama_http_timeout_ms() -> u64 {
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

#[cfg(test)]
mod tests {
    use super::ollama_http_timeout_ms;

    #[test]
    fn ollama_http_timeout_honors_env_override() {
        let key = "AGENTIC_SDLC_OLLAMA_TIMEOUT_MS";
        let prior = std::env::var(key).ok();
        unsafe {
            std::env::set_var(key, "4321");
        }
        assert_eq!(ollama_http_timeout_ms(), 4_321);
        match prior {
            Some(value) => unsafe { std::env::set_var(key, value) },
            None => unsafe { std::env::remove_var(key) },
        }
    }
}
