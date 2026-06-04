# Cursor

## Purpose

Explain how Cursor should consume `ai-engineering-harness` as a capability pack inside a target repository.

## Runtime Fit

Cursor is a good fit when the harness operating surface is installed in the same workspace as the target product repository.

Cursor should use repo-local markdown context: `AGENTS.md`, commands, skills, templates, and `.harness/` artifacts.

Cursor should not treat the `ai-engineering-harness` source repo as the product workspace unless that repo itself is being maintained.

## Consumption Model

Use Cursor against the target repository after the harness operating surface has been installed or copied there.

The source pack is only the canonical source. Product work happens in the target repository workspace.

## Recommended Setup

Use the current setup flow:

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
node validate.js --target ../my-project --profile-only
```

Run these commands from the source pack repo, open Cursor in the target repo for product work, and keep `.harness/` artifacts in the target repo.

## What Cursor Should Read

Inside the target repository, Cursor should read:

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

## Workspace Rules

- use one target repo per product task when possible
- do not mix source pack maintenance and target product work in the same prompt unless explicitly working on the harness repo
- keep generated profile and goal artifacts in the target repo
- do not let Cursor summarize away validation failures; fix exact files and headings

## First Prompt

> Read `AGENTS.md`, `docs/consume-as-pack.md`, `docs/install-to-profile-walkthrough.md`, and `docs/target-repo-validation.md`. Treat this Cursor workspace as the target product repository. Do not use the `ai-engineering-harness` source repo as the product repo. Inspect `.harness/` artifacts and summarize the current harness state before making changes.

## Harness-Build Prompt

> Start the harness workflow for this Cursor workspace. Create or update only the `.harness/` artifacts needed by the current workflow stage, keep them repository-specific, and do not implement application code until the command loop is ready.

## Goal Execution Prompt

> Using the current `.harness/` profile and `.harness/goals/<goal-id>/` artifacts, plan and execute the next task in this workspace. Follow the command loop, update `TASKS.md` and `VERIFY.md` as work progresses, and stop before shipping if verification evidence is missing.

## Validation Prompt

> Run or ask me to run: `node validate.js --target <path> --profile-only` and `node validate.js --target <path> --goal <goal-id>`. Treat validation as structural only, not proof of application correctness. Fix exact missing paths and headings.

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repository
- do not invent Cursor extension or integration behavior
- do not treat structural validation as proof that the application is correct

## Common Mistakes

- opening Cursor in the source pack repo and treating it as the product workspace
- mixing harness-repo maintenance and target-repo work in one ambiguous prompt
- skipping the read-first pass over installed docs and `.harness/` artifacts
- treating validation output as a summary instead of fixing exact missing files or headings

## Completion Checklist

- Cursor is pointed at the target repository, not the source pack
- installed `AGENTS.md` and supporting docs were read first
- `.harness/` profile artifacts exist or were updated intentionally
- active goal artifacts were read before execution
- validation flow is understood as structural-only
