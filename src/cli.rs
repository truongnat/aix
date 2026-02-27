use std::collections::{HashMap, HashSet};
use std::fs;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::process::Command as ProcessCommand;
use std::sync::Arc;

use crate::engine::package_check::PackageCheckReport;
use crate::engine::package_schema::{validate_schema_header, PackageMarkdownKind};
use crate::engine::planner::Planner;
use crate::engine::project::AgentProjectLayout;
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::engine::session::{AgentSession, LlmAdapter};
use crate::engine::thread_session_store::ThreadSessionStore;
use crate::engine::workflow_engine::{
    ExecutionEngine, WorkflowInstance, WorkflowInstanceStatus, WorkflowStateStore,
};
use crate::skill::capability::{CapabilityPermissions, TrustTier};
use crate::skills::dev_workflow::{EnsureBranchSkill, RunScriptSkill, WriteFileSkill};
use crate::skills::echo::EchoSkill;
use crate::skills::flaky::FlakySkill;
use crate::skills::git_ops::{
    AnalyzeConflictsSkill, AutoResolveConflictsSkill, ConflictGateSkill, GitCommitSkill,
    GitMergeBranchSkill, HasConflictsSkill,
};
use crate::skills::is_positive::IsPositiveSkill;
use crate::skills::llm_subagent::LlmSubAgentSkill;
use crate::skills::loader::{load_skills, parse_skill_markdown};
use crate::skills::role_loader::load_role_profile_if_exists;
use crate::skills::vector_memory::{EmbedDocumentSkill, SemanticSearchSkill};
use crate::workflow::loader::{load_workflow, parse_markdown_content};
use anyhow::{anyhow, Result};
use clap::{Parser, Subcommand};
use regex::Regex;
use serde::{Deserialize, Serialize};
use types::*;

#[derive(Parser)]
#[command(name = "antigrav")]
#[command(about = "AI Workflow Engine for Solo Developers")]
pub struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    #[arg(short, long)]
    workflow: Option<String>,

    #[arg(long)]
    workflow_id: Option<String>,

    /// Inject template prompt into the first llm_subagent step for direct workflow runs
    #[arg(long)]
    template: Option<String>,

    /// Task text used together with --template
    #[arg(long)]
    task: Option<String>,

    /// Role remapping for llm_subagent steps, e.g. "architect=planner,implementer=debugger"
    #[arg(long)]
    role_override: Option<String>,

    #[arg(long)]
    goal: Option<String>,

    #[arg(long)]
    domain: Option<String>,

    #[arg(long)]
    snapshot_out: Option<String>,

    #[arg(long)]
    /// Resume from a snapshot file
    pub resume: Option<String>,

    /// Phase 17: Maximum execution cost
    #[arg(long, default_value = "300")]
    pub max_cost: u32,

    /// Phase 17: Maximum total latency in ms
    #[arg(long, default_value = "300000")]
    pub max_latency: u32,

    /// Phase 17: Maximum steps
    #[arg(long, default_value = "60")]
    pub max_steps: usize,

    /// Phase 20: Maximum aggregate CPU time in ms
    #[arg(long, default_value = "30000")]
    pub max_cpu_ms: u64,

    /// Phase 20: Maximum aggregate wall time in ms
    #[arg(long, default_value = "300000")]
    pub max_wall_time_ms: u64,

    /// Phase 20: Maximum filesystem read calls
    #[arg(long, default_value = "500")]
    pub max_fs_reads: u32,

    /// Phase 20: Maximum filesystem write calls
    #[arg(long, default_value = "200")]
    pub max_fs_writes: u32,

    /// Phase 20: Maximum network calls
    #[arg(long, default_value = "100")]
    pub max_network_calls: u32,

    /// Phase 21: Maximum memory usage for subprocess backends (MB)
    #[arg(long, default_value = "512")]
    pub max_memory_mb: u32,

    #[arg(long)]
    replay: Option<String>,

    #[arg(long)]
    model: Option<String>,

    #[arg(long)]
    type_goal: Option<String>,

    #[arg(long)]
    input_val: Option<String>,

    /// Phase 18: Restrict planner/executor to specific domains (comma-separated)
    #[arg(long)]
    allow_domain: Option<String>,

    /// Phase 18: Preferred domains in deterministic priority order (comma-separated)
    #[arg(long)]
    prefer_domain: Option<String>,

    /// Phase 18: Cost penalty when transitioning across domains
    #[arg(long, default_value = "0")]
    cross_domain_penalty: u32,

    /// Optional per-domain overheads, e.g. "demo:1,utils:2"
    #[arg(long)]
    domain_overhead: Option<String>,

    /// Phase 19: Disable all network access in runtime policy
    #[arg(long, default_value_t = false)]
    disable_network: bool,

    /// Phase 19: Disallow filesystem writes in runtime policy
    #[arg(long, default_value_t = false)]
    read_only: bool,

    /// Phase 19: Prefer pure/idempotent skills by penalizing external mutations
    #[arg(long, default_value_t = false)]
    strict_mode: bool,

    /// Penalty applied to ExternalMutation skills when strict mode is enabled
    #[arg(long, default_value = "20")]
    external_mutation_penalty: u32,

    /// Maximum runtime per step in milliseconds
    #[arg(long, default_value = "180000")]
    step_timeout_ms: u64,

    /// Phase 21: Maximum allowed trust tier (Trusted|Constrained|Untrusted)
    #[arg(long, default_value = "Untrusted")]
    max_trust_tier: String,

    /// Phase 22: Logical chat thread identifier for branch/session isolation
    #[arg(long)]
    thread_id: Option<String>,

    /// Skip automatic thread→git branch orchestration
    #[arg(long, default_value_t = false)]
    skip_branch_orchestration: bool,
}

pub async fn run() -> Result<()> {
    entrypoint::run_impl().await
}

use policy::{
    build_routing_policy, build_security_policy, configure_run_script_policy_env, parse_trust_tier,
};
use runtime::{
    apply_role_overrides, build_domain_registry, build_thread_flow_workflow,
    default_role_for_template_or_workflow, ensure_thread_execution_context,
    infer_workflow_ref_from_template, inject_template_prompt, instance_summary,
    load_template_prompt, parse_role_override_map, resolve_role_workflow_selection,
    resolve_template_workflow_selection, resolve_thread_branch_name, resolve_workflow_selection,
    select_template_and_workflow_for_message, validate_git_ref_like,
};
use scaffold::{
    parse_package_scaffold_kind, parse_scaffold_profile, sanitize_package_name,
    scaffold_domain_pack, scaffold_markdown_package,
};
use workflow_control::handle_workflow_control_command;

#[cfg(test)]
use runtime::{
    apply_role_override_to_input, bind_role_to_workflow_llm_steps, merge_template_input,
    normalize_auto_conflict_strategy,
};

#[cfg(test)]
use scaffold::ScaffoldProfile;

fn run_skill_quality_check(
    layout: &AgentProjectLayout,
    strict: bool,
) -> Result<SkillQualityReport> {
    catalog::run_skill_quality_check(layout, strict)
}

fn build_skill_workflow_catalog(layout: &AgentProjectLayout) -> Result<CatalogBuildReport> {
    catalog::build_skill_workflow_catalog(layout)
}

fn read_bundle_catalog(layout: &AgentProjectLayout) -> Result<Vec<BundleCatalogEntry>> {
    catalog::read_bundle_catalog(layout)
}

fn build_import_lock_sources(entries: &[SkillLockEntry]) -> Vec<ImportLockSource> {
    catalog::build_import_lock_sources(entries)
}

fn is_imported_lock_entry(entry: &SkillLockEntry) -> bool {
    catalog::is_imported_lock_entry(entry)
}

fn to_resource_id(base_dir: &Path, path: &Path) -> Option<String> {
    catalog::to_resource_id(base_dir, path)
}

fn collect_markdown_paths_recursive(root: &Path) -> Result<Vec<PathBuf>> {
    catalog::collect_markdown_paths_recursive(root)
}

#[cfg(test)]
fn read_skills_lockfile(path: &Path) -> Result<SkillsLockfile> {
    skillpack::read_skills_lockfile(path)
}

fn import_skills_from_source(
    layout: &AgentProjectLayout,
    source: &str,
    options: &ImportSkillpackOptions,
) -> Result<ImportSkillsReport> {
    skillpack::import_skills_from_source(layout, source, options)
}

fn sync_imported_skills_from_lock(
    layout: &AgentProjectLayout,
    overwrite: bool,
    mode: SkillpackInstallMode,
    allow_missing_license: bool,
) -> Result<SyncImportsReport> {
    skillpack::sync_imported_skills_from_lock(layout, overwrite, mode, allow_missing_license)
}

fn install_bundle_from_catalog(
    layout: &AgentProjectLayout,
    bundle: &str,
    mode: SkillpackInstallMode,
    overwrite: bool,
) -> Result<BundleInstallReport> {
    skillpack::install_bundle_from_catalog(layout, bundle, mode, overwrite)
}

fn verify_skills_lock(
    layout: &AgentProjectLayout,
    mode: SkillpackInstallMode,
    fail_on_extra: bool,
) -> Result<SkillsLockVerifyReport> {
    skillpack::verify_skills_lock(layout, mode, fail_on_extra)
}

#[cfg(test)]
fn parse_external_skill_markdown(content: &str, path: &Path) -> Result<skillpack::ImportedSkill> {
    skillpack::parse_external_skill_markdown(content, path)
}

#[cfg(test)]
fn parse_simple_yaml_map(frontmatter: &str) -> HashMap<String, String> {
    skillpack::parse_simple_yaml_map(frontmatter)
}

fn now_ms_u64() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}

fn fnv1a64_hex(bytes: &[u8]) -> String {
    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in bytes {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{:016x}", hash)
}

fn resolve_bootstrap_strict_ollama(flag: bool) -> bool {
    if flag {
        return true;
    }
    let Ok(raw) = std::env::var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA") else {
        return false;
    };
    matches!(
        raw.trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

fn doctor_error_count(report: &DoctorReport) -> usize {
    report
        .checks
        .iter()
        .filter(|entry| matches!(entry.status, DoctorCheckStatus::Error))
        .count()
}

fn doctor_warning_count(report: &DoctorReport) -> usize {
    report
        .checks
        .iter()
        .filter(|entry| matches!(entry.status, DoctorCheckStatus::Warning))
        .count()
}

fn print_doctor_report(report: &DoctorReport) {
    println!(
        "Doctor: checks={} errors={} warnings={} strict_ollama={} package_errors={} package_warnings={}",
        report.checks.len(),
        doctor_error_count(report),
        doctor_warning_count(report),
        report.strict_ollama,
        report.package_check.errors.len(),
        report.package_check.warnings.len(),
    );
    for check in &report.checks {
        let prefix = match check.status {
            DoctorCheckStatus::Ok => "[ok]",
            DoctorCheckStatus::Warning => "[warn]",
            DoctorCheckStatus::Error => "[error]",
        };
        println!("{} {}: {}", prefix, check.name, check.message);
    }

    if !report.package_check.errors.is_empty() {
        println!("Doctor package-check errors:");
        for issue in &report.package_check.errors {
            println!("- {}: {}", issue.path, issue.message);
        }
    }
    if !report.package_check.warnings.is_empty() {
        println!("Doctor package-check warnings:");
        for issue in &report.package_check.warnings {
            println!("- {}: {}", issue.path, issue.message);
        }
    }
}

fn run_workflow_doctor(layout: &AgentProjectLayout, strict_ollama: bool) -> Result<DoctorReport> {
    ops::run_workflow_doctor(layout, strict_ollama)
}

fn ensure_bootstrap_package(layout: &AgentProjectLayout) -> Result<Vec<std::path::PathBuf>> {
    ops::ensure_bootstrap_package(layout)
}

fn is_command_available(command: &str) -> bool {
    ops::is_command_available(command)
}

fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
    ops::walk_directory_files(root, visit)
}

fn build_graph_index(
    layout: &AgentProjectLayout,
    max_files: usize,
) -> Result<GraphIndexBuildReport> {
    ops::build_graph_index(layout, max_files)
}

fn relative_unix_path(project_root: &Path, path: &Path) -> Result<String> {
    ops::relative_unix_path(project_root, path)
}

#[cfg(test)]
fn collect_markdown_resource_entries(dir: &std::path::Path) -> Result<Vec<MarkdownResourceEntry>> {
    ops::collect_markdown_resource_entries(dir)
}

fn print_markdown_resource_listing(
    title: &str,
    dir: &std::path::Path,
    as_json: bool,
) -> Result<()> {
    ops::print_markdown_resource_listing(title, dir, as_json)
}

fn parse_skillpack_install_mode(raw: &str) -> Result<SkillpackInstallMode> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "" | "local" => Ok(SkillpackInstallMode::Local),
        "global" => Ok(SkillpackInstallMode::Global),
        other => Err(anyhow!(
            "Unsupported install mode '{}'. Use local|global",
            other
        )),
    }
}

fn print_instance_summary(instance: &WorkflowInstance) {
    println!(
        "Workflow Instance: {} status={:?} workflow={} trace_id={}",
        instance.instance_id, instance.status, instance.workflow_name, instance.trace_id
    );
    println!(
        "Progress: current_step={} completed={} failed={}",
        instance.current_step,
        instance.completed_steps.len(),
        instance.failed_steps.len()
    );
    if let Some(err) = instance.last_error.as_ref() {
        println!("Last Error: {}", err);
    }
    if !instance.trace.is_empty() {
        println!("Recent Trace:");
        let start = instance.trace.len().saturating_sub(5);
        for line in instance.trace.iter().skip(start) {
            println!("- {}", line);
        }
    }
}

fn render_timeline(instance: &WorkflowInstance) -> String {
    let mut out = Vec::new();
    out.push(format!(
        "Timeline workflow={} instance={} trace_id={} status={:?}",
        instance.workflow_name, instance.instance_id, instance.trace_id, instance.status
    ));
    out.push(format!(
        "CreatedAt={} UpdatedAt={}",
        instance.created_at_ms, instance.updated_at_ms
    ));
    for step_id in &instance.step_order {
        if let Some(state) = instance.step_states.get(step_id) {
            out.push(format!(
                "- step={} status={:?} attempts={} retries={} started={} finished={} duration_ms={} idempotent_short_circuit={} failure_class={} context_items={} cost_units={} cost_usd={:.6} tokens={} provider={} model={} call_attempts={}",
                step_id,
                state.status,
                state.attempts,
                state.retry_count,
                state
                    .started_at_ms
                    .map(|v| v.to_string())
                    .unwrap_or_else(|| "-".to_string()),
                state
                    .finished_at_ms
                    .map(|v| v.to_string())
                    .unwrap_or_else(|| "-".to_string()),
                state
                    .duration_ms
                    .map(|v| v.to_string())
                    .unwrap_or_else(|| "-".to_string()),
                state.idempotent_short_circuit,
                state.failure_class.as_deref().unwrap_or("-"),
                state.context_injected_items,
                state.estimated_cost_units,
                state.actual_cost_usd,
                state.total_tokens,
                state.provider.as_deref().unwrap_or("-"),
                state.model.as_deref().unwrap_or("-"),
                state.call_attempts,
            ));
        }
    }
    if !instance.trace.is_empty() {
        out.push("Events:".to_string());
        for line in &instance.trace {
            out.push(format!("  {}", line));
        }
    }
    out.join("\n")
}

async fn execute_workflow_instance(
    engine: Arc<ExecutionEngine>,
    workflow: crate::workflow::model::Workflow,
    workflow_path: Option<String>,
    budget: crate::engine::budget::ExecutionBudget,
    routing: RoutingPolicy,
    security: DomainSecurityPolicy,
    label: &'static str,
) -> Result<WorkflowInstance> {
    run_with_panic_guard(
        async move {
            engine
                .run_new_workflow(&workflow, workflow_path, budget, routing, security)
                .await
        },
        label,
    )
    .await
}

async fn run_with_panic_guard<F, T>(future: F, label: &str) -> Result<T>
where
    F: Future<Output = Result<T>> + Send + 'static,
    T: Send + 'static,
{
    match tokio::spawn(future).await {
        Ok(result) => result,
        Err(join_err) => {
            if join_err.is_panic() {
                return Err(anyhow!("{} panicked during execution", label));
            }
            Err(anyhow!("{} task cancelled: {}", label, join_err))
        }
    }
}

mod catalog;
mod entrypoint;
mod ops;
mod policy;
mod runtime;
mod scaffold;
mod skillpack;
mod types;
mod workflow_control;

#[cfg(test)]
mod tests;
