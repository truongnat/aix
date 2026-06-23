# AGENTS.md

This repository uses [ai-engineering-harness](https://github.com/truongnat/ai-engineering-harness).

## Capability source

Read `.ai-harness/AGENTS.md` first. Use `.ai-harness/commands/`, `.ai-harness/skills/`, `.ai-harness/workflows/`, `.ai-harness/patterns/`, and `.ai-harness/templates/` for pack capabilities.

If `.ai-harness/` is missing, reinstall with project capability cache (`install.sh` with `--install-cache` or private project default).

## Project state

Read `.harness/` profile artifacts (`HARNESS.md`, `TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, `MEMORY.md`, goals) before acting.

## Tool routing

| Task | Preferred | Fallback |
| --- | --- | --- |
| Code search | `rg` | `grep` |
| File discovery | `find` | glob patterns |
| Git context | `git diff`, `git log`, `git status --short` | none |
| Rich docs | structured markdown files in repo | direct file reads |
| Verification evidence | exact commands with exit codes | explicit manual check notes |

## Completion Gate

Work is not complete until the active goal is implemented, verified with evidence, and status matches proof.

## Memory Discipline

Store only durable, non-sensitive lessons in `.harness/MEMORY.md`.

## Command Discipline

Use the harness loop: start → discuss → plan → run → verify → ship → remember. Use `harness-map` only for manual context refresh.

## Forbidden

- Implementing without an approved plan
- Claiming tests passed without running them
- Writing secrets, credentials, tokens, customer data, or private business data into `.harness/`
- Continuing after a blocking question without an answer
- Inventing acceptance criteria not grounded in the goal or plan
