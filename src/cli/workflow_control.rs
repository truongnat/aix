use super::*;

pub(super) fn handle_workflow_control_command(
    state_store: &WorkflowStateStore,
    thread_session_store: &ThreadSessionStore,
    project_layout: &AgentProjectLayout,
    command: Commands,
) -> Result<WorkflowLaunchAction> {
    match command {
        Commands::Workflow { action } => match action {
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
                    || instance.status == WorkflowInstanceStatus::Paused
                {
                    instance.status = WorkflowInstanceStatus::Aborted;
                    instance.last_error = Some("Abort requested by operator".to_string());
                    state_store.save(&mut instance)?;
                }
            }
            println!("Abort requested for workflow instance '{}'.", id);
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Approve { id, step, by, note } => {
            let instance = state_store.load(&id)?;
            if !instance.step_order.iter().any(|entry| entry == &step) {
                return Err(anyhow!(
                    "step '{}' not found in workflow instance '{}'",
                    step,
                    id
                ));
            }
            let decision = state_store.record_manual_approval_decision(
                &id,
                &step,
                crate::engine::workflow_engine::state_store::ManualApprovalDecisionKind::Approved,
                by.as_deref(),
                note.as_deref(),
            )?;
            println!(
                "Approval recorded: instance='{}' step='{}' decision='approved' by='{}'",
                decision.instance_id, decision.step_id, decision.approver
            );
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Reject { id, step, by, note } => {
            let instance = state_store.load(&id)?;
            if !instance.step_order.iter().any(|entry| entry == &step) {
                return Err(anyhow!(
                    "step '{}' not found in workflow instance '{}'",
                    step,
                    id
                ));
            }
            let decision = state_store.record_manual_approval_decision(
                &id,
                &step,
                crate::engine::workflow_engine::state_store::ManualApprovalDecisionKind::Rejected,
                by.as_deref(),
                note.as_deref(),
            )?;
            println!(
                "Approval recorded: instance='{}' step='{}' decision='rejected' by='{}'",
                decision.instance_id, decision.step_id, decision.approver
            );
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Trace {
            id,
            json,
            timeline,
            otel,
        } => {
            let instance = state_store.load(&id)?;
            if otel {
                let body = render_otel_trace(&instance);
                println!("{}", serde_json::to_string_pretty(&body)?);
                if timeline {
                    println!("{}", render_timeline(&instance));
                }
                return Ok(WorkflowLaunchAction::Noop);
            }
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
        WorkflowCommand::Eval {
            dataset,
            min_pass_rate,
            json,
        } => {
            let report = run_workflow_eval(&dataset, min_pass_rate)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                print_workflow_eval_report(&report);
            }
            if !report.ok {
                return Err(anyhow!(
                    "workflow eval failed: pass_rate={:.2} < min_pass_rate={:.2}",
                    report.pass_rate,
                    report.min_pass_rate
                ));
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::QualitySkills { strict, json } => {
            let report = run_skill_quality_check(project_layout, strict)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                print_skill_quality_report(&report);
            }
            if !report.ok() {
                return Err(anyhow!(
                    "skill quality check failed with errors={} warnings={} (strict={})",
                    report.errors,
                    report.warnings,
                    report.strict
                ));
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::BuildCatalog { json } => {
            let report = build_skill_workflow_catalog(project_layout)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Catalog built: skills={} workflows={} bundles={} output_dir= {}",
                    report.skills, report.workflows, report.bundles, report.catalog_dir
                );
                for output in &report.outputs {
                    println!("- {}", output);
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::Bundles { json } => {
            let bundles = read_bundle_catalog(project_layout)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&bundles)?);
            } else if bundles.is_empty() {
                println!("No bundles found. Run 'workflow build-catalog' first.");
            } else {
                println!("Bundle catalog ({}):", bundles.len());
                for bundle in bundles {
                    println!(
                        "- {} workflows={} skills={} roles={} templates={}",
                        bundle.id,
                        bundle.workflows.len(),
                        bundle.skills.len(),
                        bundle.roles.len(),
                        bundle.templates.len()
                    );
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::ImportSkills {
            source,
            domain,
            max_skills,
            overwrite,
            mode,
            allow_missing_license,
            no_catalog_rebuild,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let options = ImportSkillpackOptions {
                domain_override: domain,
                max_skills,
                overwrite,
                mode,
                allow_missing_license,
                rebuild_catalog: !no_catalog_rebuild,
            };
            let report = import_skills_from_source(project_layout, &source, &options)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Imported skills: mode='{}' source='{}' resolved='{}' commit={:?} license={:?} domain='{}' imported={} skipped={} catalog_rebuilt={}",
                    report.mode,
                    report.source,
                    report.resolved_source,
                    report.commit,
                    report.license,
                    report.domain,
                    report.imported,
                    report.skipped,
                    report.catalog_rebuilt
                );
                for path in &report.files {
                    println!("- {}", path);
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::InstallSkillpack {
            source,
            domain,
            max_skills,
            overwrite,
            mode,
            allow_missing_license,
            no_catalog_rebuild,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let options = ImportSkillpackOptions {
                domain_override: domain,
                max_skills,
                overwrite,
                mode,
                allow_missing_license,
                rebuild_catalog: !no_catalog_rebuild,
            };
            let report = import_skills_from_source(project_layout, &source, &options)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Installed skillpack: mode='{}' source='{}' resolved='{}' commit={:?} license={:?} domain='{}' imported={} skipped={} catalog_rebuilt={}",
                    report.mode,
                    report.source,
                    report.resolved_source,
                    report.commit,
                    report.license,
                    report.domain,
                    report.imported,
                    report.skipped,
                    report.catalog_rebuilt
                );
                for path in &report.files {
                    println!("- {}", path);
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::SyncImports {
            overwrite,
            mode,
            allow_missing_license,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let report = sync_imported_skills_from_lock(
                project_layout,
                overwrite,
                mode,
                allow_missing_license,
            )?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Synced imports: mode='{}' lockfile='{}' sources={} updated={} skipped={} missing={} catalog_rebuilt={}",
                    report.mode,
                    report.lockfile,
                    report.sources,
                    report.updated,
                    report.skipped,
                    report.missing,
                    report.catalog_rebuilt
                );
                for path in &report.files {
                    println!("- {}", path);
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::NormalizeImportedSkills {
            mode,
            dry_run,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let report = normalize_imported_skills(project_layout, mode, dry_run)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Normalized imported skills: mode='{}' dry_run={} import_dir='{}' lockfile='{}' checked={} normalized={} skipped={} catalog_rebuilt={}",
                    report.mode,
                    report.dry_run,
                    report.import_dir,
                    report.lockfile,
                    report.checked,
                    report.normalized,
                    report.skipped,
                    report.catalog_rebuilt
                );
                for path in &report.files {
                    println!("- {}", path);
                }
                if !report.changes.is_empty() {
                    println!("Planned metadata changes:");
                    for change in &report.changes {
                        println!("- {} [{}]", change.path, change.changed_fields.join(", "));
                    }
                }
                if !report.skipped_entries.is_empty() {
                    println!("Skipped files:");
                    for entry in &report.skipped_entries {
                        println!("- {} ({})", entry.path, entry.reason);
                    }
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::InstallBundle {
            bundle,
            mode,
            overwrite,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let report = install_bundle_from_catalog(project_layout, &bundle, mode, overwrite)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Installed bundle: mode='{}' bundle='{}' target='{}' installed={} skipped={} missing={}",
                    report.mode,
                    report.bundle,
                    report.target_dir,
                    report.installed,
                    report.skipped,
                    report.missing
                );
                for path in &report.files {
                    println!("- {}", path);
                }
                if !report.missing_skills.is_empty() {
                    println!("Missing skills:");
                    for skill_id in &report.missing_skills {
                        println!("- {}", skill_id);
                    }
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::VerifyLock {
            mode,
            fail_on_extra,
            require_attestation,
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let report =
                verify_skills_lock(project_layout, mode, fail_on_extra, require_attestation)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Verify lock: mode='{}' lockfile='{}' ok={} missing={} changed={} extra={} attestation_missing={} attestation_invalid={} fail_on_extra={} require_attestation={}",
                    report.mode,
                    report.lockfile,
                    report.ok,
                    report.missing,
                    report.changed,
                    report.extra,
                    report.attestation_missing,
                    report.attestation_invalid,
                    fail_on_extra,
                    require_attestation
                );
                if !report.missing_entries.is_empty() {
                    println!("Missing entries:");
                    for id in &report.missing_entries {
                        println!("- {}", id);
                    }
                }
                if !report.changed_entries.is_empty() {
                    println!("Changed entries:");
                    for id in &report.changed_entries {
                        println!("- {}", id);
                    }
                }
                if !report.extra_entries.is_empty() {
                    println!("Extra entries:");
                    for id in &report.extra_entries {
                        println!("- {}", id);
                    }
                }
                if !report.attestation_missing_entries.is_empty() {
                    println!("Attestation missing:");
                    for id in &report.attestation_missing_entries {
                        println!("- {}", id);
                    }
                }
                if !report.attestation_invalid_entries.is_empty() {
                    println!("Attestation invalid:");
                    for id in &report.attestation_invalid_entries {
                        println!("- {}", id);
                    }
                }
            }
            if !report.ok {
                return Err(anyhow!(
                    "skills lock verification failed (missing={}, changed={}, extra={}, attestation_missing={}, attestation_invalid={})",
                    report.missing,
                    report.changed,
                    report.extra,
                    report.attestation_missing,
                    report.attestation_invalid
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
        WorkflowCommand::McpRegister {
            name,
            transport,
            command,
            args,
            url,
            cwd,
            env,
            allow_tools,
            deny_tools,
            disabled,
            json,
        } => {
            let report = register_mcp_server(
                project_layout,
                &name,
                &transport,
                command.as_deref(),
                &args,
                url.as_deref(),
                cwd.as_deref(),
                &env,
                &allow_tools,
                &deny_tools,
                !disabled,
            )?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "MCP server {}: name='{}' transport='{}' enabled={} registry='{}'",
                    report.action,
                    report.server.name,
                    report.server.transport,
                    report.server.enabled,
                    report.registry_path
                );
                if let Some(command) = report.server.command.as_deref() {
                    println!(
                        "- command='{}' args={} cwd={}",
                        command,
                        report.server.args.len(),
                        report.server.cwd.as_deref().unwrap_or("-")
                    );
                }
                if let Some(url) = report.server.url.as_deref() {
                    println!("- url='{}'", url);
                }
                if !report.server.allow_tools.is_empty() {
                    println!("- allow_tools={}", report.server.allow_tools.join(","));
                }
                if !report.server.deny_tools.is_empty() {
                    println!("- deny_tools={}", report.server.deny_tools.join(","));
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::McpList { json } => {
            let report = list_mcp_servers(project_layout)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else if report.servers.is_empty() {
                println!("No MCP servers registered. Use 'workflow mcp-register <name> ...'.");
            } else {
                println!(
                    "MCP Servers: total={} enabled={} registry='{}'",
                    report.total, report.enabled, report.registry_path
                );
                for server in report.servers {
                    let target = if let Some(command) = server.command.as_deref() {
                        format!("command='{}' args={}", command, server.args.len())
                    } else if let Some(url) = server.url.as_deref() {
                        format!("url='{}'", url)
                    } else {
                        "target='-'".to_string()
                    };
                    let last_ping = match (
                        server.last_ping_ok,
                        server.last_ping_at_ms,
                        server.last_ping_latency_ms,
                    ) {
                        (Some(ok), Some(at_ms), Some(latency_ms)) => {
                            format!("ok={} at={} latency_ms={}", ok, at_ms, latency_ms)
                        }
                        _ => "none".to_string(),
                    };
                    println!(
                        "- {} transport={} enabled={} {} env_keys={} allow_tools={} deny_tools={} last_ping={}",
                        server.name,
                        server.transport,
                        server.enabled,
                        target,
                        server.env_keys.len(),
                        server.allow_tools.len(),
                        server.deny_tools.len(),
                        last_ping
                    );
                }
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::McpPing {
            name,
            timeout_ms,
            json,
        } => {
            let report = ping_mcp_servers(project_layout, name.as_deref(), timeout_ms)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "MCP ping: checked={} passed={} failed={} timeout_ms={} registry='{}'",
                    report.checked,
                    report.passed,
                    report.failed,
                    report.timeout_ms,
                    report.registry_path
                );
                for result in report.results {
                    println!(
                        "- {} transport={} enabled={} ok={} latency_ms={} detail={}",
                        result.name,
                        result.transport,
                        result.enabled,
                        result.ok,
                        result.latency_ms,
                        result.detail
                    );
                }
            }
            if report.failed > 0 {
                return Err(anyhow!("mcp ping failed for {} server(s)", report.failed));
            }
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::McpPolicy { name, tool, json } => {
            let report = evaluate_mcp_policy(project_layout, &name, &tool)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "MCP policy: server='{}' tool='{}' allowed={} reason='{}' transport='{}' enabled={} registry='{}'",
                    report.name,
                    report.tool,
                    report.allowed,
                    report.reason,
                    report.transport,
                    report.enabled,
                    report.registry_path
                );
                if !report.allow_tools.is_empty() {
                    println!("- allow_tools={}", report.allow_tools.join(","));
                }
                if !report.deny_tools.is_empty() {
                    println!("- deny_tools={}", report.deny_tools.join(","));
                }
            }
            if !report.allowed {
                return Err(anyhow!(
                    "mcp policy denied server='{}' tool='{}' ({})",
                    report.name,
                    report.tool,
                    report.reason
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
            validate_command: resolve_default_validate_command(project_layout, &validate_command)?,
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
            validate_command: resolve_default_validate_command(project_layout, &validate_command)?,
            json,
        })),
        WorkflowCommand::Scaffold {
            kind,
            name,
            profile,
            overwrite,
        } => {
            let parsed_profile = parse_scaffold_profile(&profile)?;
            let path =
                scaffold_markdown_package(project_layout, &kind, &name, parsed_profile, overwrite)?;
            let parsed_kind = parse_package_scaffold_kind(&kind)?;
            println!(
                "Scaffold created: {} (schema={} profile={})",
                path.display(),
                parsed_kind.expected_schema(),
                parsed_profile.as_str()
            );
            Ok(WorkflowLaunchAction::Noop)
        }
        WorkflowCommand::ScaffoldDomain {
            domain,
            overwrite,
            json,
        } => {
            let created = scaffold_domain_pack(project_layout, &domain, overwrite)?;
            if json {
                let payload = created
                    .iter()
                    .map(|path| path.display().to_string())
                    .collect::<Vec<_>>();
                println!("{}", serde_json::to_string_pretty(&payload)?);
            } else {
                println!(
                    "Advanced domain pack generated: domain='{}' files={}",
                    sanitize_package_name(&domain)?,
                    created.len()
                );
                for path in created {
                    println!("- {}", path.display());
                }
            }
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
        },
        Commands::Office { action } => {
            use crate::office::runtime::OfficeRuntime;
            use crate::office::roles::Role;

            let project_root = project_layout.agents_root.parent()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| ".".to_string());

            let mut runtime = OfficeRuntime::new(&project_root)?;

            match action {
                OfficeCommand::Start { task, parallel, roles } => {
                    runtime.start(task, parallel, roles)?;
                    println!("Office started successfully.");
                    runtime.office.print_status();
                }
                OfficeCommand::Status { json } => {
                    if json {
                        use serde_json::to_string_pretty;
                        let stats = runtime.office.stats();
                        println!("{}", to_string_pretty(&stats)?);
                    } else {
                        runtime.office.print_status();
                    }
                }
                OfficeCommand::AddTask { title, description, input, role } => {
                    let task_id = runtime.add_task(title, description, input, role)?;
                    println!("Task added: {}", task_id);
                }
                OfficeCommand::Assign { task_id, role } => {
                    runtime.assign_task(task_id, role.clone())?;
                    println!("Task assigned to role: {}", role);
                }
                OfficeCommand::Pause => {
                    runtime.pause()?;
                    println!("Office paused.");
                }
                OfficeCommand::Resume => {
                    runtime.resume()?;
                    println!("Office resumed.");
                }
                OfficeCommand::Stop => {
                    runtime.stop()?;
                    println!("Office stopped.");
                }
                OfficeCommand::Roles => {
                    println!("Available roles:");
                    for role in Role::all() {
                        let color = role.color();
                        println!("{}  - {}{}", color, role, Role::reset_color());
                        println!("    {}", role.description());
                    }
                }
                OfficeCommand::Message { from, to, message } => {
                    runtime.send_message(from, to, message)?;
                    println!("Message sent.");
                }
            }

            Ok(WorkflowLaunchAction::Noop)
        }
    }
}

fn mcp_registry_path(project_layout: &AgentProjectLayout) -> PathBuf {
    project_layout.agents_root.join("mcp").join("servers.json")
}

fn mcp_now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn parse_mcp_transport(raw: &str) -> Result<McpTransport> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "stdio" => Ok(McpTransport::Stdio),
        "http" => Ok(McpTransport::Http),
        "sse" => Ok(McpTransport::Sse),
        other => Err(anyhow!(
            "Unsupported MCP transport '{}'. Use stdio|http|sse",
            other
        )),
    }
}

fn sanitize_mcp_string(raw: Option<&str>) -> Option<String> {
    raw.map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
}

fn sanitize_mcp_string_list(values: &[String]) -> Vec<String> {
    let mut out = values
        .iter()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
        .collect::<Vec<_>>();
    out.sort();
    out.dedup();
    out
}

fn parse_mcp_env(values: &[String]) -> Result<std::collections::BTreeMap<String, String>> {
    let key_re = Regex::new(r"^[A-Za-z_][A-Za-z0-9_]*$").expect("valid regex");
    let mut out = std::collections::BTreeMap::<String, String>::new();
    for item in values {
        let trimmed = item.trim();
        if trimmed.is_empty() {
            continue;
        }
        let (key, value) = trimmed
            .split_once('=')
            .ok_or_else(|| anyhow!("Invalid --env entry '{}'. Expected KEY=VALUE format", item))?;
        let key = key.trim();
        if !key_re.is_match(key) {
            return Err(anyhow!(
                "Invalid --env key '{}'. Expected shell variable name format",
                key
            ));
        }
        out.insert(key.to_string(), value.trim().to_string());
    }
    Ok(out)
}

fn read_mcp_registry(project_layout: &AgentProjectLayout) -> Result<(PathBuf, McpRegistry)> {
    let path = mcp_registry_path(project_layout);
    if !path.exists() {
        return Ok((
            path,
            McpRegistry {
                generated_at_ms: mcp_now_ms(),
                ..McpRegistry::default()
            },
        ));
    }
    let raw = std::fs::read_to_string(&path)
        .map_err(|err| anyhow!("failed to read MCP registry '{}': {}", path.display(), err))?;
    let mut registry: McpRegistry = serde_json::from_str(&raw)
        .map_err(|err| anyhow!("failed to parse MCP registry '{}': {}", path.display(), err))?;
    if registry.version == 0 {
        registry.version = 1;
    }
    registry
        .servers
        .sort_by(|left, right| left.name.cmp(&right.name));
    Ok((path, registry))
}

fn write_mcp_registry(path: &Path, registry: &mut McpRegistry) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    registry.generated_at_ms = mcp_now_ms();
    registry
        .servers
        .sort_by(|left, right| left.name.cmp(&right.name));
    let body = serde_json::to_string_pretty(registry)?;
    std::fs::write(path, body)?;
    Ok(())
}

fn mcp_server_list_entry(server: &McpServerConfig) -> McpServerListEntry {
    let mut env_keys = server.env.keys().cloned().collect::<Vec<_>>();
    env_keys.sort();
    McpServerListEntry {
        name: server.name.clone(),
        transport: server.transport.as_str().to_string(),
        enabled: server.enabled,
        command: server.command.clone(),
        args: server.args.clone(),
        url: server.url.clone(),
        cwd: server.cwd.clone(),
        env_keys,
        allow_tools: server.allow_tools.clone(),
        deny_tools: server.deny_tools.clone(),
        created_at_ms: server.created_at_ms,
        updated_at_ms: server.updated_at_ms,
        last_ping_ok: server.last_ping_ok,
        last_ping_at_ms: server.last_ping_at_ms,
        last_ping_latency_ms: server.last_ping_latency_ms,
        last_ping_detail: server.last_ping_detail.clone(),
    }
}

#[allow(clippy::too_many_arguments)]
fn register_mcp_server(
    project_layout: &AgentProjectLayout,
    name: &str,
    transport: &str,
    command: Option<&str>,
    args: &[String],
    url: Option<&str>,
    cwd: Option<&str>,
    env: &[String],
    allow_tools: &[String],
    deny_tools: &[String],
    enabled: bool,
) -> Result<McpRegisterReport> {
    let name = name.trim();
    if name.is_empty() {
        return Err(anyhow!("MCP server name must not be empty"));
    }
    let name_re = Regex::new(r"^[A-Za-z0-9._-]+$").expect("valid regex");
    if !name_re.is_match(name) {
        return Err(anyhow!(
            "Invalid MCP server name '{}'. Use [A-Za-z0-9._-]",
            name
        ));
    }

    let transport = parse_mcp_transport(transport)?;
    let command = sanitize_mcp_string(command);
    let args = args
        .iter()
        .map(|value| value.trim())
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
        .collect::<Vec<_>>();
    let url = sanitize_mcp_string(url);
    let cwd = sanitize_mcp_string(cwd);
    let env = parse_mcp_env(env)?;
    let allow_tools = sanitize_mcp_string_list(allow_tools);
    let deny_tools = sanitize_mcp_string_list(deny_tools);

    match &transport {
        McpTransport::Stdio => {
            if command.is_none() {
                return Err(anyhow!("transport=stdio requires --command <executable>"));
            }
            if url.is_some() {
                return Err(anyhow!(
                    "transport=stdio cannot be combined with --url (use http|sse)"
                ));
            }
        }
        McpTransport::Http | McpTransport::Sse => {
            if url.is_none() {
                return Err(anyhow!(
                    "transport={} requires --url <endpoint>",
                    transport.as_str()
                ));
            }
            if command.is_some() || !args.is_empty() {
                return Err(anyhow!(
                    "transport={} cannot be combined with --command/--arg (use stdio)",
                    transport.as_str()
                ));
            }
        }
    }

    if let Some(url) = url.as_deref() {
        let parsed = reqwest::Url::parse(url)
            .map_err(|err| anyhow!("Invalid MCP URL '{}': {}", url, err))?;
        if parsed.host_str().is_none() {
            return Err(anyhow!("Invalid MCP URL '{}': missing host", url));
        }
    }

    let (registry_path, mut registry) = read_mcp_registry(project_layout)?;
    let now = mcp_now_ms();
    let action = if let Some(existing) = registry.servers.iter_mut().find(|s| s.name == name) {
        existing.transport = transport;
        existing.command = command.clone();
        existing.args = args.clone();
        existing.url = url.clone();
        existing.cwd = cwd.clone();
        existing.env = env.clone();
        existing.allow_tools = allow_tools.clone();
        existing.deny_tools = deny_tools.clone();
        existing.enabled = enabled;
        existing.updated_at_ms = now;
        "updated".to_string()
    } else {
        registry.servers.push(McpServerConfig {
            name: name.to_string(),
            transport,
            command: command.clone(),
            args: args.clone(),
            url: url.clone(),
            cwd: cwd.clone(),
            env: env.clone(),
            allow_tools: allow_tools.clone(),
            deny_tools: deny_tools.clone(),
            enabled,
            created_at_ms: now,
            updated_at_ms: now,
            last_ping_ok: None,
            last_ping_at_ms: None,
            last_ping_latency_ms: None,
            last_ping_detail: None,
        });
        "created".to_string()
    };
    write_mcp_registry(&registry_path, &mut registry)?;
    let server = registry
        .servers
        .iter()
        .find(|entry| entry.name == name)
        .ok_or_else(|| anyhow!("failed to persist MCP server '{}'", name))?;
    Ok(McpRegisterReport {
        action,
        registry_path: registry_path.display().to_string(),
        server: mcp_server_list_entry(server),
    })
}

fn list_mcp_servers(project_layout: &AgentProjectLayout) -> Result<McpListReport> {
    let (registry_path, mut registry) = read_mcp_registry(project_layout)?;
    write_mcp_registry(&registry_path, &mut registry)?;
    let enabled = registry
        .servers
        .iter()
        .filter(|entry| entry.enabled)
        .count();
    Ok(McpListReport {
        registry_path: registry_path.display().to_string(),
        total: registry.servers.len(),
        enabled,
        servers: registry
            .servers
            .iter()
            .map(mcp_server_list_entry)
            .collect::<Vec<_>>(),
    })
}

fn probe_mcp_http_url(url: &str, timeout_ms: u64) -> Result<String> {
    use std::net::ToSocketAddrs;

    if is_command_available("curl") {
        let seconds = (timeout_ms.max(100) as f64) / 1000.0;
        let output = ProcessCommand::new("curl")
            .arg("-sS")
            .arg("-o")
            .arg("/dev/null")
            .arg("-w")
            .arg("%{http_code}")
            .arg("--max-time")
            .arg(format!("{seconds:.2}"))
            .arg(url)
            .output()
            .map_err(|err| anyhow!("curl probe failed to start: {}", err))?;
        if output.status.success() {
            let code = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let status = code.parse::<u16>().unwrap_or(0);
            if (200..500).contains(&status) {
                return Ok(format!("http status {}", status));
            }
            return Err(anyhow!("http status {}", status));
        }
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let detail = if stderr.is_empty() {
            "curl probe failed".to_string()
        } else {
            stderr
        };
        return Err(anyhow!(detail));
    }

    let parsed =
        reqwest::Url::parse(url).map_err(|err| anyhow!("invalid MCP URL '{}': {}", url, err))?;
    let host = parsed
        .host_str()
        .ok_or_else(|| anyhow!("invalid MCP URL '{}': missing host", url))?;
    let port = parsed
        .port_or_known_default()
        .ok_or_else(|| anyhow!("invalid MCP URL '{}': missing or unknown default port", url))?;
    let timeout = std::time::Duration::from_millis(timeout_ms.max(100));
    let mut addrs = (host, port)
        .to_socket_addrs()
        .map_err(|err| anyhow!("failed to resolve '{}:{}': {}", host, port, err))?;
    let addr = addrs
        .next()
        .ok_or_else(|| anyhow!("failed to resolve '{}:{}'", host, port))?;
    std::net::TcpStream::connect_timeout(&addr, timeout)
        .map_err(|err| anyhow!("tcp connect failed: {}", err))?;
    Ok(format!("tcp connect {}", addr))
}

fn probe_mcp_stdio_command(command: &str, args: &[String], timeout_ms: u64) -> Result<String> {
    let is_explicit_path = command.contains('/') || command.contains(std::path::MAIN_SEPARATOR);
    if !is_explicit_path && !is_command_available(command) {
        return Err(anyhow!("command '{}' not found on PATH", command));
    }

    let mut child = ProcessCommand::new(command)
        .args(args)
        .arg("--help")
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .map_err(|err| anyhow!("failed to spawn '{}': {}", command, err))?;

    let started = std::time::Instant::now();
    let timeout = std::time::Duration::from_millis(timeout_ms.max(100));
    loop {
        if let Some(status) = child
            .try_wait()
            .map_err(|err| anyhow!("failed to poll '{}': {}", command, err))?
        {
            if status.success() {
                return Ok(format!("exited with status {}", status));
            }
            return Err(anyhow!("exited with status {}", status));
        }
        if started.elapsed() >= timeout {
            let _ = child.kill();
            let _ = child.wait();
            return Err(anyhow!("probe timed out after {}ms", timeout.as_millis()));
        }
        std::thread::sleep(std::time::Duration::from_millis(25));
    }
}

fn ping_mcp_server(server: &McpServerConfig, timeout_ms: u64) -> McpPingServerReport {
    let started = std::time::Instant::now();
    let outcome = match server.transport {
        McpTransport::Stdio => match server.command.as_deref() {
            Some(command) => probe_mcp_stdio_command(command, &server.args, timeout_ms),
            None => Err(anyhow!(
                "transport=stdio but command missing in registry entry"
            )),
        },
        McpTransport::Http | McpTransport::Sse => match server.url.as_deref() {
            Some(endpoint) => probe_mcp_http_url(endpoint, timeout_ms),
            None => Err(anyhow!(
                "transport={} but url missing in registry entry",
                server.transport.as_str()
            )),
        },
    };

    let latency_ms = started.elapsed().as_millis() as u64;
    match outcome {
        Ok(detail) => McpPingServerReport {
            name: server.name.clone(),
            transport: server.transport.as_str().to_string(),
            enabled: server.enabled,
            ok: true,
            latency_ms,
            detail,
        },
        Err(err) => McpPingServerReport {
            name: server.name.clone(),
            transport: server.transport.as_str().to_string(),
            enabled: server.enabled,
            ok: false,
            latency_ms,
            detail: err.to_string(),
        },
    }
}

fn ping_mcp_servers(
    project_layout: &AgentProjectLayout,
    name: Option<&str>,
    timeout_ms: u64,
) -> Result<McpPingReport> {
    if timeout_ms == 0 {
        return Err(anyhow!("timeout_ms must be greater than 0"));
    }
    let (registry_path, mut registry) = read_mcp_registry(project_layout)?;
    let target_name = name
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string);

    let target_indexes = if let Some(target) = target_name {
        let index = registry
            .servers
            .iter()
            .position(|entry| entry.name == target)
            .ok_or_else(|| anyhow!("MCP server '{}' not found", target))?;
        vec![index]
    } else {
        registry
            .servers
            .iter()
            .enumerate()
            .filter_map(|(index, entry)| if entry.enabled { Some(index) } else { None })
            .collect::<Vec<_>>()
    };

    if target_indexes.is_empty() {
        return Ok(McpPingReport {
            registry_path: registry_path.display().to_string(),
            checked: 0,
            passed: 0,
            failed: 0,
            timeout_ms,
            results: Vec::new(),
        });
    }

    let mut results = Vec::<McpPingServerReport>::with_capacity(target_indexes.len());
    let now = mcp_now_ms();
    for index in target_indexes {
        let result = ping_mcp_server(&registry.servers[index], timeout_ms);
        registry.servers[index].last_ping_ok = Some(result.ok);
        registry.servers[index].last_ping_at_ms = Some(now);
        registry.servers[index].last_ping_latency_ms = Some(result.latency_ms);
        registry.servers[index].last_ping_detail = Some(result.detail.clone());
        results.push(result);
    }
    write_mcp_registry(&registry_path, &mut registry)?;

    let passed = results.iter().filter(|entry| entry.ok).count();
    let failed = results.len().saturating_sub(passed);
    Ok(McpPingReport {
        registry_path: registry_path.display().to_string(),
        checked: results.len(),
        passed,
        failed,
        timeout_ms,
        results,
    })
}

fn normalize_mcp_tool_name(raw: &str) -> String {
    raw.trim().to_ascii_lowercase()
}

fn mcp_tool_pattern_matches(tool: &str, pattern: &str) -> bool {
    if pattern == "*" {
        return true;
    }
    if let Some(prefix) = pattern.strip_suffix('*') {
        return !prefix.is_empty() && tool.starts_with(prefix);
    }
    tool == pattern
}

fn find_mcp_policy_match<'a>(tool: &str, patterns: &'a [String]) -> Option<&'a str> {
    patterns.iter().find_map(|pattern| {
        let normalized = normalize_mcp_tool_name(pattern);
        if normalized.is_empty() {
            return None;
        }
        if mcp_tool_pattern_matches(tool, &normalized) {
            Some(pattern.as_str())
        } else {
            None
        }
    })
}

fn evaluate_mcp_policy_decision(server: &McpServerConfig, tool: &str) -> (bool, String) {
    if !server.enabled {
        return (false, "server is disabled".to_string());
    }

    if let Some(matched) = find_mcp_policy_match(tool, &server.deny_tools) {
        return (
            false,
            format!("matched deny_tools pattern '{}'", matched.trim()),
        );
    }

    if server.allow_tools.is_empty() {
        return (true, "allow_tools empty; default-allow mode".to_string());
    }

    if let Some(matched) = find_mcp_policy_match(tool, &server.allow_tools) {
        return (
            true,
            format!("matched allow_tools pattern '{}'", matched.trim()),
        );
    }

    (
        false,
        "tool is not included in allow_tools and allowlist mode is active".to_string(),
    )
}

fn evaluate_mcp_policy(
    project_layout: &AgentProjectLayout,
    name: &str,
    tool: &str,
) -> Result<McpPolicyReport> {
    let server_name = name.trim();
    if server_name.is_empty() {
        return Err(anyhow!("MCP server name must not be empty"));
    }
    let normalized_tool = normalize_mcp_tool_name(tool);
    if normalized_tool.is_empty() {
        return Err(anyhow!("tool name must not be empty"));
    }

    let (registry_path, registry) = read_mcp_registry(project_layout)?;
    let server = registry
        .servers
        .iter()
        .find(|entry| entry.name == server_name)
        .ok_or_else(|| anyhow!("MCP server '{}' not found", server_name))?;
    let (allowed, reason) = evaluate_mcp_policy_decision(server, &normalized_tool);
    Ok(McpPolicyReport {
        registry_path: registry_path.display().to_string(),
        name: server.name.clone(),
        transport: server.transport.as_str().to_string(),
        enabled: server.enabled,
        tool: normalized_tool,
        allowed,
        reason,
        allow_tools: server.allow_tools.clone(),
        deny_tools: server.deny_tools.clone(),
    })
}

fn resolve_default_validate_command(
    project_layout: &AgentProjectLayout,
    requested: &str,
) -> Result<String> {
    let trimmed = requested.trim();
    if trimmed.is_empty() {
        return Err(anyhow!("validate_command must not be empty"));
    }
    if trimmed != "cargo test" {
        return Ok(trimmed.to_string());
    }

    let package_json = Path::new(&project_layout.project_root).join("package.json");
    if !package_json.exists() {
        return Ok(trimmed.to_string());
    }
    let Ok(raw) = std::fs::read_to_string(&package_json) else {
        return Ok(trimmed.to_string());
    };
    let Ok(payload) = serde_json::from_str::<serde_json::Value>(&raw) else {
        return Ok(trimmed.to_string());
    };
    let Some(scripts) = payload.get("scripts").and_then(|v| v.as_object()) else {
        return Ok(trimmed.to_string());
    };
    if scripts.contains_key("agent:validate") {
        return Ok("npm run -s agent:validate".to_string());
    }
    if scripts.contains_key("validate:agent") {
        return Ok("npm run -s validate:agent".to_string());
    }
    if scripts.contains_key("build") {
        return Ok("npm run -s build".to_string());
    }
    Ok(trimmed.to_string())
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

fn print_skill_quality_report(report: &SkillQualityReport) {
    println!(
        "Skill Quality: checked={} errors={} warnings={} strict={}",
        report.checked_skills, report.errors, report.warnings, report.strict
    );
    for entry in &report.entries {
        if entry.findings.is_empty() {
            continue;
        }
        println!(
            "- {} ({}) [{}]",
            entry.id,
            entry.path,
            if entry
                .findings
                .iter()
                .any(|f| matches!(f.level, SkillQualityLevel::Error))
            {
                "error"
            } else {
                "warning"
            }
        );
        for finding in &entry.findings {
            println!("    - {:?}: {}", finding.level, finding.message);
        }
    }
}

fn run_workflow_eval(dataset_path: &str, min_pass_rate: f64) -> Result<WorkflowEvalReport> {
    if !(0.0..=1.0).contains(&min_pass_rate) {
        return Err(anyhow!(
            "min_pass_rate must be within [0.0, 1.0], got {}",
            min_pass_rate
        ));
    }
    let path = Path::new(dataset_path);
    let raw = std::fs::read_to_string(path)
        .map_err(|err| anyhow!("failed to read eval dataset '{}': {}", path.display(), err))?;
    let dataset: WorkflowEvalDataset = serde_json::from_str(&raw)
        .map_err(|err| anyhow!("failed to parse eval dataset '{}': {}", path.display(), err))?;
    if dataset.cases.is_empty() {
        return Err(anyhow!("eval dataset '{}' has no cases", path.display()));
    }

    let mut passed = 0usize;
    let mut results = Vec::with_capacity(dataset.cases.len());
    for case in dataset.cases {
        let mut findings = Vec::<String>::new();
        let summary = case
            .report
            .get("summary")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .trim()
            .to_string();
        let summary_chars = summary.chars().count();
        let actions = case
            .report
            .get("actions")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();
        let risks = case
            .report
            .get("risks")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();

        let min_summary_chars = case.min_summary_chars.unwrap_or(80);
        let min_actions = case.min_actions.unwrap_or(2);
        let min_risks = case.min_risks.unwrap_or(1);

        if summary_chars < min_summary_chars {
            findings.push(format!(
                "summary too short: {} < {} chars",
                summary_chars, min_summary_chars
            ));
        }
        if actions.len() < min_actions {
            findings.push(format!(
                "actions too few: {} < {}",
                actions.len(),
                min_actions
            ));
        }
        if risks.len() < min_risks {
            findings.push(format!("risks too few: {} < {}", risks.len(), min_risks));
        }

        let summary_lower = summary.to_ascii_lowercase();
        for keyword in case
            .required_summary_keywords
            .iter()
            .map(|v| v.trim())
            .filter(|v| !v.is_empty())
        {
            if !summary_lower.contains(&keyword.to_ascii_lowercase()) {
                findings.push(format!(
                    "missing summary keyword '{}'",
                    keyword.to_ascii_lowercase()
                ));
            }
        }

        let actions_text = actions
            .iter()
            .filter_map(|v| v.as_str())
            .collect::<Vec<_>>()
            .join("\n")
            .to_ascii_lowercase();
        for keyword in case
            .required_action_keywords
            .iter()
            .map(|v| v.trim())
            .filter(|v| !v.is_empty())
        {
            if !actions_text.contains(&keyword.to_ascii_lowercase()) {
                findings.push(format!(
                    "missing action keyword '{}'",
                    keyword.to_ascii_lowercase()
                ));
            }
        }

        let risks_text = risks
            .iter()
            .filter_map(|v| v.as_str())
            .collect::<Vec<_>>()
            .join("\n")
            .to_ascii_lowercase();
        for keyword in case
            .required_risk_keywords
            .iter()
            .map(|v| v.trim())
            .filter(|v| !v.is_empty())
        {
            if !risks_text.contains(&keyword.to_ascii_lowercase()) {
                findings.push(format!(
                    "missing risk keyword '{}'",
                    keyword.to_ascii_lowercase()
                ));
            }
        }

        let case_passed = findings.is_empty();
        if case_passed {
            passed = passed.saturating_add(1);
        }
        results.push(WorkflowEvalCaseResult {
            id: case.id,
            passed: case_passed,
            summary_chars,
            actions: actions.len(),
            risks: risks.len(),
            findings,
        });
    }

    let cases = results.len();
    let failed = cases.saturating_sub(passed);
    let pass_rate = if cases == 0 {
        0.0
    } else {
        passed as f64 / cases as f64
    };
    let dataset_name = dataset
        .name
        .unwrap_or_else(|| path.display().to_string())
        .trim()
        .to_string();
    Ok(WorkflowEvalReport {
        dataset: dataset_name,
        cases,
        passed,
        failed,
        pass_rate,
        min_pass_rate,
        ok: pass_rate >= min_pass_rate,
        results,
    })
}

fn print_workflow_eval_report(report: &WorkflowEvalReport) {
    println!(
        "Workflow Eval: dataset='{}' cases={} passed={} failed={} pass_rate={:.2} min_pass_rate={:.2} ok={}",
        report.dataset,
        report.cases,
        report.passed,
        report.failed,
        report.pass_rate,
        report.min_pass_rate,
        report.ok
    );
    for result in &report.results {
        let label = if result.passed { "pass" } else { "fail" };
        println!(
            "- {} [{}] summary_chars={} actions={} risks={}",
            result.id, label, result.summary_chars, result.actions, result.risks
        );
        if !result.findings.is_empty() {
            for finding in &result.findings {
                println!("    - {}", finding);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{
        evaluate_mcp_policy, list_mcp_servers, parse_mcp_transport, ping_mcp_servers,
        register_mcp_server, resolve_default_validate_command, run_workflow_eval, McpTransport,
    };
    use crate::engine::project::AgentProjectLayout;

    fn unique_temp_root(label: &str) -> std::path::PathBuf {
        let unique = format!(
            "agentic-sdlc-workflow-control-{}-{}",
            label,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        std::env::temp_dir().join(unique)
    }

    #[test]
    fn keeps_explicit_validate_command() {
        let root = unique_temp_root("validate-explicit");
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        let resolved =
            resolve_default_validate_command(&layout, "npm run -s build").expect("resolve");
        assert_eq!(resolved, "npm run -s build");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn maps_default_validate_to_agent_validate_script() {
        let root = unique_temp_root("validate-script");
        std::fs::create_dir_all(&root).expect("create temp root");
        std::fs::write(
            root.join("package.json"),
            r#"{"name":"demo","scripts":{"agent:validate":"npm run -s build && cargo check --manifest-path src-tauri/Cargo.toml"}}"#,
        )
        .expect("write package json");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        let resolved = resolve_default_validate_command(&layout, "cargo test").expect("resolve");
        assert_eq!(resolved, "npm run -s agent:validate");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn workflow_eval_passes_detailed_case() {
        let root = unique_temp_root("eval-pass");
        std::fs::create_dir_all(&root).expect("create temp root");
        let dataset_path = root.join("dataset.json");
        std::fs::write(
            &dataset_path,
            r#"{
  "name":"release-eval",
  "cases":[
    {
      "id":"case-1",
      "report":{
        "summary":"Release readiness summary includes rollback strategy, risk posture, and validation evidence across critical paths.",
        "actions":["run regression tests","prepare rollback checklist"],
        "risks":["latency spike risk"]
      },
      "required_summary_keywords":["rollback","risk"],
      "required_action_keywords":["test","rollback"],
      "required_risk_keywords":["latency"]
    }
  ]
}"#,
        )
        .expect("write dataset");

        let report = run_workflow_eval(dataset_path.to_string_lossy().as_ref(), 0.8).expect("eval");
        assert!(report.ok);
        assert_eq!(report.failed, 0);
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn workflow_eval_fails_sparse_case() {
        let root = unique_temp_root("eval-fail");
        std::fs::create_dir_all(&root).expect("create temp root");
        let dataset_path = root.join("dataset.json");
        std::fs::write(
            &dataset_path,
            r#"{
  "cases":[
    {
      "id":"case-1",
      "report":{
        "summary":"short",
        "actions":["fix"],
        "risks":[]
      }
    }
  ]
}"#,
        )
        .expect("write dataset");

        let report = run_workflow_eval(dataset_path.to_string_lossy().as_ref(), 1.0).expect("eval");
        assert!(!report.ok);
        assert_eq!(report.failed, 1);
        assert!(!report.results[0].findings.is_empty());
        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn parse_mcp_transport_supports_expected_values() {
        assert!(matches!(
            parse_mcp_transport("stdio").expect("stdio"),
            McpTransport::Stdio
        ));
        assert!(matches!(
            parse_mcp_transport("http").expect("http"),
            McpTransport::Http
        ));
        assert!(matches!(
            parse_mcp_transport("sse").expect("sse"),
            McpTransport::Sse
        ));
        assert!(parse_mcp_transport("invalid").is_err());
    }

    #[test]
    fn register_and_list_mcp_server_round_trip() {
        let root = unique_temp_root("mcp-register-list");
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        let env = vec!["TEST_TOKEN=dummy".to_string()];
        let report = register_mcp_server(
            &layout,
            "local-cli",
            "stdio",
            Some("cargo"),
            &[],
            None,
            None,
            &env,
            &["search".to_string()],
            &[],
            true,
        )
        .expect("register");
        assert_eq!(report.action, "created");
        assert_eq!(report.server.name, "local-cli");
        assert!(report.server.enabled);
        assert_eq!(report.server.env_keys, vec!["TEST_TOKEN".to_string()]);

        let listed = list_mcp_servers(&layout).expect("list");
        assert_eq!(listed.total, 1);
        assert_eq!(listed.enabled, 1);
        assert_eq!(listed.servers[0].name, "local-cli");

        let update = register_mcp_server(
            &layout,
            "local-cli",
            "stdio",
            Some("cargo"),
            &[],
            None,
            None,
            &[],
            &[],
            &["unsafe_tool".to_string()],
            false,
        )
        .expect("update");
        assert_eq!(update.action, "updated");
        assert!(!update.server.enabled);
        assert_eq!(update.server.deny_tools, vec!["unsafe_tool".to_string()]);

        let listed = list_mcp_servers(&layout).expect("list after update");
        assert_eq!(listed.total, 1);
        assert_eq!(listed.enabled, 0);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn ping_mcp_server_updates_status_fields() {
        let root = unique_temp_root("mcp-ping");
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        register_mcp_server(
            &layout,
            "cargo-help",
            "stdio",
            Some("cargo"),
            &[],
            None,
            None,
            &[],
            &[],
            &[],
            true,
        )
        .expect("register");

        let report = ping_mcp_servers(&layout, None, 4_000).expect("ping");
        assert_eq!(report.checked, 1);
        assert_eq!(report.failed, 0);
        assert_eq!(report.passed, 1);
        assert_eq!(report.results[0].name, "cargo-help");
        assert!(report.results[0].ok);

        let listed = list_mcp_servers(&layout).expect("list after ping");
        assert_eq!(listed.total, 1);
        assert_eq!(listed.servers[0].last_ping_ok, Some(true));
        assert!(listed.servers[0].last_ping_at_ms.is_some());
        assert!(listed.servers[0].last_ping_latency_ms.is_some());
        assert!(listed.servers[0].last_ping_detail.is_some());

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn mcp_policy_allow_and_deny_precedence() {
        let root = unique_temp_root("mcp-policy-precedence");
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        register_mcp_server(
            &layout,
            "policy-server",
            "stdio",
            Some("cargo"),
            &[],
            None,
            None,
            &[],
            &["query*".to_string(), "list_tables".to_string()],
            &["query_secret".to_string()],
            true,
        )
        .expect("register");

        let allow =
            evaluate_mcp_policy(&layout, "policy-server", "query_projects").expect("allow policy");
        assert!(allow.allowed);
        assert!(allow.reason.contains("allow_tools"));

        let denied =
            evaluate_mcp_policy(&layout, "policy-server", "query_secret").expect("deny policy");
        assert!(!denied.allowed);
        assert!(denied.reason.contains("deny_tools"));

        let missing =
            evaluate_mcp_policy(&layout, "policy-server", "drop_schema").expect("missing policy");
        assert!(!missing.allowed);
        assert!(missing.reason.contains("allow_tools"));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn mcp_policy_blocks_disabled_server() {
        let root = unique_temp_root("mcp-policy-disabled");
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        register_mcp_server(
            &layout,
            "disabled-server",
            "stdio",
            Some("cargo"),
            &[],
            None,
            None,
            &[],
            &[],
            &[],
            false,
        )
        .expect("register disabled");

        let report = evaluate_mcp_policy(&layout, "disabled-server", "list_tables")
            .expect("evaluate disabled");
        assert!(!report.allowed);
        assert_eq!(report.reason, "server is disabled");

        let _ = std::fs::remove_dir_all(root);
    }
}
