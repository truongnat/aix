use anyhow::{anyhow, Result};
use std::path::Path;
use std::process::Command;

#[derive(Debug, Clone)]
pub struct BranchingPolicy {
    pub prefix: String,
    pub allow_auto_create: bool,
    pub allow_auto_checkout: bool,
}

impl Default for BranchingPolicy {
    fn default() -> Self {
        Self {
            prefix: "thread/".to_string(),
            allow_auto_create: true,
            allow_auto_checkout: true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct GitBranchOrchestrator {
    project_root: String,
    policy: BranchingPolicy,
}

impl GitBranchOrchestrator {
    #[allow(dead_code)]
    pub fn new(project_root: impl Into<String>) -> Self {
        Self::new_with_policy(project_root, BranchingPolicy::default())
    }

    pub fn new_with_policy(project_root: impl Into<String>, policy: BranchingPolicy) -> Self {
        Self {
            project_root: project_root.into(),
            policy,
        }
    }

    #[allow(dead_code)]
    pub fn branch_for_thread(thread_id: &str) -> String {
        Self::branch_for_thread_with_prefix(thread_id, "thread/")
    }

    pub fn branch_for_thread_with_prefix(thread_id: &str, prefix: &str) -> String {
        let slug = thread_id
            .chars()
            .map(|ch| match ch {
                'a'..='z' | '0'..='9' => ch,
                'A'..='Z' => ch.to_ascii_lowercase(),
                _ => '-',
            })
            .collect::<String>()
            .split('-')
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join("-");
        let normalized_prefix = prefix.trim();
        let normalized_prefix = if normalized_prefix.is_empty() {
            "thread/"
        } else if normalized_prefix.ends_with('/') {
            normalized_prefix
        } else {
            return format!(
                "{}/{}",
                normalized_prefix,
                if slug.is_empty() { "session" } else { &slug }
            );
        };
        format!(
            "{}{}",
            normalized_prefix,
            if slug.is_empty() { "session" } else { &slug }
        )
    }

    pub fn ensure_branch_for_thread(&self, thread_id: &str) -> Result<String> {
        let target_branch = Self::branch_for_thread_with_prefix(thread_id, &self.policy.prefix);
        self.ensure_branch_checked_out(&target_branch)?;
        Ok(target_branch)
    }

    fn current_branch(&self, root: &Path) -> Result<String> {
        let output = Command::new("git")
            .arg("rev-parse")
            .arg("--abbrev-ref")
            .arg("HEAD")
            .current_dir(root)
            .output()?;
        if !output.status.success() {
            return Err(anyhow!(
                "Failed to resolve current branch: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ));
        }
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }

    pub fn ensure_branch_checked_out(&self, branch: &str) -> Result<()> {
        let root = Path::new(&self.project_root);
        if !root.exists() {
            return Err(anyhow!(
                "Project root does not exist: {}",
                self.project_root
            ));
        }

        let required_prefix = self.policy.prefix.trim();
        if !required_prefix.is_empty() && !branch.starts_with(required_prefix) {
            return Err(anyhow!(
                "Branch '{}' violates branching prefix policy '{}'",
                branch,
                required_prefix
            ));
        }

        let inside_git = Command::new("git")
            .arg("rev-parse")
            .arg("--is-inside-work-tree")
            .current_dir(root)
            .output()?;
        if !inside_git.status.success() {
            return Err(anyhow!(
                "Project root is not a git repository: {}",
                self.project_root
            ));
        }

        let exists = Command::new("git")
            .arg("show-ref")
            .arg("--verify")
            .arg(format!("refs/heads/{}", branch))
            .current_dir(root)
            .output()?
            .status
            .success();

        let current_branch = self.current_branch(root)?;
        if current_branch == branch {
            return Ok(());
        }

        if exists && !self.policy.allow_auto_checkout {
            return Err(anyhow!(
                "Auto checkout disabled by branching policy; current='{}' target='{}'",
                current_branch,
                branch
            ));
        }
        if !exists && !self.policy.allow_auto_create {
            return Err(anyhow!(
                "Auto branch creation disabled by branching policy; missing '{}'",
                branch
            ));
        }

        let status = if exists {
            Command::new("git")
                .arg("checkout")
                .arg(branch)
                .current_dir(root)
                .status()?
        } else {
            Command::new("git")
                .arg("checkout")
                .arg("-b")
                .arg(branch)
                .current_dir(root)
                .status()?
        };

        if !status.success() {
            return Err(anyhow!("Failed to switch to git branch '{}'", branch));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::GitBranchOrchestrator;

    #[test]
    fn thread_id_maps_to_deterministic_branch() {
        let branch = GitBranchOrchestrator::branch_for_thread("Thread A: Login Refactor");
        assert_eq!(branch, "thread/thread-a-login-refactor");
    }

    #[test]
    fn thread_id_uses_configurable_prefix() {
        let branch = GitBranchOrchestrator::branch_for_thread_with_prefix(
            "Thread A: Login Refactor",
            "feat/",
        );
        assert_eq!(branch, "feat/thread-a-login-refactor");
    }

    #[test]
    fn empty_prefix_falls_back_to_default() {
        let branch = GitBranchOrchestrator::branch_for_thread_with_prefix("ABC", "");
        assert_eq!(branch, "thread/abc");
    }
}
