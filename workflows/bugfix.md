# Bugfix Workflow

## When To Use

Use this when restoring expected behavior, fixing regressions, or addressing broken flows.

## Command Sequence

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

## Decision Tree

- Have you reproduced the bug?
- If yes: do you have a failing test or explicit repro steps?
- If yes: fix the root cause, rerun the targeted check, then verify related behavior.
- If no: improve the repro first or document the manual verification gap before fixing.

## Required Artifacts

- `.harness/STATE.md`
- `.harness/sessions/<active-session>/GOAL.md`
- `.harness/sessions/<active-session>/DISCUSSION.md`
- `.harness/sessions/<active-session>/PLAN-001.md` or the current numbered plan
- `.harness/sessions/<active-session>/VERIFY.md`

## Recommended Skills

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `writing-plans`
- `executing-plans`
- `test-driven-development`
- `verification`
- `remembering`

## Verification Expectations

- the bug is reproduced or described with enough precision to verify
- the fix is minimal and in scope
- regression checks confirm the broken behavior no longer fails
- related behavior is checked for collateral damage

## Failure Handling

- if reproduction is unclear, stop and improve the problem statement
- if root cause is uncertain, do not ship a speculative fix as complete
- if the fix requires major redesign, return to discussion and planning

## Artifact Checklist

- `GOAL.md` describes the symptom or repro clearly enough to verify.
- `PLAN-*.md` states the minimal fix approach and regression strategy.
- `VERIFY.md` records before/after evidence or an explicit manual gap.
- `REMEMBER.md` captures the root cause if this failure mode can recur.

## Completion Criteria

The bugfix workflow is complete when the bug is isolated, the root cause is understood well enough to justify the fix, regression evidence exists, and the durable lesson is captured safely.
