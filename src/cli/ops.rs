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

    let manifest_candidates = [
        (
            "Cargo.toml",
            Path::new(&layout.project_root).join("Cargo.toml"),
        ),
        (
            "package.json",
            Path::new(&layout.project_root).join("package.json"),
        ),
        (
            "pyproject.toml",
            Path::new(&layout.project_root).join("pyproject.toml"),
        ),
        ("go.mod", Path::new(&layout.project_root).join("go.mod")),
    ];
    let detected_manifests = manifest_candidates
        .iter()
        .filter_map(|(name, path)| {
            if path.exists() {
                Some(format!("{} ({})", name, path.display()))
            } else {
                None
            }
        })
        .collect::<Vec<_>>();
    if detected_manifests.is_empty() {
        checks.push(DoctorCheckResult {
            name: "project_manifest".to_string(),
            status: DoctorCheckStatus::Error,
            message: "no project manifest found (expected one of Cargo.toml/package.json/pyproject.toml/go.mod)".to_string(),
        });
    } else {
        checks.push(DoctorCheckResult {
            name: "project_manifest".to_string(),
            status: DoctorCheckStatus::Ok,
            message: format!("detected {}", detected_manifests.join(", ")),
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

    for (file_name, body) in bootstrap_rule_files() {
        write_file_if_missing(&layout.rules_dir.join(file_name), body, &mut created)?;
    }

    for (file_name, body) in bootstrap_workflow_files() {
        write_file_if_missing(&layout.workflows_dir.join(file_name), body, &mut created)?;
    }

    for (file_name, body) in bootstrap_template_files() {
        write_file_if_missing(&layout.templates_dir.join(file_name), body, &mut created)?;
    }

    for (file_name, body) in bootstrap_role_files() {
        write_file_if_missing(&layout.roles_dir.join(file_name), body, &mut created)?;
    }

    for (folder_name, body) in bootstrap_skill_files() {
        let path = layout.skills_dir.join(folder_name).join("SKILL.md");
        write_file_if_missing(&path, body, &mut created)?;
    }

    let vector_index = layout.memory_dir.join("vector_index.json");
    write_file_if_missing(&vector_index, "[]\n", &mut created)?;

    let graph_index = layout.memory_dir.join("graph_index.json");
    write_file_if_missing(&graph_index, "{\n  \"nodes\": []\n}\n", &mut created)?;

    Ok(created)
}

fn bootstrap_workflow_files() -> [(&'static str, &'static str); 5] {
    [
        (
            "starter.md",
            r#"---
description: starter workflow
---
# Workflow: starter
Schema: antigrav.workflow@v1
Domain: demo

## Step: hello
Skill: demo.echo
Input: starter workflow ready
"#,
        ),
        (
            "feature.md",
            r#"---
description: feature delivery workflow with deterministic planning and report quality gates
---
# Workflow: feature
Schema: antigrav.workflow@v1
Domain: agent
MaxCpuMs: 240000
MaxWallTimeMs: 900000
MaxNetworkCalls: 30

## Step: intent_analysis
Skill: agent.llm_subagent
Input: architect:::Analyze task intent, constraints, acceptance criteria, and impacted components. Return strict JSON with summary/actions/risks.

## Step: execution_plan
Skill: agent.llm_subagent
DependsOn: intent_analysis
Input: implementer:::Produce deterministic implementation plan with ordered edits, test strategy, and rollback notes.

## Step: validation_gate
Skill: agent.run_script
DependsOn: execution_plan
Retry: 1
OnFailure: FailFast
Input: npm run -s build

## Step: risk_review
Skill: agent.llm_subagent
DependsOn: validation_gate
Input: reviewer:::Build risk register with severity, blast radius, and mitigations based on implementation and validation outputs.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: risk_review
Input: reviewer:::Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed workflow report from:
{{intent_analysis}}
{{execution_plan}}
{{validation_gate}}
{{risk_review}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: report_quality_gate
Input: Derive next actions from {{workflow_report}} with explicit critical-path ordering.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Feature workflow completed with report quality and next-action gates.
"#,
        ),
        (
            "bugfix.md",
            r#"---
description: bugfix workflow with root-cause discipline and report quality gates
---
# Workflow: bugfix
Schema: antigrav.workflow@v1
Domain: agent
MaxCpuMs: 220000
MaxWallTimeMs: 900000
MaxNetworkCalls: 30

## Step: issue_triage
Skill: agent.llm_subagent
Input: resolver:::Summarize failure mode, root-cause hypothesis, reproducibility, and affected scope.

## Step: patch_plan
Skill: agent.llm_subagent
DependsOn: issue_triage
Input: implementer:::Provide minimal patch plan with explicit regression checks and rollback.

## Step: validation_gate
Skill: agent.run_script
DependsOn: patch_plan
Retry: 2
OnFailure: FailFast
Input: npm run -s build

## Step: post_fix_review
Skill: agent.llm_subagent
DependsOn: validation_gate
Input: reviewer:::Evaluate patch quality, remaining risks, and any follow-up actions.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: post_fix_review
Input: reviewer:::Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed workflow report from:
{{issue_triage}}
{{patch_plan}}
{{validation_gate}}
{{post_fix_review}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: report_quality_gate
Input: Derive next actions from {{workflow_report}} and prioritize unresolved blockers.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Bugfix workflow completed with report quality and next-action gates.
"#,
        ),
        (
            "review.md",
            r#"---
description: review workflow with detailed findings and simulation-fallback gate
---
# Workflow: review
Schema: antigrav.workflow@v1
Domain: agent
MaxCpuMs: 180000
MaxWallTimeMs: 600000
MaxNetworkCalls: 20

## Step: review_context
Skill: agent.llm_subagent
Input: reviewer:::Summarize implementation intent, code areas, and likely weak spots.

## Step: generate_review
Skill: agent.llm_subagent
DependsOn: review_context
Input: reviewer:::Return strict JSON findings with severity, impact, and remediation guidance.

## Step: merge_recommendation
Skill: agent.llm_subagent
DependsOn: generate_review
Input: reviewer:::Produce merge recommendation with blockers/non-blockers from review findings.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: merge_recommendation
Input: reviewer:::Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: internet_security_check
Input: Build detailed review workflow report from:
{{review_context}}
{{generate_review}}
{{merge_recommendation}}
{{internet_security_check}}
Return strict JSON with summary/actions/risks and merge posture.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: simulation_fallback_gate
Skill: agent.simulation_fallback_gate
DependsOn: report_quality_gate
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: simulation_fallback_gate
Input: Derive next actions from {{workflow_report}} and keep severity-first ordering.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Review workflow completed with detailed report and simulation-fallback gate.
"#,
        ),
        (
            "release.md",
            r#"---
description: release workflow with evidence-backed decision and simulation-fallback gate
---
# Workflow: release
Schema: antigrav.workflow@v1
Domain: agent
MaxCpuMs: 220000
MaxWallTimeMs: 900000
MaxNetworkCalls: 25

## Step: release_scope
Skill: agent.llm_subagent
Input: releaser:::Build release scope summary, included changes, and customer impact.

## Step: validation_gate
Skill: agent.run_script
DependsOn: release_scope
Retry: 1
OnFailure: FailFast
Input: npm run -s build

## Step: release_risk
Skill: agent.llm_subagent
DependsOn: validation_gate
Input: releaser:::Produce release risk register with severity, mitigations, and go/no-go conditions.

## Step: internet_security_check
Skill: agent.llm_subagent
DependsOn: release_risk
Input: reviewer:::Run a focused security check for internet-capable execution paths and return pass/fail with mitigations.

## Step: go_no_go_decision
Skill: agent.llm_subagent
DependsOn: internet_security_check
Input: releaser:::Issue final go/no-go decision from release risk and security evidence.

## Step: workflow_report
Skill: agent.workflow_report
DependsOn: go_no_go_decision
Input: Build detailed release workflow report from:
{{release_scope}}
{{validation_gate}}
{{release_risk}}
{{internet_security_check}}
{{go_no_go_decision}}
Return strict JSON with summary/actions/risks and explicit decision posture.

## Step: report_quality_gate
Skill: agent.report_quality_gate
DependsOn: workflow_report
Input: {{workflow_report}}

## Step: simulation_fallback_gate
Skill: agent.simulation_fallback_gate
DependsOn: report_quality_gate
Input: {{workflow_report}}

## Step: next_actions
Skill: agent.next_steps
DependsOn: simulation_fallback_gate
Input: Derive release next actions from {{workflow_report}} with pre-release/release/post-release phases.

## Step: finalize
Skill: demo.echo
DependsOn: next_actions
Input: Release workflow completed with report-quality and simulation-fallback gates.
"#,
        ),
    ]
}

fn bootstrap_rule_files() -> [(&'static str, &'static str); 4] {
    [
        (
            "runtime.md",
            "---\ndescription: Runtime execution policy\ntrigger: always_on\n---\n# Runtime Rules\nSchema: antigrav.rule@v1\n```json\n{\n  \"allowed_domains\": [\"agent\", \"demo\", \"utils\"],\n  \"preferred_domains\": [\"agent\"],\n  \"cross_domain_penalty\": 40,\n  \"disable_network\": false,\n  \"read_only\": false,\n  \"strict_mode\": true,\n  \"external_mutation_penalty\": 120,\n  \"step_timeout_ms\": 420000,\n  \"max_trust_tier\": \"Constrained\",\n  \"max_total_cost\": 2500,\n  \"max_total_latency_ms\": 900000,\n  \"max_steps\": 30,\n  \"max_cpu_ms\": 240000,\n  \"max_wall_time_ms\": 1200000,\n  \"max_fs_reads\": 3000,\n  \"max_fs_writes\": 450,\n  \"max_network_calls\": 25,\n  \"max_memory_mb\": 1024,\n  \"run_script_timeout_ms\": 420000,\n  \"run_script_allowed_commands\": [\n    \"npm\",\n    \"npx\",\n    \"cargo\",\n    \"rustc\",\n    \"rustfmt\",\n    \"clippy-driver\",\n    \"git\",\n    \"pnpm\",\n    \"yarn\",\n    \"node\",\n    \"bun\"\n  ],\n  \"run_script_denied_commands\": [\n    \"sudo\",\n    \"rm\",\n    \"dd\",\n    \"mkfs\",\n    \"shutdown\",\n    \"reboot\",\n    \"poweroff\",\n    \"launchctl\"\n  ],\n  \"run_script_allow_shell_operators\": false\n}\n```\n",
        ),
        (
            "branching_rules.md",
            "---\ndescription: Branching strategy for thread workflows\ntrigger: always_on\n---\n# Branching Rules\nSchema: antigrav.rule@v1\n```json\n{\n  \"strategy\": \"feature-branch-per-thread\",\n  \"prefix\": \"thread/\",\n  \"allow_auto_create\": true,\n  \"allow_auto_checkout\": true,\n  \"cleanup_after_merge\": false\n}\n```\n",
        ),
        (
            "coding_rules.md",
            "---\ndescription: Coding quality gate\ntrigger: always_on\n---\n# Coding Rules\nSchema: antigrav.rule@v1\n```json\n{\n  \"no_unused_imports\": true,\n  \"require_tests_for_new_feature\": true,\n  \"forbid_unrelated_file_changes\": true,\n  \"require_memory_index_update\": false,\n  \"require_structured_commit_message\": true,\n  \"commit_format\": \"type(scope): summary\"\n}\n```\n",
        ),
        (
            "merge_rules.md",
            "---\ndescription: Merge safety policy\ntrigger: always_on\n---\n# Merge Rules\nSchema: antigrav.rule@v1\n```json\n{\n  \"require_validation_before_merge\": true,\n  \"analyze_conflicts\": true,\n  \"auto_conflict_resolution_assist\": true,\n  \"auto_conflict_resolution_strategy\": \"ours\",\n  \"auto_conflict_resolution_max_attempts\": 2,\n  \"delete_feature_branch_after_merge\": false,\n  \"protected_branches\": [\"main\", \"master\"],\n  \"require_rebase_before_merge\": true\n}\n```\n",
        ),
    ]
}

fn bootstrap_template_files() -> [(&'static str, &'static str); 4] {
    [
        (
            "feature_prompt.md",
            "You are implementing a feature with deterministic, production-safe execution.\n\nOutput format:\n1. Scope summary with explicit assumptions\n2. Ordered implementation plan with file-level changes\n3. Validation matrix (command, expected result, fallback)\n4. Risk register (severity, blast radius, mitigation)\n5. Rollback strategy\n\nConstraints:\n- smallest safe change set\n- no unrelated refactors\n- include concrete commands and acceptance checks\n",
        ),
        (
            "bugfix_prompt.md",
            "You are fixing a bug with strict scope control.\n\nOutput format:\n1. Failure symptom and reproducibility notes\n2. Root cause hypothesis and confidence\n3. Minimal patch plan (ordered)\n4. Regression checks and monitoring follow-up\n5. Residual risks and rollback\n\nConstraints:\n- fix only the reported bug\n- preserve behavior outside bug scope\n- include deterministic validation commands\n",
        ),
        (
            "review_prompt.md",
            "You are performing a code review focused on defects and release risk.\n\nOutput format:\n1. Critical findings (file, severity, rationale, remediation)\n2. Behavioral regressions and missing tests\n3. Security/performance concerns\n4. Merge recommendation with explicit blockers\n\nConstraints:\n- prioritize high-confidence issues\n- do not include cosmetic-only feedback as blockers\n- keep findings actionable\n",
        ),
        (
            "release_prompt.md",
            "You are preparing release readiness artifacts.\n\nOutput format:\n1. Release scope and affected components\n2. Validation evidence matrix\n3. Open risks and mitigations\n4. Go/No-Go decision with conditions\n5. Rollback and post-release monitoring plan\n\nConstraints:\n- use factual evidence only\n- flag unknowns explicitly\n- include concrete validation commands\n",
        ),
    ]
}

fn bootstrap_role_files() -> [(&'static str, &'static str); 5] {
    [
        (
            "architect.md",
            r#"# Role: Architect
Schema: antigrav.role@v1
```json
{
  "name": "architect",
  "provider": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.05
}
```
You are responsible for architecture-quality execution planning.

Mission:
- Convert ambiguous requests into deterministic implementation plans.
- Minimize blast radius while preserving expected behavior.

Operating Procedure:
1. Clarify objective, scope boundary, and acceptance criteria.
2. Identify impacted components and dependencies.
3. Expose technical assumptions and constraints.
4. Propose phased plan with validation and rollback.
5. Highlight security, performance, and data-integrity risks.

Output Contract:
- `summary`: architecture rationale and boundary assumptions.
- `actions`: ordered, executable plan tied to concrete files or modules.
- `risks`: explicit failure modes with mitigation direction.
"#,
        ),
        (
            "implementer.md",
            r#"# Role: Implementer
Schema: antigrav.role@v1
```json
{
  "name": "implementer",
  "provider": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.02
}
```
You are responsible for minimal, production-safe code execution.

Mission:
- Deliver concrete edits with deterministic behavior.
- Keep scope tight and changes testable.

Execution Checklist:
1. Restate target behavior and acceptance criteria.
2. List exact files/functions that must change.
3. Implement in smallest safe increments.
4. Preserve APIs unless a breaking change is required.
5. Provide deterministic validation commands and rollback notes.

Output Contract:
- `summary`: behavior delta and implementation intent.
- `actions`: ordered implementation tasks with concrete change points.
- `risks`: regressions/unknowns and verification strategy.
"#,
        ),
        (
            "reviewer.md",
            r#"# Role: Reviewer
Schema: antigrav.role@v1
```json
{
  "name": "reviewer",
  "provider": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.0
}
```
You are the quality and risk gate before merge/release.

Mission:
- Identify correctness bugs, regressions, and security risks.
- Keep findings actionable, evidence-based, and prioritized.

Review Procedure:
1. Validate requirement-to-implementation alignment.
2. Check behavioral regressions and edge cases.
3. Evaluate missing tests and weak validation evidence.
4. Assess security-sensitive execution paths.
5. Classify findings by severity and merge impact.

Output Contract:
- `summary`: top findings and merge posture.
- `actions`: remediation tasks ordered by severity.
- `risks`: unresolved risks and confidence gaps.
"#,
        ),
        (
            "resolver.md",
            r#"# Role: Resolver
Schema: antigrav.role@v1
```json
{
  "name": "resolver",
  "provider": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.0
}
```
You are responsible for restoring deterministic progress when failures occur.

Mission:
- Isolate root cause quickly and safely.
- Resolve incidents/conflicts with minimal disruption.

Resolution Procedure:
1. Capture failure symptom with reproducible context.
2. Determine likely root cause and confidence level.
3. Propose minimal fix and fallback strategy.
4. Define post-resolution validation sequence.
5. Surface residual risk and owner follow-up tasks.

Output Contract:
- `summary`: root cause + selected strategy + expected result.
- `actions`: deterministic resolution steps and validation checks.
- `risks`: unresolved ambiguities and rollback triggers.
"#,
        ),
        (
            "releaser.md",
            r#"# Role: Releaser
Schema: antigrav.role@v1
```json
{
  "name": "releaser",
  "provider": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.0
}
```
You are the release readiness authority.

Mission:
- Produce evidence-based go/no-go decisions.
- Ensure release artifacts are complete and low-risk.

Release Procedure:
1. Summarize release scope and impacted areas.
2. Verify validation matrix and confidence level.
3. Evaluate open risks and mitigation status.
4. Confirm rollback path and operational safeguards.
5. Produce decision with explicit conditions.

Output Contract:
- `summary`: readiness narrative and decision rationale.
- `actions`: pre-release, release, and post-release checklist tasks.
- `risks`: remaining risks with severity and mitigation owner.
"#,
        ),
    ]
}

fn bootstrap_skill_files() -> [(&'static str, &'static str); 4] {
    [
        (
            "analyze_code",
            r#"# Skill: analyze_code
Schema: antigrav.skill@v1

```json
{
  "name": "analyze_code",
  "domain": "agent",
  "description": "Perform deep implementation analysis and return deterministic execution guidance.",
  "risk": "safe",
  "source": "self",
  "tags": ["analysis", "architecture", "planning", "workflow"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.05,
  "input_type": "text",
  "output_type": "json",
  "estimated_cost": 8,
  "estimated_latency_ms": 2800,
  "allow_fs_read": false,
  "allow_fs_write": false,
  "allow_network": true,
  "allow_env": false,
  "allow_process_spawn": false,
  "side_effect_class": "Idempotent",
  "trust_tier": "Constrained"
}
```

## Overview
Use this skill when architecture-quality analysis is required before code changes.

## When to Use
- Planning feature implementation slices.
- Assessing bug-fix blast radius.
- Evaluating technical risks before merge/release.

## Examples
Input:
```text
Implement deterministic pagination for query results without breaking existing execution behavior.
```

Expected output shape:
```json
{
  "summary": "...",
  "actions": ["...", "..."],
  "risks": ["...", "..."]
}
```

## Limitations
- Produces analysis only; does not apply code edits.
- Quality depends on clarity of provided context.

## Output Contract
Return strict JSON object with:
- `summary` (string): scope and architecture narrative.
- `actions` (string[]): ordered, executable implementation actions.
- `risks` (string[]): explicit failure modes and mitigations.

Task input:
{{input}}
"#,
        ),
        (
            "generate_tests",
            r#"# Skill: generate_tests
Schema: antigrav.skill@v1

```json
{
  "name": "generate_tests",
  "domain": "agent",
  "description": "Generate high-value deterministic test plans and cases for changed behavior.",
  "risk": "safe",
  "source": "self",
  "tags": ["testing", "qa", "regression"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.05,
  "input_type": "text",
  "output_type": "json",
  "estimated_cost": 9,
  "estimated_latency_ms": 3000,
  "allow_fs_read": false,
  "allow_fs_write": false,
  "allow_network": true,
  "allow_env": false,
  "allow_process_spawn": false,
  "side_effect_class": "Idempotent",
  "trust_tier": "Constrained"
}
```

## Overview
Use this skill to turn requirements or diffs into concrete, prioritized test suites.

## When to Use
- New feature verification planning.
- Regression suite updates after bug fixes.
- Coverage gap analysis before merge/release.

## Examples
Input:
```text
Connection panel now supports filtering by environment and status.
```

Expected output shape:
```json
{
  "summary": "...",
  "actions": ["...", "..."],
  "risks": ["...", "..."]
}
```

## Limitations
- Produces strategy/cases, not executable test code.
- Requires accurate change context for best prioritization.

## Output Contract
Return strict JSON object with:
- `summary` (string): strategy and coverage intent.
- `actions` (string[]): ordered test case checklist.
- `risks` (string[]): uncovered or hard-to-test areas.

Task input:
{{input}}
"#,
        ),
        (
            "next_steps",
            r#"# Skill: next_steps
Schema: antigrav.skill@v1

```json
{
  "name": "next_steps",
  "domain": "agent",
  "description": "Derive deterministic next execution tasks from workflow progress and blockers.",
  "risk": "none",
  "source": "self",
  "tags": ["planning", "triage", "workflow"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.05,
  "input_type": "text",
  "output_type": "json",
  "estimated_cost": 7,
  "estimated_latency_ms": 2200,
  "allow_fs_read": false,
  "allow_fs_write": false,
  "allow_network": true,
  "allow_env": false,
  "allow_process_spawn": false,
  "side_effect_class": "Idempotent",
  "trust_tier": "Constrained"
}
```

## Overview
Use this skill to keep workflow momentum by producing execution-ready next tasks.

## When to Use
- Planning after partial progress.
- Replanning after blockers or failed validations.
- Building a short-term roadmap for a thread.

## Examples
Input:
```text
Frontend build passes, backend check fails in query command module, release notes are pending.
```

Expected output shape:
```json
{
  "summary": "...",
  "actions": ["...", "..."],
  "risks": ["...", "..."]
}
```

## Limitations
- Depends on quality of current status context.
- Does not execute tasks directly.

## Output Contract
Return strict JSON object with:
- `summary` (string): current state and planning rationale.
- `actions` (string[]): ordered next actions.
- `risks` (string[]): blockers/uncertainties that may derail progress.

Task input:
{{input}}
"#,
        ),
        (
            "workflow_report",
            r#"# Skill: workflow_report
Schema: antigrav.skill@v1

```json
{
  "name": "workflow_report",
  "domain": "agent",
  "description": "Generate a detailed, evidence-backed workflow report from planning, validation, and risk outputs.",
  "risk": "safe",
  "source": "self",
  "tags": ["reporting", "evidence", "workflow"],
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.03,
  "input_type": "text",
  "output_type": "json",
  "estimated_cost": 10,
  "estimated_latency_ms": 3200,
  "allow_fs_read": false,
  "allow_fs_write": false,
  "allow_network": true,
  "allow_env": false,
  "allow_process_spawn": false,
  "side_effect_class": "Idempotent",
  "trust_tier": "Constrained"
}
```

## Overview
Use this skill to turn workflow artifacts into an explicit, production-grade report.

## When to Use
- Before workflow finalization.
- When validation evidence exists across multiple steps.
- When merge/release decisions depend on risk/security posture.

## Examples
Input:
```text
Feature plan completed, frontend build passed, backend check failed, risk review identified high regression risk in export flow.
```

Expected output shape:
```json
{
  "summary": "...",
  "actions": ["...", "..."],
  "risks": ["...", "..."]
}
```

## Limitations
- Depends on completeness of prior step outputs.
- Synthesizes evidence only; does not execute fixes.

## Output Contract
Return strict JSON object with:
- `summary` (string): readiness narrative with decision posture.
- `actions` (string[]): ordered critical-path actions including validations.
- `risks` (string[]): unresolved risks with severity and mitigation owner.

Task input:
{{input}}
"#,
        ),
    ]
}

fn write_file_if_missing(
    path: &Path,
    body: &str,
    created: &mut Vec<std::path::PathBuf>,
) -> Result<()> {
    if path.exists() {
        return Ok(());
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
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

const DEFAULT_CONTEXT_DB_PATH: &str = ".agents/memory/context.db";
const DEFAULT_CONTEXT_VECTOR_TABLE: &str = "vector_entries";
const DEFAULT_CONTEXT_GRAPH_TABLE: &str = "graph_nodes";
const CONTEXT_VECTOR_DIM: usize = 32;

pub(super) fn build_graph_index(
    layout: &AgentProjectLayout,
    max_files: usize,
    memory_persist: bool,
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
    let sqlite_report = write_context_sqlite(layout, &payload, memory_persist)?;

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
    _memory_persist: bool,
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

    // Phase 1 Context: Add session memory table for long SDLC cycles
    conn.execute(
        "CREATE TABLE IF NOT EXISTS session_memory (
            thread_id TEXT PRIMARY KEY,
            context_history_json TEXT NOT NULL,
            phase_state TEXT NOT NULL,
            updated_at_ms INTEGER NOT NULL
        )",
        [],
    )?;

    let tx = conn.unchecked_transaction()?;
    tx.execute(&format!("DELETE FROM {vector_table}"), [])?;
    tx.execute(&format!("DELETE FROM {graph_table}"), [])?;

    // Migrate session history if thread_sessions.json exists
    let state_dir = layout.agents_root.join("state");
    let session_file = state_dir.join("thread_sessions.json");
    if session_file.exists() {
        if let Ok(content) = std::fs::read_to_string(&session_file) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(threads) = json.get("threads").and_then(|v| v.as_array()) {
                    for thread in threads {
                        let thread_id = thread
                            .get("thread_id")
                            .and_then(|v| v.as_str())
                            .unwrap_or("unknown");
                        let default_history = serde_json::Value::Array(vec![]);
                        let history = thread.get("history").unwrap_or(&default_history);
                        let phase = thread
                            .get("lifecycle_state")
                            .and_then(|v| v.as_str())
                            .unwrap_or("active");
                        let now = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis() as u64;

                        let _ = tx.execute(
                            "INSERT OR REPLACE INTO session_memory (thread_id, context_history_json, phase_state, updated_at_ms) 
                             VALUES (?1, ?2, ?3, ?4)",
                            params![thread_id, serde_json::to_string(history)?, phase, now],
                        );
                    }
                }
            }
        }
    }

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
