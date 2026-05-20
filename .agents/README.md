# .agents Package Guide

This folder is the package root used by `agentic-sdlc` for workflows, skills, roles, rules, templates, memory, and persisted run state.

## What users should know first

There are two workflow types in this repo:

- `planning/review` workflows: analyze, review, score risk, and report. These are useful for SDLC control, but they do not create software artifacts unless they include explicit mutation steps.
- `artifact-producing` workflows: create or modify files and then validate the result. These are the workflows new users expect when they say "build me X".

If you want a concrete first run that creates files, start with:

```bash
cargo run -- --workflow-id starter/app-builder --task "create a todo list app"
```

That workflow uses a skill in `.agents/skills` to generate a machine-readable app blueprint, then the harness writes files and runs validation.

There is also a fully fixed example workflow:

```bash
cargo run -- --workflow-id starter/todo-cli-node
```

## Structure

- `workflows/`: executable workflow definitions (`.md` only)
- `skills/`: skill definitions (`SKILL.md` per skill folder)
- `roles/`: role prompts for `agent.llm_subagent`
- `rules/`: runtime and project policy rules
- `templates/`: reusable prompt templates for workflow entry points
- `state/`: persisted workflow snapshots and thread session state
- `memory/`: vector and graph context indexes
- `docs/`: workflow standards and package guidance

## Standard workflow shape

Canonical workflow guidance lives in:

- [.agents/docs/WORKFLOW_STANDARD.md](/Users/truongdev/Documents/projects/labs/agentic-sdlc/.agents/docs/WORKFLOW_STANDARD.md)

The practical rule is simple:

- If a workflow claims to build software, it must contain explicit mutation steps such as `agent.write_file` or `agent.run_script`.
- If it only uses LLM/reporting steps, present it as planning/review, not as app generation.

## Security contract

Workflows that use internet-capable skills must include a security gate step.

Recommended standard:

- Step ID: `internet_security_check`
- Skill: a security-review skill appropriate to the workflow domain

This contract is enforced by `cargo run -- workflow check`.

## Validation

```bash
cargo run -- workflow check
cargo run -- workflow quality-skills --strict
```

## Entry docs

- Runtime/project docs: `README.md`
- CLI command reference: `docs/CLI_USAGE.md`
- Gemini-focused package contract: `.agents/GEMINI.md`
