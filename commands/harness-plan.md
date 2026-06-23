---
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# harness-plan

## Purpose

Translate the agreed goal into an explicit, reviewable implementation plan.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

## Minimum Read Set

- `.harness/STATE.md`
- active session `GOAL.md`
- active session `DISCUSSION.md` if present
- active session `CHANGE_SPEC.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present

## Preconditions

- A current goal exists.
- Goal and scope are explicit enough to break into ordered work.
- Implementation has not started for the current scope.

## Session Start Requirement

If active session or `.harness/STATE.md` routing is unknown for this chat, stop and run or redirect to `harness-start` (Session Start protocol). Do not plan until session state is established.

## When To Use

- after `harness-discuss`
- before implementation or content changes
- when an existing plan is missing, stale, or invalidated

## Skills To Use

- `using-harness`
- `writing-plans`
- `brainstorming` when the plan still depends on an unresolved approach choice
- `mapping-codebase` when affected areas need more detail

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-plan.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-plan` freestyle when the prompt template is available.

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check `git`, `rg`, `grep`, and task-specific tooling.

## Tool Routing

- use `rg` before `grep` for code search
- use `git diff` or `git log` when planning depends on repository context
- use `markitdown` for rich documents only when available
- use [CodeGraph](https://github.com/colbymchenry/codegraph) (`codegraph`) when installed and indexed; otherwise fall back to file tree plus search
- if a required capability is unavailable, stop and ask a concrete fallback question

## Step-By-Step Workflow

1. Restate the approved goal and scope after recalling relevant decisions, hazards, and reusable commands.
2. Identify the files, systems, and `.harness/` artifacts that will change.
3. Break the work into small ordered tasks that are easy to verify independently.
4. Define verification strategy for each task cluster, approval checkpoints, and not-run risks.
5. If the work changes behavior, capture the delta in `templates/CHANGE_SPEC.md` using ADDED, MODIFIED, and REMOVED requirements.
6. Record assumptions, dependencies, rollback considerations, and scope boundaries.
7. Write the plan to `.harness/sessions/<active-session>/PLAN-001.md` or the next numbered plan and update session `TASKS.md` if task tracking is needed.
8. Stop before implementation.

## Required Outputs

- active session `PLAN-*.md`
- active session `TASKS.md` when tasks need tracking
- `.harness/STATE.md` updated with planning status

## Redirect Behavior

- If the goal is missing or still materially ambiguous, stop and redirect to `harness-discuss`.
- If the affected area is not understood well enough to plan safely, redirect to `harness-map`.
- If implementation has already begun without a plan, stop, document the gap, and return to planning before further edits.

## Blocking Questions

- If the goal is still ambiguous, approval expectations are unclear, or verification requirements cannot be named concretely, the agent must ask the user and stop.
- If a missing artifact or unresolved tradeoff prevents an execution-ready plan, record the blocker in `.harness/BLOCKED.md` and redirect to the earliest safe command.
- Do not continue by assuming acceptance criteria, approval ownership, or verification commands.

## Failure Conditions

- Do not mix planning with implementation.

The agent MUST stop if the goal is unclear or required session artifacts are missing.

The agent MUST NOT continue if the user has not approved scope that requires human sign-off.

The agent MUST NOT:

- write a vague plan with no verification strategy
- mix planning with implementation
- mark the plan execution-ready if approval status is still unclear
- continue after asking a blocking question

## Completion Gate

The command is complete when the active session plan contains concrete ordered work, explicit scope, affected areas, task-sized verification expectations, approval checkpoints, an **Approval Status** block (`status: draft` until human approval, then `status: approved`), and implementation has not yet started.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/DISCUSSION.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`
- Write: `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/STATE.md`

## Human Approval

Ask for approval before leaving `harness-plan` if the plan changes scope materially, introduces risky operations, or requires a tradeoff the human has not accepted.

## Notes

`harness-plan` is a hard stop before `harness-run`. If the plan is not clear enough to execute, the command is not complete.
