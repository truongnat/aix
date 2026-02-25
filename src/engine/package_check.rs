use crate::engine::project::AgentProjectLayout;
use crate::skills::loader::parse_skill_markdown;
use crate::workflow::loader::load_workflow;
use anyhow::Result;
use serde::Serialize;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize)]
pub struct PackageCheckIssue {
    pub path: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct PackageCheckReport {
    pub checked_files: usize,
    pub errors: Vec<PackageCheckIssue>,
    pub warnings: Vec<PackageCheckIssue>,
}

impl PackageCheckReport {
    pub fn ok(&self) -> bool {
        self.errors.is_empty()
    }

    fn error(&mut self, path: impl Into<String>, message: impl Into<String>) {
        self.errors.push(PackageCheckIssue {
            path: path.into(),
            message: message.into(),
        });
    }

    fn warning(&mut self, path: impl Into<String>, message: impl Into<String>) {
        self.warnings.push(PackageCheckIssue {
            path: path.into(),
            message: message.into(),
        });
    }
}

pub fn run_package_check(layout: &AgentProjectLayout) -> Result<PackageCheckReport> {
    let mut report = PackageCheckReport::default();
    check_workflows(layout, &mut report)?;
    check_rules(layout, &mut report)?;
    check_skills(layout, &mut report)?;
    Ok(report)
}

fn check_workflows(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut workflow_count = 0usize;
    for entry in fs::read_dir(&layout.workflows_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                workflow_count = workflow_count.saturating_add(1);
                report.checked_files = report.checked_files.saturating_add(1);
                let Some(path_str) = path.to_str() else {
                    report.error(
                        path.display().to_string(),
                        "Workflow path contains invalid UTF-8",
                    );
                    continue;
                };
                if let Err(err) = load_workflow(path_str) {
                    report.error(path.display().to_string(), err.to_string());
                }
            }
            ExtensionKind::Yaml => report.error(
                path.display().to_string(),
                "YAML files are not supported for workflows; convert to Markdown (.md)",
            ),
            ExtensionKind::Other => report.error(
                path.display().to_string(),
                "Unsupported workflow file extension; expected .md",
            ),
        }
    }
    if workflow_count == 0 {
        report.warning(
            layout.workflows_dir.display().to_string(),
            "No workflow files found under .agent/workflows",
        );
    }
    Ok(())
}

fn check_rules(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let required_files = HashSet::from([
        "runtime.md",
        "branching_rules.md",
        "coding_rules.md",
        "merge_rules.md",
    ]);

    for entry in fs::read_dir(&layout.rules_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default()
            .to_string();
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                if !required_files.contains(file_name.as_str()) {
                    report.warning(
                        path.display().to_string(),
                        "Unknown rule markdown file (ignored by runtime)",
                    );
                }
            }
            ExtensionKind::Yaml => report.error(
                path.display().to_string(),
                "YAML files are not supported for rules; convert to Markdown with JSON fenced block",
            ),
            ExtensionKind::Other => report.error(
                path.display().to_string(),
                "Unsupported rules file extension; expected .md",
            ),
        }
    }

    let runtime = layout.rules_dir.join("runtime.md");
    if !runtime.exists() {
        report.error(runtime.display().to_string(), "Missing required rule file");
    } else {
        report.checked_files = report.checked_files.saturating_add(1);
        if let Err(err) = layout.load_runtime_rules() {
            report.error(runtime.display().to_string(), err.to_string());
        }
    }

    let branching = layout.rules_dir.join("branching_rules.md");
    if !branching.exists() {
        report.error(
            branching.display().to_string(),
            "Missing required rule file",
        );
    } else {
        report.checked_files = report.checked_files.saturating_add(1);
        if let Err(err) = layout.load_branching_rules() {
            report.error(branching.display().to_string(), err.to_string());
        }
    }

    let coding = layout.rules_dir.join("coding_rules.md");
    if !coding.exists() {
        report.error(coding.display().to_string(), "Missing required rule file");
    } else {
        report.checked_files = report.checked_files.saturating_add(1);
        if let Err(err) = layout.load_coding_rules() {
            report.error(coding.display().to_string(), err.to_string());
        }
    }

    let merge = layout.rules_dir.join("merge_rules.md");
    if !merge.exists() {
        report.error(merge.display().to_string(), "Missing required rule file");
    } else {
        report.checked_files = report.checked_files.saturating_add(1);
        if let Err(err) = layout.load_merge_rules() {
            report.error(merge.display().to_string(), err.to_string());
        }
    }

    Ok(())
}

fn check_skills(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut skill_count = 0usize;
    for entry in fs::read_dir(&layout.skills_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                skill_count = skill_count.saturating_add(1);
                report.checked_files = report.checked_files.saturating_add(1);
                let content = match fs::read_to_string(&path) {
                    Ok(body) => body,
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                        continue;
                    }
                };
                if let Err(err) = parse_skill_markdown(&content) {
                    report.error(path.display().to_string(), err.to_string());
                }
            }
            ExtensionKind::Yaml => report.error(
                path.display().to_string(),
                "YAML files are not supported for skills; convert to Markdown with JSON metadata block",
            ),
            ExtensionKind::Other => report.error(
                path.display().to_string(),
                "Unsupported skill file extension; expected .md",
            ),
        }
    }
    if skill_count == 0 {
        report.warning(
            layout.skills_dir.display().to_string(),
            "No custom skills found under .agent/skills",
        );
    }
    Ok(())
}

enum ExtensionKind {
    Markdown,
    Yaml,
    Other,
}

fn extension_kind(path: &Path) -> ExtensionKind {
    match path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "md" => ExtensionKind::Markdown,
        "yaml" | "yml" => ExtensionKind::Yaml,
        _ => ExtensionKind::Other,
    }
}

#[cfg(test)]
mod tests {
    use super::run_package_check;
    use crate::engine::project::AgentProjectLayout;

    fn temp_root(prefix: &str) -> std::path::PathBuf {
        let unique = format!(
            "{}-{}",
            prefix,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        root
    }

    fn write_minimal_valid_package(root: &std::path::Path) {
        let workflows = root.join(".agent").join("workflows");
        let rules = root.join(".agent").join("rules");
        let skills = root.join(".agent").join("skills");
        std::fs::create_dir_all(&workflows).expect("workflows");
        std::fs::create_dir_all(&rules).expect("rules");
        std::fs::create_dir_all(&skills).expect("skills");

        std::fs::write(
            workflows.join("w.md"),
            "# Workflow: w\nDomain: demo\n\n## Step: s1\nSkill: demo.echo\nInput: hi\n",
        )
        .expect("workflow");

        std::fs::write(rules.join("runtime.md"), "# Runtime\n```json\n{}\n```\n").expect("runtime");
        std::fs::write(
            rules.join("branching_rules.md"),
            "# Branch\n```json\n{}\n```\n",
        )
        .expect("branching");
        std::fs::write(
            rules.join("coding_rules.md"),
            "# Coding\n```json\n{}\n```\n",
        )
        .expect("coding");
        std::fs::write(rules.join("merge_rules.md"), "# Merge\n```json\n{}\n```\n").expect("merge");

        std::fs::write(
            skills.join("s.md"),
            r#"# Skill: sample
```json
{"name":"sample","domain":"agent","executor":"ollama","model":"qwen3:8b"}
```
body
"#,
        )
        .expect("skill");
    }

    #[test]
    fn package_check_passes_for_valid_markdown_package() {
        let root = temp_root("agentic-sdlc-package-check-valid");
        write_minimal_valid_package(&root);

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.is_empty(), "{:?}", report.errors);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_rejects_yaml_workflow_file() {
        let root = temp_root("agentic-sdlc-package-check-yaml");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agent").join("workflows").join("legacy.yaml"),
            "id: legacy\nsteps: []\n",
        )
        .expect("yaml workflow");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("legacy.yaml")
                && issue
                    .message
                    .contains("YAML files are not supported for workflows")
        }));

        let _ = std::fs::remove_dir_all(root);
    }
}
