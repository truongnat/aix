use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

use super::*;

pub(super) fn build_domain_registry(
    replay_cache: Option<Arc<crate::engine::replay_cache::ReplayCache>>,
) -> Result<DomainRegistry> {
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
    
    // Week 2: Inject replay cache into LlmSubAgentSkill if provided
    let llm_skill = if let Some(cache) = replay_cache {
        Arc::new(LlmSubAgentSkill::new().with_replay_cache(cache))
    } else {
        Arc::new(LlmSubAgentSkill::new())
    };
    domains.register_skill("agent", llm_skill)?;
    domains.register_skill("agent", Arc::new(EnsureBranchSkill))?;
    domains.register_skill("agent", Arc::new(RunScriptSkill))?;
    domains.register_skill("agent", Arc::new(WriteFileSkill))?;
    domains.register_skill("agent", Arc::new(GitCommitSkill))?;
    domains.register_skill("agent", Arc::new(GitMergeBranchSkill))?;
    domains.register_skill("agent", Arc::new(AnalyzeConflictsSkill))?;
    domains.register_skill("agent", Arc::new(AutoResolveConflictsSkill))?;
    domains.register_skill("agent", Arc::new(HasConflictsSkill))?;
    domains.register_skill("agent", Arc::new(ConflictGateSkill))?;
    domains.register_skill("agent", Arc::new(SimulationFallbackGateSkill))?;
    domains.register_skill("agent", Arc::new(ReportQualityGateSkill))?;
    domains.register_skill("agent", Arc::new(ManualApprovalSkill))?;
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

pub(super) fn resolve_workflow_selection(
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

pub(super) fn resolve_template_workflow_selection(
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

pub(super) fn default_template_for_role(role: &str) -> &'static str {
    match role.trim().to_ascii_lowercase().as_str() {
        "reviewer" => "review_prompt",
        "debugger" | "resolver" => "bugfix_prompt",
        "releaser" => "release_prompt",
        _ => "feature_prompt",
    }
}

pub(super) fn default_role_for_template_or_workflow(
    template: &str,
    workflow_id: &str,
) -> &'static str {
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

pub(super) fn select_template_and_workflow_for_message(message: &str) -> (String, String) {
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

pub(super) fn bind_role_to_workflow_llm_steps(
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

pub(super) fn resolve_role_workflow_selection(
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

pub(super) fn instance_summary(instance: &WorkflowInstance) -> ThreadRunSummary {
    let step_details = instance
        .step_order
        .iter()
        .map(|step_id| summarize_step(instance, step_id))
        .collect::<Vec<_>>();
    ThreadRunSummary {
        instance_id: instance.instance_id.clone(),
        workflow_name: instance.workflow_name.clone(),
        status: format!("{:?}", instance.status),
        trace_id: instance.trace_id.clone(),
        completed_steps: instance.completed_steps.len(),
        failed_steps: instance.failed_steps.len(),
        total_steps: instance.step_order.len(),
        step_details,
    }
}

fn summarize_step(instance: &WorkflowInstance, step_id: &str) -> StepRunSummary {
    let state = instance.step_states.get(step_id);
    let output = instance.step_results.get(step_id);
    let (summary, actions, risks) = summarize_skill_output(output);
    StepRunSummary {
        step_id: step_id.to_string(),
        status: state
            .map(|v| format!("{:?}", v.status))
            .unwrap_or_else(|| "Pending".to_string()),
        duration_ms: state.and_then(|v| v.duration_ms),
        provider: state.and_then(|v| v.provider.clone()),
        model: state.and_then(|v| v.model.clone()),
        summary,
        actions,
        risks,
        error: state.and_then(|v| v.last_error.clone()),
    }
}

fn summarize_skill_output(
    output: Option<&crate::skill::io::SkillOutput>,
) -> (Option<String>, usize, usize) {
    let Some(output) = output else {
        return (None, 0, 0);
    };
    match output {
        crate::skill::io::SkillOutput::Json(value) => {
            let summary = value
                .get("summary")
                .and_then(|v| v.as_str())
                .map(|v| truncate_for_report(v, 240))
                .or_else(|| {
                    if value.is_null() {
                        None
                    } else {
                        Some(truncate_for_report(&value.to_string(), 240))
                    }
                });
            let actions = value
                .get("actions")
                .and_then(|v| v.as_array())
                .map(|v| v.len())
                .unwrap_or(0);
            let risks = value
                .get("risks")
                .and_then(|v| v.as_array())
                .map(|v| v.len())
                .unwrap_or(0);
            (summary, actions, risks)
        }
        crate::skill::io::SkillOutput::Text(text) => {
            let trimmed = text.trim();
            if trimmed.is_empty() {
                (None, 0, 0)
            } else {
                (Some(truncate_for_report(trimmed, 240)), 0, 0)
            }
        }
        crate::skill::io::SkillOutput::Number(value) => (Some(value.to_string()), 0, 0),
        crate::skill::io::SkillOutput::Boolean(value) => (Some(value.to_string()), 0, 0),
    }
}

fn truncate_for_report(text: &str, max_chars: usize) -> String {
    let trimmed = text.trim();
    let count = trimmed.chars().count();
    if count <= max_chars {
        return trimmed.to_string();
    }
    let mut prefix = String::new();
    for ch in trimmed.chars().take(max_chars.saturating_sub(3)) {
        prefix.push(ch);
    }
    format!("{}...", prefix)
}

pub(super) fn load_template_prompt(
    project_layout: &AgentProjectLayout,
    template_ref: &str,
) -> Result<String> {
    let template_path = project_layout
        .resolve_template_path(template_ref)
        .ok_or_else(|| anyhow!("Template '{}' not found in .agents/templates", template_ref))?;
    Ok(fs::read_to_string(template_path)?)
}

pub(super) fn resolve_thread_branch_name(
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

pub(super) fn ensure_thread_execution_context(
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

pub(super) fn build_thread_flow_workflow(
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
            condition: None,
            retry: None,
            on_failure: crate::workflow::model::FailureStrategy::FailFast,
        });
    } else {
        steps.push(crate::workflow::model::WorkflowStep {
            id: "has_conflicts_after_auto_resolve".to_string(),
            skill: "agent.has_conflicts".to_string(),
            input: "{{has_conflicts}}".to_string(),
            depends_on: vec!["has_conflicts".to_string()],
            condition: None,
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

pub(super) fn validate_git_ref_like(field_name: &str, value: &str) -> Result<()> {
    if value.is_empty() {
        return Err(anyhow!("{} must not be empty", field_name));
    }
    if value.contains("..")
        || value.contains('\\')
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

pub(super) fn normalize_auto_conflict_strategy(value: Option<&str>) -> &'static str {
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

pub(super) fn infer_workflow_ref_from_template(template_ref: &str) -> String {
    let path = Path::new(template_ref);
    let stem = path
        .file_stem()
        .and_then(|v| v.to_str())
        .unwrap_or(template_ref)
        .trim()
        .to_string();
    let mut normalized_stem = stem.clone();
    for suffix in ["_prompt", "-prompt"] {
        if let Some(base) = stem.strip_suffix(suffix) {
            if !base.trim().is_empty() {
                normalized_stem = base.trim().to_string();
                break;
            }
        }
    }
    if path.is_absolute() {
        return normalized_stem;
    }
    let parent = path.parent().and_then(|v| {
        let value = v.to_string_lossy().replace('\\', "/");
        let trimmed = value.trim_matches('/').trim().to_string();
        if trimmed.is_empty() || trimmed == "." {
            None
        } else {
            Some(trimmed)
        }
    });
    match parent {
        Some(prefix) => format!("{}/{}", prefix, normalized_stem),
        None => normalized_stem,
    }
}

pub(super) fn inject_template_prompt(
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

pub(super) fn is_llm_subagent_step(skill_ref: &str) -> bool {
    let normalized = skill_ref.trim().to_ascii_lowercase();
    normalized == "llm_subagent" || normalized.ends_with(".llm_subagent")
}

pub(super) fn merge_template_input(
    existing_input: &str,
    template_prompt: &str,
    task: &str,
) -> String {
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

pub(super) fn parse_role_override_map(value: Option<&str>) -> Result<HashMap<String, String>> {
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

pub(super) fn apply_role_overrides(
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

pub(super) fn apply_role_override_to_input(
    step_input: &str,
    role_overrides: &HashMap<String, String>,
) -> Option<String> {
    let (role, rest) = step_input.split_once(":::")?;
    let source = role.trim().to_ascii_lowercase();
    let target = role_overrides.get(&source)?;
    Some(format!("{}:::{}", target, rest))
}
