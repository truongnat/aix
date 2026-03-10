//! Role definitions for Office simulation
//!
//! Defines the different roles in a company simulation

use serde::{Deserialize, Serialize};

/// Company roles for office simulation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Role {
    /// Chief Executive Officer - Strategic decisions, final approval
    CEO,
    /// Chief Technology Officer - Technical architecture, code review
    CTO,
    /// Product Manager - Task planning, prioritization
    PM,
    /// Engineer - Implementation
    Engineer,
    /// Designer - UI/UX
    Designer,
    /// Quality Assurance - Testing
    QA,
}

impl Role {
    /// Get all available roles
    pub fn all() -> Vec<Role> {
        vec![
            Role::CEO,
            Role::CTO,
            Role::PM,
            Role::Engineer,
            Role::Designer,
            Role::QA,
        ]
    }

    /// Get role from string
    pub fn from_str(s: &str) -> Option<Role> {
        match s.to_lowercase().as_str() {
            "ceo" => Some(Role::CEO),
            "cto" => Some(Role::CTO),
            "pm" | "product_manager" => Some(Role::PM),
            "engineer" | "dev" | "developer" => Some(Role::Engineer),
            "designer" | "ui" | "ux" => Some(Role::Designer),
            "qa" | "tester" | "quality" => Some(Role::QA),
            _ => None,
        }
    }

    /// Get role description
    pub fn description(&self) -> &'static str {
        match self {
            Role::CEO => "Strategic decisions, final approval",
            Role::CTO => "Technical architecture, code review",
            Role::PM => "Task planning, prioritization",
            Role::Engineer => "Implementation, coding",
            Role::Designer => "UI/UX design",
            Role::QA => "Testing, quality assurance",
        }
    }

    /// Get role color for terminal output
    pub fn color(&self) -> &'static str {
        match self {
            Role::CEO => "\x1b[35m",    // Magenta
            Role::CTO => "\x1b[34m",    // Blue
            Role::PM => "\x1b[33m",       // Yellow
            Role::Engineer => "\x1b[32m", // Green
            Role::Designer => "\x1b[36m", // Cyan
            Role::QA => "\x1b[31m",       // Red
        }
    }

    /// Get the skills this role is typically responsible for
    pub fn typical_skills(&self) -> Vec<&'static str> {
        match self {
            Role::CEO => vec!["approval", "strategy", "decision"],
            Role::CTO => vec!["code_review", "architecture", "technical_decision"],
            Role::PM => vec!["planning", "prioritization", "requirements"],
            Role::Engineer => vec!["implementation", "coding", "debugging"],
            Role::Designer => vec!["design", "ui_design", "ux_design"],
            Role::QA => vec!["testing", "qa", "validation"],
        }
    }

    /// Reset color
    pub fn reset_color() -> &'static str {
        "\x1b[0m"
    }
}

impl std::fmt::Display for Role {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
