// Shared types used across all platform tiers

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Unique identifier for workflow steps
pub type StepId = String;

/// Unique identifier for agents
pub type AgentId = String;

/// Unique identifier for tenants
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TenantId(pub String);

impl TenantId {
    pub fn new(id: String) -> crate::platform::Result<Self> {
        if id.is_empty() || id.len() > 64 {
            return Err(crate::platform::PlatformError::InvalidInput(
                "TenantId must be between 1 and 64 characters".to_string(),
            ));
        }
        Ok(TenantId(id))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

/// Severity levels for various platform events
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Severity {
    Low,
    Medium,
    High,
    Critical,
}

/// Trust tier for agents and workflows
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum TrustTier {
    Untrusted,
    Basic,
    Verified,
    Certified,
}

/// Execution context shared across workflow execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionContext {
    pub workflow_id: String,
    pub instance_id: String,
    pub current_step: Option<StepId>,
    pub completed_steps: HashSet<StepId>,
    pub failed_steps: HashSet<StepId>,
    pub environment: HashMap<String, String>,
    pub plan_version: u32,
}

impl ExecutionContext {
    pub fn new(workflow_id: String, instance_id: String) -> Self {
        Self {
            workflow_id,
            instance_id,
            current_step: None,
            completed_steps: HashSet::new(),
            failed_steps: HashSet::new(),
            environment: HashMap::new(),
            plan_version: 1,
        }
    }

    /// Validate that completed and failed steps are disjoint
    pub fn validate(&self) -> crate::platform::Result<()> {
        if self.workflow_id.is_empty() {
            return Err(crate::platform::PlatformError::InvalidInput(
                "workflow_id cannot be empty".to_string(),
            ));
        }

        if self.instance_id.is_empty() {
            return Err(crate::platform::PlatformError::InvalidInput(
                "instance_id cannot be empty".to_string(),
            ));
        }

        // Check that completed and failed steps are disjoint
        let intersection: HashSet<_> = self
            .completed_steps
            .intersection(&self.failed_steps)
            .collect();

        if !intersection.is_empty() {
            return Err(crate::platform::PlatformError::InvalidInput(format!(
                "Steps cannot be both completed and failed: {:?}",
                intersection
            )));
        }

        Ok(())
    }
}

/// Data source reference for lineage tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSource {
    pub source_type: DataSourceType,
    pub reference: String,
    pub timestamp_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataSourceType {
    StepOutput,
    UserInput,
    ExternalAPI,
    FileSystem,
    Database,
}

/// Decision made during workflow execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub decision_id: String,
    pub timestamp_ms: u64,
    pub decision_type: DecisionType,
    pub inputs: Vec<DataSource>,
    pub rationale: String,
    pub confidence: f64,
}

/// Types of decisions that can be made
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DecisionType {
    PlanGeneration,
    StepExecution,
    Replanning,
    Verification,
    Escalation,
    Other(String),
}

/// Trigger cause for step execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerCause {
    DependencyResolved { dependency_step: StepId },
    UserRequest { request_id: String },
    ReplanDecision { plan_version: u32, reason: String },
    FeedbackSignal { signal_type: String, value: f64 },
}

/// Resource usage for cost tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub resource_type: ResourceType,
    pub quantity: f64,
    pub unit_cost: f64,
    pub timestamp_ms: u64,
    pub step_id: StepId,
}

/// Evidence for verification and audit
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Evidence {
    SASTReport(String),
    TestReport(String),
    CoverageReport(String),
    ManualReview(String),
    ToolOutput(String),
}

/// Resource types for cost tracking
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ResourceType {
    LLMTokens { provider: String, model: String },
    ComputeTime { cpu_ms: u64 },
    Storage { bytes: u64 },
    NetworkBandwidth { bytes: u64 },
}

impl std::fmt::Display for ResourceType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ResourceType::LLMTokens { provider, model } => {
                write!(f, "LLM Tokens ({}/{})", provider, model)
            }
            ResourceType::ComputeTime { cpu_ms } => {
                write!(f, "Compute Time ({}ms)", cpu_ms)
            }
            ResourceType::Storage { bytes } => {
                write!(f, "Storage ({} bytes)", bytes)
            }
            ResourceType::NetworkBandwidth { bytes } => {
                write!(f, "Network ({} bytes)", bytes)
            }
        }
    }
}

/// Timestamp helper
pub fn current_timestamp_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tenant_id_validation() {
        assert!(TenantId::new("valid_id".to_string()).is_ok());
        assert!(TenantId::new("".to_string()).is_err());
        assert!(TenantId::new("a".repeat(65)).is_err());
    }

    #[test]
    fn test_execution_context_validation() {
        let mut ctx = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        assert!(ctx.validate().is_ok());

        // Add overlapping step
        ctx.completed_steps.insert("step1".to_string());
        ctx.failed_steps.insert("step1".to_string());
        assert!(ctx.validate().is_err());
    }
}
