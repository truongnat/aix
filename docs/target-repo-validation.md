# Target Repository Validation

This document defines the current lightweight validation mode for a host repository that has adopted `ai-engineering-harness` and produced `.harness/` profile artifacts.

Profile validation is the first implemented target-repository step.
Goal-level validation is the second implemented target-repository step.

For the session-memory architecture, root `.harness/` should behave as the index/router while active working artifacts live under `.harness/sessions/<active-session>/`.

## Run Validation From The Source Pack

`validate.js` normally runs from the **harness source pack** repository with `--target <target-repo>`.

```bash
# From ai-engineering-harness (source pack), not from the target repo
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal <goal-id>
```

Target repositories do not receive `validate.js` in the default installed surface from `install.js`. That is intentional: one canonical validator stays with the pack source unless a future contract adds an optional in-target copy.

Install copies the markdown operating surface into the target repo; structural checks still use the source pack’s `validate.js` against the target path.

## Frozen Contracts

- `--profile-only` validates the [frozen target profile contract](frozen-target-profile-contract.md)
- `--goal <goal-id>` validates the [frozen goal artifact contract](frozen-goal-artifact-contract.md) (after profile checks)

## Frozen Validation Contract

Validation behavior for v1.0.0 is recorded in [frozen-validation-contract.md](frozen-validation-contract.md).

Clarifications:

- validation is **structural-only** (paths and headings, not body semantics)
- target validation runs from the **source pack** with `--target <path>`
- `node validate.js --target <path>` without `--goal` means **profile** validation (same contract as `--profile-only`)

## What Target Repo Validation Means

Target repo validation means checking whether a host repository contains the minimum adopted harness structure and profile artifacts needed to operate the harness safely and consistently.

The validator should focus on structural contract checks, not application correctness.

## What It Checks Now

The current target validation modes check:

- required root files exist in the host repository
- `.harness/` exists
- required harness profile artifacts exist
- required goal artifacts exist when `--goal <goal-id>` is requested
- obvious structural gaps are reported with clear, actionable messages
- safety boundaries are preserved during validation output

Goal artifact validation is now implemented for `--target <path> --goal <goal-id>`. Optional context checks still come later.

## What It Should Not Check

The current validation mode does not:

- judge whether application code is correct
- prove that the selected workflow or team pattern is the best possible choice
- scan arbitrary large files or perform repository-wide content analysis
- print secrets, tokens, customer data, or private business data
- act like a linter for the product codebase
- imply that a passing structural check proves the repository is ready to ship

A passing target validation run proves only that the required harness artifacts exist and match the expected structural contract.

## Required Root Files In A Host Repo

Current required checks at the repository root:

- `AGENTS.md` exists
- `.harness/` exists

These are the minimum entry points for an adopted target repository.

## Required `.harness/` Profile Artifacts

The current profile-level validator checks for:

- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`

These files define the adopted operating model for the host repository.

This profile-level check is the first implemented target validation mode.

## Optional Project Context Artifacts

The validator may recognize these as optional but useful project context in a later step:

- `.harness/PROJECT.md`
- `.harness/STATE.md`
- `.harness/CONTEXT.md`
- `.harness/ROADMAP.md`

Missing optional context artifacts should not fail validation by default unless a future mode explicitly requires them.

When a repository adopts session memory, `.harness/STATE.md` becomes the routing entrypoint for active work and session-local files remain the source of truth.

## Optional Goal-Level Artifacts

When a goal is present or a goal-specific mode is requested, the validator looks for:

- `.harness/goals/<goal-id>/GOAL.md`
- `.harness/goals/<goal-id>/PLAN.md`
- `.harness/goals/<goal-id>/TASKS.md`
- `.harness/goals/<goal-id>/VERIFY.md`
- `.harness/goals/<goal-id>/REMEMBER.md`

Goal-level validation should remain scoped to the requested goal and should not assume that every repository always has active goals.

Goal-level validation is implemented after profile validation and remains structural-only.

## Commands

These commands are currently implemented:

```bash
node validate.js
node validate.js --target ../my-project
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal google-login
```

## Command Guide

- `node validate.js`
  - checks this harness repository's required files and heading contracts
  - does not check any adopted host repository
  - passing output:
    `Harness validation passed. Checked <count> required files/contracts.`
  - failing output starts with:
    `Harness validation failed:`
- `node validate.js --target ../my-project`
  - checks the target repository root plus required `.harness/` profile artifacts
  - does not check goal artifacts unless `--goal <goal-id>` is requested
  - does not check application code correctness
  - passing output:
    `Target repository validation passed. Checked profile contract.`
  - failing output starts with:
    `Target repository validation failed:`
- `node validate.js --target ../my-project --profile-only`
  - explicitly runs the same profile-level target validation as `--target <path>`
  - does not validate goal artifacts
  - does not check application code correctness
  - passing output:
    `Target repository validation passed. Checked profile contract.`
  - failing output starts with:
    `Target repository validation failed:`
- `node validate.js --target ../my-project --goal google-login`
  - checks the target repository profile first, then validates `.harness/goals/google-login/`
  - does not judge whether the underlying Google login implementation is correct
  - passing output:
    `Target repository validation passed. Checked goal contract: google-login.`
  - failing output starts with:
    `Target repository validation failed:`

If a target validation run fails, use [docs/validation-troubleshooting.md](validation-troubleshooting.md) for quick fixes.

Usage safety notes:

- target validation is structural only
- target validation does not inspect application source files outside the expected harness paths
- target validation does not prove application correctness, release readiness, or workflow quality
- `--profile-only` and `--goal` are mutually exclusive
- missing goal ids after `--goal` return a usage error

## What Target Validation Does Not Prove

Target validation does not prove:

- the application code works
- the selected workflow is optimal
- the goal implementation is complete
- secrets are absent from the rest of the repository
- the repository is ready to ship

## Safety Checks

Target repo validation should be structural and contract-focused.

Safety rules:

- validation should never print secrets
- validation should not scan arbitrary large files
- validation should not judge implementation correctness
- validation should avoid echoing file contents unless a future mode explicitly needs a short safe excerpt
- validation output should name missing or malformed artifacts by path, not by sensitive content

## Validation Output Shape

The validator stays simple and predictable.

Recommended output shape:

- one summary line: pass or fail
- a flat list of missing or invalid paths
- optional warnings for missing optional context files in a later step
- exit code `0` on pass
- non-zero exit code on failure

Example shape:

```txt
Target repository validation failed:
- Missing required path: .harness/TEAM.md
- Missing required path: .harness/GATES.md
- Warning: optional path not found: .harness/ROADMAP.md
```

## Recommended Failure Messages

Recommended failure style:

- `Missing required path: AGENTS.md`
- `Missing required path: .harness/`
- `Missing required path: .harness/HARNESS.md`
- `Missing required path: .harness/goals/google-login/PLAN.md`
- `Goal artifact set is incomplete for: google-login`
- `Profile artifacts exist, but goal validation was requested and no goal artifacts were found for: google-login`

Recommended warning style:

- `Warning: optional path not found: .harness/PROJECT.md`
- `Warning: optional path not found: .harness/ROADMAP.md`

## Deferred Scope

Still deferred:

- optional context warnings and informational checks
- anything beyond structural validation of the expected harness paths

## Non-Goals

This validation mode is not intended to become:

- a runtime platform
- a deep repository scanner
- a product-code quality judge
- a secret detection engine
- a replacement for human review
- a proof that a repository is implementation-complete or production-ready
