// Adaptive Planner - dynamically re-plan workflow execution when context changes

use crate::platform::{PlatformError, Result};
use crate::platform::types::{ExecutionContext, StepId};
use crate::workflow::model::Workflow;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Adaptive planner for dynamic workflow replanning
pub struct AdaptivePlanner {
    config: PlannerConfig,
}

#[derive(Debug, Clone)]
pub struct PlannerConfig {
    pub max_replans: u32,
    pub confidence_threshold: f64,
}

impl Default for PlannerConfig {
    fn default() -> Self {
        Self {
            max_replans: 5,
            confidence_threshold: 0.7,
        }
    }
}

/// Execution plan with steps, dependencies, and metadata
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExecutionPlan {
    pub steps: Vec<PlannedStep>,
    pub dependencies: HashMap<StepId, Vec<StepId>>,
    pub estimated_duration_ms: u64,
    pub confidence_score: f64,
    pub plan_version: u32,
}

/// A single planned step
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PlannedStep {
    pub step_id: StepId,
    pub name: String,
    pub step_type: String,
    pub estimated_duration_ms: u64,
    pub confidence: f64,
}

/// Trigger for replanning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReplanTrigger {
    TestFailure { step_id: StepId, error: String },
    ScopeDrift { original_goal: String, new_goal: String },
    BlockedDependency { step_id: StepId, reason: String },
    ResourceExhaustion { resource: String },
    TimeoutExceeded { step_id: StepId },
}

/// Alternative plan with score
#[derive(Debug, Clone)]
struct ScoredPlan {
    plan: ExecutionPlan,
    score: f64,
}

impl AdaptivePlanner {
    pub fn new(config: PlannerConfig) -> Self {
        Self { config }
    }
    
    pub fn default() -> Self {
        Self::new(PlannerConfig::default())
    }
    
    /// Generate initial execution plan from workflow definition
    pub fn generate_plan(&self, workflow: &Workflow, context: &ExecutionContext) -> Result<ExecutionPlan> {
        // Convert workflow steps to planned steps
        let mut planned_steps = Vec::new();
        let mut dependencies = HashMap::new();
        
        for step in &workflow.steps {
            let planned_step = PlannedStep {
                step_id: step.id.clone(),
                name: step.skill.clone(),
                step_type: step.skill.clone(),
                estimated_duration_ms: self.estimate_duration(&step.skill),
                confidence: self.estimate_confidence(&step.skill),
            };
            planned_steps.push(planned_step);
            
            // Store dependencies
            if !step.depends_on.is_empty() {
                dependencies.insert(step.id.clone(), step.depends_on.clone());
            }
        }
        
        // Validate dependency ordering
        self.validate_dependencies(&planned_steps, &dependencies)?;
        
        // Calculate total estimated duration
        let estimated_duration_ms = planned_steps.iter()
            .map(|s| s.estimated_duration_ms)
            .sum();
        
        // Calculate overall confidence score
        let confidence_score = if planned_steps.is_empty() {
            1.0
        } else {
            planned_steps.iter()
                .map(|s| s.confidence)
                .sum::<f64>() / planned_steps.len() as f64
        };
        
        Ok(ExecutionPlan {
            steps: planned_steps,
            dependencies,
            estimated_duration_ms,
            confidence_score,
            plan_version: context.plan_version,
        })
    }
    
    /// Replan based on trigger
    pub fn replan(
        &self,
        current_plan: &ExecutionPlan,
        trigger: &ReplanTrigger,
        context: &ExecutionContext,
    ) -> Result<ExecutionPlan> {
        if current_plan.plan_version >= self.config.max_replans {
            return Err(PlatformError::ReplanFailed(
                format!("Maximum replans ({}) exceeded", self.config.max_replans)
            ));
        }
        
        // Step 1: Analyze impact of trigger
        let affected_steps = self.analyze_impact(trigger, current_plan)?;
        
        // Step 2: Preserve completed work
        let completed = &context.completed_steps;
        let in_flight = self.get_in_flight_steps(context);
        
        // Step 3: Generate alternative paths
        let alternatives = self.generate_alternatives(
            current_plan,
            &affected_steps,
            completed,
            &in_flight,
            trigger,
        )?;
        
        // Step 4: Score alternatives
        let scored = self.score_alternatives(alternatives, context)?;
        
        // Step 5: Select best alternative
        let best = scored.into_iter()
            .max_by(|a, b| a.score.partial_cmp(&b.score).unwrap_or(std::cmp::Ordering::Equal))
            .ok_or_else(|| PlatformError::ReplanFailed("No viable alternative found".to_string()))?;
        
        // Step 6: Merge with current execution
        let new_plan = self.merge_plans(current_plan, &best.plan, completed)?;
        
        Ok(new_plan)
    }
    
    /// Check if replanning is needed based on execution context
    pub fn should_replan(&self, context: &ExecutionContext) -> Option<ReplanTrigger> {
        // Check for test failures
        if !context.failed_steps.is_empty() {
            let step_id = context.failed_steps.iter().next().unwrap().clone();
            return Some(ReplanTrigger::TestFailure {
                step_id,
                error: "Step execution failed".to_string(),
            });
        }
        
        // Check for blocked dependencies (simplified check)
        if let Some(current_step) = &context.current_step {
            // In a real implementation, we'd check if dependencies are actually blocked
            // For now, this is a placeholder
            if context.environment.contains_key("blocked_dependency") {
                return Some(ReplanTrigger::BlockedDependency {
                    step_id: current_step.clone(),
                    reason: "Dependency unavailable".to_string(),
                });
            }
        }
        
        None
    }
    
    /// Apply feedback recommendations to planning
    /// This integrates production feedback into future workflow planning
    pub fn apply_feedback_recommendations(
        &self,
        plan: &ExecutionPlan,
        recommendations: &[crate::platform::tier1_execution_intelligence::feedback_collector::Recommendation],
    ) -> Result<ExecutionPlan> {
        use crate::platform::tier1_execution_intelligence::feedback_collector::RecommendedAction;
        
        let mut updated_plan = plan.clone();
        
        for recommendation in recommendations {
            // Only apply high-confidence recommendations
            if recommendation.confidence < self.config.confidence_threshold {
                continue;
            }
            
            match &recommendation.action {
                RecommendedAction::AddRetry { step_id, max_retries: _ } => {
                    // Find the step and add retry metadata
                    if let Some(step) = updated_plan.steps.iter_mut().find(|s| &s.step_id == step_id) {
                        // In a real implementation, we'd modify the step's retry configuration
                        // For now, we adjust the confidence and duration estimates
                        step.confidence = (step.confidence * 1.1).min(1.0);
                        step.estimated_duration_ms = (step.estimated_duration_ms as f64 * 1.2) as u64;
                    }
                }
                RecommendedAction::AddValidation { step_id, validation_type } => {
                    // Add a validation step after the target step
                    if let Some(pos) = updated_plan.steps.iter().position(|s| &s.step_id == step_id) {
                        let validation_step = PlannedStep {
                            step_id: format!("{}_validation", step_id),
                            name: format!("validate_{}", validation_type),
                            step_type: "validation".to_string(),
                            estimated_duration_ms: 2000,
                            confidence: 0.85,
                        };
                        
                        updated_plan.steps.insert(pos + 1, validation_step.clone());
                        updated_plan.dependencies.insert(
                            validation_step.step_id.clone(),
                            vec![step_id.clone()],
                        );
                    }
                }
                RecommendedAction::IncreaseTimeout { step_id, new_timeout_ms } => {
                    // Adjust step duration estimate
                    if let Some(step) = updated_plan.steps.iter_mut().find(|s| &s.step_id == step_id) {
                        step.estimated_duration_ms = *new_timeout_ms;
                    }
                }
                RecommendedAction::ChangeStrategy { step_id, new_strategy } => {
                    // Update step type to reflect new strategy
                    if let Some(step) = updated_plan.steps.iter_mut().find(|s| &s.step_id == step_id) {
                        step.step_type = new_strategy.clone();
                        step.confidence = (step.confidence * 0.9).max(0.5);
                    }
                }
                RecommendedAction::OptimizeResource { .. } => {
                    // Resource optimization affects overall plan confidence
                    updated_plan.confidence_score = (updated_plan.confidence_score * 1.05).min(1.0);
                }
            }
        }
        
        // Recalculate plan metrics
        updated_plan.estimated_duration_ms = updated_plan.steps.iter()
            .map(|s| s.estimated_duration_ms)
            .sum();
        
        if !updated_plan.steps.is_empty() {
            updated_plan.confidence_score = updated_plan.steps.iter()
                .map(|s| s.confidence)
                .sum::<f64>() / updated_plan.steps.len() as f64;
        }
        
        Ok(updated_plan)
    }
    
    // Helper methods
    
    fn estimate_duration(&self, skill: &str) -> u64 {
        // Simple heuristic based on skill type
        match skill {
            s if s.contains("test") => 5000,
            s if s.contains("build") => 10000,
            s if s.contains("deploy") => 15000,
            _ => 3000,
        }
    }
    
    fn estimate_confidence(&self, skill: &str) -> f64 {
        // Simple heuristic based on skill type
        match skill {
            s if s.contains("test") => 0.9,
            s if s.contains("build") => 0.85,
            s if s.contains("deploy") => 0.75,
            _ => 0.8,
        }
    }
    
    fn validate_dependencies(
        &self,
        steps: &[PlannedStep],
        dependencies: &HashMap<StepId, Vec<StepId>>,
    ) -> Result<()> {
        let step_ids: HashSet<_> = steps.iter().map(|s| s.step_id.as_str()).collect();
        
        for (step_id, deps) in dependencies {
            for dep in deps {
                if !step_ids.contains(dep.as_str()) {
                    return Err(PlatformError::PlanningError(
                        format!("Step {} depends on non-existent step {}", step_id, dep)
                    ));
                }
            }
        }
        
        // Check for cycles (simplified DFS-based cycle detection)
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();
        
        for step in steps {
            if !visited.contains(&step.step_id) {
                if self.has_cycle(&step.step_id, dependencies, &mut visited, &mut rec_stack) {
                    return Err(PlatformError::PlanningError(
                        "Circular dependency detected in plan".to_string()
                    ));
                }
            }
        }
        
        Ok(())
    }
    
    fn has_cycle(
        &self,
        step_id: &str,
        dependencies: &HashMap<StepId, Vec<StepId>>,
        visited: &mut HashSet<String>,
        rec_stack: &mut HashSet<String>,
    ) -> bool {
        visited.insert(step_id.to_string());
        rec_stack.insert(step_id.to_string());
        
        if let Some(deps) = dependencies.get(step_id) {
            for dep in deps {
                if !visited.contains(dep) {
                    if self.has_cycle(dep, dependencies, visited, rec_stack) {
                        return true;
                    }
                } else if rec_stack.contains(dep) {
                    return true;
                }
            }
        }
        
        rec_stack.remove(step_id);
        false
    }
    
    fn analyze_impact(
        &self,
        trigger: &ReplanTrigger,
        plan: &ExecutionPlan,
    ) -> Result<HashSet<StepId>> {
        let mut affected = HashSet::new();
        
        match trigger {
            ReplanTrigger::TestFailure { step_id, .. } => {
                affected.insert(step_id.clone());
                // Add dependent steps
                for (sid, deps) in &plan.dependencies {
                    if deps.contains(step_id) {
                        affected.insert(sid.clone());
                    }
                }
            }
            ReplanTrigger::BlockedDependency { step_id, .. } => {
                affected.insert(step_id.clone());
            }
            ReplanTrigger::ScopeDrift { .. } => {
                // Scope drift affects all remaining steps
                for step in &plan.steps {
                    affected.insert(step.step_id.clone());
                }
            }
            ReplanTrigger::ResourceExhaustion { .. } => {
                // Resource exhaustion affects all remaining steps
                for step in &plan.steps {
                    affected.insert(step.step_id.clone());
                }
            }
            ReplanTrigger::TimeoutExceeded { step_id } => {
                affected.insert(step_id.clone());
            }
        }
        
        Ok(affected)
    }
    
    fn get_in_flight_steps(&self, context: &ExecutionContext) -> HashSet<StepId> {
        let mut in_flight = HashSet::new();
        if let Some(current) = &context.current_step {
            in_flight.insert(current.clone());
        }
        in_flight
    }
    
    fn generate_alternatives(
        &self,
        current_plan: &ExecutionPlan,
        affected_steps: &HashSet<StepId>,
        completed: &HashSet<StepId>,
        _in_flight: &HashSet<StepId>,
        trigger: &ReplanTrigger,
    ) -> Result<Vec<ExecutionPlan>> {
        let mut alternatives = Vec::new();
        
        // Alternative 1: Add remediation steps based on trigger type
        let mut alt1 = current_plan.clone();
        match trigger {
            ReplanTrigger::TestFailure { step_id, .. } => {
                // Add debug and fix steps
                let debug_step = PlannedStep {
                    step_id: format!("{}_debug", step_id),
                    name: "debug_failure".to_string(),
                    step_type: "debug".to_string(),
                    estimated_duration_ms: 5000,
                    confidence: 0.7,
                };
                let fix_step = PlannedStep {
                    step_id: format!("{}_fix", step_id),
                    name: "apply_fix".to_string(),
                    step_type: "fix".to_string(),
                    estimated_duration_ms: 8000,
                    confidence: 0.6,
                };
                
                // Insert after the failed step
                if let Some(pos) = alt1.steps.iter().position(|s| &s.step_id == step_id) {
                    alt1.steps.insert(pos + 1, debug_step.clone());
                    alt1.steps.insert(pos + 2, fix_step.clone());
                    
                    // Update dependencies
                    alt1.dependencies.insert(debug_step.step_id.clone(), vec![step_id.clone()]);
                    alt1.dependencies.insert(fix_step.step_id.clone(), vec![debug_step.step_id.clone()]);
                }
            }
            ReplanTrigger::BlockedDependency { step_id, .. } => {
                // Add workaround step
                let workaround_step = PlannedStep {
                    step_id: format!("{}_workaround", step_id),
                    name: "workaround".to_string(),
                    step_type: "workaround".to_string(),
                    estimated_duration_ms: 6000,
                    confidence: 0.65,
                };
                
                if let Some(pos) = alt1.steps.iter().position(|s| &s.step_id == step_id) {
                    alt1.steps.insert(pos, workaround_step.clone());
                }
            }
            _ => {}
        }
        
        alt1.plan_version = current_plan.plan_version + 1;
        alt1.estimated_duration_ms = alt1.steps.iter().map(|s| s.estimated_duration_ms).sum();
        if !alt1.steps.is_empty() {
            alt1.confidence_score = alt1.steps.iter().map(|s| s.confidence).sum::<f64>() / alt1.steps.len() as f64;
        }
        
        alternatives.push(alt1);
        
        // Alternative 2: Skip affected steps and continue (if possible)
        // Only add this if there are non-affected, non-completed steps remaining
        let remaining_steps: Vec<_> = current_plan.steps.iter()
            .filter(|s| !affected_steps.contains(&s.step_id) && !completed.contains(&s.step_id))
            .cloned()
            .collect();
        
        if !remaining_steps.is_empty() && remaining_steps.len() < current_plan.steps.len() {
            let mut alt2 = current_plan.clone();
            alt2.steps = remaining_steps;
            alt2.plan_version = current_plan.plan_version + 1;
            alt2.estimated_duration_ms = alt2.steps.iter().map(|s| s.estimated_duration_ms).sum();
            alt2.confidence_score = alt2.steps.iter().map(|s| s.confidence).sum::<f64>() / alt2.steps.len() as f64;
            alternatives.push(alt2);
        }
        
        Ok(alternatives)
    }
    
    fn score_alternatives(
        &self,
        alternatives: Vec<ExecutionPlan>,
        _context: &ExecutionContext,
    ) -> Result<Vec<ScoredPlan>> {
        let mut scored = Vec::new();
        
        for (idx, plan) in alternatives.into_iter().enumerate() {
            // Score based on confidence and estimated duration
            // Higher confidence is better, lower duration is better
            let confidence_weight = 0.7;
            let duration_weight = 0.3;
            
            let normalized_confidence = plan.confidence_score;
            let normalized_duration = 1.0 / (1.0 + plan.estimated_duration_ms as f64 / 10000.0);
            
            let mut score = confidence_weight * normalized_confidence + duration_weight * normalized_duration;
            
            // Strongly prefer the first alternative (remediation) over skipping steps
            // by giving it a significant bonus
            if idx == 0 {
                score *= 2.0;  // Double the score for remediation
            }
            
            scored.push(ScoredPlan { plan, score });
        }
        
        Ok(scored)
    }
    
    fn merge_plans(
        &self,
        _current_plan: &ExecutionPlan,
        new_plan: &ExecutionPlan,
        completed: &HashSet<StepId>,
    ) -> Result<ExecutionPlan> {
        // Ensure all completed steps are preserved
        let merged = new_plan.clone();
        
        // Verify that all completed steps are in the new plan
        for completed_step in completed {
            if !merged.steps.iter().any(|s| &s.step_id == completed_step) {
                return Err(PlatformError::ReplanFailed(
                    format!("Completed step {} not preserved in new plan", completed_step)
                ));
            }
        }
        
        Ok(merged)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workflow::model::{Workflow, WorkflowMeta, WorkflowStep};

    fn create_test_workflow() -> Workflow {
        Workflow {
            meta: WorkflowMeta {
                name: "test_workflow".to_string(),
                domain: None,
                goal: Some("Test goal".to_string()),
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                WorkflowStep {
                    id: "step1".to_string(),
                    skill: "build".to_string(),
                    input: "input1".to_string(),
                    depends_on: vec![],
                    condition: None,
                    retry: None,
                    on_failure: crate::workflow::model::FailureStrategy::FailFast,
                },
                WorkflowStep {
                    id: "step2".to_string(),
                    skill: "test".to_string(),
                    input: "input2".to_string(),
                    depends_on: vec!["step1".to_string()],
                    condition: None,
                    retry: None,
                    on_failure: crate::workflow::model::FailureStrategy::FailFast,
                },
            ],
        }
    }

    #[test]
    fn test_generate_plan() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        assert_eq!(plan.plan_version, 1);
        assert_eq!(plan.steps.len(), 2);
        assert_eq!(plan.steps[0].step_id, "step1");
        assert_eq!(plan.steps[1].step_id, "step2");
        assert!(plan.dependencies.contains_key("step2"));
        assert_eq!(plan.dependencies.get("step2").unwrap(), &vec!["step1".to_string()]);
    }

    #[test]
    fn test_replan_version_increment() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        let trigger = ReplanTrigger::TestFailure {
            step_id: "step2".to_string(),
            error: "test failed".to_string(),
        };
        
        let new_plan = planner.replan(&plan, &trigger, &context).unwrap();
        assert_eq!(new_plan.plan_version, 2);
    }

    #[test]
    fn test_max_replans_exceeded() {
        let planner = AdaptivePlanner::new(PlannerConfig {
            max_replans: 2,
            confidence_threshold: 0.7,
        });
        
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        let mut plan = planner.generate_plan(&workflow, &context).unwrap();
        plan.plan_version = 2;
        
        let trigger = ReplanTrigger::TestFailure {
            step_id: "step2".to_string(),
            error: "test failed".to_string(),
        };
        
        let result = planner.replan(&plan, &trigger, &context);
        assert!(result.is_err());
    }

    #[test]
    fn test_replan_adds_remediation_steps() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        let original_len = plan.steps.len();
        
        let trigger = ReplanTrigger::TestFailure {
            step_id: "step2".to_string(),
            error: "test failed".to_string(),
        };
        
        let new_plan = planner.replan(&plan, &trigger, &context).unwrap();
        
        // Should have added debug and fix steps
        assert!(new_plan.steps.len() > original_len, 
            "Expected more steps after replan. Original: {}, New: {}", 
            original_len, new_plan.steps.len());
        assert!(new_plan.steps.iter().any(|s| s.name == "debug_failure"));
        assert!(new_plan.steps.iter().any(|s| s.name == "apply_fix"));
    }

    #[test]
    fn test_replan_preserves_completed_work() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let mut context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        context.completed_steps.insert("step1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        let trigger = ReplanTrigger::TestFailure {
            step_id: "step2".to_string(),
            error: "test failed".to_string(),
        };
        
        let new_plan = planner.replan(&plan, &trigger, &context).unwrap();
        
        // Completed step must be preserved
        assert!(new_plan.steps.iter().any(|s| s.step_id == "step1"));
    }

    #[test]
    fn test_should_replan_detects_failures() {
        let planner = AdaptivePlanner::default();
        let mut context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        // No failures initially
        assert!(planner.should_replan(&context).is_none());
        
        // Add a failed step
        context.failed_steps.insert("step1".to_string());
        
        let trigger = planner.should_replan(&context);
        assert!(trigger.is_some());
        
        if let Some(ReplanTrigger::TestFailure { step_id, .. }) = trigger {
            assert_eq!(step_id, "step1");
        } else {
            panic!("Expected TestFailure trigger");
        }
    }

    #[test]
    fn test_circular_dependency_detection() {
        let planner = AdaptivePlanner::default();
        
        // Create workflow with circular dependency
        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "circular".to_string(),
                domain: None,
                goal: None,
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                WorkflowStep {
                    id: "step1".to_string(),
                    skill: "build".to_string(),
                    input: "input1".to_string(),
                    depends_on: vec!["step2".to_string()],
                    condition: None,
                    retry: None,
                    on_failure: crate::workflow::model::FailureStrategy::FailFast,
                },
                WorkflowStep {
                    id: "step2".to_string(),
                    skill: "test".to_string(),
                    input: "input2".to_string(),
                    depends_on: vec!["step1".to_string()],
                    condition: None,
                    retry: None,
                    on_failure: crate::workflow::model::FailureStrategy::FailFast,
                },
            ],
        };
        
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        let result = planner.generate_plan(&workflow, &context);
        
        assert!(result.is_err());
        if let Err(PlatformError::PlanningError(msg)) = result {
            assert!(msg.contains("Circular dependency"));
        } else {
            panic!("Expected PlanningError for circular dependency");
        }
    }

    #[test]
    fn test_duration_estimation() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        // Should have non-zero estimated duration
        assert!(plan.estimated_duration_ms > 0);
        
        // Should be sum of individual step durations
        let sum: u64 = plan.steps.iter().map(|s| s.estimated_duration_ms).sum();
        assert_eq!(plan.estimated_duration_ms, sum);
    }

    #[test]
    fn test_confidence_scoring() {
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        // Confidence should be between 0 and 1
        assert!(plan.confidence_score >= 0.0 && plan.confidence_score <= 1.0);
        
        // Should be average of step confidences
        let avg = plan.steps.iter().map(|s| s.confidence).sum::<f64>() / plan.steps.len() as f64;
        assert!((plan.confidence_score - avg).abs() < 0.001);
    }

    #[test]
    fn test_apply_feedback_recommendations() {
        use crate::platform::tier1_execution_intelligence::feedback_collector::{
            Recommendation, RecommendedAction
        };
        
        let planner = AdaptivePlanner::default();
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        let original_step_count = plan.steps.len();
        
        // Create a recommendation to add validation
        let recommendations = vec![
            Recommendation {
                recommendation_id: "rec1".to_string(),
                workflow_id: "wf1".to_string(),
                action: RecommendedAction::AddValidation {
                    step_id: "step1".to_string(),
                    validation_type: "quality_check".to_string(),
                },
                confidence: 0.85,
                rationale: "Adding validation based on feedback".to_string(),
            }
        ];
        
        let updated_plan = planner.apply_feedback_recommendations(&plan, &recommendations).unwrap();
        
        // Should have added a validation step
        assert!(updated_plan.steps.len() > original_step_count);
        assert!(updated_plan.steps.iter().any(|s| s.step_type == "validation"));
    }
    
    #[test]
    fn test_feedback_recommendations_respect_confidence_threshold() {
        use crate::platform::tier1_execution_intelligence::feedback_collector::{
            Recommendation, RecommendedAction
        };
        
        let planner = AdaptivePlanner::new(PlannerConfig {
            max_replans: 5,
            confidence_threshold: 0.8,
        });
        
        let workflow = create_test_workflow();
        let context = ExecutionContext::new("wf1".to_string(), "inst1".to_string());
        let plan = planner.generate_plan(&workflow, &context).unwrap();
        
        // Low confidence recommendation should be ignored
        let low_confidence_rec = vec![
            Recommendation {
                recommendation_id: "rec1".to_string(),
                workflow_id: "wf1".to_string(),
                action: RecommendedAction::AddValidation {
                    step_id: "step1".to_string(),
                    validation_type: "quality_check".to_string(),
                },
                confidence: 0.5,  // Below threshold
                rationale: "Low confidence recommendation".to_string(),
            }
        ];
        
        let updated_plan = planner.apply_feedback_recommendations(&plan, &low_confidence_rec).unwrap();
        
        // Plan should be unchanged
        assert_eq!(updated_plan.steps.len(), plan.steps.len());
    }
}
