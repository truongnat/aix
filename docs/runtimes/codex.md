# Codex

## Purpose

Explain how Codex should consume `ai-engineering-harness` as a capability pack inside a target repository.

## Runtime Fit

Codex is a good fit when tasks can be scoped through repo-local markdown instructions and target artifacts.

Codex should use the target repository's installed `AGENTS.md`, commands, skills, templates, and `.harness/` artifacts.

Codex should not treat the `ai-engineering-harness` source repo as the product repo unless maintaining the harness itself.

## Consumption Model

Use Codex against the target repository after the harness operating surface has been installed or copied there.

The source pack is only the canonical source. Product work happens in the target repository.

## Recommended Setup

Use the current setup flow:

```bash
node bin/aih.js install --target ../my-project --dry-run
node bin/aih.js install --target ../my-project
node bin/validate.js --target ../my-project --profile-only
```

Run these commands from the source pack repo, then open or run Codex against the target repo for product work, and keep `.harness/` artifacts in the target repo.

## What Codex Should Read

Inside the target repository, Codex should read:

- `AGENTS.md`
- `docs/consume-as-pack.md`
- `docs/install-to-profile-walkthrough.md`
- `docs/target-repo-validation.md`
- `.harness/HARNESS.md`
- `.harness/TEAM.md`
- `.harness/SKILLS.md`
- `.harness/WORKFLOW.md`
- `.harness/GATES.md`
- `.harness/MEMORY.md`
- active `.harness/goals/<goal-id>/` artifacts

## Session Rules

- start each task by reading target-repo harness artifacts
- keep the task scoped to one active goal when possible
- update goal artifacts when plan or verification state changes
- do not skip validation because the code change looks small
- report not-run verification honestly

## First Prompt

> Read `AGENTS.md`, `docs/consume-as-pack.md`, `docs/install-to-profile-walkthrough.md`, and `docs/target-repo-validation.md`. Treat this repository as the target product repository. Do not use the `ai-engineering-harness` source repo as the product repo. Inspect `.harness/` artifacts and summarize the current harness state before making any changes.

## Harness-Build Prompt

> Start the harness workflow for this target repository. Create or update only the `.harness/` artifacts needed by the current workflow stage, keep them repository-specific, and do not implement application code until the command loop is ready.

## Goal Execution Prompt

> Using the current `.harness/` profile and `.harness/goals/<goal-id>/` artifacts, plan and execute the next task. Keep the task scoped, update `TASKS.md` and `VERIFY.md` when state changes, and stop before shipping if verification evidence is missing.

## Validation Prompt

> Run or ask me to run: `node bin/validate.js --target <path> --profile-only` and `node bin/validate.js --target <path> --goal <goal-id>`. Treat validation as structural only, not proof of application correctness. Fix exact missing paths and headings.

## Delegated Workers (Adapter)

Codex is an **adapter**-level delegated worker target in v1.

Use repo-local instruction surfaces and prompt-driven delegation while preserving the same worker contract:

- canonical worker ids from `workers/`
- shared `### Agent Result` envelope
- `templates/WORKER_RUN.md` lifecycle artifacts

Do not overclaim native worker support. See [delegated-workers.md](../delegated-workers.md).

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repository
- do not invent Codex integration behavior
- do not treat structural validation as proof that the application is correct

## Common Mistakes

- running Codex in the source pack repo and treating it as the product repo
- skipping the read-first pass over installed docs and `.harness/` artifacts
- letting one session drift across multiple active goals without explicit scope control
- claiming verification completeness when commands or checks were not actually run

## Completion Checklist

- Codex is pointed at the target repository, not the source pack
- installed `AGENTS.md` and supporting docs were read first
- `.harness/` profile artifacts exist or were updated intentionally
- active goal artifacts were read before execution
- validation flow is understood as structural-only
