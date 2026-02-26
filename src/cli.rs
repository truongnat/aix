use std::collections::{HashMap, HashSet};
use std::fs;
use std::future::Future;
use std::path::{Path, PathBuf};
use std::process::Command as ProcessCommand;
use std::sync::Arc;

use crate::engine::package_check::PackageCheckReport;
use crate::engine::package_schema::PackageMarkdownKind;
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
use crate::skills::loader::load_skills;
use crate::skills::role_loader::load_role_profile_if_exists;
use crate::skills::vector_memory::{EmbedDocumentSkill, SemanticSearchSkill};
use crate::workflow::loader::load_workflow;
use anyhow::{anyhow, Result};
use clap::{Parser, Subcommand};
use rusqlite::params;
use serde::Serialize;

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
    IndexGraph {
        #[arg(long, default_value_t = 300)]
        max_files: usize,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Doctor {
        /// Print machine-readable doctor report
        #[arg(long, default_value_t = false)]
        json: bool,
        /// Require Ollama to be installed and daemon-responsive
        #[arg(long, default_value_t = false)]
        strict_ollama: bool,
    },
    Setup {
        /// Print machine-readable setup + doctor report
        #[arg(long, default_value_t = false)]
        json: bool,
        /// Require Ollama to be installed and daemon-responsive
        #[arg(long, default_value_t = false)]
        strict_ollama: bool,
    },
    StartTemplate {
        template: String,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        task: String,
    },
    StartRole {
        role: String,
        #[arg(long)]
        task: String,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        template: Option<String>,
        #[arg(long)]
        thread_id: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    ChatThread {
        thread_id: String,
        #[arg(long)]
        message: String,
        #[arg(long)]
        role: Option<String>,
        #[arg(long)]
        workflow_id: Option<String>,
        #[arg(long)]
        template: Option<String>,
        #[arg(long, default_value = "main")]
        target_branch: String,
        #[arg(long, default_value = "cargo test")]
        validate_command: String,
        #[arg(long, default_value_t = false)]
        no_merge: bool,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Roles {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Templates {
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    ThreadFlow {
        thread_id: String,
        #[arg(long, default_value = "main")]
        target_branch: String,
        #[arg(long, default_value = "cargo test")]
        validate_command: String,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    Scaffold {
        kind: String,
        name: String,
        #[arg(long, default_value_t = false)]
        overwrite: bool,
    },
    Threads {
        thread_id: Option<String>,
        #[arg(long, default_value_t = false)]
        json: bool,
    },
    List,
}

#[derive(Debug, Clone)]
struct TemplateRunRequest {
    template: String,
    workflow_id: Option<String>,
    task: String,
}

#[derive(Debug, Clone)]
struct RoleRunRequest {
    role: String,
    task: String,
    workflow_id: Option<String>,
    template: Option<String>,
    thread_id: Option<String>,
    json: bool,
}

#[derive(Debug, Clone)]
struct ChatThreadRequest {
    thread_id: String,
    message: String,
    role: Option<String>,
    workflow_id: Option<String>,
    template: Option<String>,
    target_branch: String,
    validate_command: String,
    no_merge: bool,
    json: bool,
}

#[derive(Debug, Clone)]
struct ThreadFlowRequest {
    thread_id: String,
    target_branch: String,
    validate_command: String,
    json: bool,
}

enum WorkflowLaunchAction {
    Noop,
    Resume { id: String },
    StartTemplate(TemplateRunRequest),
    StartRole(RoleRunRequest),
    ChatThread(ChatThreadRequest),
    ThreadFlow(ThreadFlowRequest),
}

#[derive(Debug, Clone, Serialize)]
struct MarkdownResourceEntry {
    id: String,
    path: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
enum DoctorCheckStatus {
    Ok,
    Warning,
    Error,
}

#[derive(Debug, Clone, Serialize)]
struct DoctorCheckResult {
    name: String,
    status: DoctorCheckStatus,
    message: String,
}

#[derive(Debug, Clone, Serialize)]
struct DoctorReport {
    ok: bool,
    strict_ollama: bool,
    checks: Vec<DoctorCheckResult>,
    package_check: PackageCheckReport,
}

#[derive(Debug, Clone, Serialize)]
struct SetupReport {
    created_files: Vec<String>,
    doctor: DoctorReport,
}

#[derive(Debug, Clone, Serialize)]
struct GraphIndexNodeDoc {
    id: String,
    text: String,
    tags: Vec<String>,
    links: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
struct GraphIndexPayloadDoc {
    nodes: Vec<GraphIndexNodeDoc>,
}

#[derive(Debug, Clone, Serialize)]
struct GraphIndexBuildReport {
    index_path: String,
    nodes: usize,
    edges: usize,
    context_db_path: String,
    context_vector_table: String,
    context_graph_table: String,
    vector_entries: usize,
    graph_entries: usize,
}

#[derive(Debug, Clone)]
struct ContextSqliteWriteReport {
    db_path: String,
    vector_table: String,
    graph_table: String,
    vector_entries: usize,
    graph_entries: usize,
}

#[derive(Debug, Clone, Serialize)]
struct ThreadRunSummary {
    instance_id: String,
    workflow_name: String,
    status: String,
    trace_id: String,
}

#[derive(Debug, Clone, Serialize)]
struct ChatThreadRunReport {
    thread_id: String,
    branch: String,
    selected_workflow: String,
    selected_template: String,
    selected_role: String,
    implementation: ThreadRunSummary,
    merge: Option<ThreadRunSummary>,
}

pub async fn run() -> Result<()> {
    let cli = Cli::parse();

    if cli.replay.is_some() {
        return Err(anyhow!(
            "Replay mode (--replay) is deprecated after engine consolidation; use 'workflow trace <id> --timeline|--json'"
        ));
    }
    if cli.resume.is_some() {
        return Err(anyhow!(
            "Snapshot resume (--resume) is deprecated after engine consolidation; use 'workflow resume <id>'"
        ));
    }
    if cli.snapshot_out.is_some() {
        eprintln!("Warning: --snapshot-out is ignored; snapshot export is no longer supported.");
    }

    let cwd = std::env::current_dir()?;
    let project_root = cwd.to_string_lossy().to_string();
    let project_layout = AgentProjectLayout::discover(&project_root)?;
    project_layout.validate_startup()?;
    let thread_session_store = ThreadSessionStore::new(&project_root)?;

    let mut resume_instance_id: Option<String> = None;
    let mut template_request: Option<TemplateRunRequest> = None;
    let mut role_request: Option<RoleRunRequest> = None;
    let mut chat_thread_request: Option<ChatThreadRequest> = None;
    let mut thread_flow_request: Option<ThreadFlowRequest> = None;
    if let Some(command) = cli.command.clone() {
        let state_store = WorkflowStateStore::new(&project_root)?;
        match handle_workflow_control_command(
            &state_store,
            &thread_session_store,
            &project_layout,
            command,
        )? {
            WorkflowLaunchAction::Noop => return Ok(()),
            WorkflowLaunchAction::Resume { id } => resume_instance_id = Some(id),
            WorkflowLaunchAction::StartTemplate(request) => template_request = Some(request),
            WorkflowLaunchAction::StartRole(request) => role_request = Some(request),
            WorkflowLaunchAction::ChatThread(request) => chat_thread_request = Some(request),
            WorkflowLaunchAction::ThreadFlow(request) => thread_flow_request = Some(request),
        }
    }
    if template_request.is_some() && (cli.template.is_some() || cli.task.is_some()) {
        return Err(anyhow!(
            "Do not combine 'workflow start-template' with top-level --template/--task flags"
        ));
    }
    if role_request.is_some() && (cli.template.is_some() || cli.task.is_some()) {
        return Err(anyhow!(
            "Do not combine 'workflow start-role' with top-level --template/--task flags"
        ));
    }
    let role_overrides = parse_role_override_map(cli.role_override.as_deref())?;

    let domains = build_domain_registry()?;

    let domains_arc = Arc::new(domains);
    let runtime_engine = Arc::new(ExecutionEngine::new(
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
        let _ = thread_session_store.ensure_thread(&s.active_thread_id, &s.active_branch)?;
        println!("{}", s.summary_line());
    }

    if let Some(instance_id) = resume_instance_id {
        let resume_instance_id_for_run = instance_id.clone();
        let instance = run_with_panic_guard(
            {
                let engine = Arc::clone(&runtime_engine);
                let budget = budget.clone();
                let routing = routing_policy.clone();
                let security = security_policy.clone();
                async move {
                    engine
                        .resume_workflow(&resume_instance_id_for_run, budget, routing, security)
                        .await
                }
            },
            "workflow resume",
        )
        .await?;
        if let Some(s) = session.as_ref() {
            let _ = thread_session_store.record_instance(
                &s.active_thread_id,
                &s.active_branch,
                &instance,
            )?;
        } else if let Some(mapped) =
            thread_session_store.resolve_thread_for_instance(&instance_id)?
        {
            let _ = thread_session_store.record_instance(
                &mapped.thread_id,
                &mapped.branch,
                &instance,
            )?;
        }
        print_instance_summary(&instance);
        return Ok(());
    }

    if let Some(request) = role_request {
        if let Some(session_thread_id) = cli.thread_id.as_deref() {
            if let Some(command_thread_id) = request.thread_id.as_deref() {
                if session_thread_id != command_thread_id {
                    return Err(anyhow!(
                        "start-role thread_id '{}' does not match --thread-id '{}'",
                        command_thread_id,
                        session_thread_id
                    ));
                }
            }
        }

        let (mut workflow, workflow_path, selected_template, selected_workflow, selected_role) =
            resolve_role_workflow_selection(&project_layout, &request)?;
        if workflow.meta.routing_policy.is_none() {
            workflow.meta.routing_policy = Some(routing_policy.clone());
        }
        if workflow.meta.security_policy.is_none() {
            workflow.meta.security_policy = Some(security_policy.clone());
        }
        if workflow.meta.domain.is_none() {
            workflow.meta.domain = Some(default_domain_name.clone());
        }

        let mut execution_thread = None::<(String, String)>;
        if let Some(thread_id) = request
            .thread_id
            .clone()
            .or_else(|| session.as_ref().map(|s| s.active_thread_id.clone()))
        {
            execution_thread = Some(ensure_thread_execution_context(
                &project_root,
                &project_layout,
                &thread_session_store,
                &thread_id,
                cli.skip_branch_orchestration,
            )?);
        }

        let instance = execute_workflow_instance(
            Arc::clone(&runtime_engine),
            workflow,
            workflow_path,
            budget.clone(),
            routing_policy.clone(),
            security_policy.clone(),
            "role workflow execution",
        )
        .await?;

        if let Some((thread_id, thread_branch)) = execution_thread {
            let _ = thread_session_store.record_instance(&thread_id, &thread_branch, &instance)?;
        }

        if request.json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "role": selected_role,
                    "template": selected_template,
                    "workflow": selected_workflow,
                    "instance": instance,
                }))?
            );
        } else {
            println!(
                "Role launch: role='{}' workflow='{}' template='{}'",
                selected_role, selected_workflow, selected_template
            );
            print_instance_summary(&instance);
        }
        return Ok(());
    }

    if let Some(request) = chat_thread_request {
        if let Some(session_thread_id) = cli.thread_id.as_deref() {
            if session_thread_id != request.thread_id {
                return Err(anyhow!(
                    "chat-thread thread_id '{}' does not match --thread-id '{}'",
                    request.thread_id,
                    session_thread_id
                ));
            }
        }
        if request.message.trim().is_empty() {
            return Err(anyhow!("chat-thread --message must not be empty"));
        }

        let (auto_template, auto_workflow) =
            select_template_and_workflow_for_message(&request.message);
        let selected_template = request.template.clone().unwrap_or(auto_template);
        let selected_workflow = request.workflow_id.clone().unwrap_or_else(|| {
            if request.template.is_some() {
                infer_workflow_ref_from_template(&selected_template)
            } else {
                auto_workflow
            }
        });
        let selected_role = request.role.clone().unwrap_or_else(|| {
            default_role_for_template_or_workflow(&selected_template, &selected_workflow)
                .to_string()
        });
        let (_, thread_branch) = ensure_thread_execution_context(
            &project_root,
            &project_layout,
            &thread_session_store,
            &request.thread_id,
            cli.skip_branch_orchestration,
        )?;

        let role_launch = RoleRunRequest {
            role: selected_role.clone(),
            task: request.message.clone(),
            workflow_id: Some(selected_workflow.clone()),
            template: Some(selected_template.clone()),
            thread_id: Some(request.thread_id.clone()),
            json: false,
        };
        let (mut workflow, workflow_path, _, _, _) =
            resolve_role_workflow_selection(&project_layout, &role_launch)?;
        workflow.meta.name = format!(
            "chat-thread-{}-{}",
            request.thread_id.trim(),
            workflow.meta.name
        );
        workflow.meta.goal = Some(request.message.trim().to_string());
        workflow.meta.target_type = Some("chat_thread".to_string());
        if workflow.meta.routing_policy.is_none() {
            workflow.meta.routing_policy = Some(routing_policy.clone());
        }
        if workflow.meta.security_policy.is_none() {
            workflow.meta.security_policy = Some(security_policy.clone());
        }
        if workflow.meta.domain.is_none() {
            workflow.meta.domain = Some(default_domain_name.clone());
        }

        let implementation_instance = execute_workflow_instance(
            Arc::clone(&runtime_engine),
            workflow,
            workflow_path,
            budget.clone(),
            routing_policy.clone(),
            security_policy.clone(),
            "chat-thread implementation execution",
        )
        .await?;
        let _ = thread_session_store.record_instance(
            &request.thread_id,
            &thread_branch,
            &implementation_instance,
        )?;

        let mut merge_instance = None::<WorkflowInstance>;
        if !request.no_merge {
            let thread_flow_request = ThreadFlowRequest {
                thread_id: request.thread_id.clone(),
                target_branch: request.target_branch.clone(),
                validate_command: request.validate_command.clone(),
                json: false,
            };
            let mut merge_workflow =
                build_thread_flow_workflow(&project_layout, &thread_flow_request)?;
            merge_workflow.meta.routing_policy = Some(routing_policy.clone());
            merge_workflow.meta.security_policy = Some(security_policy.clone());
            merge_workflow.meta.resource_budget = Some(budget.resource_budget.clone());
            let merge = execute_workflow_instance(
                Arc::clone(&runtime_engine),
                merge_workflow,
                None,
                budget.clone(),
                routing_policy.clone(),
                security_policy.clone(),
                "chat-thread merge execution",
            )
            .await?;
            let _ =
                thread_session_store.record_instance(&request.thread_id, &thread_branch, &merge)?;
            merge_instance = Some(merge);
        }

        let report = ChatThreadRunReport {
            thread_id: request.thread_id.clone(),
            branch: thread_branch,
            selected_workflow,
            selected_template,
            selected_role,
            implementation: instance_summary(&implementation_instance),
            merge: merge_instance.as_ref().map(instance_summary),
        };

        if request.json {
            println!("{}", serde_json::to_string_pretty(&report)?);
        } else {
            println!(
                "Chat thread executed: thread='{}' branch='{}' workflow='{}' template='{}' role='{}'",
                report.thread_id,
                report.branch,
                report.selected_workflow,
                report.selected_template,
                report.selected_role
            );
            println!(
                "Implementation run: instance={} status={} trace={}",
                report.implementation.instance_id,
                report.implementation.status,
                report.implementation.trace_id
            );
            if let Some(merge) = report.merge.as_ref() {
                println!(
                    "Merge run: instance={} status={} trace={}",
                    merge.instance_id, merge.status, merge.trace_id
                );
            } else {
                println!("Merge run skipped (--no-merge).");
            }
        }
        return Ok(());
    }

    if let Some(request) = thread_flow_request {
        if let Some(session_thread_id) = cli.thread_id.as_deref() {
            if session_thread_id != request.thread_id {
                return Err(anyhow!(
                    "thread-flow thread_id '{}' does not match --thread-id '{}'",
                    request.thread_id,
                    session_thread_id
                ));
            }
        }
        let thread_branch = resolve_thread_branch_name(&project_layout, &request.thread_id)?;
        let _ = thread_session_store.ensure_thread(&request.thread_id, &thread_branch)?;
        let mut workflow = build_thread_flow_workflow(&project_layout, &request)?;
        workflow.meta.routing_policy = Some(routing_policy.clone());
        workflow.meta.security_policy = Some(security_policy.clone());
        workflow.meta.resource_budget = Some(budget.resource_budget.clone());
        let instance = run_with_panic_guard(
            {
                let engine = Arc::clone(&runtime_engine);
                let budget = budget.clone();
                let routing = routing_policy.clone();
                let security = security_policy.clone();
                async move {
                    engine
                        .run_new_workflow(&workflow, None, budget, routing, security)
                        .await
                }
            },
            "thread lifecycle execution",
        )
        .await?;
        let _ =
            thread_session_store.record_instance(&request.thread_id, &thread_branch, &instance)?;
        if request.json {
            println!("{}", serde_json::to_string_pretty(&instance)?);
        } else {
            print_instance_summary(&instance);
        }
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
            "goal planning",
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
                let engine = Arc::clone(&runtime_engine);
                let budget = budget.clone();
                let routing = routing_policy.clone();
                let security = security_policy.clone();
                async move {
                    engine
                        .run_new_workflow(&workflow, None, budget, routing, security)
                        .await
                }
            },
            "goal execution",
        )
        .await?;
        if let Some(s) = session.as_ref() {
            let _ = thread_session_store.record_instance(
                &s.active_thread_id,
                &s.active_branch,
                &instance,
            )?;
        }
        print_instance_summary(&instance);
        return Ok(());
    }

    let (mut workflow, workflow_path) = if let Some(request) = template_request.as_ref() {
        resolve_template_workflow_selection(&project_layout, request)?
    } else {
        resolve_workflow_selection(
            &cli,
            &project_layout,
            &default_domain_name,
            &domains_arc,
            &budget,
            &routing_policy,
            &security_policy,
        )?
    };
    if cli.task.is_some() && cli.template.is_none() {
        return Err(anyhow!(
            "--task requires --template for direct workflow runs"
        ));
    }
    if let Some(template_ref) = cli.template.as_deref() {
        let task = cli
            .task
            .as_deref()
            .ok_or_else(|| anyhow!("--task is required when --template is provided"))?;
        let template_prompt = load_template_prompt(&project_layout, template_ref)?;
        inject_template_prompt(&mut workflow, &template_prompt, task)?;
    }
    let replaced_roles = apply_role_overrides(&mut workflow, &role_overrides);
    if replaced_roles > 0 {
        println!("Applied role overrides to {} step(s).", replaced_roles);
    }
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
            let engine = Arc::clone(&runtime_engine);
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
    if let Some(s) = session.as_ref() {
        let _ = thread_session_store.record_instance(
            &s.active_thread_id,
            &s.active_branch,
            &instance,
        )?;
    }
    print_instance_summary(&instance);

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
    domains.register_skill("agent", Arc::new(AutoResolveConflictsSkill))?;
    domains.register_skill("agent", Arc::new(HasConflictsSkill))?;
    domains.register_skill("agent", Arc::new(ConflictGateSkill))?;
    domains.register_skill(
        "agent",
        Arc::new(EmbedDocumentSkill::new(".agents/memory/vector_index.json")),
    )?;
    domains.register_skill(
        "agent",
        Arc::new(SemanticSearchSkill::new(".agents/memory/vector_index.json")),
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
                    "Workflow id '{}' not found in .agents/workflows",
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

fn resolve_template_workflow_selection(
    project_layout: &AgentProjectLayout,
    request: &TemplateRunRequest,
) -> Result<(crate::workflow::model::Workflow, Option<String>)> {
    let workflow_ref = request
        .workflow_id
        .clone()
        .unwrap_or_else(|| infer_workflow_ref_from_template(&request.template));
    let workflow_path = project_layout
        .resolve_workflow_path(&workflow_ref)
        .ok_or_else(|| {
            anyhow!(
                "Workflow id '{}' not found in .agents/workflows",
                workflow_ref
            )
        })?;
    let workflow_path_str = workflow_path
        .to_str()
        .ok_or_else(|| anyhow!("Invalid workflow path encoding"))?
        .to_string();
    let mut workflow = load_workflow(&workflow_path_str)?;

    let template_prompt = load_template_prompt(project_layout, &request.template)?;
    inject_template_prompt(&mut workflow, &template_prompt, &request.task)?;

    Ok((workflow, Some(workflow_path_str)))
}

fn default_template_for_role(role: &str) -> &'static str {
    match role.trim().to_ascii_lowercase().as_str() {
        "reviewer" => "review_prompt",
        "debugger" | "resolver" => "bugfix_prompt",
        "releaser" => "release_prompt",
        _ => "feature_prompt",
    }
}

fn default_role_for_template_or_workflow(template: &str, workflow_id: &str) -> &'static str {
    let workflow_id = workflow_id.trim().to_ascii_lowercase();
    if workflow_id == "review" {
        return "reviewer";
    }
    if workflow_id == "bugfix" {
        return "debugger";
    }
    if workflow_id == "release" {
        return "releaser";
    }
    match template.trim().to_ascii_lowercase().as_str() {
        "review_prompt" => "reviewer",
        "bugfix_prompt" => "debugger",
        "release_prompt" => "releaser",
        _ => "implementer",
    }
}

fn select_template_and_workflow_for_message(message: &str) -> (String, String) {
    let normalized = message.trim().to_ascii_lowercase();
    let has_any = |keywords: &[&str]| keywords.iter().any(|keyword| normalized.contains(keyword));
    if has_any(&["review", "audit", "finding", "pull request"]) {
        return ("review_prompt".to_string(), "review".to_string());
    }
    if has_any(&["bug", "fix", "error", "panic", "regression", "broken"]) {
        return ("bugfix_prompt".to_string(), "bugfix".to_string());
    }
    if has_any(&["release", "tag", "changelog", "publish"]) {
        return ("release_prompt".to_string(), "release".to_string());
    }
    ("feature_prompt".to_string(), "feature".to_string())
}

fn bind_role_to_workflow_llm_steps(
    workflow: &mut crate::workflow::model::Workflow,
    role: &str,
) -> Result<usize> {
    let role = role.trim();
    if role.is_empty() {
        return Err(anyhow!("role is required"));
    }
    let mut replaced = 0usize;
    for step in &mut workflow.steps {
        if !is_llm_subagent_step(&step.skill) {
            continue;
        }
        step.input = if let Some((_, payload)) = step.input.split_once(":::") {
            format!("{}:::{}", role, payload.trim())
        } else {
            format!("{}:::{}", role, step.input.trim())
        };
        replaced = replaced.saturating_add(1);
    }
    if replaced == 0 {
        return Err(anyhow!(
            "Workflow '{}' has no llm_subagent step to bind role '{}'",
            workflow.meta.name,
            role
        ));
    }
    Ok(replaced)
}

fn resolve_role_workflow_selection(
    project_layout: &AgentProjectLayout,
    request: &RoleRunRequest,
) -> Result<(
    crate::workflow::model::Workflow,
    Option<String>,
    String,
    String,
    String,
)> {
    let role_ref = request.role.trim();
    if role_ref.is_empty() {
        return Err(anyhow!("role is required"));
    }
    let role_exists = load_role_profile_if_exists(role_ref, &project_layout.roles_dir)?;
    if role_exists.is_none() {
        return Err(anyhow!("Role '{}' not found in .agents/roles", role_ref));
    }

    let selected_template = request
        .template
        .clone()
        .unwrap_or_else(|| default_template_for_role(role_ref).to_string());
    let workflow_ref = request
        .workflow_id
        .clone()
        .unwrap_or_else(|| infer_workflow_ref_from_template(&selected_template));
    let workflow_path = project_layout
        .resolve_workflow_path(&workflow_ref)
        .ok_or_else(|| {
            anyhow!(
                "Workflow id '{}' not found in .agents/workflows",
                workflow_ref
            )
        })?;
    let workflow_path_str = workflow_path
        .to_str()
        .ok_or_else(|| anyhow!("Invalid workflow path encoding"))?
        .to_string();
    let mut workflow = load_workflow(&workflow_path_str)?;
    let template_prompt = load_template_prompt(project_layout, &selected_template)?;
    inject_template_prompt(&mut workflow, &template_prompt, &request.task)?;
    let bound_steps = bind_role_to_workflow_llm_steps(&mut workflow, role_ref)?;
    if bound_steps == 0 {
        return Err(anyhow!(
            "No llm_subagent steps bound for role '{}'",
            role_ref
        ));
    }
    Ok((
        workflow,
        Some(workflow_path_str),
        selected_template,
        workflow_ref,
        role_ref.to_string(),
    ))
}

fn instance_summary(instance: &WorkflowInstance) -> ThreadRunSummary {
    ThreadRunSummary {
        instance_id: instance.instance_id.clone(),
        workflow_name: instance.workflow_name.clone(),
        status: format!("{:?}", instance.status),
        trace_id: instance.trace_id.clone(),
    }
}

fn load_template_prompt(project_layout: &AgentProjectLayout, template_ref: &str) -> Result<String> {
    let template_path = project_layout
        .resolve_template_path(template_ref)
        .ok_or_else(|| anyhow!("Template '{}' not found in .agents/templates", template_ref))?;
    Ok(fs::read_to_string(template_path)?)
}

fn resolve_thread_branch_name(
    project_layout: &AgentProjectLayout,
    thread_id: &str,
) -> Result<String> {
    let normalized_thread = thread_id.trim();
    if normalized_thread.is_empty() {
        return Err(anyhow!("thread_id is required"));
    }
    let branch_rules = project_layout.load_branching_rules()?;
    let prefix = branch_rules
        .prefix
        .as_deref()
        .unwrap_or("thread/")
        .to_string();
    Ok(
        crate::engine::git::GitBranchOrchestrator::branch_for_thread_with_prefix(
            normalized_thread,
            &prefix,
        ),
    )
}

fn ensure_thread_execution_context(
    project_root: &str,
    project_layout: &AgentProjectLayout,
    thread_session_store: &ThreadSessionStore,
    thread_id: &str,
    skip_branch_orchestration: bool,
) -> Result<(String, String)> {
    let normalized_thread = thread_id.trim();
    if normalized_thread.is_empty() {
        return Err(anyhow!("thread_id is required"));
    }
    let thread_branch = resolve_thread_branch_name(project_layout, normalized_thread)?;
    if !skip_branch_orchestration {
        let session = AgentSession::new(
            project_root,
            normalized_thread,
            project_layout,
            LlmAdapter::default(),
        )?;
        session.ensure_thread_branch()?;
        println!("{}", session.summary_line());
    }
    let _ = thread_session_store.ensure_thread(normalized_thread, &thread_branch)?;
    Ok((normalized_thread.to_string(), thread_branch))
}

fn build_thread_flow_workflow(
    project_layout: &AgentProjectLayout,
    request: &ThreadFlowRequest,
) -> Result<crate::workflow::model::Workflow> {
    let thread_id = request.thread_id.trim();
    if thread_id.is_empty() {
        return Err(anyhow!("thread_id is required"));
    }
    let target_branch = request.target_branch.trim();
    validate_git_ref_like("target_branch", target_branch)?;
    let validate_command = request.validate_command.trim();
    if validate_command.is_empty() {
        return Err(anyhow!("validate_command must not be empty"));
    }

    let thread_branch = resolve_thread_branch_name(project_layout, thread_id)?;
    validate_git_ref_like("thread_branch", &thread_branch)?;
    let merge_rules = project_layout.load_merge_rules()?;
    let auto_resolution_enabled = merge_rules.auto_conflict_resolution_assist.unwrap_or(true);
    let auto_resolution_strategy =
        normalize_auto_conflict_strategy(merge_rules.auto_conflict_resolution_strategy.as_deref());
    let auto_resolution_max_attempts = merge_rules
        .auto_conflict_resolution_max_attempts
        .unwrap_or(2)
        .clamp(1, 5);

    let mut steps = vec![
        crate::workflow::model::WorkflowStep::new(
            "ensure_thread_branch",
            "agent.ensure_branch",
            thread_id,
        ),
        crate::workflow::model::WorkflowStep {
            id: "validate_feature_branch".to_string(),
            skill: "agent.run_script".to_string(),
            input: validate_command.to_string(),
            depends_on: vec!["ensure_thread_branch".to_string()],
            condition: None,
            retry: Some(1),
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "checkout_target_branch".to_string(),
            skill: "agent.run_script".to_string(),
            input: format!("git checkout {}", target_branch),
            depends_on: vec!["validate_feature_branch".to_string()],
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "merge_thread_branch".to_string(),
            skill: "agent.git_merge_branch".to_string(),
            input: thread_branch.clone(),
            depends_on: vec!["checkout_target_branch".to_string()],
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "analyze_conflicts".to_string(),
            skill: "agent.analyze_conflicts".to_string(),
            input: "scan".to_string(),
            depends_on: vec!["merge_thread_branch".to_string()],
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "has_conflicts".to_string(),
            skill: "agent.has_conflicts".to_string(),
            input: "{{analyze_conflicts}}".to_string(),
            depends_on: vec!["analyze_conflicts".to_string()],
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
    ];

    if auto_resolution_enabled {
        steps.push(crate::workflow::model::WorkflowStep {
            id: "auto_resolve_conflicts".to_string(),
            skill: "agent.auto_resolve_conflicts".to_string(),
            input: format!(
                r#"{{"strategy":"{}","max_attempts":{},"analysis":{{{{analyze_conflicts}}}}}}"#,
                auto_resolution_strategy, auto_resolution_max_attempts
            ),
            depends_on: vec!["has_conflicts".to_string()],
            condition: Some("{{has_conflicts}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::Continue,
        });
        steps.push(crate::workflow::model::WorkflowStep {
            id: "recheck_conflicts".to_string(),
            skill: "agent.analyze_conflicts".to_string(),
            input: "scan".to_string(),
            depends_on: vec!["auto_resolve_conflicts".to_string()],
            condition: Some("{{has_conflicts}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        });
        steps.push(crate::workflow::model::WorkflowStep {
            id: "has_conflicts_after_auto_resolve".to_string(),
            skill: "agent.has_conflicts".to_string(),
            input: "{{recheck_conflicts}}".to_string(),
            depends_on: vec!["recheck_conflicts".to_string()],
            condition: Some("{{has_conflicts}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        });
    } else {
        steps.push(crate::workflow::model::WorkflowStep {
            id: "has_conflicts_after_auto_resolve".to_string(),
            skill: "agent.has_conflicts".to_string(),
            input: "{{has_conflicts}}".to_string(),
            depends_on: vec!["has_conflicts".to_string()],
            condition: Some("{{has_conflicts}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        });
    }

    steps.extend(vec![
        crate::workflow::model::WorkflowStep {
            id: "resolve_conflicts".to_string(),
            skill: "agent.llm_subagent".to_string(),
            input: format!(
                "resolver:::Automatic conflict resolution did not fully resolve merge conflicts for '{}' -> '{}'. Provide deterministic manual resolution steps from this report:\n{{{{analyze_conflicts}}}}",
                thread_branch, target_branch
            ),
            depends_on: vec!["has_conflicts_after_auto_resolve".to_string()],
            condition: Some("{{has_conflicts_after_auto_resolve}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "conflict_gate".to_string(),
            skill: "agent.conflict_gate".to_string(),
            input: "{{has_conflicts_after_auto_resolve}}".to_string(),
            depends_on: vec!["resolve_conflicts".to_string()],
            condition: Some("{{has_conflicts}} == true".to_string()),
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "post_merge_validation".to_string(),
            skill: "agent.run_script".to_string(),
            input: validate_command.to_string(),
            depends_on: vec!["conflict_gate".to_string()],
            condition: None,
            retry: Some(1),
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
        crate::workflow::model::WorkflowStep {
            id: "finalize_thread_flow".to_string(),
            skill: "demo.echo".to_string(),
            input: format!(
                "Thread flow finalized: thread='{}' merged_into='{}' branch='{}'",
                thread_id, target_branch, thread_branch
            ),
            depends_on: vec!["post_merge_validation".to_string()],
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        },
    ]);

    Ok(crate::workflow::model::Workflow {
        meta: crate::workflow::model::WorkflowMeta {
            name: format!(
                "thread-flow-{}",
                thread_id
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
                    .join("-")
            ),
            domain: Some("agent".to_string()),
            goal: Some(format!("thread_flow:{}->{}", thread_branch, target_branch)),
            target_type: Some("thread_flow".to_string()),
            routing_policy: None,
            security_policy: None,
            resource_budget: None,
            projected_cost: None,
            projected_latency_ms: None,
            projected_steps: Some(steps.len()),
        },
        steps,
    })
}

fn validate_git_ref_like(field_name: &str, value: &str) -> Result<()> {
    if value.is_empty() {
        return Err(anyhow!("{} must not be empty", field_name));
    }
    if value.contains("..")
        || value.contains("\\")
        || value.contains(' ')
        || value.starts_with('-')
        || value.ends_with('/')
    {
        return Err(anyhow!(
            "Invalid {} '{}': unsupported git ref characters",
            field_name,
            value
        ));
    }
    if !value
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '.' | '_' | '-' | '/'))
    {
        return Err(anyhow!(
            "Invalid {} '{}': only [A-Za-z0-9._/-] allowed",
            field_name,
            value
        ));
    }
    Ok(())
}

fn normalize_auto_conflict_strategy(value: Option<&str>) -> &'static str {
    match value
        .unwrap_or_default()
        .trim()
        .to_ascii_lowercase()
        .as_str()
    {
        "theirs" => "theirs",
        _ => "ours",
    }
}

fn infer_workflow_ref_from_template(template_ref: &str) -> String {
    let stem = Path::new(template_ref)
        .file_stem()
        .and_then(|v| v.to_str())
        .unwrap_or(template_ref)
        .trim()
        .to_string();
    for suffix in ["_prompt", "-prompt"] {
        if let Some(base) = stem.strip_suffix(suffix) {
            if !base.trim().is_empty() {
                return base.trim().to_string();
            }
        }
    }
    stem
}

fn inject_template_prompt(
    workflow: &mut crate::workflow::model::Workflow,
    template_prompt: &str,
    task: &str,
) -> Result<()> {
    let template_prompt = template_prompt.trim();
    if template_prompt.is_empty() {
        return Err(anyhow!("Template prompt is empty"));
    }
    let task = task.trim();
    if task.is_empty() {
        return Err(anyhow!("Template task is required"));
    }

    let workflow_name = workflow.meta.name.clone();
    let step = workflow
        .steps
        .iter_mut()
        .find(|step| is_llm_subagent_step(&step.skill))
        .ok_or_else(|| {
            anyhow!(
                "Workflow '{}' has no llm_subagent step to inject template context",
                workflow_name
            )
        })?;
    let merged = merge_template_input(&step.input, template_prompt, task);
    step.input = merged;
    Ok(())
}

fn is_llm_subagent_step(skill_ref: &str) -> bool {
    let normalized = skill_ref.trim().to_ascii_lowercase();
    normalized == "llm_subagent" || normalized.ends_with(".llm_subagent")
}

fn merge_template_input(existing_input: &str, template_prompt: &str, task: &str) -> String {
    let template_section = format!("Template Prompt:\n{}\n\nTask:\n{}", template_prompt, task);
    let existing = existing_input.trim();
    if existing.is_empty() {
        return template_section;
    }

    if let Some((role, prompt)) = existing.split_once(":::") {
        let role = role.trim();
        let prompt = prompt.trim();
        if prompt.is_empty() {
            return format!("{}:::{}", role, template_section);
        }
        return format!("{}:::{}\n\n{}", role, prompt, template_section);
    }

    format!("{}\n\n{}", existing, template_section)
}

fn parse_role_override_map(value: Option<&str>) -> Result<HashMap<String, String>> {
    let mut map = HashMap::new();
    let Some(raw) = value else {
        return Ok(map);
    };
    for item in raw.split(',').map(|v| v.trim()).filter(|v| !v.is_empty()) {
        let (source, target) = item
            .split_once('=')
            .ok_or_else(|| anyhow!("Invalid --role-override entry '{}'", item))?;
        let source = source.trim().to_ascii_lowercase();
        let target = target.trim().to_string();
        if source.is_empty() || target.is_empty() {
            return Err(anyhow!(
                "Invalid --role-override entry '{}': source and target must be non-empty",
                item
            ));
        }
        map.insert(source, target);
    }
    Ok(map)
}

fn apply_role_overrides(
    workflow: &mut crate::workflow::model::Workflow,
    role_overrides: &HashMap<String, String>,
) -> usize {
    if role_overrides.is_empty() {
        return 0;
    }
    let mut replaced = 0usize;
    for step in &mut workflow.steps {
        if !is_llm_subagent_step(&step.skill) {
            continue;
        }
        if let Some(next_input) = apply_role_override_to_input(&step.input, role_overrides) {
            step.input = next_input;
            replaced = replaced.saturating_add(1);
        }
    }
    replaced
}

fn apply_role_override_to_input(
    step_input: &str,
    role_overrides: &HashMap<String, String>,
) -> Option<String> {
    let (role, rest) = step_input.split_once(":::")?;
    let source = role.trim().to_ascii_lowercase();
    let target = role_overrides.get(&source)?;
    Some(format!("{}:::{}", target, rest))
}

fn handle_workflow_control_command(
    state_store: &WorkflowStateStore,
    thread_session_store: &ThreadSessionStore,
    project_layout: &AgentProjectLayout,
    command: Commands,
) -> Result<WorkflowLaunchAction> {
    let Commands::Workflow { action } = command;
    match action {
        WorkflowCommand::List => {
            let instances = state_store.list_instances()?;
            if instances.is_empty() {
                println!("No workflow instances found.");
                return Ok(WorkflowLaunchAction::Noop);
            }
            println!("Workflow Instances:");
            for item in instances {
                println!(
                    "- {} status={:?} workflow={} updated_at={}",
                    item.instance_id, item.status, item.workflow_name, item.updated_at_ms
                );
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Status { id } => {
            if let Some(instance_id) = id {
                let instance = state_store.load(&instance_id)?;
                print_instance_summary(&instance);
                return Ok(WorkflowLaunchAction::Noop);
            }
            let instances = state_store.list_instances()?;
            if instances.is_empty() {
                println!("No workflow instances found.");
                return Ok(WorkflowLaunchAction::Noop);
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
            Ok(WorkflowLaunchAction::Noop)
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
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Trace { id, json, timeline } => {
            let instance = state_store.load(&id)?;
            if json || !timeline {
                let body = serde_json::to_string_pretty(&instance)?;
                println!("{}", body);
            }
            if timeline {
                println!("{}", render_timeline(&instance));
            }
            Ok(WorkflowLaunchAction::Noop)
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
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::IndexGraph { max_files, json } => {
            let report = build_graph_index(project_layout, max_files)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Graph index rebuilt: path={} nodes={} edges={} context_db={} vector_table={} graph_table={} vector_entries={} graph_entries={}",
                    report.index_path,
                    report.nodes,
                    report.edges,
                    report.context_db_path,
                    report.context_vector_table,
                    report.context_graph_table,
                    report.vector_entries,
                    report.graph_entries
                );
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Doctor {
            json,
            strict_ollama,
        } => {
            let report = run_workflow_doctor(
                project_layout,
                resolve_bootstrap_strict_ollama(strict_ollama),
            )?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                print_doctor_report(&report);
            }
            if !report.ok {
                return Err(anyhow!(
                    "workflow doctor failed with {} error check(s)",
                    doctor_error_count(&report)
                ));
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Setup {
            json,
            strict_ollama,
        } => {
            let created = ensure_bootstrap_package(project_layout)?;
            let report = run_workflow_doctor(
                project_layout,
                resolve_bootstrap_strict_ollama(strict_ollama),
            )?;
            if json {
                let payload = SetupReport {
                    created_files: created
                        .iter()
                        .map(|path| path.display().to_string())
                        .collect(),
                    doctor: report.clone(),
                };
                println!("{}", serde_json::to_string_pretty(&payload)?);
            } else {
                if created.is_empty() {
                    println!("Setup: package skeleton already present (no files created).");
                } else {
                    println!("Setup: created {} file(s):", created.len());
                    for path in &created {
                        println!("- {}", path.display());
                    }
                }
                print_doctor_report(&report);
            }
            if !report.ok {
                return Err(anyhow!(
                    "workflow setup failed with {} error check(s)",
                    doctor_error_count(&report)
                ));
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Resume { id } => Ok(WorkflowLaunchAction::Resume { id }),
        WorkflowCommand::StartTemplate {
            template,
            workflow_id,
            task,
        } => Ok(WorkflowLaunchAction::StartTemplate(TemplateRunRequest {
            template,
            workflow_id,
            task,
        })),
        WorkflowCommand::StartRole {
            role,
            task,
            workflow_id,
            template,
            thread_id,
            json,
        } => Ok(WorkflowLaunchAction::StartRole(RoleRunRequest {
            role,
            task,
            workflow_id,
            template,
            thread_id,
            json,
        })),
        WorkflowCommand::ChatThread {
            thread_id,
            message,
            role,
            workflow_id,
            template,
            target_branch,
            validate_command,
            no_merge,
            json,
        } => Ok(WorkflowLaunchAction::ChatThread(ChatThreadRequest {
            thread_id,
            message,
            role,
            workflow_id,
            template,
            target_branch,
            validate_command,
            no_merge,
            json,
        })),
        WorkflowCommand::Roles { json } => {
            print_markdown_resource_listing("Role Profiles", &project_layout.roles_dir, json)?;
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Templates { json } => {
            print_markdown_resource_listing("Templates", &project_layout.templates_dir, json)?;
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::ThreadFlow {
            thread_id,
            target_branch,
            validate_command,
            json,
        } => Ok(WorkflowLaunchAction::ThreadFlow(ThreadFlowRequest {
            thread_id,
            target_branch,
            validate_command,
            json,
        })),
        WorkflowCommand::Scaffold {
            kind,
            name,
            overwrite,
        } => {
            let path = scaffold_markdown_package(project_layout, &kind, &name, overwrite)?;
            let parsed_kind = parse_package_scaffold_kind(&kind)?;
            println!(
                "Scaffold created: {} (schema={})",
                path.display(),
                parsed_kind.expected_schema()
            );
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Threads { thread_id, json } => {
            if let Some(thread_id) = thread_id {
                let record = thread_session_store.get_thread(&thread_id)?;
                if json {
                    println!("{}", serde_json::to_string_pretty(&record)?);
                } else if let Some(record) = record {
                    println!(
                        "thread='{}' branch='{}' lifecycle={:?} last_instance={:?} last_status={:?} runs={} events={} updated_at={}",
                        record.thread_id,
                        record.branch,
                        record.lifecycle_state,
                        record.last_workflow_instance_id,
                        record.last_workflow_status,
                        record.run_count,
                        record.history.len(),
                        record.updated_at_ms
                    );
                } else {
                    println!("No thread session found for '{}'.", thread_id);
                }
                return Ok(WorkflowLaunchAction::Noop);
            }

            let records = thread_session_store.list_threads()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&records)?);
                return Ok(WorkflowLaunchAction::Noop);
            }
            if records.is_empty() {
                println!("No thread sessions found.");
                return Ok(WorkflowLaunchAction::Noop);
            }
            println!("Thread Sessions:");
            for record in records {
                println!(
                    "- thread='{}' branch='{}' lifecycle={:?} last_instance={:?} last_status={:?} runs={} events={} updated_at={}",
                    record.thread_id,
                    record.branch,
                    record.lifecycle_state,
                    record.last_workflow_instance_id,
                    record.last_workflow_status,
                    record.run_count,
                    record.history.len(),
                    record.updated_at_ms
                );
            }
            Ok(WorkflowLaunchAction::Noop)
        }
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
    let mut checks = Vec::new();

    for command in ["git", "rustc", "cargo"] {
        if is_command_available(command) {
            checks.push(DoctorCheckResult {
                name: format!("command:{}", command),
                status: DoctorCheckStatus::Ok,
                message: "found on PATH".to_string(),
            });
        } else {
            checks.push(DoctorCheckResult {
                name: format!("command:{}", command),
                status: DoctorCheckStatus::Error,
                message: "missing on PATH".to_string(),
            });
        }
    }

    if is_command_available("ollama") {
        match ProcessCommand::new("ollama").arg("list").output() {
            Ok(output) if output.status.success() => checks.push(DoctorCheckResult {
                name: "ollama".to_string(),
                status: DoctorCheckStatus::Ok,
                message: "CLI detected and daemon reachable".to_string(),
            }),
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let detail = stderr
                    .lines()
                    .next()
                    .map(str::trim)
                    .filter(|line| !line.is_empty())
                    .unwrap_or("daemon unreachable");
                checks.push(DoctorCheckResult {
                    name: "ollama".to_string(),
                    status: if strict_ollama {
                        DoctorCheckStatus::Error
                    } else {
                        DoctorCheckStatus::Warning
                    },
                    message: format!("CLI detected but not ready: {}", detail),
                });
            }
            Err(err) => checks.push(DoctorCheckResult {
                name: "ollama".to_string(),
                status: if strict_ollama {
                    DoctorCheckStatus::Error
                } else {
                    DoctorCheckStatus::Warning
                },
                message: format!("CLI detected but failed health command: {}", err),
            }),
        }
    } else {
        checks.push(DoctorCheckResult {
            name: "ollama".to_string(),
            status: if strict_ollama {
                DoctorCheckStatus::Error
            } else {
                DoctorCheckStatus::Warning
            },
            message: if strict_ollama {
                "missing on PATH and strict mode enabled".to_string()
            } else {
                "missing on PATH (allowed when using OpenAI/Gemini providers)".to_string()
            },
        });
    }

    let cargo_toml = Path::new(&layout.project_root).join("Cargo.toml");
    if cargo_toml.exists() {
        checks.push(DoctorCheckResult {
            name: "cargo_toml".to_string(),
            status: DoctorCheckStatus::Ok,
            message: format!("found at {}", cargo_toml.display()),
        });
    } else {
        checks.push(DoctorCheckResult {
            name: "cargo_toml".to_string(),
            status: DoctorCheckStatus::Error,
            message: format!("missing at {}", cargo_toml.display()),
        });
    }

    if layout.agents_root.exists() {
        checks.push(DoctorCheckResult {
            name: "agents_root".to_string(),
            status: DoctorCheckStatus::Ok,
            message: format!("found at {}", layout.agents_root.display()),
        });
    } else {
        checks.push(DoctorCheckResult {
            name: "agents_root".to_string(),
            status: DoctorCheckStatus::Error,
            message: format!("missing at {}", layout.agents_root.display()),
        });
    }

    for (name, dir) in [
        ("workflows", &layout.workflows_dir),
        ("skills", &layout.skills_dir),
        ("roles", &layout.roles_dir),
        ("rules", &layout.rules_dir),
        ("templates", &layout.templates_dir),
        ("memory", &layout.memory_dir),
    ] {
        if dir.exists() {
            checks.push(DoctorCheckResult {
                name: format!("dir:{}", name),
                status: DoctorCheckStatus::Ok,
                message: format!("present ({})", dir.display()),
            });
        } else {
            checks.push(DoctorCheckResult {
                name: format!("dir:{}", name),
                status: DoctorCheckStatus::Error,
                message: format!("missing ({})", dir.display()),
            });
        }
    }

    for (name, file) in [
        (
            "memory_vector_index",
            layout.memory_dir.join("vector_index.json"),
        ),
        (
            "memory_graph_index",
            layout.memory_dir.join("graph_index.json"),
        ),
    ] {
        if file.exists() {
            checks.push(DoctorCheckResult {
                name: name.to_string(),
                status: DoctorCheckStatus::Ok,
                message: format!("present ({})", file.display()),
            });
        } else {
            checks.push(DoctorCheckResult {
                name: name.to_string(),
                status: DoctorCheckStatus::Warning,
                message: format!(
                    "missing ({}). Run 'cargo run -- workflow setup' to bootstrap.",
                    file.display()
                ),
            });
        }
    }

    let yaml_files = collect_yaml_package_files(layout)?;
    if yaml_files.is_empty() {
        checks.push(DoctorCheckResult {
            name: "markdown_only_package".to_string(),
            status: DoctorCheckStatus::Ok,
            message: "no YAML files under workflows/skills/roles/rules/templates".to_string(),
        });
    } else {
        let sample = yaml_files
            .iter()
            .take(5)
            .map(|path| path.display().to_string())
            .collect::<Vec<_>>()
            .join(", ");
        let suffix = if yaml_files.len() > 5 {
            format!(" (and {} more)", yaml_files.len() - 5)
        } else {
            String::new()
        };
        checks.push(DoctorCheckResult {
            name: "markdown_only_package".to_string(),
            status: DoctorCheckStatus::Error,
            message: format!("found YAML files: {}{}", sample, suffix),
        });
    }

    let workflow_markdown_count = count_markdown_files_recursive(&layout.workflows_dir)?;
    if workflow_markdown_count > 0 {
        checks.push(DoctorCheckResult {
            name: "workflow_markdown_files".to_string(),
            status: DoctorCheckStatus::Ok,
            message: format!(
                "found {} workflow markdown file(s)",
                workflow_markdown_count
            ),
        });
    } else {
        checks.push(DoctorCheckResult {
            name: "workflow_markdown_files".to_string(),
            status: DoctorCheckStatus::Error,
            message: "no workflow markdown files found under .agents/workflows".to_string(),
        });
    }

    let package_check = crate::engine::package_check::run_package_check(layout)?;
    let package_status = if package_check.errors.is_empty() {
        if package_check.warnings.is_empty() {
            DoctorCheckStatus::Ok
        } else {
            DoctorCheckStatus::Warning
        }
    } else {
        DoctorCheckStatus::Error
    };
    checks.push(DoctorCheckResult {
        name: "workflow_check".to_string(),
        status: package_status,
        message: format!(
            "checked={} errors={} warnings={}",
            package_check.checked_files,
            package_check.errors.len(),
            package_check.warnings.len()
        ),
    });

    let ok = checks
        .iter()
        .all(|entry| !matches!(entry.status, DoctorCheckStatus::Error));

    Ok(DoctorReport {
        ok,
        strict_ollama,
        checks,
        package_check,
    })
}

fn ensure_bootstrap_package(layout: &AgentProjectLayout) -> Result<Vec<std::path::PathBuf>> {
    layout.ensure_layout()?;
    let mut created = Vec::new();

    for (file_name, title) in [
        ("runtime.md", "Runtime Rules"),
        ("branching_rules.md", "Branching Rules"),
        ("coding_rules.md", "Coding Rules"),
        ("merge_rules.md", "Merge Rules"),
    ] {
        let path = layout.rules_dir.join(file_name);
        let body = format!(
            "---\ndescription: {} default policy\ntrigger: always_on\n---\n# {}\nSchema: antigrav.rule@v1\n```json\n{{}}\n```\n",
            title, title
        );
        write_file_if_missing(&path, &body, &mut created)?;
    }

    if count_markdown_files_recursive(&layout.workflows_dir)? == 0 {
        let starter = layout.workflows_dir.join("starter.md");
        let body = "---\ndescription: starter workflow\n---\n# Workflow: starter\nSchema: antigrav.workflow@v1\nDomain: demo\n\n## Step: hello\nSkill: demo.echo\nInput: starter workflow ready\n";
        write_file_if_missing(&starter, body, &mut created)?;
    }

    let vector_index = layout.memory_dir.join("vector_index.json");
    write_file_if_missing(&vector_index, "[]\n", &mut created)?;

    let graph_index = layout.memory_dir.join("graph_index.json");
    write_file_if_missing(&graph_index, "{\n  \"nodes\": []\n}\n", &mut created)?;

    Ok(created)
}

fn write_file_if_missing(
    path: &Path,
    body: &str,
    created: &mut Vec<std::path::PathBuf>,
) -> Result<()> {
    if path.exists() {
        return Ok(());
    }
    fs::write(path, body)?;
    created.push(path.to_path_buf());
    Ok(())
}

fn is_command_available(command: &str) -> bool {
    ProcessCommand::new(command)
        .arg("--version")
        .output()
        .is_ok()
}

fn count_markdown_files_recursive(root: &Path) -> Result<usize> {
    let mut count = 0usize;
    walk_directory_files(root, &mut |path| {
        let is_markdown = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("md"))
            .unwrap_or(false);
        if is_markdown {
            count = count.saturating_add(1);
        }
    })?;
    Ok(count)
}

fn collect_yaml_package_files(layout: &AgentProjectLayout) -> Result<Vec<std::path::PathBuf>> {
    let mut yaml_files = Vec::new();
    for dir in [
        &layout.workflows_dir,
        &layout.skills_dir,
        &layout.roles_dir,
        &layout.rules_dir,
        &layout.templates_dir,
    ] {
        walk_directory_files(dir, &mut |path| {
            let is_yaml = path
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext.eq_ignore_ascii_case("yaml") || ext.eq_ignore_ascii_case("yml"))
                .unwrap_or(false);
            if is_yaml {
                yaml_files.push(path.to_path_buf());
            }
        })?;
    }
    yaml_files.sort();
    Ok(yaml_files)
}

fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
    if !root.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            walk_directory_files(&path, visit)?;
            continue;
        }
        if path.is_file() {
            visit(&path);
        }
    }
    Ok(())
}

const DEFAULT_CONTEXT_DB_PATH: &str = ".agents/memory/context.db";
const DEFAULT_CONTEXT_VECTOR_TABLE: &str = "vector_entries";
const DEFAULT_CONTEXT_GRAPH_TABLE: &str = "graph_nodes";
const CONTEXT_VECTOR_DIM: usize = 32;

fn build_graph_index(
    layout: &AgentProjectLayout,
    max_files: usize,
) -> Result<GraphIndexBuildReport> {
    let capped_max_files = max_files.clamp(1, 2_000);
    let project_root = Path::new(&layout.project_root);
    let files = collect_graph_source_files(project_root, capped_max_files)?;

    let mut stem_to_ids = HashMap::<String, Vec<String>>::new();
    let mut file_ids = Vec::new();
    for path in &files {
        let id = relative_unix_path(project_root, path)?;
        file_ids.push((path.clone(), id.clone()));
        if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
            let normalized = stem.trim().to_ascii_lowercase();
            if !normalized.is_empty() {
                stem_to_ids.entry(normalized).or_default().push(id);
            }
        }
    }

    let mut nodes = Vec::<GraphIndexNodeDoc>::new();
    for (path, id) in file_ids {
        let text = match std::fs::read_to_string(&path) {
            Ok(body) => body,
            Err(_) => continue,
        };
        let snippet = summarize_graph_text(&text, 480);
        if snippet.is_empty() {
            continue;
        }

        let mut links = HashSet::<String>::new();
        for token in extract_graph_tokens(&text) {
            if let Some(candidates) = stem_to_ids.get(&token) {
                for candidate in candidates {
                    if candidate != &id {
                        links.insert(candidate.clone());
                    }
                }
            }
        }
        let mut links = links.into_iter().collect::<Vec<_>>();
        links.sort();
        if links.len() > 24 {
            links.truncate(24);
        }

        let mut tags = Vec::<String>::new();
        if let Some(ext) = path.extension().and_then(|v| v.to_str()) {
            tags.push(format!("ext:{}", ext.to_ascii_lowercase()));
        }
        if let Some(first) = id.split('/').next() {
            if !first.is_empty() {
                tags.push(format!("dir:{}", first));
            }
        }
        tags.sort();
        tags.dedup();

        nodes.push(GraphIndexNodeDoc {
            id,
            text: snippet,
            tags,
            links,
        });
    }
    nodes.sort_by(|a, b| a.id.cmp(&b.id));
    let edge_count = nodes.iter().map(|node| node.links.len()).sum::<usize>();
    let payload = GraphIndexPayloadDoc { nodes };
    let index_path = layout.memory_dir.join("graph_index.json");
    std::fs::create_dir_all(&layout.memory_dir)?;
    std::fs::write(&index_path, serde_json::to_string_pretty(&payload)?)?;
    let sqlite_report = write_context_sqlite(layout, &payload)?;

    Ok(GraphIndexBuildReport {
        index_path: index_path.display().to_string(),
        nodes: payload.nodes.len(),
        edges: edge_count,
        context_db_path: sqlite_report.db_path,
        context_vector_table: sqlite_report.vector_table,
        context_graph_table: sqlite_report.graph_table,
        vector_entries: sqlite_report.vector_entries,
        graph_entries: sqlite_report.graph_entries,
    })
}

fn resolve_context_db_path(layout: &AgentProjectLayout) -> PathBuf {
    if let Ok(raw) = std::env::var("ANTIGRAV_CONTEXT_DB_PATH") {
        let trimmed = raw.trim();
        if !trimmed.is_empty() {
            let parsed = PathBuf::from(trimmed);
            if parsed.is_absolute() {
                return parsed;
            }
            return Path::new(&layout.project_root).join(parsed);
        }
    }
    Path::new(&layout.project_root).join(DEFAULT_CONTEXT_DB_PATH)
}

fn normalize_sqlite_identifier(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }
    if trimmed
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '_')
    {
        return Some(trimmed.to_string());
    }
    None
}

fn tokenize_for_context(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(|part| part.to_ascii_lowercase())
        .collect()
}

fn embed_for_context(text: &str) -> Vec<f32> {
    let mut vec = vec![0.0_f32; CONTEXT_VECTOR_DIM];
    for token in tokenize_for_context(text) {
        let mut hash = 1469598103934665603_u64;
        for byte in token.bytes() {
            hash ^= u64::from(byte);
            hash = hash.wrapping_mul(1099511628211_u64);
        }
        let idx = (hash as usize) % CONTEXT_VECTOR_DIM;
        vec[idx] += 1.0;
    }
    let norm = vec.iter().map(|v| v * v).sum::<f32>().sqrt();
    if norm > 0.0 {
        for v in &mut vec {
            *v /= norm;
        }
    }
    vec
}

fn write_context_sqlite(
    layout: &AgentProjectLayout,
    payload: &GraphIndexPayloadDoc,
) -> Result<ContextSqliteWriteReport> {
    let db_path = resolve_context_db_path(layout);
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let vector_table = normalize_sqlite_identifier(
        &std::env::var("ANTIGRAV_CONTEXT_VECTOR_TABLE")
            .ok()
            .unwrap_or_else(|| DEFAULT_CONTEXT_VECTOR_TABLE.to_string()),
    )
    .ok_or_else(|| anyhow!("Invalid sqlite vector table name"))?;
    let graph_table = normalize_sqlite_identifier(
        &std::env::var("ANTIGRAV_CONTEXT_GRAPH_TABLE")
            .ok()
            .unwrap_or_else(|| DEFAULT_CONTEXT_GRAPH_TABLE.to_string()),
    )
    .ok_or_else(|| anyhow!("Invalid sqlite graph table name"))?;

    let conn = rusqlite::Connection::open(&db_path)?;
    let create_vector_sql = format!(
        "CREATE TABLE IF NOT EXISTS {vector_table} (id TEXT PRIMARY KEY, text TEXT NOT NULL, embedding_json TEXT NOT NULL)"
    );
    conn.execute(&create_vector_sql, [])?;
    let create_graph_sql = format!(
        "CREATE TABLE IF NOT EXISTS {graph_table} (id TEXT PRIMARY KEY, text TEXT NOT NULL, tags_json TEXT, links_json TEXT)"
    );
    conn.execute(&create_graph_sql, [])?;

    let tx = conn.unchecked_transaction()?;
    tx.execute(&format!("DELETE FROM {vector_table}"), [])?;
    tx.execute(&format!("DELETE FROM {graph_table}"), [])?;

    let insert_graph_sql = format!(
        "INSERT INTO {graph_table} (id, text, tags_json, links_json) VALUES (?1, ?2, ?3, ?4)"
    );
    let insert_vector_sql =
        format!("INSERT INTO {vector_table} (id, text, embedding_json) VALUES (?1, ?2, ?3)");

    for node in &payload.nodes {
        let tags_json = serde_json::to_string(&node.tags)?;
        let links_json = serde_json::to_string(&node.links)?;
        tx.execute(
            &insert_graph_sql,
            params![node.id, node.text, tags_json, links_json],
        )?;

        let embedding_json = serde_json::to_string(&embed_for_context(&node.text))?;
        tx.execute(
            &insert_vector_sql,
            params![node.id, node.text, embedding_json],
        )?;
    }

    tx.commit()?;

    Ok(ContextSqliteWriteReport {
        db_path: db_path.display().to_string(),
        vector_table,
        graph_table,
        vector_entries: payload.nodes.len(),
        graph_entries: payload.nodes.len(),
    })
}

fn collect_graph_source_files(
    project_root: &Path,
    max_files: usize,
) -> Result<Vec<std::path::PathBuf>> {
    let mut files = Vec::new();
    walk_directory_files(project_root, &mut |path| {
        if !is_graph_candidate_file(path) {
            return;
        }
        if let Ok(rel) = path.strip_prefix(project_root) {
            let rel = rel.to_string_lossy();
            if rel.starts_with(".git/")
                || rel.starts_with("target/")
                || rel.starts_with(".agents/state/")
                || rel.starts_with("node_modules/")
            {
                return;
            }
        }
        if let Ok(meta) = std::fs::metadata(path) {
            if meta.len() > 512 * 1024 {
                return;
            }
        }
        files.push(path.to_path_buf());
    })?;
    files.sort();
    if files.len() > max_files {
        files.truncate(max_files);
    }
    Ok(files)
}

fn is_graph_candidate_file(path: &Path) -> bool {
    if !path.is_file() {
        return false;
    }
    let Some(ext) = path.extension().and_then(|v| v.to_str()) else {
        return false;
    };
    matches!(
        ext.to_ascii_lowercase().as_str(),
        "rs" | "md" | "toml" | "json" | "txt" | "sh" | "js" | "ts" | "tsx" | "py" | "go"
    )
}

fn extract_graph_tokens(text: &str) -> Vec<String> {
    text.split(|ch: char| !(ch.is_ascii_alphanumeric() || ch == '_'))
        .map(|token| token.trim().to_ascii_lowercase())
        .filter(|token| token.len() >= 2)
        .collect()
}

fn summarize_graph_text(text: &str, max_chars: usize) -> String {
    let compact = text.split_whitespace().collect::<Vec<_>>().join(" ");
    if compact.chars().count() <= max_chars {
        return compact;
    }
    compact.chars().take(max_chars).collect::<String>()
}

fn relative_unix_path(project_root: &Path, path: &Path) -> Result<String> {
    let relative = path
        .strip_prefix(project_root)
        .map_err(|_| anyhow!("path '{}' is outside project root", path.display()))?;
    Ok(relative.to_string_lossy().replace('\\', "/"))
}

fn collect_markdown_resource_entries(dir: &std::path::Path) -> Result<Vec<MarkdownResourceEntry>> {
    let mut entries = Vec::new();
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let is_markdown = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("md"))
            .unwrap_or(false);
        if !is_markdown {
            continue;
        }
        let Some(stem) = path.file_stem().and_then(|v| v.to_str()) else {
            continue;
        };
        entries.push(MarkdownResourceEntry {
            id: stem.to_string(),
            path: path.display().to_string(),
        });
    }
    entries.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(entries)
}

fn print_markdown_resource_listing(
    title: &str,
    dir: &std::path::Path,
    as_json: bool,
) -> Result<()> {
    let entries = collect_markdown_resource_entries(dir)?;
    if as_json {
        println!("{}", serde_json::to_string_pretty(&entries)?);
        return Ok(());
    }
    if entries.is_empty() {
        println!("{}: none found under {}", title, dir.display());
        return Ok(());
    }
    println!("{}:", title);
    for entry in entries {
        println!("- {} ({})", entry.id, entry.path);
    }
    Ok(())
}

fn parse_package_scaffold_kind(kind: &str) -> Result<PackageMarkdownKind> {
    match kind.trim().to_ascii_lowercase().as_str() {
        "workflow" | "workflows" => Ok(PackageMarkdownKind::Workflow),
        "skill" | "skills" => Ok(PackageMarkdownKind::Skill),
        "role" | "roles" => Ok(PackageMarkdownKind::Role),
        "rule" | "rules" => Ok(PackageMarkdownKind::Rule),
        _ => Err(anyhow!(
            "Unsupported scaffold kind '{}'. Use workflow|skill|role|rule",
            kind
        )),
    }
}

fn sanitize_package_name(raw: &str) -> Result<String> {
    let normalized = raw
        .trim()
        .chars()
        .map(|ch| match ch {
            'a'..='z' | '0'..='9' => ch,
            'A'..='Z' => ch.to_ascii_lowercase(),
            '_' | '-' => ch,
            _ => '-',
        })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if normalized.is_empty() {
        return Err(anyhow!(
            "Scaffold name must contain at least one alphanumeric character"
        ));
    }
    Ok(normalized)
}

fn scaffold_markdown_package(
    layout: &AgentProjectLayout,
    kind_raw: &str,
    name_raw: &str,
    overwrite: bool,
) -> Result<std::path::PathBuf> {
    let kind = parse_package_scaffold_kind(kind_raw)?;
    let name = sanitize_package_name(name_raw)?;
    let schema = kind.expected_schema();
    let target_dir = match kind {
        PackageMarkdownKind::Workflow => &layout.workflows_dir,
        PackageMarkdownKind::Skill => &layout.skills_dir,
        PackageMarkdownKind::Role => &layout.roles_dir,
        PackageMarkdownKind::Rule => &layout.rules_dir,
    };
    let path = target_dir.join(format!("{}.md", name));
    if path.exists() && !overwrite {
        return Err(anyhow!(
            "Target file already exists: {} (use --overwrite to replace)",
            path.display()
        ));
    }

    let content = match kind {
        PackageMarkdownKind::Workflow => format!(
            "---\ndescription: {name} workflow description\n---\n# Workflow: {name}\nSchema: {schema}\nDomain: agent\n\n## Step: plan\nSkill: agent.llm_subagent\nInput: planner:::Plan implementation for {name}.\n"
        ),
        PackageMarkdownKind::Skill => format!(
            "# Skill: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"domain\":\"agent\",\"executor\":\"ollama\",\"model\":\"qwen3:8b\"}}\n```\n\nDescribe skill behavior here.\n"
        ),
        PackageMarkdownKind::Role => format!(
            "# Role: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.1}}\n```\n\nDefine responsibilities and expected output format.\n"
        ),
        PackageMarkdownKind::Rule => format!(
            "---\ndescription: {name} rule description\ntrigger: always_on\n---\n# Rule: {name}\nSchema: {schema}\n```json\n{{}}\n```\n"
        ),
    };
    fs::write(&path, content)?;
    Ok(path)
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
    let mut policy = RoutingPolicy::default();
    let normalized_default = default_domain.trim();
    if !normalized_default.is_empty() {
        policy.preferred_domains = vec![normalized_default.to_string()];
    }

    let allowed = parse_csv_list(allow_domain);
    if !allowed.is_empty() {
        policy.allowed_domains = Some(allowed.into_iter().collect::<HashSet<_>>());
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

#[cfg(test)]
mod tests {
    use super::{
        apply_role_override_to_input, bind_role_to_workflow_llm_steps, build_graph_index,
        build_routing_policy, build_thread_flow_workflow, collect_markdown_resource_entries,
        ensure_bootstrap_package, infer_workflow_ref_from_template, merge_template_input,
        normalize_auto_conflict_strategy, parse_package_scaffold_kind, parse_role_override_map,
        resolve_bootstrap_strict_ollama, resolve_role_workflow_selection, sanitize_package_name,
        scaffold_markdown_package, select_template_and_workflow_for_message, validate_git_ref_like,
        RoleRunRequest, ThreadFlowRequest,
    };
    use crate::engine::budget::ExecutionBudget;
    use crate::engine::context::ExecutionContext;
    use crate::engine::package_check::run_package_check;
    use crate::engine::package_schema::PackageMarkdownKind;
    use crate::engine::project::AgentProjectLayout;
    use crate::engine::registry::DomainRegistry;
    use crate::engine::routing::RoutingPolicy;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::engine::thread_session_store::ThreadSessionStore;
    use crate::engine::workflow_engine::{ExecutionEngine, WorkflowInstanceStatus};
    use crate::skill::capability::{
        CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
    };
    use crate::skill::io::{SkillInput, SkillOutput};
    use crate::skill::Skill;
    use crate::skills::echo::EchoSkill;
    use anyhow::{anyhow, Result};
    use async_trait::async_trait;
    use serde_json::json;
    use std::collections::HashMap;
    use std::sync::{Arc, Mutex};

    #[derive(Debug, Default)]
    struct MockConflictState {
        conflicts_remaining: bool,
        llm_calls: u32,
        auto_resolve_calls: u32,
        merge_calls: u32,
    }

    #[derive(Debug, Clone)]
    struct MockEnsureBranchSkill;

    #[derive(Debug, Clone)]
    struct MockRunScriptSkill;

    #[derive(Debug, Clone)]
    struct MockGitMergeBranchSkill {
        state: Arc<Mutex<MockConflictState>>,
    }

    #[derive(Debug, Clone)]
    struct MockAnalyzeConflictsSkill {
        state: Arc<Mutex<MockConflictState>>,
    }

    #[derive(Debug, Clone)]
    struct MockAutoResolveConflictsSkill {
        state: Arc<Mutex<MockConflictState>>,
    }

    #[derive(Debug, Clone)]
    struct MockHasConflictsSkill;

    #[derive(Debug, Clone)]
    struct MockConflictGateSkill;

    #[derive(Debug, Clone)]
    struct MockLlmSubAgentSkill {
        state: Arc<Mutex<MockConflictState>>,
    }

    fn parse_conflict_bool(input: &SkillInput) -> bool {
        match input {
            SkillInput::Boolean(value) => *value,
            SkillInput::Json(value) => {
                if let Some(count) = value.get("count").and_then(|v| v.as_u64()) {
                    return count > 0;
                }
                value
                    .get("conflicts")
                    .and_then(|v| v.as_array())
                    .map(|v| !v.is_empty())
                    .unwrap_or(false)
            }
            SkillInput::Text(text) => {
                matches!(text.trim().to_ascii_lowercase().as_str(), "true" | "1")
            }
            SkillInput::Number(value) => *value > 0.0,
        }
    }

    #[async_trait]
    impl Skill for MockEnsureBranchSkill {
        fn name(&self) -> &str {
            "ensure_branch"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock ensure branch",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::ExternalMutation,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let thread_id = input
                .as_text()
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .unwrap_or("default-thread");
            Ok(SkillOutput::json(json!({
                "status": "ok",
                "thread_id": thread_id,
                "branch": format!("thread/{}", thread_id),
            })))
        }
    }

    #[async_trait]
    impl Skill for MockRunScriptSkill {
        fn name(&self) -> &str {
            "run_script"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock run script",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::Idempotent,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            Ok(SkillOutput::json(json!({
                "status": "ok",
                "command": input.as_text().unwrap_or_default(),
            })))
        }
    }

    #[async_trait]
    impl Skill for MockGitMergeBranchSkill {
        fn name(&self) -> &str {
            "git_merge_branch"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock merge that introduces conflicts",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::ExternalMutation,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let mut state = self.state.lock().expect("lock");
            state.merge_calls = state.merge_calls.saturating_add(1);
            state.conflicts_remaining = true;
            Ok(SkillOutput::json(json!({
                "status": "conflict",
                "requires_conflict_analysis": true,
            })))
        }
    }

    #[async_trait]
    impl Skill for MockAnalyzeConflictsSkill {
        fn name(&self) -> &str {
            "analyze_conflicts"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock analyze conflicts",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::Idempotent,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let state = self.state.lock().expect("lock");
            let conflicts = if state.conflicts_remaining {
                vec!["src/lib.rs"]
            } else {
                Vec::<&str>::new()
            };
            Ok(SkillOutput::json(json!({
                "conflicts": conflicts,
                "count": conflicts.len(),
            })))
        }
    }

    #[async_trait]
    impl Skill for MockAutoResolveConflictsSkill {
        fn name(&self) -> &str {
            "auto_resolve_conflicts"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock auto resolver",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::ExternalMutation,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let mut state = self.state.lock().expect("lock");
            state.auto_resolve_calls = state.auto_resolve_calls.saturating_add(1);
            state.conflicts_remaining = false;
            Ok(SkillOutput::json(json!({
                "status": "resolved",
                "remaining_count": 0,
            })))
        }
    }

    #[async_trait]
    impl Skill for MockHasConflictsSkill {
        fn name(&self) -> &str {
            "has_conflicts"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock has conflicts",
                SkillIOType::Json,
                SkillIOType::Boolean,
                CapabilityPermissions::all(),
                SideEffectClass::Pure,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            Ok(SkillOutput::boolean(parse_conflict_bool(&input)))
        }
    }

    #[async_trait]
    impl Skill for MockConflictGateSkill {
        fn name(&self) -> &str {
            "conflict_gate"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock conflict gate",
                SkillIOType::Boolean,
                SkillIOType::Boolean,
                CapabilityPermissions::all(),
                SideEffectClass::Pure,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            if parse_conflict_bool(&input) {
                return Err(anyhow!("conflicts still present"));
            }
            Ok(SkillOutput::boolean(false))
        }
    }

    #[async_trait]
    impl Skill for MockLlmSubAgentSkill {
        fn name(&self) -> &str {
            "llm_subagent"
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                self.name(),
                "mock llm",
                SkillIOType::Text,
                SkillIOType::Json,
                CapabilityPermissions::all(),
                SideEffectClass::Idempotent,
            )
            .with_trust_tier(TrustTier::Constrained)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            let mut state = self.state.lock().expect("lock");
            state.llm_calls = state.llm_calls.saturating_add(1);
            Ok(SkillOutput::json(json!({
                "schema": "llm_router.v1",
                "summary": "manual resolution plan",
            })))
        }
    }

    #[test]
    fn infers_workflow_id_from_prompt_template_name() {
        assert_eq!(
            infer_workflow_ref_from_template("feature_prompt"),
            "feature".to_string()
        );
        assert_eq!(
            infer_workflow_ref_from_template("review-prompt.md"),
            "review".to_string()
        );
        assert_eq!(
            infer_workflow_ref_from_template("/tmp/custom.md"),
            "custom".to_string()
        );
    }

    #[test]
    fn merges_template_into_role_prefixed_input() {
        let merged = merge_template_input(
            "architect:::Create a deterministic implementation plan.",
            "Role: Architect\nObjective: Build feature",
            "Add email validation to signup flow",
        );
        assert!(merged.starts_with("architect:::"));
        assert!(merged.contains("Template Prompt:\nRole: Architect"));
        assert!(merged.contains("Task:\nAdd email validation to signup flow"));
    }

    #[test]
    fn routing_policy_defaults_to_preferred_without_restricting_allowed_domains() {
        let policy =
            build_routing_policy("demo", None, None, 0, None).expect("build routing policy");
        assert!(policy.allowed_domains.is_none());
        assert_eq!(policy.preferred_domains, vec!["demo".to_string()]);
    }

    #[test]
    fn chat_thread_intent_selection_maps_to_template_and_workflow() {
        assert_eq!(
            select_template_and_workflow_for_message("please review this change"),
            ("review_prompt".to_string(), "review".to_string())
        );
        assert_eq!(
            select_template_and_workflow_for_message("fix panic in auth flow"),
            ("bugfix_prompt".to_string(), "bugfix".to_string())
        );
        assert_eq!(
            select_template_and_workflow_for_message("prepare release changelog and tag"),
            ("release_prompt".to_string(), "release".to_string())
        );
        assert_eq!(
            select_template_and_workflow_for_message("implement feature X"),
            ("feature_prompt".to_string(), "feature".to_string())
        );
    }

    #[test]
    fn bind_role_rewrites_all_llm_step_role_prefixes() {
        let mut workflow = crate::workflow::model::Workflow {
            meta: crate::workflow::model::WorkflowMeta {
                name: "role-bind".to_string(),
                domain: Some("agent".to_string()),
                goal: None,
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                crate::workflow::model::WorkflowStep::new(
                    "s1",
                    "agent.llm_subagent",
                    "architect:::draft plan",
                ),
                crate::workflow::model::WorkflowStep::new(
                    "s2",
                    "agent.llm_subagent",
                    "implement patch",
                ),
                crate::workflow::model::WorkflowStep::new("s3", "demo.echo", "noop"),
            ],
        };
        let bound = bind_role_to_workflow_llm_steps(&mut workflow, "reviewer").expect("bind role");
        assert_eq!(bound, 2);
        assert_eq!(workflow.steps[0].input, "reviewer:::draft plan");
        assert_eq!(workflow.steps[1].input, "reviewer:::implement patch");
        assert_eq!(workflow.steps[2].input, "noop");
    }

    #[test]
    fn resolve_role_workflow_selection_applies_role_and_template() {
        let unique = format!(
            "agentic-sdlc-cli-role-launch-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        let workflows = root.join(".agents/workflows");
        let templates = root.join(".agents/templates");
        let roles = root.join(".agents/roles");
        std::fs::create_dir_all(&workflows).expect("workflows");
        std::fs::create_dir_all(&templates).expect("templates");
        std::fs::create_dir_all(&roles).expect("roles");
        std::fs::write(
            workflows.join("feature.md"),
            "# Workflow: feature\nSchema: antigrav.workflow@v1\nDomain: agent\n\n## Step: plan\nSkill: agent.llm_subagent\nInput: planner:::draft plan\n",
        )
        .expect("workflow");
        std::fs::write(
            templates.join("feature_prompt.md"),
            "Role: Architect\nObjective: build feature",
        )
        .expect("template");
        std::fs::write(
            roles.join("architect.md"),
            "# Role: architect\nSchema: antigrav.role@v1\n```json\n{\"name\":\"architect\"}\n```\nPlan deterministic implementation.",
        )
        .expect("role");

        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover");
        let request = RoleRunRequest {
            role: "architect".to_string(),
            task: "add email validation".to_string(),
            workflow_id: Some("feature".to_string()),
            template: Some("feature_prompt".to_string()),
            thread_id: None,
            json: false,
        };
        let (workflow, _, template, workflow_id, role) =
            resolve_role_workflow_selection(&layout, &request).expect("resolve");
        assert_eq!(template, "feature_prompt");
        assert_eq!(workflow_id, "feature");
        assert_eq!(role, "architect");
        assert!(workflow.steps[0].input.starts_with("architect:::"));
        assert!(workflow.steps[0].input.contains("Template Prompt:"));
        assert!(workflow.steps[0]
            .input
            .contains("Task:\nadd email validation"));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn collects_markdown_resource_entries_sorted_and_filtered() {
        let unique = format!(
            "agentic-sdlc-cli-resource-list-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp root");
        std::fs::write(root.join("b.md"), "b").expect("write b");
        std::fs::write(root.join("a.md"), "a").expect("write a");
        std::fs::write(root.join("ignore.txt"), "x").expect("write txt");

        let entries = collect_markdown_resource_entries(&root).expect("collect entries");
        let ids = entries
            .into_iter()
            .map(|entry| entry.id)
            .collect::<Vec<_>>();
        assert_eq!(ids, vec!["a".to_string(), "b".to_string()]);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn parses_role_override_map_from_csv_pairs() {
        let parsed = parse_role_override_map(Some("architect=planner, implementer=debugger"))
            .expect("parse role override map");
        assert_eq!(parsed.get("architect").map(String::as_str), Some("planner"));
        assert_eq!(
            parsed.get("implementer").map(String::as_str),
            Some("debugger")
        );
    }

    #[test]
    fn applies_role_override_to_prefixed_input() {
        let mut overrides = HashMap::new();
        overrides.insert("architect".to_string(), "planner".to_string());
        let updated =
            apply_role_override_to_input("architect:::Create implementation plan", &overrides)
                .expect("override applied");
        assert_eq!(updated, "planner:::Create implementation plan");
    }

    #[test]
    fn git_ref_like_validation_rejects_unsafe_values() {
        assert!(validate_git_ref_like("branch", "main").is_ok());
        assert!(validate_git_ref_like("branch", "release/v1.0.0").is_ok());
        assert!(validate_git_ref_like("branch", "bad branch").is_err());
        assert!(validate_git_ref_like("branch", "../oops").is_err());
    }

    #[test]
    fn thread_flow_builder_includes_auto_resolve_and_finalize() {
        let unique = format!(
            "agentic-sdlc-cli-thread-flow-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp project");
        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

        let request = ThreadFlowRequest {
            thread_id: "feature-auth".to_string(),
            target_branch: "main".to_string(),
            validate_command: "cargo test".to_string(),
            json: false,
        };
        let workflow = build_thread_flow_workflow(&layout, &request).expect("build workflow");

        let ids = workflow
            .steps
            .iter()
            .map(|step| step.id.as_str())
            .collect::<Vec<_>>();
        assert!(ids.contains(&"auto_resolve_conflicts"));
        assert!(ids.contains(&"recheck_conflicts"));
        assert!(ids.contains(&"has_conflicts_after_auto_resolve"));
        assert!(ids.contains(&"conflict_gate"));
        assert!(ids.contains(&"post_merge_validation"));
        assert_eq!(
            workflow.steps.last().map(|s| s.id.as_str()),
            Some("finalize_thread_flow")
        );

        let post_merge = workflow
            .steps
            .iter()
            .find(|step| step.id == "post_merge_validation")
            .expect("post merge validation step");
        assert_eq!(post_merge.condition, None);
        assert_eq!(post_merge.depends_on, vec!["conflict_gate".to_string()]);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn auto_conflict_strategy_defaults_to_ours() {
        assert_eq!(normalize_auto_conflict_strategy(Some("theirs")), "theirs");
        assert_eq!(normalize_auto_conflict_strategy(Some("unknown")), "ours");
        assert_eq!(normalize_auto_conflict_strategy(None), "ours");
    }

    #[test]
    fn scaffold_generates_markdown_with_schema_header() {
        let unique = format!(
            "agentic-sdlc-cli-scaffold-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp project");
        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

        assert_eq!(
            parse_package_scaffold_kind("workflows").expect("kind"),
            PackageMarkdownKind::Workflow
        );
        assert_eq!(
            sanitize_package_name("My Feature").expect("sanitize"),
            "my-feature".to_string()
        );

        let path =
            scaffold_markdown_package(&layout, "workflow", "My Feature", false).expect("scaffold");
        let body = std::fs::read_to_string(&path).expect("read scaffolded file");
        assert!(body.contains("Schema: antigrav.workflow@v1"));

        let duplicate = scaffold_markdown_package(&layout, "workflow", "my-feature", false);
        assert!(duplicate.is_err());

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn setup_bootstraps_minimal_markdown_package() {
        let unique = format!(
            "agentic-sdlc-cli-setup-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp project");
        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

        let created = ensure_bootstrap_package(&layout).expect("setup package");
        assert_eq!(created.len(), 7);
        assert!(layout.rules_dir.join("runtime.md").exists());
        assert!(layout.rules_dir.join("branching_rules.md").exists());
        assert!(layout.rules_dir.join("coding_rules.md").exists());
        assert!(layout.rules_dir.join("merge_rules.md").exists());
        assert!(layout.workflows_dir.join("starter.md").exists());
        assert!(layout.memory_dir.join("vector_index.json").exists());
        assert!(layout.memory_dir.join("graph_index.json").exists());

        let report = run_package_check(&layout).expect("package check");
        assert!(
            report.errors.is_empty(),
            "expected no package errors, got {:?}",
            report.errors
        );

        let second = ensure_bootstrap_package(&layout).expect("setup idempotent");
        assert!(second.is_empty());

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn graph_index_builder_writes_nodes_payload() {
        let unique = format!(
            "agentic-sdlc-cli-graph-index-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(root.join("src")).expect("create src");
        std::fs::write(
            root.join("src/lib.rs"),
            "mod auth;\nuse crate::auth::validate_email;\n",
        )
        .expect("write lib");
        std::fs::write(
            root.join("src/auth.rs"),
            "pub fn validate_email(input: &str) -> bool { input.contains('@') }\n",
        )
        .expect("write auth");
        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

        let report = build_graph_index(&layout, 100).expect("build graph index");
        assert!(report.nodes >= 2);
        assert!(report.edges >= 1);
        assert!(layout.memory_dir.join("graph_index.json").exists());
        assert!(layout.memory_dir.join("context.db").exists());
        assert_eq!(report.graph_entries, report.nodes);
        assert_eq!(report.vector_entries, report.nodes);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn strict_ollama_flag_respects_env_override() {
        let before = std::env::var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA").ok();
        std::env::remove_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA");
        assert!(!resolve_bootstrap_strict_ollama(false));

        std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", "1");
        assert!(resolve_bootstrap_strict_ollama(false));

        std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", "false");
        assert!(!resolve_bootstrap_strict_ollama(false));

        assert!(resolve_bootstrap_strict_ollama(true));

        if let Some(value) = before {
            std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", value);
        } else {
            std::env::remove_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA");
        }
    }

    #[tokio::test]
    async fn e2e_thread_flow_multi_thread_runs_with_auto_resolve_and_thread_sessions() {
        let unique = format!(
            "agentic-sdlc-cli-e2e-thread-flow-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let root_str = root.to_string_lossy().to_string();
        let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

        std::fs::write(
            layout.rules_dir.join("merge_rules.md"),
            r#"# Merge Rules
Schema: antigrav.rule@v1
```json
{
  "auto_conflict_resolution_assist": true,
  "auto_conflict_resolution_strategy": "ours",
  "auto_conflict_resolution_max_attempts": 2,
  "require_validation_before_merge": false
}
```
"#,
        )
        .expect("merge rules");

        let conflict_state = Arc::new(Mutex::new(MockConflictState::default()));
        let mut registry = DomainRegistry::new();
        registry.register_domain("agent");
        registry
            .register_skill("agent", Arc::new(MockEnsureBranchSkill))
            .expect("register ensure_branch");
        registry
            .register_skill("agent", Arc::new(MockRunScriptSkill))
            .expect("register run_script");
        registry
            .register_skill(
                "agent",
                Arc::new(MockGitMergeBranchSkill {
                    state: Arc::clone(&conflict_state),
                }),
            )
            .expect("register merge");
        registry
            .register_skill(
                "agent",
                Arc::new(MockAnalyzeConflictsSkill {
                    state: Arc::clone(&conflict_state),
                }),
            )
            .expect("register analyze");
        registry
            .register_skill(
                "agent",
                Arc::new(MockAutoResolveConflictsSkill {
                    state: Arc::clone(&conflict_state),
                }),
            )
            .expect("register auto resolve");
        registry
            .register_skill("agent", Arc::new(MockHasConflictsSkill))
            .expect("register has_conflicts");
        registry
            .register_skill("agent", Arc::new(MockConflictGateSkill))
            .expect("register conflict_gate");
        registry
            .register_skill(
                "agent",
                Arc::new(MockLlmSubAgentSkill {
                    state: Arc::clone(&conflict_state),
                }),
            )
            .expect("register llm");
        registry.register_domain("demo");
        registry
            .register_skill("demo", Arc::new(EchoSkill::new()))
            .expect("register echo");

        let engine = ExecutionEngine::new(&root_str, Arc::new(registry)).expect("engine");
        let session_store = ThreadSessionStore::new(&root_str).expect("session store");

        for thread_id in ["thread-alpha", "thread-beta"] {
            let request = ThreadFlowRequest {
                thread_id: thread_id.to_string(),
                target_branch: "main".to_string(),
                validate_command: "echo ok".to_string(),
                json: false,
            };
            let workflow = build_thread_flow_workflow(&layout, &request).expect("build workflow");
            let branch = super::resolve_thread_branch_name(&layout, thread_id).expect("branch");
            session_store
                .ensure_thread(thread_id, &branch)
                .expect("ensure thread");

            let instance = engine
                .run_new_workflow(
                    &workflow,
                    None,
                    ExecutionBudget::default(),
                    RoutingPolicy::default(),
                    DomainSecurityPolicy::default(),
                )
                .await
                .expect("run workflow");
            assert_eq!(instance.status, WorkflowInstanceStatus::Completed);
            assert_eq!(
                instance
                    .step_states
                    .get("resolve_conflicts")
                    .expect("resolve state")
                    .status,
                crate::engine::workflow_engine::instance::StepExecutionStatus::Skipped
            );
            let has_after = instance
                .step_results
                .get("has_conflicts_after_auto_resolve")
                .expect("post resolve conflicts");
            assert!(
                matches!(has_after, SkillOutput::Boolean(false)),
                "expected has_conflicts_after_auto_resolve=false, got {:?}",
                has_after
            );
            session_store
                .record_instance(thread_id, &branch, &instance)
                .expect("record session");
        }

        let sessions = session_store.list_threads().expect("list sessions");
        assert_eq!(sessions.len(), 2);
        assert!(sessions.iter().all(|record| record.run_count == 1));
        assert!(sessions
            .iter()
            .all(|record| record.last_workflow_status.as_deref() == Some("Completed")));

        let state = conflict_state.lock().expect("lock state");
        assert_eq!(state.merge_calls, 2);
        assert_eq!(state.auto_resolve_calls, 2);
        assert_eq!(state.llm_calls, 0);

        let _ = std::fs::remove_dir_all(root);
    }
}
