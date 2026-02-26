use crate::engine::package_schema::{validate_schema_header, PackageMarkdownKind};
use crate::engine::project::AgentProjectLayout;
use crate::skills::loader::parse_skill_markdown;
use crate::skills::role_loader::{parse_role_markdown, resolve_role_path};
use crate::workflow::loader::parse_markdown_content;
use anyhow::Result;
use serde::Serialize;
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
    check_roles(layout, &mut report)?;
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
                let content = match fs::read_to_string(&path) {
                    Ok(body) => body,
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                        continue;
                    }
                };
                if let Err(err) = validate_required_description_frontmatter(&content) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
                }
                if let Err(err) = validate_schema_header(&content, PackageMarkdownKind::Workflow) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
                }
                match parse_markdown_content(&content) {
                    Ok(workflow) => {
                        check_workflow_role_references(layout, &path, &workflow, report);
                    }
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                    }
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
            "No workflow files found under .agents/workflows",
        );
    }
    Ok(())
}

fn check_workflow_role_references(
    layout: &AgentProjectLayout,
    workflow_path: &Path,
    workflow: &crate::workflow::model::Workflow,
    report: &mut PackageCheckReport,
) {
    for step in &workflow.steps {
        if !is_llm_subagent_skill(&step.skill) {
            continue;
        }
        let Some(role_ref) = extract_role_reference(&step.input) else {
            continue;
        };
        if resolve_role_path(&role_ref, &layout.roles_dir).is_none() {
            report.error(
                workflow_path.display().to_string(),
                format!(
                    "Step '{}' references missing role '{}'. Expected role markdown under .agents/roles",
                    step.id, role_ref
                ),
            );
        }
    }
}

fn is_llm_subagent_skill(skill_ref: &str) -> bool {
    let normalized = skill_ref.trim().to_ascii_lowercase();
    normalized == "llm_subagent" || normalized.ends_with(".llm_subagent")
}

fn extract_role_reference(input: &str) -> Option<String> {
    let (role_ref, _) = input.split_once(":::")?;
    let role_ref = role_ref.trim();
    if role_ref.is_empty() {
        return None;
    }
    Some(role_ref.to_string())
}

fn check_rules(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    for entry in fs::read_dir(&layout.rules_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                let content = match fs::read_to_string(&path) {
                    Ok(body) => body,
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                        continue;
                    }
                };
                if let Err(err) = validate_required_description_frontmatter(&content) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
                }
                if let Err(err) = validate_schema_header(&content, PackageMarkdownKind::Rule) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
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
        report.error(
            layout
                .rules_dir
                .join("merge_rules.md")
                .display()
                .to_string(),
            "Missing required rule file",
        );
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
                if let Err(err) = validate_schema_header(&content, PackageMarkdownKind::Skill) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
                }
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
            "No custom skills found under .agents/skills",
        );
    }
    Ok(())
}

fn check_roles(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut role_count = 0usize;
    for entry in fs::read_dir(&layout.roles_dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                role_count = role_count.saturating_add(1);
                report.checked_files = report.checked_files.saturating_add(1);
                let content = match fs::read_to_string(&path) {
                    Ok(body) => body,
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                        continue;
                    }
                };
                if let Err(err) = validate_schema_header(&content, PackageMarkdownKind::Role) {
                    report.error(path.display().to_string(), err.to_string());
                    continue;
                }
                let fallback_name = path.file_stem().and_then(|v| v.to_str());
                if let Err(err) = parse_role_markdown(&content, fallback_name) {
                    report.error(path.display().to_string(), err.to_string());
                }
            }
            ExtensionKind::Yaml => report.error(
                path.display().to_string(),
                "YAML files are not supported for roles; convert to Markdown",
            ),
            ExtensionKind::Other => report.error(
                path.display().to_string(),
                "Unsupported role file extension; expected .md",
            ),
        }
    }
    if role_count == 0 {
        report.warning(
            layout.roles_dir.display().to_string(),
            "No role files found under .agents/roles",
        );
    }
    Ok(())
}

enum ExtensionKind {
    Markdown,
    Yaml,
    Other,
}

fn validate_required_description_frontmatter(content: &str) -> Result<()> {
    let mut lines = content.lines();
    let Some(first) = lines.next() else {
        return Err(anyhow::anyhow!(
            "Missing frontmatter: expected leading '---' block with description"
        ));
    };
    if first.trim() != "---" {
        return Err(anyhow::anyhow!(
            "Missing frontmatter: expected leading '---' block with description"
        ));
    }
    let mut found_description = false;
    for line in lines {
        let trimmed = line.trim();
        if trimmed == "---" {
            break;
        }
        if let Some(value) = trimmed.strip_prefix("description:") {
            if !value.trim().is_empty() {
                found_description = true;
            }
        }
    }
    if !found_description {
        return Err(anyhow::anyhow!(
            "Frontmatter field 'description' is required and must be non-empty"
        ));
    }
    Ok(())
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
        let workflows = root.join(".agents").join("workflows");
        let rules = root.join(".agents").join("rules");
        let skills = root.join(".agents").join("skills");
        let roles = root.join(".agents").join("roles");
        std::fs::create_dir_all(&workflows).expect("workflows");
        std::fs::create_dir_all(&rules).expect("rules");
        std::fs::create_dir_all(&skills).expect("skills");
        std::fs::create_dir_all(&roles).expect("roles");

        std::fs::write(
            workflows.join("w.md"),
            "---\ndescription: minimal valid workflow\n---\n# Workflow: w\nSchema: antigrav.workflow@v1\nDomain: demo\n\n## Step: s1\nSkill: agent.llm_subagent\nInput: architect:::draft implementation plan\n",
        )
        .expect("workflow");

        std::fs::write(
            rules.join("runtime.md"),
            "---\ndescription: runtime rules\ntrigger: always_on\n---\n# Runtime\nSchema: antigrav.rule@v1\n```json\n{}\n```\n",
        )
        .expect("runtime");
        std::fs::write(
            rules.join("branching_rules.md"),
            "---\ndescription: branching rules\ntrigger: always_on\n---\n# Branch\nSchema: antigrav.rule@v1\n```json\n{}\n```\n",
        )
        .expect("branching");
        std::fs::write(
            rules.join("coding_rules.md"),
            "---\ndescription: coding rules\ntrigger: always_on\n---\n# Coding\nSchema: antigrav.rule@v1\n```json\n{}\n```\n",
        )
        .expect("coding");
        std::fs::write(
            rules.join("merge_rules.md"),
            "---\ndescription: merge rules\ntrigger: always_on\n---\n# Merge\nSchema: antigrav.rule@v1\n```json\n{}\n```\n",
        )
        .expect("merge");

        std::fs::write(
            skills.join("s.md"),
            r#"# Skill: sample
Schema: antigrav.skill@v1
```json
{"name":"sample","domain":"agent","executor":"ollama","model":"qwen3:8b"}
```
body
"#,
        )
        .expect("skill");

        std::fs::write(
            roles.join("architect.md"),
            r#"# Role: architect
Schema: antigrav.role@v1
```json
{"name":"architect","provider":"ollama","model":"qwen3:8b","temperature":0.1}
```
Create deterministic and minimal implementation plans.
"#,
        )
        .expect("role");
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
            root.join(".agents").join("workflows").join("legacy.yaml"),
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

    #[test]
    fn package_check_rejects_missing_role_reference_in_workflow() {
        let root = temp_root("agentic-sdlc-package-check-missing-role");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agents").join("workflows").join("missing_role.md"),
            "---\ndescription: workflow referencing missing role\n---\n# Workflow: missing-role\nSchema: antigrav.workflow@v1\nDomain: agent\n\n## Step: s1\nSkill: agent.llm_subagent\nInput: missing_role:::investigate bug\n",
        )
        .expect("workflow");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("missing_role.md")
                && issue
                    .message
                    .contains("references missing role 'missing_role'")
        }));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_rejects_missing_schema_header() {
        let root = temp_root("agentic-sdlc-package-check-missing-schema");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agents").join("skills").join("invalid.md"),
            r#"# Skill: invalid
```json
{"name":"invalid","domain":"agent","executor":"ollama","model":"qwen3:8b"}
```
body
"#,
        )
        .expect("invalid skill");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("invalid.md") && issue.message.contains("Missing schema header")
        }));

        let _ = std::fs::remove_dir_all(root);
    }
}
