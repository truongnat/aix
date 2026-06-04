# OpenCode

## Purpose

Explain how OpenCode should consume `ai-engineering-harness` as a capability pack inside a target repository.

## Runtime Fit

OpenCode is a good fit when the user wants an open agent workflow over a target repository with explicit markdown operating context.

OpenCode should use the target repository's installed `AGENTS.md`, commands, skills, templates, and `.harness/` artifacts.

OpenCode should not treat the `ai-engineering-harness` source repo as the product repo unless maintaining the harness itself.

## Consumption Model

Use OpenCode against the target repository after the harness operating surface has been installed or copied there.

The source pack is only the canonical source. Product work happens in the target repository.

## Recommended Setup

Use the current setup flow:

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
node validate.js --target ../my-project --profile-only
```

Run these commands from the source pack repo, then run OpenCode from or against the target repo for product work, and keep `.harness/` artifacts in the target repo.

## What OpenCode Should Read

Inside the target repository, OpenCode should read:

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

- start from the target repo working directory whenever possible
- keep prompts explicit about source pack vs target repo
- keep one active goal per session when possible
- preserve goal artifact updates when plan or verification state changes
- report commands that were not run honestly
- treat validation output as structural only

## First Prompt

> Read `AGENTS.md`, `docs/consume-as-pack.md`, `docs/install-to-profile-walkthrough.md`, and `docs/target-repo-validation.md`. Treat this directory as the target product repository. Do not use the `ai-engineering-harness` source repo as the product repo. Inspect `.harness/` artifacts and summarize the current harness state before making changes.

## Harness-Build Prompt

> Start the harness workflow for this target repository. Create or update only the `.harness/` artifacts needed by the current workflow stage, keep them repository-specific, and do not implement application code until the command loop is ready.

## Goal Execution Prompt

> Using the current `.harness/` profile and `.harness/goals/<goal-id>/` artifacts, plan and execute the next task. Keep the task scoped, update `TASKS.md` and `VERIFY.md` when state changes, and stop before shipping if verification evidence is missing.

## Validation Prompt

> Run or ask me to run: `node validate.js --target <path> --profile-only` and `node validate.js --target <path> --goal <goal-id>`. Treat validation as structural only, not proof of application correctness. Fix exact missing paths and headings.

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repository
- do not invent OpenCode integration behavior
- do not treat structural validation as proof that the application is correct

## Common Mistakes

- running OpenCode in the source pack repo and treating it as the product repo
- leaving prompts ambiguous about source pack vs target repo
- skipping the read-first pass over installed docs and `.harness/` artifacts
- forgetting to update goal artifacts when plan or verification state changes

## Completion Checklist

- OpenCode is pointed at the target repository, not the source pack
- installed `AGENTS.md` and supporting docs were read first
- `.harness/` profile artifacts exist or were updated intentionally
- active goal artifacts were read before execution
- validation flow is understood as structural-only
