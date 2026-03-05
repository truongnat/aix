use super::*;

pub(super) async fn run_impl() -> Result<()> {
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
                "Implementation run: instance={} status={} trace={} steps={}/{} failed={}",
                report.implementation.instance_id,
                report.implementation.status,
                report.implementation.trace_id,
                report.implementation.completed_steps,
                report.implementation.total_steps,
                report.implementation.failed_steps
            );
            for step in &report.implementation.step_details {
                println!(
                    "- [{}] {} duration_ms={} actions={} risks={} provider={} model={}",
                    step.status,
                    step.step_id,
                    step.duration_ms
                        .map(|v| v.to_string())
                        .unwrap_or_else(|| "-".to_string()),
                    step.actions,
                    step.risks,
                    step.provider.as_deref().unwrap_or("-"),
                    step.model.as_deref().unwrap_or("-")
                );
                if let Some(summary) = step.summary.as_ref() {
                    println!("  summary: {}", summary);
                }
                if let Some(error) = step.error.as_ref() {
                    println!("  error: {}", error);
                }
            }
            if let Some(merge) = report.merge.as_ref() {
                println!(
                    "Merge run: instance={} status={} trace={} steps={}/{} failed={}",
                    merge.instance_id,
                    merge.status,
                    merge.trace_id,
                    merge.completed_steps,
                    merge.total_steps,
                    merge.failed_steps
                );
                for step in &merge.step_details {
                    println!(
                        "- [{}] {} duration_ms={} actions={} risks={} provider={} model={}",
                        step.status,
                        step.step_id,
                        step.duration_ms
                            .map(|v| v.to_string())
                            .unwrap_or_else(|| "-".to_string()),
                        step.actions,
                        step.risks,
                        step.provider.as_deref().unwrap_or("-"),
                        step.model.as_deref().unwrap_or("-")
                    );
                    if let Some(summary) = step.summary.as_ref() {
                        println!("  summary: {}", summary);
                    }
                    if let Some(error) = step.error.as_ref() {
                        println!("  error: {}", error);
                    }
                }
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
