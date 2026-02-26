use crate::skill::io::SkillOutput;
use crate::workflow::model::Workflow;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub const WORKFLOW_INSTANCE_SCHEMA_VERSION: u32 = 1;
pub const ENGINE_TRACE_VERSION: &str = "1.0";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum WorkflowInstanceStatus {
    Pending,
    Running,
    Completed,
    Failed,
    Aborted,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum StepExecutionStatus {
    Pending,
    Running,
    Succeeded,
    Failed,
    Skipped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepExecutionState {
    pub status: StepExecutionStatus,
    pub attempts: u32,
    #[serde(default)]
    pub retry_count: u32,
    pub last_error: Option<String>,
    pub started_at_ms: Option<u64>,
    pub finished_at_ms: Option<u64>,
    #[serde(default)]
    pub duration_ms: Option<u64>,
    #[serde(default)]
    pub failure_class: Option<String>,
    #[serde(default)]
    pub idempotent_short_circuit: bool,
    #[serde(default)]
    pub context_injected_items: u32,
    #[serde(default)]
    pub estimated_cost_units: u32,
    #[serde(default)]
    pub actual_cost_usd: f64,
    #[serde(default)]
    pub input_tokens: u32,
    #[serde(default)]
    pub output_tokens: u32,
    #[serde(default)]
    pub total_tokens: u32,
    #[serde(default)]
    pub provider: Option<String>,
    #[serde(default)]
    pub model: Option<String>,
    #[serde(default)]
    pub call_attempts: u32,
}

impl Default for StepExecutionState {
    fn default() -> Self {
        Self {
            status: StepExecutionStatus::Pending,
            attempts: 0,
            retry_count: 0,
            last_error: None,
            started_at_ms: None,
            finished_at_ms: None,
            duration_ms: None,
            failure_class: None,
            idempotent_short_circuit: false,
            context_injected_items: 0,
            estimated_cost_units: 0,
            actual_cost_usd: 0.0,
            input_tokens: 0,
            output_tokens: 0,
            total_tokens: 0,
            provider: None,
            model: None,
            call_attempts: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowInstance {
    pub schema: u32,
    pub instance_id: String,
    #[serde(default)]
    pub trace_id: String,
    pub workflow_id: String,
    pub workflow_name: String,
    pub workflow_path: Option<String>,
    pub status: WorkflowInstanceStatus,
    pub current_step: usize,
    pub step_order: Vec<String>,
    pub completed_steps: Vec<String>,
    pub failed_steps: Vec<String>,
    pub step_states: HashMap<String, StepExecutionState>,
    pub step_results: HashMap<String, SkillOutput>,
    pub trace: Vec<String>,
    pub created_at_ms: u64,
    pub updated_at_ms: u64,
    pub last_error: Option<String>,
}

impl WorkflowInstance {
    pub fn new(workflow: &Workflow, workflow_path: Option<String>) -> Self {
        let now = now_ms();
        let instance_id = generate_instance_id(&workflow.meta.name);
        let trace_id = deterministic_trace_id(workflow);
        let mut step_states = HashMap::new();
        let mut step_order = Vec::new();
        for step in &workflow.steps {
            step_states.insert(step.id.clone(), StepExecutionState::default());
            step_order.push(step.id.clone());
        }

        Self {
            schema: WORKFLOW_INSTANCE_SCHEMA_VERSION,
            workflow_id: workflow.meta.name.clone(),
            workflow_name: workflow.meta.name.clone(),
            workflow_path,
            instance_id,
            trace_id,
            status: WorkflowInstanceStatus::Pending,
            current_step: 0,
            step_order,
            completed_steps: Vec::new(),
            failed_steps: Vec::new(),
            step_states,
            step_results: HashMap::new(),
            trace: Vec::new(),
            created_at_ms: now,
            updated_at_ms: now,
            last_error: None,
        }
    }

    pub fn touch(&mut self) {
        self.updated_at_ms = now_ms();
    }

    pub fn record_trace(&mut self, message: impl Into<String>) {
        self.trace.push(message.into());
        self.touch();
    }

    pub fn mark_completed_step(&mut self, step_id: &str) {
        if !self.completed_steps.iter().any(|s| s == step_id) {
            self.completed_steps.push(step_id.to_string());
        }
        self.failed_steps.retain(|s| s != step_id);
        self.touch();
    }

    pub fn mark_failed_step(&mut self, step_id: &str) {
        if !self.failed_steps.iter().any(|s| s == step_id) {
            self.failed_steps.push(step_id.to_string());
        }
        self.completed_steps.retain(|s| s != step_id);
        self.touch();
    }

    pub fn ensure_trace_id(&mut self, workflow: &Workflow) {
        if self.trace_id.trim().is_empty() {
            self.trace_id = deterministic_trace_id(workflow);
        }
    }
}

pub fn now_ms() -> u64 {
    let since_epoch = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_else(|_| std::time::Duration::from_millis(0));
    u64::try_from(since_epoch.as_millis()).unwrap_or(u64::MAX)
}

fn generate_instance_id(workflow_name: &str) -> String {
    let safe = workflow_name
        .chars()
        .map(|ch| match ch {
            'a'..='z' | '0'..='9' => ch,
            'A'..='Z' => ch.to_ascii_lowercase(),
            _ => '-',
        })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    let base = if safe.is_empty() {
        "workflow".to_string()
    } else {
        safe
    };
    format!("{}-{}-{}", base, now_ms(), std::process::id())
}

pub fn deterministic_trace_id(workflow: &Workflow) -> String {
    let mut lines = Vec::new();
    lines.push(format!("engine_trace_version={}", ENGINE_TRACE_VERSION));
    lines.push(format!("workflow_name={}", workflow.meta.name));
    lines.push(format!(
        "domain={}",
        workflow.meta.domain.clone().unwrap_or_default()
    ));
    lines.push(format!(
        "goal={}",
        workflow.meta.goal.clone().unwrap_or_default()
    ));
    lines.push(format!(
        "target_type={}",
        workflow.meta.target_type.clone().unwrap_or_default()
    ));
    lines.push(format!(
        "projected_cost={}",
        workflow.meta.projected_cost.unwrap_or(0)
    ));
    lines.push(format!(
        "projected_latency_ms={}",
        workflow.meta.projected_latency_ms.unwrap_or(0)
    ));
    lines.push(format!(
        "projected_steps={}",
        workflow.meta.projected_steps.unwrap_or(0)
    ));

    let mut sorted_steps = workflow.steps.clone();
    sorted_steps.sort_by(|a, b| a.id.cmp(&b.id));
    for step in sorted_steps {
        let mut deps = step.depends_on.clone();
        deps.sort();
        lines.push(format!(
            "step={} skill={} input={} depends_on={} condition={} retry={} on_failure={:?}",
            step.id,
            step.skill,
            step.input,
            deps.join(","),
            step.condition.unwrap_or_default(),
            step.retry.unwrap_or(0),
            step.on_failure
        ));
    }

    let payload = lines.join("\n");
    let hash = fnv1a64_hex(payload.as_bytes());
    format!("{}-{}", ENGINE_TRACE_VERSION.replace('.', ""), hash)
}

fn fnv1a64_hex(bytes: &[u8]) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for b in bytes {
        hash ^= u64::from(*b);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{:016x}", hash)
}
