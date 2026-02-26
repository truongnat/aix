use crate::engine::budget::ExecutionBudget;
use crate::engine::condition::evaluate_condition;
use crate::engine::context::ExecutionContext;
use crate::engine::context_service::{ContextService, DeterministicContextService};
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::{DomainSecurityPolicy, SecurityViolationError};
use crate::engine::v2::instance::{now_ms, StepExecutionStatus, WorkflowInstance};
use crate::engine::validator::WorkflowValidator;
use crate::skill::capability::CapabilityPermissions;
use crate::skill::io::SkillOutput;
use crate::workflow::model::{Workflow, WorkflowStep};
use anyhow::{anyhow, Result};
use serde_json::Value;
use std::collections::HashSet;
use std::sync::Arc;
use tokio::time::{sleep, timeout, Duration};

pub struct StepExecutionOutcome {
    pub output: SkillOutput,
    pub attempts: u32,
    pub status: StepExecutionStatus,
    pub idempotent_short_circuit: bool,
    pub context_injected_items: u32,
    pub estimated_cost_units: u32,
    pub actual_cost_usd: f64,
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub total_tokens: u32,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub call_attempts: u32,
}

#[derive(Clone)]
pub struct StepExecutor {
    domain_registry: Arc<DomainRegistry>,
    context_service: Arc<dyn ContextService>,
}

impl StepExecutor {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self {
            domain_registry,
            context_service: Arc::new(DeterministicContextService::default()),
        }
    }

    #[cfg(test)]
    pub fn with_context_service(
        domain_registry: Arc<DomainRegistry>,
        context_service: Arc<dyn ContextService>,
    ) -> Self {
        Self {
            domain_registry,
            context_service,
        }
    }

    pub fn validate_workflow(&self, workflow: &Workflow) -> Result<()> {
        let validator = WorkflowValidator::new(&self.domain_registry);
        validator.validate(workflow)
    }

    pub async fn execute_step(
        &self,
        workflow: &Workflow,
        step: &WorkflowStep,
        instance: &WorkflowInstance,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Result<StepExecutionOutcome> {
        let default_domain = workflow
            .meta
            .domain
            .as_deref()
            .ok_or_else(|| anyhow!("Workflow '{}' has no domain", workflow.meta.name))?;
        let completed_set: HashSet<String> = instance.completed_steps.iter().cloned().collect();

        if let Some(cond) = step.condition.as_deref() {
            let should_run = evaluate_condition(cond, &instance.step_results)?;
            if !should_run {
                return Ok(StepExecutionOutcome {
                    output: SkillOutput::text("Skipped"),
                    attempts: 0,
                    status: StepExecutionStatus::Skipped,
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
                });
            }
        }

        let (qualified, skill) = self
            .domain_registry
            .resolve_skill_reference(default_domain, &step.skill)?;
        let capability = skill.capability();
        if !routing_policy.allows_domain(&qualified.domain) {
            return Err(anyhow!(
                "Step '{}' uses disallowed domain '{}'",
                step.id,
                qualified.domain
            ));
        }
        if !security_policy.allows_declared_permissions(&capability.permissions) {
            let denied = security_policy.denied_declared_actions(&capability.permissions);
            return Err(SecurityViolationError::new(
                &step.id,
                &qualified.canonical_id(),
                "permission_declaration",
                format!(
                    "Declared permissions [{}] violate security policy",
                    denied.join(", ")
                ),
            )
            .into());
        }
        if !security_policy.allows_trust_tier(capability.trust_tier) {
            return Err(SecurityViolationError::new(
                &step.id,
                &qualified.canonical_id(),
                "trust_tier",
                format!(
                    "Skill trust tier '{:?}' exceeds policy max '{:?}'",
                    capability.trust_tier, security_policy.max_trust_tier
                ),
            )
            .into());
        }

        let effective_permissions =
            security_policy.effective_permissions_for(&capability.permissions);
        let resolved_input = crate::engine::resolver::resolve_input(
            &step.input,
            &instance.step_results,
            &completed_set,
        )?;
        let injected = self.context_service.inject(
            workflow,
            step,
            instance,
            &qualified.canonical_id(),
            resolved_input,
        )?;
        let context_injected_items = injected.injected_items;
        let resolved_input = injected.input;
        if skill.is_idempotent() {
            let mut probe_ctx = self.build_context(
                workflow,
                step,
                instance,
                &qualified.canonical_id(),
                effective_permissions,
                budget,
            );
            if let Ok(Some(output)) = skill
                .detect_already_applied(&resolved_input, &mut probe_ctx)
                .await
            {
                return Ok(StepExecutionOutcome {
                    output,
                    attempts: 0,
                    status: StepExecutionStatus::Succeeded,
                    idempotent_short_circuit: true,
                    context_injected_items,
                    estimated_cost_units: 0,
                    actual_cost_usd: 0.0,
                    input_tokens: 0,
                    output_tokens: 0,
                    total_tokens: 0,
                    provider: None,
                    model: None,
                    call_attempts: 0,
                });
            }
        }

        let max_retries = step.retry.unwrap_or(0);
        let mut attempts = 0_u32;
        let mut last_err = None;

        for attempt in 0..=max_retries {
            attempts = attempts.saturating_add(1);
            let mut ctx = self.build_context(
                workflow,
                step,
                instance,
                &qualified.canonical_id(),
                effective_permissions,
                budget,
            );
            let timeout_ms = security_policy.step_timeout_ms;
            let started = now_ms();
            let result = timeout(
                Duration::from_millis(timeout_ms),
                skill.execute(resolved_input.clone(), &mut ctx),
            )
            .await;
            match result {
                Ok(Ok(output)) => {
                    let _ = ctx.record_time_usage(now_ms().saturating_sub(started), 0);
                    let telemetry = extract_output_telemetry(&output);
                    return Ok(StepExecutionOutcome {
                        output,
                        attempts,
                        status: StepExecutionStatus::Succeeded,
                        idempotent_short_circuit: false,
                        context_injected_items,
                        estimated_cost_units: capability.estimated_cost.saturating_mul(attempts),
                        actual_cost_usd: telemetry.actual_cost_usd,
                        input_tokens: telemetry.input_tokens,
                        output_tokens: telemetry.output_tokens,
                        total_tokens: telemetry.total_tokens,
                        provider: telemetry.provider,
                        model: telemetry.model,
                        call_attempts: telemetry.call_attempts.unwrap_or(attempts),
                    });
                }
                Ok(Err(err)) => {
                    if err.downcast_ref::<SecurityViolationError>().is_some() {
                        return Err(err);
                    }
                    last_err = Some(err);
                }
                Err(_) => {
                    last_err = Some(anyhow!(
                        "Step '{}' timed out after {}ms",
                        step.id,
                        timeout_ms
                    ));
                }
            }

            if attempt < max_retries {
                let shift = attempt.min(6);
                let backoff = 100_u64.saturating_mul(1_u64 << shift);
                sleep(Duration::from_millis(backoff)).await;
            }
        }

        Err(last_err.unwrap_or_else(|| anyhow!("Step '{}' failed", step.id)))
    }

    fn build_context(
        &self,
        workflow: &Workflow,
        step: &WorkflowStep,
        instance: &WorkflowInstance,
        qualified_skill_name: &str,
        effective_permissions: CapabilityPermissions,
        budget: &ExecutionBudget,
    ) -> ExecutionContext {
        let mut ctx = ExecutionContext {
            workflow_name: workflow.meta.name.clone(),
            step_id: step.id.clone(),
            skill_name: qualified_skill_name.to_string(),
            memory: instance.step_results.clone(),
            completed_steps: instance.completed_steps.iter().cloned().collect(),
            effective_permissions,
            permissions_used: CapabilityPermissions::none(),
            resource_budget: budget.resource_budget.clone(),
            baseline_resource_usage: Default::default(),
            resource_usage: Default::default(),
        };
        if !ctx.memory.contains_key(&step.id) {
            ctx.memory
                .insert(step.id.clone(), SkillOutput::text("pending"));
        }
        ctx
    }
}

#[derive(Debug, Default)]
struct OutputTelemetry {
    actual_cost_usd: f64,
    input_tokens: u32,
    output_tokens: u32,
    total_tokens: u32,
    provider: Option<String>,
    model: Option<String>,
    call_attempts: Option<u32>,
}

fn extract_output_telemetry(output: &SkillOutput) -> OutputTelemetry {
    let SkillOutput::Json(value) = output else {
        return OutputTelemetry::default();
    };
    let mut telemetry = OutputTelemetry::default();
    telemetry.provider = value
        .get("provider")
        .and_then(Value::as_str)
        .map(|v| v.to_string());
    telemetry.model = value
        .get("model")
        .and_then(Value::as_str)
        .map(|v| v.to_string());
    telemetry.call_attempts = value
        .get("router")
        .and_then(|v| v.get("attempts"))
        .and_then(Value::as_u64)
        .and_then(|v| u32::try_from(v).ok());
    telemetry.actual_cost_usd = value
        .get("cost")
        .and_then(|v| v.get("estimated_usd"))
        .and_then(Value::as_f64)
        .unwrap_or(0.0_f64);
    telemetry.input_tokens = value
        .get("usage")
        .and_then(|v| v.get("input_tokens"))
        .and_then(Value::as_u64)
        .and_then(|v| u32::try_from(v).ok())
        .unwrap_or(0);
    telemetry.output_tokens = value
        .get("usage")
        .and_then(|v| v.get("output_tokens"))
        .and_then(Value::as_u64)
        .and_then(|v| u32::try_from(v).ok())
        .unwrap_or(0);
    telemetry.total_tokens = value
        .get("usage")
        .and_then(|v| v.get("total_tokens"))
        .and_then(Value::as_u64)
        .and_then(|v| u32::try_from(v).ok())
        .unwrap_or(
            telemetry
                .input_tokens
                .saturating_add(telemetry.output_tokens),
        );
    telemetry
}

#[cfg(test)]
mod tests {
    use super::StepExecutor;
    use crate::engine::budget::ExecutionBudget;
    use crate::engine::context::ExecutionContext;
    use crate::engine::context_service::{ContextInjectionResult, ContextService};
    use crate::engine::registry::DomainRegistry;
    use crate::engine::routing::RoutingPolicy;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::engine::v2::instance::WorkflowInstance;
    use crate::skill::capability::{
        CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
    };
    use crate::skill::io::{SkillInput, SkillOutput};
    use crate::skill::Skill;
    use crate::workflow::model::{FailureStrategy, Workflow, WorkflowMeta, WorkflowStep};
    use anyhow::{anyhow, Result};
    use async_trait::async_trait;
    use std::collections::HashMap;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;

    struct RetrySkill {
        fail_times: usize,
        calls: Arc<AtomicUsize>,
    }

    #[async_trait]
    impl Skill for RetrySkill {
        fn name(&self) -> &str {
            "retry"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "fails then succeeds",
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
            if call < self.fail_times {
                return Err(anyhow!("forced failure"));
            }
            Ok(SkillOutput::text("ok"))
        }
    }

    #[derive(Default)]
    struct CountingContextService {
        calls: AtomicUsize,
    }

    impl CountingContextService {
        fn call_count(&self) -> usize {
            self.calls.load(Ordering::SeqCst)
        }
    }

    impl ContextService for CountingContextService {
        fn inject(
            &self,
            _workflow: &Workflow,
            _step: &WorkflowStep,
            _instance: &WorkflowInstance,
            _qualified_skill_name: &str,
            input: SkillInput,
        ) -> Result<ContextInjectionResult> {
            self.calls.fetch_add(1, Ordering::SeqCst);
            Ok(ContextInjectionResult {
                input,
                injected_items: 1,
            })
        }
    }

    #[tokio::test]
    async fn retries_until_success() {
        let calls = Arc::new(AtomicUsize::new(0));
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(RetrySkill {
                    fail_times: 2,
                    calls: Arc::clone(&calls),
                }),
            )
            .expect("register");
        let executor = StepExecutor::new(Arc::new(registry));

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "retry".to_string(),
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
                id: "s1".to_string(),
                skill: "demo.retry".to_string(),
                input: "x".to_string(),
                depends_on: Vec::new(),
                condition: None,
                retry: Some(2),
                on_failure: FailureStrategy::FailFast,
            }],
        };
        let instance = WorkflowInstance::new(&workflow, None);
        let out = executor
            .execute_step(
                &workflow,
                &workflow.steps[0],
                &instance,
                &ExecutionBudget::default(),
                &RoutingPolicy::for_single_domain("demo"),
                &DomainSecurityPolicy::default(),
            )
            .await
            .expect("step success");
        assert_eq!(
            out.status,
            crate::engine::v2::instance::StepExecutionStatus::Succeeded
        );
        assert_eq!(out.attempts, 3);
    }

    #[tokio::test]
    async fn uses_custom_context_service_when_configured() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("demo");
        registry
            .register_skill(
                "demo",
                Arc::new(RetrySkill {
                    fail_times: 0,
                    calls: Arc::new(AtomicUsize::new(0)),
                }),
            )
            .expect("register");

        let context_service = Arc::new(CountingContextService::default());
        let context_service_dyn: Arc<dyn ContextService> = context_service.clone();
        let executor = StepExecutor::with_context_service(Arc::new(registry), context_service_dyn);

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "ctx".to_string(),
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
                id: "s1".to_string(),
                skill: "demo.retry".to_string(),
                input: "payload".to_string(),
                depends_on: Vec::new(),
                condition: None,
                retry: None,
                on_failure: FailureStrategy::FailFast,
            }],
        };

        let mut instance = WorkflowInstance::new(&workflow, None);
        instance.step_results = HashMap::new();

        let out = executor
            .execute_step(
                &workflow,
                &workflow.steps[0],
                &instance,
                &ExecutionBudget::default(),
                &RoutingPolicy::for_single_domain("demo"),
                &DomainSecurityPolicy::default(),
            )
            .await
            .expect("step success");

        assert_eq!(out.context_injected_items, 1);
        assert_eq!(context_service.call_count(), 1);
    }
}
