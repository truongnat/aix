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

#[derive(Debug, Clone)]
pub struct HasConflictsSkill;

#[derive(Debug, Clone)]
pub struct ConflictGateSkill;

#[derive(Debug, Clone)]
pub struct AutoResolveConflictsSkill;

#[derive(Debug, Clone)]
pub struct SimulationFallbackGateSkill;

#[derive(Debug, Clone)]
pub struct ReportQualityGateSkill;

const VALIDATION_STATUS_ENV: &str = "AGENTIC_SDLC_LAST_VALIDATION_PASSED";

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

fn load_branching_prefix_from_cwd() -> Result<String> {
    Ok(project_layout_from_cwd()?
        .load_branching_rules()?
        .prefix
        .unwrap_or_else(|| "thread/".to_string()))
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
        .any(|path| path == ".agents/memory/vector_index.json");
    if code_changed && !memory_updated {
        return Err(anyhow!(
            "coding_rules violation: .agents/memory/vector_index.json must be updated for code changes"
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

fn conflict_count_from_input(input: &SkillInput) -> Result<usize> {
    match input {
        SkillInput::Boolean(has_conflicts) => Ok(if *has_conflicts { 1 } else { 0 }),
        SkillInput::Json(value) => {
            if let Some(count) = value.get("count").and_then(|v| v.as_u64()) {
                return Ok(usize::try_from(count).unwrap_or(usize::MAX));
            }
            if let Some(conflicts) = value.get("conflicts").and_then(|v| v.as_array()) {
                return Ok(conflicts.len());
            }
            Ok(0)
        }
        SkillInput::Text(text) => {
            let normalized = text.trim().to_ascii_lowercase();
            if normalized.is_empty() || normalized == "false" || normalized == "0" {
                return Ok(0);
            }
            if normalized == "true" {
                return Ok(1);
            }
            let parsed = normalized.parse::<usize>().unwrap_or(0);
            Ok(parsed)
        }
        SkillInput::Number(value) => Ok((*value).max(0.0).round() as usize),
    }
}

fn simulation_fallback_markers(input: &SkillInput) -> Vec<String> {
    let mut found = Vec::<String>::new();
    let marker_set = [
        "simulation_fallback_used",
        "llm_backend_unavailable",
        "output_confidence_reduced",
    ];
    let collect = |value: &serde_json::Value, found: &mut Vec<String>| {
        let Some(risks) = value.get("risks").and_then(|v| v.as_array()) else {
            return;
        };
        for marker in marker_set {
            if risks
                .iter()
                .filter_map(|entry| entry.as_str())
                .any(|risk| risk.trim().eq_ignore_ascii_case(marker))
                && !found.iter().any(|existing| existing == marker)
            {
                found.push(marker.to_string());
            }
        }
    };

    match input {
        SkillInput::Json(value) => collect(value, &mut found),
        SkillInput::Text(text) => {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(text.trim()) {
                collect(&value, &mut found);
            }
        }
        _ => {}
    }
    found
}

fn parse_report_payload(input: &SkillInput) -> Result<serde_json::Value> {
    match input {
        SkillInput::Json(value) => Ok(value.clone()),
        SkillInput::Text(text) => serde_json::from_str(text.trim())
            .map_err(|err| anyhow!("report_quality_gate expected JSON input: {}", err)),
        _ => Err(anyhow!(
            "report_quality_gate expected JSON/Text(JSON) input, got {:?}",
            input.io_type()
        )),
    }
}

fn report_quality_findings(payload: &serde_json::Value) -> Vec<String> {
    let mut findings = Vec::<String>::new();

    let min_summary_len = std::env::var("AGENTIC_SDLC_REPORT_MIN_SUMMARY_LEN")
        .ok()
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(80);
    let min_actions = std::env::var("AGENTIC_SDLC_REPORT_MIN_ACTIONS")
        .ok()
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(2);
    let min_risks = std::env::var("AGENTIC_SDLC_REPORT_MIN_RISKS")
        .ok()
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(1);

    let summary = payload
        .get("summary")
        .and_then(|v| v.as_str())
        .map(|v| v.trim())
        .unwrap_or_default();
    if summary.len() < min_summary_len {
        findings.push(format!(
            "summary must be at least {} characters",
            min_summary_len
        ));
    }
    if summary
        .to_ascii_lowercase()
        .contains("simulated response for skill")
    {
        findings.push("summary indicates simulated response".to_string());
    }

    let actions = payload
        .get("actions")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    if actions.len() < min_actions {
        findings.push(format!(
            "actions must contain at least {} items",
            min_actions
        ));
    }
    for (idx, action) in actions.iter().enumerate() {
        let text = action.as_str().map(|v| v.trim()).unwrap_or_default();
        if text.len() < 12 {
            findings.push(format!("actions[{}] is too short", idx));
        }
    }

    let risks = payload
        .get("risks")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();
    if risks.len() < min_risks {
        findings.push(format!("risks must contain at least {} item", min_risks));
    }

    findings
}

fn env_enabled(name: &str) -> bool {
    std::env::var(name)
        .map(|v| {
            matches!(
                v.trim().to_ascii_lowercase().as_str(),
                "1" | "true" | "yes" | "on"
            )
        })
        .unwrap_or(false)
}

fn protected_branch_policy_violation(
    target_branch: &str,
    source_branch: &str,
    protected_branches: &[String],
    branch_prefix: &str,
    allow_protected_merge: bool,
) -> Option<String> {
    if allow_protected_merge {
        return None;
    }
    let is_protected = protected_branches
        .iter()
        .any(|branch| branch.trim() == target_branch);
    if !is_protected {
        return None;
    }
    if source_branch.starts_with(branch_prefix) {
        return None;
    }
    Some(format!(
        "merge_rules violation: target branch '{}' is protected; source branch '{}' must start with '{}' or set AGENTIC_SDLC_ALLOW_PROTECTED_MERGE=1",
        target_branch,
        source_branch,
        branch_prefix
    ))
}

fn enforce_merge_rules_before_merge(
    source_branch: &str,
    merge_rules: &ProjectMergeRules,
) -> Result<String> {
    let target_branch = current_branch()?;
    if merge_rules.require_rebase_before_merge.unwrap_or(false) {
        let status = run_git(&["merge-base", "--is-ancestor", &target_branch, source_branch])?;
        if !status.status.success() {
            return Err(anyhow!(
                "merge_rules violation: source branch '{}' must be rebased onto target branch '{}' before merge",
                source_branch,
                target_branch
            ));
        }
    }

    if let Some(protected_branches) = merge_rules.protected_branches.as_ref() {
        let prefix = load_branching_prefix_from_cwd()?;
        if let Some(message) = protected_branch_policy_violation(
            &target_branch,
            source_branch,
            protected_branches,
            prefix.trim(),
            env_enabled("AGENTIC_SDLC_ALLOW_PROTECTED_MERGE"),
        ) {
            return Err(anyhow!(message));
        }
    }

    Ok(target_branch)
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ConflictResolutionStrategy {
    Ours,
    Theirs,
}

impl ConflictResolutionStrategy {
    fn as_git_flag(&self) -> &'static str {
        match self {
            ConflictResolutionStrategy::Ours => "--ours",
            ConflictResolutionStrategy::Theirs => "--theirs",
        }
    }

    fn as_str(&self) -> &'static str {
        match self {
            ConflictResolutionStrategy::Ours => "ours",
            ConflictResolutionStrategy::Theirs => "theirs",
        }
    }
}

#[derive(Debug, Clone)]
struct AutoResolveConfig {
    strategy: ConflictResolutionStrategy,
    max_attempts: u32,
}

fn parse_resolution_strategy(raw: Option<&str>) -> ConflictResolutionStrategy {
    match raw.unwrap_or_default().trim().to_ascii_lowercase().as_str() {
        "theirs" => ConflictResolutionStrategy::Theirs,
        _ => ConflictResolutionStrategy::Ours,
    }
}

fn parse_auto_resolve_config(input: &SkillInput) -> AutoResolveConfig {
    let mut strategy = ConflictResolutionStrategy::Ours;
    let mut max_attempts = 2_u32;

    let parse_object = |value: &serde_json::Value| {
        let strategy = parse_resolution_strategy(value.get("strategy").and_then(|v| v.as_str()));
        let max_attempts = value
            .get("max_attempts")
            .and_then(|v| v.as_u64())
            .and_then(|v| u32::try_from(v).ok())
            .unwrap_or(2)
            .clamp(1, 5);
        AutoResolveConfig {
            strategy,
            max_attempts,
        }
    };

    match input {
        SkillInput::Json(value) => {
            let cfg = parse_object(value);
            strategy = cfg.strategy;
            max_attempts = cfg.max_attempts;
        }
        SkillInput::Text(text) => {
            if let Ok(value) = serde_json::from_str::<serde_json::Value>(text.trim()) {
                let cfg = parse_object(&value);
                strategy = cfg.strategy;
                max_attempts = cfg.max_attempts;
            }
        }
        _ => {}
    }

    AutoResolveConfig {
        strategy,
        max_attempts,
    }
}

fn scan_conflict_files() -> Result<Vec<String>> {
    let output = run_git(&["diff", "--name-only", "--diff-filter=U"])?;
    if !output.status.success() {
        return Err(anyhow!(
            "git diff conflict scan failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>())
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
        let target_branch = enforce_merge_rules_before_merge(source_branch, &merge_rules)?;
        let merge = run_git(&["merge", "--no-ff", source_branch])?;
        if !merge.status.success() {
            return Ok(SkillOutput::json(json!({
                "status": "conflict",
                "target_branch": target_branch,
                "source_branch": source_branch,
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
            "target_branch": target_branch,
            "source_branch": source_branch,
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
        let files = scan_conflict_files()?;
        Ok(SkillOutput::json(json!({
            "conflicts": files,
            "count": files.len()
        })))
    }
}

#[async_trait]
impl Skill for AutoResolveConflictsSkill {
    fn name(&self) -> &str {
        "auto_resolve_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Deterministically attempts git conflict auto-resolution (ours/theirs) with bounded retries",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, true),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        ctx.require_fs_write()?;

        let config = parse_auto_resolve_config(&input);
        let mut attempts_used = 0_u32;
        let mut applied_files = Vec::<String>::new();
        let mut errors = Vec::<String>::new();

        for _ in 0..config.max_attempts {
            let conflicts = scan_conflict_files()?;
            if conflicts.is_empty() {
                break;
            }
            attempts_used = attempts_used.saturating_add(1);

            for file in conflicts {
                let checkout = run_git(&[
                    "checkout",
                    config.strategy.as_git_flag(),
                    "--",
                    file.as_str(),
                ])?;
                if !checkout.status.success() {
                    errors.push(format!(
                        "checkout {} failed for '{}': {}",
                        config.strategy.as_git_flag(),
                        file,
                        String::from_utf8_lossy(&checkout.stderr).trim()
                    ));
                    continue;
                }

                let add = run_git(&["add", "--", file.as_str()])?;
                if !add.status.success() {
                    errors.push(format!(
                        "git add failed for '{}': {}",
                        file,
                        String::from_utf8_lossy(&add.stderr).trim()
                    ));
                    continue;
                }
                if !applied_files.iter().any(|existing| existing == &file) {
                    applied_files.push(file);
                }
            }
        }

        let remaining = scan_conflict_files()?;
        let status = if remaining.is_empty() {
            "resolved"
        } else if attempts_used == 0 {
            "clean"
        } else {
            "unresolved"
        };

        Ok(SkillOutput::json(json!({
            "status": status,
            "strategy": config.strategy.as_str(),
            "max_attempts": config.max_attempts,
            "attempts_used": attempts_used,
            "resolved_files": applied_files,
            "remaining_conflicts": remaining,
            "remaining_count": remaining.len(),
            "errors": errors,
        })))
    }
}

#[async_trait]
impl Skill for HasConflictsSkill {
    fn name(&self) -> &str {
        "has_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Returns true when merge conflict count is greater than zero",
            SkillIOType::Json,
            SkillIOType::Boolean,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let count = conflict_count_from_input(&input)?;
        Ok(SkillOutput::boolean(count > 0))
    }
}

#[async_trait]
impl Skill for ConflictGateSkill {
    fn name(&self) -> &str {
        "conflict_gate"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Fail-fast gate that aborts workflow when merge conflicts still exist",
            SkillIOType::Boolean,
            SkillIOType::Boolean,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let count = conflict_count_from_input(&input)?;
        if count > 0 {
            return Err(anyhow!(
                "merge conflicts remain unresolved after conflict resolution planning"
            ));
        }
        Ok(SkillOutput::boolean(false))
    }
}

#[async_trait]
impl Skill for SimulationFallbackGateSkill {
    fn name(&self) -> &str {
        "simulation_fallback_gate"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Fail-fast gate that blocks merge/release when LLM outputs are simulated",
            SkillIOType::Json,
            SkillIOType::Boolean,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let markers = simulation_fallback_markers(&input);
        if !markers.is_empty() {
            return Err(anyhow!(
                "simulation fallback detected in workflow evidence: {}",
                markers.join(", ")
            ));
        }
        Ok(SkillOutput::boolean(false))
    }
}

#[async_trait]
impl Skill for ReportQualityGateSkill {
    fn name(&self) -> &str {
        "report_quality_gate"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Fail-fast gate that enforces minimum quality for workflow report JSON",
            SkillIOType::Json,
            SkillIOType::Boolean,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let payload = parse_report_payload(&input)?;
        let findings = report_quality_findings(&payload);
        if !findings.is_empty() {
            return Err(anyhow!(
                "workflow report quality gate failed: {}",
                findings.join("; ")
            ));
        }
        Ok(SkillOutput::boolean(false))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        commit_type, conflict_count_from_input, parse_auto_resolve_config,
        protected_branch_policy_violation, report_quality_findings, simulation_fallback_markers,
        validate_structured_commit_message, ConflictResolutionStrategy,
    };
    use crate::skill::io::SkillInput;
    use serde_json::json;

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

    #[test]
    fn conflict_count_extracts_from_json_payload() {
        let input = SkillInput::Json(json!({
            "conflicts": ["a.rs", "b.rs"],
            "count": 2
        }));
        assert_eq!(conflict_count_from_input(&input).expect("count"), 2);
    }

    #[test]
    fn conflict_count_extracts_from_boolean_payload() {
        assert_eq!(
            conflict_count_from_input(&SkillInput::Boolean(true)).expect("count"),
            1
        );
        assert_eq!(
            conflict_count_from_input(&SkillInput::Boolean(false)).expect("count"),
            0
        );
    }

    #[test]
    fn auto_resolve_config_parses_json_text() {
        let input = SkillInput::Text(
            r#"{"strategy":"theirs","max_attempts":4,"analysis":{"count":2}}"#.to_string(),
        );
        let cfg = parse_auto_resolve_config(&input);
        assert_eq!(cfg.strategy, ConflictResolutionStrategy::Theirs);
        assert_eq!(cfg.max_attempts, 4);
    }

    #[test]
    fn auto_resolve_config_defaults_when_invalid_or_missing() {
        let cfg = parse_auto_resolve_config(&SkillInput::Text("not-json".to_string()));
        assert_eq!(cfg.strategy, ConflictResolutionStrategy::Ours);
        assert_eq!(cfg.max_attempts, 2);

        let cfg = parse_auto_resolve_config(&SkillInput::Json(json!({
            "strategy": "unknown",
            "max_attempts": 999
        })));
        assert_eq!(cfg.strategy, ConflictResolutionStrategy::Ours);
        assert_eq!(cfg.max_attempts, 5);
    }

    #[test]
    fn detects_simulation_fallback_markers_from_json_input() {
        let input = SkillInput::Json(json!({
            "summary": "x",
            "risks": ["simulation_fallback_used", "other-risk"]
        }));
        let markers = simulation_fallback_markers(&input);
        assert!(markers.iter().any(|m| m == "simulation_fallback_used"));
    }

    #[test]
    fn detects_backend_unavailable_marker_from_text_input() {
        let input =
            SkillInput::Text(r#"{"summary":"x","risks":["llm_backend_unavailable"]}"#.to_string());
        let markers = simulation_fallback_markers(&input);
        assert!(markers.iter().any(|m| m == "llm_backend_unavailable"));
    }

    #[test]
    fn report_quality_findings_accepts_detailed_payload() {
        let payload = json!({
            "summary": "Detailed release readiness assessment with explicit boundaries, evidence quality, and mitigation posture for tracked risks.",
            "actions": [
                "run npm run -s build and attach output evidence",
                "run cargo check --manifest-path src-tauri/Cargo.toml and confirm zero errors"
            ],
            "risks": [
                "medium: latency regression in query execution path"
            ]
        });
        let findings = report_quality_findings(&payload);
        assert!(findings.is_empty(), "unexpected findings: {:?}", findings);
    }

    #[test]
    fn report_quality_findings_rejects_sparse_payload() {
        let payload = json!({
            "summary": "short",
            "actions": ["fix"],
            "risks": []
        });
        let findings = report_quality_findings(&payload);
        assert!(!findings.is_empty());
    }

    #[test]
    fn protected_branch_policy_blocks_non_thread_source() {
        let protected = vec!["main".to_string(), "master".to_string()];
        let err = protected_branch_policy_violation(
            "main",
            "feature/login",
            &protected,
            "thread/",
            false,
        )
        .expect("violation");
        assert!(err.contains("target branch 'main' is protected"));
        assert!(err.contains("feature/login"));
    }

    #[test]
    fn protected_branch_policy_allows_thread_source_or_override() {
        let protected = vec!["main".to_string()];
        assert!(protected_branch_policy_violation(
            "main",
            "thread/abc",
            &protected,
            "thread/",
            false
        )
        .is_none());
        assert!(protected_branch_policy_violation(
            "main",
            "feature/abc",
            &protected,
            "thread/",
            true
        )
        .is_none());
    }
}
