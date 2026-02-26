#![allow(clippy::too_many_arguments)]
#![allow(clippy::field_reassign_with_default)]
#![allow(clippy::explicit_auto_deref)]
#![allow(clippy::single_char_add_str)]
#![allow(clippy::useless_conversion)]

use std::collections::{HashMap, HashSet};
use std::hash::{Hash, Hasher};
use std::sync::{Arc, Mutex};
use std::time::Instant;

use crate::engine::backend::{
    BackendType, ExecutionBackend, InProcessBackend, IsolationMode, SubprocessBackend,
};
use crate::engine::budget::{ExecutionBudget, ExecutionError, ResourceUsage};
use crate::engine::condition::evaluate_condition;
use crate::engine::context::ExecutionContext;
use crate::engine::events::{ExecutionEvent, ExecutionTrace, RunSummary};
use crate::engine::graph::ExecutionGraph;
use crate::engine::registry::DomainRegistry;
use crate::engine::resolver::resolve_input;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::{DomainSecurityPolicy, SecurityViolationError};
use crate::skill::capability::{CapabilityPermissions, SideEffectClass, TrustTier};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::workflow::model::{FailureStrategy, Workflow, WorkflowStep};
use anyhow::{anyhow, Result};

use crate::engine::snapshot::ExecutionSnapshot;

use crate::engine::decomposition::{AutonomyLimits, DeterministicDecomposer, GoalDecomposer};

use crate::engine::planner::{DeterministicPlanner, Planner, PlanningGoal};
use crate::engine::reflection::{ExperienceEntry, ExperienceStore, ReflectiveScorer};

pub struct Executor {
    domain_registry: Arc<DomainRegistry>,
    trace: Arc<Mutex<Vec<ExecutionEvent>>>,
    accumulated_cost: Arc<Mutex<u32>>,
    accumulated_latency_ms: Arc<Mutex<u32>>,
    executed_steps: Arc<Mutex<usize>>,
    in_process_backend: Arc<InProcessBackend>,
    subprocess_backend: Arc<SubprocessBackend>,
    execution_traces: Arc<Mutex<Vec<ExecutionTrace>>>,
    backend_type_by_step: Arc<Mutex<HashMap<String, BackendType>>>,
    trust_tier_by_step: Arc<Mutex<HashMap<String, TrustTier>>>,
    isolation_mode_by_step: Arc<Mutex<HashMap<String, IsolationMode>>>,
    resource_usage_by_step: Arc<Mutex<HashMap<String, ResourceUsage>>>,
    total_resource_usage: Arc<Mutex<ResourceUsage>>,
    logical_clock_ms: Arc<Mutex<u64>>,
}

#[derive(Debug, Clone, Copy, Default)]
struct BudgetProjection {
    cost: u32,
    latency_ms: u32,
    steps: usize,
}

#[derive(Debug)]
struct BudgetExceededError {
    metric: &'static str,
    limit: u64,
    actual: u64,
}

impl BudgetExceededError {
    fn new(metric: &'static str, limit: u64, actual: u64) -> Self {
        Self {
            metric,
            limit,
            actual,
        }
    }
}

impl std::fmt::Display for BudgetExceededError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Budget exceeded for {}: actual={} > limit={}",
            self.metric, self.actual, self.limit
        )
    }
}

impl std::error::Error for BudgetExceededError {}

fn deterministic_string_hash(input: &str) -> String {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    input.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn to_u32_saturated(value: u64) -> u32 {
    u32::try_from(value).unwrap_or(u32::MAX)
}

fn usage_metric_usage(usage: &ResourceUsage, metric: &'static str) -> u64 {
    match metric {
        "cpu_ms" => usage.cpu_ms,
        "wall_time_ms" => usage.wall_time_ms,
        "fs_reads" => u64::from(usage.fs_reads),
        "fs_writes" => u64::from(usage.fs_writes),
        "network_calls" => u64::from(usage.network_calls),
        "memory_mb" => 0,
        _ => 0,
    }
}

fn backend_for_trust_tier(trust_tier: TrustTier) -> (BackendType, IsolationMode) {
    match trust_tier {
        TrustTier::Trusted => (BackendType::InProcess, IsolationMode::InProcess),
        TrustTier::Constrained | TrustTier::Untrusted => {
            (BackendType::Subprocess, IsolationMode::SubprocessSandbox)
        }
    }
}

fn hash_step_success(
    input: &SkillInput,
    output: &SkillOutput,
    permissions_used: &CapabilityPermissions,
) -> String {
    let payload = serde_json::json!({
        "input": input,
        "output": output,
        "permissions_used": permissions_used,
    });
    deterministic_string_hash(&payload.to_string())
}

fn hash_step_failure(
    input: &SkillInput,
    error: &str,
    permissions_used: &CapabilityPermissions,
) -> String {
    let payload = serde_json::json!({
        "input": input,
        "error": error,
        "permissions_used": permissions_used,
    });
    deterministic_string_hash(&payload.to_string())
}

fn next_trace_window(logical_clock_ms: &Arc<Mutex<u64>>, duration_ms: u64) -> (u64, u64) {
    let mut clock = logical_clock_ms.lock().unwrap();
    let start = *clock;
    let end = start.saturating_add(duration_ms);
    *clock = end;
    (start, end)
}

fn record_node_usage(
    step_id: &str,
    step_usage: &ResourceUsage,
    resource_usage_by_step: &Arc<Mutex<HashMap<String, ResourceUsage>>>,
    total_resource_usage: &Arc<Mutex<ResourceUsage>>,
) {
    {
        let mut usage_map = resource_usage_by_step.lock().unwrap();
        usage_map.insert(step_id.to_string(), step_usage.clone());
    }
    {
        let mut total = total_resource_usage.lock().unwrap();
        total.saturating_add_assign(step_usage);
    }
}

fn record_node_trace(trace: ExecutionTrace, execution_traces: &Arc<Mutex<Vec<ExecutionTrace>>>) {
    execution_traces.lock().unwrap().push(trace);
}

impl Executor {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self {
            domain_registry,
            trace: Arc::new(Mutex::new(Vec::new())),
            accumulated_cost: Arc::new(Mutex::new(0)),
            accumulated_latency_ms: Arc::new(Mutex::new(0)),
            executed_steps: Arc::new(Mutex::new(0)),
            in_process_backend: Arc::new(InProcessBackend),
            subprocess_backend: Arc::new(SubprocessBackend::default()),
            execution_traces: Arc::new(Mutex::new(Vec::new())),
            backend_type_by_step: Arc::new(Mutex::new(HashMap::new())),
            trust_tier_by_step: Arc::new(Mutex::new(HashMap::new())),
            isolation_mode_by_step: Arc::new(Mutex::new(HashMap::new())),
            resource_usage_by_step: Arc::new(Mutex::new(HashMap::new())),
            total_resource_usage: Arc::new(Mutex::new(ResourceUsage::default())),
            logical_clock_ms: Arc::new(Mutex::new(0)),
        }
    }

    pub fn get_trace(&self) -> Vec<ExecutionEvent> {
        let trace = self.trace.lock().unwrap();
        trace.clone()
    }

    pub fn get_execution_traces(&self) -> Vec<ExecutionTrace> {
        let traces = self.execution_traces.lock().unwrap();
        traces.clone()
    }

    pub fn get_total_resource_usage(&self) -> ResourceUsage {
        self.total_resource_usage.lock().unwrap().clone()
    }

    pub fn get_resource_usage_by_step(&self) -> HashMap<String, ResourceUsage> {
        self.resource_usage_by_step.lock().unwrap().clone()
    }

    pub fn get_backend_type_by_step(&self) -> HashMap<String, BackendType> {
        self.backend_type_by_step.lock().unwrap().clone()
    }

    pub fn get_trust_tier_by_step(&self) -> HashMap<String, TrustTier> {
        self.trust_tier_by_step.lock().unwrap().clone()
    }

    pub fn get_isolation_mode_by_step(&self) -> HashMap<String, IsolationMode> {
        self.isolation_mode_by_step.lock().unwrap().clone()
    }

    pub fn execution_trace_hash(&self) -> String {
        let traces = self.execution_traces.lock().unwrap();
        let mut stable_lines = Vec::with_capacity(traces.len());
        for trace in traces.iter() {
            stable_lines.push(format!(
                "{}|{}|{:?}|{:?}|{:?}|{:?}|{:?}|{}",
                trace.node_id,
                trace.skill_name,
                trace.side_effect_class,
                trace.permissions_used,
                trace.backend_type,
                trace.trust_tier,
                trace.isolation_mode,
                trace.result_hash
            ));
        }
        deterministic_string_hash(&stable_lines.join("\n"))
    }

    pub fn build_run_summary(&self, budget: &ExecutionBudget) -> RunSummary {
        RunSummary {
            execution_trace_hash: self.execution_trace_hash(),
            total_resource_usage: self.get_total_resource_usage(),
            resource_budget: budget.resource_budget.clone(),
            per_node_resource_usage: self.get_resource_usage_by_step(),
            execution_traces: self.get_execution_traces(),
        }
    }

    fn emit(&self, event: ExecutionEvent) {
        let mut trace = self.trace.lock().unwrap();
        trace.push(event);
    }

    fn latest_execution_trace_for(&self, node_id: &str) -> Option<ExecutionTrace> {
        self.execution_traces
            .lock()
            .unwrap()
            .iter()
            .rev()
            .find(|trace| trace.node_id == node_id)
            .cloned()
    }

    fn ensure_resource_budget_headroom(&self, budget: &ExecutionBudget) -> Result<()> {
        let usage = self.get_total_resource_usage();
        let checks = [
            ("cpu_ms", budget.resource_budget.max_cpu_ms),
            ("wall_time_ms", budget.resource_budget.max_wall_time_ms),
            ("fs_reads", u64::from(budget.resource_budget.max_fs_reads)),
            ("fs_writes", u64::from(budget.resource_budget.max_fs_writes)),
            (
                "network_calls",
                u64::from(budget.resource_budget.max_network_calls),
            ),
        ];

        for (metric, limit) in checks {
            let actual = usage_metric_usage(&usage, metric);
            if actual > limit {
                return Err(ExecutionError::resource_limit_exceeded(metric, limit, actual).into());
            }
        }
        Ok(())
    }

    fn build_snapshot(
        &self,
        workflow_name: String,
        completed_steps: &HashSet<String>,
        failed_steps: &HashSet<String>,
        step_results: &HashMap<String, SkillOutput>,
        in_degree: &HashMap<String, usize>,
        sub_goals: Vec<String>,
        current_goal_index: usize,
        routing_policy: &RoutingPolicy,
        steps_lookup: &HashMap<String, crate::workflow::model::WorkflowStep>,
        default_domain: &str,
        active_domains: &HashSet<String>,
        last_executed_domain: Option<String>,
        security_policy: &DomainSecurityPolicy,
        effective_permissions_by_step: &HashMap<String, CapabilityPermissions>,
    ) -> ExecutionSnapshot {
        let trace = self.get_trace();
        let pending_steps = in_degree.keys().cloned().collect();
        let current_cost = *self.accumulated_cost.lock().unwrap();
        let current_latency = *self.accumulated_latency_ms.lock().unwrap();
        let current_steps = *self.executed_steps.lock().unwrap();
        let mut active_domain_list: Vec<String> = active_domains.iter().cloned().collect();
        active_domain_list.sort();
        let mut qualified_skill_ids = HashMap::new();
        for (step_id, step) in steps_lookup {
            let value = self
                .domain_registry
                .resolve_skill_reference(default_domain, &step.skill)
                .map(|(q, _)| q.canonical_id())
                .unwrap_or_else(|_| step.skill.clone());
            qualified_skill_ids.insert(step_id.clone(), value);
        }

        ExecutionSnapshot {
            workflow_name,
            completed_steps: completed_steps.iter().cloned().collect(),
            failed_steps: failed_steps.iter().cloned().collect(),
            step_results: step_results.clone(),
            trace,
            pending_steps,
            sub_goals,
            current_goal_index,
            accumulated_cost: current_cost,
            accumulated_latency_ms: current_latency,
            executed_steps: current_steps,
            active_domains: active_domain_list,
            routing_policy: Some(routing_policy.clone()),
            qualified_skill_ids,
            last_executed_domain,
            security_policy: Some(security_policy.clone()),
            effective_permissions_by_step: effective_permissions_by_step.clone(),
            backend_type_by_step: self.get_backend_type_by_step(),
            trust_tier_by_step: self.get_trust_tier_by_step(),
            isolation_mode_by_step: self.get_isolation_mode_by_step(),
            execution_traces: self.get_execution_traces(),
            resource_usage_by_step: self.get_resource_usage_by_step(),
            resource_usage_total: self.get_total_resource_usage(),
            execution_trace_hash: self.execution_trace_hash(),
        }
    }

    fn estimate_projection_for_steps(
        &self,
        default_domain: &str,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
        steps_lookup: &HashMap<String, WorkflowStep>,
        step_ids: &[String],
        active_domains: &HashSet<String>,
        last_domain: Option<String>,
    ) -> Result<BudgetProjection> {
        let mut projection = BudgetProjection::default();
        let mut projected_domains = active_domains.clone();
        let mut projected_last_domain = last_domain;
        let mut ordered_ids: Vec<String> = step_ids.to_vec();
        ordered_ids.sort();

        for step_id in ordered_ids {
            let step = steps_lookup
                .get(&step_id)
                .ok_or_else(|| anyhow!("Missing step '{}' during budget projection", step_id))?;
            let (qualified, skill) = self
                .domain_registry
                .resolve_skill_reference(default_domain, &step.skill)?;
            if !routing_policy.allows_domain(&qualified.domain) {
                return Err(anyhow!(
                    "Skill '{}' uses disallowed domain '{}' under routing policy",
                    qualified.canonical_id(),
                    qualified.domain
                ));
            }
            let cap = skill.capability();
            if !security_policy.allows_declared_permissions(&cap.permissions) {
                let denied = security_policy.denied_declared_actions(&cap.permissions);
                return Err(SecurityViolationError::new(
                    &step_id,
                    &qualified.canonical_id(),
                    "permission_declaration",
                    format!(
                        "Declared permissions [{}] violate security policy",
                        denied.join(", ")
                    ),
                )
                .into());
            }
            if !security_policy.allows_trust_tier(cap.trust_tier) {
                return Err(SecurityViolationError::new(
                    &step_id,
                    &qualified.canonical_id(),
                    "trust_tier",
                    format!(
                        "Skill trust tier '{:?}' exceeds policy max '{:?}'",
                        cap.trust_tier, security_policy.max_trust_tier
                    ),
                )
                .into());
            }

            let mut step_cost = cap.estimated_cost;
            if !projected_domains.contains(&qualified.domain) {
                step_cost =
                    step_cost.saturating_add(routing_policy.domain_overhead(&qualified.domain));
            }
            if projected_last_domain
                .as_ref()
                .map(|prev| prev != &qualified.domain)
                .unwrap_or(false)
            {
                step_cost = step_cost.saturating_add(routing_policy.cross_domain_penalty);
            }
            if security_policy.strict_mode
                && cap.side_effect_class == SideEffectClass::ExternalMutation
            {
                step_cost = step_cost.saturating_add(security_policy.external_mutation_penalty);
            }
            step_cost = step_cost.saturating_add(cap.trust_tier.isolation_penalty());

            projection.cost = projection.cost.saturating_add(step_cost);
            projection.latency_ms = projection
                .latency_ms
                .saturating_add(cap.estimated_latency_ms);
            projection.steps = projection.steps.saturating_add(1);
            projected_domains.insert(qualified.domain.clone());
            projected_last_domain = Some(qualified.domain);
        }

        Ok(projection)
    }

    fn estimate_projection_for_workflow(
        &self,
        default_domain: &str,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
        workflow: &Workflow,
        active_domains: &HashSet<String>,
        last_domain: Option<String>,
    ) -> Result<BudgetProjection> {
        let lookup: HashMap<String, WorkflowStep> = workflow
            .steps
            .iter()
            .cloned()
            .map(|step| (step.id.clone(), step))
            .collect();
        let ids: Vec<String> = workflow.steps.iter().map(|step| step.id.clone()).collect();
        self.estimate_projection_for_steps(
            default_domain,
            routing_policy,
            security_policy,
            &lookup,
            &ids,
            active_domains,
            last_domain,
        )
    }

    fn ensure_projected_budget_headroom(
        &self,
        projection: BudgetProjection,
        budget: &ExecutionBudget,
    ) -> Result<()> {
        if let Err(err) = self.ensure_resource_budget_headroom(budget) {
            if let Some(exec_err) = err.downcast_ref::<ExecutionError>() {
                match exec_err {
                    ExecutionError::ResourceLimitExceeded {
                        metric,
                        limit,
                        actual,
                    } => {
                        self.emit(ExecutionEvent::BudgetExceeded {
                            metric: metric.to_string(),
                            limit: to_u32_saturated(*limit),
                            actual: to_u32_saturated(*actual),
                        });
                    }
                }
            }
            return Err(err);
        }

        let current_cost = *self.accumulated_cost.lock().unwrap();
        let projected_cost = current_cost.saturating_add(projection.cost);
        if projected_cost > budget.max_total_cost {
            self.emit(ExecutionEvent::BudgetExceeded {
                metric: "cost".to_string(),
                limit: budget.max_total_cost,
                actual: projected_cost,
            });
            return Err(anyhow!(
                "Planner projection exceeds cost budget: projected={} > limit={}",
                projected_cost,
                budget.max_total_cost
            ));
        }

        let current_latency = *self.accumulated_latency_ms.lock().unwrap();
        let projected_latency = current_latency.saturating_add(projection.latency_ms);
        if projected_latency > budget.max_total_latency_ms {
            self.emit(ExecutionEvent::BudgetExceeded {
                metric: "latency".to_string(),
                limit: budget.max_total_latency_ms,
                actual: projected_latency,
            });
            return Err(anyhow!(
                "Planner projection exceeds latency budget: projected={}ms > limit={}ms",
                projected_latency,
                budget.max_total_latency_ms
            ));
        }

        let current_steps = *self.executed_steps.lock().unwrap();
        let projected_steps = current_steps.saturating_add(projection.steps);
        if projected_steps > budget.max_steps {
            let limit = u32::try_from(budget.max_steps).unwrap_or(u32::MAX);
            let actual = u32::try_from(projected_steps).unwrap_or(u32::MAX);
            self.emit(ExecutionEvent::BudgetExceeded {
                metric: "steps".to_string(),
                limit,
                actual,
            });
            return Err(anyhow!(
                "Planner projection exceeds step budget: projected={} > limit={}",
                projected_steps,
                budget.max_steps
            ));
        }

        Ok(())
    }

    pub async fn execute_workflow(
        &self,
        workflow: &Workflow,
        initial_snapshot: Option<ExecutionSnapshot>,
        snapshot_path: Option<String>,
        sub_goals: Vec<String>,
        current_goal_index: usize,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<String> {
        let mut base_ctx = ExecutionContext::default();
        base_ctx.workflow_name = workflow.meta.name.clone();
        // memory is now HashMap, default() is fine for it and completed_steps
        let mut initial_snapshot = initial_snapshot;
        let had_initial_snapshot = initial_snapshot.is_some();
        let mut effective_budget = budget;
        if let Some(workflow_resource_budget) = workflow.meta.resource_budget.as_ref() {
            effective_budget.resource_budget.max_cpu_ms = effective_budget
                .resource_budget
                .max_cpu_ms
                .min(workflow_resource_budget.max_cpu_ms);
            effective_budget.resource_budget.max_wall_time_ms = effective_budget
                .resource_budget
                .max_wall_time_ms
                .min(workflow_resource_budget.max_wall_time_ms);
            effective_budget.resource_budget.max_fs_reads = effective_budget
                .resource_budget
                .max_fs_reads
                .min(workflow_resource_budget.max_fs_reads);
            effective_budget.resource_budget.max_fs_writes = effective_budget
                .resource_budget
                .max_fs_writes
                .min(workflow_resource_budget.max_fs_writes);
            effective_budget.resource_budget.max_network_calls = effective_budget
                .resource_budget
                .max_network_calls
                .min(workflow_resource_budget.max_network_calls);
        }

        // Enforce domain isolation
        let default_domain = workflow.meta.domain.as_ref().ok_or_else(|| {
            anyhow!("Workflow must specify a domain in meta. Add 'Domain: <name>' to workflow.")
        })?;

        if !self.domain_registry.has_domain(default_domain) {
            return Err(anyhow!("Domain '{}' not registered", default_domain));
        }

        let mut effective_routing_policy = workflow
            .meta
            .routing_policy
            .clone()
            .unwrap_or(routing_policy);
        let workflow_security_policy = workflow.meta.security_policy.clone().unwrap_or_default();
        let effective_security_policy =
            DomainSecurityPolicy::most_restrictive(&workflow_security_policy, &security_policy);
        if let Some(ref snap) = initial_snapshot {
            if let Some(ref policy) = snap.routing_policy {
                effective_routing_policy = policy.clone();
            }
            if let Some(ref snap_policy) = snap.security_policy {
                effective_security_policy.ensure_resume_not_broader_than(snap_policy)?;
            }
        }

        // Build execution graph
        let graph = ExecutionGraph::from_steps(&workflow.steps);

        // Track in_degree for batch execution - mutable copy
        let mut in_degree: HashMap<String, usize> = graph.in_degree.clone();

        // Thread-safe step result storage
        let step_results: Arc<Mutex<HashMap<String, SkillOutput>>> =
            Arc::new(Mutex::new(HashMap::new()));

        // Track failed steps (for Continue strategy)
        let failed_steps: Arc<Mutex<HashSet<String>>> = Arc::new(Mutex::new(HashSet::new()));

        // Track completed steps
        let completed_steps: Arc<Mutex<HashSet<String>>> = Arc::new(Mutex::new(HashSet::new()));
        let mut restored_active_domains = HashSet::new();
        let mut restored_last_domain = None;
        let mut restored_effective_permissions_by_step = HashMap::new();
        let mut restored_backend_type_by_step = HashMap::new();
        let mut restored_trust_tier_by_step = HashMap::new();
        let mut restored_isolation_mode_by_step = HashMap::new();
        let mut restored_resource_usage_by_step = HashMap::new();
        let mut restored_total_resource_usage = ResourceUsage::default();
        let mut restored_execution_traces = Vec::new();
        let mut restored_logical_clock_ms = 0_u64;

        // Initialize state from snapshot if provided
        if let Some(snap) = initial_snapshot.take() {
            // ... (restoration logic remains similar but uses Mutexes)
            let mut trace = self.trace.lock().unwrap();
            *trace = snap.trace.clone();

            let mut results = step_results.lock().unwrap();
            *results = snap.step_results.clone();

            let mut comp = completed_steps.lock().unwrap();
            *comp = snap.completed_steps.into_iter().collect();

            let mut fail = failed_steps.lock().unwrap();
            *fail = snap.failed_steps.into_iter().collect();

            let mut cost = self.accumulated_cost.lock().unwrap();
            *cost = snap.accumulated_cost;

            let mut latency = self.accumulated_latency_ms.lock().unwrap();
            *latency = snap.accumulated_latency_ms;

            let mut steps = self.executed_steps.lock().unwrap();
            *steps = snap.executed_steps;
            restored_active_domains = snap.active_domains.into_iter().collect();
            restored_last_domain = snap.last_executed_domain;
            restored_effective_permissions_by_step = snap.effective_permissions_by_step;
            restored_backend_type_by_step = snap.backend_type_by_step;
            restored_trust_tier_by_step = snap.trust_tier_by_step;
            restored_isolation_mode_by_step = snap.isolation_mode_by_step;
            restored_resource_usage_by_step = snap.resource_usage_by_step;
            restored_total_resource_usage = snap.resource_usage_total;
            restored_execution_traces = snap.execution_traces;
            restored_logical_clock_ms = restored_total_resource_usage.wall_time_ms;

            // Recompute in_degrees based on restored state
            for step_id in workflow.steps.iter().map(|s| &s.id) {
                if comp.contains(step_id) || fail.contains(step_id) {
                    in_degree.remove(step_id);
                    if let Some(neighbors) = graph.adjacency.get(step_id) {
                        for neighbor in neighbors {
                            if let Some(deg) = in_degree.get_mut(neighbor) {
                                *deg = deg.saturating_sub(1);
                            }
                        }
                    }
                }
            }
        }
        {
            let mut traces = self.execution_traces.lock().unwrap();
            *traces = restored_execution_traces;
        }
        {
            let mut usage_map = self.resource_usage_by_step.lock().unwrap();
            *usage_map = restored_resource_usage_by_step;
        }
        {
            let mut backend_map = self.backend_type_by_step.lock().unwrap();
            *backend_map = restored_backend_type_by_step.clone();
        }
        {
            let mut trust_map = self.trust_tier_by_step.lock().unwrap();
            *trust_map = restored_trust_tier_by_step.clone();
        }
        {
            let mut isolation_map = self.isolation_mode_by_step.lock().unwrap();
            *isolation_map = restored_isolation_mode_by_step.clone();
        }
        {
            let mut total_usage = self.total_resource_usage.lock().unwrap();
            *total_usage = restored_total_resource_usage;
        }
        {
            let mut logical_clock = self.logical_clock_ms.lock().unwrap();
            *logical_clock = restored_logical_clock_ms;
        }
        if let Err(err) = self.ensure_resource_budget_headroom(&effective_budget) {
            if let Some(exec_err) = err.downcast_ref::<ExecutionError>() {
                match exec_err {
                    ExecutionError::ResourceLimitExceeded {
                        metric,
                        limit,
                        actual,
                    } => {
                        self.emit(ExecutionEvent::BudgetExceeded {
                            metric: metric.to_string(),
                            limit: to_u32_saturated(*limit),
                            actual: to_u32_saturated(*actual),
                        });
                    }
                }
            }
            return Err(err);
        }

        // Resume integrity: backend/trust/isolation cannot change across resumes.
        if had_initial_snapshot {
            let lookup = workflow
                .steps
                .iter()
                .cloned()
                .map(|s| (s.id.clone(), s))
                .collect::<HashMap<String, WorkflowStep>>();
            let mut step_ids: HashSet<String> = HashSet::new();
            step_ids.extend(restored_backend_type_by_step.keys().cloned());
            step_ids.extend(restored_trust_tier_by_step.keys().cloned());
            step_ids.extend(restored_isolation_mode_by_step.keys().cloned());
            for step_id in step_ids {
                if let Some(step) = lookup.get(&step_id) {
                    let (qualified, skill) = self
                        .domain_registry
                        .resolve_skill_reference(default_domain, &step.skill)?;
                    let cap = skill.capability();
                    let (expected_backend, expected_isolation_mode) =
                        backend_for_trust_tier(cap.trust_tier);
                    if let Some(snapshot_backend) = restored_backend_type_by_step.get(&step_id) {
                        if *snapshot_backend != expected_backend {
                            return Err(anyhow!(
                                "Resume isolation mismatch for step '{}': snapshot backend '{:?}' != current '{:?}' (skill '{}')",
                                step_id,
                                snapshot_backend,
                                expected_backend,
                                qualified.canonical_id()
                            ));
                        }
                    }
                    if let Some(snapshot_tier) = restored_trust_tier_by_step.get(&step_id) {
                        if *snapshot_tier != cap.trust_tier {
                            return Err(anyhow!(
                                "Resume trust-tier mismatch for step '{}': snapshot '{:?}' != current '{:?}' (skill '{}')",
                                step_id,
                                snapshot_tier,
                                cap.trust_tier,
                                qualified.canonical_id()
                            ));
                        }
                    }
                    if let Some(snapshot_isolation) = restored_isolation_mode_by_step.get(&step_id)
                    {
                        if *snapshot_isolation != expected_isolation_mode {
                            return Err(anyhow!(
                                "Resume isolation-mode mismatch for step '{}': snapshot '{:?}' != current '{:?}' (skill '{}')",
                                step_id,
                                snapshot_isolation,
                                expected_isolation_mode,
                                qualified.canonical_id()
                            ));
                        }
                    }
                }
            }
        }

        let active_domains: Arc<Mutex<HashSet<String>>> =
            Arc::new(Mutex::new(restored_active_domains));
        let last_executed_domain: Arc<Mutex<Option<String>>> =
            Arc::new(Mutex::new(restored_last_domain));
        let effective_permissions_by_step: Arc<Mutex<HashMap<String, CapabilityPermissions>>> =
            Arc::new(Mutex::new(restored_effective_permissions_by_step));

        // Shared dynamic step definitions
        let steps_lookup: Arc<Mutex<HashMap<String, crate::workflow::model::WorkflowStep>>> =
            Arc::new(Mutex::new(
                workflow
                    .steps
                    .iter()
                    .cloned()
                    .map(|s| (s.id.clone(), s))
                    .collect(),
            ));

        // Mutable graph state (in-degree and adjacency)
        // We'll use local in_degree and adjacency for now, but update them on re-plan.
        let mut adjacency = graph.adjacency.clone();

        // Fail early if projected remaining work cannot fit budget.
        let projected_pending_result = {
            let pending_step_ids: Vec<String> = in_degree.keys().cloned().collect();
            let lookup = steps_lookup.lock().unwrap();
            let active_snapshot = active_domains.lock().unwrap().clone();
            let last_domain_snapshot = last_executed_domain.lock().unwrap().clone();
            self.estimate_projection_for_steps(
                default_domain,
                &effective_routing_policy,
                &effective_security_policy,
                &lookup,
                &pending_step_ids,
                &active_snapshot,
                last_domain_snapshot,
            )
        };
        let projected_pending = match projected_pending_result {
            Ok(projection) => projection,
            Err(e) => {
                if let Some(security_err) = e.downcast_ref::<SecurityViolationError>() {
                    self.emit(ExecutionEvent::SecurityViolation {
                        step_id: security_err.step_id.clone(),
                        skill: security_err.skill.clone(),
                        action: security_err.action.clone(),
                        reason: security_err.reason.clone(),
                    });
                }
                return Err(e);
            }
        };
        self.ensure_projected_budget_headroom(projected_pending, &effective_budget)?;

        // Track memory output in order
        let memory_outputs: Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(Vec::new()));

        // Clone domain for async tasks
        let default_domain_arc = Arc::new(default_domain.to_string());
        let domain_registry = Arc::clone(&self.domain_registry);
        let routing_policy_arc = Arc::new(effective_routing_policy.clone());
        let security_policy_arc = Arc::new(effective_security_policy.clone());

        // Deterministic level-based execution
        loop {
            // Find ready nodes (in_degree == 0) that are NOT yet completed/failed/started
            let mut ready_nodes: Vec<String> = in_degree
                .iter()
                .filter(|item| *item.1 == 0)
                .map(|item| item.0.clone())
                .collect();

            // Sort for deterministic execution
            ready_nodes.sort();

            if ready_nodes.is_empty() {
                // Check if all steps are done
                let completed = completed_steps.lock().unwrap();
                let failed = failed_steps.lock().unwrap();
                let steps_count = steps_lookup.lock().unwrap().len();
                if completed.len() + failed.len() == steps_count {
                    self.emit(ExecutionEvent::WorkflowCompleted);
                    break;
                }
                // Cycle detected if not all done but no ready nodes
                return Err(anyhow!(
                    "Cycle detected in workflow dependencies or all steps finished"
                ));
            }

            for step_id in ready_nodes {
                // Remove from in_degree so it's not picked up again while running
                in_degree.remove(&step_id);

                // Emit scheduled and started events
                self.emit(ExecutionEvent::StepScheduled {
                    step_id: step_id.clone(),
                });
                self.emit(ExecutionEvent::StepStarted {
                    step_id: step_id.clone(),
                });
                let node_skill_name = steps_lookup
                    .lock()
                    .unwrap()
                    .get(&step_id)
                    .map(|step| step.skill.clone())
                    .unwrap_or_else(|| "<unknown-skill>".to_string());
                self.emit(ExecutionEvent::NodeStarted {
                    node_id: step_id.clone(),
                    skill_name: node_skill_name.clone(),
                });

                let result = execute_single_step_v2(
                    &step_id,
                    &steps_lookup,
                    &default_domain_arc,
                    &domain_registry,
                    &step_results,
                    &completed_steps,
                    &failed_steps,
                    &memory_outputs,
                    &base_ctx,
                    &self.accumulated_cost,
                    &self.accumulated_latency_ms,
                    &self.executed_steps,
                    &active_domains,
                    &last_executed_domain,
                    &routing_policy_arc,
                    &security_policy_arc,
                    &effective_permissions_by_step,
                    &self.in_process_backend,
                    &self.subprocess_backend,
                    &self.backend_type_by_step,
                    &self.trust_tier_by_step,
                    &self.isolation_mode_by_step,
                    &effective_budget,
                    &self.execution_traces,
                    &self.resource_usage_by_step,
                    &self.total_resource_usage,
                    &self.logical_clock_ms,
                )
                .await;

                // Get failure strategy
                let strategy = {
                    let lookup = steps_lookup.lock().unwrap();
                    lookup
                        .get(&step_id)
                        .map(|s| s.on_failure)
                        .unwrap_or(FailureStrategy::FailFast)
                };

                match result {
                    Ok(output) => {
                        // Mark completed (already done in execute_single_step_v2)
                        self.emit(ExecutionEvent::StepSucceeded {
                            step_id: step_id.clone(),
                        });
                        if let Some(node_trace) = self.latest_execution_trace_for(&step_id) {
                            self.emit(ExecutionEvent::NodeCompleted {
                                node_id: step_id.clone(),
                                skill_name: node_trace.skill_name.clone(),
                                success: true,
                                duration_ms: node_trace.duration_ms,
                                result_hash: node_trace.result_hash.clone(),
                            });
                        }
                        if let Some(usage) = self
                            .resource_usage_by_step
                            .lock()
                            .unwrap()
                            .get(&step_id)
                            .cloned()
                        {
                            self.emit(ExecutionEvent::ResourceUpdated {
                                node_id: step_id.clone(),
                                usage,
                                total_usage: self.get_total_resource_usage(),
                            });
                        }

                        // PHASE 14: Adaptive Re-Planning Trigger
                        if let SkillOutput::Boolean(false) = output {
                            if let (Some(goal_str), Some(target)) =
                                (&workflow.meta.goal, &workflow.meta.target_type)
                            {
                                println!("🔴 Adaptive Trigger: {} returned false. Re-planning for goal: {}", step_id, goal_str);

                                self.emit(ExecutionEvent::AdaptiveTrigger {
                                    step_id: step_id.clone(),
                                    result: "false".to_string(),
                                });

                                let p_goal = PlanningGoal {
                                    target_type: target.clone(),
                                    original_goal: goal_str.clone(),
                                };

                                let planner =
                                    DeterministicPlanner::new(Arc::clone(&self.domain_registry));

                                let mut context = base_ctx.clone();
                                {
                                    context.memory = step_results.lock().unwrap().clone();
                                    context.completed_steps =
                                        completed_steps.lock().unwrap().clone();
                                }

                                self.emit(ExecutionEvent::ReplanInitiated {
                                    goal: goal_str.clone(),
                                });

                                if let Ok(sub_workflow) = planner
                                    .plan_with_context_and_budget_and_routing_and_security(
                                        default_domain,
                                        &p_goal,
                                        &context,
                                        &effective_budget,
                                        &effective_routing_policy,
                                        &effective_security_policy,
                                    )
                                {
                                    println!(
                                        "⚡ Sub-plan synthesized with {} steps",
                                        sub_workflow.steps.len()
                                    );

                                    let mut injected_ids = Vec::new();
                                    let mut lookup = steps_lookup.lock().unwrap();

                                    // Inject steps with unique IDs
                                    for (i, mut new_step) in
                                        sub_workflow.steps.into_iter().enumerate()
                                    {
                                        let original_id = new_step.id.clone();
                                        new_step.id = format!("{}_retry_{}", step_id, i + 1);

                                        // Update dependencies in sub-workflow to point to new IDs
                                        // Simple linear case for DeterministicPlanner
                                        if i > 0 {
                                            new_step.depends_on =
                                                vec![format!("{}_retry_{}", step_id, i)];
                                            if new_step.input.contains(&original_id) {
                                                new_step.input = new_step
                                                    .input
                                                    .replace(&original_id, &new_step.id);
                                            }
                                        }

                                        let new_id = new_step.id.clone();
                                        injected_ids.push(new_id.clone());

                                        // Inject to lookup
                                        lookup.insert(new_id.clone(), new_step.clone());

                                        // Inject to graph and in_degree
                                        in_degree.insert(new_id.clone(), new_step.depends_on.len());
                                        for dep in &new_step.depends_on {
                                            adjacency
                                                .entry(dep.clone())
                                                .or_default()
                                                .push(new_id.clone());
                                        }
                                    }

                                    self.emit(ExecutionEvent::StepsInjected {
                                        step_ids: injected_ids,
                                    });
                                }
                            }
                        }
                    }
                    Err(e) => {
                        let error_text = e.to_string();
                        if let Some(node_trace) = self.latest_execution_trace_for(&step_id) {
                            self.emit(ExecutionEvent::NodeCompleted {
                                node_id: step_id.clone(),
                                skill_name: node_trace.skill_name.clone(),
                                success: false,
                                duration_ms: node_trace.duration_ms,
                                result_hash: node_trace.result_hash.clone(),
                            });
                        }
                        if let Some(usage) = self
                            .resource_usage_by_step
                            .lock()
                            .unwrap()
                            .get(&step_id)
                            .cloned()
                        {
                            self.emit(ExecutionEvent::ResourceUpdated {
                                node_id: step_id.clone(),
                                usage,
                                total_usage: self.get_total_resource_usage(),
                            });
                        }

                        if let Some(security_err) = e.downcast_ref::<SecurityViolationError>() {
                            self.emit(ExecutionEvent::SecurityViolation {
                                step_id: security_err.step_id.clone(),
                                skill: security_err.skill.clone(),
                                action: security_err.action.clone(),
                                reason: security_err.reason.clone(),
                            });
                        } else if error_text.contains("Security violation") {
                            let skill_ref = steps_lookup
                                .lock()
                                .unwrap()
                                .get(&step_id)
                                .map(|step| step.skill.clone())
                                .unwrap_or_else(|| "<unknown-skill>".to_string());
                            self.emit(ExecutionEvent::SecurityViolation {
                                step_id: step_id.clone(),
                                skill: skill_ref,
                                action: "unknown".to_string(),
                                reason: error_text.clone(),
                            });
                        }

                        if let Some(budget_err) = e.downcast_ref::<BudgetExceededError>() {
                            self.emit(ExecutionEvent::BudgetExceeded {
                                metric: budget_err.metric.to_string(),
                                limit: to_u32_saturated(budget_err.limit),
                                actual: to_u32_saturated(budget_err.actual),
                            });
                            return Err(anyhow!(budget_err.to_string()));
                        }
                        if let Some(exec_err) = e.downcast_ref::<ExecutionError>() {
                            match exec_err {
                                ExecutionError::ResourceLimitExceeded {
                                    metric,
                                    limit,
                                    actual,
                                } => {
                                    self.emit(ExecutionEvent::BudgetExceeded {
                                        metric: metric.to_string(),
                                        limit: to_u32_saturated(*limit),
                                        actual: to_u32_saturated(*actual),
                                    });
                                    return Err(anyhow!(exec_err.to_string()));
                                }
                            }
                        }

                        self.emit(ExecutionEvent::StepFailed {
                            step_id: step_id.clone(),
                            error: error_text.clone(),
                        });

                        if strategy == FailureStrategy::FailFast {
                            return Err(anyhow!("Step '{}' failed: {}", step_id, error_text));
                        }
                    }
                }

                // Node is done (either success, fail, or skip), remove from in_degree and update neighbors
                if let Some(neighbors) = adjacency.get(&step_id) {
                    for neighbor in neighbors {
                        if let Some(deg) = in_degree.get_mut(neighbor) {
                            *deg = deg.saturating_sub(1);
                        }
                    }
                }
            }

            // PERSIST SNAPSHOT after each batch
            if let Some(ref path) = snapshot_path {
                let lookup = steps_lookup.lock().unwrap();
                let active = active_domains.lock().unwrap();
                let snap = self.build_snapshot(
                    workflow.meta.name.clone(),
                    &*completed_steps.lock().unwrap(),
                    &*failed_steps.lock().unwrap(),
                    &*step_results.lock().unwrap(),
                    &in_degree,
                    sub_goals.clone(),
                    current_goal_index,
                    &effective_routing_policy,
                    &lookup,
                    default_domain,
                    &active,
                    last_executed_domain.lock().unwrap().clone(),
                    &effective_security_policy,
                    &effective_permissions_by_step.lock().unwrap(),
                );
                let json = serde_json::to_string_pretty(&snap)?;
                if let Err(e) = std::fs::write(path, json) {
                    eprintln!("Warning: Failed to save snapshot to {}: {}", path, e);
                }
            }
        }

        // Return accumulated memory
        let memory = memory_outputs.lock().unwrap().join("\n");
        Ok(memory)
    }

    pub async fn execute_goal(
        &self,
        domain: &str,
        goal: &str,
        initial_snapshot: Option<ExecutionSnapshot>,
        snapshot_path: Option<String>,
        limits: &AutonomyLimits,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<String> {
        self.emit(ExecutionEvent::WorkflowStarted {
            workflow: format!("autonomous-goal-{}", goal),
        });

        let mut resume_snapshot = initial_snapshot;

        // 1. Decompose or Resume
        let sub_goals = if let Some(ref snap) = resume_snapshot {
            snap.sub_goals.clone()
        } else {
            let decomposer = DeterministicDecomposer::new();
            let decomp = decomposer.decompose(goal);

            self.emit(ExecutionEvent::GoalDecomposed {
                objective: goal.to_string(),
                sub_goals: decomp.sub_goals.clone(),
            });

            decomp.sub_goals
        };

        if sub_goals.len() > limits.max_subgoals {
            return Err(anyhow!(
                "Goal decomposition exceeded max_subgoals ({})",
                limits.max_subgoals
            ));
        }

        let mut current_goal_index = resume_snapshot
            .as_ref()
            .map(|s| s.current_goal_index)
            .unwrap_or(0);
        let mut global_memory = String::new();
        let mut projected_total_cost: u32 = 0;
        let mut active_domains: HashSet<String> = resume_snapshot
            .as_ref()
            .map(|s| s.active_domains.iter().cloned().collect())
            .unwrap_or_default();
        let mut last_domain = resume_snapshot
            .as_ref()
            .and_then(|s| s.last_executed_domain.clone());

        // Sequential planning and execution per sub-goal
        while current_goal_index < sub_goals.len() {
            let sub_goal = &sub_goals[current_goal_index];
            println!(
                "🎯 Processing Sub-goal [{}/{}]: {}",
                current_goal_index + 1,
                sub_goals.len(),
                sub_goal
            );

            // 2. Plan for sub-goal
            let planner = Planner::new(Arc::clone(&self.domain_registry));
            let mut workflow = planner.plan(domain, sub_goal).await?;
            workflow.meta.routing_policy = Some(routing_policy.clone());
            workflow.meta.security_policy = Some(security_policy.clone());
            workflow.meta.resource_budget = Some(budget.resource_budget.clone());

            // 3. Remap Step IDs to prevent collisions across sub-goals
            let goal_prefix = format!("g{}_", current_goal_index + 1);
            let mut id_map = HashMap::new();

            for step in &mut workflow.steps {
                let old_id = step.id.clone();
                let new_id = format!("{}{}", goal_prefix, old_id);
                id_map.insert(old_id, new_id.clone());
                step.id = new_id;
            }

            // Update dependencies and inputs
            for step in &mut workflow.steps {
                let mut new_deps = Vec::new();
                for dep in &step.depends_on {
                    if let Some(new_id) = id_map.get(dep) {
                        new_deps.push(new_id.clone());
                    } else {
                        new_deps.push(dep.clone());
                    }
                }
                step.depends_on = new_deps;

                for (old_id, new_id) in &id_map {
                    let placeholder = format!("{{{{{}}}}}", old_id);
                    if step.input.contains(&placeholder) {
                        step.input = step
                            .input
                            .replace(&placeholder, &format!("{{{{{}}}}}", new_id));
                    }

                    if let Some(ref mut cond) = step.condition {
                        if cond.contains(&placeholder) {
                            *cond = cond.replace(&placeholder, &format!("{{{{{}}}}}", new_id));
                        }
                    }
                }
            }

            let projection = self.estimate_projection_for_workflow(
                domain,
                &routing_policy,
                &security_policy,
                &workflow,
                &active_domains,
                last_domain.clone(),
            )?;
            workflow.meta.projected_cost = Some(projection.cost);
            workflow.meta.projected_latency_ms = Some(projection.latency_ms);
            workflow.meta.projected_steps = Some(projection.steps);
            projected_total_cost = projected_total_cost.saturating_add(projection.cost);
            let mut projected_order = workflow.steps.clone();
            projected_order.sort_by(|a, b| a.id.cmp(&b.id));
            for step in projected_order {
                if let Ok((qualified, _)) = self
                    .domain_registry
                    .resolve_skill_reference(domain, &step.skill)
                {
                    active_domains.insert(qualified.domain.clone());
                    last_domain = Some(qualified.domain);
                }
            }

            // 4. Execute sub-workflow
            // Note: We use the same snapshot path so it persists progress
            let snapshot_for_sub_goal = match resume_snapshot.as_ref().map(|s| s.current_goal_index)
            {
                Some(saved_idx) if saved_idx == current_goal_index => resume_snapshot.take(),
                _ => None,
            };

            let sub_mem = self
                .execute_workflow(
                    &workflow,
                    snapshot_for_sub_goal,
                    snapshot_path.clone(),
                    sub_goals.clone(),
                    current_goal_index,
                    budget.clone(),
                    routing_policy.clone(),
                    security_policy.clone(),
                )
                .await?;

            if !global_memory.is_empty() {
                global_memory.push_str("\n");
            }
            global_memory.push_str(&sub_mem);

            current_goal_index += 1;
        }

        // 5. Reflect and Learn (Phase 16)
        let scorer = ReflectiveScorer::new(Arc::clone(&self.domain_registry));
        let trace = self.get_trace();
        let actual_total_cost = *self.accumulated_cost.lock().unwrap();
        let projected_cost = if projected_total_cost == 0 {
            actual_total_cost
        } else {
            projected_total_cost
        };

        println!("🧠 Reflecting on execution for goal: {}", goal);
        if let Ok(report) = scorer
            .reflect(
                goal,
                &trace,
                &global_memory,
                projected_cost,
                actual_total_cost,
                &budget,
            )
            .await
        {
            println!("📊 Reflection Score: {}/10", report.score);
            println!("📝 Rationale: {}", report.rationale);

            self.emit(ExecutionEvent::ReflectionCalculated {
                score: report.score,
                rationale: report.rationale.clone(),
            });

            // If success is high, learn from it
            if report.score >= 7 {
                let store = ExperienceStore::new(".agents/memory/experiences.json");
                let entry = ExperienceEntry {
                    objective: goal.to_string(),
                    sub_goals: sub_goals.clone(),
                    final_score: report.score,
                    actual_cost: actual_total_cost,
                };

                let _ = store.learn(entry);
                println!("💡 Saved successful pattern to Experience Store.");
            }
        }

        self.emit(ExecutionEvent::WorkflowCompleted);
        Ok(global_memory)
    }
}

async fn execute_single_step_v2(
    step_id: &str,
    steps_lookup: &Arc<Mutex<HashMap<String, crate::workflow::model::WorkflowStep>>>,
    default_domain: &str,
    domain_registry: &DomainRegistry,
    step_results: &Arc<Mutex<HashMap<String, SkillOutput>>>,
    completed_steps: &Arc<Mutex<HashSet<String>>>,
    failed_steps: &Arc<Mutex<HashSet<String>>>,
    memory_outputs: &Arc<Mutex<Vec<String>>>,
    base_ctx: &ExecutionContext,
    accumulated_cost: &Arc<Mutex<u32>>,
    accumulated_latency_ms: &Arc<Mutex<u32>>,
    executed_steps: &Arc<Mutex<usize>>,
    active_domains: &Arc<Mutex<HashSet<String>>>,
    last_executed_domain: &Arc<Mutex<Option<String>>>,
    routing_policy: &Arc<RoutingPolicy>,
    security_policy: &Arc<DomainSecurityPolicy>,
    effective_permissions_by_step: &Arc<Mutex<HashMap<String, CapabilityPermissions>>>,
    in_process_backend: &Arc<InProcessBackend>,
    subprocess_backend: &Arc<SubprocessBackend>,
    backend_type_by_step: &Arc<Mutex<HashMap<String, BackendType>>>,
    trust_tier_by_step: &Arc<Mutex<HashMap<String, TrustTier>>>,
    isolation_mode_by_step: &Arc<Mutex<HashMap<String, IsolationMode>>>,
    budget: &ExecutionBudget,
    execution_traces: &Arc<Mutex<Vec<ExecutionTrace>>>,
    resource_usage_by_step: &Arc<Mutex<HashMap<String, ResourceUsage>>>,
    total_resource_usage: &Arc<Mutex<ResourceUsage>>,
    logical_clock_ms: &Arc<Mutex<u64>>,
) -> Result<SkillOutput> {
    let step = {
        let lookup = steps_lookup.lock().unwrap();
        lookup
            .get(step_id)
            .cloned()
            .ok_or_else(|| anyhow!("Step not found: {}", step_id))?
    };

    let id = &step.id;
    let skill_name = &step.skill;
    let raw_input = &step.input;
    let condition = &step.condition;
    let retry_count = step.retry;

    // Evaluate condition if present
    if let Some(cond) = condition.as_ref() {
        let should_skip = {
            let results = step_results.lock().unwrap();
            evaluate_condition(cond, &results)?
        };
        if !should_skip {
            println!("⏭ Skipping step '{}' (condition false)", id);
            let (trace_backend_type, trace_isolation_mode, trace_trust_tier) =
                if let Ok((_qualified, skill)) =
                    domain_registry.resolve_skill_reference(default_domain, skill_name)
                {
                    let cap = skill.capability();
                    let (backend_type, isolation_mode) = backend_for_trust_tier(cap.trust_tier);
                    backend_type_by_step
                        .lock()
                        .unwrap()
                        .insert(id.clone(), backend_type);
                    trust_tier_by_step
                        .lock()
                        .unwrap()
                        .insert(id.clone(), cap.trust_tier);
                    isolation_mode_by_step
                        .lock()
                        .unwrap()
                        .insert(id.clone(), isolation_mode);
                    (backend_type, isolation_mode, cap.trust_tier)
                } else {
                    (
                        BackendType::InProcess,
                        IsolationMode::InProcess,
                        TrustTier::Trusted,
                    )
                };
            let skipped = SkillOutput::text("Skipped");
            {
                let mut res = step_results.lock().unwrap();
                res.insert(id.clone(), skipped.clone());
            }
            {
                let mut comp = completed_steps.lock().unwrap();
                comp.insert(id.clone());
            }
            let zero_usage = ResourceUsage::default();
            record_node_usage(
                id,
                &zero_usage,
                resource_usage_by_step,
                total_resource_usage,
            );
            let input = SkillInput::Text(raw_input.to_string());
            let permissions_used = CapabilityPermissions::none();
            let result_hash = hash_step_success(&input, &skipped, &permissions_used);
            let (start_time, end_time) = next_trace_window(logical_clock_ms, 0);
            record_node_trace(
                ExecutionTrace {
                    node_id: id.clone(),
                    skill_name: step.skill.clone(),
                    start_time,
                    end_time,
                    duration_ms: 0,
                    side_effect_class: SideEffectClass::Pure,
                    permissions_used,
                    result_hash,
                    backend_type: trace_backend_type,
                    trust_tier: trace_trust_tier,
                    isolation_mode: trace_isolation_mode,
                },
                execution_traces,
            );
            return Ok(skipped);
        }
    }

    // Resolve input injections
    let resolved_input = {
        let results = step_results.lock().unwrap();
        let comp = completed_steps.lock().unwrap();
        resolve_input(raw_input, &results, &comp)?
    };

    // Resolve skill and domain
    let (qualified, skill) = domain_registry.resolve_skill_reference(default_domain, skill_name)?;
    let canonical_skill_name = qualified.canonical_id();
    if !routing_policy.allows_domain(&qualified.domain) {
        return Err(anyhow!(
            "Skill '{}' uses disallowed domain '{}' under routing policy",
            qualified.canonical_id(),
            qualified.domain
        ));
    }

    // Phase 17: Budget Check
    let cap = skill.capability();
    if !security_policy.allows_declared_permissions(&cap.permissions) {
        let denied = security_policy.denied_declared_actions(&cap.permissions);
        return Err(SecurityViolationError::new(
            id,
            &canonical_skill_name,
            "permission_declaration",
            format!(
                "Declared permissions [{}] violate policy",
                denied.join(", ")
            ),
        )
        .into());
    }
    if !security_policy.allows_trust_tier(cap.trust_tier) {
        return Err(SecurityViolationError::new(
            id,
            &canonical_skill_name,
            "trust_tier",
            format!(
                "Skill trust tier '{:?}' exceeds policy max '{:?}'",
                cap.trust_tier, security_policy.max_trust_tier
            ),
        )
        .into());
    }
    let effective_permissions = security_policy.effective_permissions_for(&cap.permissions);
    {
        let mut permissions_map = effective_permissions_by_step.lock().unwrap();
        permissions_map.insert(id.clone(), effective_permissions);
    }
    {
        let mut active = active_domains.lock().unwrap();
        let mut last_domain = last_executed_domain.lock().unwrap();
        let is_new_domain = !active.contains(&qualified.domain);
        let is_transition = last_domain
            .as_ref()
            .map(|prev| prev != &qualified.domain)
            .unwrap_or(false);

        let mut additional_cost = cap.estimated_cost;
        if is_new_domain {
            additional_cost =
                additional_cost.saturating_add(routing_policy.domain_overhead(&qualified.domain));
        }
        if is_transition {
            additional_cost = additional_cost.saturating_add(routing_policy.cross_domain_penalty);
        }
        if security_policy.strict_mode && cap.side_effect_class == SideEffectClass::ExternalMutation
        {
            additional_cost =
                additional_cost.saturating_add(security_policy.external_mutation_penalty);
        }
        additional_cost = additional_cost.saturating_add(cap.trust_tier.isolation_penalty());

        let mut cost = accumulated_cost.lock().unwrap();
        let projected_cost = cost.saturating_add(additional_cost);
        if projected_cost > budget.max_total_cost {
            return Err(BudgetExceededError::new(
                "cost",
                u64::from(budget.max_total_cost),
                u64::from(projected_cost),
            )
            .into());
        }

        let mut latency = accumulated_latency_ms.lock().unwrap();
        let projected_latency = latency.saturating_add(cap.estimated_latency_ms);
        if projected_latency > budget.max_total_latency_ms {
            return Err(BudgetExceededError::new(
                "latency",
                u64::from(budget.max_total_latency_ms),
                u64::from(projected_latency),
            )
            .into());
        }

        let mut steps = executed_steps.lock().unwrap();
        let projected_steps = steps.saturating_add(1);
        if projected_steps > budget.max_steps {
            return Err(BudgetExceededError::new(
                "steps",
                u64::try_from(budget.max_steps).unwrap_or(u64::MAX),
                u64::try_from(projected_steps).unwrap_or(u64::MAX),
            )
            .into());
        }

        *cost = projected_cost;
        *latency = projected_latency;
        *steps = projected_steps;
        if is_new_domain {
            active.insert(qualified.domain.clone());
        }
        *last_domain = Some(qualified.domain.clone());
    }

    // Prepare context
    let mut ctx = base_ctx.clone();
    ctx.step_id = id.clone();
    ctx.skill_name = canonical_skill_name.clone();
    ctx.effective_permissions = effective_permissions;
    ctx.permissions_used = CapabilityPermissions::none();
    ctx.resource_budget = budget.resource_budget.clone();
    ctx.baseline_resource_usage = total_resource_usage.lock().unwrap().clone();
    ctx.resource_usage = ResourceUsage::default();
    {
        ctx.memory = step_results.lock().unwrap().clone();
        ctx.completed_steps = completed_steps.lock().unwrap().clone();
    }

    let (selected_backend_type, selected_isolation_mode) = backend_for_trust_tier(cap.trust_tier);
    {
        backend_type_by_step
            .lock()
            .unwrap()
            .insert(id.clone(), selected_backend_type);
        trust_tier_by_step
            .lock()
            .unwrap()
            .insert(id.clone(), cap.trust_tier);
        isolation_mode_by_step
            .lock()
            .unwrap()
            .insert(id.clone(), selected_isolation_mode);
    }

    // Execute with retry
    let max_retries = retry_count.unwrap_or(0);
    let mut last_err = None;
    let mut final_output: Option<SkillOutput> = None;
    let mut backend_type_for_trace = selected_backend_type;
    let mut isolation_mode_for_trace = selected_isolation_mode;

    for attempt in 0..=max_retries {
        if attempt > 0 {
            println!("🔄 Retrying step '{}' (attempt {})", id, attempt);
        }

        let attempt_started_at = Instant::now();
        let backend_result = match selected_backend_type {
            BackendType::InProcess => {
                in_process_backend
                    .execute(
                        &qualified.domain,
                        &canonical_skill_name,
                        Arc::clone(&skill),
                        resolved_input.clone(),
                        ctx.clone(),
                        security_policy.step_timeout_ms,
                        budget.resource_budget.max_memory_mb,
                    )
                    .await
            }
            BackendType::Subprocess => {
                subprocess_backend
                    .execute(
                        &qualified.domain,
                        &canonical_skill_name,
                        Arc::clone(&skill),
                        resolved_input.clone(),
                        ctx.clone(),
                        security_policy.step_timeout_ms,
                        budget.resource_budget.max_memory_mb,
                    )
                    .await
            }
        };
        let elapsed_ms =
            u64::try_from(attempt_started_at.elapsed().as_millis()).unwrap_or(u64::MAX);
        if let Err(err) = ctx.record_time_usage(elapsed_ms, elapsed_ms) {
            last_err = Some(err.into());
            break;
        }

        match backend_result {
            Ok(exec_result) => {
                ctx = exec_result.context;
                backend_type_for_trace = exec_result.backend_type;
                isolation_mode_for_trace = exec_result.isolation_mode;
                if exec_result.child_pid.is_some() {
                    ctx.permissions_used.allow_process_spawn = true;
                }
                let output = exec_result.output;

                {
                    let mut res = step_results.lock().unwrap();
                    res.insert(id.clone(), output.clone());
                }

                {
                    let mut mem = memory_outputs.lock().unwrap();
                    mem.push(output.as_text().unwrap_or_default().to_string());
                }

                {
                    let mut comp = completed_steps.lock().unwrap();
                    comp.insert(id.clone());
                }

                final_output = Some(output);
                break;
            }
            Err(e) => {
                if e.downcast_ref::<SecurityViolationError>().is_some() {
                    last_err = Some(e);
                    break;
                }
                if e.downcast_ref::<ExecutionError>().is_some() {
                    last_err = Some(e);
                    break;
                }
                last_err = Some(e);
            }
        };
    }

    let step_usage = ctx.resource_usage();
    record_node_usage(
        id,
        &step_usage,
        resource_usage_by_step,
        total_resource_usage,
    );
    let (start_time, end_time) = next_trace_window(logical_clock_ms, step_usage.wall_time_ms);
    let permissions_used = ctx.permissions_used();

    if let Some(output) = final_output {
        let result_hash = hash_step_success(&resolved_input, &output, &permissions_used);
        record_node_trace(
            ExecutionTrace {
                node_id: id.clone(),
                skill_name: canonical_skill_name,
                start_time,
                end_time,
                duration_ms: step_usage.wall_time_ms,
                side_effect_class: cap.side_effect_class,
                permissions_used,
                result_hash,
                backend_type: backend_type_for_trace,
                trust_tier: cap.trust_tier,
                isolation_mode: isolation_mode_for_trace,
            },
            execution_traces,
        );

        println!("✅ Step succeeded: {}", id);
        return Ok(output);
    }

    let final_err = last_err.unwrap_or_else(|| anyhow!("Unknown error"));
    let result_hash = hash_step_failure(&resolved_input, &final_err.to_string(), &permissions_used);
    record_node_trace(
        ExecutionTrace {
            node_id: id.clone(),
            skill_name: canonical_skill_name,
            start_time,
            end_time,
            duration_ms: step_usage.wall_time_ms,
            side_effect_class: cap.side_effect_class,
            permissions_used,
            result_hash,
            backend_type: backend_type_for_trace,
            trust_tier: cap.trust_tier,
            isolation_mode: isolation_mode_for_trace,
        },
        execution_traces,
    );

    {
        let mut fail = failed_steps.lock().unwrap();
        fail.insert(id.clone());
    }

    println!("❌ Step failed after {} attempts: {}", max_retries + 1, id);
    Err(final_err)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::backend::{BackendType, IsolationMode};
    use crate::engine::budget::ResourceBudget;
    use crate::engine::events::ExecutionEvent;
    use crate::engine::routing::RoutingPolicy;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::skill::capability::{
        CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
    };
    use crate::skill::io::SkillInput;
    use crate::skill::io::SkillOutput;
    use crate::skill::{Skill, SubprocessCommand};
    use crate::skills::is_positive::IsPositiveSkill;
    use crate::skills::parse_number::ParseNumberSkill;
    use crate::workflow::model::{Workflow, WorkflowMeta, WorkflowStep};
    use anyhow::{anyhow, Result};
    use async_trait::async_trait;
    use std::collections::HashMap;
    use tokio::time::{sleep, Duration};

    #[tokio::test]
    async fn snapshot_resume_mid_cross_domain_execution() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry.register_domain("utils");
        registry
            .register_skill("demo", Arc::new(ParseNumberSkill::new()))
            .unwrap();
        registry
            .register_skill("utils", Arc::new(IsPositiveSkill::new()))
            .unwrap();
        let registry = Arc::new(registry);
        let executor = Executor::new(Arc::clone(&registry));

        let mut s1 = WorkflowStep::new("s1", "demo.parse_number", "42");
        s1.depends_on = Vec::new();
        let mut s2 = WorkflowStep::new("s2", "utils.is_positive", "{{s1}}");
        s2.depends_on = vec!["s1".to_string()];
        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "cross-domain-resume".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::default()),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: Some(crate::engine::budget::ResourceBudget::default()),
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![s1, s2],
        };

        let mut step_results = HashMap::new();
        step_results.insert("s1".to_string(), SkillOutput::Number(42.0));
        let initial_snapshot = ExecutionSnapshot {
            workflow_name: workflow.meta.name.clone(),
            completed_steps: vec!["s1".to_string()],
            failed_steps: vec![],
            step_results,
            trace: vec![
                ExecutionEvent::StepScheduled {
                    step_id: "s1".to_string(),
                },
                ExecutionEvent::StepStarted {
                    step_id: "s1".to_string(),
                },
                ExecutionEvent::StepSucceeded {
                    step_id: "s1".to_string(),
                },
            ],
            execution_traces: vec![],
            pending_steps: vec!["s2".to_string()],
            sub_goals: vec![],
            current_goal_index: 0,
            accumulated_cost: 3,
            accumulated_latency_ms: 30,
            executed_steps: 1,
            active_domains: vec!["demo".to_string()],
            routing_policy: Some(RoutingPolicy::default()),
            qualified_skill_ids: HashMap::new(),
            last_executed_domain: Some("demo".to_string()),
            security_policy: Some(DomainSecurityPolicy::default()),
            effective_permissions_by_step: HashMap::new(),
            backend_type_by_step: HashMap::new(),
            trust_tier_by_step: HashMap::new(),
            isolation_mode_by_step: HashMap::new(),
            resource_usage_by_step: HashMap::new(),
            resource_usage_total: ResourceUsage::default(),
            execution_trace_hash: String::new(),
        };

        let mut policy = RoutingPolicy::default();
        policy.allowed_domains = Some(
            vec!["demo".to_string(), "utils".to_string()]
                .into_iter()
                .collect(),
        );
        policy.cross_domain_penalty = 2;

        executor
            .execute_workflow(
                &workflow,
                Some(initial_snapshot),
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                policy,
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap();

        let trace = executor.get_trace();
        let mut started_s1 = 0;
        let mut started_s2 = 0;
        for event in trace {
            if let ExecutionEvent::StepStarted { step_id } = event {
                if step_id == "s1" {
                    started_s1 += 1;
                } else if step_id == "s2" {
                    started_s2 += 1;
                }
            }
        }
        assert_eq!(started_s1, 1);
        assert_eq!(started_s2, 1);
    }

    struct FsWriteSkill;

    #[async_trait]
    impl Skill for FsWriteSkill {
        fn name(&self) -> &str {
            "fs_write"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                "fs_write",
                "Attempts fs write",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::new(false, true, false, false, false),
                SideEffectClass::ExternalMutation,
            )
        }

        async fn execute(
            &self,
            _input: SkillInput,
            ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            ctx.require_fs_write()?;
            Ok(SkillOutput::text("write-ok"))
        }
    }

    struct FsReadSkill;

    #[async_trait]
    impl Skill for FsReadSkill {
        fn name(&self) -> &str {
            "fs_read"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                "fs_read",
                "Requires fs read",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::new(true, false, false, false, false),
                SideEffectClass::Pure,
            )
        }

        async fn execute(
            &self,
            _input: SkillInput,
            ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            ctx.require_fs_read()?;
            Ok(SkillOutput::text("read-ok"))
        }
    }

    struct NetworkSkill;

    #[async_trait]
    impl Skill for NetworkSkill {
        fn name(&self) -> &str {
            "network"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                "network",
                "Requires network",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::new(false, false, true, false, false),
                SideEffectClass::Idempotent,
            )
        }

        async fn execute(
            &self,
            _input: SkillInput,
            ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            ctx.require_network()?;
            Ok(SkillOutput::text("network-ok"))
        }
    }

    struct TextEchoSkill;

    #[async_trait]
    impl Skill for TextEchoSkill {
        fn name(&self) -> &str {
            "text_echo"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                "text_echo",
                "Echo text for deterministic memory accumulation tests",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::none(),
                SideEffectClass::Pure,
            )
        }

        async fn execute(
            &self,
            input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            Ok(SkillOutput::text(
                input.as_text().unwrap_or_default().to_string(),
            ))
        }
    }

    fn one_step_workflow(name: &str, skill: &str) -> Workflow {
        Workflow {
            meta: WorkflowMeta {
                name: name.to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: Some(crate::engine::budget::ResourceBudget::default()),
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep::new("s1", skill, "input")],
        }
    }

    #[tokio::test]
    async fn phase3_linear_execution_accumulates_memory_deterministically() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(TextEchoSkill))
            .expect("register skill");
        let executor = Executor::new(Arc::new(registry));

        // Intentionally place steps in non-lexicographic order to assert deterministic sort.
        let step_z = WorkflowStep::new("z_step", "demo.text_echo", "z");
        let step_a = WorkflowStep::new("a_step", "demo.text_echo", "a");
        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "phase3-linear-deterministic".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: Some(ResourceBudget::default()),
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![step_z, step_a],
        };

        let memory = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect("execute workflow");

        assert_eq!(memory, "a\nz");
    }

    #[tokio::test]
    async fn security_violation_on_fs_write_without_permission() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(FsWriteSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("fs-write-blocked", "demo.fs_write");

        let policy = DomainSecurityPolicy {
            override_permissions: Some(CapabilityPermissions::new(true, false, true, true, true)),
            ..DomainSecurityPolicy::default()
        };

        let err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                policy,
            )
            .await
            .unwrap_err();

        let _ = err;
        let trace = executor.get_trace();
        assert!(trace
            .iter()
            .any(|event| matches!(event, ExecutionEvent::SecurityViolation { .. })));
    }

    #[tokio::test]
    async fn fs_read_only_permission_passes() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(FsReadSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("fs-read-pass", "demo.fs_read");

        let policy = DomainSecurityPolicy {
            override_permissions: Some(CapabilityPermissions::new(
                true, false, false, false, false,
            )),
            ..DomainSecurityPolicy::default()
        };

        let out = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                policy,
            )
            .await
            .unwrap();
        assert!(out.contains("read-ok"));
    }

    #[tokio::test]
    async fn domain_policy_network_disable_overrides_skill_permission() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(NetworkSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("network-blocked", "demo.network");

        let policy = DomainSecurityPolicy {
            override_permissions: Some(CapabilityPermissions::new(true, true, false, true, true)),
            ..DomainSecurityPolicy::default()
        };

        let _err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                policy,
            )
            .await
            .unwrap_err();
        let trace = executor.get_trace();
        assert!(trace
            .iter()
            .any(|event| matches!(event, ExecutionEvent::SecurityViolation { .. })));
    }

    #[tokio::test]
    async fn snapshot_resume_rejects_broader_security_policy() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(FsReadSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("resume-security", "demo.fs_read");

        let snapshot_policy = DomainSecurityPolicy {
            override_permissions: Some(CapabilityPermissions::new(
                true, false, false, false, false,
            )),
            strict_mode: true,
            ..DomainSecurityPolicy::default()
        };

        let snapshot = ExecutionSnapshot {
            workflow_name: workflow.meta.name.clone(),
            completed_steps: vec![],
            failed_steps: vec![],
            step_results: HashMap::new(),
            trace: vec![],
            execution_traces: vec![],
            pending_steps: vec!["s1".to_string()],
            sub_goals: vec![],
            current_goal_index: 0,
            accumulated_cost: 0,
            accumulated_latency_ms: 0,
            executed_steps: 0,
            active_domains: vec![],
            routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
            qualified_skill_ids: HashMap::new(),
            last_executed_domain: None,
            security_policy: Some(snapshot_policy),
            effective_permissions_by_step: HashMap::new(),
            backend_type_by_step: HashMap::new(),
            trust_tier_by_step: HashMap::new(),
            isolation_mode_by_step: HashMap::new(),
            resource_usage_by_step: HashMap::new(),
            resource_usage_total: ResourceUsage::default(),
            execution_trace_hash: String::new(),
        };

        let broader_policy = DomainSecurityPolicy {
            override_permissions: Some(CapabilityPermissions::all()),
            strict_mode: false,
            ..DomainSecurityPolicy::default()
        };

        let err = executor
            .execute_workflow(
                &workflow,
                Some(snapshot),
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                broader_policy,
            )
            .await
            .unwrap_err();
        assert!(err.to_string().contains("Security policy resume rejected"));
    }

    struct CpuHeavySkill;

    #[async_trait]
    impl Skill for CpuHeavySkill {
        fn name(&self) -> &str {
            "cpu_heavy"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                "cpu_heavy",
                "Simulates CPU-heavy work",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::none(),
                SideEffectClass::Pure,
            )
            .with_latency(5)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            sleep(Duration::from_millis(10)).await;
            Ok(SkillOutput::text("cpu-ok"))
        }
    }

    fn budget_with_resource_limits(resource_budget: ResourceBudget) -> ExecutionBudget {
        ExecutionBudget {
            max_total_cost: u32::MAX,
            max_total_latency_ms: u32::MAX,
            max_steps: usize::MAX,
            resource_budget,
        }
    }

    #[tokio::test]
    async fn cpu_budget_exceeded_fails_deterministically() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(CpuHeavySkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("cpu-budget", "demo.cpu_heavy");

        let err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                budget_with_resource_limits(ResourceBudget {
                    max_cpu_ms: 1,
                    max_wall_time_ms: u64::MAX,
                    max_fs_reads: u32::MAX,
                    max_fs_writes: u32::MAX,
                    max_network_calls: u32::MAX,
                    max_memory_mb: u32::MAX,
                }),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();

        assert!(err.to_string().contains("cpu_ms"));
        let trace = executor.get_trace();
        assert!(trace.iter().any(|event| {
            matches!(
                event,
                ExecutionEvent::BudgetExceeded { metric, .. } if metric == "cpu_ms"
            )
        }));
    }

    #[tokio::test]
    async fn network_call_limit_exceeded_is_blocked() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(NetworkSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("network-limit", "demo.network");

        let err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                budget_with_resource_limits(ResourceBudget {
                    max_cpu_ms: u64::MAX,
                    max_wall_time_ms: u64::MAX,
                    max_fs_reads: u32::MAX,
                    max_fs_writes: u32::MAX,
                    max_network_calls: 0,
                    max_memory_mb: u32::MAX,
                }),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();

        assert!(err.to_string().contains("network_calls"));
    }

    #[tokio::test]
    async fn resume_enforces_remaining_resource_budget() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(NetworkSkill))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("resume-resource-budget", "demo.network");

        let snapshot = ExecutionSnapshot {
            workflow_name: workflow.meta.name.clone(),
            completed_steps: vec![],
            failed_steps: vec![],
            step_results: HashMap::new(),
            trace: vec![],
            execution_traces: vec![],
            pending_steps: vec!["s1".to_string()],
            sub_goals: vec![],
            current_goal_index: 0,
            accumulated_cost: 0,
            accumulated_latency_ms: 0,
            executed_steps: 0,
            active_domains: vec!["demo".to_string()],
            routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
            qualified_skill_ids: HashMap::new(),
            last_executed_domain: Some("demo".to_string()),
            security_policy: Some(DomainSecurityPolicy::default()),
            effective_permissions_by_step: HashMap::new(),
            backend_type_by_step: HashMap::new(),
            trust_tier_by_step: HashMap::new(),
            isolation_mode_by_step: HashMap::new(),
            resource_usage_by_step: HashMap::new(),
            resource_usage_total: ResourceUsage {
                cpu_ms: 0,
                wall_time_ms: 0,
                fs_reads: 0,
                fs_writes: 0,
                network_calls: 1,
            },
            execution_trace_hash: String::new(),
        };

        let err = executor
            .execute_workflow(
                &workflow,
                Some(snapshot),
                None,
                vec![],
                0,
                budget_with_resource_limits(ResourceBudget {
                    max_cpu_ms: u64::MAX,
                    max_wall_time_ms: u64::MAX,
                    max_fs_reads: u32::MAX,
                    max_fs_writes: u32::MAX,
                    max_network_calls: 1,
                    max_memory_mb: u32::MAX,
                }),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();

        assert!(err.to_string().contains("network_calls"));
    }

    #[tokio::test]
    async fn identical_runs_produce_identical_trace_hash() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(crate::skills::echo::EchoSkill::new()))
            .unwrap();
        let registry = Arc::new(registry);

        let workflow = one_step_workflow("trace-hash", "demo.echo");
        let executor_1 = Executor::new(Arc::clone(&registry));
        let executor_2 = Executor::new(Arc::clone(&registry));

        executor_1
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap();

        executor_2
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap();

        let hash_1 = executor_1.execution_trace_hash();
        let hash_2 = executor_2.execution_trace_hash();
        assert!(!hash_1.is_empty());
        assert_eq!(hash_1, hash_2);
    }

    struct SubprocessScriptSkill {
        name: String,
        command: String,
        trust_tier: TrustTier,
    }

    impl SubprocessScriptSkill {
        fn new(name: &str, command: &str, trust_tier: TrustTier) -> Self {
            Self {
                name: name.to_string(),
                command: command.to_string(),
                trust_tier,
            }
        }
    }

    #[async_trait]
    impl Skill for SubprocessScriptSkill {
        fn name(&self) -> &str {
            &self.name
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                &self.name,
                "subprocess script skill",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::none(),
                SideEffectClass::Idempotent,
            )
            .with_trust_tier(self.trust_tier)
        }

        fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
            Some(SubprocessCommand {
                program: "/bin/sh".to_string(),
                args: vec!["-c".to_string(), self.command.clone()],
                stdin: None,
            })
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            Err(anyhow!("must run in subprocess backend"))
        }
    }

    #[tokio::test]
    async fn untrusted_skill_runs_in_subprocess() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(SubprocessScriptSkill::new(
                    "isolate_echo",
                    "cat",
                    TrustTier::Untrusted,
                )),
            )
            .unwrap();
        let executor = Executor::new(Arc::new(registry));

        let workflow = one_step_workflow("subprocess-untrusted", "demo.isolate_echo");
        let output = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap();

        assert!(output.contains("input"));
        let backend_map = executor.get_backend_type_by_step();
        assert_eq!(backend_map.get("s1"), Some(&BackendType::Subprocess));
    }

    #[tokio::test]
    async fn subprocess_crash_does_not_crash_executor() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(SubprocessScriptSkill::new(
                    "explode",
                    "kill -SEGV $$",
                    TrustTier::Untrusted,
                )),
            )
            .unwrap();
        registry
            .register_skill("demo", Arc::new(crate::skills::echo::EchoSkill::new()))
            .unwrap();
        let executor = Executor::new(Arc::new(registry));

        let crash_workflow = one_step_workflow("subprocess-crash", "demo.explode");
        let crash_err = executor
            .execute_workflow(
                &crash_workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();
        assert!(crash_err.to_string().contains("Subprocess"));

        let healthy_workflow = one_step_workflow("post-crash", "demo.echo");
        let healthy_output = executor
            .execute_workflow(
                &healthy_workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap();
        assert!(healthy_output.contains("input"));
    }

    #[tokio::test]
    async fn subprocess_memory_limit_exceeded_is_killed() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(SubprocessScriptSkill::new(
                    "memory-hog",
                    "sleep 1",
                    TrustTier::Untrusted,
                )),
            )
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("memory-limit", "demo.memory-hog");

        let err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                budget_with_resource_limits(ResourceBudget {
                    max_cpu_ms: u64::MAX,
                    max_wall_time_ms: u64::MAX,
                    max_fs_reads: u32::MAX,
                    max_fs_writes: u32::MAX,
                    max_network_calls: u32::MAX,
                    max_memory_mb: 0,
                }),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();

        assert!(err.to_string().contains("memory_mb"));
    }

    #[tokio::test]
    async fn subprocess_timeout_is_killed() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(SubprocessScriptSkill::new(
                    "slow",
                    "sleep 2",
                    TrustTier::Untrusted,
                )),
            )
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("subprocess-timeout", "demo.slow");
        let policy = DomainSecurityPolicy {
            step_timeout_ms: 50,
            ..DomainSecurityPolicy::default()
        };

        let err = executor
            .execute_workflow(
                &workflow,
                None,
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                policy,
            )
            .await
            .unwrap_err();
        assert!(err.to_string().contains("timeout"));
    }

    #[tokio::test]
    async fn resume_rejects_backend_consistency_downgrade() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(SubprocessScriptSkill::new(
                    "resume_untrusted",
                    "cat",
                    TrustTier::Untrusted,
                )),
            )
            .unwrap();
        let executor = Executor::new(Arc::new(registry));
        let workflow = one_step_workflow("resume-isolation", "demo.resume_untrusted");

        let mut backend_map = HashMap::new();
        backend_map.insert("s1".to_string(), BackendType::InProcess);
        let mut trust_map = HashMap::new();
        trust_map.insert("s1".to_string(), TrustTier::Trusted);
        let mut isolation_map = HashMap::new();
        isolation_map.insert("s1".to_string(), IsolationMode::InProcess);

        let snapshot = ExecutionSnapshot {
            workflow_name: workflow.meta.name.clone(),
            completed_steps: vec![],
            failed_steps: vec![],
            step_results: HashMap::new(),
            trace: vec![],
            execution_traces: vec![],
            pending_steps: vec!["s1".to_string()],
            sub_goals: vec![],
            current_goal_index: 0,
            accumulated_cost: 0,
            accumulated_latency_ms: 0,
            executed_steps: 0,
            active_domains: vec!["demo".to_string()],
            routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
            qualified_skill_ids: HashMap::new(),
            last_executed_domain: Some("demo".to_string()),
            security_policy: Some(DomainSecurityPolicy::default()),
            effective_permissions_by_step: HashMap::new(),
            backend_type_by_step: backend_map,
            trust_tier_by_step: trust_map,
            isolation_mode_by_step: isolation_map,
            resource_usage_by_step: HashMap::new(),
            resource_usage_total: ResourceUsage::default(),
            execution_trace_hash: String::new(),
        };

        let err = executor
            .execute_workflow(
                &workflow,
                Some(snapshot),
                None,
                vec![],
                0,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .unwrap_err();

        assert!(err.to_string().contains("Resume isolation mismatch"));
    }
}
