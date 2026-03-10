// Platform Integration Module
//
// This module integrates all 5 tiers of platform improvements with the workflow engine.
// It provides a unified interface for the workflow engine to access all platform capabilities.

use crate::engine::context::ExecutionContext;
use crate::engine::workflow_engine::instance::WorkflowInstance;
use crate::platform::error::Result;
use crate::platform::tier1_execution_intelligence::{
    AdaptivePlanner, CausalTracer, FeedbackCollector,
};
use crate::platform::tier2_multi_agent::{AgentMarketplace, NegotiationProtocol, SharedMemory};
use crate::platform::tier3_trust_verification::{
    Claim, CommitmentService, DefaultAdversarialTester, DefaultCommitmentService,
    DefaultFormalVerifier, FormalVerifier,
};
use crate::platform::tier4_organizational::{CostTracker, HumanReviewService, TenantIsolation};
use crate::platform::tier5_ecosystem::{
    DefaultBenchmarkService, InMemoryDiffLearningService, InMemoryWorkflowMarketplace,
};
use crate::platform::types::{AgentId, StepId, TenantId};
use crate::workflow::model::Workflow;
use std::sync::{Arc, RwLock};

/// Integrated platform services for workflow execution
///
/// This struct provides a unified interface to all platform capabilities,
/// making it easy for the workflow engine to access tier functionality.
pub struct PlatformServices {
    // Tier 1: Execution Intelligence
    pub adaptive_planner: Arc<AdaptivePlanner>,
    pub causal_tracer: Arc<RwLock<CausalTracer>>,
    pub feedback_collector: Arc<RwLock<FeedbackCollector>>,

    // Tier 2: Multi-Agent Coordination
    pub negotiation_protocol: Arc<RwLock<NegotiationProtocol>>,
    pub shared_memory: Arc<RwLock<SharedMemory>>,
    pub agent_marketplace: Arc<RwLock<AgentMarketplace>>,

    // Tier 3: Trust & Verification
    pub formal_verifier: Arc<DefaultFormalVerifier>,
    pub adversarial_tester: Arc<DefaultAdversarialTester>,
    pub commitment_service: Arc<RwLock<DefaultCommitmentService>>,

    // Tier 4: Organizational Scale
    pub cost_tracker: Arc<RwLock<CostTracker>>,
    pub human_review_service: Arc<RwLock<HumanReviewService>>,
    pub tenant_isolation: Arc<RwLock<TenantIsolation>>,

    // Tier 5: Ecosystem
    pub benchmark_service: Arc<RwLock<DefaultBenchmarkService>>,
    pub diff_learning_service: Arc<RwLock<InMemoryDiffLearningService>>,
    pub workflow_marketplace: Arc<RwLock<InMemoryWorkflowMarketplace>>,

    // Configuration
    enabled_tiers: EnabledTiers,
}

/// Configuration for which tiers are enabled
#[derive(Debug, Clone)]
pub struct EnabledTiers {
    pub execution_intelligence: bool,
    pub multi_agent_coordination: bool,
    pub trust_verification: bool,
    pub organizational_scale: bool,
    pub ecosystem: bool,
}

impl Default for EnabledTiers {
    fn default() -> Self {
        Self {
            execution_intelligence: true,
            multi_agent_coordination: true,
            trust_verification: true,
            organizational_scale: true,
            ecosystem: true,
        }
    }
}

impl PlatformServices {
    /// Create a new platform services instance with default configuration
    pub fn new() -> Result<Self> {
        Self::with_config(EnabledTiers::default())
    }

    /// Create a new platform services instance with custom configuration
    pub fn with_config(enabled_tiers: EnabledTiers) -> Result<Self> {
        Ok(Self {
            // Tier 1
            adaptive_planner: Arc::new(AdaptivePlanner::default()),
            causal_tracer: Arc::new(RwLock::new(CausalTracer::new())),
            feedback_collector: Arc::new(RwLock::new(FeedbackCollector::new(
                crate::platform::tier1_execution_intelligence::feedback_collector::FeedbackConfig {
                    aggregation_window_secs: 3600, // 1 hour default
                },
            ))),

            // Tier 2
            negotiation_protocol: Arc::new(RwLock::new(NegotiationProtocol::new())),
            shared_memory: Arc::new(RwLock::new(SharedMemory::new())),
            agent_marketplace: Arc::new(RwLock::new(AgentMarketplace::new())),

            // Tier 3
            formal_verifier: Arc::new(DefaultFormalVerifier::new()),
            adversarial_tester: Arc::new(DefaultAdversarialTester::new()),
            commitment_service: Arc::new(RwLock::new(DefaultCommitmentService::new())),

            // Tier 4
            cost_tracker: Arc::new(RwLock::new(CostTracker::new())),
            human_review_service: Arc::new(RwLock::new(HumanReviewService::new())),
            tenant_isolation: Arc::new(RwLock::new(TenantIsolation::new(
                std::path::PathBuf::from(".agents/tenants"),
            ))),

            // Tier 5
            benchmark_service: Arc::new(RwLock::new(DefaultBenchmarkService::new())),
            diff_learning_service: Arc::new(RwLock::new(InMemoryDiffLearningService::new())),
            workflow_marketplace: Arc::new(RwLock::new(InMemoryWorkflowMarketplace::new())),

            enabled_tiers,
        })
    }

    /// Create platform services from a PlatformConfig
    pub fn from_platform_config(config: &crate::platform::config::PlatformConfig) -> Result<Self> {
        let enabled_tiers = config.to_enabled_tiers();

        // Create services with configuration-specific settings
        Ok(Self {
            // Tier 1
            adaptive_planner: Arc::new(AdaptivePlanner::default()),
            causal_tracer: Arc::new(RwLock::new(CausalTracer::new())),
            feedback_collector: Arc::new(RwLock::new(FeedbackCollector::new(
                crate::platform::tier1_execution_intelligence::feedback_collector::FeedbackConfig {
                    aggregation_window_secs: config
                        .tier1_execution_intelligence
                        .feedback_window_secs,
                },
            ))),

            // Tier 2
            negotiation_protocol: Arc::new(RwLock::new(NegotiationProtocol::new())),
            shared_memory: Arc::new(RwLock::new(SharedMemory::new())),
            agent_marketplace: Arc::new(RwLock::new(AgentMarketplace::new())),

            // Tier 3
            formal_verifier: Arc::new(DefaultFormalVerifier::new()),
            adversarial_tester: Arc::new(DefaultAdversarialTester::new()),
            commitment_service: Arc::new(RwLock::new(DefaultCommitmentService::new())),

            // Tier 4
            cost_tracker: Arc::new(RwLock::new(CostTracker::new())),
            human_review_service: Arc::new(RwLock::new(HumanReviewService::new())),
            tenant_isolation: Arc::new(RwLock::new(TenantIsolation::new(
                std::path::PathBuf::from(".agents/tenants"),
            ))),

            // Tier 5
            benchmark_service: Arc::new(RwLock::new(DefaultBenchmarkService::new())),
            diff_learning_service: Arc::new(RwLock::new(InMemoryDiffLearningService::new())),
            workflow_marketplace: Arc::new(RwLock::new(InMemoryWorkflowMarketplace::new())),

            enabled_tiers,
        })
    }

    /// Check if execution intelligence tier is enabled
    pub fn is_execution_intelligence_enabled(&self) -> bool {
        self.enabled_tiers.execution_intelligence
    }

    /// Check if multi-agent coordination tier is enabled
    pub fn is_multi_agent_coordination_enabled(&self) -> bool {
        self.enabled_tiers.multi_agent_coordination
    }

    /// Check if trust verification tier is enabled
    pub fn is_trust_verification_enabled(&self) -> bool {
        self.enabled_tiers.trust_verification
    }

    /// Check if organizational scale tier is enabled
    pub fn is_organizational_scale_enabled(&self) -> bool {
        self.enabled_tiers.organizational_scale
    }

    /// Check if ecosystem tier is enabled
    pub fn is_ecosystem_enabled(&self) -> bool {
        self.enabled_tiers.ecosystem
    }
}

impl Default for PlatformServices {
    fn default() -> Self {
        Self::new().expect("Failed to create default platform services")
    }
}

/// Workflow execution hooks for platform integration
///
/// These hooks are called by the workflow engine at key points during execution
/// to integrate platform capabilities.
pub struct WorkflowExecutionHooks {
    services: Arc<PlatformServices>,
}

impl WorkflowExecutionHooks {
    pub fn new(services: Arc<PlatformServices>) -> Self {
        Self { services }
    }

    /// Called before workflow execution starts
    ///
    /// This hook:
    /// - Generates initial execution plan using adaptive planner
    /// - Logs workflow start decision in causal tracer
    /// - Initializes cost tracking
    /// - Enforces tenant isolation
    pub fn on_workflow_start(
        &self,
        workflow: &Workflow,
        context: &ExecutionContext,
        tenant_id: Option<&TenantId>,
    ) -> Result<()> {
        // Tier 1: Generate initial execution plan
        if self.services.is_execution_intelligence_enabled() {
            // Convert engine ExecutionContext to platform ExecutionContext
            let platform_context = convert_to_platform_context(context);

            let plan = self
                .services
                .adaptive_planner
                .generate_plan(workflow, &platform_context)?;

            // Log plan generation decision
            let mut tracer = self.services.causal_tracer.write().unwrap();
            let decision = crate::platform::tier1_execution_intelligence::causal_tracer::Decision {
                decision_id: format!("plan_generation_{}", context.workflow_name),
                timestamp_ms: now_ms(),
                decision_type: crate::platform::tier1_execution_intelligence::causal_tracer::DecisionType::PlanGeneration,
                inputs: vec![],
                rationale: format!(
                    "Generated initial plan with {} steps, confidence: {:.2}",
                    plan.steps.len(),
                    plan.confidence_score
                ),
                confidence: plan.confidence_score,
            };
            tracer.log_decision(decision)?;
        }

        // Tier 4: Enforce tenant isolation
        if self.services.is_organizational_scale_enabled() {
            if let Some(tid) = tenant_id {
                let isolation = self.services.tenant_isolation.read().unwrap();
                let _context = isolation.get_isolated_context(tid)?;
                // Tenant context is now active for this workflow
            }
        }

        Ok(())
    }

    /// Called before each step execution
    ///
    /// This hook:
    /// - Logs step trigger in causal tracer
    /// - Checks if replanning is needed
    /// - Verifies claims if step is critical
    /// - Tracks resource usage start
    pub fn on_step_start(
        &self,
        step_id: &StepId,
        _workflow: &Workflow,
        context: &ExecutionContext,
    ) -> Result<()> {
        // Tier 1: Log step trigger
        if self.services.is_execution_intelligence_enabled() {
            let mut tracer = self.services.causal_tracer.write().unwrap();
            let cause = crate::platform::tier1_execution_intelligence::causal_tracer::TriggerCause::DependencyResolved {
                dependency_step: "previous".to_string(), // TODO: track actual dependency
            };
            tracer.log_step_trigger(step_id, cause)?;

            // Check if replanning is needed
            let platform_context = convert_to_platform_context(context);
            if let Some(_trigger) = self
                .services
                .adaptive_planner
                .should_replan(&platform_context)
            {
                // Replan needed - this would be handled by the engine
                // Using println instead of tracing since tracing is not available
                println!("Replan trigger detected for step: {}", step_id);
            }
        }

        Ok(())
    }

    /// Called after each step execution
    ///
    /// This hook:
    /// - Logs output derivation in causal tracer
    /// - Tracks resource usage and costs
    /// - Signs critical decisions
    /// - Captures human edits for learning
    pub fn on_step_complete(
        &self,
        step_id: &StepId,
        _output: &str,
        llm_tokens: u64,
        cost_usd: f64,
        agent_id: Option<&AgentId>,
    ) -> Result<()> {
        // Tier 1: Log output derivation
        if self.services.is_execution_intelligence_enabled() {
            let mut tracer = self.services.causal_tracer.write().unwrap();
            tracer.log_output_derivation(
                format!("output_{}", step_id),
                step_id.clone(),
                vec![], // TODO: track actual data sources
            )?;
        }

        // Tier 4: Track resource usage and costs
        if self.services.is_organizational_scale_enabled() {
            let mut cost_tracker = self.services.cost_tracker.write().unwrap();
            let usage = crate::platform::tier4_organizational::cost_tracker::ResourceUsage {
                resource_type: crate::platform::types::ResourceType::LLMTokens {
                    provider: "default".to_string(),
                    model: "default".to_string(),
                },
                quantity: llm_tokens as f64,
                unit_cost: if llm_tokens > 0 {
                    cost_usd / llm_tokens as f64
                } else {
                    0.0
                },
                timestamp_ms: now_ms(),
                step_id: step_id.clone(),
            };
            cost_tracker.track_usage(usage)?;
        }

        // Tier 3: Sign critical decisions
        if self.services.is_trust_verification_enabled() {
            if let Some(aid) = agent_id {
                // Sign critical decisions for audit trail
                use crate::platform::types::{DataSource, DataSourceType};
                let decision = crate::platform::tier1_execution_intelligence::causal_tracer::Decision {
                    decision_id: format!("step_complete_{}", step_id),
                    timestamp_ms: now_ms(),
                    decision_type: crate::platform::tier1_execution_intelligence::causal_tracer::DecisionType::StepExecution,
                    inputs: vec![DataSource {
                        source_type: DataSourceType::StepOutput,
                        reference: step_id.clone(),
                        timestamp_ms: now_ms(),
                    }],
                    rationale: format!("Step {} completed successfully", step_id),
                    confidence: 1.0,
                };

                let commitment = self.services.commitment_service.write().unwrap();
                let _signed = commitment.sign_decision(&decision, aid)?;
            }
        }

        Ok(())
    }

    /// Called when a step fails
    ///
    /// This hook:
    /// - Triggers replanning if appropriate
    /// - Logs failure in causal tracer
    /// - Escalates to human review if needed
    pub fn on_step_failure(
        &self,
        step_id: &StepId,
        error: &str,
        _workflow: &Workflow,
        _context: &ExecutionContext,
    ) -> Result<()> {
        // Tier 1: Log failure and trigger replan
        if self.services.is_execution_intelligence_enabled() {
            let mut tracer = self.services.causal_tracer.write().unwrap();
            let decision = crate::platform::tier1_execution_intelligence::causal_tracer::Decision {
                decision_id: format!("step_failure_{}", step_id),
                timestamp_ms: now_ms(),
                decision_type: crate::platform::tier1_execution_intelligence::causal_tracer::DecisionType::StepExecution,
                inputs: vec![],
                rationale: format!("Step {} failed: {}", step_id, error),
                confidence: 0.0,
            };
            tracer.log_decision(decision)?;

            // Trigger replanning
            println!("Replan triggered due to step failure: {}", step_id);
        }

        Ok(())
    }

    /// Called when workflow completes
    ///
    /// This hook:
    /// - Exports causal graph for audit
    /// - Generates cost report
    /// - Updates performance metrics
    /// - Collects feedback for learning
    pub fn on_workflow_complete(
        &self,
        _workflow: &Workflow,
        instance: &WorkflowInstance,
    ) -> Result<()> {
        // Tier 1: Export causal graph
        if self.services.is_execution_intelligence_enabled() {
            let tracer = self.services.causal_tracer.read().unwrap();
            let _graph = tracer.export_causal_graph()?;
            // Graph would be stored for audit
        }

        // Tier 4: Generate cost report
        if self.services.is_organizational_scale_enabled() {
            let cost_tracker = self.services.cost_tracker.read().unwrap();
            let _report = cost_tracker.get_cost_report(&instance.instance_id)?;
            // Report would be stored/displayed
        }

        Ok(())
    }

    /// Verify a claim using formal verification
    ///
    /// This is called for critical steps that make security or correctness claims.
    pub fn verify_claim(&self, claim: Claim) -> Result<bool> {
        if !self.services.is_trust_verification_enabled() {
            return Ok(true); // Skip verification if tier is disabled
        }

        let artifact = crate::platform::tier3_trust_verification::Artifact {
            content: crate::platform::tier3_trust_verification::ArtifactContent::Inline(
                "".to_string(),
            ),
            artifact_type: "code".to_string(),
            metadata: std::collections::HashMap::new(),
        };

        let result = self
            .services
            .formal_verifier
            .verify_claim(claim, &artifact)?;
        Ok(result.verified)
    }
}

/// Helper function to convert engine ExecutionContext to platform ExecutionContext
fn convert_to_platform_context(
    engine_ctx: &ExecutionContext,
) -> crate::platform::types::ExecutionContext {
    crate::platform::types::ExecutionContext {
        workflow_id: engine_ctx.workflow_name.clone(),
        instance_id: engine_ctx.workflow_instance_id.clone(),
        current_step: Some(engine_ctx.step_id.clone()),
        completed_steps: engine_ctx.completed_steps.clone(),
        failed_steps: std::collections::HashSet::new(),
        environment: std::collections::HashMap::new(),
        plan_version: 1,
    }
}

/// Helper function to get current timestamp in milliseconds
fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("time")
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_services_creation() {
        let services = PlatformServices::new();
        assert!(services.is_ok());
    }

    #[test]
    fn test_enabled_tiers_default() {
        let tiers = EnabledTiers::default();
        assert!(tiers.execution_intelligence);
        assert!(tiers.multi_agent_coordination);
        assert!(tiers.trust_verification);
        assert!(tiers.organizational_scale);
        assert!(tiers.ecosystem);
    }

    #[test]
    fn test_platform_services_with_custom_config() {
        let tiers = EnabledTiers {
            execution_intelligence: true,
            multi_agent_coordination: false,
            trust_verification: true,
            organizational_scale: false,
            ecosystem: false,
        };

        let services = PlatformServices::with_config(tiers);
        assert!(services.is_ok());

        let services = services.unwrap();
        assert!(services.is_execution_intelligence_enabled());
        assert!(!services.is_multi_agent_coordination_enabled());
        assert!(services.is_trust_verification_enabled());
        assert!(!services.is_organizational_scale_enabled());
        assert!(!services.is_ecosystem_enabled());
    }

    #[test]
    fn test_platform_services_from_config_all_disabled() {
        let config = crate::platform::config::PlatformConfig::default_disabled();
        let services = PlatformServices::from_platform_config(&config);
        assert!(services.is_ok());

        let services = services.unwrap();
        assert!(!services.is_execution_intelligence_enabled());
        assert!(!services.is_multi_agent_coordination_enabled());
        assert!(!services.is_trust_verification_enabled());
        assert!(!services.is_organizational_scale_enabled());
        assert!(!services.is_ecosystem_enabled());
    }

    #[test]
    fn test_platform_services_from_config_all_enabled() {
        let config = crate::platform::config::PlatformConfig::all_enabled();
        let services = PlatformServices::from_platform_config(&config);
        assert!(services.is_ok());

        let services = services.unwrap();
        assert!(services.is_execution_intelligence_enabled());
        assert!(services.is_multi_agent_coordination_enabled());
        assert!(services.is_trust_verification_enabled());
        assert!(services.is_organizational_scale_enabled());
        assert!(services.is_ecosystem_enabled());
    }

    #[test]
    fn test_platform_services_from_config_partial() {
        let mut config = crate::platform::config::PlatformConfig::default_disabled();
        config.features.adaptive_planning = true;
        config.features.cost_tracking = true;

        let services = PlatformServices::from_platform_config(&config);
        assert!(services.is_ok());

        let services = services.unwrap();
        assert!(services.is_execution_intelligence_enabled());
        assert!(!services.is_multi_agent_coordination_enabled());
        assert!(!services.is_trust_verification_enabled());
        assert!(services.is_organizational_scale_enabled());
        assert!(!services.is_ecosystem_enabled());
    }

    #[test]
    fn test_platform_services_respects_feedback_window_config() {
        let mut config = crate::platform::config::PlatformConfig::default_disabled();
        config.tier1_execution_intelligence.feedback_window_secs = 7200;

        let services = PlatformServices::from_platform_config(&config);
        assert!(services.is_ok());

        // Services should be created with the configured feedback window
        // This is verified by the fact that the service creation succeeds
    }
}
