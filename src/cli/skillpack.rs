use super::*;

pub(super) fn read_skills_lockfile(path: &Path) -> Result<SkillsLockfile> {
    let body = fs::read_to_string(path)?;
    let mut parsed: SkillsLockfile = serde_json::from_str(&body)?;
    if parsed.version == 0 {
        parsed.version = 1;
    }
    Ok(parsed)
}

#[derive(Debug, Clone)]
struct SkillpackInstallTarget {
    mode: SkillpackInstallMode,
    project_root: PathBuf,
    skills_root: PathBuf,
    import_dir: PathBuf,
    lockfile_path: PathBuf,
    supports_catalog_rebuild: bool,
}

fn resolve_skillpack_install_target(
    layout: &AgentProjectLayout,
    mode: SkillpackInstallMode,
) -> Result<SkillpackInstallTarget> {
    let project_root = PathBuf::from(&layout.project_root);
    match mode {
        SkillpackInstallMode::Local => Ok(SkillpackInstallTarget {
            mode,
            project_root,
            skills_root: layout.skills_dir.clone(),
            import_dir: layout.skills_dir.join("imported"),
            lockfile_path: layout.agents_root.join("skills.lock.json"),
            supports_catalog_rebuild: true,
        }),
        SkillpackInstallMode::Global => {
            let codex_home = resolve_codex_home_dir()?;
            let skills_root = codex_home.join("skills");
            Ok(SkillpackInstallTarget {
                mode,
                project_root,
                skills_root: skills_root.clone(),
                import_dir: skills_root.join("imported"),
                lockfile_path: skills_root.join("skills.lock.json"),
                supports_catalog_rebuild: false,
            })
        }
    }
}

fn resolve_codex_home_dir() -> Result<PathBuf> {
    if let Ok(raw) = std::env::var("CODEX_HOME") {
        let trimmed = raw.trim();
        if !trimmed.is_empty() {
            return Ok(PathBuf::from(trimmed));
        }
    }
    let home = std::env::var("HOME")
        .map(PathBuf::from)
        .map_err(|_| anyhow!("Cannot resolve global mode: set CODEX_HOME or HOME"))?;
    Ok(home.join(".codex"))
}

fn format_skillpack_report_path(target: &SkillpackInstallTarget, path: &Path) -> String {
    match target.mode {
        SkillpackInstallMode::Local => relative_unix_path(&target.project_root, path)
            .unwrap_or_else(|_| path.display().to_string()),
        SkillpackInstallMode::Global => path.display().to_string(),
    }
}

fn resolve_imported_skill_target_path(import_dir: &Path, skill_name: &str) -> PathBuf {
    import_dir.join(skill_name).join("SKILL.md")
}

fn resolve_bundle_skill_target_path(bundle_dir: &Path, skill_id: &str) -> PathBuf {
    let relative = skill_id.trim_matches('/').replace('\\', "/");
    bundle_dir.join(relative).join("SKILL.md")
}

fn resolve_skill_name_for_target_path(path: &Path, fallback: &str) -> String {
    if path
        .file_name()
        .and_then(|v| v.to_str())
        .map(|v| v.eq_ignore_ascii_case("SKILL.md"))
        .unwrap_or(false)
    {
        if let Some(parent) = path.parent().and_then(|v| v.file_name()) {
            if let Some(value) = parent.to_str() {
                let trimmed = value.trim();
                if !trimmed.is_empty() {
                    return trimmed.to_string();
                }
            }
        }
    }
    path.file_stem()
        .and_then(|v| v.to_str())
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| fallback.to_string())
}

fn resolve_lock_entry_target_path(
    target: &SkillpackInstallTarget,
    entry: &SkillLockEntry,
) -> PathBuf {
    let raw = PathBuf::from(entry.path.trim());
    if raw.is_absolute() {
        return raw;
    }
    match target.mode {
        SkillpackInstallMode::Local => target.project_root.join(&entry.path),
        SkillpackInstallMode::Global => target.skills_root.join(&entry.path),
    }
}

fn write_skills_lockfile_for_target(target: &SkillpackInstallTarget) -> Result<()> {
    let base = match target.mode {
        SkillpackInstallMode::Local => target.project_root.as_path(),
        SkillpackInstallMode::Global => target.skills_root.as_path(),
    };
    let lock = build_skills_lockfile_from_skills_root(&target.skills_root, base)?;
    if let Some(parent) = target.lockfile_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(&target.lockfile_path, serde_json::to_string_pretty(&lock)?)?;
    Ok(())
}

fn build_skills_lockfile_from_skills_root(
    skills_root: &Path,
    base_path: &Path,
) -> Result<SkillsLockfile> {
    let mut entries = Vec::<SkillLockEntry>::new();
    for path in collect_markdown_paths_recursive(skills_root)? {
        let content = match fs::read_to_string(&path) {
            Ok(v) => v,
            Err(_) => continue,
        };
        if validate_schema_header(&content, PackageMarkdownKind::Skill).is_err() {
            continue;
        }
        let (meta, _) = match parse_skill_markdown(&content) {
            Ok(v) => v,
            Err(_) => continue,
        };
        let bytes = fs::read(&path)?;
        let id = to_resource_id(skills_root, &path).unwrap_or_else(|| meta.name.clone());
        let path_str =
            relative_unix_path(base_path, &path).unwrap_or_else(|_| path.display().to_string());
        entries.push(SkillLockEntry {
            id,
            path: path_str,
            bytes: bytes.len(),
            fingerprint: fnv1a64_hex(&bytes),
            source: meta
                .source
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            source_requested: meta
                .source_requested
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            source_commit: meta
                .source_commit
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            source_path: meta
                .source_path
                .map(|v| v.trim().replace('\\', "/"))
                .filter(|v| !v.is_empty()),
            source_license: meta
                .source_license
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty())
                .or(meta
                    .license
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())),
            imported_at_ms: meta.imported_at_ms,
        });
    }
    entries.sort_by(|a, b| a.id.cmp(&b.id));
    let imports = build_import_lock_sources(&entries);
    Ok(SkillsLockfile {
        version: 2,
        generated_at_ms: now_ms_u64(),
        skills: entries,
        imports,
    })
}

pub(super) fn import_skills_from_source(
    layout: &AgentProjectLayout,
    source: &str,
    options: &ImportSkillpackOptions,
) -> Result<ImportSkillsReport> {
    let max_skills = options.max_skills.clamp(1, 500);
    let target = resolve_skillpack_install_target(layout, options.mode)?;
    let source_ctx = resolve_import_source_context(source, None)?;
    if source_ctx.license.is_none() && !options.allow_missing_license {
        return Err(anyhow!(
            "Import source '{}' has no detectable license file at repository root. Add --allow-missing-license to override.",
            source_ctx.requested_source
        ));
    }
    let effective_license = source_ctx
        .license
        .clone()
        .or_else(|| options.allow_missing_license.then(|| "unknown".to_string()));

    let mut skill_files = Vec::<PathBuf>::new();
    walk_directory_files(&source_ctx.root, &mut |path| {
        if path
            .file_name()
            .and_then(|v| v.to_str())
            .map(|v| v.eq_ignore_ascii_case("SKILL.md"))
            .unwrap_or(false)
        {
            skill_files.push(path.to_path_buf());
        }
    })?;
    skill_files.sort();
    if skill_files.is_empty() {
        return Err(anyhow!("No SKILL.md files found under source '{}'", source));
    }

    let target_domain =
        sanitize_package_name(options.domain_override.as_deref().unwrap_or("imported"))?;
    fs::create_dir_all(&target.import_dir)?;
    let mut files = Vec::<String>::new();
    let mut imported = 0usize;
    let mut skipped = 0usize;

    for skill_path in skill_files.into_iter().take(max_skills) {
        let content = match fs::read_to_string(&skill_path) {
            Ok(v) => v,
            Err(_) => {
                skipped = skipped.saturating_add(1);
                continue;
            }
        };
        let imported_skill = parse_external_skill_markdown(&content, &skill_path)?;
        let skill_name = sanitize_package_name(&imported_skill.name)?;
        let source_path = relative_unix_path(&source_ctx.root, &skill_path)?;
        let provenance = ImportProvenance {
            requested_source: source_ctx.requested_source.clone(),
            resolved_source: source_ctx.resolved_source.clone(),
            source_path: source_path.clone(),
            source_commit: source_ctx.commit.clone(),
            source_license: effective_license.clone(),
            imported_at_ms: Some(now_ms_u64()),
        };
        let mut target_path = resolve_imported_skill_target_path(&target.import_dir, &skill_name);
        if target_path.exists() && !options.overwrite {
            let suffix = fnv1a64_hex(imported_skill.origin.as_bytes());
            target_path = resolve_imported_skill_target_path(
                &target.import_dir,
                &format!("{}-{}", skill_name, &suffix[..8]),
            );
            if target_path.exists() && !options.overwrite {
                skipped = skipped.saturating_add(1);
                continue;
            }
        }
        let body = build_imported_skill_markdown(
            &target_domain,
            &skill_name,
            &imported_skill,
            &provenance,
        );
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&target_path, body)?;
        imported = imported.saturating_add(1);
        files.push(format_skillpack_report_path(&target, &target_path));
    }
    files.sort();
    let catalog_rebuilt = target.supports_catalog_rebuild && options.rebuild_catalog;
    if catalog_rebuilt {
        let _ = build_skill_workflow_catalog(layout)?;
    } else {
        write_skills_lockfile_for_target(&target)?;
    }

    Ok(ImportSkillsReport {
        mode: options.mode.as_str().to_string(),
        source: source_ctx.requested_source.clone(),
        resolved_source: source_ctx.resolved_source.clone(),
        commit: source_ctx.commit.clone(),
        license: effective_license,
        domain: target_domain,
        imported,
        skipped,
        catalog_rebuilt,
        files,
    })
}

pub(super) fn sync_imported_skills_from_lock(
    layout: &AgentProjectLayout,
    overwrite: bool,
    mode: SkillpackInstallMode,
    allow_missing_license: bool,
) -> Result<SyncImportsReport> {
    let target = resolve_skillpack_install_target(layout, mode)?;
    let lock_path = target.lockfile_path.clone();
    if !lock_path.exists() {
        return Err(anyhow!(
            "skills lockfile missing at '{}'. Run '{}' first.",
            lock_path.display(),
            if mode == SkillpackInstallMode::Local {
                "workflow build-catalog"
            } else {
                "workflow install-skillpack <source> --mode global"
            }
        ));
    }
    let lockfile = read_skills_lockfile(&lock_path)?;
    let mut grouped = HashMap::<String, Vec<SkillLockEntry>>::new();
    let mut missing = 0usize;
    let mut skipped = 0usize;
    for entry in lockfile.skills.into_iter().filter(is_imported_lock_entry) {
        let Some(source) = entry.source.clone().filter(|v| !v.trim().is_empty()) else {
            missing = missing.saturating_add(1);
            continue;
        };
        let key = format!(
            "{}|{}",
            source,
            entry.source_commit.as_deref().unwrap_or_default()
        );
        grouped.entry(key).or_default().push(entry);
    }
    let sources = grouped.len();
    let mut updated = 0usize;
    let mut files = Vec::<String>::new();

    for entries in grouped.values_mut() {
        entries.sort_by(|a, b| a.id.cmp(&b.id));
        let sample = entries
            .first()
            .ok_or_else(|| anyhow!("Invalid empty sync group"))?;
        let source = sample
            .source
            .clone()
            .ok_or_else(|| anyhow!("Imported lock entry '{}' missing source", sample.id))?;
        let pinned_commit = sample.source_commit.as_deref();
        let mut source_ctx = resolve_import_source_context(&source, pinned_commit)?;
        if source_ctx.license.is_none() {
            source_ctx.license = sample.source_license.clone();
        }
        if source_ctx.license.is_none() && !allow_missing_license {
            return Err(anyhow!(
                "Sync source '{}' has no detectable license. Add --allow-missing-license to override.",
                source
            ));
        }
        let effective_license = source_ctx
            .license
            .clone()
            .or_else(|| allow_missing_license.then(|| "unknown".to_string()));

        for entry in entries.iter() {
            let Some(source_path) = entry.source_path.clone() else {
                missing = missing.saturating_add(1);
                continue;
            };
            let source_skill_path = source_ctx.root.join(&source_path);
            if !source_skill_path.exists() {
                missing = missing.saturating_add(1);
                continue;
            }
            let content = match fs::read_to_string(&source_skill_path) {
                Ok(v) => v,
                Err(_) => {
                    missing = missing.saturating_add(1);
                    continue;
                }
            };
            let imported_skill = parse_external_skill_markdown(&content, &source_skill_path)?;

            let target_path = resolve_lock_entry_target_path(&target, entry);
            if target_path.exists() && !overwrite {
                skipped = skipped.saturating_add(1);
                continue;
            }
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent)?;
            }

            let target_domain = infer_skill_domain_for_target(&target_path)
                .unwrap_or_else(|| "imported".to_string());
            let fallback_skill_name = sanitize_package_name(&imported_skill.name)
                .unwrap_or_else(|_| "imported-skill".to_string());
            let skill_name = resolve_skill_name_for_target_path(&target_path, &fallback_skill_name);
            let provenance = ImportProvenance {
                requested_source: entry
                    .source_requested
                    .clone()
                    .unwrap_or_else(|| source_ctx.requested_source.clone()),
                resolved_source: source_ctx.resolved_source.clone(),
                source_path: source_path.replace('\\', "/"),
                source_commit: entry.source_commit.clone().or(source_ctx.commit.clone()),
                source_license: effective_license.clone(),
                imported_at_ms: Some(now_ms_u64()),
            };
            let body = build_imported_skill_markdown(
                &target_domain,
                &skill_name,
                &imported_skill,
                &provenance,
            );
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&target_path, body)?;
            updated = updated.saturating_add(1);
            files.push(format_skillpack_report_path(&target, &target_path));
        }
    }
    files.sort();
    let catalog_rebuilt = target.supports_catalog_rebuild;
    if catalog_rebuilt {
        let _ = build_skill_workflow_catalog(layout)?;
    } else {
        write_skills_lockfile_for_target(&target)?;
    }

    Ok(SyncImportsReport {
        mode: mode.as_str().to_string(),
        lockfile: format_skillpack_report_path(&target, &lock_path),
        sources,
        updated,
        skipped,
        missing,
        catalog_rebuilt,
        files,
    })
}

pub(super) fn install_bundle_from_catalog(
    layout: &AgentProjectLayout,
    bundle: &str,
    mode: SkillpackInstallMode,
    overwrite: bool,
) -> Result<BundleInstallReport> {
    let target = resolve_skillpack_install_target(layout, mode)?;
    let bundles_path = layout.agents_root.join("catalog").join("bundles.json");
    let skills_index_path = layout.agents_root.join("catalog").join("skills_index.json");
    if !bundles_path.exists() || !skills_index_path.exists() {
        return Err(anyhow!(
            "Bundle catalog missing. Run 'workflow build-catalog' before install-bundle."
        ));
    }

    let bundles_body = fs::read_to_string(&bundles_path)?;
    let skill_index_body = fs::read_to_string(&skills_index_path)?;
    let bundles: Vec<BundleCatalogEntry> = serde_json::from_str(&bundles_body)?;
    let skill_entries: Vec<SkillCatalogEntry> = serde_json::from_str(&skill_index_body)?;
    let bundle = bundles
        .into_iter()
        .find(|entry| entry.id == bundle.trim())
        .ok_or_else(|| {
            anyhow!(
                "Bundle '{}' not found in '{}'",
                bundle.trim(),
                bundles_path.display()
            )
        })?;

    let mut skill_by_id = HashMap::<String, SkillCatalogEntry>::new();
    for entry in skill_entries {
        skill_by_id.insert(entry.id.clone(), entry);
    }

    let bundle_dir = target.skills_root.join("bundles").join(&bundle.id);
    fs::create_dir_all(&bundle_dir)?;
    let mut installed = 0usize;
    let mut skipped = 0usize;
    let mut missing = 0usize;
    let mut files = Vec::<String>::new();
    let mut missing_skills = Vec::<String>::new();
    let mut lock_entries = Vec::<serde_json::Value>::new();
    for skill_id in &bundle.skills {
        let Some(skill_entry) = skill_by_id.get(skill_id) else {
            missing = missing.saturating_add(1);
            missing_skills.push(skill_id.clone());
            continue;
        };
        let source_path = Path::new(&layout.project_root).join(&skill_entry.path);
        if !source_path.exists() {
            missing = missing.saturating_add(1);
            missing_skills.push(skill_id.clone());
            continue;
        }
        let target_path = resolve_bundle_skill_target_path(&bundle_dir, skill_id);
        if target_path.exists() && !overwrite {
            skipped = skipped.saturating_add(1);
            continue;
        }
        if let Some(parent) = target_path.parent() {
            fs::create_dir_all(parent)?;
        }
        let bytes = fs::read(&source_path)?;
        fs::write(&target_path, &bytes)?;
        installed = installed.saturating_add(1);
        files.push(format_skillpack_report_path(&target, &target_path));
        lock_entries.push(serde_json::json!({
            "id": skill_id,
            "source_path": skill_entry.path,
            "target_path": format_skillpack_report_path(&target, &target_path),
            "fingerprint": fnv1a64_hex(&bytes),
        }));
    }
    files.sort();
    missing_skills.sort();
    let bundle_lock_dir = match mode {
        SkillpackInstallMode::Local => layout.agents_root.join("catalog").join("bundle-locks"),
        SkillpackInstallMode::Global => target.skills_root.join(".bundle-locks"),
    };
    fs::create_dir_all(&bundle_lock_dir)?;
    let bundle_lock_path = bundle_lock_dir.join(format!(
        "{}.json",
        sanitize_package_name(&bundle.id).unwrap_or_else(|_| bundle.id.clone())
    ));
    fs::write(
        &bundle_lock_path,
        serde_json::to_string_pretty(&serde_json::json!({
            "bundle": bundle.id,
            "mode": mode.as_str(),
            "generated_at_ms": now_ms_u64(),
            "skills": lock_entries,
        }))?,
    )?;

    Ok(BundleInstallReport {
        mode: mode.as_str().to_string(),
        bundle: bundle.id,
        target_dir: format_skillpack_report_path(&target, &bundle_dir),
        installed,
        skipped,
        missing,
        files,
        missing_skills,
    })
}

pub(super) fn verify_skills_lock(
    layout: &AgentProjectLayout,
    mode: SkillpackInstallMode,
    fail_on_extra: bool,
) -> Result<SkillsLockVerifyReport> {
    let target = resolve_skillpack_install_target(layout, mode)?;
    let lock_path = target.lockfile_path.clone();
    if !lock_path.exists() {
        return Err(anyhow!(
            "skills lockfile missing at '{}'. Run 'workflow build-catalog' or 'workflow install-skillpack' first.",
            lock_path.display()
        ));
    }

    let lock = read_skills_lockfile(&lock_path)?;
    let mut lock_ids = HashSet::<String>::new();
    let mut missing_entries = Vec::<String>::new();
    let mut changed_entries = Vec::<String>::new();
    for entry in &lock.skills {
        lock_ids.insert(entry.id.clone());
        let path = resolve_lock_entry_target_path(&target, entry);
        if !path.exists() {
            missing_entries.push(entry.id.clone());
            continue;
        }
        let bytes = fs::read(&path)?;
        let fingerprint = fnv1a64_hex(&bytes);
        if fingerprint != entry.fingerprint {
            changed_entries.push(entry.id.clone());
        }
    }

    let base = match mode {
        SkillpackInstallMode::Local => target.project_root.as_path(),
        SkillpackInstallMode::Global => target.skills_root.as_path(),
    };
    let snapshot = build_skills_lockfile_from_skills_root(&target.skills_root, base)?;
    let mut extra_entries = snapshot
        .skills
        .iter()
        .map(|entry| entry.id.clone())
        .filter(|id| !lock_ids.contains(id))
        .collect::<Vec<_>>();
    missing_entries.sort();
    changed_entries.sort();
    extra_entries.sort();

    let ok = missing_entries.is_empty()
        && changed_entries.is_empty()
        && (!fail_on_extra || extra_entries.is_empty());
    Ok(SkillsLockVerifyReport {
        mode: mode.as_str().to_string(),
        lockfile: format_skillpack_report_path(&target, &lock_path),
        ok,
        missing: missing_entries.len(),
        changed: changed_entries.len(),
        extra: extra_entries.len(),
        missing_entries,
        changed_entries,
        extra_entries,
    })
}

fn infer_skill_domain_for_target(path: &Path) -> Option<String> {
    if !path.exists() {
        return None;
    }
    let content = fs::read_to_string(path).ok()?;
    let (meta, _) = parse_skill_markdown(&content).ok()?;
    sanitize_package_name(&meta.domain).ok()
}

#[derive(Debug, Clone)]
struct ImportSourceContext {
    root: PathBuf,
    requested_source: String,
    resolved_source: String,
    commit: Option<String>,
    license: Option<String>,
    cleanup_dir: Option<PathBuf>,
}

impl Drop for ImportSourceContext {
    fn drop(&mut self) {
        if let Some(path) = self.cleanup_dir.take() {
            let _ = fs::remove_dir_all(path);
        }
    }
}

#[derive(Debug, Clone)]
struct ImportProvenance {
    requested_source: String,
    resolved_source: String,
    source_path: String,
    source_commit: Option<String>,
    source_license: Option<String>,
    imported_at_ms: Option<u64>,
}

fn resolve_import_source_context(
    source: &str,
    pinned_commit: Option<&str>,
) -> Result<ImportSourceContext> {
    let raw = source.trim();
    if raw.is_empty() {
        return Err(anyhow!("Import source is required"));
    }
    if let Some(commit) = pinned_commit {
        validate_git_ref_like("source_commit", commit)?;
    }
    let source_path = PathBuf::from(raw);
    if source_path.exists() {
        if !source_path.is_dir() {
            return Err(anyhow!(
                "Import source path '{}' is not a directory",
                source_path.display()
            ));
        }
        let canonical = fs::canonicalize(&source_path).unwrap_or(source_path.clone());
        if let Some(commit) = pinned_commit {
            if !is_command_available("git") {
                return Err(anyhow!(
                    "Cannot pin commit '{}' for local import source without git",
                    commit
                ));
            }
            let temp_dir = create_import_temp_dir("sync-skills");
            git_clone_source_to(raw, &temp_dir, false)?;
            git_checkout_commit(&temp_dir, commit)?;
            let resolved_source = git_remote_origin(&temp_dir)
                .unwrap_or_else(|| canonical.to_string_lossy().to_string());
            let detected_commit = git_head_commit(&temp_dir);
            let license = detect_repo_license(&temp_dir);
            return Ok(ImportSourceContext {
                root: temp_dir.clone(),
                requested_source: raw.to_string(),
                resolved_source,
                commit: detected_commit.or_else(|| Some(commit.to_string())),
                license,
                cleanup_dir: Some(temp_dir),
            });
        }

        let resolved_source = git_remote_origin(&canonical)
            .unwrap_or_else(|| canonical.to_string_lossy().to_string());
        let commit = git_head_commit(&canonical);
        let license = detect_repo_license(&canonical);
        return Ok(ImportSourceContext {
            root: canonical,
            requested_source: raw.to_string(),
            resolved_source,
            commit,
            license,
            cleanup_dir: None,
        });
    }

    let looks_like_git = raw.starts_with("http://")
        || raw.starts_with("https://")
        || raw.starts_with("git@")
        || raw.ends_with(".git");
    if !looks_like_git {
        return Err(anyhow!(
            "Import source '{}' is neither a local directory nor a git URL",
            raw
        ));
    }
    if !is_command_available("git") {
        return Err(anyhow!(
            "Cannot import from git URL because 'git' command is unavailable"
        ));
    }

    let use_shallow_clone = pinned_commit.is_none();
    let temp_dir = create_import_temp_dir("import-skills");
    git_clone_source_to(raw, &temp_dir, use_shallow_clone)?;
    if let Some(commit) = pinned_commit {
        git_checkout_commit(&temp_dir, commit)?;
    }
    let resolved_source = git_remote_origin(&temp_dir).unwrap_or_else(|| raw.to_string());
    let commit = git_head_commit(&temp_dir);
    let license = detect_repo_license(&temp_dir);
    Ok(ImportSourceContext {
        root: temp_dir.clone(),
        requested_source: raw.to_string(),
        resolved_source,
        commit,
        license,
        cleanup_dir: Some(temp_dir),
    })
}

fn create_import_temp_dir(prefix: &str) -> PathBuf {
    let temp_dir = std::env::temp_dir().join(format!("agentic-sdlc-{}-{}", prefix, now_ms_u64()));
    if temp_dir.exists() {
        let _ = fs::remove_dir_all(&temp_dir);
    }
    temp_dir
}

fn git_clone_source_to(source: &str, target: &Path, shallow: bool) -> Result<()> {
    let mut cmd = ProcessCommand::new("git");
    cmd.arg("clone");
    if shallow {
        cmd.arg("--depth").arg("1");
    }
    let output = cmd.arg(source).arg(target).output()?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow!(
            "git clone failed for '{}': {}",
            source,
            stderr.trim()
        ));
    }
    Ok(())
}

fn git_checkout_commit(repo_root: &Path, commit: &str) -> Result<()> {
    let output = ProcessCommand::new("git")
        .arg("-C")
        .arg(repo_root)
        .arg("checkout")
        .arg("--detach")
        .arg(commit)
        .output()?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow!(
            "git checkout failed for commit '{}' at '{}': {}",
            commit,
            repo_root.display(),
            stderr.trim()
        ));
    }
    Ok(())
}

fn git_remote_origin(repo_root: &Path) -> Option<String> {
    let output = ProcessCommand::new("git")
        .arg("-C")
        .arg(repo_root)
        .arg("config")
        .arg("--get")
        .arg("remote.origin.url")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn git_head_commit(repo_root: &Path) -> Option<String> {
    let output = ProcessCommand::new("git")
        .arg("-C")
        .arg(repo_root)
        .arg("rev-parse")
        .arg("HEAD")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn detect_repo_license(repo_root: &Path) -> Option<String> {
    let entries = fs::read_dir(repo_root).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let Some(name) = path.file_name().and_then(|v| v.to_str()) else {
            continue;
        };
        let upper = name.to_ascii_uppercase();
        if !(upper.starts_with("LICENSE") || upper.starts_with("COPYING")) {
            continue;
        }
        let body = fs::read_to_string(&path).unwrap_or_default();
        let inferred = infer_license_identifier(&body).unwrap_or_else(|| name.to_string());
        return Some(inferred);
    }
    None
}

fn infer_license_identifier(content: &str) -> Option<String> {
    let lower = content.to_ascii_lowercase();
    if lower.contains("apache license") && lower.contains("version 2") {
        return Some("Apache-2.0".to_string());
    }
    if lower.contains("mit license") {
        return Some("MIT".to_string());
    }
    if lower.contains("bsd 3-clause") {
        return Some("BSD-3-Clause".to_string());
    }
    if lower.contains("bsd 2-clause") {
        return Some("BSD-2-Clause".to_string());
    }
    if lower.contains("mozilla public license") && lower.contains("2.0") {
        return Some("MPL-2.0".to_string());
    }
    if lower.contains("gnu general public license") && lower.contains("version 3") {
        return Some("GPL-3.0".to_string());
    }
    if lower.contains("gnu general public license") && lower.contains("version 2") {
        return Some("GPL-2.0".to_string());
    }
    if lower.contains("eclipse public license") && lower.contains("2.0") {
        return Some("EPL-2.0".to_string());
    }
    if lower.contains("creative commons zero") || lower.contains("cc0") {
        return Some("CC0-1.0".to_string());
    }
    None
}

#[derive(Debug, Clone)]
pub(crate) struct ImportedSkill {
    pub(crate) name: String,
    pub(crate) description: String,
    pub(crate) tags: Vec<String>,
    pub(crate) risk: String,
    pub(crate) source: Option<String>,
    pub(crate) body: String,
    pub(crate) when_to_use: Vec<String>,
    pub(crate) examples: Vec<String>,
    pub(crate) limitations: Vec<String>,
    pub(crate) origin: String,
}

pub(super) fn parse_external_skill_markdown(content: &str, path: &Path) -> Result<ImportedSkill> {
    let (frontmatter, body) = split_frontmatter(content);
    let fm = parse_simple_yaml_map(frontmatter.unwrap_or_default());
    let fallback_name = path
        .parent()
        .and_then(|v| v.file_name())
        .and_then(|v| v.to_str())
        .unwrap_or("imported-skill");
    let name = fm
        .get("name")
        .cloned()
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| fallback_name.to_string());
    let description = fm
        .get("description")
        .cloned()
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| {
            extract_first_paragraph(body).unwrap_or_else(|| "Imported skill".to_string())
        });
    let tags = parse_frontmatter_list(fm.get("tags").map(String::as_str));
    let risk = normalize_risk_label(fm.get("risk").map(String::as_str));
    let source = fm.get("source").cloned().filter(|v| !v.trim().is_empty());

    let body_clean = body.trim();
    let when_to_use = extract_section_bullets(
        body_clean,
        &[
            "when to use",
            "when to use this skill",
            "use this skill when",
        ],
    );
    let examples = extract_fenced_examples(body_clean);
    let limitations = extract_section_bullets(
        body_clean,
        &[
            "limitations",
            "known limitations",
            "common pitfalls",
            "common issues",
        ],
    );

    Ok(ImportedSkill {
        name,
        description,
        tags,
        risk,
        source,
        body: body_clean.to_string(),
        when_to_use,
        examples,
        limitations,
        origin: path.display().to_string(),
    })
}

fn build_imported_skill_markdown(
    domain: &str,
    skill_name: &str,
    imported: &ImportedSkill,
    provenance: &ImportProvenance,
) -> String {
    let source_field = imported
        .source
        .clone()
        .unwrap_or_else(|| provenance.resolved_source.trim().to_string());
    let description = imported.description.trim();
    let description_meta = truncate_chars(description, 200);
    let mut tags = if imported.tags.is_empty() {
        vec![
            "imported".to_string(),
            "external".to_string(),
            domain.to_string(),
        ]
    } else {
        let mut provided = imported.tags.clone();
        provided.push(domain.to_string());
        provided
    };
    tags = tags
        .into_iter()
        .map(|tag| tag.trim().to_ascii_lowercase())
        .filter(|tag| !tag.is_empty())
        .collect::<Vec<_>>();
    tags.sort();
    tags.dedup();
    if tags.len() < 3 {
        tags.push("skillpack".to_string());
        tags.sort();
        tags.dedup();
    }
    let when_to_use = if imported.when_to_use.is_empty() {
        vec!["Use when the task matches this skill domain.".to_string()]
    } else {
        imported.when_to_use.clone()
    };
    let examples = if imported.examples.is_empty() {
        vec!["Input: <task context> -> Output: structured guidance".to_string()]
    } else {
        imported.examples.clone()
    };
    let limitations = if imported.limitations.is_empty() {
        vec!["Imported guidance may require adaptation to local project conventions.".to_string()]
    } else {
        imported.limitations.clone()
    };

    let json_meta = serde_json::json!({
        "name": skill_name,
        "domain": domain,
        "description": description_meta,
        "risk": imported.risk,
        "source": source_field,
        "source_requested": provenance.requested_source,
        "source_commit": provenance.source_commit,
        "source_path": provenance.source_path,
        "source_license": provenance.source_license,
        "imported_at_ms": provenance.imported_at_ms,
        "tags": tags,
        "executor": "ollama",
        "model": "qwen3:8b",
        "temperature": 0.1
    });
    let mut out = String::new();
    out.push_str(&format!(
        "# Skill: {}\nSchema: antigrav.skill@v1\n\n```json\n{}\n```\n\n",
        skill_name,
        serde_json::to_string_pretty(&json_meta).unwrap_or_else(|_| "{}".to_string())
    ));
    out.push_str("## Overview\n");
    out.push_str(description);
    out.push_str("\n\n## When to Use\n");
    for item in when_to_use {
        out.push_str("- ");
        out.push_str(item.trim());
        out.push('\n');
    }
    out.push_str("\n## Examples\n");
    for item in examples {
        out.push_str("- ");
        out.push_str(item.trim());
        out.push('\n');
    }
    out.push_str("\n## Limitations\n");
    for item in limitations {
        out.push_str("- ");
        out.push_str(item.trim());
        out.push('\n');
    }
    out.push_str("\n## Imported Notes\n");
    out.push_str(&format!(
        "Imported from requested source `{}`; resolved source `{}`; path `{}`.\n",
        provenance.requested_source.trim(),
        provenance.resolved_source.trim(),
        provenance.source_path.trim()
    ));
    if let Some(commit) = provenance.source_commit.as_deref() {
        out.push_str(&format!("Pinned source commit: `{}`.\n", commit.trim()));
    }
    if let Some(license) = provenance.source_license.as_deref() {
        out.push_str(&format!("Detected source license: `{}`.\n", license.trim()));
    }
    let preview = summarize_text_for_import(&imported.body, 800);
    if !preview.is_empty() {
        out.push_str("\nOriginal excerpt:\n\n");
        out.push_str(preview.trim());
        out.push('\n');
    }
    out.push_str("\n{{input}}\n");
    out
}

fn split_frontmatter(markdown: &str) -> (Option<&str>, &str) {
    let mut lines = markdown.lines();
    if lines.next().map(str::trim) != Some("---") {
        return (None, markdown);
    }
    let mut cursor = 4usize;
    for line in markdown.lines().skip(1) {
        let line_len = line.len().saturating_add(1);
        if line.trim() == "---" {
            let fm = &markdown[4..cursor.saturating_sub(1)];
            let body = &markdown[cursor + line_len..];
            return (Some(fm), body);
        }
        cursor = cursor.saturating_add(line_len);
    }
    (None, markdown)
}

pub(super) fn parse_simple_yaml_map(frontmatter: &str) -> HashMap<String, String> {
    let mut map = HashMap::<String, String>::new();
    let mut pending_list_key = None::<String>;
    let mut pending_list_values = Vec::<String>::new();
    let flush_pending =
        |map: &mut HashMap<String, String>, key: &mut Option<String>, values: &mut Vec<String>| {
            if let Some(k) = key.take() {
                if !values.is_empty() {
                    map.insert(k, format!("[{}]", values.join(", ")));
                }
                values.clear();
            }
        };
    for line in frontmatter.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        if let Some(item) = trimmed.strip_prefix("- ") {
            if pending_list_key.is_some() {
                let value = item.trim().trim_matches('"').trim_matches('\'').to_string();
                if !value.is_empty() {
                    pending_list_values.push(value);
                }
                continue;
            }
        }
        if pending_list_key.is_some() {
            flush_pending(&mut map, &mut pending_list_key, &mut pending_list_values);
        }
        let Some((key, value)) = trimmed.split_once(':') else {
            continue;
        };
        let key = key.trim().to_ascii_lowercase();
        if key.is_empty() {
            continue;
        }
        let value = value.trim();
        if value.is_empty() {
            pending_list_key = Some(key);
            continue;
        }
        map.insert(key, value.trim_matches('"').trim_matches('\'').to_string());
    }
    flush_pending(&mut map, &mut pending_list_key, &mut pending_list_values);
    map
}

fn parse_frontmatter_list(raw: Option<&str>) -> Vec<String> {
    let Some(raw) = raw else {
        return Vec::new();
    };
    let trimmed = raw.trim().trim_start_matches('[').trim_end_matches(']');
    let mut values = trimmed
        .split(',')
        .map(|v| v.trim().trim_matches('"').trim_matches('\'').to_string())
        .filter(|v| !v.is_empty())
        .collect::<Vec<_>>();
    values.sort();
    values.dedup();
    values
}

fn normalize_risk_label(raw: Option<&str>) -> String {
    let normalized = raw.unwrap_or("unknown").trim().to_ascii_lowercase();
    match normalized.as_str() {
        "none" | "safe" | "critical" | "offensive" | "unknown" => normalized,
        _ => "unknown".to_string(),
    }
}

fn extract_first_paragraph(markdown: &str) -> Option<String> {
    let mut paragraph = Vec::<String>::new();
    for line in markdown.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            if !paragraph.is_empty() {
                break;
            }
            continue;
        }
        if trimmed.starts_with('#') {
            continue;
        }
        paragraph.push(trimmed.to_string());
    }
    if paragraph.is_empty() {
        return None;
    }
    Some(paragraph.join(" "))
}

fn extract_section_bullets(markdown: &str, section_names: &[&str]) -> Vec<String> {
    let mut in_section = false;
    let mut items = Vec::<String>::new();
    for line in markdown.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('#') {
            let heading = trimmed.trim_start_matches('#').trim().to_ascii_lowercase();
            in_section = section_names
                .iter()
                .any(|section| heading == section.to_ascii_lowercase());
            continue;
        }
        if !in_section {
            continue;
        }
        if let Some(item) = trimmed
            .strip_prefix("- ")
            .or_else(|| trimmed.strip_prefix("* "))
        {
            let item = item.trim();
            if !item.is_empty() {
                items.push(item.to_string());
            }
        }
    }
    items
}

fn extract_fenced_examples(markdown: &str) -> Vec<String> {
    let mut examples = Vec::<String>::new();
    let mut in_fence = false;
    let mut buffer = Vec::<String>::new();
    for line in markdown.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("```") {
            if in_fence {
                if !buffer.is_empty() {
                    examples.push(buffer.join("\n"));
                }
                buffer.clear();
                in_fence = false;
            } else {
                in_fence = true;
                buffer.clear();
            }
            continue;
        }
        if in_fence {
            buffer.push(line.to_string());
        }
    }
    if examples.is_empty() {
        if let Some(paragraph) = extract_first_paragraph(markdown) {
            examples.push(paragraph);
        }
    }
    examples.into_iter().take(3).collect()
}

fn summarize_text_for_import(markdown: &str, max_chars: usize) -> String {
    let compact = markdown.split_whitespace().collect::<Vec<_>>().join(" ");
    if compact.len() <= max_chars {
        return compact;
    }
    compact.chars().take(max_chars).collect::<String>()
}

fn truncate_chars(value: &str, max_chars: usize) -> String {
    let compact = value.split_whitespace().collect::<Vec<_>>().join(" ");
    if compact.chars().count() <= max_chars {
        return compact;
    }
    compact.chars().take(max_chars).collect::<String>()
}
