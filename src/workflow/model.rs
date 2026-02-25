#[derive(Debug, Clone)]
pub struct Workflow {
    pub meta: WorkflowMeta,
    pub steps: Vec<WorkflowStep>,
}

#[derive(Debug, Clone)]
pub struct WorkflowMeta {
    pub name: String,
    pub domain: Option<String>,
    pub goal: Option<String>,
    pub target_type: Option<String>,
    pub routing_policy: Option<crate::engine::routing::RoutingPolicy>,
    pub security_policy: Option<crate::engine::security::DomainSecurityPolicy>,
    pub resource_budget: Option<crate::engine::budget::ResourceBudget>,
    pub projected_cost: Option<u32>,
    pub projected_latency_ms: Option<u32>,
    pub projected_steps: Option<usize>,
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum FailureStrategy {
    #[default]
    FailFast,
    Continue,
}

impl std::str::FromStr for FailureStrategy {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let normalized = s.trim().to_ascii_lowercase().replace('_', "");
        match normalized.as_str() {
            "failfast" | "abort" => Ok(FailureStrategy::FailFast),
            "continue" => Ok(FailureStrategy::Continue),
            _ => Err(format!("Invalid FailureStrategy: {}", s)),
        }
    }
}

#[derive(Debug, Clone)]
pub struct WorkflowStep {
    pub id: String,
    pub skill: String,
    pub input: String,
    pub depends_on: Vec<String>,
    pub condition: Option<String>,
    pub retry: Option<u32>,
    pub on_failure: FailureStrategy,
}

impl WorkflowStep {
    pub fn new(id: &str, skill: &str, input: &str) -> Self {
        Self {
            id: id.to_string(),
            skill: skill.to_string(),
            input: input.to_string(),
            depends_on: Vec::new(),
            condition: None,
            retry: None,
            on_failure: FailureStrategy::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::FailureStrategy;
    use std::str::FromStr;

    #[test]
    fn failure_strategy_supports_aliases() {
        assert_eq!(
            FailureStrategy::from_str("FailFast").expect("FailFast"),
            FailureStrategy::FailFast
        );
        assert_eq!(
            FailureStrategy::from_str("abort").expect("abort"),
            FailureStrategy::FailFast
        );
        assert_eq!(
            FailureStrategy::from_str("continue").expect("continue"),
            FailureStrategy::Continue
        );
    }
}
