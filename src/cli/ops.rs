use super::*;
use rusqlite::params;

pub(super) fn run_workflow_doctor(
    layout: &AgentProjectLayout,
    strict_ollama: bool,
) -> Result<DoctorReport> {
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

pub(super) fn ensure_bootstrap_package(
    layout: &AgentProjectLayout,
) -> Result<Vec<std::path::PathBuf>> {
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

pub(super) fn is_command_available(command: &str) -> bool {
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

pub(super) fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
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

pub(super) fn build_graph_index(
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

pub(super) fn relative_unix_path(project_root: &Path, path: &Path) -> Result<String> {
    let relative = path
        .strip_prefix(project_root)
        .map_err(|_| anyhow!("path '{}' is outside project root", path.display()))?;
    Ok(relative.to_string_lossy().replace('\\', "/"))
}

pub(super) fn collect_markdown_resource_entries(
    dir: &std::path::Path,
) -> Result<Vec<MarkdownResourceEntry>> {
    let mut entries = Vec::new();
    walk_directory_files(dir, &mut |path| {
        let is_markdown = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("md"))
            .unwrap_or(false);
        if !is_markdown {
            return;
        }
        let Ok(relative) = path.strip_prefix(dir) else {
            return;
        };
        let mut id = relative.to_string_lossy().replace('\\', "/");
        if id.to_ascii_lowercase().ends_with(".md") {
            id.truncate(id.len().saturating_sub(3));
        }
        if id.trim().is_empty() {
            return;
        }
        entries.push(MarkdownResourceEntry {
            id,
            path: path.display().to_string(),
        });
    })?;
    entries.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(entries)
}

pub(super) fn print_markdown_resource_listing(
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
