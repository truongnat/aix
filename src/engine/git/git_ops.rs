// Git operations implementation

use super::{GitError, Result};
use git2::{BranchType, IndexAddOption, Repository, Signature};
use std::path::{Path, PathBuf};

/// Git operations handler
pub struct GitIntegration {
    repo_path: PathBuf,
}

impl GitIntegration {
    /// Create new GitIntegration instance
    pub fn new(repo_path: impl AsRef<Path>) -> Result<Self> {
        let repo_path = repo_path.as_ref().to_path_buf();

        // Verify repository exists
        Repository::open(&repo_path)
            .map_err(|_| GitError::RepositoryNotFound(repo_path.display().to_string()))?;

        Ok(Self { repo_path })
    }

    /// Create a new branch
    pub fn create_branch(&self, name: &str, base: &str) -> Result<()> {
        let repo = Repository::open(&self.repo_path)?;

        // Find base commit
        let base_ref = repo
            .find_reference(&format!("refs/heads/{}", base))
            .or_else(|_| repo.find_reference(&format!("refs/remotes/origin/{}", base)))
            .map_err(|_| GitError::BranchNotFound(base.to_string()))?;

        let base_commit = base_ref
            .peel_to_commit()
            .map_err(|e| GitError::GitOperationFailed(e.to_string()))?;

        // Create new branch
        repo.branch(name, &base_commit, false)
            .map_err(|e| GitError::GitOperationFailed(format!("Failed to create branch: {}", e)))?;

        // Checkout new branch
        let obj = repo
            .revparse_single(&format!("refs/heads/{}", name))
            .map_err(|e| GitError::GitOperationFailed(e.to_string()))?;

        repo.checkout_tree(&obj, None)
            .map_err(|e| GitError::GitOperationFailed(e.to_string()))?;

        repo.set_head(&format!("refs/heads/{}", name))
            .map_err(|e| GitError::GitOperationFailed(e.to_string()))?;

        Ok(())
    }

    /// Commit changes
    pub fn commit(&self, message: &str, files: Vec<PathBuf>) -> Result<String> {
        let repo = Repository::open(&self.repo_path)?;

        // Get signature
        let signature = Self::get_signature(&repo)?;

        // Stage files
        let mut index = repo
            .index()
            .map_err(|e| GitError::CommitFailed(e.to_string()))?;

        if files.is_empty() {
            // Stage all changes
            index
                .add_all(["*"].iter(), IndexAddOption::DEFAULT, None)
                .map_err(|e| GitError::CommitFailed(e.to_string()))?;
        } else {
            // Stage specific files
            for file in files {
                let relative_path = file.strip_prefix(&self.repo_path).unwrap_or(&file);
                index.add_path(relative_path).map_err(|e| {
                    GitError::CommitFailed(format!(
                        "Failed to stage {}: {}",
                        relative_path.display(),
                        e
                    ))
                })?;
            }
        }

        index
            .write()
            .map_err(|e| GitError::CommitFailed(e.to_string()))?;

        // Create tree
        let tree_id = index
            .write_tree()
            .map_err(|e| GitError::CommitFailed(e.to_string()))?;
        let tree = repo
            .find_tree(tree_id)
            .map_err(|e| GitError::CommitFailed(e.to_string()))?;

        // Get parent commit
        let parent_commit = repo.head().ok().and_then(|head| head.peel_to_commit().ok());

        // Create commit
        let commit_id = if let Some(parent) = parent_commit.as_ref() {
            repo.commit(
                Some("HEAD"),
                &signature,
                &signature,
                message,
                &tree,
                &[parent],
            )
            .map_err(|e| GitError::CommitFailed(e.to_string()))?
        } else {
            // Initial commit (no parents)
            repo.commit(Some("HEAD"), &signature, &signature, message, &tree, &[])
                .map_err(|e| GitError::CommitFailed(e.to_string()))?
        };

        Ok(commit_id.to_string())
    }

    /// Push branch to remote
    pub fn push(&self, branch: &str, force: bool) -> Result<()> {
        let repo = Repository::open(&self.repo_path)?;

        // Get remote
        let mut remote = repo
            .find_remote("origin")
            .map_err(|e| GitError::PushFailed(format!("Remote 'origin' not found: {}", e)))?;

        // Build refspec
        let refspec = if force {
            format!("+refs/heads/{}:refs/heads/{}", branch, branch)
        } else {
            format!("refs/heads/{}:refs/heads/{}", branch, branch)
        };

        // Push
        remote
            .push(&[&refspec], None)
            .map_err(|e| GitError::PushFailed(e.to_string()))?;

        Ok(())
    }

    /// Get current branch name
    pub fn current_branch(&self) -> Result<String> {
        let repo = Repository::open(&self.repo_path)?;

        let head = repo
            .head()
            .map_err(|e| GitError::GitOperationFailed(e.to_string()))?;

        let branch_name = head
            .shorthand()
            .ok_or_else(|| GitError::GitOperationFailed("Failed to get branch name".to_string()))?;

        Ok(branch_name.to_string())
    }

    /// Check if branch exists
    pub fn branch_exists(&self, name: &str) -> Result<bool> {
        let repo = Repository::open(&self.repo_path)?;

        let exists = repo.find_branch(name, BranchType::Local).is_ok();
        Ok(exists)
    }

    /// Get signature from config or use default
    fn get_signature(repo: &Repository) -> Result<Signature<'static>> {
        let config = repo
            .config()
            .map_err(|e| GitError::ConfigError(e.to_string()))?;

        let name = config
            .get_string("user.name")
            .unwrap_or_else(|_| "Agentic SDLC".to_string());

        let email = config
            .get_string("user.email")
            .unwrap_or_else(|_| "agentic-sdlc@example.com".to_string());

        Signature::now(&name, &email).map_err(|e| GitError::ConfigError(e.to_string()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn setup_test_repo() -> (TempDir, PathBuf) {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path().to_path_buf();

        // Initialize repository
        Repository::init(&repo_path).unwrap();

        // Configure user
        let repo = Repository::open(&repo_path).unwrap();
        let mut config = repo.config().unwrap();
        config.set_str("user.name", "Test User").unwrap();
        config.set_str("user.email", "test@example.com").unwrap();

        // Create initial commit
        let signature = Signature::now("Test User", "test@example.com").unwrap();
        let tree_id = repo.index().unwrap().write_tree().unwrap();
        let tree = repo.find_tree(tree_id).unwrap();
        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            "Initial commit",
            &tree,
            &[],
        )
        .unwrap();

        (temp_dir, repo_path)
    }

    #[test]
    fn test_create_branch() {
        let (_temp_dir, repo_path) = setup_test_repo();
        let git = GitIntegration::new(&repo_path).unwrap();

        // Create branch
        git.create_branch("feature", "master").unwrap();

        // Verify branch exists
        assert!(git.branch_exists("feature").unwrap());
    }

    #[test]
    fn test_commit() {
        let (_temp_dir, repo_path) = setup_test_repo();
        let git = GitIntegration::new(&repo_path).unwrap();

        // Create a file
        std::fs::write(repo_path.join("test.txt"), "test content").unwrap();

        // Commit
        let commit_id = git.commit("Test commit", vec![]).unwrap();

        // Verify commit exists
        assert!(!commit_id.is_empty());
    }

    #[test]
    fn test_current_branch() {
        let (_temp_dir, repo_path) = setup_test_repo();
        let git = GitIntegration::new(&repo_path).unwrap();

        // Get current branch
        let branch = git.current_branch().unwrap();

        // Should be master or main
        assert!(branch == "master" || branch == "main");
    }
}
