# Git Integration Guide

Complete guide to Git operations and CI/CD integration in `agentic-sdlc`.

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Git Operations](#git-operations)
- [PR/MR Creation](#prmr-creation)
- [CI/CD Integration](#cicd-integration)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Git integration system provides **full automation** of git workflows:
- Create branches
- Commit changes
- Push to remote
- Create pull requests
- Monitor CI status
- Auto-merge with policies

### Key Features

✅ **Full Git Operations** - Branch, commit, push automation  
✅ **PR/MR Creation** - GitHub and GitLab support  
✅ **CI Monitoring** - Track pipeline status  
✅ **Auto-Merge** - Policy-based merging  
✅ **Conflict Detection** - Handle merge conflicts  
✅ **Webhook Support** - Real-time CI updates  

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow Engine                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Git Skills    │
              └────────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌────────────────┐          ┌────────────────┐
│ Git Operations │          │  PR/MR Create  │
│ - Branch       │          │  - GitHub API  │
│ - Commit       │          │  - GitLab API  │
│ - Push         │          └────────┬───────┘
└────────┬───────┘                   │
         │                           │
         └───────────┬───────────────┘
                     ▼
              ┌─────────────┐
              │ CI Monitor  │
              │ - Poll      │
              │ - Webhook   │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ Auto-Merge  │
              │ - Policies  │
              │ - Merge     │
              └─────────────┘
```

### Components

#### 1. GitIntegration

Core git operations using `git2` crate.

```rust
pub struct GitIntegration {
    repo_path: PathBuf,
    remote_url: String,
    credentials: GitCredentials,
}

impl GitIntegration {
    /// Create new branch from base
    pub async fn create_branch(&self, name: &str, base: &str) -> Result<()>;
    
    /// Commit changes with message
    pub async fn commit(&self, message: &str, files: Vec<PathBuf>) -> Result<String>;
    
    /// Push branch to remote
    pub async fn push(&self, branch: &str, force: bool) -> Result<()>;
    
    /// Check for merge conflicts
    pub async fn check_conflicts(&self, base: &str, head: &str) -> Result<Vec<String>>;
}
```

#### 2. PrIntegration

Pull request/merge request creation.

```rust
pub struct PrIntegration {
    provider: PrProvider,
    api_client: ApiClient,
}

pub enum PrProvider {
    GitHub { owner: String, repo: String },
    GitLab { project_id: u64 },
}

impl PrIntegration {
    /// Create pull request
    pub async fn create_pr(&self, params: PrParams) -> Result<PrInfo>;
    
    /// Add reviewers
    pub async fn add_reviewers(&self, pr_number: u64, reviewers: Vec<String>) -> Result<()>;
    
    /// Add labels
    pub async fn add_labels(&self, pr_number: u64, labels: Vec<String>) -> Result<()>;
    
    /// Get PR status
    pub async fn get_status(&self, pr_number: u64) -> Result<PrStatus>;
}
```

#### 3. CiIntegration

CI/CD pipeline monitoring.

```rust
pub struct CiIntegration {
    provider: CiProvider,
    api_client: ApiClient,
}

pub enum CiProvider {
    GitHubActions,
    GitLabCI,
    Generic { webhook_url: String },
}

impl CiIntegration {
    /// Get current CI status
    pub async fn get_status(&self, pr_number: u64) -> Result<CiStatus>;
    
    /// Wait for CI completion
    pub async fn wait_for_completion(
        &self,
        pr_number: u64,
        timeout: Duration,
    ) -> Result<CiResult>;
    
    /// Parse CI results
    pub async fn get_results(&self, pr_number: u64) -> Result<CiResults>;
}
```

#### 4. AutoMerge

Policy-based auto-merge.

```rust
pub struct AutoMerge {
    policies: MergePolicies,
    git: GitIntegration,
    pr: PrIntegration,
    ci: CiIntegration,
}

impl AutoMerge {
    /// Check if PR can be merged
    pub async fn can_merge(&self, pr: &PrInfo) -> Result<MergeDecision>;
    
    /// Merge PR with strategy
    pub async fn merge(&self, pr: &PrInfo, strategy: MergeStrategy) -> Result<()>;
}
```

---

## Git Operations

### Creating a Branch

```rust
// In workflow
let git = GitIntegration::new(repo_path, remote_url, credentials)?;

// Create feature branch from main
git.create_branch("feature/new-feature", "main").await?;
```

**Workflow Step:**
```yaml
- id: create_branch
  skill: git.create_branch
  input:
    branch_name: "feature/email-validation"
    base_branch: "main"
```

### Committing Changes

```rust
// Commit specific files
let commit_sha = git.commit(
    "feat: add email validation",
    vec![
        PathBuf::from("src/validation.rs"),
        PathBuf::from("tests/validation_test.rs"),
    ],
).await?;
```

**Workflow Step:**
```yaml
- id: commit_changes
  skill: git.commit
  input:
    message: "feat: add email validation"
    files:
      - "src/validation.rs"
      - "tests/validation_test.rs"
```

### Pushing to Remote

```rust
// Push branch
git.push("feature/email-validation", false).await?;

// Force push (use with caution!)
git.push("feature/email-validation", true).await?;
```

**Workflow Step:**
```yaml
- id: push_branch
  skill: git.push
  input:
    branch: "feature/email-validation"
    force: false
```

---

## PR/MR Creation

### GitHub Pull Request

```rust
let pr_integration = PrIntegration::new(PrProvider::GitHub {
    owner: "myorg".to_string(),
    repo: "myrepo".to_string(),
});

let pr = pr_integration.create_pr(PrParams {
    title: "Add email validation".to_string(),
    description: "Implements email validation for signup flow".to_string(),
    base_branch: "main".to_string(),
    head_branch: "feature/email-validation".to_string(),
    labels: vec!["enhancement".to_string()],
    reviewers: vec!["alice".to_string(), "bob".to_string()],
    draft: false,
}).await?;

println!("PR created: {}", pr.url);
```

**Workflow Step:**
```yaml
- id: create_pr
  skill: pr.create
  input:
    provider: "github"
    title: "Add email validation"
    description: "Implements email validation for signup flow"
    base: "main"
    head: "feature/email-validation"
    labels: ["enhancement"]
    reviewers: ["alice", "bob"]
```

### GitLab Merge Request

```rust
let pr_integration = PrIntegration::new(PrProvider::GitLab {
    project_id: 12345,
});

let mr = pr_integration.create_pr(PrParams {
    title: "Add email validation".to_string(),
    description: "Implements email validation for signup flow".to_string(),
    base_branch: "main".to_string(),
    head_branch: "feature/email-validation".to_string(),
    labels: vec!["enhancement".to_string()],
    reviewers: vec!["alice".to_string()],
    draft: false,
}).await?;
```

**Workflow Step:**
```yaml
- id: create_mr
  skill: pr.create
  input:
    provider: "gitlab"
    title: "Add email validation"
    description: "Implements email validation for signup flow"
    base: "main"
    head: "feature/email-validation"
    labels: ["enhancement"]
    assignees: ["alice"]
```

---

## CI/CD Integration

### Monitoring CI Status

```rust
let ci = CiIntegration::new(CiProvider::GitHubActions);

// Get current status
let status = ci.get_status(pr.number).await?;
match status {
    CiStatus::Pending => println!("CI pending..."),
    CiStatus::Running => println!("CI running..."),
    CiStatus::Success => println!("CI passed!"),
    CiStatus::Failure => println!("CI failed!"),
    CiStatus::Cancelled => println!("CI cancelled"),
}
```

**Workflow Step:**
```yaml
- id: check_ci
  skill: ci.get_status
  input:
    pr_number: ${create_pr.output.number}
```

### Waiting for CI Completion

```rust
// Wait up to 30 minutes for CI
let result = ci.wait_for_completion(
    pr.number,
    Duration::from_secs(1800),
).await?;

match result.status {
    CiStatus::Success => {
        println!("All checks passed!");
        println!("Tests: {}/{} passed", result.tests_passed, result.tests_total);
    }
    CiStatus::Failure => {
        println!("CI failed!");
        for failure in result.failures {
            println!("  - {}: {}", failure.job, failure.message);
        }
    }
    _ => {}
}
```

**Workflow Step:**
```yaml
- id: wait_for_ci
  skill: ci.wait_for_completion
  input:
    pr_number: ${create_pr.output.number}
    timeout_seconds: 1800
    poll_interval_seconds: 10
```

---

## Configuration

### Environment Variables

```bash
# Git Configuration
export GIT_AUTHOR_NAME="Agentic SDLC Bot"
export GIT_AUTHOR_EMAIL="bot@example.com"
export GIT_COMMITTER_NAME="Agentic SDLC Bot"
export GIT_COMMITTER_EMAIL="bot@example.com"

# GitHub
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
export GITHUB_OWNER="myorg"
export GITHUB_REPO="myrepo"

# GitLab
export GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"
export GITLAB_PROJECT_ID="12345"
export GITLAB_URL="https://gitlab.com"  # or self-hosted

# CI/CD
export CI_POLL_INTERVAL="10"  # seconds
export CI_TIMEOUT="1800"       # seconds (30 minutes)
```

### Workflow Configuration

```yaml
# .agentic/config.yml
git:
  default_branch: "main"
  branch_prefix: "feature/"
  commit_message_template: |
    {type}: {title}
    
    {description}
    
    Co-authored-by: {author}

pr:
  default_reviewers: ["alice", "bob"]
  default_labels: ["automated"]
  auto_assign: true
  draft_by_default: false

ci:
  provider: "github_actions"
  required_checks:
    - "test"
    - "lint"
    - "build"
  timeout_seconds: 1800
  poll_interval_seconds: 10

auto_merge:
  enabled: true
  require_ci_success: true
  require_approvals: 1
  require_up_to_date: true
  merge_strategy: "squash"
  delete_branch_after_merge: true
```

---

## Examples

### Example 1: Complete Feature Workflow

```yaml
name: feature_workflow
description: Complete feature development workflow

steps:
  # 1. Create feature branch
  - id: create_branch
    skill: git.create_branch
    input:
      branch_name: "feature/${task_id}"
      base_branch: "main"
  
  # 2. Implement feature (LLM-generated code)
  - id: implement
    skill: llm.code_generation
    input: ${task_description}
    depends_on: [create_branch]
  
  # 3. Commit changes
  - id: commit
    skill: git.commit
    input:
      message: "feat: ${task_title}"
      files: ${implement.output.files}
    depends_on: [implement]
  
  # 4. Push to remote
  - id: push
    skill: git.push
    input:
      branch: "feature/${task_id}"
    depends_on: [commit]
  
  # 5. Create PR
  - id: create_pr
    skill: pr.create
    input:
      provider: "github"
      title: ${task_title}
      description: ${task_description}
      base: "main"
      head: "feature/${task_id}"
      labels: ["automated", "feature"]
      reviewers: ["alice"]
    depends_on: [push]
  
  # 6. Wait for CI
  - id: wait_ci
    skill: ci.wait_for_completion
    input:
      pr_number: ${create_pr.output.number}
      timeout_seconds: 1800
    depends_on: [create_pr]
  
  # 7. Auto-merge if CI passes
  - id: auto_merge
    skill: pr.auto_merge
    input:
      pr_number: ${create_pr.output.number}
      strategy: "squash"
    depends_on: [wait_ci]
```

### Example 2: Hotfix Workflow

```yaml
name: hotfix_workflow
description: Emergency hotfix workflow

steps:
  - id: create_hotfix_branch
    skill: git.create_branch
    input:
      branch_name: "hotfix/${issue_id}"
      base_branch: "main"
  
  - id: apply_fix
    skill: llm.code_fix
    input: ${issue_description}
    depends_on: [create_hotfix_branch]
  
  - id: commit_fix
    skill: git.commit
    input:
      message: "fix: ${issue_title} (closes #${issue_id})"
      files: ${apply_fix.output.files}
    depends_on: [apply_fix]
  
  - id: push_fix
    skill: git.push
    input:
      branch: "hotfix/${issue_id}"
    depends_on: [commit_fix]
  
  - id: create_hotfix_pr
    skill: pr.create
    input:
      provider: "github"
      title: "[HOTFIX] ${issue_title}"
      description: "Emergency fix for #${issue_id}"
      base: "main"
      head: "hotfix/${issue_id}"
      labels: ["hotfix", "urgent"]
      reviewers: ["oncall"]
    depends_on: [push_fix]
  
  # Fast-track: shorter CI timeout
  - id: wait_ci_fast
    skill: ci.wait_for_completion
    input:
      pr_number: ${create_hotfix_pr.output.number}
      timeout_seconds: 600  # 10 minutes
    depends_on: [create_hotfix_pr]
  
  - id: merge_hotfix
    skill: pr.auto_merge
    input:
      pr_number: ${create_hotfix_pr.output.number}
      strategy: "merge"  # Keep history for hotfixes
      require_approvals: 1
    depends_on: [wait_ci_fast]
```

### Example 3: Multi-Repo Sync

```yaml
name: multi_repo_sync
description: Sync changes across multiple repositories

steps:
  # Repo 1: API
  - id: update_api
    skill: git.multi_repo_update
    input:
      repo: "myorg/api"
      branch: "feature/update-schema"
      files:
        - "schema/user.proto"
      commit_message: "feat: update user schema"
  
  # Repo 2: Frontend
  - id: update_frontend
    skill: git.multi_repo_update
    input:
      repo: "myorg/frontend"
      branch: "feature/update-schema"
      files:
        - "src/types/user.ts"
      commit_message: "feat: update user types"
    depends_on: [update_api]
  
  # Create PRs in both repos
  - id: create_api_pr
    skill: pr.create
    input:
      provider: "github"
      repo: "myorg/api"
      title: "Update user schema"
      base: "main"
      head: "feature/update-schema"
    depends_on: [update_api]
  
  - id: create_frontend_pr
    skill: pr.create
    input:
      provider: "github"
      repo: "myorg/frontend"
      title: "Update user types"
      base: "main"
      head: "feature/update-schema"
      related_pr: ${create_api_pr.output.url}
    depends_on: [update_frontend]
```

---

## Troubleshooting

### Issue: "Authentication failed"

**Cause:** Invalid or expired token.

**Solution:**
1. Check token is set: `echo $GITHUB_TOKEN`
2. Verify token permissions (repo, workflow)
3. Regenerate token if expired
4. For GitHub: Use fine-grained token with repo scope

### Issue: "Branch already exists"

**Cause:** Branch name collision.

**Solution:**
1. Use unique branch names (include timestamp or ID)
2. Delete old branch first
3. Use force push (with caution)

```yaml
- id: create_branch
  skill: git.create_branch
  input:
    branch_name: "feature/${task_id}-${timestamp}"
    base_branch: "main"
    force: true  # Delete if exists
```

### Issue: "Merge conflict detected"

**Cause:** Changes conflict with base branch.

**Solution:**
1. Rebase on latest base branch
2. Use conflict resolution strategy
3. Manual intervention required

```yaml
- id: check_conflicts
  skill: git.check_conflicts
  input:
    base: "main"
    head: "feature/my-feature"

- id: resolve_conflicts
  skill: git.resolve_conflicts
  input:
    strategy: "ours"  # or "theirs", "manual"
    files: ${check_conflicts.output.conflicts}
  depends_on: [check_conflicts]
```

### Issue: "CI timeout"

**Cause:** CI taking too long.

**Solution:**
1. Increase timeout
2. Check CI logs for hanging tests
3. Optimize CI pipeline

```yaml
- id: wait_ci
  skill: ci.wait_for_completion
  input:
    pr_number: ${create_pr.output.number}
    timeout_seconds: 3600  # 1 hour
    poll_interval_seconds: 30  # Check less frequently
```

### Issue: "Auto-merge blocked"

**Cause:** Merge policies not satisfied.

**Solution:**
1. Check CI status
2. Verify approvals
3. Ensure branch is up-to-date

```yaml
- id: check_merge_status
  skill: pr.check_merge_status
  input:
    pr_number: ${create_pr.output.number}

# Output shows what's blocking:
# - ci_status: "failure"
# - approvals: 0 (required: 1)
# - up_to_date: false
```

---

## Best Practices

### 1. Use Descriptive Branch Names

```yaml
# ✅ Good
branch_name: "feature/user-authentication"
branch_name: "fix/memory-leak-in-parser"
branch_name: "docs/update-api-guide"

# ❌ Bad
branch_name: "test"
branch_name: "fix"
branch_name: "update"
```

### 2. Write Clear Commit Messages

```yaml
# ✅ Good
message: |
  feat: add user authentication
  
  - Implement JWT token generation
  - Add login/logout endpoints
  - Add password hashing with bcrypt
  
  Closes #123

# ❌ Bad
message: "update code"
message: "fix bug"
```

### 3. Set Appropriate CI Timeouts

```yaml
# ✅ Good: Based on actual CI duration
timeout_seconds: 1800  # 30 minutes for full test suite
timeout_seconds: 600   # 10 minutes for lint/format
timeout_seconds: 300   # 5 minutes for quick checks

# ❌ Bad: Too short or too long
timeout_seconds: 60    # Too short, will timeout
timeout_seconds: 7200  # Too long, wastes time
```

### 4. Use Merge Policies

```yaml
auto_merge:
  require_ci_success: true      # Always require CI
  require_approvals: 1          # At least 1 approval
  require_up_to_date: true      # Must be rebased
  merge_strategy: "squash"      # Clean history
  delete_branch_after_merge: true  # Cleanup
```

---

## Security Considerations

### Token Management

1. **Never commit tokens** to repository
2. **Use environment variables** for credentials
3. **Rotate tokens regularly** (every 90 days)
4. **Use fine-grained permissions** (minimum required)

### Branch Protection

```yaml
protected_branches:
  - name: "main"
    require_pr: true
    require_ci: true
    require_approvals: 2
    dismiss_stale_reviews: true
    
  - name: "production"
    require_pr: true
    require_ci: true
    require_approvals: 3
    require_codeowners: true
```

### Webhook Security

1. **Verify webhook signatures** (HMAC)
2. **Use HTTPS only** for webhook URLs
3. **Validate payload** before processing
4. **Rate limit** webhook handlers

---

## Performance Tips

### 1. Batch Operations

```yaml
# ✅ Good: Batch commits
- id: commit_all
  skill: git.commit
  input:
    message: "feat: implement feature"
    files: ${all_changed_files}

# ❌ Bad: Multiple commits
- id: commit_1
  skill: git.commit
  input:
    files: ["file1.rs"]
- id: commit_2
  skill: git.commit
  input:
    files: ["file2.rs"]
```

### 2. Parallel CI Checks

```yaml
# Run independent checks in parallel
- id: lint
  skill: ci.run_check
  input:
    check: "lint"

- id: test
  skill: ci.run_check
  input:
    check: "test"

- id: build
  skill: ci.run_check
  input:
    check: "build"

# Wait for all
- id: wait_all
  skill: ci.wait_for_all
  input:
    checks: ["lint", "test", "build"]
  depends_on: [lint, test, build]
```

### 3. Cache CI Results

```yaml
ci:
  cache_enabled: true
  cache_key: "${branch}-${commit_sha}"
  cache_paths:
    - "target/"
    - "node_modules/"
```

---

## API Reference

See [API Documentation](API.md) for complete API reference.

---

**Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Design Complete

