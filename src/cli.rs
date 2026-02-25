use std::collections::{HashMap, HashSet};
use std::future::Future;
use std::sync::Arc;

use crate::engine::package_check::PackageCheckReport;
use crate::engine::planner::Planner;
use crate::engine::project::AgentProjectLayout;
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::engine::session::{AgentSession, LlmAdapter};
use crate::engine::v2::{ExecutionEngineV2, WorkflowInstanceStatus, WorkflowStateStore};
use crate::skill::capability::{CapabilityPermissions, TrustTier};
use crate::skills::dev_workflow::{EnsureBranchSkill, RunScriptSkill, WriteFileSkill};
use crate::skills::echo::EchoSkill;
use crate::skills::flaky::FlakySkill;
use crate::skills::git_ops::{AnalyzeConflictsSkill, GitCommitSkill, GitMergeBranchSkill};
use crate::skills::is_positive::IsPositiveSkill;
use crate::skills::llm_subagent::LlmSubAgentSkill;
use crate::skills::loader::load_skills;
use crate::skills::vector_memory::{EmbedDocumentSkill, SemanticSearchSkill};
use crate::workflow::loader::load_workflow;
use anyhow::{anyhow, Result};
use clap::{Parser, Subcommand};

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
    #[arg(long, default_value = "100")]
    pub max_cost: u32,

    /// Phase 17: Maximum total latency in ms
    #[arg(long, default_value = "10000")]
    pub max_latency: u32,

    /// Phase 17: Maximum steps
    #[arg(long, default_value = "20")]
    pub max_steps: usize,

    /// Phase 20: Maximum aggregate CPU time in ms
    #[arg(long, default_value = "10000")]
    pub max_cpu_ms: u64,

    /// Phase 20: Maximum aggregate wall time in ms
    #[arg(long, default_value = "10000")]
    pub max_wall_time_ms: u64,

    /// Phase 20: Maximum filesystem read calls
    #[arg(long, default_value = "128")]
    pub max_fs_reads: u32,

    /// Phase 20: Maximum filesystem write calls
    #[arg(long, default_value = "64")]
    pub max_fs_writes: u32,

    /// Phase 20: Maximum network calls
    #[arg(long, default_value = "32")]
    pub max_network_calls: u32,

    /// Phase 21: Maximum memory usage for subprocess backends (MB)
    #[arg(long, default_value = "256")]
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
    #[arg(long, default_value = "30000")]
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

#[derive(Subcommand, Debug, Clone)]
enum Commands {
    Workflow {
        #[command(subcommand)]
        action: WorkflowCommand,
    },
}

#[derive(Subcommand, Debug, Clone)]
enum WorkflowCommand {
    Status {
        id: Option<String>,
    },
    Resume {
        id: String,
    },
    Abort {
        id: String,
    },
    Trace {
        id: String,
        #[arg(long, default_value_t = false)]
        json: bool,
        #[arg(long, default_value_t = false)]
        timeline: bool,
    },
    Check {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    List,
}

pub async fn run() -> Result<()> {
    let cli = Cli::parse();

    if cli.replay.is_some() {
        return Err(anyhow!(
            "Replay mode (--replay) is deprecated after v2 consolidation; use 'workflow trace <id> --timeline|--json'"
        ));
    }
    if cli.resume.is_some() {
        return Err(anyhow!(
            "Snapshot resume (--resume) is deprecated after v2 consolidation; use 'workflow resume <id>'"
        ));
    }
    if cli.snapshot_out.is_some() {
        eprintln!("Warning: --snapshot-out is ignored; v2 no longer emits v1 snapshots.");
    }
    warn_engine_override_deprecation();

    let cwd = std::env::current_dir()?;
    let project_root = cwd.to_string_lossy().to_string();
    let project_layout = AgentProjectLayout::discover(&project_root)?;
    project_layout.validate_startup()?;

    let mut resume_instance_id: Option<String> = None;
    if let Some(command) = cli.command.clone() {
        let state_store = WorkflowStateStore::new(&project_root)?;
        resume_instance_id =
            handle_workflow_control_command(&state_store, &project_layout, command)?;
        if resume_instance_id.is_none() {
            return Ok(());
        }
    }

    let domains = build_domain_registry()?;

    let domains_arc = Arc::new(domains);
    let v2_engine = Arc::new(ExecutionEngineV2::new(
        &project_root,
        Arc::clone(&domains_arc),
    )?);

    let mut budget = crate::engine::budget::ExecutionBudget {
        max_total_cost: cli.max_cost,
        max_total_latency_ms: cli.max_latency,
        max_steps: cli.max_steps,
        resource_budget: crate::engine::budget::ResourceBudget {
            max_cpu_ms: cli.max_cpu_ms,
            max_wall_time_ms: cli.max_wall_time_ms,
            max_fs_reads: cli.max_fs_reads,
            max_fs_writes: cli.max_fs_writes,
            max_network_calls: cli.max_network_calls,
            max_memory_mb: cli.max_memory_mb,
        },
    };

    let default_domain_name = cli.domain.clone().unwrap_or_else(|| "demo".to_string());
    let mut routing_policy = build_routing_policy(
        &default_domain_name,
        cli.allow_domain.as_deref(),
        cli.prefer_domain.as_deref(),
        cli.cross_domain_penalty,
        cli.domain_overhead.as_deref(),
    )?;
    let mut security_policy = build_security_policy(
        cli.disable_network,
        cli.read_only,
        cli.strict_mode,
        cli.external_mutation_penalty,
        cli.step_timeout_ms,
        parse_trust_tier(&cli.max_trust_tier)?,
    );
    let project_rules = project_layout.load_runtime_rules()?;
    project_rules.apply_to(&mut budget, &mut routing_policy, &mut security_policy);
    configure_run_script_policy_env(&project_rules, &security_policy);

    let session = cli
        .thread_id
        .as_ref()
        .map(|thread_id| {
            AgentSession::new(
                &project_root,
                thread_id,
                &project_layout,
                LlmAdapter::default(),
            )
        })
        .transpose()?;
    if let Some(ref s) = session {
        if !cli.skip_branch_orchestration {
            s.ensure_thread_branch()?;
        }
        println!("{}", s.summary_line());
    }

    if let Some(instance_id) = resume_instance_id {
        let instance = run_with_panic_guard(
            {
                let engine = Arc::clone(&v2_engine);
                let budget = budget.clone();
                let routing = routing_policy.clone();
                let security = security_policy.clone();
                async move {
                    engine
                        .resume_workflow(&instance_id, budget, routing, security)
                        .await
                }
            },
            "workflow resume",
        )
        .await?;
        print_v2_instance_summary(&instance);
        return Ok(());
    }

    if let Some(goal) = cli.goal.clone() {
        println!(
            "🤖 Autonomous Goal: '{}' in domain: '{}'",
            goal, default_domain_name
        );
        let mut workflow = run_with_panic_guard(
            {
                let domains = Arc::clone(&domains_arc);
                let domain = default_domain_name.clone();
                let goal_for_plan = goal.clone();
                async move {
                    let planner = Planner::new(domains);
                    planner.plan(&domain, &goal_for_plan).await
                }
            },
            "v2 goal planning",
        )
        .await?;
        workflow.meta.routing_policy = Some(routing_policy.clone());
        workflow.meta.security_policy = Some(security_policy.clone());
        workflow.meta.resource_budget = Some(budget.resource_budget.clone());
        if workflow.meta.domain.is_none() {
            workflow.meta.domain = Some(default_domain_name.clone());
        }
        let instance = run_with_panic_guard(
            {
                let engine = Arc::clone(&v2_engine);
                let budget = budget.clone();
                let routing = routing_policy.clone();
                let security = security_policy.clone();
                async move {
                    engine
                        .run_new_workflow(&workflow, None, budget, routing, security)
                        .await
                }
            },
            "v2 goal execution",
        )
        .await?;
        print_v2_instance_summary(&instance);
        return Ok(());
    }

    let (mut workflow, workflow_path) = resolve_workflow_selection(
        &cli,
        &project_layout,
        &default_domain_name,
        &domains_arc,
        &budget,
        &routing_policy,
        &security_policy,
    )?;
    if workflow.meta.routing_policy.is_none() {
        workflow.meta.routing_policy = Some(routing_policy.clone());
    }
    if workflow.meta.security_policy.is_none() {
        workflow.meta.security_policy = Some(security_policy.clone());
    }
    if workflow.meta.domain.is_none() {
        workflow.meta.domain = Some(default_domain_name.clone());
    }
    let instance = run_with_panic_guard(
        {
            let engine = Arc::clone(&v2_engine);
            let budget = budget.clone();
            let routing = routing_policy.clone();
            let security = security_policy.clone();
            async move {
                engine
                    .run_new_workflow(&workflow, workflow_path, budget, routing, security)
                    .await
            }
        },
        "workflow execution",
    )
    .await?;
    print_v2_instance_summary(&instance);

    Ok(())
}

fn build_domain_registry() -> Result<DomainRegistry> {
    let mut domains = DomainRegistry::new();
    domains.register_domain("demo");
    domains.register_skill("demo", Arc::new(EchoSkill::new()))?;
    domains.register_skill("demo", Arc::new(IsPositiveSkill::new()))?;
    domains.register_skill("demo", Arc::new(FlakySkill::new()))?;
    domains.register_skill(
        "demo",
        Arc::new(crate::skills::parse_number::ParseNumberSkill::new()),
    )?;

    domains.register_domain("utils");
    domains.register_skill("utils", Arc::new(EchoSkill::new()))?;
    domains.register_skill("utils", Arc::new(IsPositiveSkill::new()))?;
    domains.register_skill(
        "utils",
        Arc::new(crate::skills::parse_number::ParseNumberSkill::new()),
    )?;

    domains.register_domain("agent");
    domains.register_skill("agent", Arc::new(LlmSubAgentSkill::new()))?;
    domains.register_skill("agent", Arc::new(EnsureBranchSkill))?;
    domains.register_skill("agent", Arc::new(RunScriptSkill))?;
    domains.register_skill("agent", Arc::new(WriteFileSkill))?;
    domains.register_skill("agent", Arc::new(GitCommitSkill))?;
    domains.register_skill("agent", Arc::new(GitMergeBranchSkill))?;
    domains.register_skill("agent", Arc::new(AnalyzeConflictsSkill))?;
    domains.register_skill(
        "agent",
        Arc::new(EmbedDocumentSkill::new(".agent/memory/vector_index.json")),
    )?;
    domains.register_skill(
        "agent",
        Arc::new(SemanticSearchSkill::new(".agent/memory/vector_index.json")),
    )?;
    domains.merge_from(load_skills()?);
    Ok(domains)
}

fn resolve_workflow_selection(
    cli: &Cli,
    project_layout: &AgentProjectLayout,
    default_domain_name: &str,
    domains_arc: &Arc<DomainRegistry>,
    budget: &crate::engine::budget::ExecutionBudget,
    routing_policy: &RoutingPolicy,
    security_policy: &DomainSecurityPolicy,
) -> Result<(crate::workflow::model::Workflow, Option<String>)> {
    if let Some(type_target) = cli.type_goal.as_ref() {
        let input_val = cli.input_val.clone().unwrap_or_else(|| "10".to_string());
        let planner = crate::engine::planner::DeterministicPlanner::new(Arc::clone(domains_arc));
        let workflow = planner.synthesize_with_budget_and_routing_and_security(
            default_domain_name,
            type_target,
            &input_val,
            budget,
            routing_policy,
            security_policy,
        )?;
        return Ok((workflow, None));
    }
    if let Some(path) = cli.workflow.as_ref() {
        let resolved = project_layout
            .resolve_workflow_path(path)
            .unwrap_or_else(|| std::path::PathBuf::from(path.clone()));
        let resolved_str = resolved
            .to_str()
            .ok_or_else(|| anyhow!("Invalid workflow path encoding"))?
            .to_string();
        let workflow = load_workflow(&resolved_str)?;
        return Ok((workflow, Some(resolved_str)));
    }
    if let Some(workflow_id) = cli.workflow_id.as_ref() {
        let resolved = project_layout
            .resolve_workflow_path(workflow_id)
            .ok_or_else(|| {
                anyhow!(
                    "Workflow id '{}' not found in .agent/workflows",
                    workflow_id
                )
            })?;
        let resolved_str = resolved
            .to_str()
            .ok_or_else(|| anyhow!("Invalid workflow path encoding"))?
            .to_string();
        let workflow = load_workflow(&resolved_str)?;
        return Ok((workflow, Some(resolved_str)));
    }

    Err(anyhow!(
        "Either --workflow/--workflow-id or --goal must be provided"
    ))
}

fn handle_workflow_control_command(
    state_store: &WorkflowStateStore,
    project_layout: &AgentProjectLayout,
    command: Commands,
) -> Result<Option<String>> {
    let Commands::Workflow { action } = command;
    match action {
        WorkflowCommand::List => {
            let instances = state_store.list_instances()?;
            if instances.is_empty() {
                println!("No workflow instances found.");
                return Ok(None);
            }
            println!("Workflow Instances:");
            for item in instances {
                println!(
                    "- {} status={:?} workflow={} updated_at={}",
                    item.instance_id, item.status, item.workflow_name, item.updated_at_ms
                );
            }
            Ok(None)
        }
        WorkflowCommand::Status { id } => {
            if let Some(instance_id) = id {
                let instance = state_store.load(&instance_id)?;
                print_v2_instance_summary(&instance);
                return Ok(None);
            }
            let instances = state_store.list_instances()?;
            if instances.is_empty() {
                println!("No workflow instances found.");
                return Ok(None);
            }
            println!("Workflow Instances:");
            for item in instances {
                println!(
                    "- {} status={:?} workflow={} current_step={} updated_at={}",
                    item.instance_id,
                    item.status,
                    item.workflow_name,
                    item.current_step,
                    item.updated_at_ms
                );
            }
            Ok(None)
        }
        WorkflowCommand::Abort { id } => {
            state_store.request_abort(&id)?;
            if let Ok(mut instance) = state_store.load(&id) {
                if instance.status == WorkflowInstanceStatus::Pending
                    || instance.status == WorkflowInstanceStatus::Running
                {
                    instance.status = WorkflowInstanceStatus::Aborted;
                    instance.last_error = Some("Abort requested by operator".to_string());
                    state_store.save(&mut instance)?;
                }
            }
            println!("Abort requested for workflow instance '{}'.", id);
            Ok(None)
        }
        WorkflowCommand::Trace { id, json, timeline } => {
            let instance = state_store.load(&id)?;
            if json || !timeline {
                let body = serde_json::to_string_pretty(&instance)?;
                println!("{}", body);
            }
            if timeline {
                println!("{}", render_v2_timeline(&instance));
            }
            Ok(None)
        }
        WorkflowCommand::Check { json } => {
            let report = crate::engine::package_check::run_package_check(project_layout)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                print_package_check_report(&report);
            }
            if !report.ok() {
                return Err(anyhow!(
                    "workflow package check failed with {} error(s)",
                    report.errors.len()
                ));
            }
            Ok(None)
        }
        WorkflowCommand::Resume { id } => Ok(Some(id)),
    }
}

fn print_package_check_report(report: &PackageCheckReport) {
    println!(
        "Package Check: checked={} errors={} warnings={}",
        report.checked_files,
        report.errors.len(),
        report.warnings.len()
    );
    if !report.errors.is_empty() {
        println!("Errors:");
        for issue in &report.errors {
            println!("- {}: {}", issue.path, issue.message);
        }
    }
    if !report.warnings.is_empty() {
        println!("Warnings:");
        for issue in &report.warnings {
            println!("- {}: {}", issue.path, issue.message);
        }
    }
}

fn print_v2_instance_summary(instance: &crate::engine::v2::WorkflowInstance) {
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

fn render_v2_timeline(instance: &crate::engine::v2::WorkflowInstance) -> String {
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
                "- step={} status={:?} attempts={} retries={} started={} finished={} duration_ms={} idempotent_short_circuit={} failure_class={}",
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

fn warn_engine_override_deprecation() {
    let Ok(raw) = std::env::var("AGENT_ENGINE") else {
        return;
    };
    let normalized = raw.trim().to_ascii_lowercase();
    if normalized.is_empty() || normalized == "v2" {
        return;
    }
    if normalized == "v1" {
        eprintln!("Warning: AGENT_ENGINE=v1 is deprecated and ignored; v2 is now the only execution engine.");
        return;
    }
    eprintln!(
        "Warning: Unknown AGENT_ENGINE='{}'; v2 is now the only execution engine.",
        raw
    );
}

fn parse_csv_list(value: Option<&str>) -> Vec<String> {
    value
        .unwrap_or_default()
        .split(',')
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .collect()
}

fn parse_domain_overhead_map(value: Option<&str>) -> Result<HashMap<String, u32>> {
    let mut map = HashMap::new();
    for item in parse_csv_list(value) {
        let (domain, cost_str) = item
            .split_once(':')
            .ok_or_else(|| anyhow!("Invalid --domain-overhead entry '{}'", item))?;
        let cost = cost_str
            .trim()
            .parse::<u32>()
            .map_err(|_| anyhow!("Invalid overhead cost in '{}'", item))?;
        map.insert(domain.trim().to_string(), cost);
    }
    Ok(map)
}

fn build_routing_policy(
    default_domain: &str,
    allow_domain: Option<&str>,
    prefer_domain: Option<&str>,
    cross_domain_penalty: u32,
    domain_overhead: Option<&str>,
) -> Result<RoutingPolicy> {
    let mut policy = RoutingPolicy::for_single_domain(default_domain);

    let allowed = parse_csv_list(allow_domain);
    if !allowed.is_empty() {
        policy.allowed_domains = Some(allowed.into_iter().collect::<HashSet<_>>());
        policy.preferred_domains.clear();
    }

    let preferred = parse_csv_list(prefer_domain);
    if !preferred.is_empty() {
        policy.preferred_domains = preferred;
    }

    policy.cross_domain_penalty = cross_domain_penalty;
    policy.domain_overhead_cost = parse_domain_overhead_map(domain_overhead)?;
    Ok(policy)
}

fn build_security_policy(
    disable_network: bool,
    read_only: bool,
    strict_mode: bool,
    external_mutation_penalty: u32,
    step_timeout_ms: u64,
    max_trust_tier: TrustTier,
) -> DomainSecurityPolicy {
    let mut has_override = false;
    let mut override_permissions = CapabilityPermissions::all();

    if disable_network {
        has_override = true;
        override_permissions.allow_network = false;
    }

    if read_only {
        has_override = true;
        override_permissions.allow_fs_write = false;
    }

    DomainSecurityPolicy {
        override_permissions: if has_override {
            Some(override_permissions)
        } else {
            None
        },
        strict_mode,
        max_trust_tier,
        external_mutation_penalty,
        step_timeout_ms,
    }
}

fn parse_trust_tier(value: &str) -> Result<TrustTier> {
    match value.trim() {
        "Trusted" => Ok(TrustTier::Trusted),
        "Constrained" => Ok(TrustTier::Constrained),
        "Untrusted" => Ok(TrustTier::Untrusted),
        other => Err(anyhow!(
            "Invalid --max-trust-tier value '{}'. Expected Trusted|Constrained|Untrusted",
            other
        )),
    }
}

fn configure_run_script_policy_env(
    project_rules: &crate::engine::project::ProjectRuntimeRules,
    security_policy: &DomainSecurityPolicy,
) {
    let timeout_ms = project_rules
        .run_script_timeout_ms
        .unwrap_or(security_policy.step_timeout_ms)
        .min(security_policy.step_timeout_ms);
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_TIMEOUT_MS", timeout_ms.to_string());

    let allowlist = project_rules
        .run_script_allowed_commands
        .clone()
        .unwrap_or_else(|| {
            vec![
                "cargo".to_string(),
                "git".to_string(),
                "npm".to_string(),
                "pnpm".to_string(),
                "yarn".to_string(),
                "make".to_string(),
                "just".to_string(),
                "go".to_string(),
                "pytest".to_string(),
                "flutter".to_string(),
                "dart".to_string(),
            ]
        });
    let normalized = allowlist
        .into_iter()
        .map(|s| s.trim().to_ascii_lowercase())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(",");
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_ALLOWLIST", normalized);

    let denylist = project_rules
        .run_script_denied_commands
        .clone()
        .unwrap_or_else(|| {
            vec![
                "sudo".to_string(),
                "dd".to_string(),
                "mkfs".to_string(),
                "shutdown".to_string(),
                "reboot".to_string(),
                "poweroff".to_string(),
                "launchctl".to_string(),
            ]
        });
    let deny_normalized = denylist
        .into_iter()
        .map(|s| s.trim().to_ascii_lowercase())
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join(",");
    std::env::set_var("ANTIGRAV_RUN_SCRIPT_DENYLIST", deny_normalized);

    let allow_shell_operators = project_rules
        .run_script_allow_shell_operators
        .unwrap_or(false);
    std::env::set_var(
        "ANTIGRAV_RUN_SCRIPT_ALLOW_SHELL_OPERATORS",
        if allow_shell_operators { "1" } else { "0" },
    );
}
