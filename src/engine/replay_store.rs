#![allow(dead_code)]

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

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
    /// Create a new empty replay store
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
        let mut store: ReplayStore = serde_json::from_str(&content)?;
        store.metadata.total_snapshots = store.snapshots.len();
        Ok(store)
    }

    /// Save replay store to file
    pub fn save(&mut self, path: &Path) -> Result<()> {
        self.metadata.updated_at_ms = now_ms();
        self.metadata.total_snapshots = self.snapshots.len();

        // Create parent directory if needed
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        let content = serde_json::to_string_pretty(self)?;
        fs::write(path, content)?;
        Ok(())
    }

    /// Add a snapshot to the store
    pub fn add_snapshot(&mut self, snapshot: LlmSnapshot) {
        self.snapshots
            .insert(snapshot.request_hash.clone(), snapshot);
    }

    /// Get a snapshot by request hash
    pub fn get_snapshot(&self, hash: &str) -> Option<&LlmSnapshot> {
        self.snapshots.get(hash)
    }

    /// Check if a snapshot exists
    pub fn has_snapshot(&self, hash: &str) -> bool {
        self.snapshots.contains_key(hash)
    }

    /// Get total number of snapshots
    pub fn len(&self) -> usize {
        self.snapshots.len()
    }

    /// Check if store is empty
    pub fn is_empty(&self) -> bool {
        self.snapshots.is_empty()
    }
}

impl Default for ReplayStore {
    fn default() -> Self {
        Self::new()
    }
}

/// Get current timestamp in milliseconds
fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Compute FNV-1a hash for request
pub fn compute_request_hash(
    provider: &str,
    model: &str,
    prompt: &str,
    temperature: f32,
    seed: Option<i64>,
) -> String {
    let combined = format!(
        "{}:{}:{}:{}:{}",
        provider,
        model,
        prompt,
        temperature,
        seed.map(|s| s.to_string()).unwrap_or_default()
    );
    fnv1a64_hex(combined.as_bytes())
}

/// FNV-1a 64-bit hash
fn fnv1a64_hex(bytes: &[u8]) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{:016x}", hash)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_create_empty_store() {
        let store = ReplayStore::new();
        assert_eq!(store.len(), 0);
        assert!(store.is_empty());
        assert_eq!(store.metadata.version, "1.0");
    }

    #[test]
    fn test_add_and_get_snapshot() {
        let mut store = ReplayStore::new();
        let snapshot = LlmSnapshot {
            trace_id: "trace_123".to_string(),
            step_id: "step_1".to_string(),
            request_hash: "hash_abc".to_string(),
            provider: "openai".to_string(),
            model: "gpt-4o-mini".to_string(),
            prompt: "test prompt".to_string(),
            response: "test response".to_string(),
            timestamp_ms: now_ms(),
            tokens: 100,
            cost_usd: 0.001,
        };

        store.add_snapshot(snapshot.clone());
        assert_eq!(store.len(), 1);
        assert!(store.has_snapshot("hash_abc"));

        let retrieved = store.get_snapshot("hash_abc").unwrap();
        assert_eq!(retrieved.trace_id, "trace_123");
        assert_eq!(retrieved.response, "test response");
    }

    #[test]
    fn test_save_and_load() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("replay.json");

        // Create and save store
        let mut store = ReplayStore::new();
        let snapshot = LlmSnapshot {
            trace_id: "trace_123".to_string(),
            step_id: "step_1".to_string(),
            request_hash: "hash_abc".to_string(),
            provider: "openai".to_string(),
            model: "gpt-4o-mini".to_string(),
            prompt: "test prompt".to_string(),
            response: "test response".to_string(),
            timestamp_ms: now_ms(),
            tokens: 100,
            cost_usd: 0.001,
        };
        store.add_snapshot(snapshot);
        store.save(&file_path).unwrap();

        // Load and verify
        let loaded = ReplayStore::load(&file_path).unwrap();
        assert_eq!(loaded.len(), 1);
        assert!(loaded.has_snapshot("hash_abc"));
        assert_eq!(loaded.metadata.total_snapshots, 1);
    }

    #[test]
    fn test_compute_hash_consistency() {
        let hash1 = compute_request_hash("openai", "gpt-4o-mini", "test", 0.0, Some(42));
        let hash2 = compute_request_hash("openai", "gpt-4o-mini", "test", 0.0, Some(42));
        assert_eq!(hash1, hash2);

        let hash3 = compute_request_hash("openai", "gpt-4o-mini", "test", 0.0, Some(43));
        assert_ne!(hash1, hash3);
    }

    #[test]
    fn test_load_nonexistent_file() {
        let temp_dir = TempDir::new().unwrap();
        let file_path = temp_dir.path().join("nonexistent.json");

        let store = ReplayStore::load(&file_path).unwrap();
        assert_eq!(store.len(), 0);
        assert!(store.is_empty());
    }
}
