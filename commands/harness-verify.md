# harness-verify

## Purpose

Gather fresh evidence that the implemented work meets the goal before any completion or shipping claim.

## Minimum Read Set

- `.harness/PLAN.md`
- `.harness/GOAL.md`
- `.harness/TASKS.md` if present
- changed files
- `.harness/VERIFY.md` if present

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
- `code-review` when inspection is part of the gate

## Step-By-Step Workflow

1. Identify the exact checks that prove the claim.
2. Run the checks fresh.
3. Record automated checks, manual checks, evidence, and known gaps in `.harness/VERIFY.md`.
4. Compare the evidence against the goal and plan.
5. Write `passed`, `failed`, `blocked`, or `pending` status into `.harness/VERIFY.md`.
6. Stop if evidence is missing, contradictory, or failed.

## Required Outputs

- `.harness/VERIFY.md` with status, tests run, manual checks, evidence, and known gaps
- `.harness/STATE.md` updated with verification status
- optional `.harness/REVIEW.md` if inspection findings are required

## Redirect Behavior

- If implementation is not yet inspectable, stop and redirect to `harness-run`.
- If the plan does not define what success means, stop and redirect to `harness-plan`.
- If the goal itself is unclear, stop and redirect to `harness-discuss`.

## Failure Conditions

- Do not assume success because the change looks correct.
- Do not record only passing checks and omit skipped or blocked evidence.
- Do not reuse stale verification output as if it were fresh.

## Completion Gate

The command is complete when `.harness/VERIFY.md` contains fresh evidence that clearly supports a pass, fail, blocked, or pending result and no one could mistake missing evidence for a pass.

## Artifact Paths

- Read: `.harness/PLAN.md`, `.harness/GOAL.md`, `.harness/TASKS.md`, `.harness/VERIFY.md`
- Write: `.harness/VERIFY.md`, `.harness/STATE.md`, optional `.harness/REVIEW.md`

## Human Approval

Ask for approval if a known verification gap must be accepted for shipping or if a failing result suggests changing scope or rollback strategy.

## Notes

`harness-verify` is evidence collection, not optimism. Partial or blocked verification must be labeled explicitly.
