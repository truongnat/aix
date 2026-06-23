---
allowed_tools:
  - Read
  - Bash(git diff, git log, npm test, tsc --noEmit, node bin/validate.js)
  - Grep
---
# harness-verify

## Purpose

Gather fresh evidence that the implemented work meets the goal before any completion or shipping claim.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

## Minimum Read Set

- `.harness/STATE.md`
- active session current `PLAN-*.md`
- active session `CHANGE_SPEC.md` if present
- active session `GOAL.md`
- active session `TASKS.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present
- changed files
- active session `VERIFY.md` if present

## Preconditions

- There is completed or inspectable implementation work to verify.
- The goal and plan define what evidence should prove success.
- The operator is ready to run checks fresh instead of inferring success.

## Session Start Requirement

If active session is unknown or `.harness/STATE.md` has not been established for this chat, stop and run or redirect to `harness-start`. Do not verify until Session Start completes.

## When To Use

- after implementation changes
- before any completion claim
- before merge, handoff, or release
- after bugfixes, refactors, and risky documentation changes

## Skills To Use

- `using-harness`
- `verification`
- `verification-before-completion` when the risk of optimistic claims is high
- `code-review` when inspection is part of the gate

## Delegated Workers

When independent review or verification evidence should come from a focused delegated run, dispatch harness workers instead of improvising provider-specific subagent behavior.

- `reviewer`: read-only inspection against goal, plan, diff, and verification status
- `verifier`: fresh command execution and evidence capture for VERIFY artifacts

Rules:

- only the main agent may dispatch workers
- workers must not dispatch other workers
- every worker run must produce `templates/WORKER_RUN.md` lifecycle output in the active session when delegated execution occurs
- consume the shared `### Agent Result` envelope rather than freeform conversation transcripts

On Claude Code, native worker surfaces install to `.claude/agents/harness-*.md`. On Cursor and Codex, use adapter-level delegation while preserving the same worker contract. See `docs/delegated-workers.md`.

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-verify.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-verify` freestyle when the prompt template is available.

## Tool Discovery

- Read `.harness/TOOL_CONTEXT.md` first when it exists.
- Otherwise run `node scripts/discover-tools.js --markdown` when available.
- If the script is unavailable, manually check the tools needed for verification.

## Tool Routing

- use `git diff` for scoped review context
- use `rg` before `grep` when locating evidence or changed behavior
- use [CodeGraph](https://github.com/colbymchenry/codegraph) (`codegraph`) when installed and indexed; otherwise fall back to file tree plus search
- if verification requires a missing capability with no safe fallback, stop and return `Blocked`

## Current Working State

!`git diff --stat HEAD`

!`git status --short`

## Step-By-Step Workflow

1. Identify the exact checks that prove the claim, using `.harness/INDEX.md` for reusable verification recipes and `.harness/HAZARDS.md` for regression focus when present.
2. Run the checks fresh.
3. Record automated checks, manual checks, evidence, deferred human checks, known gaps, and ship blockers in the active session `VERIFY.md`.
4. Compare the evidence against the goal and plan.
5. Write `passed`, `failed`, `blocked`, or `pending human verification` status into the active session `VERIFY.md`.
6. Stop if evidence is missing, contradictory, or failed.

## Required Outputs

- active session `VERIFY.md` with status, tests run, manual checks, evidence, known gaps, deferred human checks when needed, and ship blockers
- `.harness/STATE.md` updated with verification status
- optional `.harness/REVIEW.md` if inspection findings are required

## Redirect Behavior

- If implementation is not yet inspectable, stop and redirect to `harness-run`.
- If the plan does not define what success means, stop and redirect to `harness-plan`.
- If the goal itself is unclear, stop and redirect to `harness-discuss`.

## Blocking Questions

- If the required verification command is unknown, the acceptance criteria are ambiguous, or manual review is required, the agent must stop and ask the user.
- If a failing check needs product judgment, record `status: blocked` in `.harness/sessions/<active-session>/VERIFY.md` or write `.harness/sessions/<active-session>/BLOCKED.md` before continuing.
- Do not upgrade missing evidence into a pass by assumption.

## Failure Conditions

- Do not assume success because the change looks correct.

The agent MUST stop if verification commands were not run or evidence is missing.

The agent MUST NOT mark verification as passed without command output, exit codes, or explicit manual evidence.

The agent MUST NOT:

- assume success because the change looks correct
- record only passing checks and omit skipped or blocked evidence
- reuse stale verification output as if it were fresh
- hide required human verification behind a passed status
- continue after asking a blocking question

## Completion Gate

The command is complete when the active session `VERIFY.md` contains fresh evidence that clearly supports a pass, fail, blocked, or pending-human-verification result, with explicit blockers and no chance of mistaking missing evidence for a pass.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/sessions/<active-session>/VERIFY.md`
- Write: `.harness/sessions/<active-session>/VERIFY.md`, `.harness/STATE.md`, optional `.harness/REVIEW.md`

## Human Approval

Ask for approval if a known verification gap must be accepted for shipping or if a failing result suggests changing scope or rollback strategy.

## Notes

`harness-verify` is evidence collection, not optimism. Partial or blocked verification must be labeled explicitly.
