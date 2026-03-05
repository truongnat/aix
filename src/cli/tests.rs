use super::{
    apply_role_override_to_input, bind_role_to_workflow_llm_steps, build_graph_index,
    build_routing_policy, build_skill_workflow_catalog, build_thread_flow_workflow,
    collect_markdown_resource_entries, ensure_bootstrap_package, import_skills_from_source,
    infer_workflow_ref_from_template, install_bundle_from_catalog, merge_template_input,
    normalize_auto_conflict_strategy, parse_external_skill_markdown, parse_package_scaffold_kind,
    parse_role_override_map, parse_scaffold_profile, parse_simple_yaml_map,
    parse_skillpack_install_mode, read_bundle_catalog, read_skills_lockfile,
    resolve_bootstrap_strict_ollama, resolve_role_workflow_selection, run_skill_quality_check,
    sanitize_package_name, scaffold_domain_pack, scaffold_markdown_package,
    select_template_and_workflow_for_message, validate_git_ref_like, verify_skills_lock,
    ImportSkillpackOptions, RoleRunRequest, ScaffoldProfile, SkillpackInstallMode,
    ThreadFlowRequest,
};
use crate::engine::budget::ExecutionBudget;
use crate::engine::context::ExecutionContext;
use crate::engine::package_check::run_package_check;
use crate::engine::package_schema::PackageMarkdownKind;
use crate::engine::project::AgentProjectLayout;
use crate::engine::registry::DomainRegistry;
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::engine::thread_session_store::ThreadSessionStore;
use crate::engine::workflow_engine::{ExecutionEngine, WorkflowInstanceStatus};
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use crate::skills::echo::EchoSkill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde_json::json;
use std::collections::HashMap;
use std::path::Path;
use std::process::Command as ProcessCommand;
use std::sync::{Arc, Mutex};

#[derive(Debug, Default)]
struct MockConflictState {
    conflicts_remaining: bool,
    llm_calls: u32,
    auto_resolve_calls: u32,
    merge_calls: u32,
}

#[derive(Debug, Clone)]
struct MockEnsureBranchSkill;

#[derive(Debug, Clone)]
struct MockRunScriptSkill;

#[derive(Debug, Clone)]
struct MockGitMergeBranchSkill {
    state: Arc<Mutex<MockConflictState>>,
}

#[derive(Debug, Clone)]
struct MockAnalyzeConflictsSkill {
    state: Arc<Mutex<MockConflictState>>,
}

#[derive(Debug, Clone)]
struct MockAutoResolveConflictsSkill {
    state: Arc<Mutex<MockConflictState>>,
}

#[derive(Debug, Clone)]
struct MockHasConflictsSkill;

#[derive(Debug, Clone)]
struct MockConflictGateSkill;

#[derive(Debug, Clone)]
struct MockLlmSubAgentSkill {
    state: Arc<Mutex<MockConflictState>>,
}

fn parse_conflict_bool(input: &SkillInput) -> bool {
    match input {
        SkillInput::Boolean(value) => *value,
        SkillInput::Json(value) => {
            if let Some(count) = value.get("count").and_then(|v| v.as_u64()) {
                return count > 0;
            }
            value
                .get("conflicts")
                .and_then(|v| v.as_array())
                .map(|v| !v.is_empty())
                .unwrap_or(false)
        }
        SkillInput::Text(text) => {
            matches!(text.trim().to_ascii_lowercase().as_str(), "true" | "1")
        }
        SkillInput::Number(value) => *value > 0.0,
    }
}

#[async_trait]
impl Skill for MockEnsureBranchSkill {
    fn name(&self) -> &str {
        "ensure_branch"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock ensure branch",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let thread_id = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("default-thread");
        Ok(SkillOutput::json(json!({
            "status": "ok",
            "thread_id": thread_id,
            "branch": format!("thread/{}", thread_id),
        })))
    }
}

#[async_trait]
impl Skill for MockRunScriptSkill {
    fn name(&self) -> &str {
        "run_script"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock run script",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        Ok(SkillOutput::json(json!({
            "status": "ok",
            "command": input.as_text().unwrap_or_default(),
        })))
    }
}

#[async_trait]
impl Skill for MockGitMergeBranchSkill {
    fn name(&self) -> &str {
        "git_merge_branch"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock merge that introduces conflicts",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        let mut state = self.state.lock().expect("lock");
        state.merge_calls = state.merge_calls.saturating_add(1);
        state.conflicts_remaining = true;
        Ok(SkillOutput::json(json!({
            "status": "conflict",
            "requires_conflict_analysis": true,
        })))
    }
}

#[async_trait]
impl Skill for MockAnalyzeConflictsSkill {
    fn name(&self) -> &str {
        "analyze_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock analyze conflicts",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        let state = self.state.lock().expect("lock");
        let conflicts = if state.conflicts_remaining {
            vec!["src/lib.rs"]
        } else {
            Vec::<&str>::new()
        };
        Ok(SkillOutput::json(json!({
            "conflicts": conflicts,
            "count": conflicts.len(),
        })))
    }
}

#[async_trait]
impl Skill for MockAutoResolveConflictsSkill {
    fn name(&self) -> &str {
        "auto_resolve_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock auto resolver",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        let mut state = self.state.lock().expect("lock");
        state.auto_resolve_calls = state.auto_resolve_calls.saturating_add(1);
        state.conflicts_remaining = false;
        Ok(SkillOutput::json(json!({
            "status": "resolved",
            "remaining_count": 0,
        })))
    }
}

#[async_trait]
impl Skill for MockHasConflictsSkill {
    fn name(&self) -> &str {
        "has_conflicts"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock has conflicts",
            SkillIOType::Json,
            SkillIOType::Boolean,
            CapabilityPermissions::all(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        Ok(SkillOutput::boolean(parse_conflict_bool(&input)))
    }
}

#[async_trait]
impl Skill for MockConflictGateSkill {
    fn name(&self) -> &str {
        "conflict_gate"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock conflict gate",
            SkillIOType::Boolean,
            SkillIOType::Boolean,
            CapabilityPermissions::all(),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        if parse_conflict_bool(&input) {
            return Err(anyhow!("conflicts still present"));
        }
        Ok(SkillOutput::boolean(false))
    }
}

#[async_trait]
impl Skill for MockLlmSubAgentSkill {
    fn name(&self) -> &str {
        "llm_subagent"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "mock llm",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::all(),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(
        &self,
        _input: SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<SkillOutput> {
        let mut state = self.state.lock().expect("lock");
        state.llm_calls = state.llm_calls.saturating_add(1);
        Ok(SkillOutput::json(json!({
            "schema": "llm_router.v1",
            "summary": "manual resolution plan",
        })))
    }
}

#[test]
fn infers_workflow_id_from_prompt_template_name() {
    assert_eq!(
        infer_workflow_ref_from_template("feature_prompt"),
        "feature".to_string()
    );
    assert_eq!(
        infer_workflow_ref_from_template("review-prompt.md"),
        "review".to_string()
    );
    assert_eq!(
        infer_workflow_ref_from_template("/tmp/custom.md"),
        "custom".to_string()
    );
    assert_eq!(
        infer_workflow_ref_from_template("payments/feature_prompt.md"),
        "payments/feature".to_string()
    );
}

#[test]
fn merges_template_into_role_prefixed_input() {
    let merged = merge_template_input(
        "architect:::Create a deterministic implementation plan.",
        "Role: Architect\nObjective: Build feature",
        "Add email validation to signup flow",
    );
    assert!(merged.starts_with("architect:::"));
    assert!(merged.contains("Template Prompt:\nRole: Architect"));
    assert!(merged.contains("Task:\nAdd email validation to signup flow"));
}

#[test]
fn routing_policy_defaults_to_preferred_without_restricting_allowed_domains() {
    let policy = build_routing_policy("demo", None, None, 0, None).expect("build routing policy");
    assert!(policy.allowed_domains.is_none());
    assert_eq!(policy.preferred_domains, vec!["demo".to_string()]);
}

#[test]
fn chat_thread_intent_selection_maps_to_template_and_workflow() {
    assert_eq!(
        select_template_and_workflow_for_message("please review this change"),
        ("review_prompt".to_string(), "review".to_string())
    );
    assert_eq!(
        select_template_and_workflow_for_message("fix panic in auth flow"),
        ("bugfix_prompt".to_string(), "bugfix".to_string())
    );
    assert_eq!(
        select_template_and_workflow_for_message("prepare release changelog and tag"),
        ("release_prompt".to_string(), "release".to_string())
    );
    assert_eq!(
        select_template_and_workflow_for_message("implement feature X"),
        ("feature_prompt".to_string(), "feature".to_string())
    );
}

#[test]
fn bind_role_rewrites_all_llm_step_role_prefixes() {
    let mut workflow = crate::workflow::model::Workflow {
        meta: crate::workflow::model::WorkflowMeta {
            name: "role-bind".to_string(),
            domain: Some("agent".to_string()),
            goal: None,
            target_type: None,
            routing_policy: None,
            security_policy: None,
            resource_budget: None,
            projected_cost: None,
            projected_latency_ms: None,
            projected_steps: None,
        },
        steps: vec![
            crate::workflow::model::WorkflowStep::new(
                "s1",
                "agent.llm_subagent",
                "architect:::draft plan",
            ),
            crate::workflow::model::WorkflowStep::new(
                "s2",
                "agent.llm_subagent",
                "implement patch",
            ),
            crate::workflow::model::WorkflowStep::new("s3", "demo.echo", "noop"),
        ],
    };
    let bound = bind_role_to_workflow_llm_steps(&mut workflow, "reviewer").expect("bind role");
    assert_eq!(bound, 2);
    assert_eq!(workflow.steps[0].input, "reviewer:::draft plan");
    assert_eq!(workflow.steps[1].input, "reviewer:::implement patch");
    assert_eq!(workflow.steps[2].input, "noop");
}

#[test]
fn resolve_role_workflow_selection_applies_role_and_template() {
    let unique = format!(
        "agentic-sdlc-cli-role-launch-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    let workflows = root.join(".agents/workflows");
    let templates = root.join(".agents/templates");
    let roles = root.join(".agents/roles");
    std::fs::create_dir_all(&workflows).expect("workflows");
    std::fs::create_dir_all(&templates).expect("templates");
    std::fs::create_dir_all(&roles).expect("roles");
    std::fs::write(
            workflows.join("feature.md"),
            "# Workflow: feature\nSchema: antigrav.workflow@v1\nDomain: agent\n\n## Step: plan\nSkill: agent.llm_subagent\nInput: planner:::draft plan\n",
        )
        .expect("workflow");
    std::fs::write(
        templates.join("feature_prompt.md"),
        "Role: Architect\nObjective: build feature",
    )
    .expect("template");
    std::fs::write(
            roles.join("architect.md"),
            "# Role: architect\nSchema: antigrav.role@v1\n```json\n{\"name\":\"architect\"}\n```\nPlan deterministic implementation.",
        )
        .expect("role");

    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover");
    let request = RoleRunRequest {
        role: "architect".to_string(),
        task: "add email validation".to_string(),
        workflow_id: Some("feature".to_string()),
        template: Some("feature_prompt".to_string()),
        thread_id: None,
        json: false,
    };
    let (workflow, _, template, workflow_id, role) =
        resolve_role_workflow_selection(&layout, &request).expect("resolve");
    assert_eq!(template, "feature_prompt");
    assert_eq!(workflow_id, "feature");
    assert_eq!(role, "architect");
    assert!(workflow.steps[0].input.starts_with("architect:::"));
    assert!(workflow.steps[0].input.contains("Template Prompt:"));
    assert!(workflow.steps[0]
        .input
        .contains("Task:\nadd email validation"));

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn collects_markdown_resource_entries_sorted_and_filtered() {
    let unique = format!(
        "agentic-sdlc-cli-resource-list-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp root");
    std::fs::write(root.join("b.md"), "b").expect("write b");
    std::fs::write(root.join("a.md"), "a").expect("write a");
    std::fs::write(root.join("ignore.txt"), "x").expect("write txt");

    let entries = collect_markdown_resource_entries(&root).expect("collect entries");
    let ids = entries
        .into_iter()
        .map(|entry| entry.id)
        .collect::<Vec<_>>();
    assert_eq!(ids, vec!["a".to_string(), "b".to_string()]);

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn parses_role_override_map_from_csv_pairs() {
    let parsed = parse_role_override_map(Some("architect=planner, implementer=debugger"))
        .expect("parse role override map");
    assert_eq!(parsed.get("architect").map(String::as_str), Some("planner"));
    assert_eq!(
        parsed.get("implementer").map(String::as_str),
        Some("debugger")
    );
}

#[test]
fn applies_role_override_to_prefixed_input() {
    let mut overrides = HashMap::new();
    overrides.insert("architect".to_string(), "planner".to_string());
    let updated =
        apply_role_override_to_input("architect:::Create implementation plan", &overrides)
            .expect("override applied");
    assert_eq!(updated, "planner:::Create implementation plan");
}

#[test]
fn git_ref_like_validation_rejects_unsafe_values() {
    assert!(validate_git_ref_like("branch", "main").is_ok());
    assert!(validate_git_ref_like("branch", "release/v1.0.0").is_ok());
    assert!(validate_git_ref_like("branch", "bad branch").is_err());
    assert!(validate_git_ref_like("branch", "../oops").is_err());
}

#[test]
fn skillpack_install_mode_parser_supports_local_and_global() {
    assert_eq!(
        parse_skillpack_install_mode("local").expect("local"),
        SkillpackInstallMode::Local
    );
    assert_eq!(
        parse_skillpack_install_mode("global").expect("global"),
        SkillpackInstallMode::Global
    );
    assert!(parse_skillpack_install_mode("invalid").is_err());
}

#[test]
fn thread_flow_builder_includes_auto_resolve_and_finalize() {
    let unique = format!(
        "agentic-sdlc-cli-thread-flow-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    let request = ThreadFlowRequest {
        thread_id: "feature-auth".to_string(),
        target_branch: "main".to_string(),
        validate_command: "cargo test".to_string(),
        json: false,
    };
    let workflow = build_thread_flow_workflow(&layout, &request).expect("build workflow");

    let ids = workflow
        .steps
        .iter()
        .map(|step| step.id.as_str())
        .collect::<Vec<_>>();
    assert!(ids.contains(&"auto_resolve_conflicts"));
    assert!(ids.contains(&"recheck_conflicts"));
    assert!(ids.contains(&"has_conflicts_after_auto_resolve"));
    assert!(ids.contains(&"conflict_gate"));
    assert!(ids.contains(&"post_merge_validation"));
    assert_eq!(
        workflow.steps.last().map(|s| s.id.as_str()),
        Some("finalize_thread_flow")
    );

    let post_merge = workflow
        .steps
        .iter()
        .find(|step| step.id == "post_merge_validation")
        .expect("post merge validation step");
    assert_eq!(post_merge.condition, None);
    assert_eq!(post_merge.depends_on, vec!["conflict_gate".to_string()]);

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn auto_conflict_strategy_defaults_to_ours() {
    assert_eq!(normalize_auto_conflict_strategy(Some("theirs")), "theirs");
    assert_eq!(normalize_auto_conflict_strategy(Some("unknown")), "ours");
    assert_eq!(normalize_auto_conflict_strategy(None), "ours");
}

#[test]
fn scaffold_generates_markdown_with_schema_header() {
    let unique = format!(
        "agentic-sdlc-cli-scaffold-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    assert_eq!(
        parse_package_scaffold_kind("workflows").expect("kind"),
        PackageMarkdownKind::Workflow
    );
    assert_eq!(
        sanitize_package_name("My Feature").expect("sanitize"),
        "my-feature".to_string()
    );
    assert_eq!(
        parse_scaffold_profile("advanced").expect("profile"),
        ScaffoldProfile::Advanced
    );
    assert_eq!(
        parse_scaffold_profile("basic").expect("profile"),
        ScaffoldProfile::Basic
    );

    let path = scaffold_markdown_package(
        &layout,
        "workflow",
        "My Feature",
        ScaffoldProfile::Advanced,
        false,
    )
    .expect("scaffold");
    let body = std::fs::read_to_string(&path).expect("read scaffolded file");
    assert!(body.contains("Schema: antigrav.workflow@v1"));
    assert!(body.contains("validation_gate"));

    let duplicate = scaffold_markdown_package(
        &layout,
        "workflow",
        "my-feature",
        ScaffoldProfile::Advanced,
        false,
    );
    assert!(duplicate.is_err());

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn scaffold_domain_pack_generates_advanced_assets() {
    let unique = format!(
        "agentic-sdlc-cli-domain-pack-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    let created = scaffold_domain_pack(&layout, "payments", false).expect("domain pack");
    assert_eq!(created.len(), 16);
    assert!(layout
        .workflows_dir
        .join("payments")
        .join("feature.md")
        .exists());
    assert!(layout
        .templates_dir
        .join("payments")
        .join("feature_prompt.md")
        .exists());
    assert!(layout
        .roles_dir
        .join("payments")
        .join("architect.md")
        .exists());
    assert!(layout
        .skills_dir
        .join("payments")
        .join("impact_analyzer")
        .join("SKILL.md")
        .exists());

    let _ = ensure_bootstrap_package(&layout).expect("bootstrap package");
    let report = run_package_check(&layout).expect("package check");
    assert!(
        report.errors.is_empty(),
        "expected no package errors, got {:?}",
        report.errors
    );

    let duplicate = scaffold_domain_pack(&layout, "payments", false);
    assert!(duplicate.is_err());

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn quality_check_reports_missing_skill_sections() {
    let unique = format!(
        "agentic-sdlc-cli-skill-quality-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(root.join(".agents").join("skills")).expect("skills dir");
    std::fs::write(
            root.join(".agents").join("skills").join("minimal.md"),
            "# Skill: minimal\nSchema: antigrav.skill@v1\n```json\n{\"name\":\"minimal\",\"domain\":\"agent\",\"executor\":\"ollama\",\"model\":\"qwen3:8b\"}\n```\nminimal body\n",
        )
        .expect("write skill");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");

    let report = run_skill_quality_check(&layout, false).expect("quality report");
    assert_eq!(report.checked_skills, 1);
    assert_eq!(report.errors, 0);
    assert!(report.warnings >= 3);

    let strict_report = run_skill_quality_check(&layout, true).expect("strict quality report");
    assert!(strict_report.errors > 0);

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn build_catalog_writes_manifest_and_lockfile() {
    let unique = format!(
        "agentic-sdlc-cli-build-catalog-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
    let _ = ensure_bootstrap_package(&layout).expect("bootstrap");
    let _ = scaffold_domain_pack(&layout, "catalog-domain", false).expect("domain pack");

    let report = build_skill_workflow_catalog(&layout).expect("build catalog");
    assert!(report.skills >= 3);
    assert!(report.workflows >= 4);
    assert!(
        layout
            .agents_root
            .join("catalog")
            .join("skills_index.json")
            .exists(),
        "skills_index.json missing"
    );
    assert!(
        layout.agents_root.join("skills_index.json").exists(),
        "root skills_index.json missing"
    );
    assert!(
        layout
            .agents_root
            .join("catalog")
            .join("workflows.json")
            .exists(),
        "workflows.json missing"
    );
    assert!(
        layout.agents_root.join("workflows.json").exists(),
        "root workflows.json missing"
    );
    assert!(
        layout.agents_root.join("bundles.json").exists(),
        "root bundles.json missing"
    );
    assert!(
        layout.agents_root.join("marketplace.json").exists(),
        "marketplace.json missing"
    );
    assert!(
        layout.agents_root.join("skills.lock.json").exists(),
        "skills.lock.json missing"
    );

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn quality_check_accepts_skill_md_folder_entry_name() {
    let unique = format!(
        "agentic-sdlc-cli-folder-skill-quality-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    let entry_dir = root.join(".agents").join("skills").join("folder-skill");
    std::fs::create_dir_all(entry_dir.join("references")).expect("folder skill dir");
    std::fs::write(
        entry_dir.join("SKILL.md"),
        r#"# Skill: folder-skill
Schema: antigrav.skill@v1
```json
{"name":"folder-skill","domain":"agent","executor":"ollama","description":"folder skill","risk":"safe","source":"self","tags":["folder","skill","agent"]}
```

## When to Use
- use for folder layout

## Examples
- ex

## Limitations
- limits
"#,
    )
    .expect("write entry");
    std::fs::write(entry_dir.join("references").join("details.md"), "# details")
        .expect("write refs");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
    let report = run_skill_quality_check(&layout, false).expect("quality report");
    let entry = report
        .entries
        .iter()
        .find(|item| item.id.ends_with("folder-skill"))
        .expect("folder entry");
    assert!(
        !entry
            .findings
            .iter()
            .any(|finding| { finding.message.contains("should match file stem 'SKILL'") }),
        "folder-skill should not trigger SKILL file-stem mismatch warning"
    );
    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn lockfile_includes_import_source_provenance() {
    let unique = format!(
        "agentic-sdlc-cli-lock-provenance-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
    let _ = ensure_bootstrap_package(&layout).expect("bootstrap");
    std::fs::create_dir_all(layout.skills_dir.join("imported").join("sample"))
        .expect("imported dir");
    std::fs::write(
        layout
            .skills_dir
            .join("imported")
            .join("sample")
            .join("SKILL.md"),
        r#"# Skill: sample
Schema: antigrav.skill@v1
```json
{
  "name": "sample",
  "domain": "imported",
  "executor": "ollama",
  "model": "qwen3:8b",
  "description": "sample import",
  "risk": "safe",
  "source": "https://github.com/example/skills",
  "source_requested": "/tmp/example/skills",
  "source_commit": "abc1234",
  "source_path": "skills/sample/SKILL.md",
  "source_license": "MIT",
  "imported_at_ms": 1772000000000,
  "tags": ["imported", "external", "skillpack"]
}
```

## When to Use
- use sample

## Examples
- ex

## Limitations
- limits

{{input}}
"#,
    )
    .expect("write imported");

    let _ = build_skill_workflow_catalog(&layout).expect("build catalog");
    let lock =
        read_skills_lockfile(&layout.agents_root.join("skills.lock.json")).expect("read lockfile");
    let skill = lock
        .skills
        .iter()
        .find(|entry| entry.id == "imported/sample")
        .expect("imported lock entry");
    assert_eq!(
        skill.source.as_deref(),
        Some("https://github.com/example/skills")
    );
    assert_eq!(skill.source_commit.as_deref(), Some("abc1234"));
    assert_eq!(skill.source_path.as_deref(), Some("skills/sample/SKILL.md"));
    assert_eq!(skill.source_license.as_deref(), Some("MIT"));
    assert!(
        lock.imports
            .iter()
            .any(|entry| entry.source == "https://github.com/example/skills"),
        "expected import source entry in lockfile"
    );

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn parse_external_skill_markdown_extracts_frontmatter_and_sections() {
    let body = r#"---
name: imported-demo
description: Imported demo skill
risk: safe
source: https://example.com/repo
tags: [demo, imported, workflows]
---
# Imported Demo

## When to Use
- Use when importing third-party skills.

## Examples
```text
sample
```

## Limitations
- Requires adaptation.
"#;
    let parsed = parse_external_skill_markdown(body, Path::new("/tmp/imported-demo/SKILL.md"))
        .expect("parse external skill");
    assert_eq!(parsed.name, "imported-demo");
    assert_eq!(parsed.risk, "safe");
    assert_eq!(parsed.tags.len(), 3);
    assert!(!parsed.when_to_use.is_empty());
    assert!(!parsed.examples.is_empty());
    assert!(!parsed.limitations.is_empty());
}

#[test]
fn import_skills_from_local_repo_generates_imported_markdown() {
    let unique = format!(
        "agentic-sdlc-cli-import-skills-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    let source_root = root.join("source-repo");
    let source = source_root.join("demo-skill");
    std::fs::create_dir_all(&source).expect("source dir");
    std::fs::write(
        source.join("SKILL.md"),
        r#"---
name: external-checklist
description: Build checklists from external skills
risk: none
tags: [external, checklist, planning]
---
# External Checklist

## When to Use
- when checklist is needed

## Examples
```text
example
```

## Limitations
- limited context
"#,
    )
    .expect("write source skill");
    std::fs::write(
        source_root.join("LICENSE"),
        "MIT License\n\nPermission is hereby granted...\n",
    )
    .expect("write license");
    let init = ProcessCommand::new("git")
        .arg("-C")
        .arg(&source_root)
        .arg("init")
        .output()
        .expect("git init");
    assert!(init.status.success(), "git init failed");
    let add = ProcessCommand::new("git")
        .arg("-C")
        .arg(&source_root)
        .arg("add")
        .arg(".")
        .output()
        .expect("git add");
    assert!(add.status.success(), "git add failed");
    let commit = ProcessCommand::new("git")
        .arg("-C")
        .arg(&source_root)
        .arg("-c")
        .arg("user.name=test")
        .arg("-c")
        .arg("user.email=test@example.com")
        .arg("commit")
        .arg("-m")
        .arg("init")
        .output()
        .expect("git commit");
    assert!(commit.status.success(), "git commit failed");

    let project_root = root.join("project");
    std::fs::create_dir_all(&project_root).expect("project dir");
    let layout =
        AgentProjectLayout::discover(project_root.to_string_lossy().as_ref()).expect("layout");
    let report = import_skills_from_source(
        &layout,
        source_root.to_string_lossy().as_ref(),
        &ImportSkillpackOptions {
            domain_override: Some("agent".to_string()),
            max_skills: 10,
            overwrite: false,
            mode: SkillpackInstallMode::Local,
            allow_missing_license: false,
            rebuild_catalog: false,
        },
    )
    .expect("import");
    assert_eq!(report.imported, 1);
    assert!(report.commit.is_some(), "missing pinned source commit");
    assert_eq!(report.license.as_deref(), Some("MIT"));
    let imported_path = layout
        .skills_dir
        .join("imported")
        .join("external-checklist")
        .join("SKILL.md");
    assert!(imported_path.exists(), "imported skill not created");
    let imported_content = std::fs::read_to_string(imported_path).expect("read imported");
    assert!(imported_content.contains("Schema: antigrav.skill@v1"));
    assert!(imported_content.contains("\"source_commit\""));
    assert!(imported_content.contains("\"source_path\""));
    assert!(imported_content.contains("\"source_license\": \"MIT\""));

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn install_bundle_from_catalog_installs_bundle_skills() {
    let unique = format!(
        "agentic-sdlc-cli-install-bundle-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
    let _ = ensure_bootstrap_package(&layout).expect("bootstrap");
    let _ = scaffold_domain_pack(&layout, "payments", false).expect("domain pack");
    let _ = build_skill_workflow_catalog(&layout).expect("catalog");

    let bundles = read_bundle_catalog(&layout).expect("bundles");
    assert!(!bundles.is_empty(), "expected at least one bundle");
    let bundle_id = bundles
        .iter()
        .find(|bundle| !bundle.skills.is_empty())
        .map(|bundle| bundle.id.as_str())
        .expect("bundle with skills");
    let report =
        install_bundle_from_catalog(&layout, bundle_id, SkillpackInstallMode::Local, false)
            .expect("install bundle");
    assert!(report.installed > 0, "expected installed files");
    assert!(layout.skills_dir.join("bundles").join(bundle_id).exists());

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn verify_skills_lock_detects_modified_skill() {
    let unique = format!(
        "agentic-sdlc-cli-verify-lock-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
    let _ = ensure_bootstrap_package(&layout).expect("bootstrap");
    let _ = scaffold_domain_pack(&layout, "payments", false).expect("domain pack");
    let _ = build_skill_workflow_catalog(&layout).expect("catalog");

    let skill_file = layout
        .skills_dir
        .join("payments")
        .join("impact_analyzer")
        .join("SKILL.md");
    let mut body = std::fs::read_to_string(&skill_file).expect("read skill");
    body.push_str("\n<!-- drift -->\n");
    std::fs::write(&skill_file, body).expect("write skill drift");

    let report = verify_skills_lock(&layout, SkillpackInstallMode::Local, false).expect("verify");
    assert!(!report.ok, "lock verification should fail after drift");
    assert!(report.changed > 0, "expected changed entries");

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn parse_simple_yaml_map_reads_key_values() {
    let parsed = parse_simple_yaml_map(
        r#"
name: sample
description: hello world
tags: [a, b, c]
owners:
  - alice
  - bob
"#,
    );
    assert_eq!(parsed.get("name").map(String::as_str), Some("sample"));
    assert_eq!(
        parsed.get("description").map(String::as_str),
        Some("hello world")
    );
    assert_eq!(parsed.get("tags").map(String::as_str), Some("[a, b, c]"));
    assert_eq!(
        parsed.get("owners").map(String::as_str),
        Some("[alice, bob]")
    );
}

#[test]
fn setup_bootstraps_core_markdown_package() {
    let unique = format!(
        "agentic-sdlc-cli-setup-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create temp project");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    let created = ensure_bootstrap_package(&layout).expect("setup package");
    assert_eq!(created.len(), 24);
    assert!(layout.rules_dir.join("runtime.md").exists());
    assert!(layout.rules_dir.join("branching_rules.md").exists());
    assert!(layout.rules_dir.join("coding_rules.md").exists());
    assert!(layout.rules_dir.join("merge_rules.md").exists());
    assert!(layout.workflows_dir.join("starter.md").exists());
    assert!(layout.workflows_dir.join("feature.md").exists());
    assert!(layout.workflows_dir.join("bugfix.md").exists());
    assert!(layout.workflows_dir.join("review.md").exists());
    assert!(layout.workflows_dir.join("release.md").exists());
    assert!(layout.templates_dir.join("feature_prompt.md").exists());
    assert!(layout.templates_dir.join("bugfix_prompt.md").exists());
    assert!(layout.templates_dir.join("review_prompt.md").exists());
    assert!(layout.templates_dir.join("release_prompt.md").exists());
    assert!(layout.roles_dir.join("architect.md").exists());
    assert!(layout.roles_dir.join("implementer.md").exists());
    assert!(layout.roles_dir.join("reviewer.md").exists());
    assert!(layout.roles_dir.join("resolver.md").exists());
    assert!(layout.roles_dir.join("releaser.md").exists());
    assert!(layout
        .skills_dir
        .join("analyze_code")
        .join("SKILL.md")
        .exists());
    assert!(layout
        .skills_dir
        .join("generate_tests")
        .join("SKILL.md")
        .exists());
    assert!(layout
        .skills_dir
        .join("next_steps")
        .join("SKILL.md")
        .exists());
    assert!(layout
        .skills_dir
        .join("workflow_report")
        .join("SKILL.md")
        .exists());
    assert!(layout.memory_dir.join("vector_index.json").exists());
    assert!(layout.memory_dir.join("graph_index.json").exists());

    let report = run_package_check(&layout).expect("package check");
    assert!(
        report.errors.is_empty(),
        "expected no package errors, got {:?}",
        report.errors
    );

    let second = ensure_bootstrap_package(&layout).expect("setup idempotent");
    assert!(second.is_empty());

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn graph_index_builder_writes_nodes_payload() {
    let unique = format!(
        "agentic-sdlc-cli-graph-index-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(root.join("src")).expect("create src");
    std::fs::write(
        root.join("src/lib.rs"),
        "mod auth;\nuse crate::auth::validate_email;\n",
    )
    .expect("write lib");
    std::fs::write(
        root.join("src/auth.rs"),
        "pub fn validate_email(input: &str) -> bool { input.contains('@') }\n",
    )
    .expect("write auth");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    let report = build_graph_index(&layout, 100).expect("build graph index");
    assert!(report.nodes >= 2);
    assert!(report.edges >= 1);
    assert!(layout.memory_dir.join("graph_index.json").exists());
    assert!(layout.memory_dir.join("context.db").exists());
    assert_eq!(report.graph_entries, report.nodes);
    assert_eq!(report.vector_entries, report.nodes);

    let _ = std::fs::remove_dir_all(root);
}

#[test]
fn strict_ollama_flag_respects_env_override() {
    let before = std::env::var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA").ok();
    std::env::remove_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA");
    assert!(!resolve_bootstrap_strict_ollama(false));

    std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", "1");
    assert!(resolve_bootstrap_strict_ollama(false));

    std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", "false");
    assert!(!resolve_bootstrap_strict_ollama(false));

    assert!(resolve_bootstrap_strict_ollama(true));

    if let Some(value) = before {
        std::env::set_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA", value);
    } else {
        std::env::remove_var("ANTIGRAV_BOOTSTRAP_REQUIRE_OLLAMA");
    }
}

#[tokio::test]
async fn e2e_thread_flow_multi_thread_runs_with_auto_resolve_and_thread_sessions() {
    let unique = format!(
        "agentic-sdlc-cli-e2e-thread-flow-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time")
            .as_nanos()
    );
    let root = std::env::temp_dir().join(unique);
    std::fs::create_dir_all(&root).expect("create root");
    let root_str = root.to_string_lossy().to_string();
    let layout = AgentProjectLayout::discover(&root_str).expect("discover layout");

    std::fs::write(
        layout.rules_dir.join("merge_rules.md"),
        r#"# Merge Rules
Schema: antigrav.rule@v1
```json
{
  "auto_conflict_resolution_assist": true,
  "auto_conflict_resolution_strategy": "ours",
  "auto_conflict_resolution_max_attempts": 2,
  "require_validation_before_merge": false
}
```
"#,
    )
    .expect("merge rules");

    let conflict_state = Arc::new(Mutex::new(MockConflictState::default()));
    let mut registry = DomainRegistry::new();
    registry.register_domain("agent");
    registry
        .register_skill("agent", Arc::new(MockEnsureBranchSkill))
        .expect("register ensure_branch");
    registry
        .register_skill("agent", Arc::new(MockRunScriptSkill))
        .expect("register run_script");
    registry
        .register_skill(
            "agent",
            Arc::new(MockGitMergeBranchSkill {
                state: Arc::clone(&conflict_state),
            }),
        )
        .expect("register merge");
    registry
        .register_skill(
            "agent",
            Arc::new(MockAnalyzeConflictsSkill {
                state: Arc::clone(&conflict_state),
            }),
        )
        .expect("register analyze");
    registry
        .register_skill(
            "agent",
            Arc::new(MockAutoResolveConflictsSkill {
                state: Arc::clone(&conflict_state),
            }),
        )
        .expect("register auto resolve");
    registry
        .register_skill("agent", Arc::new(MockHasConflictsSkill))
        .expect("register has_conflicts");
    registry
        .register_skill("agent", Arc::new(MockConflictGateSkill))
        .expect("register conflict_gate");
    registry
        .register_skill(
            "agent",
            Arc::new(MockLlmSubAgentSkill {
                state: Arc::clone(&conflict_state),
            }),
        )
        .expect("register llm");
    registry.register_domain("demo");
    registry
        .register_skill("demo", Arc::new(EchoSkill::new()))
        .expect("register echo");

    let engine = ExecutionEngine::new(&root_str, Arc::new(registry)).expect("engine");
    let session_store = ThreadSessionStore::new(&root_str).expect("session store");

    for thread_id in ["thread-alpha", "thread-beta"] {
        let request = ThreadFlowRequest {
            thread_id: thread_id.to_string(),
            target_branch: "main".to_string(),
            validate_command: "echo ok".to_string(),
            json: false,
        };
        let workflow = build_thread_flow_workflow(&layout, &request).expect("build workflow");
        let branch = super::resolve_thread_branch_name(&layout, thread_id).expect("branch");
        session_store
            .ensure_thread(thread_id, &branch)
            .expect("ensure thread");

        let instance = engine
            .run_new_workflow(
                &workflow,
                None,
                ExecutionBudget::default(),
                RoutingPolicy::default(),
                DomainSecurityPolicy::default(),
            )
            .await
            .expect("run workflow");
        assert_eq!(instance.status, WorkflowInstanceStatus::Completed);
        assert_eq!(
            instance
                .step_states
                .get("resolve_conflicts")
                .expect("resolve state")
                .status,
            crate::engine::workflow_engine::instance::StepExecutionStatus::Skipped
        );
        let has_after = instance
            .step_results
            .get("has_conflicts_after_auto_resolve")
            .expect("post resolve conflicts");
        assert!(
            matches!(has_after, SkillOutput::Boolean(false)),
            "expected has_conflicts_after_auto_resolve=false, got {:?}",
            has_after
        );
        session_store
            .record_instance(thread_id, &branch, &instance)
            .expect("record session");
    }

    let sessions = session_store.list_threads().expect("list sessions");
    assert_eq!(sessions.len(), 2);
    assert!(sessions.iter().all(|record| record.run_count == 1));
    assert!(sessions
        .iter()
        .all(|record| record.last_workflow_status.as_deref() == Some("Completed")));

    let state = conflict_state.lock().expect("lock state");
    assert_eq!(state.merge_calls, 2);
    assert_eq!(state.auto_resolve_calls, 2);
    assert_eq!(state.llm_calls, 0);

    let _ = std::fs::remove_dir_all(root);
}
