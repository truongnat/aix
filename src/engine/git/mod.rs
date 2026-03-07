// Git integration module
//
// Provides Git operations, PR/MR creation, CI monitoring, and auto-merge capabilities.

pub mod types;
pub mod error;
pub mod git_ops;
pub mod pr_ops;
pub mod ci_ops;
pub mod auto_merge;
pub mod branch_orchestrator;

pub use types::*;
pub use error::*;
pub use git_ops::GitIntegration;
pub use pr_ops::PrIntegration;
pub use ci_ops::CiIntegration;
pub use auto_merge::AutoMerge;
pub use branch_orchestrator::{GitBranchOrchestrator, BranchingPolicy};
