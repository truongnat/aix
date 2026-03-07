// Git integration module
//
// Provides Git operations, PR/MR creation, CI monitoring, and auto-merge capabilities.

#![allow(dead_code)]

pub mod auto_merge;
pub mod branch_orchestrator;
pub mod ci_ops;
pub mod error;
pub mod git_ops;
pub mod pr_ops;
pub mod types;

pub use branch_orchestrator::{BranchingPolicy, GitBranchOrchestrator};
pub use error::*;
pub use types::*;
