#![allow(clippy::too_many_arguments)]

use std::sync::Arc;

use crate::engine::executor::Executor;
use crate::engine::registry::DomainRegistry;
use crate::workflow::model::Workflow;
use anyhow::Result;

use crate::engine::events::ExecutionReport;

use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::engine::snapshot::ExecutionSnapshot;

use crate::engine::budget::ExecutionBudget;
use crate::engine::decomposition::AutonomyLimits;

pub struct Runtime {
    executor: Executor,
}

impl Runtime {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        let executor = Executor::new(domain_registry);
        Self { executor }
    }

    pub async fn run(
        &self,
        workflow: Workflow,
        initial_snapshot: Option<ExecutionSnapshot>,
        snapshot_path: Option<String>,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<ExecutionReport> {
        let budget_for_summary = budget.clone();
        let final_memory = self
            .executor
            .execute_workflow(
                &workflow,
                initial_snapshot,
                snapshot_path,
                vec![],
                0,
                budget,
                routing_policy,
                security_policy,
            )
            .await?;
        let trace = self.executor.get_trace();
        let summary = self.executor.build_run_summary(&budget_for_summary);

        Ok(ExecutionReport {
            final_memory,
            trace,
            summary,
        })
    }

    pub async fn run_goal(
        &self,
        domain: &str,
        goal: &str,
        initial_snapshot: Option<ExecutionSnapshot>,
        snapshot_path: Option<String>,
        limits: AutonomyLimits,
        budget: ExecutionBudget,
        routing_policy: RoutingPolicy,
        security_policy: DomainSecurityPolicy,
    ) -> Result<ExecutionReport> {
        let budget_for_summary = budget.clone();
        let final_memory = self
            .executor
            .execute_goal(
                domain,
                goal,
                initial_snapshot,
                snapshot_path,
                &limits,
                budget,
                routing_policy,
                security_policy,
            )
            .await?;
        let trace = self.executor.get_trace();
        let summary = self.executor.build_run_summary(&budget_for_summary);

        Ok(ExecutionReport {
            final_memory,
            trace,
            summary,
        })
    }
}
