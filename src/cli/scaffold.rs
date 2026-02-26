use std::fs;
use std::path::Path;

use super::*;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(super) enum ScaffoldProfile {
    Basic,
    Advanced,
}

impl ScaffoldProfile {
    pub(super) fn as_str(&self) -> &'static str {
        match self {
            ScaffoldProfile::Basic => "basic",
            ScaffoldProfile::Advanced => "advanced",
        }
    }
}

pub(super) fn parse_package_scaffold_kind(kind: &str) -> Result<PackageMarkdownKind> {
    match kind.trim().to_ascii_lowercase().as_str() {
        "workflow" | "workflows" => Ok(PackageMarkdownKind::Workflow),
        "skill" | "skills" => Ok(PackageMarkdownKind::Skill),
        "role" | "roles" => Ok(PackageMarkdownKind::Role),
        "rule" | "rules" => Ok(PackageMarkdownKind::Rule),
        _ => Err(anyhow!(
            "Unsupported scaffold kind '{}'. Use workflow|skill|role|rule",
            kind
        )),
    }
}

pub(super) fn parse_scaffold_profile(raw: &str) -> Result<ScaffoldProfile> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "basic" => Ok(ScaffoldProfile::Basic),
        "advanced" | "pro" => Ok(ScaffoldProfile::Advanced),
        _ => Err(anyhow!(
            "Unsupported scaffold profile '{}'. Use basic|advanced",
            raw
        )),
    }
}

pub(super) fn sanitize_package_name(raw: &str) -> Result<String> {
    let normalized = raw
        .trim()
        .chars()
        .map(|ch| match ch {
            'a'..='z' | '0'..='9' => ch,
            'A'..='Z' => ch.to_ascii_lowercase(),
            '_' | '-' => ch,
            _ => '-',
        })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if normalized.is_empty() {
        return Err(anyhow!(
            "Scaffold name must contain at least one alphanumeric character"
        ));
    }
    Ok(normalized)
}

pub(super) fn scaffold_markdown_package(
    layout: &AgentProjectLayout,
    kind_raw: &str,
    name_raw: &str,
    profile: ScaffoldProfile,
    overwrite: bool,
) -> Result<std::path::PathBuf> {
    let kind = parse_package_scaffold_kind(kind_raw)?;
    let name = sanitize_package_name(name_raw)?;
    let target_dir = match kind {
        PackageMarkdownKind::Workflow => &layout.workflows_dir,
        PackageMarkdownKind::Skill => &layout.skills_dir,
        PackageMarkdownKind::Role => &layout.roles_dir,
        PackageMarkdownKind::Rule => &layout.rules_dir,
    };
    let path = target_dir.join(format!("{}.md", name));
    let content = build_scaffold_markdown(kind, &name, profile);
    write_scaffold_file(&path, &content, overwrite, &mut Vec::new())?;
    Ok(path)
}

fn build_scaffold_markdown(
    kind: PackageMarkdownKind,
    name: &str,
    profile: ScaffoldProfile,
) -> String {
    let schema = kind.expected_schema();
    match (kind, profile) {
        (PackageMarkdownKind::Workflow, ScaffoldProfile::Basic) => format!(
            "---\ndescription: {name} workflow description\n---\n# Workflow: {name}\nSchema: {schema}\nDomain: agent\n\n## Step: plan\nSkill: agent.llm_subagent\nInput: Plan implementation for {name}.\n"
        ),
        (PackageMarkdownKind::Workflow, ScaffoldProfile::Advanced) => format!(
            "---\ndescription: {name} advanced workflow (plan, execute, validate, risk)\n---\n# Workflow: {name}\nSchema: {schema}\nDomain: agent\nMaxCpuMs: 180000\nMaxWallTimeMs: 600000\nMaxNetworkCalls: 25\n\n## Step: intent_analysis\nSkill: agent.llm_subagent\nInput: Analyze task scope, constraints, and acceptance criteria for {name}. Return concise JSON decisions.\n\n## Step: execution_plan\nSkill: agent.llm_subagent\nDependsOn: intent_analysis\nInput: Build deterministic implementation plan for {name} with milestones and rollback notes.\n\n## Step: validation_gate\nSkill: agent.run_script\nDependsOn: execution_plan\nRetry: 1\nOnFailure: Continue\nInput: echo \"validate {name}\"\n\n## Step: risk_review\nSkill: agent.llm_subagent\nDependsOn: validation_gate\nInput: Produce risk register for {name}, including severity, blast radius, and mitigations.\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: risk_review\nInput: Advanced scaffold workflow {name} prepared.\n"
        ),
        (PackageMarkdownKind::Skill, ScaffoldProfile::Basic) => format!(
            "# Skill: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"domain\":\"agent\",\"executor\":\"ollama\",\"model\":\"qwen3:8b\"}}\n```\n\nDescribe skill behavior here.\n"
        ),
        (PackageMarkdownKind::Skill, ScaffoldProfile::Advanced) => format!(
            "# Skill: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"domain\":\"agent\",\"executor\":\"ollama\",\"description\":\"Advanced deterministic analysis skill for delivery pipelines\",\"model\":\"qwen3:8b\",\"temperature\":0.1,\"input_type\":\"text\",\"output_type\":\"text\",\"estimated_cost\":8,\"estimated_latency_ms\":2500,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\nYou are an advanced delivery copilot. Process `{{input}}` and output strict JSON with fields:\n- `summary` (string)\n- `actions` (array of concrete steps)\n- `risks` (array of explicit risks)\n- `validation` (array of checks)\n\nKeep responses deterministic and implementation-focused.\n"
        ),
        (PackageMarkdownKind::Role, ScaffoldProfile::Basic) => format!(
            "# Role: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.1}}\n```\n\nDefine responsibilities and expected output format.\n"
        ),
        (PackageMarkdownKind::Role, ScaffoldProfile::Advanced) => format!(
            "# Role: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.1}}\n```\n\nYou are role `{name}` in a deterministic SDLC runtime.\n\nOperating contract:\n- propose minimal-change plans before execution\n- keep outputs machine-readable and risk-aware\n- include validation + rollback guidance\n- avoid speculative edits; prefer explicit assumptions\n"
        ),
        (PackageMarkdownKind::Rule, ScaffoldProfile::Basic) => format!(
            "---\ndescription: {name} rule description\ntrigger: always_on\n---\n# Rule: {name}\nSchema: {schema}\n```json\n{{}}\n```\n"
        ),
        (PackageMarkdownKind::Rule, ScaffoldProfile::Advanced) => format!(
            "---\ndescription: {name} advanced runtime policy\ntrigger: always_on\n---\n# Rule: {name}\nSchema: {schema}\n```json\n{{\n  \"enforce_deterministic_outputs\": true,\n  \"require_validation_steps\": true,\n  \"allow_external_mutation\": true,\n  \"max_parallel_mutation_steps\": 1,\n  \"require_risk_assessment\": true\n}}\n```\n"
        ),
    }
}

fn write_scaffold_file(
    path: &Path,
    body: &str,
    overwrite: bool,
    created: &mut Vec<std::path::PathBuf>,
) -> Result<()> {
    if path.exists() && !overwrite {
        return Err(anyhow!(
            "Target file already exists: {} (use --overwrite to replace)",
            path.display()
        ));
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, body)?;
    created.push(path.to_path_buf());
    Ok(())
}

pub(super) fn scaffold_domain_pack(
    layout: &AgentProjectLayout,
    domain_raw: &str,
    overwrite: bool,
) -> Result<Vec<std::path::PathBuf>> {
    let domain = sanitize_package_name(domain_raw)?;
    let workflow_dir = layout.workflows_dir.join(&domain);
    let skill_dir = layout.skills_dir.join(&domain);
    let role_dir = layout.roles_dir.join(&domain);
    let template_dir = layout.templates_dir.join(&domain);

    let mut created = Vec::<std::path::PathBuf>::new();

    for (name, body) in build_domain_workflow_markdown(&domain) {
        write_scaffold_file(
            &workflow_dir.join(format!("{}.md", name)),
            &body,
            overwrite,
            &mut created,
        )?;
    }

    for (name, body) in build_domain_skill_markdown(&domain) {
        write_scaffold_file(
            &skill_dir.join(format!("{}.md", name)),
            &body,
            overwrite,
            &mut created,
        )?;
    }

    for (name, body) in build_domain_role_markdown(&domain) {
        write_scaffold_file(
            &role_dir.join(format!("{}.md", name)),
            &body,
            overwrite,
            &mut created,
        )?;
    }

    for (name, body) in build_domain_template_markdown(&domain) {
        write_scaffold_file(
            &template_dir.join(format!("{}.md", name)),
            &body,
            overwrite,
            &mut created,
        )?;
    }

    Ok(created)
}

fn build_domain_workflow_markdown(domain: &str) -> Vec<(&'static str, String)> {
    let arch = format!("{}/architect", domain);
    let impler = format!("{}/implementer", domain);
    let reviewer = format!("{}/reviewer", domain);
    let resolver = format!("{}/resolver", domain);
    let releaser = format!("{}/releaser", domain);
    vec![
        (
            "feature",
            format!(
                "---\ndescription: {domain} feature delivery with impact analysis and acceptance gates\n---\n# Workflow: {domain}-feature\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 240000\nMaxWallTimeMs: 900000\nMaxNetworkCalls: 35\n\n## Step: intent_triage\nSkill: agent.llm_subagent\nInput: {arch}:::Clarify objective, scope boundaries, and measurable acceptance criteria for this feature.\n\n## Step: impact_analysis\nSkill: {domain}.impact_analyzer\nDependsOn: intent_triage\nRetry: 1\nInput: {{{{intent_triage}}}}\n\n## Step: implementation_plan\nSkill: agent.llm_subagent\nDependsOn: impact_analysis\nInput: {impler}:::Create a deterministic implementation plan from this context:\n{{{{impact_analysis}}}}\n\n## Step: acceptance_gate\nSkill: {domain}.acceptance_guard\nDependsOn: implementation_plan\nRetry: 1\nInput: {{{{implementation_plan}}}}\n\n## Step: risk_register\nSkill: {domain}.risk_register\nDependsOn: acceptance_gate\nOnFailure: Continue\nInput: {{{{acceptance_gate}}}}\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: risk_register\nInput: Feature workflow ready for domain {domain}.\n"
            ),
        ),
        (
            "bugfix",
            format!(
                "---\ndescription: {domain} bugfix workflow with root-cause and regression guard\n---\n# Workflow: {domain}-bugfix\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 180000\nMaxWallTimeMs: 600000\n\n## Step: incident_triage\nSkill: agent.llm_subagent\nInput: {resolver}:::Diagnose failure mode and likely root cause. Prioritize deterministic repro.\n\n## Step: blast_radius\nSkill: {domain}.impact_analyzer\nDependsOn: incident_triage\nInput: {{{{incident_triage}}}}\n\n## Step: patch_plan\nSkill: agent.llm_subagent\nDependsOn: blast_radius\nInput: {impler}:::Propose minimal patch and rollback strategy from:\n{{{{blast_radius}}}}\n\n## Step: regression_guard\nSkill: {domain}.acceptance_guard\nDependsOn: patch_plan\nRetry: 1\nInput: {{{{patch_plan}}}}\n\n## Step: postmortem\nSkill: {domain}.risk_register\nDependsOn: regression_guard\nOnFailure: Continue\nInput: {{{{regression_guard}}}}\n"
            ),
        ),
        (
            "review",
            format!(
                "---\ndescription: {domain} review workflow focused on correctness, risk, and release readiness\n---\n# Workflow: {domain}-review\nSchema: antigrav.workflow@v1\nDomain: {domain}\n\n## Step: review_context\nSkill: agent.llm_subagent\nInput: {reviewer}:::Summarize current diff intent, architecture impact, and likely weak spots.\n\n## Step: specification_gate\nSkill: {domain}.acceptance_guard\nDependsOn: review_context\nInput: {{{{review_context}}}}\n\n## Step: review_risk_register\nSkill: {domain}.risk_register\nDependsOn: specification_gate\nInput: {{{{specification_gate}}}}\n\n## Step: review_decision\nSkill: agent.llm_subagent\nDependsOn: review_risk_register\nInput: {reviewer}:::Return merge recommendation with blocking issues from:\n{{{{review_risk_register}}}}\n"
            ),
        ),
        (
            "release",
            format!(
                "---\ndescription: {domain} release workflow with quality signal and risk approval\n---\n# Workflow: {domain}-release\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 180000\nMaxWallTimeMs: 480000\n\n## Step: release_scope\nSkill: agent.llm_subagent\nInput: {releaser}:::Build release scope summary, included features, and customer impact.\n\n## Step: release_quality_signal\nSkill: {domain}.acceptance_guard\nDependsOn: release_scope\nInput: {{{{release_scope}}}}\n\n## Step: release_risk\nSkill: {domain}.risk_register\nDependsOn: release_quality_signal\nInput: {{{{release_quality_signal}}}}\n\n## Step: finalize_release_note\nSkill: agent.llm_subagent\nDependsOn: release_risk\nInput: {releaser}:::Generate final release note and go/no-go recommendation from:\n{{{{release_risk}}}}\n"
            ),
        ),
    ]
}

fn build_domain_skill_markdown(domain: &str) -> Vec<(&'static str, String)> {
    vec![
        (
            "impact_analyzer",
            format!(
                "# Skill: impact_analyzer\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"impact_analyzer\",\"domain\":\"{domain}\",\"executor\":\"ollama\",\"description\":\"Estimate blast radius and dependency impact\",\"model\":\"qwen3:8b\",\"temperature\":0.1,\"input_type\":\"text\",\"output_type\":\"text\",\"estimated_cost\":9,\"estimated_latency_ms\":2800,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\nAnalyze `{{input}}` and return strict JSON:\n{{\"scope_summary\":\"...\",\"components\":[\"...\"],\"risks\":[\"...\"],\"required_checks\":[\"...\"]}}\n\nFocus on deterministic execution planning.\n"
            ),
        ),
        (
            "acceptance_guard",
            format!(
                "# Skill: acceptance_guard\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"acceptance_guard\",\"domain\":\"{domain}\",\"executor\":\"ollama\",\"description\":\"Validate acceptance criteria and test completeness\",\"model\":\"qwen3:8b\",\"temperature\":0.1,\"input_type\":\"text\",\"output_type\":\"text\",\"estimated_cost\":10,\"estimated_latency_ms\":3200,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\nReview `{{input}}` against acceptance criteria quality.\nReturn strict JSON with:\n{{\"coverage\":[\"...\"],\"missing_checks\":[\"...\"],\"blocking_issues\":[\"...\"],\"ready\":true}}\n"
            ),
        ),
        (
            "risk_register",
            format!(
                "# Skill: risk_register\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"risk_register\",\"domain\":\"{domain}\",\"executor\":\"ollama\",\"description\":\"Generate risk register with severity and mitigation\",\"model\":\"qwen3:8b\",\"temperature\":0.1,\"input_type\":\"text\",\"output_type\":\"text\",\"estimated_cost\":8,\"estimated_latency_ms\":2600,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\nFrom `{{input}}`, output strict JSON:\n{{\"risks\":[{{\"title\":\"...\",\"severity\":\"low|medium|high\",\"mitigation\":\"...\"}}],\"rollback\":\"...\",\"owner_actions\":[\"...\"]}}\n"
            ),
        ),
    ]
}

fn build_domain_role_markdown(domain: &str) -> Vec<(&'static str, String)> {
    let common_meta = |name: &str| {
        format!(
            "# Role: {name}\nSchema: antigrav.role@v1\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.1}}\n```\n"
        )
    };
    vec![
        (
            "architect",
            format!(
                "{}Design bounded solutions for domain `{}`.\n\nRequirements:\n- state assumptions explicitly\n- define acceptance criteria before coding\n- optimize for minimal blast radius\n",
                common_meta("architect"),
                domain
            ),
        ),
        (
            "implementer",
            format!(
                "{}Implement deterministic, minimal-change patches in domain `{}`.\n\nRequirements:\n- preserve existing behavior unless explicitly changed\n- include validation and rollback notes\n- avoid speculative refactors\n",
                common_meta("implementer"),
                domain
            ),
        ),
        (
            "reviewer",
            format!(
                "{}Act as strict reviewer for domain `{}`.\n\nRequirements:\n- prioritize bugs, regressions, security, and missing tests\n- mark blockers vs non-blockers clearly\n- keep recommendations actionable\n",
                common_meta("reviewer"),
                domain
            ),
        ),
        (
            "resolver",
            format!(
                "{}Handle failures and conflict resolution in domain `{}`.\n\nRequirements:\n- isolate root cause\n- propose deterministic fix + verification\n- include fallback plan if fix fails\n",
                common_meta("resolver"),
                domain
            ),
        ),
        (
            "releaser",
            format!(
                "{}Prepare safe release decisions in domain `{}`.\n\nRequirements:\n- summarize quality signals\n- highlight top risks and mitigations\n- provide go/no-go recommendation with rationale\n",
                common_meta("releaser"),
                domain
            ),
        ),
    ]
}

fn build_domain_template_markdown(domain: &str) -> Vec<(&'static str, String)> {
    vec![
        (
            "feature_prompt",
            format!(
                "You are delivering a feature in domain `{}`.\n\nOutput format:\n1. Scope summary\n2. Implementation plan (ordered)\n3. Acceptance checks\n4. Risks and rollback strategy\n\nConstraints:\n- deterministic steps only\n- smallest safe change set\n- explicit assumptions\n",
                domain
            ),
        ),
        (
            "bugfix_prompt",
            format!(
                "You are fixing a production bug in domain `{}`.\n\nOutput format:\n1. Root cause hypothesis\n2. Minimal patch plan\n3. Regression checks\n4. Post-fix monitoring notes\n",
                domain
            ),
        ),
        (
            "review_prompt",
            format!(
                "You are reviewing implementation quality for domain `{}`.\n\nOutput format:\n1. Critical findings\n2. Behavioral regressions\n3. Security/perf concerns\n4. Merge recommendation\n",
                domain
            ),
        ),
        (
            "release_prompt",
            format!(
                "You are preparing release readiness for domain `{}`.\n\nOutput format:\n1. Release scope\n2. Quality signal summary\n3. Open risks\n4. Go/No-Go with conditions\n",
                domain
            ),
        ),
    ]
}
