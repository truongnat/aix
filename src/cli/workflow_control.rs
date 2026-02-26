use super::*;

pub(super) fn handle_workflow_control_command(
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
            json,
        } => {
            let mode = parse_skillpack_install_mode(&mode)?;
            let report = verify_skills_lock(project_layout, mode, fail_on_extra)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&report)?);
            } else {
                println!(
                    "Verify lock: mode='{}' lockfile='{}' ok={} missing={} changed={} extra={} fail_on_extra={}",
                    report.mode,
                    report.lockfile,
                    report.ok,
                    report.missing,
                    report.changed,
                    report.extra,
                    fail_on_extra
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
            }
            if !report.ok {
                return Err(anyhow!(
                    "skills lock verification failed (missing={}, changed={}, extra={})",
                    report.missing,
                    report.changed,
                    report.extra
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
