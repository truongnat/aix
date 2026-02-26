use super::*;

fn push_skill_quality_error(
    report: &mut SkillQualityReport,
    findings: &mut Vec<SkillQualityFinding>,
    message: impl Into<String>,
) {
    report.errors = report.errors.saturating_add(1);
    findings.push(SkillQualityFinding {
        level: SkillQualityLevel::Error,
        message: message.into(),
    });
}

fn push_skill_quality_warning(
    report: &mut SkillQualityReport,
    findings: &mut Vec<SkillQualityFinding>,
    message: impl Into<String>,
) {
    if report.strict {
        report.errors = report.errors.saturating_add(1);
        findings.push(SkillQualityFinding {
            level: SkillQualityLevel::Error,
            message: format!("[strict] {}", message.into()),
        });
        return;
    }
    report.warnings = report.warnings.saturating_add(1);
    findings.push(SkillQualityFinding {
        level: SkillQualityLevel::Warning,
        message: message.into(),
    });
}

pub(super) fn run_skill_quality_check(
    layout: &AgentProjectLayout,
    strict: bool,
) -> Result<SkillQualityReport> {
    let skill_files = collect_markdown_paths_recursive(&layout.skills_dir)?;
    let mut report = SkillQualityReport {
        strict,
        checked_skills: 0,
        errors: 0,
        warnings: 0,
        entries: Vec::new(),
    };
    let valid_risks = ["none", "safe", "critical", "offensive", "unknown"];

    for path in skill_files {
        report.checked_skills = report.checked_skills.saturating_add(1);
        let id = to_resource_id(&layout.skills_dir, &path).unwrap_or_else(|| {
            path.file_stem()
                .and_then(|v| v.to_str())
                .unwrap_or("unknown")
                .to_string()
        });
        let path_display = path.display().to_string();
        let mut domain = "unknown".to_string();
        let mut skill_name = path
            .file_stem()
            .and_then(|v| v.to_str())
            .unwrap_or("unknown")
            .to_string();
        let mut risk = "unknown".to_string();
        let mut findings = Vec::<SkillQualityFinding>::new();

        let content = match fs::read_to_string(&path) {
            Ok(v) => v,
            Err(err) => {
                push_skill_quality_error(
                    &mut report,
                    &mut findings,
                    format!("Failed to read file: {}", err),
                );
                report.entries.push(SkillQualityEntry {
                    id,
                    path: path_display,
                    domain,
                    name: skill_name,
                    risk,
                    findings,
                });
                continue;
            }
        };

        if let Err(err) = validate_schema_header(&content, PackageMarkdownKind::Skill) {
            push_skill_quality_error(&mut report, &mut findings, err.to_string());
        }

        let parsed = match parse_skill_markdown(&content) {
            Ok(v) => Some(v),
            Err(err) => {
                push_skill_quality_error(
                    &mut report,
                    &mut findings,
                    format!("Invalid skill metadata: {}", err),
                );
                None
            }
        };

        if let Some((meta, body)) = parsed {
            domain = meta.domain.trim().to_string();
            skill_name = meta.name.trim().to_string();
            risk = meta
                .risk
                .clone()
                .unwrap_or_else(|| "unknown".to_string())
                .trim()
                .to_ascii_lowercase();
            let expected_name = path
                .file_stem()
                .and_then(|v| v.to_str())
                .unwrap_or_default();
            if skill_name != expected_name {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    format!(
                        "Skill name '{}' should match file stem '{}'",
                        skill_name, expected_name
                    ),
                );
            }

            let description = meta.description.clone().unwrap_or_default();
            if description.trim().is_empty() {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "Missing metadata.description",
                );
            } else if description.trim().chars().count() > 200 {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    format!(
                        "metadata.description is oversized ({} chars > 200)",
                        description.trim().chars().count()
                    ),
                );
            }

            if meta.source.as_deref().unwrap_or("").trim().is_empty() {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "Missing metadata.source (recommend URL or 'self')",
                );
            }

            let tags_count = meta.tags.as_ref().map(|v| v.len()).unwrap_or(0);
            if tags_count == 0 {
                push_skill_quality_warning(&mut report, &mut findings, "Missing metadata.tags");
            } else if tags_count < 3 {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "metadata.tags should include at least 3 entries for discoverability",
                );
            }

            if !valid_risks.contains(&risk.as_str()) {
                push_skill_quality_error(
                    &mut report,
                    &mut findings,
                    format!(
                        "Invalid metadata.risk '{}'; expected one of {:?}",
                        risk, valid_risks
                    ),
                );
            }
            let imported_skill =
                id.starts_with("imported/") || path_display.contains("/skills/imported/");
            if imported_skill {
                if meta
                    .source_commit
                    .as_deref()
                    .unwrap_or_default()
                    .trim()
                    .is_empty()
                {
                    push_skill_quality_warning(
                        &mut report,
                        &mut findings,
                        "Imported skill missing metadata.source_commit pin",
                    );
                }
                if meta
                    .source_path
                    .as_deref()
                    .unwrap_or_default()
                    .trim()
                    .is_empty()
                {
                    push_skill_quality_warning(
                        &mut report,
                        &mut findings,
                        "Imported skill missing metadata.source_path",
                    );
                }
                if meta
                    .source_license
                    .as_deref()
                    .unwrap_or_default()
                    .trim()
                    .is_empty()
                {
                    push_skill_quality_warning(
                        &mut report,
                        &mut findings,
                        "Imported skill missing metadata.source_license",
                    );
                }
            }

            if !has_skill_section(
                &body,
                &[
                    "when to use",
                    "when to use this skill",
                    "use this skill when",
                ],
            ) {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "Missing section heading like '## When to Use'",
                );
            }
            if !has_skill_section(&body, &["examples", "example"]) {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "Missing section heading like '## Examples'",
                );
            }
            if !has_skill_section(
                &body,
                &[
                    "limitations",
                    "common issues",
                    "common pitfalls",
                    "known limitations",
                ],
            ) {
                push_skill_quality_warning(
                    &mut report,
                    &mut findings,
                    "Missing section heading like '## Limitations'",
                );
            }

            if risk == "offensive" && !content.to_ascii_uppercase().contains("AUTHORIZED USE ONLY")
            {
                push_skill_quality_error(
                    &mut report,
                    &mut findings,
                    "Offensive skill requires explicit 'AUTHORIZED USE ONLY' disclaimer",
                );
            }

            let link_errors =
                find_dangling_markdown_links(&content, path.parent().unwrap_or(Path::new(".")))?;
            for broken in link_errors {
                push_skill_quality_error(
                    &mut report,
                    &mut findings,
                    format!("Dangling local markdown link '{}'", broken),
                );
            }
        }

        report.entries.push(SkillQualityEntry {
            id,
            path: path_display,
            domain,
            name: skill_name,
            risk,
            findings,
        });
    }
    report.entries.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(report)
}

fn find_dangling_markdown_links(markdown: &str, base_dir: &Path) -> Result<Vec<String>> {
    let re = Regex::new(r"\[[^\]]*\]\(([^)]+)\)")?;
    let mut broken = Vec::<String>::new();
    for capture in re.captures_iter(markdown) {
        let Some(matched) = capture.get(1) else {
            continue;
        };
        let link = matched.as_str().trim();
        if link.is_empty()
            || link.starts_with('#')
            || link.starts_with('<')
            || link.starts_with("http://")
            || link.starts_with("https://")
            || link.starts_with("mailto:")
            || link.starts_with("data:")
        {
            continue;
        }
        let base = link.split('#').next().unwrap_or_default();
        let base = base.split('?').next().unwrap_or_default().trim();
        if base.is_empty() || Path::new(base).is_absolute() {
            continue;
        }
        if !base_dir.join(base).exists() {
            broken.push(base.to_string());
        }
    }
    broken.sort();
    broken.dedup();
    Ok(broken)
}

fn has_skill_section(markdown: &str, candidates: &[&str]) -> bool {
    markdown.lines().any(|line| {
        let trimmed = line.trim();
        if !trimmed.starts_with('#') {
            return false;
        }
        let title = trimmed.trim_start_matches('#').trim().to_ascii_lowercase();
        candidates
            .iter()
            .any(|candidate| title == candidate.to_ascii_lowercase())
    })
}

pub(super) fn build_skill_workflow_catalog(
    layout: &AgentProjectLayout,
) -> Result<CatalogBuildReport> {
    let project_root = Path::new(&layout.project_root);
    let catalog_dir = layout.agents_root.join("catalog");
    fs::create_dir_all(&catalog_dir)?;

    let skill_entries = collect_skill_catalog_entries(layout)?;
    let workflow_entries = collect_workflow_catalog_entries(layout)?;
    let role_ids = collect_markdown_resource_ids(&layout.roles_dir)?;
    let template_ids = collect_markdown_resource_ids(&layout.templates_dir)?;
    let bundles = build_bundle_catalog(&skill_entries, &workflow_entries, &role_ids, &template_ids);
    let marketplace = build_marketplace_manifest(&bundles, &skill_entries);
    let lockfile = build_skills_lockfile(layout, &skill_entries)?;

    let skills_index_path = catalog_dir.join("skills_index.json");
    fs::write(
        &skills_index_path,
        serde_json::to_string_pretty(&skill_entries)?,
    )?;
    let workflows_path = catalog_dir.join("workflows.json");
    fs::write(
        &workflows_path,
        serde_json::to_string_pretty(&workflow_entries)?,
    )?;
    let bundles_path = catalog_dir.join("bundles.json");
    fs::write(&bundles_path, serde_json::to_string_pretty(&bundles)?)?;
    let marketplace_path = layout.agents_root.join("marketplace.json");
    fs::write(
        &marketplace_path,
        serde_json::to_string_pretty(&marketplace)?,
    )?;
    let lockfile_path = layout.agents_root.join("skills.lock.json");
    fs::write(&lockfile_path, serde_json::to_string_pretty(&lockfile)?)?;

    let outputs = vec![
        relative_unix_path(project_root, &skills_index_path)?,
        relative_unix_path(project_root, &workflows_path)?,
        relative_unix_path(project_root, &bundles_path)?,
        relative_unix_path(project_root, &marketplace_path)?,
        relative_unix_path(project_root, &lockfile_path)?,
    ];

    Ok(CatalogBuildReport {
        catalog_dir: relative_unix_path(project_root, &catalog_dir)?,
        outputs,
        skills: skill_entries.len(),
        workflows: workflow_entries.len(),
        bundles: bundles.len(),
    })
}

fn collect_skill_catalog_entries(layout: &AgentProjectLayout) -> Result<Vec<SkillCatalogEntry>> {
    let project_root = Path::new(&layout.project_root);
    let mut entries = Vec::<SkillCatalogEntry>::new();
    for path in collect_markdown_paths_recursive(&layout.skills_dir)? {
        let content = fs::read_to_string(&path)?;
        validate_schema_header(&content, PackageMarkdownKind::Skill)?;
        let (meta, _) = parse_skill_markdown(&content)?;
        let id = to_resource_id(&layout.skills_dir, &path).unwrap_or_else(|| meta.name.clone());
        entries.push(SkillCatalogEntry {
            id,
            path: relative_unix_path(project_root, &path)?,
            name: meta.name,
            domain: meta.domain,
            description: meta
                .description
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            risk: meta
                .risk
                .map(|v| v.trim().to_ascii_lowercase())
                .filter(|v| !v.is_empty()),
            source: meta
                .source
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            tags: meta.tags.unwrap_or_default(),
        });
    }
    entries.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(entries)
}

fn collect_workflow_catalog_entries(
    layout: &AgentProjectLayout,
) -> Result<Vec<WorkflowCatalogEntry>> {
    let project_root = Path::new(&layout.project_root);
    let mut entries = Vec::<WorkflowCatalogEntry>::new();
    for path in collect_markdown_paths_recursive(&layout.workflows_dir)? {
        let content = fs::read_to_string(&path)?;
        validate_schema_header(&content, PackageMarkdownKind::Workflow)?;
        let workflow = parse_markdown_content(&content)?;
        let id = to_resource_id(&layout.workflows_dir, &path)
            .unwrap_or_else(|| workflow.meta.name.clone());
        let mut unique_skills = workflow
            .steps
            .iter()
            .map(|step| step.skill.trim().to_string())
            .collect::<Vec<_>>();
        unique_skills.sort();
        unique_skills.dedup();
        let frontmatter = extract_frontmatter_map(&content);
        entries.push(WorkflowCatalogEntry {
            id,
            path: relative_unix_path(project_root, &path)?,
            name: workflow.meta.name,
            domain: workflow.meta.domain.map(|v| v.trim().to_string()),
            description: frontmatter
                .get("description")
                .map(|v| v.trim().to_string())
                .filter(|v| !v.is_empty()),
            steps: workflow.steps.len(),
            skills: unique_skills,
        });
    }
    entries.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(entries)
}

fn collect_markdown_resource_ids(root: &Path) -> Result<Vec<String>> {
    let mut ids = collect_markdown_paths_recursive(root)?
        .into_iter()
        .filter_map(|path| to_resource_id(root, &path))
        .collect::<Vec<_>>();
    ids.sort();
    ids.dedup();
    Ok(ids)
}

fn build_bundle_catalog(
    skills: &[SkillCatalogEntry],
    workflows: &[WorkflowCatalogEntry],
    roles: &[String],
    templates: &[String],
) -> Vec<BundleCatalogEntry> {
    let mut keys = HashSet::<String>::new();
    for id in skills.iter().map(|v| v.id.as_str()) {
        keys.insert(bundle_key_from_id(id));
    }
    for id in workflows.iter().map(|v| v.id.as_str()) {
        keys.insert(bundle_key_from_id(id));
    }
    for id in roles {
        keys.insert(bundle_key_from_id(id));
    }
    for id in templates {
        keys.insert(bundle_key_from_id(id));
    }
    if keys.is_empty() {
        keys.insert("core".to_string());
    }

    let mut sorted_keys = keys.into_iter().collect::<Vec<_>>();
    sorted_keys.sort();
    let mut bundles = Vec::<BundleCatalogEntry>::new();
    for key in sorted_keys {
        let mut bundle = BundleCatalogEntry {
            id: key.clone(),
            description: if key == "core" {
                "Core workflows and skills".to_string()
            } else {
                format!("Domain bundle for '{}'", key)
            },
            workflows: workflows
                .iter()
                .filter(|entry| bundle_key_from_id(&entry.id) == key)
                .map(|entry| entry.id.clone())
                .collect(),
            skills: skills
                .iter()
                .filter(|entry| bundle_key_from_id(&entry.id) == key)
                .map(|entry| entry.id.clone())
                .collect(),
            roles: roles
                .iter()
                .filter(|entry| bundle_key_from_id(entry) == key)
                .cloned()
                .collect(),
            templates: templates
                .iter()
                .filter(|entry| bundle_key_from_id(entry) == key)
                .cloned()
                .collect(),
        };
        bundle.workflows.sort();
        bundle.skills.sort();
        bundle.roles.sort();
        bundle.templates.sort();
        bundles.push(bundle);
    }
    bundles
}

fn build_marketplace_manifest(
    bundles: &[BundleCatalogEntry],
    skills: &[SkillCatalogEntry],
) -> MarketplaceManifest {
    let mut skill_path_by_id = HashMap::<String, String>::new();
    for entry in skills {
        skill_path_by_id.insert(entry.id.clone(), format!("./{}", entry.path));
    }
    let plugins = bundles
        .iter()
        .map(|bundle| MarketplacePlugin {
            name: bundle.id.clone(),
            description: bundle.description.clone(),
            source: "./".to_string(),
            strict: false,
            skills: bundle
                .skills
                .iter()
                .filter_map(|id| skill_path_by_id.get(id).cloned())
                .collect(),
        })
        .collect::<Vec<_>>();
    MarketplaceManifest {
        name: "agentic-sdlc-skillpacks".to_string(),
        owner: MarketplaceOwner {
            name: "agentic-sdlc".to_string(),
            email: "n/a".to_string(),
        },
        metadata: MarketplaceMetadata {
            description: "Curated skill bundles for domain-based solo developer workflows"
                .to_string(),
            version: "1.0.0".to_string(),
        },
        plugins,
    }
}

fn build_skills_lockfile(
    layout: &AgentProjectLayout,
    skills: &[SkillCatalogEntry],
) -> Result<SkillsLockfile> {
    let project_root = Path::new(&layout.project_root);
    let mut entries = Vec::<SkillLockEntry>::new();
    for skill in skills {
        let absolute = project_root.join(&skill.path);
        let bytes = fs::read(&absolute)?;
        let mut source = skill
            .source
            .clone()
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty());
        let mut source_requested = None::<String>;
        let mut source_commit = None::<String>;
        let mut source_path = None::<String>;
        let mut source_license = None::<String>;
        let mut imported_at_ms = None::<u64>;
        if let Ok(content) = fs::read_to_string(&absolute) {
            if let Ok((meta, _)) = parse_skill_markdown(&content) {
                source = meta
                    .source
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())
                    .or(source);
                source_requested = meta
                    .source_requested
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty());
                source_commit = meta
                    .source_commit
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty());
                source_path = meta
                    .source_path
                    .map(|v| v.trim().replace('\\', "/"))
                    .filter(|v| !v.is_empty());
                source_license = meta
                    .source_license
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())
                    .or(meta
                        .license
                        .map(|v| v.trim().to_string())
                        .filter(|v| !v.is_empty()));
                imported_at_ms = meta.imported_at_ms;
            }
        }
        entries.push(SkillLockEntry {
            id: skill.id.clone(),
            path: skill.path.clone(),
            bytes: bytes.len(),
            fingerprint: fnv1a64_hex(&bytes),
            source,
            source_requested,
            source_commit,
            source_path,
            source_license,
            imported_at_ms,
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

pub(super) fn build_import_lock_sources(entries: &[SkillLockEntry]) -> Vec<ImportLockSource> {
    let mut grouped = HashMap::<String, ImportLockSource>::new();
    for entry in entries {
        if !is_imported_lock_entry(entry) {
            continue;
        }
        let Some(source) = entry.source.clone().filter(|v| !v.trim().is_empty()) else {
            continue;
        };
        let key = format!(
            "{}|{}|{}",
            source,
            entry.source_commit.as_deref().unwrap_or_default(),
            entry.source_license.as_deref().unwrap_or_default()
        );
        let group = grouped.entry(key).or_insert_with(|| ImportLockSource {
            source: source.clone(),
            source_requested: entry.source_requested.clone(),
            source_commit: entry.source_commit.clone(),
            source_license: entry.source_license.clone(),
            skills: Vec::new(),
        });
        if !group.skills.iter().any(|id| id == &entry.id) {
            group.skills.push(entry.id.clone());
        }
    }
    let mut imports = grouped.into_values().collect::<Vec<_>>();
    for item in &mut imports {
        item.skills.sort();
        item.skills.dedup();
    }
    imports.sort_by(|a, b| a.source.cmp(&b.source));
    imports
}

pub(super) fn is_imported_lock_entry(entry: &SkillLockEntry) -> bool {
    entry.id.starts_with("imported/")
        || entry.path.contains("/skills/imported/")
        || entry.path.contains("\\skills\\imported\\")
}

fn bundle_key_from_id(id: &str) -> String {
    let trimmed = id.trim().trim_matches('/');
    if trimmed.is_empty() {
        return "core".to_string();
    }
    if let Some((head, _)) = trimmed.split_once('/') {
        if !head.trim().is_empty() {
            return head.trim().to_string();
        }
    }
    "core".to_string()
}

pub(super) fn to_resource_id(base_dir: &Path, path: &Path) -> Option<String> {
    let relative = path.strip_prefix(base_dir).ok()?;
    let mut id = relative.to_string_lossy().replace('\\', "/");
    if id.to_ascii_lowercase().ends_with(".md") {
        id.truncate(id.len().saturating_sub(3));
    }
    if id.trim().is_empty() {
        return None;
    }
    Some(id)
}

pub(super) fn collect_markdown_paths_recursive(root: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::<PathBuf>::new();
    walk_directory_files(root, &mut |path| {
        let is_markdown = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("md"))
            .unwrap_or(false);
        if is_markdown {
            files.push(path.to_path_buf());
        }
    })?;
    files.sort();
    Ok(files)
}

pub(super) fn extract_frontmatter_map(markdown: &str) -> HashMap<String, String> {
    let mut map = HashMap::<String, String>::new();
    let mut lines = markdown.lines();
    if lines.next().map(str::trim) != Some("---") {
        return map;
    }
    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            break;
        }
        let Some((key, value)) = trimmed.split_once(':') else {
            continue;
        };
        let key = key.trim();
        let value = value.trim();
        if key.is_empty() || value.is_empty() {
            continue;
        }
        map.insert(key.to_string(), value.to_string());
    }
    map
}
