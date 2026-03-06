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
    }
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
    use super::{resolve_default_validate_command, run_workflow_eval};
    use crate::engine::project::AgentProjectLayout;

    #[test]
    fn keeps_explicit_validate_command() {
        let unique = format!(
            "agentic-sdlc-workflow-control-validate-explicit-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

        let resolved =
            resolve_default_validate_command(&layout, "npm run -s build").expect("resolve");
        assert_eq!(resolved, "npm run -s build");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn maps_default_validate_to_agent_validate_script() {
        let unique = format!(
            "agentic-sdlc-workflow-control-validate-script-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
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
        let unique = format!(
            "agentic-sdlc-workflow-eval-pass-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
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
        let unique = format!(
            "agentic-sdlc-workflow-eval-fail-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
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
}
