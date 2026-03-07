use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

/// Snapshot entry for LLM request/response pair
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmSnapshot {
    pub trace_id: String,
    pub step_id: String,
    pub request_hash: String,
    pub provider: String,
    pub model: String,
    pub prompt: String,
    pub response: String,
    pub timestamp_ms: u64,
    pub tokens: u32,
    pub cost_usd: f64,
}

/// Replay store for deterministic LLM response caching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayStore {
    pub snapshots: HashMap<String, LlmSnapshot>,
    pub metadata: ReplayMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReplayMetadata {
    pub version: String,
    pub created_at_ms: u64,
    pub updated_at_ms: u64,
    pub total_snapshots: usize,
}

impl ReplayStore {
    pub fn new() -> Self {
        let now = now_ms();
        Self {
            snapshots: HashMap::new(),
            metadata: ReplayMetadata {
                version: "1.0".to_string(),
                created_at_ms: now,
                updated_at_ms: now,
                total_snapshots: 0,
            },
        }
    }

    /// Load replay store from file
    pub fn load(path: &Path) -> Result<Self> {
        if !path.exists() {
            return Ok(Self::new());
        }
        let content = fs::read_to_string(path)?;
        let mut store: ReplayStore = serde_json::from_str(&content)?