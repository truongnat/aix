# Core Loop

## When To Use

Use this as the default workflow when no more specific task workflow is a better fit.

## Command Sequence

`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember`

By default, `harness-ship` chains into `harness-remember` in the same turn when ship status is `shipped`. See `docs/phase-discipline.md` for skip conditions.

## Decision Tree

- Is the current phase clear from `STATE.md`?
- If no: run `harness-start` and restore context first.
- If yes: are the next-command preconditions satisfied?
- If no: redirect to the earlier phase instead of continuing.
- If yes: complete the phase outputs before moving forward.

## Required Artifacts

- `.harness/STATE.md`
- `.harness/sessions/<active-session>/GOAL.md`
- `.harness/sessions/<active-session>/PLAN-001.md` or the current numbered plan
- `.harness/sessions/<active-session>/TASKS.md` when spanning multiple steps
- `.harness/sessions/<active-session>/VERIFY.md`
- `.harness/sessions/<active-session>/SHIP.md` when shipping

## Recommended Skills

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `writing-plans`
- `executing-plans`
- `verification`
- `remembering`

## Verification Expectations

- do not leave `Plan` without a concrete plan
- do not leave `Run` without updated task or state artifacts
- do not leave `Verify` without pass, fail, or partial evidence
- do not leave `Remember` with sensitive data

## Failure Handling

- return to `harness-discuss` if the goal or scope changes
- return to `harness-plan` if execution reveals material plan gaps
- stop shipping if verification is partial or failed

## Artifact Checklist

- `STATE.md` points to the active session and next command.
- `GOAL.md` and `PLAN-*.md` exist before implementation.
- `TASKS.md` reflects real progress when the work spans multiple steps.
- `VERIFY.md` records pass, fail, or gap evidence before ship.
- `SHIP.md` and `REMEMBER.md` are only completed when their prerequisites are met.

## Completion Criteria

The workflow is complete when the goal is implemented in scope, verified with evidence, summarized for handoff, and followed by durable non-sensitive memory.
