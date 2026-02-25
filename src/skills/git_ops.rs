use crate::engine::context::ExecutionContext;
use crate::engine::project::{AgentProjectLayout, ProjectCodingRules, ProjectMergeRules};
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use crate::skills::idempotency;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use regex::Regex;
use serde_json::json;
use std::process::Command;

#[derive(Debug, Clone)]
pub struct GitCommitSkill;

#[derive(Debug, Clone)]
pub struct GitMergeBranchSkill;

#[derive(Debug, Clone)]
pub struct AnalyzeConflictsSkill;

const VALIDATION_STATUS_ENV: &str = "ANTIGRAV_LAST_VALIDATION_PASSED";

fn run_git(args: &[&str]) -> Result<std::process::Output> {
    Ok(Command::new("git").args(args).output()?)
}

fn project_layout_from_cwd() -> Result<AgentProjectLayout> {
    let cwd = std::env::current_dir()?;
    AgentProjectLayout::discover(&cwd.to_string_lossy())
}

fn load_coding_rules_from_cwd() -> Result<ProjectCodingRules> {
    project_layout_from_cwd()?.load_coding_rules()
}

fn load_merge_rules_from_cwd() -> Result<ProjectMergeRules> {
    project_layout_from_cwd()?.load_merge_rules()
}

fn staged_files() -> Result<Vec<String>> {
    let output = run_git(&["diff", "--cached", "--name-only"])?;
    if !output.status.success() {
        return Err(anyhow!(
            "git diff --cached failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect())
}

fn current_branch() -> Result<String> {
    let output = run_git(&["rev-parse", "--abbrev-ref", "HEAD"])?;
    if !output.status.success() {
        return Err(anyhow!(
            "git rev-parse failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn head_commit_message() -> Result<String> {
    let output = run_git(&["log", "-1", "--pretty=%B"])?;
    if !output.status.success() {
        return Err(anyhow!(
            "git log failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn working_tree_clean() -> Result<bool> {
    let output = run_git(&["status", "--porcelain"])?;
    if !output.status.success() {
        return Err(anyhow!(
            "git status --porcelain failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout).trim().is_empty())
}

fn commit_type(message: &str) -> String {
    let header = message.lines().next().unwrap_or_default().trim();
    let head = header.split(':').next().unwrap_or_default();
    head.split('(')
        .next()
        .unwrap_or_default()
        .trim()
        .to_string()
}

fn validate_structured_commit_message(message: &str) -> Result<()> {
    let msg = message.trim();
    if msg.is_empty() {
        return Err(anyhow!("Commit message must not be empty"));
    }
    let lines: Vec<&str> = msg.lines().collect();
    let header = lines[0].trim();
    let header_re = Regex::new(r"^[a-z]+(\([a-z0-9._/\-]+\))?: .+")
        .map_err(|e| anyhow!("Failed to compile commit format regex: {}", e))?;
    if !header_re.is_match(header) {
        return Err(anyhow!(
            "Commit header must match 'type(scope): summary' or 'type: summary'"
        ));
    }
    if lines.len() > 1 {
        if !lines[1].trim().is_empty() {
            return Err(anyhow!(
                "Commit body must start after one blank line below the header"
            ));
        }
        if !lines
            .iter()
            .skip(2)
            .any(|line| line.trim_start().starts_with("- "))
        {
            return Err(anyhow!(
                "Commit body must include at least one '- ' bullet item"
            ));
        }
    }
    Ok(())
}

fn enforce_memory_index_rule(rules: &ProjectCodingRules, staged: &[String]) -> Result<()> {
    if !rules.require_memory_index_update.unwrap_or(false) {
        return Ok(());
    }
    let code_changed = staged.iter().any(|path| {
        path.starts_with("src/")
            || path.ends_with(".rs")
            || path.ends_with(".py")
            || path.ends_with(".js")
            || path.ends_with(".ts")
            || path.ends_with(".tsx")
            || path.ends_with(".go")
            || path.ends_with(".java")
            || path.ends_with(".kt")
    });
    let memory_updated = staged
        .iter()
        .any(|path| path == ".agent/memory/vector_index.json");
    if code_changed && !memory_updated {
        return Err(anyhow!(
            "coding_rules violation: .agent/memory/vector_index.json must be updated for code changes"
        ));
    }
    Ok(())
}

fn enforce_commit_rules(message: &str, rules: &ProjectCodingRules) -> Result<()> {
    if rules.require_structured_commit_message.unwrap_or(false) {
        validate_structured_commit_message(message)?;
    }
    if rules.require_tests_for_new_feature.unwrap_or(false) && commit_type(message) == "feat" {
        let validation_passed = std::env::var(VALIDATION_STATUS_ENV)
            .map(|v| v == "1")
            .unwrap_or(false);
        if !validation_passed {
            return Err(anyhow!(
                "coding_rules violation: feature commits require successful validation before commit"
            ));
        }
    }
    Ok(())
}

#[async_trait]
impl Skill for GitCommitSkill {
    fn name(&self) -> &str {
        "git_commit"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Stage all changes and create a git commit",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, true),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let message = input.as_text().unwrap_or("Automated commit").trim();
        let head = head_commit_message()?;
        if head == message && working_tree_clean()? {
            return Ok(Some(SkillOutput::json(json!({
                "status": "already_committed",
                "message": message
            }))));
        }
        if let Some(marker) = idempotency::load_marker(self.name(), message)? {
            return Ok(Some(marker));
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_write()?;
        let message = input.as_text().unwrap_or("Automated commit").trim();
        let coding_rules = load_coding_rules_from_cwd()?;
        enforce_commit_rules(message, &coding_rules)?;

        let add = run_git(&["add", "-A"])?;
        if !add.status.success() {
            return Err(anyhow!(
                "git add failed: {}",
                String::from_utf8_lossy(&add.stderr).trim()
            ));
        }
        let staged = staged_files()?;
        enforce_memory_index_rule(&coding_rules, &staged)?;

        let commit = run_git(&["commit", "-m", message])?;
        if !commit.status.success() {
            let err = String::from_utf8_lossy(&commit.stderr).trim().to_string();
            let out = String::from_utf8_lossy(&commit.stdout).trim().to_string();
            return Ok(SkillOutput::json(json!({
                "status": "no_commit",
                "stdout": out,
                "stderr": err
            })));
        }

        let output = SkillOutput::json(json!({
            "status": "committed",
            "stdout": String::from_utf8_lossy(&commit.stdout).trim()
        }));
        let _ = idempotency::save_marker(self.name(), message, &output);
        Ok(output)
    }
}

#[async_trait]
impl Skill for GitMergeBranchSkill {
    fn name(&self) -> &str {
        "git_merge_branch"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Merge a source branch into current branch",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, true),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let source_branch = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .ok_or_else(|| anyhow!("source branch is required"))?;
        let merged = run_git(&["merge-base", "--is-ancestor", source_branch, "HEAD"])?;
        if merged.status.success() {
            return Ok(Some(SkillOutput::json(json!({
                "status": "already_merged",
                "source_branch": source_branch
            }))));
        }
        if let Some(marker) = idempotency::load_marker(self.name(), source_branch)? {
            return Ok(Some(marker));
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_write()?;
        let merge_rules = load_merge_rules_from_cwd()?;
        if merge_rules.require_validation_before_merge.unwrap_or(false) {
            let validation_passed = std::env::var(VALIDATION_STATUS_ENV)
                .map(|v| v == "1")
                .unwrap_or(false);
            if !validation_passed {
                return Err(anyhow!(
                    "merge_rules violation: validation must pass before merge"
                ));
            }
        }

        let source_branch = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .ok_or_else(|| anyhow!("source branch is required"))?;
        let merge = run_git(&["merge", "--no-ff", source_branch])?;
        if !merge.status.success() {
            return Ok(SkillOutput::json(json!({
                "status": "conflict",
                "stdout": String::from_utf8_lossy(&merge.stdout).trim(),
                "stderr": String::from_utf8_lossy(&merge.stderr).trim(),
                "requires_conflict_analysis": merge_rules.analyze_conflicts.unwrap_or(true),
            })));
        }

        let mut deleted_source_branch = false;
        let mut delete_error = String::new();
        if merge_rules
            .delete_feature_branch_after_merge
            .unwrap_or(false)
            && source_branch != "main"
            && source_branch != "master"
        {
            let current = current_branch().unwrap_or_default();
            if current != source_branch {
                let delete = run_git(&["branch", "-d", source_branch])?;
                deleted_source_branch = delete.status.success();
                if !deleted_source_branch {
                    delete_error = String::from_utf8_lossy(&delete.stderr).trim().to_string();
                }
            }
        }
        let output = SkillOutput::json(json!({
            "status": "merged",
            "stdout": String::from_utf8_lossy(&merge.stdout).trim(),
            "deleted_source_branch": deleted_source_branch,
            "delete_error": delete_error,
        }));
        let _ = idempotency::save_marker(self.name(), source_branch, &output);
        Ok(output)
    }
}

#[async_trait]
impl Skill for AnalyzeConflictsSkill {
    fn name(&self) -> &str {
        "analyze_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "List files with merge conflicts",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, false, false, false, true),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, _input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let output = run_git(&["diff", "--name-only", "--diff-filter=U"])?;
        if !output.status.success() {
            return Err(anyhow!(
                "git diff conflict scan failed: {}",
                String::from_utf8_lossy(&output.stderr).trim()
            ));
        }
        let files = String::from_utf8_lossy(&output.stdout)
            .lines()
            .map(|line| line.trim().to_string())
            .filter(|line| !line.is_empty())
            .collect::<Vec<_>>();
        Ok(SkillOutput::json(json!({
            "conflicts": files,
            "count": files.len()
        })))
    }
}

#[cfg(test)]
mod tests {
    use super::{commit_type, validate_structured_commit_message};

    #[test]
    fn commit_type_is_parsed_from_header() {
        assert_eq!(commit_type("feat(core): add x"), "feat");
        assert_eq!(commit_type("fix: patch bug"), "fix");
    }

    #[test]
    fn structured_commit_message_requires_header_and_bullets() {
        let valid = "feat(core): add workflow guard\n\n- add timeout\n- add allowlist";
        assert!(validate_structured_commit_message(valid).is_ok());

        let invalid = "invalid header\nno blank line";
        assert!(validate_structured_commit_message(invalid).is_err());
    }
}
