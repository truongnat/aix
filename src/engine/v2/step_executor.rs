use crate::engine::budget::ExecutionBudget;
use crate::engine::condition::evaluate_condition;
use crate::engine::context::ExecutionContext;
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::{DomainSecurityPolicy, SecurityViolationError};
use crate::engine::v2::instance::{now_ms, StepExecutionStatus, WorkflowInstance};
use crate::engine::validator::WorkflowValidator;
use crate::skill::capability::CapabilityPermissions;
use crate::skill::io::SkillOutput;
use crate::workflow::model::{Workflow, WorkflowStep};
use anyhow::{anyhow, Result};
use std::collections::HashSet;
use std::sync::Arc;
use tokio::time::{sleep, timeout, Duration};

pub struct StepExecutionOutcome {
    pub output: SkillOutput,
    pub attempts: u32,
    pub status: StepExecutionStatus,
    pub idempotent_short_circuit: bool,
}

#[derive(Clone)]
pub struct StepExecutor {
    domain_registry: Arc<DomainRegistry>,
}

impl StepExecutor {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self { domain_registry }
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
                    return Ok(StepExecutionOutcome {
                        output,
                        attempts,
                        status: StepExecutionStatus::Succeeded,
                        idempotent_short_circuit: false,
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

#[cfg(test)]
mod tests {
    use super::StepExecutor;
    use crate::engine::budget::ExecutionBudget;
    use crate::engine::context::ExecutionContext;
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
}
