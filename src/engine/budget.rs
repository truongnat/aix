use serde::{Deserialize, Serialize};

fn default_unbounded_u64() -> u64 {
    u64::MAX
}

fn default_unbounded_u32() -> u32 {
    u32::MAX
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ResourceBudget {
    #[serde(default = "default_unbounded_u64")]
    pub max_cpu_ms: u64,
    #[serde(default = "default_unbounded_u64")]
    pub max_wall_time_ms: u64,
    #[serde(default = "default_unbounded_u32")]
    pub max_fs_reads: u32,
    #[serde(default = "default_unbounded_u32")]
    pub max_fs_writes: u32,
    #[serde(default = "default_unbounded_u32")]
    pub max_network_calls: u32,
    #[serde(default = "default_unbounded_u32")]
    pub max_memory_mb: u32,
}

impl Default for ResourceBudget {
    fn default() -> Self {
        Self {
            max_cpu_ms: 10_000,
            max_wall_time_ms: 10_000,
            max_fs_reads: 128,
            max_fs_writes: 64,
            max_network_calls: 32,
            max_memory_mb: 256,
        }
    }
}

impl ResourceBudget {
    pub fn unbounded() -> Self {
        Self {
            max_cpu_ms: u64::MAX,
            max_wall_time_ms: u64::MAX,
            max_fs_reads: u32::MAX,
            max_fs_writes: u32::MAX,
            max_network_calls: u32::MAX,
            max_memory_mb: u32::MAX,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
pub struct ResourceUsage {
    #[serde(default)]
    pub cpu_ms: u64,
    #[serde(default)]
    pub wall_time_ms: u64,
    #[serde(default)]
    pub fs_reads: u32,
    #[serde(default)]
    pub fs_writes: u32,
    #[serde(default)]
    pub network_calls: u32,
}

impl ResourceUsage {
    pub fn saturating_add_assign(&mut self, other: &ResourceUsage) {
        self.cpu_ms = self.cpu_ms.saturating_add(other.cpu_ms);
        self.wall_time_ms = self.wall_time_ms.saturating_add(other.wall_time_ms);
        self.fs_reads = self.fs_reads.saturating_add(other.fs_reads);
        self.fs_writes = self.fs_writes.saturating_add(other.fs_writes);
        self.network_calls = self.network_calls.saturating_add(other.network_calls);
    }

    pub fn saturating_added(&self, other: &ResourceUsage) -> ResourceUsage {
        let mut next = self.clone();
        next.saturating_add_assign(other);
        next
    }
}

#[derive(Debug, Clone)]
pub enum ExecutionError {
    ResourceLimitExceeded {
        metric: &'static str,
        limit: u64,
        actual: u64,
    },
}

impl ExecutionError {
    pub fn resource_limit_exceeded(metric: &'static str, limit: u64, actual: u64) -> Self {
        Self::ResourceLimitExceeded {
            metric,
            limit,
            actual,
        }
    }
}

impl std::fmt::Display for ExecutionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExecutionError::ResourceLimitExceeded {
                metric,
                limit,
                actual,
            } => {
                write!(
                    f,
                    "Resource limit exceeded for {}: actual={} > limit={}",
                    metric, actual, limit
                )
            }
        }
    }
}

impl std::error::Error for ExecutionError {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionBudget {
    pub max_total_cost: u32,
    pub max_total_latency_ms: u32,
    pub max_steps: usize,
    #[serde(default)]
    pub resource_budget: ResourceBudget,
}

impl Default for ExecutionBudget {
    fn default() -> Self {
        Self {
            max_total_cost: 100,
            max_total_latency_ms: 10000,
            max_steps: 20,
            resource_budget: ResourceBudget::default(),
        }
    }
}

impl ExecutionBudget {
    #[allow(dead_code)]
    pub fn unbounded() -> Self {
        Self {
            max_total_cost: u32::MAX,
            max_total_latency_ms: u32::MAX,
            max_steps: usize::MAX,
            resource_budget: ResourceBudget::unbounded(),
        }
    }
}
