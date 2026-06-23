---
allowed_tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# harness-run

## Purpose

Execute the approved plan in small, surgical steps without silent scope drift.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

## Minimum Read Set

- `.harness/STATE.md`
- active session current `PLAN-*.md`
- active session `CHANGE_SPEC.md` if present
- active session `TASKS.md` if present
- active session `GOAL.md`
- relevant implementation files

## Preconditions

- active session `GOAL.md` exists and describes the current goal.
- active session current `PLAN-*.md` exists.
- the active session plan includes **Approval Status** with `status: approved` (not `draft` or `blocked`).
- active session `TASKS.md` contains at least one actionable task when task tracking is in use.

## Session Start Requirement

If active session is unknown or `.harness/STATE.md` has not been established for this chat, stop and run or redirect to `harness-start`. Do not implement until Session Start completes.

## When To Use

- after the active session current `PLAN-*.md` is approved
- when implementation is ready to begin
- when resuming planned work

## Skills To Use

- `using-harness`
- `executing-plans`
- `using-git-worktrees` when implementation should be isolated from the current branch
- `requesting-code-review` when an independent review gate is part of the approved plan
- `test-driven-development` when behavior changes
- `writing-skills` when adding or revising skills

## Delegated Workers

Dispatch the write-enabled `fixer` worker only for bounded remediation explicitly authorized by the main agent.

Rules:

- fixer is one-shot and must not dispatch other workers
- keep remediation within approved plan boundaries
- record delegated runs with `templates/WORKER_RUN.md` and consume the shared `### Agent Result` envelope
- route back to `harness-verify` after fixer changes before any ship claim

Do not use fixer for general implementation work; that remains main-agent `harness-run` responsibility. See `docs/delegated-workers.md`.

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-run.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-run` freestyle when the prompt template is available.

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check `git`, search tools, and any required local tooling before choosing an execution strategy.

## Tool Routing

- use `rg` before `grep` for search
- use `git diff` for review ranges and change inspection
- use `git worktree` only when parallel isolation is useful and safe
- use `markitdown` for rich docs only when available
- if a required capability is unavailable, stop and return `Blocked`

## Step-By-Step Workflow

1. Re-read `.harness/STATE.md` and the active session plan before making changes.
2. Execute the next smallest approved task only.
3. Keep changes tightly aligned to the recorded scope.
4. Use optional worktree isolation when the plan or repo risk warrants it, but do not make it a hidden requirement.
5. Update active session `TASKS.md` and `.harness/STATE.md` as status changes.
6. Record deviations or blockers instead of improvising around them.
7. Treat self-reports as notes only; verification evidence belongs in `harness-verify`.
8. Stop once the implementation is complete enough to inspect or verify.

## Required Outputs

- implemented repository changes required by the approved plan
- active session `TASKS.md` updated with in-progress, completed, or blocked status
- `.harness/STATE.md` updated with current execution state
- recorded deviations or blockers when reality diverges from plan

## Redirect Behavior

- If the active session plan is missing, unapproved, stale, or contradicted by new findings, stop and redirect to `harness-plan`.
- If the goal is unclear, stop and redirect to `harness-discuss`.
- If implementation is complete enough to verify, stop and redirect to `harness-verify`.

## Blocking Questions

- If the active session plan is not approved, the agent must stop and ask the user instead of starting implementation.
- If the next task is unclear, missing, or contradicted by new findings, ask for clarification or re-planning and stop.
- Record execution blockers in `.harness/sessions/<active-session>/BLOCKED.md` when the correct next step is known but preconditions are missing.

## Failure Conditions

- Do not continue after asking a blocking question.

The agent MUST stop if the active session plan is missing or not approved.

The agent MUST NOT continue if acceptance criteria are unclear or `.harness/BLOCKED.md` is unresolved.

The agent MUST NOT:

- implement unplanned work
- claim completion when implementation is partial
- update active session `VERIFY.md` as a substitute for real verification
- treat self-reporting as verification evidence
- hide scope drift, skipped tasks, or blockers
- continue after asking a blocking question

## Completion Gate

The command is complete when the approved planned scope is implemented or explicitly paused, task and state artifacts reflect reality, and the next phase is `harness-verify` rather than more improvisation.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/sessions/<active-session>/GOAL.md`
- Write: `.harness/sessions/<active-session>/TASKS.md`, `.harness/STATE.md`

## Human Approval

Ask for approval before taking destructive actions, widening scope, or adopting a materially different implementation approach than the one in the active session current `PLAN-*.md`.

## Notes

`harness-run` follows the plan. It does not authorize new scope by itself.
