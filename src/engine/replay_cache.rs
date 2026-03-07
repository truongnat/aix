#![allow(dead_code)]

use crate::engine::replay_store::{LlmSnapshot, ReplayStore};
use anyhow::Result;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};

/// Replay mode for LLM caching
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReplayMode {
    /// No replay - normal operation
    Off,
    /// Record mode - save all LLM responses
    Record,
    /// Replay mode - use cached responses only
    Replay,
}

/// In-memory cache for replay store with thread-safe access
#[derive(Debug)]
pub struct ReplayCache {
    cache: Arc<RwLock<HashMap<String, LlmSnapshot>>>,
    store_path: Option<PathBuf>,
    mode: ReplayMode,
    dirty: Arc<RwLock<bool>>,
}

impl ReplayCache {
    /// Create a new replay cache
    pub fn new(mode: ReplayMode, store_path: Option<PathBuf>) -> Result<Self> {
        let mut cache = HashMap::new();

        // Load existing store if in replay mode
        if mode == ReplayMode::Replay {
            if let Some(path) = &store_path {
                let store = ReplayStore::load(path)?;
                cache = store.snapshots;
            }
        }

        Ok(Self {
            cache: Arc::new(RwLock::new(cache)),
            store_path,
            mode,
            dirty: Arc::new(RwLock::new(false)),
        })
    }

    /// Check if a snapshot exists in cache
    pub fn check_cache(&self, hash: &str) -> Option<LlmSnapshot> {
        let cache = self.cache.read().ok()?;
        cache.get(hash).cloned()
    }

    /// Add a snapshot to cache
    pub fn add_to_cache(&self, hash: String, snapshot: LlmSnapshot) -> Result<()> {
        if self.mode == ReplayMode::Record {
            let mut cache = self
                .cache
                .write()
                .map_err(|e| anyhow::anyhow!("Failed to acquire write lock: {}", e))?;
            cache.insert(hash, snapshot);

            // Mark as dirty
            if let Ok(mut dirty) = self.dirty.write() {
                *dirty = true;
            }
        }
        Ok(())
    }

    /// Flush cache to disk
    pub fn flush(&self) -> Result<()> {
        if self.mode != ReplayMode::Record {
            return Ok(());
        }

        // Check if dirty
        let is_dirty = self.dirty.read().map(|d| *d).unwrap_or(false);

        if !is_dirty {
            return Ok(());
        }

        if let Some(path) = &self.store_path {
            let cache = self
                .cache
                .read()
                .map_err(|e| anyhow::anyhow!("Failed to acquire read lock: {}", e))?;

            let mut store = ReplayStore::new();
            for (_, snapshot) in cache.iter() {
                store.add_snapshot(snapshot.clone());
            }

            store.save(path)?;

            // Clear dirty flag
            if let Ok(mut dirty) = self.dirty.write() {
                *dirty = false;
            }
        }

        Ok(())
    }

    /// Get replay mode
    pub fn mode(&self) -> ReplayMode {
        self.mode
    }

    /// Get cache size
    pub fn len(&self) -> usize {
        self.cache.read().map(|c| c.len()).unwrap_or(0)
    }

    /// Check if cache is empty
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    /// Get cache statistics
    pub fn stats(&self) -> CacheStats {
        let size = self.len();
        let mode = self.mode;
        let dirty = self.dirty.read().map(|d| *d).unwrap_or(false);

        CacheStats {
            size,
            mode,
            dirty,
            path: self.store_path.clone(),
        }
    }
}

impl Drop for ReplayCache {
    fn drop(&mut self) {
        // Auto-flush on drop if in record mode
        if self.mode == ReplayMode::Record {
            let _ = self.flush();
        }
    }
}

/// Cache statistics
#[derive(Debug, Clone)]
pub struct CacheStats {
    pub size: usize,
    pub mode: ReplayMode,
    pub dirty: bool,
    pub path: Option<PathBuf>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_snapshot(hash: &str) -> LlmSnapshot {
        LlmSnapshot {
            trace_id: "trace_123".to_string(),
            step_id: "step_1".to_string(),
            request_hash: hash.to_string(),
            provider: "openai".to_string(),
            model: "gpt-4o-mini".to_string(),
            prompt: "test prompt".to_string(),
            response: "test response".to_string(),
            timestamp_ms: 1234567890,
            tokens: 100,
            cost_usd: 0.001,
        }
    }

    #[test]
    fn test_create_cache_off_mode() {
        let cache = ReplayCache::new(ReplayMode::Off, None).unwrap();
        assert_eq!(cache.mode(), ReplayMode::Off);
        assert_eq!(cache.len(), 0);
    }

    #[test]
    fn test_create_cache_record_mode() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        let cache = ReplayCache::new(ReplayMode::Record, Some(path)).unwrap();
        assert_eq!(cache.mode(), ReplayMode::Record);
        assert_eq!(cache.len(), 0);
    }

    #[test]
    fn test_add_to_cache() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        let cache = ReplayCache::new(ReplayMode::Record, Some(path)).unwrap();
        let snapshot = create_test_snapshot("hash_abc");

        cache
            .add_to_cache("hash_abc".to_string(), snapshot)
            .unwrap();
        assert_eq!(cache.len(), 1);

        let retrieved = cache.check_cache("hash_abc").unwrap();
        assert_eq!(retrieved.response, "test response");
    }

    #[test]
    fn test_cache_miss() {
        let cache = ReplayCache::new(ReplayMode::Record, None).unwrap();
        assert!(cache.check_cache("nonexistent").is_none());
    }

    #[test]
    fn test_flush_to_disk() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        let cache = ReplayCache::new(ReplayMode::Record, Some(path.clone())).unwrap();
        let snapshot = create_test_snapshot("hash_abc");

        cache
            .add_to_cache("hash_abc".to_string(), snapshot)
            .unwrap();
        cache.flush().unwrap();

        // Verify file was created
        assert!(path.exists());

        // Load and verify
        let store = ReplayStore::load(&path).unwrap();
        assert_eq!(store.len(), 1);
        assert!(store.has_snapshot("hash_abc"));
    }

    #[test]
    fn test_load_existing_store_in_replay_mode() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        // Create and save a store
        let mut store = ReplayStore::new();
        store.add_snapshot(create_test_snapshot("hash_abc"));
        store.save(&path).unwrap();

        // Load in replay mode
        let cache = ReplayCache::new(ReplayMode::Replay, Some(path)).unwrap();
        assert_eq!(cache.len(), 1);

        let snapshot = cache.check_cache("hash_abc").unwrap();
        assert_eq!(snapshot.response, "test response");
    }

    #[test]
    fn test_cache_stats() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        let cache = ReplayCache::new(ReplayMode::Record, Some(path.clone())).unwrap();
        let snapshot = create_test_snapshot("hash_abc");
        cache
            .add_to_cache("hash_abc".to_string(), snapshot)
            .unwrap();

        let stats = cache.stats();
        assert_eq!(stats.size, 1);
        assert_eq!(stats.mode, ReplayMode::Record);
        assert!(stats.dirty);
        assert_eq!(stats.path, Some(path));
    }

    #[test]
    fn test_auto_flush_on_drop() {
        let temp_dir = TempDir::new().unwrap();
        let path = temp_dir.path().join("replay.json");

        {
            let cache = ReplayCache::new(ReplayMode::Record, Some(path.clone())).unwrap();
            let snapshot = create_test_snapshot("hash_abc");
            cache
                .add_to_cache("hash_abc".to_string(), snapshot)
                .unwrap();
            // Cache drops here, should auto-flush
        }

        // Verify file was created
        assert!(path.exists());
        let store = ReplayStore::load(&path).unwrap();
        assert_eq!(store.len(), 1);
    }

    #[test]
    fn test_off_mode_does_not_cache() {
        let cache = ReplayCache::new(ReplayMode::Off, None).unwrap();
        let snapshot = create_test_snapshot("hash_abc");

        // Should not error, but should not cache
        cache
            .add_to_cache("hash_abc".to_string(), snapshot)
            .unwrap();
        assert_eq!(cache.len(), 0);
    }
}
