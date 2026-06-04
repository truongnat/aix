# Frozen Goal Artifact Contract

## Purpose

Record the target repository goal artifact contract frozen for `v1.0.0` as part of `v0.9.0` Stable Contract Freeze.

## Contract Status

**Frozen for v1.0.0** (v0.9.0 Step 3).

Authoring guide: [target-repo-validation.md](target-repo-validation.md). Validation design: [target-repo-validation.md](target-repo-validation.md). Goal artifact shape: `.harness/goals/<goal-id>/`.

## Required Goal Directory

- `.harness/goals/<goal-id>/`

`<goal-id>` is **path-based**: the directory name is the goal identifier passed to `--goal`.

## Required Goal Files

- `GOAL.md`
- `PLAN.md`
- `TASKS.md`
- `VERIFY.md`
- `REMEMBER.md`

## Required Headings Per File

Heading **presence** is validated. Order and body content are not validated.

### GOAL.md

- Goal
- Scope
- In Scope
- Out Of Scope
- Acceptance Criteria

### PLAN.md

- Goal
- Scope
- Tasks
- Verification Strategy
- Risks
- Human Approval

### TASKS.md

- Goal
- Task List
- Review Notes
- Current State

### VERIFY.md

- Goal
- Verification Commands
- Manual Verification
- Regression Checks
- Not Run
- Result
- Evidence

### REMEMBER.md

- Date
- Project
- Problem
- Decision
- Solution
- Reuse Guidance
- Sensitive Data Check

Enforced in `validate.js` as `goalTemplateHeadings` (derived from `goalArtifactHeadings` on the flutter-google-login example paths).

## What Is Guaranteed

- `node validate.js --target <path> --goal <goal-id>` checks the goal directory, five files, and headings above
- goal mode also runs the [frozen target profile contract](frozen-target-profile-contract.md) checks first
- optional goal files (for example `DISCUSSION.md`, `SHIP.md`) are allowed but not required by v1.0.0

## What Is Not Guaranteed

- application correctness or that acceptance criteria are met
- CI integration or automated test execution
- semantic validation of task lists or verification evidence
- automatic goal generation from setup tooling

## Allowed Additive Changes

- additional files under `.harness/goals/<goal-id>/` not checked by v1 validator
- additional `##` sections in required files if required headings remain
- new examples that satisfy the same heading contracts

## Breaking Changes

See [breaking-change-policy.md](breaking-change-policy.md).

Breaking for this contract:

- removing any required goal file
- renaming required goal files (for example `VERIFY.md`)
- removing or renaming required headings above
- changing goal id resolution without migration

## Validation Behavior

From the **source pack** root:

```bash
node validate.js --target <path> --goal <goal-id>
```

- validates frozen target profile contract first
- then checks `.harness/goals/<goal-id>/` and each required file with required headings
- does **not** prove the product implements the goal

## Relationship To Templates

Goal templates under `templates/` (`GOAL.md`, `PLAN.md`, `TASKS.md`, `VERIFY.md`, `REMEMBER.md`) guide authoring. Target repos place adapted copies under `.harness/goals/<goal-id>/`.

## Relationship To Target Validation

[target-repo-validation.md](target-repo-validation.md) describes the target repository validation posture. This document is the **freeze record** for v1.0.0 goal structure and headings.

## Relationship To target-repo-validation.md

[target-repo-validation.md](target-repo-validation.md) documents `--goal <goal-id>`. That mode validates this frozen contract.

## Relationship To harness-example-to-target-layout.md

These files map directly to `.harness/goals/<goal-id>/*` in target repos.

## v1.0.0 Notes

- five files per goal directory; goal id from path segment
- dogfood used `google-login` and `health-check` goal ids with this shape
- examples may include extra sections; normalize to required headings before relying on validation
