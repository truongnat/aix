# Gemini CLI

## Purpose

Explain how Gemini CLI should consume `ai-engineering-harness` as a capability pack inside a target repository.

## Runtime Fit

Gemini CLI is a good fit when the user wants terminal-oriented agent sessions over a target repository.

Gemini CLI should use the target repository's installed `AGENTS.md`, commands, skills, templates, and `.harness/` artifacts.

Gemini CLI should not treat the `ai-engineering-harness` source repo as the product repo unless maintaining the harness itself.

## Consumption Model

Use Gemini CLI against the target repository after the harness operating surface has been installed or copied there.

The source pack is only the canonical source. Product work happens in the target repository.

## Recommended Setup

Use the current setup flow:

```bash
node install.js --target ../my-project --dry-run
node install.js --target ../my-project
node validate.js --target ../my-project --profile-only
```

Run these commands from the source pack repo, then run Gemini CLI from or against the target repo for product work, and keep `.harness/` artifacts in the target repo.

## What Gemini CLI Should Read

Inside the target repository, Gemini CLI should read:

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

## CLI Session Rules

- start from the target repo working directory whenever possible
- keep prompts explicit about which repo is the source pack and which repo is the target product repo
- keep one active goal per session when possible
- ask the user to run validation commands if the runtime cannot run them directly
- report not-run commands honestly

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
- do not invent Gemini CLI integration behavior
- do not treat structural validation as proof that the application is correct

## Common Mistakes

- running Gemini CLI from the source pack repo and treating it as the product repo
- leaving the current working directory ambiguous between source pack and target repo
- skipping the read-first pass over installed docs and `.harness/` artifacts
- claiming commands were run when they were only proposed

## Completion Checklist

- Gemini CLI is pointed at the target repository, not the source pack
- installed `AGENTS.md` and supporting docs were read first
- `.harness/` profile artifacts exist or were updated intentionally
- active goal artifacts were read before execution
- validation flow is understood as structural-only
