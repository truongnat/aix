//! BMAD Module - Native BMAD-METHOD Integration
//!
//! This module provides native BMAD-METHOD features including:
//! - Specialized agents (PM, Architect, Developer, UX, Scrum Master, QA)
//! - Agile workflows (sprint planning, standup, retrospective)
//! - Party Mode (multi-agent collaboration)
//! - Scale-domain-adaptive intelligence

use serde::{Deserialize, Serialize};

pub mod agents;
pub mod workflows;
pub mod party_mode;
pub mod planning;

/// BMAD agent types matching BMAD-METHOD
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum BmadAgent {
    /// Product Manager - manages requirements and priorities
    ProductManager,
    /// Architect - designs system architecture
    Architect,
    /// Developer - implements features
    Developer,
    /// UX Designer - designs user experience
    UxDesigner,
    /// Scrum Master - facilitates agile processes
    ScrumMaster,
    /// QA Engineer - ensures quality
    QaEngineer,
    /// Tech Writer - creates documentation
    TechWriter,
    /// DevOps - handles deployment and infrastructure
    DevOps,
    /// Security Expert - reviews security
    SecurityExpert,
    /// Data Engineer - handles data pipelines
    DataEngineer,
    /// AI Engineer - handles ML/AI components
    AiEngineer,
    /// Release Manager - manages releases
    ReleaseManager,
}

impl BmadAgent {
    pub fn role_name(&self) -> &'static str {
        match self {
            BmadAgent::ProductManager => "pm",
            BmadAgent::Architect => "architect",
            BmadAgent::Developer => "dev",
            BmadAgent::UxDesigner => "ux",
            BmadAgent::ScrumMaster => "sm",
            BmadAgent::QaEngineer => "qa",
            BmadAgent::TechWriter => "tech-writer",
            BmadAgent::DevOps => "devops",
            BmadAgent::SecurityExpert => "security",
            BmadAgent::DataEngineer => "data",
            BmadAgent::AiEngineer => "ai",
            BmadAgent::ReleaseManager => "releaser",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            BmadAgent::ProductManager => "Manages requirements, priorities, and product backlog",
            BmadAgent::Architect => "Designs system architecture and technical decisions",
            BmadAgent::Developer => "Implements features and writes code",
            BmadAgent::UxDesigner => "Designs user experience and interfaces",
            BmadAgent::ScrumMaster => "Facilitates agile ceremonies and removes impediments",
            BmadAgent::QaEngineer => "Creates tests and ensures quality",
            BmadAgent::TechWriter => "Creates documentation and guides",
            BmadAgent::DevOps => "Handles deployment, CI/CD, and infrastructure",
            BmadAgent::SecurityExpert => "Reviews security and identifies vulnerabilities",
            BmadAgent::DataEngineer => "Builds data pipelines and manages data",
            BmadAgent::AiEngineer => "Develops ML/AI models and integration",
            BmadAgent::ReleaseManager => "Manages release process and versioning",
        }
    }
}

/// BMAD workflow types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "kebab-case")]
pub enum BmadWorkflow {
    /// Sprint planning workflow
    SprintPlanning,
    /// Daily standup workflow
    Standup,
    /// Sprint retrospective workflow
    Retrospective,
    /// Sprint review workflow
    SprintReview,
    /// Feature development workflow
    FeatureDev,
    /// Bug fix workflow
    BugFix,
    /// Release workflow
    Release,
    /// Code review workflow
    CodeReview,
    /// Technical design workflow
    TechDesign,
    /// Spike investigation workflow
    Spike,
}

impl BmadWorkflow {
    pub fn workflow_id(&self) -> &'static str {
        match self {
            BmadWorkflow::SprintPlanning => "sprint-planning",
            BmadWorkflow::Standup => "standup",
            BmadWorkflow::Retrospective => "retrospective",
            BmadWorkflow::SprintReview => "sprint-review",
            BmadWorkflow::FeatureDev => "feature-dev",
            BmadWorkflow::BugFix => "bugfix",
            BmadWorkflow::Release => "release",
            BmadWorkflow::CodeReview => "code-review",
            BmadWorkflow::TechDesign => "tech-design",
            BmadWorkflow::Spike => "spike",
        }
    }
}

/// Scale domain adaptive intelligence levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ScaleLevel {
    /// Small/简单 - Minimal planning
    Small,
    /// Medium/中等 - Standard planning
    Medium,
    /// Large/大 - Detailed planning
    Large,
    /// Enterprise - Full governance
    Enterprise,
}

impl ScaleLevel {
    /// Determine scale from project characteristics
    pub fn from_complexity(complexity: f64, team_size: usize) -> Self {
        match (complexity, team_size) {
            (c, _) if c < 0.3 => ScaleLevel::Small,
            (c, t) if c < 0.7 && t < 5 => ScaleLevel::Medium,
            (c, t) if c < 0.7 && t >= 5 => ScaleLevel::Large,
            _ => ScaleLevel::Enterprise,
        }
    }

    /// Adjust planning depth based on scale
    pub fn planning_depth(&self) -> &'static str {
        match self {
            ScaleLevel::Small => "minimal",
            ScaleLevel::Medium => "standard",
            ScaleLevel::Large => "detailed",
            ScaleLevel::Enterprise => "full",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_role_name() {
        assert_eq!(BmadAgent::ProductManager.role_name(), "pm");
        assert_eq!(BmadAgent::Architect.role_name(), "architect");
        assert_eq!(BmadAgent::Developer.role_name(), "dev");
    }

    #[test]
    fn test_scale_level() {
        assert_eq!(ScaleLevel::from_complexity(0.2, 1), ScaleLevel::Small);
        assert_eq!(ScaleLevel::from_complexity(0.5, 3), ScaleLevel::Medium);
        assert_eq!(ScaleLevel::from_complexity(0.8, 10), ScaleLevel::Enterprise);
    }
}
