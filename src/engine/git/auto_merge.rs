// Auto-merge implementation

use super::ci_ops::CiIntegration;
use super::{
    AutoMergePolicy, CiState, GitError, GitProvider, MergeDecision, MergeStrategy, PrInfo, PrState,
    Result,
};
use octocrab::Octocrab;

/// Auto-merge handler
pub struct AutoMerge {
    provider: GitProvider,
    owner: String,
    repo: String,
    token: String,
    policy: AutoMergePolicy,
}

impl AutoMerge {
    /// Create new AutoMerge instance
    pub fn new(
        provider: GitProvider,
        owner: String,
        repo: String,
        token: String,
        policy: AutoMergePolicy,
    ) -> Self {
        Self {
            provider,
            owner,
            repo,
            token,
            policy,
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

        let policy = AutoMergePolicy::default();

        Ok(Self::new(provider, owner, repo, token, policy))
    }

    /// Check if PR can be merged
    pub async fn can_merge(&self, pr: &PrInfo) -> Result<MergeDecision> {
        // Check PR state
        if pr.state != PrState::Open {
            return Ok(MergeDecision {
                can_merge: false,
                reason: Some("PR is not open".to_string()),
            });
        }

        // Check if mergeable
        if !pr.mergeable {
            return Ok(MergeDecision {
                can_merge: false,
                reason: Some("PR has merge conflicts".to_string()),
            });
        }

        // Check CI status if required
        if self.policy.require_ci_success {
            let ci = CiIntegration::new(
                self.provider.clone(),
                self.owner.clone(),
                self.repo.clone(),
                self.token.clone(),
            );

            let ci_status = ci.get_status(pr.number).await?;

            if ci_status.state != CiState::Success {
                return Ok(MergeDecision {
                    can_merge: false,
                    reason: Some(format!("CI status is {:?}", ci_status.state)),
                });
            }
        }

        // Check reviews if required
        if self.policy.require_reviews > 0 || self.policy.require_approval {
            let reviews = self.get_reviews(pr.number).await?;

            if reviews < self.policy.require_reviews {
                return Ok(MergeDecision {
                    can_merge: false,
                    reason: Some(format!(
                        "Need {} reviews, have {}",
                        self.policy.require_reviews, reviews
                    )),
                });
            }
        }

        Ok(MergeDecision {
            can_merge: true,
            reason: None,
        })
    }

    /// Merge PR
    pub async fn merge(&self, pr: &PrInfo, strategy: MergeStrategy) -> Result<()> {
        // Check if strategy is allowed
        if !self.policy.allowed_strategies.contains(&strategy) {
            return Err(GitError::MergeFailed(format!(
                "Merge strategy {:?} not allowed by policy",
                strategy
            )));
        }

        // Check if can merge
        let decision = self.can_merge(pr).await?;
        if !decision.can_merge {
            return Err(GitError::MergeFailed(
                decision
                    .reason
                    .unwrap_or_else(|| "Cannot merge".to_string()),
            ));
        }

        // Perform merge
        match self.provider {
            GitProvider::GitHub => self.merge_github_pr(pr.number, strategy).await,
            GitProvider::GitLab => self.merge_gitlab_mr(pr.number, strategy).await,
        }
    }

    // GitHub implementation

    async fn merge_github_pr(&self, pr_number: u64, strategy: MergeStrategy) -> Result<()> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;

        let merge_method = match strategy {
            MergeStrategy::Merge => octocrab::params::pulls::MergeMethod::Merge,
            MergeStrategy::Squash => octocrab::params::pulls::MergeMethod::Squash,
            MergeStrategy::Rebase => octocrab::params::pulls::MergeMethod::Rebase,
        };

        octocrab
            .pulls(&self.owner, &self.repo)
            .merge(pr_number)
            .method(merge_method)
            .send()
            .await
            .map_err(|e| GitError::MergeFailed(e.to_string()))?;

        Ok(())
    }

    async fn get_reviews(&self, pr_number: u64) -> Result<usize> {
        let octocrab = Octocrab::builder()
            .personal_token(self.token.clone())
            .build()
            .map_err(|e| GitError::ApiError(e.to_string()))?;

        // Get PR to check review count
        let pr = octocrab
            .pulls(&self.owner, &self.repo)
            .get(pr_number)
            .await?;

        // Use requested_reviewers as a simple count
        // In production, you'd want to check actual review approvals
        let review_count = pr
            .requested_reviewers
            .as_ref()
            .map(|r| r.len())
            .unwrap_or(0);

        Ok(review_count)
    }

    // GitLab implementation (simplified)

    async fn merge_gitlab_mr(&self, _pr_number: u64, _strategy: MergeStrategy) -> Result<()> {
        // TODO: Implement GitLab MR merge
        Err(GitError::MergeFailed(
            "GitLab not yet implemented".to_string(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auto_merge_creation() {
        let policy = AutoMergePolicy::default();
        let auto_merge = AutoMerge::new(
            GitProvider::GitHub,
            "owner".to_string(),
            "repo".to_string(),
            "token".to_string(),
            policy,
        );

        assert_eq!(auto_merge.provider, GitProvider::GitHub);
        assert_eq!(auto_merge.owner, "owner");
        assert_eq!(auto_merge.repo, "repo");
    }

    #[test]
    fn test_merge_strategy() {
        assert_eq!(MergeStrategy::Squash, MergeStrategy::Squash);
        assert_ne!(MergeStrategy::Squash, MergeStrategy::Merge);
    }

    #[test]
    fn test_auto_merge_policy() {
        let policy = AutoMergePolicy::default();

        assert!(policy.require_ci_success);
        assert_eq!(policy.require_reviews, 1);
        assert!(policy.require_approval);
        assert_eq!(policy.allowed_strategies.len(), 1);
    }

    #[tokio::test]
    async fn test_merge_decision() {
        let decision = MergeDecision {
            can_merge: true,
            reason: None,
        };

        assert!(decision.can_merge);
        assert!(decision.reason.is_none());
    }
}
