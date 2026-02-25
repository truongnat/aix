use crate::engine::context::ExecutionContext;
use crate::engine::git::{BranchingPolicy, GitBranchOrchestrator};
use crate::engine::project::AgentProjectLayout;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use crate::skills::idempotency;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde_json::json;
use std::collections::HashSet;
use std::path::{Component, PathBuf};
use std::process::Command as StdCommand;
use std::process::Stdio;
use tokio::io::AsyncReadExt;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

const DEFAULT_RUN_SCRIPT_TIMEOUT_MS: u64 = 30_000;
const MAX_CAPTURED_OUTPUT_LEN: usize = 8000;
const VALIDATION_STATUS_ENV: &str = "ANTIGRAV_LAST_VALIDATION_PASSED";
const RUN_SCRIPT_ALLOW_SHELL_OPERATORS_ENV: &str = "ANTIGRAV_RUN_SCRIPT_ALLOW_SHELL_OPERATORS";
const RUN_SCRIPT_DENYLIST_ENV: &str = "ANTIGRAV_RUN_SCRIPT_DENYLIST";

fn load_branching_policy(project_root: &str) -> Result<BranchingPolicy> {
    let layout = AgentProjectLayout::discover(project_root)?;
    let rules = layout.load_branching_rules()?;
    Ok(BranchingPolicy {
        prefix: rules.prefix.unwrap_or_else(|| "thread/".to_string()),
        allow_auto_create: rules.allow_auto_create.unwrap_or(true),
        allow_auto_checkout: rules.allow_auto_checkout.unwrap_or(true),
    })
}

fn run_script_timeout_ms() -> u64 {
    std::env::var("ANTIGRAV_RUN_SCRIPT_TIMEOUT_MS")
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|v| *v > 0)
        .unwrap_or(DEFAULT_RUN_SCRIPT_TIMEOUT_MS)
}

fn run_script_allowlist() -> HashSet<String> {
    std::env::var("ANTIGRAV_RUN_SCRIPT_ALLOWLIST")
        .ok()
        .map(|v| {
            v.split(',')
                .map(|cmd| cmd.trim().to_ascii_lowercase())
                .filter(|cmd| !cmd.is_empty())
                .collect()
        })
        .unwrap_or_else(|| {
            [
                "cargo", "git", "npm", "pnpm", "yarn", "make", "just", "go", "pytest", "flutter",
                "dart",
            ]
            .into_iter()
            .map(|cmd| cmd.to_string())
            .collect()
        })
}

fn run_script_denylist() -> HashSet<String> {
    std::env::var(RUN_SCRIPT_DENYLIST_ENV)
        .ok()
        .map(|v| {
            v.split(',')
                .map(|cmd| cmd.trim().to_ascii_lowercase())
                .filter(|cmd| !cmd.is_empty())
                .collect()
        })
        .unwrap_or_else(|| {
            [
                "sudo",
                "dd",
                "mkfs",
                "shutdown",
                "reboot",
                "poweroff",
                "launchctl",
            ]
            .into_iter()
            .map(|cmd| cmd.to_string())
            .collect()
        })
}

fn run_script_allow_shell_operators() -> bool {
    std::env::var(RUN_SCRIPT_ALLOW_SHELL_OPERATORS_ENV)
        .ok()
        .map(|v| matches!(v.trim(), "1" | "true" | "TRUE" | "yes" | "YES"))
        .unwrap_or(false)
}

fn extract_command_head(command: &str) -> Option<String> {
    for token in command.split_whitespace() {
        if token.contains('=')
            && !token.starts_with("./")
            && !token.starts_with('/')
            && !token.contains('/')
        {
            continue;
        }
        let head = token.trim_matches(|ch| ch == '\'' || ch == '"');
        if !head.is_empty() {
            return Some(head.to_ascii_lowercase());
        }
    }
    None
}

fn is_validation_command(command: &str) -> bool {
    let lowered = command.to_ascii_lowercase();
    lowered.contains(" test")
        || lowered.starts_with("test ")
        || lowered.contains(" lint")
        || lowered.contains(" check")
        || lowered.contains(" validate")
        || lowered.contains(" analyze")
}

fn has_shell_operators(command: &str) -> bool {
    command.contains("&&")
        || command.contains("||")
        || command.contains('|')
        || command.contains(';')
}

fn split_command_segments(command: &str) -> Result<Vec<String>> {
    let mut segments = Vec::new();
    let mut current = String::new();
    let mut chars = command.chars().peekable();
    let mut in_single = false;
    let mut in_double = false;
    let mut escaped = false;

    while let Some(ch) = chars.next() {
        if escaped {
            current.push(ch);
            escaped = false;
            continue;
        }
        if ch == '\\' && !in_single {
            escaped = true;
            current.push(ch);
            continue;
        }
        if ch == '\'' && !in_double {
            in_single = !in_single;
            current.push(ch);
            continue;
        }
        if ch == '"' && !in_single {
            in_double = !in_double;
            current.push(ch);
            continue;
        }

        if !in_single && !in_double {
            if ch == ';' {
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
            if ch == '&' && chars.peek() == Some(&'&') {
                chars.next();
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
            if ch == '|' {
                if chars.peek() == Some(&'|') {
                    chars.next();
                }
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
        }

        current.push(ch);
    }

    if in_single || in_double {
        return Err(anyhow!("run_script command has unmatched quote"));
    }

    let trimmed = current.trim();
    if !trimmed.is_empty() {
        segments.push(trimmed.to_string());
    }
    Ok(segments)
}

fn has_forbidden_shell_constructs(command: &str) -> bool {
    command.contains("$(")
        || command.contains('`')
        || command.contains('\n')
        || command.contains('\r')
}

fn segment_matches_dangerous_pattern(segment: &str) -> bool {
    let mut compact = segment.to_ascii_lowercase();
    while compact.contains("  ") {
        compact = compact.replace("  ", " ");
    }
    let compact = compact.trim().to_string();
    compact.starts_with("git reset --hard")
        || compact.starts_with("git clean -fd")
        || compact.starts_with("git clean -xdf")
        || compact.starts_with("rm -rf /")
        || compact.starts_with("rm -rf ~")
        || compact.starts_with("rm -rf $home")
}

fn validate_run_script_policy_with_config(
    command: &str,
    allowlist: &HashSet<String>,
    denylist: &HashSet<String>,
    allow_shell_operators: bool,
) -> Result<String> {
    if has_forbidden_shell_constructs(command) {
        return Err(anyhow!(
            "run_script blocked command due to forbidden shell construct"
        ));
    }
    if !allow_shell_operators && has_shell_operators(command) {
        return Err(anyhow!(
            "run_script blocked shell operator usage; enable policy if required"
        ));
    }

    let segments = split_command_segments(command)?;
    if segments.is_empty() {
        return Err(anyhow!("run_script requires non-empty command input"));
    }

    let mut first_head = None::<String>;
    for segment in segments {
        let head = extract_command_head(&segment)
            .ok_or_else(|| anyhow!("Unable to parse command head from '{}'", segment))?;
        if first_head.is_none() {
            first_head = Some(head.clone());
        }
        if !allowlist.is_empty() && !allowlist.contains(&head) {
            return Err(anyhow!(
                "run_script blocked command '{}'. Allowlist={:?}",
                head,
                allowlist
            ));
        }
        if denylist.contains(&head) {
            return Err(anyhow!(
                "run_script blocked denied command '{}'. Denylist={:?}",
                head,
                denylist
            ));
        }
        if segment_matches_dangerous_pattern(&segment) {
            return Err(anyhow!("run_script blocked dangerous command pattern"));
        }
    }

    Ok(first_head.unwrap_or_default())
}

fn validate_run_script_policy(command: &str) -> Result<String> {
    let allowlist = run_script_allowlist();
    let denylist = run_script_denylist();
    let allow_shell_operators = run_script_allow_shell_operators();
    validate_run_script_policy_with_config(command, &allowlist, &denylist, allow_shell_operators)
}

fn resolve_script_workdir() -> Result<PathBuf> {
    let cwd = std::env::current_dir()?;
    let output = StdCommand::new("git")
        .arg("rev-parse")
        .arg("--show-toplevel")
        .current_dir(&cwd)
        .output()?;
    if !output.status.success() {
        return Ok(cwd.canonicalize()?);
    }
    let root = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if root.is_empty() {
        return Ok(cwd.canonicalize()?);
    }
    let root_path = PathBuf::from(root).canonicalize()?;
    let cwd_path = cwd.canonicalize()?;
    if !cwd_path.starts_with(&root_path) {
        return Err(anyhow!(
            "run_script current directory is outside detected repo root"
        ));
    }
    Ok(root_path)
}

fn truncated(text: &str) -> String {
    if text.len() <= MAX_CAPTURED_OUTPUT_LEN {
        return text.to_string();
    }
    let keep = MAX_CAPTURED_OUTPUT_LEN / 2;
    format!(
        "{}...(truncated)...{}",
        &text[..keep],
        &text[text.len() - keep..]
    )
}

fn parse_write_file_input(input: &SkillInput) -> Result<(PathBuf, String)> {
    let text = input
        .as_text()
        .ok_or_else(|| anyhow!("write_file requires text input"))?;
    let (path_str, content) = text
        .split_once(":::")
        .ok_or_else(|| anyhow!("write_file input must be 'relative/path:::content'"))?;
    let rel_path = PathBuf::from(path_str.trim());
    if rel_path.is_absolute()
        || rel_path
            .components()
            .any(|component| matches!(component, Component::ParentDir))
    {
        return Err(anyhow!("write_file only allows safe relative paths"));
    }
    Ok((rel_path, content.to_string()))
}

#[derive(Debug, Clone)]
pub struct EnsureBranchSkill;

#[derive(Debug, Clone)]
pub struct RunScriptSkill;

#[derive(Debug, Clone)]
pub struct WriteFileSkill;

#[async_trait]
impl Skill for EnsureBranchSkill {
    fn name(&self) -> &str {
        "ensure_branch"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Ensure a deterministic branch exists for a thread id",
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
        let thread_id = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("default-thread");
        let cwd = std::env::current_dir()?;
        let policy = load_branching_policy(&cwd.to_string_lossy())?;
        let target_branch =
            GitBranchOrchestrator::branch_for_thread_with_prefix(thread_id, &policy.prefix);
        let current = StdCommand::new("git")
            .arg("rev-parse")
            .arg("--abbrev-ref")
            .arg("HEAD")
            .current_dir(&cwd)
            .output()?;
        if current.status.success() {
            let current_branch = String::from_utf8_lossy(&current.stdout).trim().to_string();
            if current_branch == target_branch {
                return Ok(Some(SkillOutput::json(json!({
                    "status": "already_on_branch",
                    "thread_id": thread_id,
                    "branch": target_branch
                }))));
            }
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_write()?;
        let thread_id = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("default-thread");
        let cwd = std::env::current_dir()?;
        let policy = load_branching_policy(&cwd.to_string_lossy())?;
        let orchestrator =
            GitBranchOrchestrator::new_with_policy(cwd.to_string_lossy().to_string(), policy);
        let branch = orchestrator.ensure_branch_for_thread(thread_id)?;
        Ok(SkillOutput::json(json!({
            "status": "ok",
            "thread_id": thread_id,
            "branch": branch
        })))
    }
}

#[async_trait]
impl Skill for RunScriptSkill {
    fn name(&self) -> &str {
        "run_script"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Run a validation/build/test script in project root",
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
        ctx.require_fs_read()?;
        let command = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .ok_or_else(|| anyhow!("run_script requires non-empty command input"))?;
        if !is_validation_command(command) {
            return Ok(None);
        }
        idempotency::load_marker(self.name(), command)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let command = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .ok_or_else(|| anyhow!("run_script requires non-empty command input"))?;
        let command_head = validate_run_script_policy(command)?;
        let timeout_ms = run_script_timeout_ms();
        let is_validation = is_validation_command(command);
        let workdir = resolve_script_workdir()?;
        let mut child = Command::new("/bin/sh")
            .arg("-c")
            .arg(command)
            .env_clear()
            .env("PATH", "/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin")
            .env("LC_ALL", "C")
            .env("PWD", &workdir)
            .current_dir(&workdir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stdout"))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stderr"))?;
        let stdout_reader = tokio::spawn(async move {
            let mut reader = stdout;
            let mut bytes = Vec::new();
            reader.read_to_end(&mut bytes).await.map(|_| bytes)
        });
        let stderr_reader = tokio::spawn(async move {
            let mut reader = stderr;
            let mut bytes = Vec::new();
            reader.read_to_end(&mut bytes).await.map(|_| bytes)
        });

        let exit_status = match timeout(Duration::from_millis(timeout_ms), child.wait()).await {
            Ok(result) => result?,
            Err(_) => {
                let _ = child.kill().await;
                let _ = child.wait().await;
                let _ = stdout_reader.await;
                let _ = stderr_reader.await;
                if is_validation {
                    std::env::set_var(VALIDATION_STATUS_ENV, "0");
                }
                return Err(anyhow!(
                    "run_script timeout after {}ms (command='{}')",
                    timeout_ms,
                    command
                ));
            }
        };

        let stdout_bytes = stdout_reader
            .await
            .map_err(|e| anyhow!("Failed to join stdout reader: {}", e))??;
        let stderr_bytes = stderr_reader
            .await
            .map_err(|e| anyhow!("Failed to join stderr reader: {}", e))??;

        let code = exit_status.code().unwrap_or(-1);
        let stdout = truncated(String::from_utf8_lossy(&stdout_bytes).trim());
        let stderr = truncated(String::from_utf8_lossy(&stderr_bytes).trim());
        if !exit_status.success() {
            if is_validation {
                std::env::set_var(VALIDATION_STATUS_ENV, "0");
            }
            let failure = json!({
                "status": "failed",
                "command": command,
                "command_head": command_head,
                "exit_code": code,
                "stdout": stdout,
                "stderr": stderr
            });
            return Err(anyhow!(
                "run_script failed: {}",
                serde_json::to_string(&failure)?
            ));
        }
        if is_validation {
            std::env::set_var(VALIDATION_STATUS_ENV, "1");
        }

        let output = SkillOutput::json(json!({
            "status": "ok",
            "command": command,
            "command_head": command_head,
            "working_dir": workdir.to_string_lossy(),
            "timeout_ms": timeout_ms,
            "exit_code": code,
            "stdout": stdout,
            "stderr": stderr
        }));
        if is_validation {
            let _ = idempotency::save_marker(self.name(), command, &output);
        }
        Ok(output)
    }
}

#[async_trait]
impl Skill for WriteFileSkill {
    fn name(&self) -> &str {
        "write_file"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Write file content using 'relative/path:::content' input format",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, false),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_fs_read()?;
        let (rel_path, content) = parse_write_file_input(input)?;
        let full_path = std::env::current_dir()?.join(&rel_path);
        if !full_path.exists() {
            return Ok(None);
        }
        let existing = std::fs::read_to_string(&full_path)?;
        if existing == content {
            return Ok(Some(SkillOutput::json(json!({
                "status": "already_written",
                "path": rel_path.to_string_lossy(),
                "bytes": content.len()
            }))));
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_fs_write()?;
        let (rel_path, content) = parse_write_file_input(&input)?;

        let full_path = std::env::current_dir()?.join(&rel_path);
        if let Some(parent) = full_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&full_path, &content)?;

        Ok(SkillOutput::json(json!({
            "status": "written",
            "path": rel_path.to_string_lossy(),
            "bytes": content.len()
        })))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        extract_command_head, is_validation_command, validate_run_script_policy_with_config,
    };
    use std::collections::HashSet;

    #[test]
    fn extract_command_head_skips_env_assignments() {
        let head = extract_command_head("RUSTFLAGS=-Dwarnings cargo test").expect("head");
        assert_eq!(head, "cargo");
    }

    #[test]
    fn validation_command_detects_common_keywords() {
        assert!(is_validation_command("cargo test"));
        assert!(is_validation_command("flutter analyze"));
        assert!(!is_validation_command("git status"));
    }

    #[test]
    fn run_script_policy_blocks_shell_operators_by_default() {
        let allowlist = HashSet::from([String::from("cargo"), String::from("git")]);
        let denylist = HashSet::new();
        let result = validate_run_script_policy_with_config(
            "cargo test && git status",
            &allowlist,
            &denylist,
            false,
        );
        assert!(result.is_err());
    }

    #[test]
    fn run_script_policy_blocks_dangerous_patterns() {
        let allowlist = HashSet::from([String::from("git")]);
        let denylist = HashSet::new();
        let result =
            validate_run_script_policy_with_config("git reset --hard", &allowlist, &denylist, true);
        assert!(result.is_err());
    }

    #[test]
    fn run_script_policy_accepts_safe_allowed_command() {
        let allowlist = HashSet::from([String::from("cargo")]);
        let denylist = HashSet::from([String::from("sudo")]);
        let head =
            validate_run_script_policy_with_config("cargo test -q", &allowlist, &denylist, false)
                .expect("safe command should pass");
        assert_eq!(head, "cargo");
    }
}
