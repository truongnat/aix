use crate::engine::budget::ExecutionBudget;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::skill::capability::TrustTier;
use crate::workflow::loader::load_workflow;
use anyhow::{anyhow, Result};
use git2::Repository;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct AgentProjectLayout {
    pub project_root: String,
    pub agents_root: PathBuf,
    pub workflows_dir: PathBuf,
    pub skills_dir: PathBuf,
    pub roles_dir: PathBuf,
    pub rules_dir: PathBuf,
    pub templates_dir: PathBuf,
    pub memory_dir: PathBuf,
    pub loaded_workflows: HashMap<String, PathBuf>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectRuntimeRules {
    pub allowed_domains: Option<Vec<String>>,
    pub preferred_domains: Option<Vec<String>>,
    pub cross_domain_penalty: Option<u32>,
    pub disable_network: Option<bool>,
    pub read_only: Option<bool>,
    pub strict_mode: Option<bool>,
    pub external_mutation_penalty: Option<u32>,
    pub step_timeout_ms: Option<u64>,
    pub max_trust_tier: Option<String>,
    pub max_total_cost: Option<u32>,
    pub max_total_latency_ms: Option<u32>,
    pub max_steps: Option<usize>,
    pub max_cpu_ms: Option<u64>,
    pub max_wall_time_ms: Option<u64>,
    pub max_fs_reads: Option<u32>,
    pub max_fs_writes: Option<u32>,
    pub max_network_calls: Option<u32>,
    pub max_memory_mb: Option<u32>,
    pub run_script_timeout_ms: Option<u64>,
    pub run_script_allowed_commands: Option<Vec<String>>,
    pub run_script_denied_commands: Option<Vec<String>>,
    pub run_script_allow_shell_operators: Option<bool>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectBranchingRules {
    pub strategy: Option<String>,
    pub prefix: Option<String>,
    pub allow_auto_create: Option<bool>,
    pub allow_auto_checkout: Option<bool>,
    pub cleanup_after_merge: Option<bool>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectCodingRules {
    pub no_unused_imports: Option<bool>,
    pub require_tests_for_new_feature: Option<bool>,
    pub forbid_unrelated_file_changes: Option<bool>,
    pub require_memory_index_update: Option<bool>,
    pub require_structured_commit_message: Option<bool>,
    pub commit_format: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ProjectMergeRules {
    pub require_validation_before_merge: Option<bool>,
    pub analyze_conflicts: Option<bool>,
    pub auto_conflict_resolution_assist: Option<bool>,
    pub auto_conflict_resolution_strategy: Option<String>,
    pub auto_conflict_resolution_max_attempts: Option<u32>,
    pub delete_feature_branch_after_merge: Option<bool>,
    pub protected_branches: Option<Vec<String>>,
    pub require_rebase_before_merge: Option<bool>,
}

impl AgentProjectLayout {
    fn load_markdown_rule<T>(&self, filename: &str) -> Result<T>
    where
        T: DeserializeOwned + Default,
    {
        let rules_path = self.rules_dir.join(filename);
        if !rules_path.exists() {
            return Ok(T::default());
        }
        let content = fs::read_to_string(rules_path)?;
        let payload = extract_json_code_block(&content)
            .ok_or_else(|| anyhow!("Rule file '{}' must contain a JSON code block", filename))?;
        Ok(serde_json::from_str(&payload)?)
    }

    pub fn discover(project_root: &str) -> Result<Self> {
        let root = Path::new(project_root);
        if !root.exists() {
            return Err(anyhow!("Project root does not exist: {}", project_root));
        }

        let agents_root = root.join(".agents");
        let workflows_dir = agents_root.join("workflows");
        let skills_dir = agents_root.join("skills");
        let roles_dir = agents_root.join("roles");
        let rules_dir = agents_root.join("rules");
        let templates_dir = agents_root.join("templates");
        let memory_dir = agents_root.join("memory");

        let mut layout = Self {
            project_root: project_root.to_string(),
            agents_root,
            workflows_dir,
            skills_dir,
            roles_dir,
            rules_dir,
            templates_dir,
            memory_dir,
            loaded_workflows: HashMap::new(),
        };
        layout.ensure_layout()?;
        layout.reload_workflows()?;
        Ok(layout)
    }

    pub fn ensure_layout(&self) -> Result<()> {
        fs::create_dir_all(&self.agents_root)?;
        fs::create_dir_all(&self.workflows_dir)?;
        fs::create_dir_all(&self.skills_dir)?;
        fs::create_dir_all(&self.roles_dir)?;
        fs::create_dir_all(&self.rules_dir)?;
        fs::create_dir_all(&self.templates_dir)?;
        fs::create_dir_all(&self.memory_dir)?;
        Ok(())
    }

    pub fn reload_workflows(&mut self) -> Result<()> {
        let mut workflows = HashMap::new();
        if self.workflows_dir.exists() {
            let files = collect_markdown_files_recursive(&self.workflows_dir)?;
            let mut stem_to_ids = HashMap::<String, Vec<String>>::new();
            for path in files {
                let relative = path
                    .strip_prefix(&self.workflows_dir)
                    .map_err(|_| anyhow!("Workflow path '{}' escaped root", path.display()))?;
                let workflow_id = workflow_id_from_relative_path(relative)?;
                workflows.insert(workflow_id.clone(), path.clone());

                let stem = path
                    .file_stem()
                    .and_then(|name| name.to_str())
                    .ok_or_else(|| anyhow!("Invalid workflow filename"))?;
                stem_to_ids
                    .entry(stem.to_string())
                    .or_default()
                    .push(workflow_id);
            }

            // Backward compatibility: allow bare stem lookup when unique across tree.
            for (stem, ids) in stem_to_ids {
                if ids.len() != 1 || workflows.contains_key(&stem) {
                    continue;
                }
                if let Some(path) = workflows.get(&ids[0]).cloned() {
                    workflows.insert(stem, path);
                }
            }
        }
        self.loaded_workflows = workflows;
        Ok(())
    }

    pub fn validate_startup(&self) -> Result<()> {
        let root = Path::new(&self.project_root);
        if !root.exists() {
            return Err(anyhow!(
                "Project root does not exist at startup validation: {}",
                self.project_root
            ));
        }
        if !self.agents_root.starts_with(root) {
            return Err(anyhow!(
                "Agents root '{}' escapes project root '{}'",
                self.agents_root.display(),
                root.display()
            ));
        }

        for path in self.loaded_workflows.values() {
            let Some(path_str) = path.to_str() else {
                continue;
            };
            if let Err(err) = load_workflow(path_str) {
                eprintln!(
                    "Warning: skipping invalid workflow definition '{}': {}",
                    path.display(),
                    err
                );
            }
        }
        Ok(())
    }

    pub fn resolve_workflow_path(&self, workflow_ref: &str) -> Option<PathBuf> {
        let as_path = Path::new(workflow_ref);
        if as_path.exists() {
            return Some(as_path.to_path_buf());
        }
        self.loaded_workflows.get(workflow_ref).cloned()
    }

    pub fn list_workflow_definitions(&self) -> Result<Vec<(String, PathBuf)>> {
        let mut out = Vec::new();
        if !self.workflows_dir.exists() {
            return Ok(out);
        }
        let files = collect_markdown_files_recursive(&self.workflows_dir)?;
        for path in files {
            let relative = path
                .strip_prefix(&self.workflows_dir)
                .map_err(|_| anyhow!("Workflow path '{}' escaped root", path.display()))?;
            let workflow_id = workflow_id_from_relative_path(relative)?;
            out.push((workflow_id, path));
        }
        out.sort_by(|a, b| a.0.cmp(&b.0));
        Ok(out)
    }

    pub fn resolve_template_path(&self, template_ref: &str) -> Option<PathBuf> {
        resolve_markdown_resource_path(&self.templates_dir, template_ref)
    }

    pub fn load_runtime_rules(&self) -> Result<ProjectRuntimeRules> {
        self.load_markdown_rule("runtime.md")
    }

    pub fn load_branching_rules(&self) -> Result<ProjectBranchingRules> {
        self.load_markdown_rule("branching_rules.md")
    }

    pub fn load_coding_rules(&self) -> Result<ProjectCodingRules> {
        self.load_markdown_rule("coding_rules.md")
    }

    pub fn load_merge_rules(&self) -> Result<ProjectMergeRules> {
        self.load_markdown_rule("merge_rules.md")
    }
}

pub fn resolve_project_root_from(start_dir: &Path) -> Result<PathBuf> {
    if let Ok(repo) = Repository::discover(start_dir) {
        if let Some(workdir) = repo.workdir() {
            return Ok(workdir.to_path_buf());
        }
        if let Some(parent) = repo.path().parent() {
            return Ok(parent.to_path_buf());
        }
    }
    Ok(start_dir.to_path_buf())
}

fn extract_json_code_block(markdown: &str) -> Option<String> {
    let mut in_fence = false;
    let mut fence_lang = String::new();
    let mut body = String::new();

    for line in markdown.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("```") {
            if !in_fence {
                in_fence = true;
                fence_lang = rest.trim().to_ascii_lowercase();
                continue;
            }
            if fence_lang.is_empty() || fence_lang == "json" {
                let payload = body.trim();
                if !payload.is_empty() {
                    return Some(payload.to_string());
                }
            }
            in_fence = false;
            fence_lang.clear();
            body.clear();
            continue;
        }
        if in_fence {
            body.push_str(line);
            body.push('\n');
        }
    }
    None
}

fn workflow_id_from_relative_path(path: &Path) -> Result<String> {
    let mut base = path.to_path_buf();
    if base
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("md"))
        .unwrap_or(false)
    {
        base.set_extension("");
    }
    let id = base
        .iter()
        .map(|part| part.to_string_lossy().to_string())
        .collect::<Vec<_>>()
        .join("/");
    if id.trim().is_empty() {
        return Err(anyhow!("Invalid workflow filename"));
    }
    Ok(id)
}

fn collect_markdown_files_recursive(root: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
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

fn resource_id_from_relative_path(path: &Path) -> Result<String> {
    let mut base = path.to_path_buf();
    if base
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("md"))
        .unwrap_or(false)
    {
        base.set_extension("");
    }
    let id = base
        .iter()
        .map(|part| part.to_string_lossy().to_string())
        .collect::<Vec<_>>()
        .join("/");
    if id.trim().is_empty() {
        return Err(anyhow!("Invalid markdown resource filename"));
    }
    Ok(id)
}

fn resolve_markdown_resource_path(root: &Path, resource_ref: &str) -> Option<PathBuf> {
    let as_path = Path::new(resource_ref);
    if as_path.exists() {
        return Some(as_path.to_path_buf());
    }

    let direct = if resource_ref.to_ascii_lowercase().ends_with(".md") {
        root.join(resource_ref)
    } else {
        root.join(format!("{}.md", resource_ref))
    };
    if direct.exists() {
        return Some(direct);
    }

    let lookup = resource_ref.trim().trim_end_matches(".md");
    if lookup.is_empty() {
        return None;
    }
    let files = collect_markdown_files_recursive(root).ok()?;
    let mut stem_matches = Vec::new();
    for path in files {
        let relative = path.strip_prefix(root).ok()?;
        let resource_id = resource_id_from_relative_path(relative).ok()?;
        if resource_id == lookup {
            return Some(path);
        }
        let stem = path.file_stem().and_then(|name| name.to_str())?;
        if stem == lookup {
            stem_matches.push(path);
        }
    }
    if stem_matches.len() == 1 {
        stem_matches.into_iter().next()
    } else {
        None
    }
}

fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
    if !root.exists() {
        return Ok(());
    }
    let mut stack = vec![root.to_path_buf()];
    while let Some(current) = stack.pop() {
        let entries = match fs::read_dir(current) {
            Ok(e) => e,
            Err(_) => continue,
        };
        for entry in entries {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
                    if name == ".git" || name == "node_modules" || name == "target" {
                        continue;
                    }
                }
                stack.push(path);
                continue;
            }
            if path.is_file() {
                visit(&path);
            }
        }
    }
    Ok(())
}

fn parse_trust_tier(rule: Option<&str>, fallback: TrustTier) -> TrustTier {
    match rule {
        Some("Trusted") => TrustTier::Trusted,
        Some("Constrained") => TrustTier::Constrained,
        Some("Untrusted") => TrustTier::Untrusted,
        _ => fallback,
    }
}

impl ProjectRuntimeRules {
    pub fn apply_to(
        &self,
        budget: &mut ExecutionBudget,
        routing: &mut RoutingPolicy,
        security: &mut DomainSecurityPolicy,
    ) {
        if let Some(cost) = self.max_total_cost {
            budget.max_total_cost = budget.max_total_cost.min(cost);
        }
        if let Some(latency) = self.max_total_latency_ms {
            budget.max_total_latency_ms = budget.max_total_latency_ms.min(latency);
        }
        if let Some(steps) = self.max_steps {
            budget.max_steps = budget.max_steps.min(steps);
        }

        let rb = &mut budget.resource_budget;
        if let Some(v) = self.max_cpu_ms {
            rb.max_cpu_ms = rb.max_cpu_ms.min(v);
        }
        if let Some(v) = self.max_wall_time_ms {
            rb.max_wall_time_ms = rb.max_wall_time_ms.min(v);
        }
        if let Some(v) = self.max_fs_reads {
            rb.max_fs_reads = rb.max_fs_reads.min(v);
        }
        if let Some(v) = self.max_fs_writes {
            rb.max_fs_writes = rb.max_fs_writes.min(v);
        }
        if let Some(v) = self.max_network_calls {
            rb.max_network_calls = rb.max_network_calls.min(v);
        }
        if let Some(v) = self.max_memory_mb {
            rb.max_memory_mb = rb.max_memory_mb.min(v);
        }

        if let Some(allowed_domains) = self.allowed_domains.as_ref() {
            let allowed: HashSet<String> = allowed_domains.iter().cloned().collect();
            routing.allowed_domains = Some(match routing.allowed_domains.take() {
                Some(existing) => existing.intersection(&allowed).cloned().collect(),
                None => allowed,
            });
        }
        if let Some(preferred) = self.preferred_domains.as_ref() {
            routing.preferred_domains = preferred.clone();
        }
        if let Some(cross_penalty) = self.cross_domain_penalty {
            routing.cross_domain_penalty = routing.cross_domain_penalty.max(cross_penalty);
        }

        let mut override_permissions = security.max_allowed_permissions();
        if self.disable_network.unwrap_or(false) {
            override_permissions.allow_network = false;
        }
        if self.read_only.unwrap_or(false) {
            override_permissions.allow_fs_write = false;
        }
        security.override_permissions = Some(match security.override_permissions {
            Some(existing) => existing.intersection(&override_permissions),
            None => override_permissions,
        });
        if let Some(strict) = self.strict_mode {
            security.strict_mode = security.strict_mode || strict;
        }
        if let Some(penalty) = self.external_mutation_penalty {
            security.external_mutation_penalty = security.external_mutation_penalty.max(penalty);
        }
        if let Some(timeout_ms) = self.step_timeout_ms {
            security.step_timeout_ms = security.step_timeout_ms.min(timeout_ms);
        }
        if let Some(timeout_ms) = self.run_script_timeout_ms {
            security.step_timeout_ms = security.step_timeout_ms.min(timeout_ms);
        }
        let rule_tier = parse_trust_tier(self.max_trust_tier.as_deref(), security.max_trust_tier);
        security.max_trust_tier = security.max_trust_tier.min(rule_tier);
    }
}

#[cfg(test)]
mod tests {
    use super::{resolve_project_root_from, AgentProjectLayout, ProjectRuntimeRules};
    use crate::engine::budget::{ExecutionBudget, ResourceBudget};
    use crate::engine::routing::RoutingPolicy;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::skill::capability::TrustTier;
    use git2::Repository;

    #[test]
    fn rules_apply_with_restrictive_merge() {
        let mut budget = ExecutionBudget {
            max_total_cost: 1000,
            max_total_latency_ms: 5000,
            max_steps: 100,
            resource_budget: ResourceBudget::unbounded(),
        };
        let mut routing = RoutingPolicy::for_single_domain("demo");
        let mut security = DomainSecurityPolicy::default();

        let rules = ProjectRuntimeRules {
            max_total_cost: Some(50),
            max_memory_mb: Some(32),
            max_trust_tier: Some("Constrained".to_string()),
            disable_network: Some(true),
            run_script_timeout_ms: Some(2_000),
            ..ProjectRuntimeRules::default()
        };
        rules.apply_to(&mut budget, &mut routing, &mut security);

        assert_eq!(budget.max_total_cost, 50);
        assert_eq!(budget.resource_budget.max_memory_mb, 32);
        assert_eq!(security.max_trust_tier, TrustTier::Constrained);
        assert!(!security.max_allowed_permissions().allow_network);
        assert_eq!(security.step_timeout_ms, 2_000);
    }

    #[test]
    fn discover_initializes_standard_layout() {
        let unique = format!(
            "agentic-sdlc-layout-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root_path).expect("create temp root");
        let root = root_path.to_str().expect("tmp path");
        let layout = AgentProjectLayout::discover(root).expect("discover");
        assert!(layout.workflows_dir.exists());
        assert!(layout.skills_dir.exists());
        assert!(layout.roles_dir.exists());
        assert!(layout.rules_dir.exists());
        assert!(layout.templates_dir.exists());
        assert!(layout.memory_dir.exists());
        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn loads_non_runtime_rule_files() {
        let unique = format!(
            "agentic-sdlc-rules-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let rules_dir = root_path.join(".agents").join("rules");
        std::fs::create_dir_all(&rules_dir).expect("rules dir");
        std::fs::write(
            rules_dir.join("branching_rules.md"),
            r#"# Branching Rules

```json
{
  "prefix": "feat/",
  "allow_auto_create": false,
  "allow_auto_checkout": true
}
```
"#,
        )
        .expect("write branching rules");
        std::fs::write(
            rules_dir.join("coding_rules.md"),
            r#"# Coding Rules

```json
{
  "require_structured_commit_message": true
}
```
"#,
        )
        .expect("write coding rules");
        std::fs::write(
            rules_dir.join("merge_rules.md"),
            r#"# Merge Rules

```json
{
  "require_validation_before_merge": true,
  "delete_feature_branch_after_merge": true,
  "protected_branches": ["main", "master"],
  "require_rebase_before_merge": true
}
```
"#,
        )
        .expect("write merge rules");

        let layout = AgentProjectLayout::discover(root_path.to_str().expect("tmp path"))
            .expect("discover project");
        let branching = layout.load_branching_rules().expect("load branching");
        let coding = layout.load_coding_rules().expect("load coding");
        let merge = layout.load_merge_rules().expect("load merge");

        assert_eq!(branching.prefix.as_deref(), Some("feat/"));
        assert_eq!(coding.require_structured_commit_message, Some(true));
        assert_eq!(merge.require_validation_before_merge, Some(true));
        assert_eq!(
            merge.protected_branches,
            Some(vec!["main".to_string(), "master".to_string()])
        );
        assert_eq!(merge.require_rebase_before_merge, Some(true));

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn resolves_template_by_id_with_optional_extension() {
        let unique = format!(
            "agentic-sdlc-template-path-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let templates_dir = root_path.join(".agents").join("templates");
        std::fs::create_dir_all(&templates_dir).expect("templates dir");
        std::fs::write(
            templates_dir.join("feature_prompt.md"),
            "feature prompt body",
        )
        .expect("write template");

        let layout = AgentProjectLayout::discover(root_path.to_str().expect("tmp path"))
            .expect("discover project");

        assert_eq!(
            layout
                .resolve_template_path("feature_prompt")
                .expect("resolve by id")
                .file_name()
                .and_then(|v| v.to_str()),
            Some("feature_prompt.md")
        );
        assert_eq!(
            layout
                .resolve_template_path("feature_prompt.md")
                .expect("resolve by filename")
                .file_name()
                .and_then(|v| v.to_str()),
            Some("feature_prompt.md")
        );
        assert!(layout.resolve_template_path("missing_prompt").is_none());

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn resolves_template_from_nested_directory_with_unique_stem_alias() {
        let unique = format!(
            "agentic-sdlc-template-nested-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let nested_dir = root_path.join(".agents").join("templates").join("payments");
        std::fs::create_dir_all(&nested_dir).expect("templates dir");
        std::fs::write(nested_dir.join("feature_prompt.md"), "feature prompt body")
            .expect("write template");

        let layout = AgentProjectLayout::discover(root_path.to_str().expect("tmp path"))
            .expect("discover project");

        assert_eq!(
            layout
                .resolve_template_path("payments/feature_prompt")
                .expect("resolve by nested id")
                .strip_prefix(root_path.join(".agents").join("templates"))
                .expect("relative")
                .to_string_lossy()
                .replace('\\', "/"),
            "payments/feature_prompt.md"
        );
        assert_eq!(
            layout
                .resolve_template_path("feature_prompt")
                .expect("resolve by unique stem")
                .strip_prefix(root_path.join(".agents").join("templates"))
                .expect("relative")
                .to_string_lossy()
                .replace('\\', "/"),
            "payments/feature_prompt.md"
        );

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn reload_workflows_supports_recursive_ids_and_unique_stem_alias() {
        let unique = format!(
            "agentic-sdlc-workflow-recursive-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let nested = root_path
            .join(".agents")
            .join("workflows")
            .join("product")
            .join("signup");
        std::fs::create_dir_all(&nested).expect("create workflow tree");
        std::fs::write(
            nested.join("plan.md"),
            "# Workflow: plan\n## Step: s\nSkill: demo.echo\n",
        )
        .expect("write nested workflow");

        let layout = AgentProjectLayout::discover(root_path.to_str().expect("tmp path"))
            .expect("discover project");
        let nested_path = layout
            .resolve_workflow_path("product/signup/plan")
            .expect("resolve nested");
        assert_eq!(
            nested_path
                .strip_prefix(root_path.join(".agents").join("workflows"))
                .expect("relative")
                .to_string_lossy()
                .replace('\\', "/"),
            "product/signup/plan.md"
        );
        assert!(layout.resolve_workflow_path("plan").is_some());

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn reload_workflows_avoids_ambiguous_stem_aliases() {
        let unique = format!(
            "agentic-sdlc-workflow-ambiguous-stem-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let workflows_dir = root_path.join(".agents").join("workflows");
        let a_dir = workflows_dir.join("domain_a");
        let b_dir = workflows_dir.join("domain_b");
        std::fs::create_dir_all(&a_dir).expect("create a dir");
        std::fs::create_dir_all(&b_dir).expect("create b dir");

        let body = "# Workflow: plan\n## Step: s\nSkill: demo.echo\n";
        std::fs::write(a_dir.join("plan.md"), body).expect("write a");
        std::fs::write(b_dir.join("plan.md"), body).expect("write b");

        let layout = AgentProjectLayout::discover(root_path.to_str().expect("tmp path"))
            .expect("discover project");
        assert!(layout.resolve_workflow_path("domain_a/plan").is_some());
        assert!(layout.resolve_workflow_path("domain_b/plan").is_some());
        assert!(layout.resolve_workflow_path("plan").is_none());

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn resolve_project_root_from_returns_git_repo_root() {
        let unique = format!(
            "agentic-sdlc-git-root-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let nested = root_path.join("packages").join("feature");
        std::fs::create_dir_all(&nested).expect("nested dir");

        let repo = Repository::init(&root_path).expect("init repo");
        drop(repo);

        let resolved = resolve_project_root_from(&nested)
            .expect("resolve git root")
            .canonicalize()
            .expect("canonical resolved");
        let expected = root_path.canonicalize().expect("canonical root");
        assert_eq!(resolved, expected);

        let _ = std::fs::remove_dir_all(root_path);
    }

    #[test]
    fn resolve_project_root_from_falls_back_to_start_dir_outside_git() {
        let unique = format!(
            "agentic-sdlc-non-git-root-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root_path = std::env::temp_dir().join(unique);
        let nested = root_path.join("packages").join("feature");
        std::fs::create_dir_all(&nested).expect("nested dir");

        let resolved = resolve_project_root_from(&nested).expect("resolve fallback root");
        assert_eq!(resolved, nested);

        let _ = std::fs::remove_dir_all(root_path);
    }
}
