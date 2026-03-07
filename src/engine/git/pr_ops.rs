// PR/MR operations implementation

use super::{GitError, GitProvider, PrInfo, PrParams, PrState, Result};
use octocrab::Octocrab;

/// PR/MR operations handler
pub struct PrIntegration {
    provider: GitProvider,
    owner: String,
    repo: String,
    token: String,
}

impl PrIntegration {
    /// Create new PrIntegration instance
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
        let provider = std::env::var("GIT_PROVIDER").unwrap_or_else(|_| "github".to_string());

        let provider = match provider.to_lowercase().as_str() {
            "github" => GitProvider::GitHub,
            "gitlab" => GitProvider::GitLab,
            _ => {
                return Err(GitError::ConfigError(format!(
                    "Unknown provider: {}",
                    provider
                )))
            }
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

    /// Create a pull request
    pub async fn create_pr(&self, params: PrParams) -> Result<PrInfo> {
        match self.provider {
            GitProvider::GitHub => self.create_github_pr(params).await,
            GitProvider::GitLab => self.create_gitlab_mr(params).await,
        }
    }

    /// Add reviewers to PR
    pub async fn add_reviewers(&self, pr_number: u64, reviewers: Vec<String>) -> Result<()> {
        match self.provider {
            GitProvider::GitHub => self.add_github_reviewers(pr_number, reviewers).await,
            GitProvider::GitLab => self.add_gitlab_reviewers(pr_number, reviewers).await,
        }
    }

    /// Get PR information
    pub async fn get_pr(&self, pr_number: u64) -> Result<PrInfo> {
        match self.provider {
            GitProvider::GitHub => self.get_github_pr(pr_number).await,
            GitProvider::GitLab => self.get_gitlab_mr(pr_number).await,
        }
    }

    // GitHub implementation

    async fn create_github_pr(&self, params: PrParams) -> Result<PrInfo> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;

        let pr = octocrab
            .pulls(&self.owner, &self.repo)
            .create(&params.title, &params.head, &params.base)
            .body(&params.body)
            .draft(params.draft)
            .send()
            .await?;

        let state = if pr.merged_at.is_some() {
            PrState::Merged
        } else if pr.closed_at.is_some() {
            PrState::Closed
        } else {
            PrState::Open
        };

        Ok(PrInfo {
            number: pr.number,
            url: pr.html_url.map(|u| u.to_string()).unwrap_or_default(),
            state,
            mergeable: pr.mergeable.unwrap_or(false),
            head_sha: pr.head.sha,
        })
    }

    async fn add_github_reviewers(&self, pr_number: u64, reviewers: Vec<String>) -> Result<()> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;

        octocrab
            .pulls(&self.owner, &self.repo)
            .request_reviews(pr_number, reviewers, vec![])
            .await?;

        Ok(())
    }

    async fn get_github_pr(&self, pr_number: u64) -> Result<PrInfo> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;

        let pr = octocrab
            .pulls(&self.owner, &self.repo)
            .get(pr_number)
            .await?;

        let state = if pr.merged_at.is_some() {
            PrState::Merged
        } else if pr.closed_at.is_some() {
            PrState::Closed
        } else {
            PrState::Open
        };

        Ok(PrInfo {
            number: pr.number,
            url: pr.html_url.map(|u| u.to_string()).unwrap_or_default(),
            state,
            mergeable: pr.mergeable.unwrap_or(false),
            head_sha: pr.head.sha,
        })
    }

    // GitLab implementation (simplified - would need gitlab crate)

    async fn create_gitlab_mr(&self, _params: PrParams) -> Result<PrInfo> {
        // TODO: Implement GitLab MR creation
        Err(GitError::PrOperationFailed(
            "GitLab not yet implemented".to_string(),
        ))
    }

    async fn add_gitlab_reviewers(&self, _pr_number: u64, _reviewers: Vec<String>) -> Result<()> {
        // TODO: Implement GitLab reviewer addition
        Err(GitError::PrOperationFailed(
            "GitLab not yet implemented".to_string(),
        ))
    }

    async fn get_gitlab_mr(&self, _pr_number: u64) -> Result<PrInfo> {
        // TODO: Implement GitLab MR retrieval
        Err(GitError::PrOperationFailed(
            "GitLab not yet implemented".to_string(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pr_integration_creation() {
        let pr_integration = PrIntegration::new(
            GitProvider::GitHub,
            "owner".to_string(),
            "repo".to_string(),
            "token".to_string(),
        );

        assert_eq!(pr_integration.provider, GitProvider::GitHub);
        assert_eq!(pr_integration.owner, "owner");
        assert_eq!(pr_integration.repo, "repo");
    }

    #[tokio::test]
    async fn test_create_pr_params() {
        let params = PrParams {
            title: "Test PR".to_string(),
            body: "Test body".to_string(),
            head: "feature".to_string(),
            base: "main".to_string(),
            draft: false,
        };

        assert_eq!(params.title, "Test PR");
        assert_eq!(params.head, "feature");
        assert_eq!(params.base, "main");
        assert!(!params.draft);
    }
}
