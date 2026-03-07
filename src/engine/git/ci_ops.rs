// CI monitoring implementation

use super::{GitError, Result, GitProvider, CiStatus, CiState, CiResult, CheckRun, CheckStatus, CheckConclusion};
use octocrab::Octocrab;
use std::time::Duration;
use tokio::time::sleep;

/// CI monitoring handler
pub struct CiIntegration {
    provider: GitProvider,
    owner: String,
    repo: String,
    token: String,
}

impl CiIntegration {
    /// Create new CiIntegration instance
    pub fn new(provider: GitProvider, owner: String, repo: String, token: String) -> Self {
        Self {
            provider,
            owner,
            repo,
            token,
        }
    }
    
    /// Create from environment variables
    pub fn from_env() -> Result<Self> {
        let provider = std::env::var("GIT_PROVIDER")
            .unwrap_or_else(|_| "github".to_string());
        
        let provider = match provider.to_lowercase().as_str() {
            "github" => GitProvider::GitHub,
            "gitlab" => GitProvider::GitLab,
            _ => return Err(GitError::ConfigError(format!("Unknown provider: {}", provider))),
        };
        
        let owner = std::env::var("GIT_OWNER")
            .map_err(|_| GitError::ConfigError("GIT_OWNER not set".to_string()))?;
        
        let repo = std::env::var("GIT_REPO")
            .map_err(|_| GitError::ConfigError("GIT_REPO not set".to_string()))?;
        
        let token = match provider {
            GitProvider::GitHub => std::env::var("GITHUB_TOKEN")
                .map_err(|_| GitError::ConfigError("GITHUB_TOKEN not set".to_string()))?,
            GitProvider::GitLab => std::env::var("GITLAB_TOKEN")
                .map_err(|_| GitError::ConfigError("GITLAB_TOKEN not set".to_string()))?,
        };
        
        Ok(Self::new(provider, owner, repo, token))
    }
    
    /// Get CI status for a PR
    pub async fn get_status(&self, pr_number: u64) -> Result<CiStatus> {
        match self.provider {
            GitProvider::GitHub => self.get_github_status(pr_number).await,
            GitProvider::GitLab => self.get_gitlab_status(pr_number).await,
        }
    }
    
    /// Wait for CI to complete
    pub async fn wait_for_completion(
        &self,
        pr_number: u64,
        timeout: Duration,
    ) -> Result<CiResult> {
        let start = std::time::Instant::now();
        let poll_interval = Duration::from_secs(30);
        
        loop {
            // Check timeout
            if start.elapsed() > timeout {
                return Err(GitError::CiOperationFailed("CI timeout".to_string()));
            }
            
            // Get status
            let status = self.get_status(pr_number).await?;
            
            // Check if complete
            match status.state {
                CiState::Success => {
                    return Ok(CiResult {
                        success: true,
                        status,
                    });
                }
                CiState::Failure | CiState::Error => {
                    return Ok(CiResult {
                        success: false,
                        status,
                    });
                }
                CiState::Pending => {
                    // Continue waiting
                    sleep(poll_interval).await;
                }
            }
        }
    }
    
    // GitHub implementation
    
    async fn get_github_status(&self, pr_number: u64) -> Result<CiStatus> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;
        
        // Get PR to get head SHA
        let pr = octocrab
            .pulls(&self.owner, &self.repo)
            .get(pr_number)
            .await?;
        
        let head_sha = pr.head.sha;
        
        use octocrab::models::StatusState;
        
        // Get statuses for the commit
        let statuses_page = octocrab
            .repos(&self.owner, &self.repo)
            .list_statuses(head_sha)
            .send()
            .await
            .map_err(|e| GitError::CiOperationFailed(e.to_string()))?;
        
        let statuses = statuses_page.items;
        
        // Determine overall state
        let mut has_failure = false;
        let mut has_pending = false;
        let mut has_success = false;
        
        for status in &statuses {
            match status.state {
                StatusState::Success => has_success = true,
                StatusState::Failure | StatusState::Error => has_failure = true,
                StatusState::Pending => has_pending = true,
                _ => {} // Handle other variants
            }
        }
        
        let state = if has_failure {
            CiState::Failure
        } else if has_pending {
            CiState::Pending
        } else if has_success {
            CiState::Success
        } else {
            CiState::Pending
        };
        
        let checks = statuses
            .iter()
            .map(|status| {
                let check_status = match status.state {
                    StatusState::Success | StatusState::Failure | StatusState::Error => CheckStatus::Completed,
                    StatusState::Pending => CheckStatus::InProgress,
                    _ => CheckStatus::Queued, // Handle other variants
                };
                
                let conclusion = match status.state {
                    StatusState::Success => Some(CheckConclusion::Success),
                    StatusState::Failure => Some(CheckConclusion::Failure),
                    StatusState::Error => Some(CheckConclusion::Failure),
                    StatusState::Pending => None,
                    _ => None, // Handle other variants
                };
                
                CheckRun {
                    name: status.context.clone().unwrap_or_else(|| "unknown".to_string()),
                    status: check_status,
                    conclusion,
                }
            })
            .collect();
        
        Ok(CiStatus { state, checks })
    }
    
    // GitLab implementation (simplified)
    
    async fn get_gitlab_status(&self, _pr_number: u64) -> Result<CiStatus> {
        // TODO: Implement GitLab CI status
        Err(GitError::CiOperationFailed("GitLab not yet implemented".to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_ci_integration_creation() {
        let ci = CiIntegration::new(
            GitProvider::GitHub,
            "owner".to_string(),
            "repo".to_string(),
            "token".to_string(),
        );
        
        assert_eq!(ci.provider, GitProvider::GitHub);
        assert_eq!(ci.owner, "owner");
        assert_eq!(ci.repo, "repo");
    }
    
    #[test]
    fn test_ci_state() {
        assert_eq!(CiState::Success, CiState::Success);
        assert_ne!(CiState::Success, CiState::Failure);
    }
    
    #[test]
    fn test_check_status() {
        assert_eq!(CheckStatus::Completed, CheckStatus::Completed);
        assert_ne!(CheckStatus::Completed, CheckStatus::InProgress);
    }
}
