//! BMAD Workflows Module
//!
//! Provides workflow definitions for BMAD-METHOD agile processes.

use super::{BmadAgent, BmadWorkflow, ScaleLevel};

/// Workflow definition with steps
#[derive(Debug, Clone)]
pub struct WorkflowDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub agents: Vec<BmadAgent>,
    pub steps: Vec<WorkflowStep>,
    pub scale_adaptive: bool,
}

impl WorkflowDefinition {
    /// Get workflow for a specific scale level
    pub fn for_scale(&self, level: ScaleLevel) -> Vec<WorkflowStep> {
        if !self.scale_adaptive {
            return self.steps.clone();
        }

        match level {
            ScaleLevel::Small => self.steps.iter().filter(|s| s.essential).cloned().collect(),
            ScaleLevel::Medium => self.steps.clone(),
            ScaleLevel::Large => self.steps.clone(),
            ScaleLevel::Enterprise => {
                let mut steps = self.steps.clone();
                steps.extend(self.governance_steps());
                steps
            }
        }
    }

    fn governance_steps(&self) -> Vec<WorkflowStep> {
        vec![
            WorkflowStep {
                name: "security_review".to_string(),
                agent: Some(BmadAgent::SecurityExpert),
                description: "Security review and audit".to_string(),
                essential: false,
            },
            WorkflowStep {
                name: "compliance_check".to_string(),
                agent: None,
                description: "Compliance and governance check".to_string(),
                essential: false,
            },
        ]
    }
}

/// A single step in a workflow
#[derive(Debug, Clone)]
pub struct WorkflowStep {
    pub name: String,
    pub agent: Option<BmadAgent>,
    pub description: String,
    pub essential: bool,
}

/// Predefined BMAD workflows
pub fn get_workflow(workflow: BmadWorkflow) -> WorkflowDefinition {
    match workflow {
        BmadWorkflow::SprintPlanning => sprint_planning_workflow(),
        BmadWorkflow::Standup => standup_workflow(),
        BmadWorkflow::Retrospective => retrospective_workflow(),
        BmadWorkflow::SprintReview => sprint_review_workflow(),
        BmadWorkflow::FeatureDev => feature_dev_workflow(),
        BmadWorkflow::BugFix => bugfix_workflow(),
        BmadWorkflow::Release => release_workflow(),
        BmadWorkflow::CodeReview => code_review_workflow(),
        BmadWorkflow::TechDesign => tech_design_workflow(),
        BmadWorkflow::Spike => spike_workflow(),
    }
}

/// Sprint Planning Workflow
fn sprint_planning_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "sprint-planning".to_string(),
        name: "Sprint Planning".to_string(),
        description: "Plan the upcoming sprint with backlog refinement and commitment".to_string(),
        agents: vec![BmadAgent::ProductManager, BmadAgent::ScrumMaster, BmadAgent::Developer],
        steps: vec![
            WorkflowStep {
                name: "backlog_review".to_string(),
                agent: Some(BmadAgent::ProductManager),
                description: "Review and prioritize product backlog".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "sprint_goal".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Define sprint goal".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "task_breakdown".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Break down stories into tasks".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "capacity_planning".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Plan team capacity".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "sprint_commitment".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Commit to sprint backlog".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: true,
    }
}

/// Daily Standup Workflow
fn standup_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "standup".to_string(),
        name: "Daily Standup".to_string(),
        description: "Daily sync meeting for sprint progress".to_string(),
        agents: vec![BmadAgent::ScrumMaster, BmadAgent::Developer, BmadAgent::QaEngineer],
        steps: vec![
            WorkflowStep {
                name: "yesterday".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "What did you accomplish yesterday?".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "today".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "What will you do today?".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "blockers".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Any blockers or impediments?".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: false,
    }
}

/// Sprint Retrospective Workflow
fn retrospective_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "retrospective".to_string(),
        name: "Sprint Retrospective".to_string(),
        description: "Reflect on the sprint and identify improvements".to_string(),
        agents: vec![BmadAgent::ScrumMaster, BmadAgent::Developer, BmadAgent::QaEngineer],
        steps: vec![
            WorkflowStep {
                name: "what_went_well".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "What went well?".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "what_improve".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "What could be improved?".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "action_items".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Define action items for improvement".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: true,
    }
}

/// Sprint Review Workflow
fn sprint_review_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "sprint-review".to_string(),
        name: "Sprint Review".to_string(),
        description: "Demo completed work to stakeholders".to_string(),
        agents: vec![
            BmadAgent::ProductManager,
            BmadAgent::ScrumMaster,
            BmadAgent::Developer,
            BmadAgent::QaEngineer,
        ],
        steps: vec![
            WorkflowStep {
                name: "sprint_summary".to_string(),
                agent: Some(BmadAgent::ScrumMaster),
                description: "Present sprint summary".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "demo".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Demo completed features".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "feedback".to_string(),
                agent: Some(BmadAgent::ProductManager),
                description: "Collect stakeholder feedback".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "backlog_update".to_string(),
                agent: Some(BmadAgent::ProductManager),
                description: "Update backlog with feedback".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: true,
    }
}

/// Feature Development Workflow
fn feature_dev_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "feature-dev".to_string(),
        name: "Feature Development".to_string(),
        description: "Full workflow for developing a new feature".to_string(),
        agents: vec![
            BmadAgent::ProductManager,
            BmadAgent::Architect,
            BmadAgent::Developer,
            BmadAgent::UxDesigner,
            BmadAgent::QaEngineer,
            BmadAgent::TechWriter,
        ],
        steps: vec![
            WorkflowStep {
                name: "requirements".to_string(),
                agent: Some(BmadAgent::ProductManager),
                description: "Define feature requirements".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "tech_design".to_string(),
                agent: Some(BmadAgent::Architect),
                description: "Create technical design".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "ux_design".to_string(),
                agent: Some(BmadAgent::UxDesigner),
                description: "Design user experience".to_string(),
                essential: false,
            },
            WorkflowStep {
                name: "implementation".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Implement the feature".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "testing".to_string(),
                agent: Some(BmadAgent::QaEngineer),
                description: "Test the implementation".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "documentation".to_string(),
                agent: Some(BmadAgent::TechWriter),
                description: "Document the feature".to_string(),
                essential: false,
            },
        ],
        scale_adaptive: true,
    }
}

/// Bug Fix Workflow
fn bugfix_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "bugfix".to_string(),
        name: "Bug Fix".to_string(),
        description: "Workflow for fixing bugs".to_string(),
        agents: vec![BmadAgent::Developer, BmadAgent::QaEngineer],
        steps: vec![
            WorkflowStep {
                name: "investigation".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Investigate and reproduce the bug".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "fix".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Implement the fix".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "verification".to_string(),
                agent: Some(BmadAgent::QaEngineer),
                description: "Verify the fix works".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: false,
    }
}

/// Release Workflow
fn release_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "release".to_string(),
        name: "Release".to_string(),
        description: "Workflow for releasing a version".to_string(),
        agents: vec![
            BmadAgent::ReleaseManager,
            BmadAgent::DevOps,
            BmadAgent::QaEngineer,
            BmadAgent::SecurityExpert,
        ],
        steps: vec![
            WorkflowStep {
                name: "release_prep".to_string(),
                agent: Some(BmadAgent::ReleaseManager),
                description: "Prepare release".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "final_testing".to_string(),
                agent: Some(BmadAgent::QaEngineer),
                description: "Final testing and QA".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "security_check".to_string(),
                agent: Some(BmadAgent::SecurityExpert),
                description: "Security review".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "deployment".to_string(),
                agent: Some(BmadAgent::DevOps),
                description: "Deploy to production".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "monitoring".to_string(),
                agent: Some(BmadAgent::DevOps),
                description: "Monitor post-release".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: true,
    }
}

/// Code Review Workflow
fn code_review_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "code-review".to_string(),
        name: "Code Review".to_string(),
        description: "Workflow for code review process".to_string(),
        agents: vec![BmadAgent::Developer, BmadAgent::SecurityExpert],
        steps: vec![
            WorkflowStep {
                name: "self_review".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Self-review before submission".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "peer_review".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Peer code review".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "security_review".to_string(),
                agent: Some(BmadAgent::SecurityExpert),
                description: "Security-focused review".to_string(),
                essential: false,
            },
        ],
        scale_adaptive: true,
    }
}

/// Technical Design Workflow
fn tech_design_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "tech-design".to_string(),
        name: "Technical Design".to_string(),
        description: "Workflow for technical design documents".to_string(),
        agents: vec![BmadAgent::Architect, BmadAgent::Developer],
        steps: vec![
            WorkflowStep {
                name: "requirements_analysis".to_string(),
                agent: Some(BmadAgent::Architect),
                description: "Analyze requirements".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "architecture_design".to_string(),
                agent: Some(BmadAgent::Architect),
                description: "Design system architecture".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "api_design".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Design APIs".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "review".to_string(),
                agent: Some(BmadAgent::Architect),
                description: "Review design".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: true,
    }
}

/// Spike Investigation Workflow
fn spike_workflow() -> WorkflowDefinition {
    WorkflowDefinition {
        id: "spike".to_string(),
        name: "Spike".to_string(),
        description: "Investigation spike for complex problems".to_string(),
        agents: vec![BmadAgent::Developer],
        steps: vec![
            WorkflowStep {
                name: "research".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Research and investigate".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "prototype".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Create prototype or proof of concept".to_string(),
                essential: true,
            },
            WorkflowStep {
                name: "document_findings".to_string(),
                agent: Some(BmadAgent::Developer),
                description: "Document findings and recommendations".to_string(),
                essential: true,
            },
        ],
        scale_adaptive: false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sprint_planning_workflow() {
        let workflow = get_workflow(BmadWorkflow::SprintPlanning);
        assert_eq!(workflow.id, "sprint-planning");
        assert!(!workflow.steps.is_empty());
    }

    #[test]
    fn test_scale_adaptive() {
        let workflow = get_workflow(BmadWorkflow::FeatureDev);
        let small_steps = workflow.for_scale(ScaleLevel::Small);
        let enterprise_steps = workflow.for_scale(ScaleLevel::Enterprise);
        assert!(enterprise_steps.len() >= small_steps.len());
    }
}
