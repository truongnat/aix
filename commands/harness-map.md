---
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# harness-map

## Purpose

Refresh repository/current context manually when Session Start context is stale, missing, or needs explicit regeneration.

`harness-map` is a backward-compatible, advanced/manual context refresh command. It is not required in the normal workflow because `harness-start` already performs context mapping. Use it when you need to regenerate or manually inspect the same context-mapping behavior outside Session Start. It should not plan or implement code.

Treat this as the Explore phase of the plan/explore/execute pipeline. When the repository has delegated workers available, prefer an `explorer` run that returns a condensed map instead of raw file dumps.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

## Minimum Read Set

- `AGENTS.md`
- `.harness/STATE.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present
- `.harness/REMEMBER.md` if present
- repository docs that define constraints, conventions, commands, or quality gates when relevant

## Preconditions

- The repository can be inspected safely.
- The operator is not already in the middle of approved implementation work that should continue under `harness-run`.

## When To Use

- at the start of a session in an unfamiliar repository
- when manual context refresh is needed after large repository changes
- when `.harness/STATE.md` looks stale
- when impact scope is unclear
- when provider entrypoints or harness artifacts need to be rediscovered

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `remembering` when prior durable decisions affect the task

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check `git`, `rg`, `grep`, and any task-specific tools.

## Tool Routing

- use `rg` before `grep` when available
- use `git diff` and `git log` for repository context before asking the user for pasted context
- use [CodeGraph](https://github.com/colbymchenry/codegraph) (`codegraph`) when installed and indexed; otherwise fall back to file tree plus search
- if a required capability is unavailable, stop and return `Blocked` with a concrete fallback question

## Step-By-Step Workflow

1. Read root router artifacts first, then read the active session artifacts before inspecting code, with `.harness/HAZARDS.md` first when present.
2. Inventory the repository structure and identify likely entry points, boundaries, or ownership areas.
3. Identify important paths, conventions, commands, provider entrypoints, harness artifacts, quality gates, and project constraints.
4. Separate observed facts from inferred structure.
5. Capture open questions, risks, and missing context in `.harness/CONTEXT.md` or `.harness/STATE.md`.
6. Stop once the repository/current context is refreshed well enough to resume the normal workflow without guessing.

## Required Outputs

- repository/current context notes updated with observed facts, important paths, conventions, commands, provider entrypoints, harness artifacts, quality gates, project constraints, likely affected areas when relevant, and open questions
- an explicit statement of what should run next: `harness-start`, `harness-discuss`, `harness-plan`, `harness-run`, or `harness-verify`

## Redirect Behavior

- If repository/current context is already fresh enough for the current work, stop and redirect to the next needed command instead of remapping.
- If artifact conflicts are discovered, stop and redirect to `harness-discuss`.

## Failure Conditions

- Do not claim the repo is mapped if the affected area is still guesswork.
- Do not invent architecture, ownership, or system behavior.
- Do not drift into planning or implementation.

## Completion Gate

The command is complete when the relevant repository structure, important paths, conventions, available commands, provider entrypoints, harness artifacts, quality gates, project constraints, and major unknowns are explicit enough to support briefing, discussion, or planning without invented facts.

## Artifact Paths

- Read: `.harness/INDEX.md`, `.harness/STATE.md`, `.harness/HAZARDS.md`, `.harness/REMEMBER.md`
- Write: `.harness/CONTEXT.md`, `.harness/STATE.md`, `.harness/sessions/<active-session>/NOTES.md`

## Human Approval

Ask for approval if the repository map shows broader constraints, hazards, or quality gates that materially change the expected direction of the work.

## Notes

`harness-map` is about manual situational awareness refresh. Keep it for compatibility and advanced use, but do not teach it as part of the primary workflow.
