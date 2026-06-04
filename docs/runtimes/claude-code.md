# Claude Code

## Purpose

Explain how Claude Code should consume `ai-engineering-harness` as a capability pack inside a target repository.

## Runtime Fit

Claude Code is a good fit for this harness because it can work from repository-local markdown context.

It should use the target repository's installed `AGENTS.md`, commands, skills, templates, and `.harness/` artifacts.

It should not treat the source pack repository as the application repository.

## Consumption Model

Use Claude Code against the target repository after the harness operating surface has been installed or copied there.

The source pack is only the canonical source. Product work happens in the target repository.

## Recommended Setup

Use the current setup flow:

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
node validate.js --target ../my-project --profile-only
```

Run these commands from the source pack repository, then open Claude Code in the target repository for actual product work.

## What Claude Code Should Read

Inside the target repository, Claude Code should read:

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

## First Prompt

> Read `AGENTS.md`, `docs/consume-as-pack.md`, `docs/install-to-profile-walkthrough.md`, and `docs/target-repo-validation.md`. Treat this repository as the target product repository. Do not use the `ai-engineering-harness` source repo as the product repo. Then inspect the existing `.harness/` artifacts and summarize the current harness state before making any changes.

## Harness-Build Prompt

> Start the harness workflow for this target repository. Create or update only the `.harness/` artifacts needed by the current workflow stage, keep them repository-specific, and do not implement application code until the command loop is ready.

## Goal Execution Prompt

> Using the current `.harness/` profile and `.harness/goals/<goal-id>/` artifacts, plan and execute the next task. Follow the command loop, update `TASKS.md` and `VERIFY.md` as work progresses, and stop before shipping if verification evidence is missing.

## Validation Prompt

> Run or ask me to run: `node validate.js --target <path> --profile-only` and `node validate.js --target <path> --goal <goal-id>`. Treat validation as structural only, not proof of application correctness.

## Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repository
- do not invent Claude-specific integration behavior
- do not treat structural validation as proof that the application is correct

## Common Mistakes

- opening Claude Code in the source pack repo and treating it like the product repo
- skipping the read-first pass over installed docs and `.harness/` artifacts
- jumping into implementation before the harness or goal artifacts are clear
- treating validation as the same thing as product verification

## Completion Checklist

- Claude Code is pointed at the target repository, not the source pack
- installed `AGENTS.md` and supporting docs were read first
- `.harness/` profile artifacts exist or were updated intentionally
- active goal artifacts were read before execution
- validation flow is understood as structural-only
