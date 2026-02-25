use crate::engine::backend::{BackendType, IsolationMode};
use crate::engine::budget::{ResourceBudget, ResourceUsage};
use crate::skill::capability::TrustTier;
use crate::skill::capability::{CapabilityPermissions, SideEffectClass};
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

fn default_backend_type() -> BackendType {
    BackendType::InProcess
}

fn default_trust_tier() -> TrustTier {
    TrustTier::Trusted
}

fn default_isolation_mode() -> IsolationMode {
    IsolationMode::InProcess
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ExecutionTrace {
    pub node_id: String,
    pub skill_name: String,
    pub start_time: u64,
    pub end_time: u64,
    pub duration_ms: u64,
    pub side_effect_class: SideEffectClass,
    pub permissions_used: CapabilityPermissions,
    pub result_hash: String,
    #[serde(default = "default_backend_type")]
    pub backend_type: BackendType,
    #[serde(default = "default_trust_tier")]
    pub trust_tier: TrustTier,
    #[serde(default = "default_isolation_mode")]
    pub isolation_mode: IsolationMode,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ExecutionEvent {
    WorkflowStarted {
        workflow: String,
    },

    StepScheduled {
        step_id: String,
    },

    StepStarted {
        step_id: String,
    },

    NodeStarted {
        node_id: String,
        skill_name: String,
    },

    StepSucceeded {
        step_id: String,
    },

    NodeCompleted {
        node_id: String,
        skill_name: String,
        success: bool,
        duration_ms: u64,
        result_hash: String,
    },

    StepFailed {
        step_id: String,
        error: String,
    },

    StepSkipped {
        step_id: String,
    },

    AdaptiveTrigger {
        step_id: String,
        result: String,
    },

    ReplanInitiated {
        goal: String,
    },

    StepsInjected {
        step_ids: Vec<String>,
    },

    GoalDecomposed {
        objective: String,
        sub_goals: Vec<String>,
    },

    ReflectionCalculated {
        score: u8,
        rationale: String,
    },

    ResourceUpdated {
        node_id: String,
        usage: ResourceUsage,
        total_usage: ResourceUsage,
    },

    BudgetExceeded {
        #[serde(default)]
        metric: String,
        limit: u32,
        actual: u32,
    },

    SecurityViolation {
        step_id: String,
        skill: String,
        action: String,
        reason: String,
    },

    WorkflowCompleted,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RunSummary {
    pub execution_trace_hash: String,
    pub total_resource_usage: ResourceUsage,
    pub resource_budget: ResourceBudget,
    pub per_node_resource_usage: HashMap<String, ResourceUsage>,
    pub execution_traces: Vec<ExecutionTrace>,
}

pub struct ExecutionReport {
    pub final_memory: String,
    pub trace: Vec<ExecutionEvent>,
    pub summary: RunSummary,
}
