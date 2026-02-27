use crate::engine::package_schema::{validate_schema_header, PackageMarkdownKind};
use crate::engine::project::AgentProjectLayout;
use crate::skills::loader::parse_skill_markdown;
use crate::skills::role_loader::{parse_role_markdown, resolve_role_path};
use crate::workflow::loader::parse_markdown_content;
use anyhow::Result;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

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
    check_templates(layout, &mut report)?;
    Ok(report)
}

fn check_workflows(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut workflow_count = 0usize;
    for path in collect_files_recursive(&layout.workflows_dir)? {
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
    for path in collect_files_recursive(&layout.rules_dir)? {
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
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
    } else if let Err(err) = layout.load_runtime_rules() {
        report.error(runtime.display().to_string(), err.to_string());
    }

    let branching = layout.rules_dir.join("branching_rules.md");
    if !branching.exists() {
        report.error(
            branching.display().to_string(),
            "Missing required rule file",
        );
    } else if let Err(err) = layout.load_branching_rules() {
        report.error(branching.display().to_string(), err.to_string());
    }

    let coding = layout.rules_dir.join("coding_rules.md");
    if !coding.exists() {
        report.error(coding.display().to_string(), "Missing required rule file");
    } else if let Err(err) = layout.load_coding_rules() {
        report.error(coding.display().to_string(), err.to_string());
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
    } else if let Err(err) = layout.load_merge_rules() {
        report.error(merge.display().to_string(), err.to_string());
    }

    Ok(())
}

fn check_skills(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut skill_count = 0usize;
    for path in collect_files_recursive(&layout.skills_dir)? {
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                if !is_skill_entry_markdown(&path) {
                    continue;
                }
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
                match parse_skill_markdown(&content) {
                    Ok((meta, _body)) => {
                        if meta.executor.trim().eq_ignore_ascii_case("script") {
                            report.error(
                                path.display().to_string(),
                                "Skill executor 'script' is not allowed in markdown packages; use workflow step 'agent.run_script' with runtime command policy controls"
                                    .to_string(),
                            );
                        }
                    }
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                    }
                }
            }
            ExtensionKind::Yaml => {
                if is_skill_auxiliary_path(&path) {
                    continue;
                }
                report.error(
                    path.display().to_string(),
                    "YAML files are not supported for skill entries; use SKILL.md with frontmatter or JSON metadata block",
                );
            }
            ExtensionKind::Other => continue,
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
    for path in collect_files_recursive(&layout.roles_dir)? {
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

fn check_templates(layout: &AgentProjectLayout, report: &mut PackageCheckReport) -> Result<()> {
    let mut template_count = 0usize;
    for path in collect_files_recursive(&layout.templates_dir)? {
        match extension_kind(&path) {
            ExtensionKind::Markdown => {
                template_count = template_count.saturating_add(1);
                report.checked_files = report.checked_files.saturating_add(1);
                let content = match fs::read_to_string(&path) {
                    Ok(body) => body,
                    Err(err) => {
                        report.error(path.display().to_string(), err.to_string());
                        continue;
                    }
                };
                if content.trim().is_empty() {
                    report.error(
                        path.display().to_string(),
                        "Template markdown must not be empty".to_string(),
                    );
                }
            }
            ExtensionKind::Yaml => report.error(
                path.display().to_string(),
                "YAML files are not supported for templates; convert to Markdown (.md)",
            ),
            ExtensionKind::Other => report.error(
                path.display().to_string(),
                "Unsupported template file extension; expected .md",
            ),
        }
    }
    if template_count == 0 {
        report.warning(
            layout.templates_dir.display().to_string(),
            "No template files found under .agents/templates",
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

fn is_skill_auxiliary_path(path: &Path) -> bool {
    path.components()
        .filter_map(|component| component.as_os_str().to_str())
        .map(|value| value.to_ascii_lowercase())
        .any(|value| {
            matches!(
                value.as_str(),
                "references" | "scripts" | "assets" | "agents"
            )
        })
}

fn is_skill_entry_markdown(path: &Path) -> bool {
    let is_markdown = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("md"))
        .unwrap_or(false);
    if !is_markdown {
        return false;
    }
    let is_skill_md = path
        .file_name()
        .and_then(|v| v.to_str())
        .map(|v| v.eq_ignore_ascii_case("SKILL.md"))
        .unwrap_or(false);
    if is_skill_md {
        return true;
    }
    !is_skill_auxiliary_path(path)
}

fn collect_files_recursive(root: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
    walk_directory_files(root, &mut |path| files.push(path.to_path_buf()))?;
    files.sort();
    Ok(files)
}

fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
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
        let templates = root.join(".agents").join("templates");
        std::fs::create_dir_all(&workflows).expect("workflows");
        std::fs::create_dir_all(&rules).expect("rules");
        std::fs::create_dir_all(&skills).expect("skills");
        std::fs::create_dir_all(skills.join("sample")).expect("sample skill dir");
        std::fs::create_dir_all(&roles).expect("roles");
        std::fs::create_dir_all(&templates).expect("templates");

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
            skills.join("sample").join("SKILL.md"),
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

        std::fs::write(
            templates.join("feature_prompt.md"),
            "Role: Architect + Implementer\nTask:\n{{task}}\n",
        )
        .expect("template");
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

    #[test]
    fn package_check_rejects_script_executor_skill() {
        let root = temp_root("agentic-sdlc-package-check-script-executor");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agents").join("skills").join("scripted.md"),
            r#"# Skill: scripted
Schema: antigrav.skill@v1
```json
{"name":"scripted","domain":"agent","executor":"script","command":"cargo test"}
```
Runs shell command.
"#,
        )
        .expect("script skill");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("scripted.md")
                && issue.message.contains("executor 'script' is not allowed")
        }));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_scans_nested_workflow_and_skill_files() {
        let root = temp_root("agentic-sdlc-package-check-recursive");
        write_minimal_valid_package(&root);

        let nested_workflow_dir = root
            .join(".agents")
            .join("workflows")
            .join("domain")
            .join("api");
        std::fs::create_dir_all(&nested_workflow_dir).expect("nested workflow dir");
        std::fs::write(
            nested_workflow_dir.join("nested.md"),
            "---\ndescription: nested valid workflow\n---\n# Workflow: nested\nSchema: antigrav.workflow@v1\nDomain: demo\n\n## Step: s1\nSkill: agent.llm_subagent\nInput: architect:::nested plan\n",
        )
        .expect("nested workflow");

        let nested_skill_dir = root
            .join(".agents")
            .join("skills")
            .join("domain")
            .join("api")
            .join("nested_skill");
        std::fs::create_dir_all(&nested_skill_dir).expect("nested skill dir");
        std::fs::write(
            nested_skill_dir.join("SKILL.md"),
            r#"# Skill: nested_skill
Schema: antigrav.skill@v1
```json
{"name":"nested_skill","domain":"agent","executor":"ollama","model":"qwen3:8b"}
```
Nested skill body.
"#,
        )
        .expect("nested skill");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(
            report.errors.is_empty(),
            "expected no errors but got {:?}",
            report.errors
        );

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_ignores_skill_auxiliary_resources() {
        let root = temp_root("agentic-sdlc-package-check-skill-auxiliary");
        write_minimal_valid_package(&root);
        let skill_dir = root.join(".agents").join("skills").join("sample");
        std::fs::create_dir_all(skill_dir.join("references")).expect("references");
        std::fs::create_dir_all(skill_dir.join("agents")).expect("agents metadata");
        std::fs::write(
            skill_dir.join("references").join("details.md"),
            "# Details\nextra skill docs",
        )
        .expect("write refs");
        std::fs::write(
            skill_dir.join("agents").join("openai.yaml"),
            "display_name: Sample\nshort_description: sample\n",
        )
        .expect("write openai metadata");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(
            report.errors.is_empty(),
            "expected no errors but got {:?}",
            report.errors
        );

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_rejects_yaml_template_file() {
        let root = temp_root("agentic-sdlc-package-check-template-yaml");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agents").join("templates").join("legacy.yaml"),
            "name: legacy\nprompt: test\n",
        )
        .expect("yaml template");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("legacy.yaml")
                && issue
                    .message
                    .contains("YAML files are not supported for templates")
        }));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn package_check_rejects_empty_markdown_template() {
        let root = temp_root("agentic-sdlc-package-check-template-empty");
        write_minimal_valid_package(&root);
        std::fs::write(
            root.join(".agents").join("templates").join("empty.md"),
            "   \n",
        )
        .expect("empty template");

        let layout = AgentProjectLayout::discover(root.to_str().expect("path")).expect("layout");
        let report = run_package_check(&layout).expect("check");
        assert!(report.errors.iter().any(|issue| {
            issue.path.ends_with("empty.md")
                && issue
                    .message
                    .contains("Template markdown must not be empty")
        }));

        let _ = std::fs::remove_dir_all(root);
    }
}
