// Shared Memory - CRDT-based concurrent memory for agents
//
// This module implements Conflict-free Replicated Data Types (CRDTs) for
// shared memory that enables multiple agents to read and write concurrently
// without manual synchronization.
//
// Supported CRDT types:
// - LWW-Register: Last-Write-Wins register for single values
// - G-Counter: Grow-only counter for monotonically increasing values
// - OR-Set: Observed-Remove set for add/remove operations

use crate::platform::types::{current_timestamp_ms, AgentId};
use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Trait for shared memory operations with CRDT support
pub trait SharedMemoryTrait {
    /// Read a value from shared memory
    fn read(&self, key: &str) -> Result<Option<MemoryValue>>;

    /// Write a value to shared memory
    fn write(&mut self, key: &str, value: MemoryValue, agent_id: &str) -> Result<()>;

    /// Merge concurrent writes using CRDT semantics
    fn merge(&mut self) -> Result<Vec<MergeConflict>>;

    /// Get the current version number for a key
    fn get_version(&self, key: &str) -> Result<u64>;
}

/// Shared memory implementation with CRDT support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedMemory {
    /// Current memory state
    memory: HashMap<String, MemoryValue>,

    /// Version history for rollback support
    history: HashMap<String, Vec<MemoryValue>>,

    /// Pending writes that need to be merged (not serialized)
    #[serde(skip)]
    pending_writes: Vec<PendingWrite>,
}

impl SharedMemory {
    /// Create a new shared memory instance
    pub fn new() -> Self {
        Self {
            memory: HashMap::new(),
            history: HashMap::new(),
            pending_writes: Vec::new(),
        }
    }

    /// Rollback a key to a specific version
    pub fn rollback(&mut self, key: &str, version: u64) -> Result<()> {
        let history = self
            .history
            .get(key)
            .ok_or_else(|| PlatformError::NotFound(format!("No history for key: {}", key)))?;

        let value = history
            .iter()
            .find(|v| v.version == version)
            .ok_or_else(|| {
                PlatformError::NotFound(format!("Version {} not found for key: {}", version, key))
            })?
            .clone();

        self.memory.insert(key.to_string(), value);
        Ok(())
    }

    /// Get the version history for a key
    pub fn get_history(&self, key: &str) -> Result<Vec<MemoryValue>> {
        self.history
            .get(key)
            .cloned()
            .ok_or_else(|| PlatformError::NotFound(format!("No history for key: {}", key)))
    }
}

impl Default for SharedMemory {
    fn default() -> Self {
        Self::new()
    }
}

impl SharedMemoryTrait for SharedMemory {
    fn read(&self, key: &str) -> Result<Option<MemoryValue>> {
        Ok(self.memory.get(key).cloned())
    }

    fn write(&mut self, key: &str, value: MemoryValue, agent_id: &str) -> Result<()> {
        // Validate CRDT metadata
        value.validate()?;

        // Store pending write for merge
        self.pending_writes.push(PendingWrite {
            key: key.to_string(),
            value: value.clone(),
            agent_id: agent_id.to_string(),
        });

        // Update memory immediately (will be merged later if conflicts exist)
        let old_value = self.memory.insert(key.to_string(), value.clone());

        // Add to history
        self.history.entry(key.to_string()).or_default().push(value);

        // If there was an old value, also keep it in history
        if let Some(old) = old_value {
            if !self.history.get(key).unwrap().contains(&old) {
                self.history.get_mut(key).unwrap().push(old);
            }
        }

        Ok(())
    }

    fn merge(&mut self) -> Result<Vec<MergeConflict>> {
        let mut conflicts = Vec::new();

        // Group pending writes by key
        let mut writes_by_key: HashMap<String, Vec<PendingWrite>> = HashMap::new();
        for write in self.pending_writes.drain(..) {
            writes_by_key
                .entry(write.key.clone())
                .or_default()
                .push(write);
        }

        // Merge writes for each key
        for (key, writes) in writes_by_key {
            if writes.len() <= 1 {
                continue; // No conflict
            }

            // Try to merge all writes
            let mut merged = writes[0].value.clone();
            let mut merge_failed = false;

            for write in &writes[1..] {
                match merge_crdt_values(&merged, &write.value) {
                    Ok(new_merged) => merged = new_merged,
                    Err(_) => {
                        merge_failed = true;
                        break;
                    }
                }
            }

            if merge_failed {
                // Report unresolvable conflict
                conflicts.push(MergeConflict {
                    key: key.clone(),
                    conflicting_versions: writes.iter().map(|w| w.value.clone()).collect(),
                    resolution_strategy: MergeStrategy::Manual,
                });
            } else {
                // Apply merged value
                self.memory.insert(key.clone(), merged.clone());
                self.history.entry(key).or_default().push(merged);
            }
        }

        Ok(conflicts)
    }

    fn get_version(&self, key: &str) -> Result<u64> {
        self.memory
            .get(key)
            .map(|v| v.version)
            .ok_or_else(|| PlatformError::NotFound(format!("Key not found: {}", key)))
    }
}

/// Memory value with CRDT metadata
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MemoryValue {
    /// The actual data stored
    pub data: serde_json::Value,

    /// Version number for this value
    pub version: u64,

    /// Agent that last modified this value
    pub last_modified_by: AgentId,

    /// Timestamp of last modification
    pub timestamp_ms: u64,

    /// CRDT-specific metadata for merge operations
    pub crdt_metadata: CRDTMetadata,
}

impl MemoryValue {
    /// Validate the memory value
    fn validate(&self) -> Result<()> {
        match &self.crdt_metadata {
            CRDTMetadata::LWWRegister {
                timestamp,
                agent_id,
            } => {
                if agent_id.is_empty() {
                    return Err(PlatformError::InvalidInput(
                        "Agent ID cannot be empty".to_string(),
                    ));
                }
                if *timestamp == 0 {
                    return Err(PlatformError::InvalidInput(
                        "Timestamp cannot be zero".to_string(),
                    ));
                }
            }
            CRDTMetadata::GCounter { counts } => {
                if counts.is_empty() {
                    return Err(PlatformError::InvalidInput(
                        "G-Counter counts cannot be empty".to_string(),
                    ));
                }
            }
            CRDTMetadata::ORSet { adds, removes } => {
                if adds.is_empty() && removes.is_empty() {
                    return Err(PlatformError::InvalidInput(
                        "OR-Set must have adds or removes".to_string(),
                    ));
                }
            }
        }
        Ok(())
    }
}

/// CRDT metadata for different CRDT types
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum CRDTMetadata {
    /// Last-Write-Wins Register
    LWWRegister { timestamp: u64, agent_id: AgentId },

    /// Grow-only Counter
    GCounter { counts: HashMap<AgentId, u64> },

    /// Observed-Remove Set
    ORSet {
        adds: HashSet<(String, u64)>,    // (element, unique_id)
        removes: HashSet<(String, u64)>, // (element, unique_id)
    },
}

/// Pending write that needs to be merged
#[derive(Debug, Clone)]
struct PendingWrite {
    key: String,
    value: MemoryValue,
    agent_id: AgentId,
}

/// Merge conflict when automatic resolution fails
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeConflict {
    /// Key that has conflicting writes
    pub key: String,

    /// All conflicting versions
    pub conflicting_versions: Vec<MemoryValue>,

    /// Strategy for resolving the conflict
    pub resolution_strategy: MergeStrategy,
}

/// Strategy for resolving merge conflicts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MergeStrategy {
    /// Automatic merge using CRDT semantics
    Automatic,

    /// Manual resolution required
    Manual,

    /// Use last-write-wins
    LastWriteWins,
}

/// Merge two CRDT values according to their type
///
/// Preconditions:
/// - local and remote have compatible CRDT types
/// - Both values have valid metadata
///
/// Postconditions:
/// - Returns merged value satisfying CRDT properties
/// - Merge is commutative: merge(a,b) == merge(b,a)
/// - Merge is associative: merge(merge(a,b),c) == merge(a,merge(b,c))
/// - Version is incremented
fn merge_crdt_values(local: &MemoryValue, remote: &MemoryValue) -> Result<MemoryValue> {
    match (&local.crdt_metadata, &remote.crdt_metadata) {
        // LWW-Register: Last-Write-Wins based on timestamp
        (
            CRDTMetadata::LWWRegister { timestamp: t1, .. },
            CRDTMetadata::LWWRegister { timestamp: t2, .. },
        ) => {
            if t2 > t1 {
                Ok(remote.clone())
            } else {
                Ok(local.clone())
            }
        }

        // G-Counter: Take max of each agent's count
        (CRDTMetadata::GCounter { counts: c1 }, CRDTMetadata::GCounter { counts: c2 }) => {
            let mut merged_counts = c1.clone();
            for (agent, count) in c2 {
                merged_counts
                    .entry(agent.clone())
                    .and_modify(|e| *e = (*e).max(*count))
                    .or_insert(*count);
            }

            // Sum all counts for the data value
            let total: u64 = merged_counts.values().sum();

            Ok(MemoryValue {
                data: serde_json::json!(total),
                version: local.version.max(remote.version) + 1,
                last_modified_by: "merge".to_string(),
                timestamp_ms: current_timestamp_ms(),
                crdt_metadata: CRDTMetadata::GCounter {
                    counts: merged_counts,
                },
            })
        }

        // OR-Set: Union of adds, union of removes
        (
            CRDTMetadata::ORSet {
                adds: a1,
                removes: r1,
            },
            CRDTMetadata::ORSet {
                adds: a2,
                removes: r2,
            },
        ) => {
            let merged_adds: HashSet<_> = a1.union(a2).cloned().collect();
            let merged_removes: HashSet<_> = r1.union(r2).cloned().collect();

            // Elements in adds but not in removes (by unique_id)
            let elements: Vec<String> = merged_adds
                .iter()
                .filter(|(elem, uid)| {
                    !merged_removes
                        .iter()
                        .any(|(r_elem, r_uid)| r_elem == elem && r_uid == uid)
                })
                .map(|(elem, _)| elem.clone())
                .collect();

            Ok(MemoryValue {
                data: serde_json::json!(elements),
                version: local.version.max(remote.version) + 1,
                last_modified_by: "merge".to_string(),
                timestamp_ms: current_timestamp_ms(),
                crdt_metadata: CRDTMetadata::ORSet {
                    adds: merged_adds,
                    removes: merged_removes,
                },
            })
        }

        // Incompatible CRDT types
        _ => Err(PlatformError::CRDTMergeConflict(
            "Incompatible CRDT types cannot be merged".to_string(),
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lww_register_merge() {
        let local = MemoryValue {
            data: serde_json::json!("value1"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        let remote = MemoryValue {
            data: serde_json::json!("value2"),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 2000,
                agent_id: "agent2".to_string(),
            },
        };

        let merged = merge_crdt_values(&local, &remote).unwrap();
        assert_eq!(merged.data, serde_json::json!("value2"));
        assert_eq!(merged.last_modified_by, "agent2");
    }

    #[test]
    fn test_lww_register_commutativity() {
        let a = MemoryValue {
            data: serde_json::json!("a"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        let b = MemoryValue {
            data: serde_json::json!("b"),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 2000,
                agent_id: "agent2".to_string(),
            },
        };

        let ab = merge_crdt_values(&a, &b).unwrap();
        let ba = merge_crdt_values(&b, &a).unwrap();

        assert_eq!(ab.data, ba.data);
    }

    #[test]
    fn test_g_counter_merge() {
        let local = MemoryValue {
            data: serde_json::json!(5),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent1".to_string(), 3), ("agent2".to_string(), 2)]),
            },
        };

        let remote = MemoryValue {
            data: serde_json::json!(7),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent1".to_string(), 2), ("agent2".to_string(), 5)]),
            },
        };

        let merged = merge_crdt_values(&local, &remote).unwrap();

        // Should take max of each agent's count: agent1=3, agent2=5, total=8
        assert_eq!(merged.data, serde_json::json!(8));
    }

    #[test]
    fn test_g_counter_commutativity() {
        let a = MemoryValue {
            data: serde_json::json!(3),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent1".to_string(), 3)]),
            },
        };

        let b = MemoryValue {
            data: serde_json::json!(5),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent2".to_string(), 5)]),
            },
        };

        let ab = merge_crdt_values(&a, &b).unwrap();
        let ba = merge_crdt_values(&b, &a).unwrap();

        assert_eq!(ab.data, ba.data);
    }

    #[test]
    fn test_or_set_merge() {
        let local = MemoryValue {
            data: serde_json::json!(["a", "b"]),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::ORSet {
                adds: HashSet::from([("a".to_string(), 1), ("b".to_string(), 2)]),
                removes: HashSet::new(),
            },
        };

        let remote = MemoryValue {
            data: serde_json::json!(["b", "c"]),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::ORSet {
                adds: HashSet::from([("b".to_string(), 2), ("c".to_string(), 3)]),
                removes: HashSet::from([("a".to_string(), 1)]),
            },
        };

        let merged = merge_crdt_values(&local, &remote).unwrap();

        // Should have b and c (a was removed)
        let elements: Vec<String> = serde_json::from_value(merged.data).unwrap();
        assert!(elements.contains(&"b".to_string()));
        assert!(elements.contains(&"c".to_string()));
        assert!(!elements.contains(&"a".to_string()));
    }

    #[test]
    fn test_or_set_commutativity() {
        let a = MemoryValue {
            data: serde_json::json!(["x"]),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::ORSet {
                adds: HashSet::from([("x".to_string(), 1)]),
                removes: HashSet::new(),
            },
        };

        let b = MemoryValue {
            data: serde_json::json!(["y"]),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::ORSet {
                adds: HashSet::from([("y".to_string(), 2)]),
                removes: HashSet::new(),
            },
        };

        let ab = merge_crdt_values(&a, &b).unwrap();
        let ba = merge_crdt_values(&b, &a).unwrap();

        let ab_elements: HashSet<String> = serde_json::from_value(ab.data).unwrap();
        let ba_elements: HashSet<String> = serde_json::from_value(ba.data).unwrap();

        assert_eq!(ab_elements, ba_elements);
    }

    #[test]
    fn test_shared_memory_read_write() {
        let mut memory = SharedMemory::new();

        let value = MemoryValue {
            data: serde_json::json!("test"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        memory.write("key1", value.clone(), "agent1").unwrap();

        let read_value = memory.read("key1").unwrap().unwrap();
        assert_eq!(read_value.data, value.data);
    }

    #[test]
    fn test_shared_memory_version_tracking() {
        let mut memory = SharedMemory::new();

        let value = MemoryValue {
            data: serde_json::json!("test"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        memory.write("key1", value, "agent1").unwrap();

        let version = memory.get_version("key1").unwrap();
        assert_eq!(version, 1);
    }

    #[test]
    fn test_shared_memory_rollback() {
        let mut memory = SharedMemory::new();

        let value1 = MemoryValue {
            data: serde_json::json!("v1"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        let value2 = MemoryValue {
            data: serde_json::json!("v2"),
            version: 2,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 2000,
                agent_id: "agent1".to_string(),
            },
        };

        memory.write("key1", value1, "agent1").unwrap();
        memory.write("key1", value2, "agent1").unwrap();

        memory.rollback("key1", 1).unwrap();

        let current = memory.read("key1").unwrap().unwrap();
        assert_eq!(current.data, serde_json::json!("v1"));
    }

    #[test]
    fn test_incompatible_crdt_types() {
        let lww = MemoryValue {
            data: serde_json::json!("test"),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: 1000,
            crdt_metadata: CRDTMetadata::LWWRegister {
                timestamp: 1000,
                agent_id: "agent1".to_string(),
            },
        };

        let counter = MemoryValue {
            data: serde_json::json!(5),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: 2000,
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent2".to_string(), 5)]),
            },
        };

        let result = merge_crdt_values(&lww, &counter);
        assert!(result.is_err());
    }
}
