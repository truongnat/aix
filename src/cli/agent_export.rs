use super::*;
use std::fs;

/// Generate AI agent configuration files from `.agents/` package.
pub(crate) fn run_agent_export(
    project_layout: &AgentProjectLayout,
    target: &str,
    json: bool,
) -> Result<AgentExportReport> {
    let target = target.trim().to_ascii_lowercase();
    let project_root = project_layout
        .agents_root
        .parent()
        .ok_or_else(|| anyhow!("cannot determine project root"))?;

    let mut files_written = Vec::new();
    let karpathy_prompt = load_karpathy_system_prompt(project_layout);
    let system_contract = load_system_contract(project_layout);
    let rules_summary = load_rules_summary(project_layout);

    let targets = if target == "all" {
        vec!["claude", "cursor", "gemini"]
    } else {
        vec![target.as_str()]
    };

    for t in targets {
        match t {
            "claude" => {
                let path = project_root.join("CLAUDE.md");
                let content = build_claude_md(&karpathy_prompt, &system_contract, &rules_summary);
                fs::write(&path, content)?;
                files_written.push(path.display().to_string());
            }
            "cursor" => {
                let dir = project_root.join(".cursor").join("rules");
                fs::create_dir_all(&dir)?;
                let path = dir.join("karpathy-guidelines.mdc");
                let content = build_cursor_mdc(&karpathy_prompt, &rules_summary);
                fs::write(&path, content)?;
                files_written.push(path.display().to_string());
            }
            "gemini" => {
                let path = project_root.join("GEMINI.md");
                let content = build_gemini_md(&karpathy_prompt, &system_contract, &rules_summary);
                fs::write(&path, content)?;
                files_written.push(path.display().to_string());
            }
            other => return Err(anyhow!("Unknown target '{}'", other)),
        }
    }

    let report = AgentExportReport {
        target,
        files: files_written,
        karpathy_enabled: !karpathy_prompt.is_empty(),
    };

    if !json {
        println!("Exported {} to {} files.", report.target, report.files.len());
        for f in &report.files { println!("- {}", f); }
    }

    Ok(report)
}

fn load_karpathy_system_prompt(layout: &AgentProjectLayout) -> String {
    let path = layout.skills_dir.join("karpathy_discipline").join("SKILL.md");
    fs::read_to_string(path).ok().and_then(|c| {
        c.find("## System Prompt (Injected)")
            .map(|i| c[i + 27..].trim().to_string())
    }).unwrap_or_else(|| "Follow Karpathy principles: Think, Simplify, Surgical, Goal-driven.".to_string())
}

fn load_system_contract(layout: &AgentProjectLayout) -> String {
    fs::read_to_string(layout.agents_root.join("SYSTEM.md")).unwrap_or_default()
}

fn load_rules_summary(layout: &AgentProjectLayout) -> String {
    let mut out = String::new();
    if let Ok(entries) = fs::read_dir(&layout.rules_dir) {
        for e in entries.flatten() {
            if e.path().extension().is_some_and(|ex| ex == "md") {
                if let Ok(c) = fs::read_to_string(e.path()) {
                    out.push_str(&format!("### {}\n{}\n\n", e.file_name().to_string_lossy(), c.trim()));
                }
            }
        }
    }
    out
}

fn build_claude_md(karpathy: &str, contract: &str, rules: &str) -> String {
    format!("# CLAUDE.md\n\n## Discipline\n{}\n\n## Contract\n{}\n\n## Rules\n{}", karpathy, contract, rules)
}

fn build_cursor_mdc(karpathy: &str, rules: &str) -> String {
    format!("---\ndescription: Guidelines\nglobs: *\n---\n# Discipline\n{}\n\n# Rules\n{}", karpathy, rules)
}

fn build_gemini_md(karpathy: &str, contract: &str, rules: &str) -> String {
    format!("# GEMINI.md\n\n## Discipline\n{}\n\n## Contract\n{}\n\n## Rules\n{}", karpathy, contract, rules)
}
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn mock_layout(tmp: &std::path::Path) -> AgentProjectLayout {
        let agents_root = tmp.join(".agents");
        fs::create_dir_all(&agents_root).unwrap();
        AgentProjectLayout {
            project_root: tmp.display().to_string(),
            agents_root: agents_root.clone(),
            skills_dir: agents_root.join("skills"),
            workflows_dir: agents_root.join("workflows"),
            roles_dir: agents_root.join("roles"),
            rules_dir: agents_root.join("rules"),
            templates_dir: agents_root.join("templates"),
            memory_dir: agents_root.join("memory"),
            loaded_workflows: HashMap::new(),
        }
    }

    #[test]
    fn test_build_claude_md() {
        let res = build_claude_md("think", "contract", "rules");
        assert!(res.contains("# CLAUDE.md"));
        assert!(res.contains("think"));
    }

    #[test]
    fn test_run_agent_export_claude() {
        let tmp = tempdir().unwrap();
        let layout = mock_layout(tmp.path());
        let report = run_agent_export(&layout, "claude", true).unwrap();
        assert_eq!(report.target, "claude");
        assert!(tmp.path().join("CLAUDE.md").exists());
    }
}
