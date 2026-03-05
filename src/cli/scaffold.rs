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
    let path = if kind == PackageMarkdownKind::Skill {
        target_dir.join(&name).join("SKILL.md")
    } else {
        target_dir.join(format!("{}.md", name))
    };
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
            "---\ndescription: {name} workflow description\n---\n# Workflow: {name}\nSchema: {schema}\nDomain: agent\n\n## Step: plan\nSkill: agent.llm_subagent\nInput: Plan implementation for {name}.\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: plan\nInput: Run a focused security check for any internet-capable skill usage before finalizing.\n"
        ),
        (PackageMarkdownKind::Workflow, ScaffoldProfile::Advanced) => format!(
            "---\ndescription: {name} advanced workflow with deterministic gates and report quality guard\n---\n# Workflow: {name}\nSchema: {schema}\nDomain: agent\nMaxCpuMs: 240000\nMaxWallTimeMs: 900000\nMaxNetworkCalls: 30\n\n## Step: intent_analysis\nSkill: agent.llm_subagent\nInput: Analyze task scope, constraints, and acceptance criteria for {name}. Return strict JSON with summary/actions/risks.\n\n## Step: execution_plan\nSkill: agent.llm_subagent\nDependsOn: intent_analysis\nInput: Build deterministic implementation plan for {name} with milestones, validation, and rollback notes.\n\n## Step: validation_gate\nSkill: agent.run_script\nDependsOn: execution_plan\nRetry: 1\nOnFailure: FailFast\nInput: echo \"validate {name}\"\n\n## Step: risk_review\nSkill: agent.llm_subagent\nDependsOn: validation_gate\nInput: Produce risk register for {name}, including severity, blast radius, and mitigations.\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: risk_review\nInput: Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.\n\n## Step: workflow_report\nSkill: agent.workflow_report\nDependsOn: internet_security_check\nInput: Build detailed workflow report from:\n{{{{intent_analysis}}}}\n{{{{execution_plan}}}}\n{{{{validation_gate}}}}\n{{{{risk_review}}}}\n{{{{internet_security_check}}}}\nReturn strict JSON with summary/actions/risks.\n\n## Step: report_quality_gate\nSkill: agent.report_quality_gate\nDependsOn: workflow_report\nInput: {{{{workflow_report}}}}\n\n## Step: simulation_fallback_gate\nSkill: agent.simulation_fallback_gate\nDependsOn: report_quality_gate\nInput: {{{{workflow_report}}}}\n\n## Step: next_actions\nSkill: agent.next_steps\nDependsOn: simulation_fallback_gate\nInput: Derive next actions from {{{{workflow_report}}}} with explicit critical-path ordering.\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: next_actions\nInput: Advanced scaffold workflow {name} prepared with report-quality and simulation-fallback gates.\n"
        ),
        (PackageMarkdownKind::Skill, ScaffoldProfile::Basic) => format!(
            "# Skill: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"domain\":\"agent\",\"executor\":\"ollama\",\"model\":\"qwen3:8b\"}}\n```\n\nDescribe skill behavior here.\n"
        ),
        (PackageMarkdownKind::Skill, ScaffoldProfile::Advanced) => format!(
            "# Skill: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"domain\":\"agent\",\"executor\":\"ollama\",\"description\":\"Advanced deterministic delivery skill for SDLC workflows\",\"model\":\"qwen3:8b\",\"temperature\":0.05,\"input_type\":\"text\",\"output_type\":\"json\",\"estimated_cost\":8,\"estimated_latency_ms\":2500,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\n## Overview\nUse this skill for deterministic planning/reporting tasks in delivery workflows.\n\n## When to Use\n- When workflow output must be machine-readable and risk-aware.\n- When steps need ordered, executable actions.\n\n## Examples\nInput:\n```text\nGenerate implementation and validation plan for {name}\n```\n\nExpected output shape:\n```json\n{{\n  \"summary\": \"...\",\n  \"actions\": [\"...\", \"...\"],\n  \"risks\": [\"...\", \"...\"]\n}}\n```\n\n## Limitations\n- Does not execute code changes directly.\n- Quality depends on clarity and completeness of input context.\n\n## Output Contract\nReturn strict JSON object with:\n- `summary` (string)\n- `actions` (string[])\n- `risks` (string[])\n\nTask input:\n{{input}}\n"
        ),
        (PackageMarkdownKind::Role, ScaffoldProfile::Basic) => format!(
            "# Role: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.1}}\n```\n\nDefine responsibilities and expected output format.\n"
        ),
        (PackageMarkdownKind::Role, ScaffoldProfile::Advanced) => format!(
            "# Role: {name}\nSchema: {schema}\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.05}}\n```\n\nMission:\n- Act as role `{name}` in a deterministic SDLC runtime.\n- Keep outputs implementation-focused and auditable.\n\nExecution Procedure:\n1. Clarify objective, constraints, and scope boundaries.\n2. Produce ordered, executable actions.\n3. Include validation and rollback guidance where relevant.\n4. Surface explicit risks and unknowns.\n\nOutput Contract:\n- `summary`: concise decision narrative.\n- `actions`: ordered actionable steps.\n- `risks`: concrete risks with mitigation direction.\n"
        ),
        (PackageMarkdownKind::Rule, ScaffoldProfile::Basic) => format!(
            "---\ndescription: {name} baseline execution policy\ntrigger: always_on\n---\n# Rule: {name}\nSchema: {schema}\n```json\n{{\n  \"enforce_deterministic_outputs\": true,\n  \"require_validation_steps\": true,\n  \"require_risk_assessment\": true\n}}\n```\n"
        ),
        (PackageMarkdownKind::Rule, ScaffoldProfile::Advanced) => format!(
            "---\ndescription: {name} advanced runtime policy\ntrigger: always_on\n---\n# Rule: {name}\nSchema: {schema}\n```json\n{{\n  \"enforce_deterministic_outputs\": true,\n  \"require_validation_steps\": true,\n  \"allow_external_mutation\": true,\n  \"max_parallel_mutation_steps\": 1,\n  \"require_risk_assessment\": true,\n  \"require_report_quality_gate\": true,\n  \"block_simulation_fallback_for_release\": true\n}}\n```\n"
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
            &skill_dir.join(name).join("SKILL.md"),
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
                "---\ndescription: {domain} feature delivery with impact analysis and acceptance gates\n---\n# Workflow: {domain}-feature\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 240000\nMaxWallTimeMs: 900000\nMaxNetworkCalls: 35\n\n## Step: intent_triage\nSkill: agent.llm_subagent\nInput: {arch}:::Clarify objective, scope boundaries, and measurable acceptance criteria for this feature.\n\n## Step: impact_analysis\nSkill: {domain}.impact_analyzer\nDependsOn: intent_triage\nRetry: 1\nInput: {{{{intent_triage}}}}\n\n## Step: implementation_plan\nSkill: agent.llm_subagent\nDependsOn: impact_analysis\nInput: {impler}:::Create a deterministic implementation plan from this context:\n{{{{impact_analysis}}}}\n\n## Step: acceptance_gate\nSkill: {domain}.acceptance_guard\nDependsOn: implementation_plan\nRetry: 1\nInput: {{{{implementation_plan}}}}\n\n## Step: risk_register\nSkill: {domain}.risk_register\nDependsOn: acceptance_gate\nInput: {{{{acceptance_gate}}}}\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: risk_register\nInput: Analyze this workflow output for internet-surface risks and required security mitigations:\n{{{{risk_register}}}}\n\n## Step: workflow_report\nSkill: agent.workflow_report\nDependsOn: internet_security_check\nInput: Build detailed feature workflow report from:\n{{{{intent_triage}}}}\n{{{{impact_analysis}}}}\n{{{{implementation_plan}}}}\n{{{{acceptance_gate}}}}\n{{{{risk_register}}}}\n{{{{internet_security_check}}}}\nReturn strict JSON with summary/actions/risks.\n\n## Step: report_quality_gate\nSkill: agent.report_quality_gate\nDependsOn: workflow_report\nInput: {{{{workflow_report}}}}\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: report_quality_gate\nInput: Feature workflow ready for domain {domain} with report-quality gate.\n"
            ),
        ),
        (
            "bugfix",
            format!(
                "---\ndescription: {domain} bugfix workflow with root-cause and regression guard\n---\n# Workflow: {domain}-bugfix\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 220000\nMaxWallTimeMs: 900000\n\n## Step: incident_triage\nSkill: agent.llm_subagent\nInput: {resolver}:::Diagnose failure mode and likely root cause. Prioritize deterministic repro.\n\n## Step: blast_radius\nSkill: {domain}.impact_analyzer\nDependsOn: incident_triage\nInput: {{{{incident_triage}}}}\n\n## Step: patch_plan\nSkill: agent.llm_subagent\nDependsOn: blast_radius\nInput: {impler}:::Propose minimal patch and rollback strategy from:\n{{{{blast_radius}}}}\n\n## Step: regression_guard\nSkill: {domain}.acceptance_guard\nDependsOn: patch_plan\nRetry: 1\nInput: {{{{patch_plan}}}}\n\n## Step: postmortem\nSkill: {domain}.risk_register\nDependsOn: regression_guard\nInput: {{{{regression_guard}}}}\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: postmortem\nInput: Review postmortem output for internet-surface risks and mitigations:\n{{{{postmortem}}}}\n\n## Step: workflow_report\nSkill: agent.workflow_report\nDependsOn: internet_security_check\nInput: Build detailed bugfix workflow report from:\n{{{{incident_triage}}}}\n{{{{blast_radius}}}}\n{{{{patch_plan}}}}\n{{{{regression_guard}}}}\n{{{{postmortem}}}}\n{{{{internet_security_check}}}}\nReturn strict JSON with summary/actions/risks.\n\n## Step: report_quality_gate\nSkill: agent.report_quality_gate\nDependsOn: workflow_report\nInput: {{{{workflow_report}}}}\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: report_quality_gate\nInput: Bugfix workflow ready for domain {domain} with report-quality gate.\n"
            ),
        ),
        (
            "review",
            format!(
                "---\ndescription: {domain} review workflow focused on correctness, risk, and release readiness\n---\n# Workflow: {domain}-review\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 180000\nMaxWallTimeMs: 600000\nMaxNetworkCalls: 20\n\n## Step: review_context\nSkill: agent.llm_subagent\nInput: {reviewer}:::Summarize current diff intent, architecture impact, and likely weak spots.\n\n## Step: specification_gate\nSkill: {domain}.acceptance_guard\nDependsOn: review_context\nInput: {{{{review_context}}}}\n\n## Step: review_risk_register\nSkill: {domain}.risk_register\nDependsOn: specification_gate\nInput: {{{{specification_gate}}}}\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: review_risk_register\nInput: Run security check on review artifacts for internet-enabled execution paths:\n{{{{review_risk_register}}}}\n\n## Step: review_decision\nSkill: agent.llm_subagent\nDependsOn: internet_security_check\nInput: {reviewer}:::Return merge recommendation with blocking issues from:\n{{{{internet_security_check}}}}\n\n## Step: workflow_report\nSkill: agent.workflow_report\nDependsOn: review_decision\nInput: Build detailed review workflow report from:\n{{{{review_context}}}}\n{{{{specification_gate}}}}\n{{{{review_risk_register}}}}\n{{{{internet_security_check}}}}\n{{{{review_decision}}}}\nReturn strict JSON with summary/actions/risks and merge posture.\n\n## Step: report_quality_gate\nSkill: agent.report_quality_gate\nDependsOn: workflow_report\nInput: {{{{workflow_report}}}}\n\n## Step: simulation_fallback_gate\nSkill: agent.simulation_fallback_gate\nDependsOn: report_quality_gate\nInput: {{{{workflow_report}}}}\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: simulation_fallback_gate\nInput: Review workflow ready for domain {domain} with report-quality and simulation-fallback gates.\n"
            ),
        ),
        (
            "release",
            format!(
                "---\ndescription: {domain} release workflow with quality signal and risk approval\n---\n# Workflow: {domain}-release\nSchema: antigrav.workflow@v1\nDomain: {domain}\nMaxCpuMs: 220000\nMaxWallTimeMs: 900000\nMaxNetworkCalls: 25\n\n## Step: release_scope\nSkill: agent.llm_subagent\nInput: {releaser}:::Build release scope summary, included features, and customer impact.\n\n## Step: release_quality_signal\nSkill: {domain}.acceptance_guard\nDependsOn: release_scope\nInput: {{{{release_scope}}}}\n\n## Step: release_risk\nSkill: {domain}.risk_register\nDependsOn: release_quality_signal\nInput: {{{{release_quality_signal}}}}\n\n## Step: internet_security_check\nSkill: agent.llm_subagent\nDependsOn: release_risk\nInput: Run security check on release artifacts for internet-capable workflow behavior:\n{{{{release_risk}}}}\n\n## Step: finalize_release_note\nSkill: agent.llm_subagent\nDependsOn: internet_security_check\nInput: {releaser}:::Generate final release note and go/no-go recommendation from:\n{{{{internet_security_check}}}}\n\n## Step: workflow_report\nSkill: agent.workflow_report\nDependsOn: finalize_release_note\nInput: Build detailed release workflow report from:\n{{{{release_scope}}}}\n{{{{release_quality_signal}}}}\n{{{{release_risk}}}}\n{{{{internet_security_check}}}}\n{{{{finalize_release_note}}}}\nReturn strict JSON with summary/actions/risks and release posture.\n\n## Step: report_quality_gate\nSkill: agent.report_quality_gate\nDependsOn: workflow_report\nInput: {{{{workflow_report}}}}\n\n## Step: simulation_fallback_gate\nSkill: agent.simulation_fallback_gate\nDependsOn: report_quality_gate\nInput: {{{{workflow_report}}}}\n\n## Step: finalize\nSkill: demo.echo\nDependsOn: simulation_fallback_gate\nInput: Release workflow ready for domain {domain} with report-quality and simulation-fallback gates.\n"
            ),
        ),
    ]
}

fn build_domain_skill_markdown(domain: &str) -> Vec<(&'static str, String)> {
    vec![
        (
            "impact_analyzer",
            format!(
                "# Skill: impact_analyzer\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"impact_analyzer\",\"domain\":\"{domain}\",\"description\":\"Estimate blast radius and dependency impact\",\"risk\":\"safe\",\"source\":\"self\",\"tags\":[\"analysis\",\"planning\",\"risk\"],\"executor\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.05,\"input_type\":\"text\",\"output_type\":\"json\",\"estimated_cost\":9,\"estimated_latency_ms\":2800,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\n## Overview\nAnalyze impact and dependencies before execution.\n\n## When to Use\n- Before implementation planning.\n- When assessing blast radius of risky changes.\n\n## Examples\nInput:\n```text\nAssess impact of moving query execution logic into controller modules.\n```\n\nExpected output shape:\n```json\n{{\n  \"summary\": \"...\",\n  \"actions\": [\"...\", \"...\"],\n  \"risks\": [\"...\", \"...\"]\n}}\n```\n\n## Limitations\n- Produces analysis only; does not execute code changes.\n- Depends on quality of provided context.\n\n## Output Contract\nReturn strict JSON object with:\n- `summary` (string)\n- `actions` (string[])\n- `risks` (string[])\n\nTask input:\n{{input}}\n"
            ),
        ),
        (
            "acceptance_guard",
            format!(
                "# Skill: acceptance_guard\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"acceptance_guard\",\"domain\":\"{domain}\",\"description\":\"Validate acceptance criteria and test completeness\",\"risk\":\"safe\",\"source\":\"self\",\"tags\":[\"acceptance\",\"quality\",\"validation\"],\"executor\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.05,\"input_type\":\"text\",\"output_type\":\"json\",\"estimated_cost\":10,\"estimated_latency_ms\":3200,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\n## Overview\nValidate acceptance criteria coverage and execution readiness.\n\n## When to Use\n- Before build/test execution.\n- Before merge/release decisions.\n\n## Examples\nInput:\n```text\nValidate readiness of migration plan and regression checks for new connection profile flow.\n```\n\nExpected output shape:\n```json\n{{\n  \"summary\": \"...\",\n  \"actions\": [\"...\", \"...\"],\n  \"risks\": [\"...\", \"...\"]\n}}\n```\n\n## Limitations\n- Does not execute validations itself.\n- Output quality depends on completeness of provided acceptance criteria.\n\n## Output Contract\nReturn strict JSON object with:\n- `summary` (string)\n- `actions` (string[])\n- `risks` (string[])\n\nTask input:\n{{input}}\n"
            ),
        ),
        (
            "risk_register",
            format!(
                "# Skill: risk_register\nSchema: antigrav.skill@v1\n```json\n{{\"name\":\"risk_register\",\"domain\":\"{domain}\",\"description\":\"Generate risk register with severity and mitigation\",\"risk\":\"safe\",\"source\":\"self\",\"tags\":[\"risk\",\"mitigation\",\"release\"],\"executor\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":0.05,\"input_type\":\"text\",\"output_type\":\"json\",\"estimated_cost\":8,\"estimated_latency_ms\":2600,\"allow_fs_read\":false,\"allow_fs_write\":false,\"allow_network\":true,\"allow_env\":false,\"allow_process_spawn\":false,\"side_effect_class\":\"Idempotent\",\"trust_tier\":\"Constrained\"}}\n```\n\n## Overview\nGenerate a concrete risk register for planning, review, and release gates.\n\n## When to Use\n- After implementation plan is prepared.\n- After validation outputs are available.\n\n## Examples\nInput:\n```text\nGenerate risk register for refactoring query execution and adding result caching.\n```\n\nExpected output shape:\n```json\n{{\n  \"summary\": \"...\",\n  \"actions\": [\"...\", \"...\"],\n  \"risks\": [\"...\", \"...\"]\n}}\n```\n\n## Limitations\n- Does not mitigate risks automatically.\n- Severity accuracy depends on quality of input evidence.\n\n## Output Contract\nReturn strict JSON object with:\n- `summary` (string)\n- `actions` (string[])\n- `risks` (string[])\n\nTask input:\n{{input}}\n"
            ),
        ),
    ]
}

fn build_domain_role_markdown(domain: &str) -> Vec<(&'static str, String)> {
    let common_meta = |name: &str, temperature: f32| {
        format!(
            "# Role: {name}\nSchema: antigrav.role@v1\n```json\n{{\"name\":\"{name}\",\"provider\":\"ollama\",\"model\":\"qwen3:8b\",\"temperature\":{temperature}}}\n```\n"
        )
    };
    vec![
        (
            "architect",
            format!(
                "{}Mission:\n- Design bounded, deterministic solutions for domain `{}`.\n- Convert ambiguous asks into executable architecture plans.\n\nExecution Procedure:\n1. Clarify scope boundaries and acceptance criteria.\n2. Identify impacted components and dependencies.\n3. Expose assumptions and compatibility constraints.\n4. Define phased plan with validation and rollback checkpoints.\n\nOutput Contract:\n- `summary`: architecture rationale and boundary assumptions.\n- `actions`: ordered implementation phases.\n- `risks`: explicit risks with mitigation direction.\n",
                common_meta("architect", 0.05),
                domain
            ),
        ),
        (
            "implementer",
            format!(
                "{}Mission:\n- Execute minimal, production-safe code changes for domain `{}`.\n- Preserve existing behavior unless change is explicitly requested.\n\nExecution Procedure:\n1. Restate target behavior and acceptance criteria.\n2. Identify exact files/functions to change.\n3. Apply smallest safe patch set.\n4. Define deterministic validation and rollback commands.\n\nOutput Contract:\n- `summary`: what changed and why.\n- `actions`: ordered file-level execution tasks.\n- `risks`: regressions and rollback triggers.\n",
                common_meta("implementer", 0.02),
                domain
            ),
        ),
        (
            "reviewer",
            format!(
                "{}Mission:\n- Gate quality and risk for domain `{}` changes.\n- Prioritize correctness, security, and regression prevention.\n\nExecution Procedure:\n1. Validate requirement-to-implementation alignment.\n2. Identify defects, regressions, and missing tests.\n3. Classify findings by severity and merge impact.\n4. Recommend concrete remediation actions.\n\nOutput Contract:\n- `summary`: top findings and merge posture.\n- `actions`: remediation ordered by severity.\n- `risks`: unresolved risk and confidence gaps.\n",
                common_meta("reviewer", 0.0),
                domain
            ),
        ),
        (
            "resolver",
            format!(
                "{}Mission:\n- Restore deterministic progress for domain `{}` incidents/conflicts.\n- Minimize disruption while preserving intended behavior.\n\nExecution Procedure:\n1. Capture reproducible failure context.\n2. Isolate likely root cause and confidence.\n3. Propose minimal fix strategy and fallback path.\n4. Define post-fix validation sequence.\n\nOutput Contract:\n- `summary`: root cause and selected strategy.\n- `actions`: deterministic fix and verification steps.\n- `risks`: unresolved ambiguity and rollback triggers.\n",
                common_meta("resolver", 0.0),
                domain
            ),
        ),
        (
            "releaser",
            format!(
                "{}Mission:\n- Produce evidence-based go/no-go decisions for domain `{}` releases.\n- Ensure release readiness and rollback safety.\n\nExecution Procedure:\n1. Summarize release scope and validation evidence.\n2. Assess open risks and mitigation status.\n3. Confirm rollback path and operational safeguards.\n4. Provide explicit decision conditions.\n\nOutput Contract:\n- `summary`: readiness narrative and decision rationale.\n- `actions`: pre-release, release, and post-release checklist tasks.\n- `risks`: remaining risks with mitigation ownership.\n",
                common_meta("releaser", 0.0),
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
