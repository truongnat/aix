// Common types for Git integration

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Git provider type
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum GitProvider {
    GitHub,
    GitLab,
}

/// PR/MR parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrParams {
    pub title: String,
    pub body: String,
    pub head: String,
    pub base: String,
    pub draft: bool,
}

/// PR/MR information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrInfo {
    pub number: u64,
    pub url: String,
    pub state: PrState,
    pub mergeable: bool,
    pub head_sha: String,
}

/// PR/MR state
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PrState {
    Open,
    Closed,
    Merged,
}

/// CI status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiStatus {
    pub state: CiState,
    pub checks: Vec<CheckRun>,
}

/// CI state
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CiState {
    Pending,
    Success,
    Failure,
    Error,
}

/// Individual check run
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckRun {
    pub name: String,
    pub status: CheckStatus,
    pub conclusion: Option<CheckConclusion>,
}

/// Check status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CheckStatus {
    Queued,
    InProgress,
    Completed,
}

/// Check conclusion
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CheckConclusion {
    Success,
    Failure,
    Neutral,
    Cancelled,
    Skipped,
    TimedOut,
    ActionRequired,
}

/// CI result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CiResult {
    pub success: bool,
    pub status: CiStatus,
}

/// Merge strategy
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MergeStrategy {
    Merge,
    Squash,
    Rebase,
}

/// Merge decision
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeDecision {
    pub can_merge: bool,
    pub reason: Option<String>,
}

/// Auto-merge policy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoMergePolicy {
    pub require_ci_success: bool,
    pub require_reviews: usize,
    pub require_approval: bool,
    pub allowed_strategies: Vec<MergeStrategy>,
}

impl Default for AutoMergePolicy {
    fn default() -> Self {
        Self {
            require_ci_success: true,
            require_reviews: 1,
            require_approval: true,
            allowed_strategies: vec![MergeStrategy::Squash],
        }
    }
}
