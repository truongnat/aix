// Core types for multi-agent coordination
//
// This module defines the types used for parallel execution,
// conflict resolution, and agent coordination.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

/// Agent capability definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentCapability {
    /// Agent ID
    pub agent_id: String,
    /// Skills this agent can execute
    pub skills: HashSet<String>,
    /// Maximum concurrent tasks
    pub max_concurrent: usize,
    /// Current load (0.0 to 1.0)
    pub current_load: f32,
    /// Agent status
    pub status: AgentStatus,
}

impl AgentCapability {
    pub fn new(agent_id: String, skills: HashSet<String>, max_concurrent: usize) -> Self {
        Self {
            agent_id,
            skills,
            max_concurrent,
            current_load: 0.0,
            status: AgentStatus::Available,
        }
    }

    pub fn can_execute(&self, skill: &str) -> bool {
        self.skills.contains(skill) && self.status == AgentStatus::Available
    }

    pub fn has_capacity(&self) -> bool {
        self.current_load < 1.0
    }
}

/// Agent status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentStatus {
    Available,
    Busy,
    Offline,
}

/// Task requirement for agent matching
#[derive(Debug, Clone)]
pub struct TaskRequirement {
    /// Step ID
    pub step_id: String,
    /// Required skill
    pub skill: String,
    /// Estimated duration in milliseconds
    pub estimated_duration_ms: u64,
    /// Priority (higher = more important)
    pub priority: u32,
}

/// Type of conflict between parallel executions
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConflictType {
    /// Multiple agents writing to same file
    FileWrite { path: String },
    /// Multiple agents modifying same state
    StateModification { key: String },
    /// Resource contention
    ResourceContention { resource: String },
    /// Dependency violation
    DependencyViolation { step_id: String },
}

impl std::fmt::Display for ConflictType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConflictType::FileWrite { path } => write!(f, "File write conflict: {}", path),
            ConflictType::StateModification { key } => {
                write!(f, "State modification conflict: {}", key)
            }
            ConflictType::ResourceContention { resource } => {
                write!(f, "Resource contention: {}", resource)
            }
            ConflictType::DependencyViolation { step_id } => {
                write!(f, "Dependency violation: {}", step_id)
            }
        }
    }
}

/// Strategy for resolving conflicts
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum ResolutionStrategy {
    /// Last write wins
    #[default]
    LastWriteWins,
    /// Attempt to merge changes
    Merge,
    /// Abort conflicting operation
    Abort,
    /// Require manual resolution
    Manual,
}

/// Conflict detected during parallel execution
#[derive(Debug, Clone)]
pub struct Conflict {
    /// Type of conflict
    pub conflict_type: ConflictType,
    /// Steps involved in conflict
    pub step_ids: Vec<String>,
    /// Timestamp when detected
    pub detected_at: u64,
    /// Resolution strategy to use
    pub strategy: ResolutionStrategy,
}

impl Conflict {
    pub fn new(conflict_type: ConflictType, step_ids: Vec<String>) -> Self {
        Self {
            conflict_type,
            step_ids,
            detected_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            strategy: ResolutionStrategy::default(),
        }
    }

    pub fn with_strategy(mut self, strategy: ResolutionStrategy) -> Self {
        self.strategy = strategy;
        self
    }
}

/// Execution plan for parallel steps
#[derive(Debug, Clone)]
pub struct ExecutionPlan {
    /// Groups of steps that can execute in parallel
    pub parallel_groups: Vec<ParallelGroup>,
    /// Total estimated duration in milliseconds
    pub estimated_duration_ms: u64,
    /// Maximum parallelism
    pub max_parallelism: usize,
}

impl ExecutionPlan {
    pub fn new(parallel_groups: Vec<ParallelGroup>, max_parallelism: usize) -> Self {
        let estimated_duration_ms = parallel_groups
            .iter()
            .map(|g| g.estimated_duration_ms)
            .sum();

        Self {
            parallel_groups,
            estimated_duration_ms,
            max_parallelism,
        }
    }

    pub fn total_steps(&self) -> usize {
        self.parallel_groups.iter().map(|g| g.step_ids.len()).sum()
    }
}

/// Group of steps that can execute in parallel
#[derive(Debug, Clone)]
pub struct ParallelGroup {
    /// Step IDs in this group
    pub step_ids: Vec<String>,
    /// Dependencies (steps that must complete before this group)
    pub dependencies: HashSet<String>,
    /// Estimated duration for this group (max of all steps)
    pub estimated_duration_ms: u64,
}

impl ParallelGroup {
    pub fn new(step_ids: Vec<String>, dependencies: HashSet<String>) -> Self {
        Self {
            step_ids,
            dependencies,
            estimated_duration_ms: 0,
        }
    }

    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.estimated_duration_ms = duration_ms;
        self
    }
}

/// Coordination configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinationConfig {
    /// Enable parallel execution
    pub enabled: bool,
    /// Maximum parallel agents
    pub max_parallel_agents: usize,
    /// Conflict resolution strategy
    pub conflict_strategy: ResolutionStrategy,
    /// Timeout for parallel execution in milliseconds
    pub parallel_timeout_ms: u64,
    /// Enable optimistic locking
    pub optimistic_locking: bool,
    /// Track state versions
    pub track_versions: bool,
}

impl Default for CoordinationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            max_parallel_agents: 4,
            conflict_strategy: ResolutionStrategy::LastWriteWins,
            parallel_timeout_ms: 300_000, // 5 minutes
            optimistic_locking: true,
            track_versions: true,
        }
    }
}

/// Shared state entry with versioning
#[derive(Debug, Clone)]
pub struct StateEntry {
    /// State key
    pub key: String,
    /// State value
    pub value: String,
    /// Version number
    pub version: u64,
    /// Last modified by (step ID)
    pub modified_by: String,
    /// Last modified timestamp
    pub modified_at: u64,
}

impl StateEntry {
    pub fn new(key: String, value: String, modified_by: String) -> Self {
        Self {
            key,
            value,
            version: 1,
            modified_by,
            modified_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        }
    }

    pub fn increment_version(&mut self, modified_by: String) {
        self.version += 1;
        self.modified_by = modified_by;
        self.modified_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_capability_creation() {
        let mut skills = HashSet::new();
        skills.insert("skill1".to_string());
        skills.insert("skill2".to_string());

        let agent = AgentCapability::new("agent-1".to_string(), skills, 2);

        assert_eq!(agent.agent_id, "agent-1");
        assert_eq!(agent.max_concurrent, 2);
        assert_eq!(agent.current_load, 0.0);
        assert_eq!(agent.status, AgentStatus::Available);
    }

    #[test]
    fn test_agent_can_execute() {
        let mut skills = HashSet::new();
        skills.insert("skill1".to_string());

        let agent = AgentCapability::new("agent-1".to_string(), skills, 2);

        assert!(agent.can_execute("skill1"));
        assert!(!agent.can_execute("skill2"));
    }

    #[test]
    fn test_agent_has_capacity() {
        let mut agent = AgentCapability::new("agent-1".to_string(), HashSet::new(), 2);

        assert!(agent.has_capacity());

        agent.current_load = 0.5;
        assert!(agent.has_capacity());

        agent.current_load = 1.0;
        assert!(!agent.has_capacity());
    }

    #[test]
    fn test_conflict_creation() {
        let conflict = Conflict::new(
            ConflictType::FileWrite {
                path: "test.txt".to_string(),
            },
            vec!["step1".to_string(), "step2".to_string()],
        );

        assert_eq!(conflict.step_ids.len(), 2);
        assert_eq!(conflict.strategy, ResolutionStrategy::LastWriteWins);
    }

    #[test]
    fn test_conflict_with_strategy() {
        let conflict = Conflict::new(
            ConflictType::StateModification {
                key: "key1".to_string(),
            },
            vec!["step1".to_string()],
        )
        .with_strategy(ResolutionStrategy::Merge);

        assert_eq!(conflict.strategy, ResolutionStrategy::Merge);
    }

    #[test]
    fn test_execution_plan() {
        let group1 = ParallelGroup::new(
            vec!["step1".to_string(), "step2".to_string()],
            HashSet::new(),
        )
        .with_duration(1000);

        let group2 = ParallelGroup::new(
            vec!["step3".to_string()],
            vec!["step1".to_string(), "step2".to_string()]
                .into_iter()
                .collect(),
        )
        .with_duration(500);

        let plan = ExecutionPlan::new(vec![group1, group2], 4);

        assert_eq!(plan.total_steps(), 3);
        assert_eq!(plan.estimated_duration_ms, 1500);
        assert_eq!(plan.max_parallelism, 4);
    }

    #[test]
    fn test_coordination_config_default() {
        let config = CoordinationConfig::default();

        assert!(config.enabled);
        assert_eq!(config.max_parallel_agents, 4);
        assert_eq!(config.conflict_strategy, ResolutionStrategy::LastWriteWins);
        assert!(config.optimistic_locking);
    }

    #[test]
    fn test_state_entry() {
        let mut entry = StateEntry::new(
            "key1".to_string(),
            "value1".to_string(),
            "step1".to_string(),
        );

        assert_eq!(entry.version, 1);
        assert_eq!(entry.modified_by, "step1");

        entry.increment_version("step2".to_string());

        assert_eq!(entry.version, 2);
        assert_eq!(entry.modified_by, "step2");
    }
}
