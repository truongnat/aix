# Workflow Standard

This document defines the canonical workflow shapes for `agentic-sdlc`.

## Workflow Classes

There are two supported workflow classes:

1. `planning/review` workflows
   - Used for analysis, review, risk assessment, reporting, and approvals.
   - Typical output is structured JSON, findings, or gates.
   - These workflows do not claim to create product artifacts unless they include explicit mutation steps.

2. `artifact-producing` workflows
   - Used to create or modify code, files, tests, or project assets.
   - Must include explicit filesystem or command mutation steps such as `agent.write_file` or `agent.run_script`.
   - Must end in verification, not just narration.

## Canonical Step Order

### Planning/Review

1. `intent_analysis`
2. `execution_plan`
3. `risk_review`
4. `internet_security_check`
5. `workflow_report`
6. `report_quality_gate`
7. `simulation_fallback_gate` when LLM output is release-critical
8. `finalize`

### Artifact-Producing

1. `intent_analysis`
2. `execution_plan`
3. `internet_security_check`
4. `apply_changes`
5. `validation_gate`
6. `risk_review`
7. `workflow_report`
8. `report_quality_gate`
9. `simulation_fallback_gate` when LLM output is release-critical
10. `finalize`

## Required Semantics

- If a workflow claims to build software, it must contain explicit mutation steps.
- `validation_gate` must run a real command, not a placeholder `echo`.
- `internet_security_check` is required for workflows using internet-capable skills.
- `workflow_report` must summarize what actually happened, not what was planned.
- `report_quality_gate` must consume `{{workflow_report}}`.
- `simulation_fallback_gate` should block degraded LLM outputs before completion.

## Anti-Patterns

- LLM-only "implement" steps that do not mutate files.
- Placeholder validation commands such as `echo "validate feature"`.
- Review/report workflows presented as app-building workflows.
- Starter docs that route users through eval/PR flows before first artifact creation.

## Starter Guidance

Use these rules for the first user experience:

- The top-level docs should present one practical artifact-producing workflow first.
- Starter workflows should be short, concrete, and verifiable.
- Domain packs and advanced workflows should come after the happy path, not before it.
