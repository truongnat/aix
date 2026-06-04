# harness-verify

## Purpose

Gather fresh evidence that the implemented work meets the goal before any completion or shipping claim.

## Minimum Read Set

- `.harness/STATE.md`
- active session current `PLAN-*.md`
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
- use code graph tools only when installed or configured
- if verification requires a missing capability with no safe fallback, stop and return `Blocked`

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
- Do not record only passing checks and omit skipped or blocked evidence.
- Do not reuse stale verification output as if it were fresh.
- Do not hide required human verification behind a passed status.

## Completion Gate

The command is complete when the active session `VERIFY.md` contains fresh evidence that clearly supports a pass, fail, blocked, or pending-human-verification result, with explicit blockers and no chance of mistaking missing evidence for a pass.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/TASKS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`, `.harness/sessions/<active-session>/VERIFY.md`
- Write: `.harness/sessions/<active-session>/VERIFY.md`, `.harness/STATE.md`, optional `.harness/REVIEW.md`

## Human Approval

Ask for approval if a known verification gap must be accepted for shipping or if a failing result suggests changing scope or rollback strategy.

## Notes

`harness-verify` is evidence collection, not optimism. Partial or blocked verification must be labeled explicitly.
