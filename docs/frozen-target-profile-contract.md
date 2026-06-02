# Frozen Target Profile Contract

## Purpose

Record the target repository `.harness/` profile artifact contract frozen for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 3).

Authoring guide: [harness-build-contract.md](harness-build-contract.md). Validation design: [target-repo-validation.md](target-repo-validation.md). Templates: `templates/HARNESS.md` through `templates/MEMORY.md`.

## Required Target Directory

- `.harness/` at the target repository root

## Required Profile Files

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

## Required Root Entry (Profile Mode)

`--profile-only` also requires:

- `AGENTS.md` at the target repository root

## Required Headings Per File

Heading **presence** is validated (`##` lines). Order and body content are not validated.

### HARNESS.md

- Purpose
- Current Status
- Scope
- Operating Model
- Assumptions
- Unknowns
- Human Review

### TEAM.md

- Purpose
- Current Status
- Selected Pattern
- Roles
- Handoff Rules
- Escalation Rules
- Human Review

### SKILLS.md

- Purpose
- Current Status
- Selected Core Skills
- Selected Skill Packs
- Excluded Skills Or Packs
- Human Review

### WORKFLOW.md

- Purpose
- Current Status
- Selected Workflow
- Command Sequence
- Execution Rules
- Human Review

### GATES.md

- Purpose
- Current Status
- Quality Gates
- Evidence Requirements
- Stop Conditions
- Human Review

### MEMORY.md

- Purpose
- Current Status
- Recall Before Planning
- Remember After Shipping
- Memory Types
- Forbidden Content
- Human Review

Enforced in `validate.js` as `harnessHeadings`, `teamHeadings`, `selectedSkillsHeadings`, `workflowHeadings`, `gatesHeadings`, and `memoryHeadings` on `.harness/*` paths.

## What Is Guaranteed

- `node validate.js --target <path> --profile-only` checks paths and headings above
- templates in the source pack use the same heading contracts for authoring consistency
- optional extra sections may exist if all required headings remain present

## What Is Not Guaranteed

- body semantics, quality, or correctness of profile content
- automatic profile generation from `harness-build` or tooling
- consistency between profile files beyond structural headings
- optional project context files under `.harness/` (for example `PROJECT.md`) unless a future contract adds them

## Allowed Additive Changes

- additional `##` sections not listed above if required headings remain
- richer examples under `examples/` that still satisfy heading contracts when mapped to `.harness/`
- documentation clarifications in [harness-build-contract.md](harness-build-contract.md)

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- removing any required profile file
- removing or renaming any required heading above
- making previously optional sections required in `validate.js` without migration

## Validation Behavior

From the **source pack** root:

```bash
node validate.js --target <path> --profile-only
```

- checks `AGENTS.md` and `.harness/` exist
- checks each profile file exists
- checks required headings per file
- does **not** validate application code or semantic profile quality

## Relationship To Templates

`templates/HARNESS.md`, `TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, and `MEMORY.md` are the authoring templates. Target repos should copy or adapt them into `.harness/` with the same heading contract.

## Relationship To harness-build-contract.md

[harness-build-contract.md](harness-build-contract.md) describes what `harness-build` should produce. This document is the **freeze record** for v1.0.0 target profile structure.

## Relationship To target-repo-validation.md

[target-repo-validation.md](target-repo-validation.md) explains how to run target validation. `--profile-only` validates this frozen contract.

## v1.0.0 Notes

- six profile files under `.harness/` plus `AGENTS.md` for profile mode
- map examples with [harness-example-to-target-layout.md](harness-example-to-target-layout.md)
- goal validation also requires a passing profile contract before checking goal files
