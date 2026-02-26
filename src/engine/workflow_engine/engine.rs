use crate::engine::budget::ExecutionBudget;
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::engine::workflow_engine::instance::{
    now_ms, StepExecutionStatus, WorkflowInstance, WorkflowInstanceStatus,
    WORKFLOW_INSTANCE_SCHEMA_VERSION,
};
use crate::engine::workflow_engine::state_store::WorkflowStateStore;
use crate::engine::workflow_engine::step_executor::StepExecutor;
use crate::workflow::loader::load_workflow;
use crate::workflow::model::{FailureStrategy, Workflow};
use anyhow::{anyhow, Result};
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::Arc;

pub struct ExecutionEngine {
    state_store: WorkflowStateStore,
    step_executor: StepExecutor,
}

impl ExecutionEngine {
    pub fn new(project_root: &str, domain_registry: Arc<DomainRegistry>) -> Result<Self> {
        Ok(Self {
            state_store: WorkflowStateStore::new(project_root)?,
            step_executor: StepExecutor::new(domain_registry),
        })
    }

    #[cfg(test)]
    pub fn state_store(&self) -> &WorkflowStateStore {
        &self.state_store
    }

    pub async fn run_new_workflow(
        &self,
        workflow: &Workflow,
        workflow_path: Option<String>,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<WorkflowInstance> {
        self.step_executor.validate_workflow(workflow)?;
        let mut instance = WorkflowInstance::new(workflow, workflow_path);
        self.state_store.save(&mut instance)?;
        self.run_instance(
            workflow,
            instance,
            budget,
            routing_policy,
            security_policy,
            false,
        )
        .await
    }

    pub async fn resume_workflow(
        &self,
        instance_id: &str,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<WorkflowInstance> {
        let mut instance = self.state_store.load(instance_id)?;
        if instance.schema != WORKFLOW_INSTANCE_SCHEMA_VERSION {
            return Err(anyhow!(
                "Unsupported workflow instance schema {} (expected {})",
                instance.schema,
                WORKFLOW_INSTANCE_SCHEMA_VERSION
            ));
        }
        let workflow_path = instance.workflow_path.clone().ok_or_else(|| {
            anyhow!(
                "Workflow instance '{}' has no workflow_path and cannot be resumed",
                instance_id
            )
        })?;
        let resolved_workflow_path = resolve_resume_workflow_path(&workflow_path)?;
        if resolved_workflow_path != workflow_path {
            instance.workflow_path = Some(resolved_workflow_path.clone());
            instance.record_trace(format!(
                "[{}] migrated workflow path '{}' -> '{}'",
                now_ms(),
                workflow_path,
                resolved_workflow_path
            ));
            self.state_store.save(&mut instance)?;
        }
        let workflow = load_workflow(&resolved_workflow_path)?;
        instance.ensure_trace_id(&workflow);
        self.step_executor.validate_workflow(&workflow)?;
        self.run_instance(
            &workflow,
            instance,
            budget,
            routing_policy,
            security_policy,
            true,
        )
        .await
    }

    async fn run_instance(
        &self,
        workflow: &Workflow,
        mut instance: WorkflowInstance,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
        is_resume: bool,
    ) -> Result<WorkflowInstance> {
        let _repo_lock = self.state_store.acquire_repo_lock()?;
        let _lock = self.state_store.acquire_lock(&instance.instance_id)?;
        self.state_store
            .clear_abort_request(&instance.instance_id)?;

        if is_resume {
            instance.record_trace(format!("[{}] resume requested", now_ms()));
        } else {
            instance.record_trace(format!("[{}] workflow started", now_ms()));
        }
        instance.status = WorkflowInstanceStatus::Running;
        self.state_store.save(&mut instance)?;

        let steps_by_id: HashMap<String, _> = workflow
            .steps
            .iter()
            .cloned()
            .map(|step| (step.id.clone(), step))
            .collect();
        let total_steps = workflow.steps.len();
        let mut completed: HashSet<String> = instance.completed_steps.iter().cloned().collect();
        let mut failed: HashSet<String> = instance.failed_steps.iter().cloned().collect();

        loop {
            if self.state_store.is_abort_requested(&instance.instance_id) {
                instance.status = WorkflowInstanceStatus::Aborted;
                instance.last_error = Some("Abort requested by operator".to_string());
                instance.record_trace(format!("[{}] abort requested", now_ms()));
                self.state_store.save(&mut instance)?;
                self.state_store
                    .clear_abort_request(&instance.instance_id)?;
                return Ok(instance);
            }

            let mut ready = Vec::new();
            for step in &workflow.steps {
                if completed.contains(&step.id) || failed.contains(&step.id) {
                    continue;
                }
                if step
                    .depends_on
                    .iter()
                    .all(|dep| completed.contains(dep) || failed.contains(dep))
                {
                    ready.push(step.id.clone());
                }
            }
            ready.sort();

            if ready.is_empty() {
                if completed.len() + failed.len() == total_steps {
                    if failed.is_empty() {
                        instance.status = WorkflowInstanceStatus::Completed;
                        instance.last_error = None;
                        instance.record_trace(format!(
                            "[{}] workflow completed successfully",
                            now_ms()
                        ));
                    } else {
                        instance.status = WorkflowInstanceStatus::Failed;
                        instance.last_error = Some(format!(
                            "{} step(s) failed under continue strategy",
                            failed.len()
                        ));
                        instance.record_trace(format!(
                            "[{}] workflow completed with {} failure(s)",
                            now_ms(),
                            failed.len()
                        ));
                    }
                    self.state_store.save(&mut instance)?;
                    return Ok(instance);
                }
                instance.status = WorkflowInstanceStatus::Failed;
                instance.last_error = Some(
                    "No ready steps available; possible cycle in dependency graph".to_string(),
                );
                self.state_store.save(&mut instance)?;
                return Err(anyhow!(
                    "No ready steps available; possible cycle in dependency graph"
                ));
            }

            for step_id in ready {
                let step = steps_by_id
                    .get(&step_id)
                    .ok_or_else(|| anyhow!("Unknown step '{}' in workflow", step_id))?;

                let state = instance.step_states.entry(step.id.clone()).or_default();
                state.status = StepExecutionStatus::Running;
                state.started_at_ms = Some(now_ms());
                state.finished_at_ms = None;
                state.duration_ms = None;
                state.last_error = None;
                state.failure_class = None;
                state.idempotent_short_circuit = false;
                state.context_injected_items = 0;
                state.estimated_cost_units = 0;
                state.actual_cost_usd = 0.0;
                state.input_tokens = 0;
                state.output_tokens = 0;
                state.total_tokens = 0;
                state.provider = None;
                state.model = None;
                state.call_attempts = 0;
                self.state_store.save(&mut instance)?;

                let result = self
                    .step_executor
                    .execute_step(
                        workflow,
                        step,
                        &instance,
                        &budget,
                        &routing_policy,
                        &security_policy,
                    )
                    .await;

                match result {
                    Ok(outcome) => {
                        let finished_at = now_ms();
                        let step_status = {
                            let state = instance.step_states.entry(step.id.clone()).or_default();
                            state.status = outcome.status.clone();
                            state.attempts = state.attempts.saturating_add(outcome.attempts);
                            state.retry_count = state.attempts.saturating_sub(1);
                            state.finished_at_ms = Some(finished_at);
                            state.duration_ms = state
                                .started_at_ms
                                .map(|started| finished_at.saturating_sub(started));
                            state.last_error = None;
                            state.failure_class = None;
                            state.idempotent_short_circuit = outcome.idempotent_short_circuit;
                            state.context_injected_items = outcome.context_injected_items;
                            state.estimated_cost_units = outcome.estimated_cost_units;
                            state.actual_cost_usd = outcome.actual_cost_usd;
                            state.input_tokens = outcome.input_tokens;
                            state.output_tokens = outcome.output_tokens;
                            state.total_tokens = outcome.total_tokens;
                            state.provider = outcome.provider.clone();
                            state.model = outcome.model.clone();
                            state.call_attempts = outcome.call_attempts;
                            state.status.clone()
                        };
                        instance.current_step = instance.current_step.saturating_add(1);

                        match outcome.status {
                            StepExecutionStatus::Succeeded | StepExecutionStatus::Skipped => {
                                instance
                                    .step_results
                                    .insert(step.id.clone(), outcome.output);
                                completed.insert(step.id.clone());
                                instance.mark_completed_step(&step.id);
                                instance.record_trace(format!(
                                    "[{}] step '{}' {:?} context_items={} cost_units={} cost_usd={:.6} tokens={} provider={} model={}",
                                    now_ms(),
                                    step.id,
                                    step_status,
                                    outcome.context_injected_items,
                                    outcome.estimated_cost_units,
                                    outcome.actual_cost_usd,
                                    outcome.total_tokens,
                                    outcome.provider.as_deref().unwrap_or("-"),
                                    outcome.model.as_deref().unwrap_or("-")
                                ));
                            }
                            _ => {}
                        }
                        self.state_store.save(&mut instance)?;
                    }
                    Err(err) => {
                        let err_text = err.to_string();
                        let finished_at = now_ms();
                        {
                            let state = instance.step_states.entry(step.id.clone()).or_default();
                            state.status = StepExecutionStatus::Failed;
                            state.attempts = state
                                .attempts
                                .saturating_add(step.retry.unwrap_or(0).saturating_add(1));
                            state.retry_count = state.attempts.saturating_sub(1);
                            state.finished_at_ms = Some(finished_at);
                            state.duration_ms = state
                                .started_at_ms
                                .map(|started| finished_at.saturating_sub(started));
                            state.last_error = Some(err_text.clone());
                            state.failure_class = Some(classify_step_failure(&err_text));
                            state.idempotent_short_circuit = false;
                            state.estimated_cost_units = state
                                .estimated_cost_units
                                .max(step.retry.unwrap_or(0).saturating_add(1));
                        }
                        failed.insert(step.id.clone());
                        instance.mark_failed_step(&step.id);
                        instance.last_error = Some(err_text.clone());
                        instance.record_trace(format!(
                            "[{}] step '{}' failed: {}",
                            now_ms(),
                            step.id,
                            err_text
                        ));
                        self.state_store.save(&mut instance)?;

                        if step.on_failure == FailureStrategy::FailFast {
                            instance.status = WorkflowInstanceStatus::Failed;
                            self.state_store.save(&mut instance)?;
                            return Err(anyhow!(
                                "Step '{}' failed with fail-fast strategy: {}",
                                step.id,
                                err_text
                            ));
                        }
                    }
                }
            }
        }
    }
}

fn resolve_resume_workflow_path(raw: &str) -> Result<String> {
    let path = PathBuf::from(raw);
    if path.exists() {
        return Ok(raw.to_string());
    }

    Err(anyhow!("Workflow path '{}' does not exist", raw))
}

fn classify_step_failure(err_text: &str) -> String {
    let lowered = err_text.to_ascii_lowercase();
    if lowered.contains("budget") || lowered.contains("exceed") {
        return "budget".to_string();
    }
    if lowered.contains("timed out") || lowered.contains("timeout") {
        return "timeout".to_string();
    }
    if lowered.contains("security violation")
        || lowered.contains("permission")
        || lowered.contains("trust tier")
    {
        return "security".to_string();
    }
    if lowered.contains("abort requested") {
        return "aborted".to_string();
    }
    "execution_error".to_string()
}

#[cfg(test)]
mod tests {
    use super::ExecutionEngine;
    use crate::engine::budget::ExecutionBudget;
    use crate::engine::context::ExecutionContext;
    use crate::engine::registry::DomainRegistry;
    use crate::engine::routing::RoutingPolicy;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::engine::workflow_engine::instance::{StepExecutionStatus, WorkflowInstanceStatus};
    use crate::skill::capability::{
        CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
    };
    use crate::skill::io::{SkillInput, SkillOutput};
    use crate::skill::Skill;
    use crate::skills::dev_workflow::WriteFileSkill;
    use crate::skills::echo::EchoSkill;
    use crate::workflow::model::{FailureStrategy, Workflow, WorkflowMeta, WorkflowStep};
    use anyhow::{anyhow, Result};
    use async_trait::async_trait;
    use serde_json::Value;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;

    fn temp_root(prefix: &str) -> std::path::PathBuf {
        let unique = format!(
            "{}-{}",
            prefix,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp root");
        root
    }

    fn sample_workflow() -> Workflow {
        Workflow {
            meta: WorkflowMeta {
                name: "v2-determinism".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                WorkflowStep {
                    id: "s1".to_string(),
                    skill: "demo.echo".to_string(),
                    input: "42".to_string(),
                    depends_on: Vec::new(),
                    condition: None,
                    retry: Some(0),
                    on_failure: FailureStrategy::FailFast,
                },
                WorkflowStep {
                    id: "s2".to_string(),
                    skill: "demo.echo".to_string(),
                    input: "{{s1}}".to_string(),
                    depends_on: vec!["s1".to_string()],
                    condition: None,
                    retry: Some(0),
                    on_failure: FailureStrategy::FailFast,
                },
            ],
        }
    }

    struct RetryOnceSkill {
        calls: Arc<AtomicUsize>,
    }

    #[async_trait]
    impl Skill for RetryOnceSkill {
        fn name(&self) -> &str {
            "retry_once"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "fails first attempt, succeeds next attempt",
                SkillIOType::Text,
                SkillIOType::Text,
                CapabilityPermissions::new(true, false, false, false, false),
                SideEffectClass::Pure,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let call = self.calls.fetch_add(1, Ordering::SeqCst);
            if call == 0 {
                return Err(anyhow!("forced failure on first attempt"));
            }
            Ok(SkillOutput::text("ok"))
        }
    }

    #[tokio::test]
    async fn deterministic_outputs_across_runs() {
        let root = temp_root("agentic-sdlc-v2-determinism");
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(EchoSkill::new()))
            .expect("register echo");

        let engine =
            ExecutionEngine::new(root.to_str().expect("path"), Arc::new(registry)).expect("engine");
        let workflow = sample_workflow();
        let budget = ExecutionBudget::default();
        let routing = RoutingPolicy::for_single_domain("demo");
        let security = DomainSecurityPolicy::default();

        let first = engine
            .run_new_workflow(
                &workflow,
                Some(root.join("w1.md").to_string_lossy().to_string()),
                budget.clone(),
                routing.clone(),
                security.clone(),
            )
            .await
            .expect("first run");
        let second = engine
            .run_new_workflow(
                &workflow,
                Some(root.join("w2.md").to_string_lossy().to_string()),
                budget,
                routing,
                security,
            )
            .await
            .expect("second run");
        assert_eq!(
            first.step_results.get("s1").and_then(|o| o.as_text()),
            second.step_results.get("s1").and_then(|o| o.as_text())
        );
        assert_eq!(
            first.step_results.get("s2").and_then(|o| o.as_text()),
            second.step_results.get("s2").and_then(|o| o.as_text())
        );
        assert_eq!(first.completed_steps, second.completed_steps);
        assert_eq!(first.trace_id, second.trace_id);
        assert!(!first.trace_id.is_empty());

        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn deterministic_ready_step_order_is_lexicographic() {
        let root = temp_root("agentic-sdlc-v2-ready-order");
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(EchoSkill::new()))
            .expect("register echo");
        let engine =
            ExecutionEngine::new(root.to_str().expect("path"), Arc::new(registry)).expect("engine");

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "ready-order".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                WorkflowStep::new("z_step", "demo.echo", "z"),
                WorkflowStep::new("a_step", "demo.echo", "a"),
                WorkflowStep::new("m_step", "demo.echo", "m"),
            ],
        };

        let instance = engine
            .run_new_workflow(
                &workflow,
                Some(root.join("ready-order.md").to_string_lossy().to_string()),
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect("run");
        assert_eq!(
            instance.completed_steps,
            vec![
                "a_step".to_string(),
                "m_step".to_string(),
                "z_step".to_string()
            ]
        );

        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn resume_reuses_idempotent_step_without_double_apply() {
        let root = temp_root("agentic-sdlc-v2-resume-idempotent");
        let workflow_path = root.join("resume-idempotent.md");
        let output_rel_path = format!(
            "local_tmp/idempotent-{}.txt",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let output_input = format!("{}:::deterministic", output_rel_path);
        std::fs::write(
            &workflow_path,
            format!(
                r#"
# Workflow: resume-idempotent
Domain: demo

## Step: write_once
Skill: demo.write_file
Input: {output_input}
"#
            ),
        )
        .expect("write workflow");

        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(WriteFileSkill))
            .expect("register write_file");
        let engine =
            ExecutionEngine::new(root.to_str().expect("path"), Arc::new(registry)).expect("engine");

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "resume-idempotent".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep::new(
                "write_once",
                "demo.write_file",
                &output_input,
            )],
        };

        let output_path = std::env::current_dir().expect("cwd").join(&output_rel_path);
        if let Some(parent) = output_path.parent() {
            std::fs::create_dir_all(parent).expect("create output dir");
        }
        std::fs::write(&output_path, "deterministic").expect("pre-apply side effect");

        let mut instance = crate::engine::workflow_engine::instance::WorkflowInstance::new(
            &workflow,
            Some(workflow_path.to_string_lossy().to_string()),
        );
        instance.status = WorkflowInstanceStatus::Running;
        if let Some(state) = instance.step_states.get_mut("write_once") {
            state.status = StepExecutionStatus::Running;
        }
        engine
            .state_store()
            .save(&mut instance)
            .expect("save crashed instance");

        let resumed = engine
            .resume_workflow(
                &instance.instance_id,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect("resume");
        assert_eq!(resumed.status, WorkflowInstanceStatus::Completed);
        let output = resumed
            .step_results
            .get("write_once")
            .cloned()
            .expect("write_once output");
        let status = match output {
            SkillOutput::Json(Value::Object(map)) => map
                .get("status")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            _ => String::new(),
        };
        assert_eq!(status, "already_written");
        let step_state = resumed.step_states.get("write_once").expect("step state");
        assert!(step_state.idempotent_short_circuit);
        assert_eq!(step_state.attempts, 0);
        assert_eq!(step_state.retry_count, 0);
        assert!(step_state.duration_ms.is_some());
        assert_eq!(
            std::fs::read_to_string(&output_path).expect("read file"),
            "deterministic"
        );

        let _ = std::fs::remove_file(output_path);
        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn retry_telemetry_records_attempt_and_retry_count() {
        let root = temp_root("agentic-sdlc-v2-retry-telemetry");
        let calls = Arc::new(AtomicUsize::new(0));
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(RetryOnceSkill {
                    calls: Arc::clone(&calls),
                }),
            )
            .expect("register retry_once");
        let engine =
            ExecutionEngine::new(root.to_str().expect("path"), Arc::new(registry)).expect("engine");
        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "retry-telemetry".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep {
                id: "retry_step".to_string(),
                skill: "demo.retry_once".to_string(),
                input: "x".to_string(),
                depends_on: Vec::new(),
                condition: None,
                retry: Some(1),
                on_failure: FailureStrategy::FailFast,
            }],
        };

        let instance = engine
            .run_new_workflow(
                &workflow,
                Some(root.join("retry.md").to_string_lossy().to_string()),
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect("run");

        let state = instance.step_states.get("retry_step").expect("state");
        assert_eq!(state.status, StepExecutionStatus::Succeeded);
        assert_eq!(state.attempts, 2);
        assert_eq!(state.retry_count, 1);
        assert!(!state.idempotent_short_circuit);
        assert!(state.duration_ms.is_some());
        assert!(state.failure_class.is_none());

        let _ = std::fs::remove_dir_all(root);
    }

    #[tokio::test]
    async fn resume_fails_when_workflow_path_is_missing() {
        let root = temp_root("agentic-sdlc-v2-resume-missing-workflow-path");
        let workflows_dir = root.join(".agents").join("workflows");
        std::fs::create_dir_all(&workflows_dir).expect("create workflows");
        let workflow_path = workflows_dir.join("existing.md");
        std::fs::write(
            &workflow_path,
            "# Workflow: existing\nSchema: antigrav.workflow@v1\nDomain: demo\n\n## Step: s1\nSkill: demo.echo\nInput: ok\n",
        )
        .expect("write workflow");

        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(EchoSkill::new()))
            .expect("register echo");
        let engine =
            ExecutionEngine::new(root.to_str().expect("path"), Arc::new(registry)).expect("engine");

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "missing-resume".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: Some(RoutingPolicy::for_single_domain("demo")),
                security_policy: Some(DomainSecurityPolicy::default()),
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep::new("s1", "demo.echo", "ok")],
        };
        let missing_path = root.join(".agents").join("workflows").join("missing.md");
        let mut instance = crate::engine::workflow_engine::instance::WorkflowInstance::new(
            &workflow,
            Some(missing_path.to_string_lossy().to_string()),
        );
        instance.status = WorkflowInstanceStatus::Running;
        engine
            .state_store()
            .save(&mut instance)
            .expect("save instance");

        let err = engine
            .resume_workflow(
                &instance.instance_id,
                ExecutionBudget::default(),
                RoutingPolicy::for_single_domain("demo"),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect_err("resume should fail");
        let msg = err.to_string();
        assert!(
            msg.contains("does not exist"),
            "expected missing path error, got: {}",
            msg
        );

        let _ = std::fs::remove_dir_all(root);
    }
}
