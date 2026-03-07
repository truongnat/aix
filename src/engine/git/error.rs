// Error types for Git integration

use std::fmt;

#[derive(Debug)]
pub enum GitError {
    /// Git operation failed
    GitOperationFailed(String),

    /// Repository not found
    RepositoryNotFound(String),

    /// Branch not found
    BranchNotFound(String),

    /// Commit failed
    CommitFailed(String),

    /// Push failed
    PushFailed(String),

    /// PR/MR operation failed
    PrOperationFailed(String),

    /// CI operation failed
    CiOperationFailed(String),

    /// Merge failed
    MergeFailed(String),

    /// Authentication failed
    AuthenticationFailed(String),

    /// API error
    ApiError(String),

    /// Configuration error
    ConfigError(String),

    /// Other error
    Other(String),
}

impl fmt::Display for GitError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GitError::GitOperationFailed(msg) => write!(f, "Git operation failed: {}", msg),
            GitError::RepositoryNotFound(msg) => write!(f, "Repository not found: {}", msg),
            GitError::BranchNotFound(msg) => write!(f, "Branch not found: {}", msg),
            GitError::CommitFailed(msg) => write!(f, "Commit failed: {}", msg),
            GitError::PushFailed(msg) => write!(f, "Push failed: {}", msg),
            GitError::PrOperationFailed(msg) => write!(f, "PR/MR operation failed: {}", msg),
            GitError::CiOperationFailed(msg) => write!(f, "CI operation failed: {}", msg),
            GitError::MergeFailed(msg) => write!(f, "Merge failed: {}", msg),
            GitError::AuthenticationFailed(msg) => write!(f, "Authentication failed: {}", msg),
            GitError::ApiError(msg) => write!(f, "API error: {}", msg),
            GitError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
            GitError::Other(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for GitError {}

impl From<git2::Error> for GitError {
    fn from(err: git2::Error) -> Self {
        GitError::GitOperationFailed(err.to_string())
    }
}

impl From<octocrab::Error> for GitError {
    fn from(err: octocrab::Error) -> Self {
        GitError::ApiError(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, GitError>;
