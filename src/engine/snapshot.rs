use crate::engine::backend::{BackendType, IsolationMode};
use crate::engine::budget::ResourceUsage;
use crate::engine::events::{ExecutionEvent, ExecutionTrace};
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::skill::capability::{CapabilityPermissions, TrustTier};
use crate::skill::io::SkillOutput;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionSnapshot {
    pub workflow_name: String,

    pub completed_steps: Vec<String>,
    pub failed_steps: Vec<String>,

    pub step_results: HashMap<String, SkillOutput>,

    pub trace: Vec<ExecutionEvent>,
    #[serde(default)]
    pub execution_traces: Vec<ExecutionTrace>,

    pub pending_steps: Vec<String>,

    // Phase 15: Autonomous decomposition state
    pub sub_goals: Vec<String>,
    pub current_goal_index: usize,

    // Phase 17: Budget state
    #[serde(default)]
    pub accumulated_cost: u32,
    #[serde(default)]
    pub accumulated_latency_ms: u32,
    #[serde(default)]
    pub executed_steps: usize,

    // Phase 18: Cross-domain routing state
    #[serde(default)]
    pub active_domains: Vec<String>,
    #[serde(default)]
    pub routing_policy: Option<RoutingPolicy>,
    #[serde(default)]
    pub qualified_skill_ids: HashMap<String, String>,
    #[serde(default)]
    pub last_executed_domain: Option<String>,

    // Phase 19: Security and capability state
    #[serde(default)]
    pub security_policy: Option<DomainSecurityPolicy>,
    #[serde(default)]
    pub effective_permissions_by_step: HashMap<String, CapabilityPermissions>,
    #[serde(default)]
    pub backend_type_by_step: HashMap<String, BackendType>,
    #[serde(default)]
    pub trust_tier_by_step: HashMap<String, TrustTier>,
    #[serde(default)]
    pub isolation_mode_by_step: HashMap<String, IsolationMode>,
    #[serde(default)]
    pub resource_usage_by_step: HashMap<String, ResourceUsage>,
    #[serde(default)]
    pub resource_usage_total: ResourceUsage,
    #[serde(default)]
    pub execution_trace_hash: String,
}
