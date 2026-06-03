# harness-run

## Purpose

Execute the approved plan in small, surgical steps without silent scope drift.

## Minimum Read Set

- `.harness/PLAN.md`
- `.harness/TASKS.md` if present
- `.harness/GOAL.md`
- `.harness/STATE.md`
- relevant implementation files

## Preconditions

- `.harness/GOAL.md` exists and describes the current goal.
- `.harness/PLAN.md` exists.
- `.harness/PLAN.md` records explicit approval, such as `Status: approved` or equivalent approval notes.
- `.harness/TASKS.md` contains at least one actionable task when task tracking is in use.

## When To Use

- after `.harness/PLAN.md` is approved
- when implementation is ready to begin
- when resuming planned work

## Skills To Use

- `using-harness`
- `executing-plans`
- `test-driven-development` when behavior changes
- `writing-skills` when adding or revising skills

## Step-By-Step Workflow

1. Re-read `.harness/PLAN.md` before making changes.
2. Execute the next smallest approved task only.
3. Keep changes tightly aligned to the recorded scope.
4. Update `.harness/TASKS.md` and `.harness/STATE.md` as status changes.
5. Record deviations or blockers instead of improvising around them.
6. Stop once the implementation is complete enough to inspect or verify.

## Required Outputs

- implemented repository changes required by the approved plan
- `.harness/TASKS.md` updated with in-progress, completed, or blocked status
- `.harness/STATE.md` updated with current execution state

## Redirect Behavior

- If the plan is missing, unapproved, stale, or contradicted by new findings, stop and redirect to `harness-plan`.
- If the goal is unclear, stop and redirect to `harness-discuss`.
- If implementation is complete enough to verify, stop and redirect to `harness-verify`.

## Failure Conditions

- Do not implement unplanned work.
- Do not claim completion if implementation is partial.
- Do not update `.harness/VERIFY.md` as a substitute for real verification.
- Do not hide scope drift, skipped tasks, or blockers.

## Completion Gate

The command is complete when the approved planned scope is implemented or explicitly paused, task and state artifacts reflect reality, and the next phase is `harness-verify` rather than more improvisation.

## Artifact Paths

- Read: `.harness/PLAN.md`, `.harness/TASKS.md`, `.harness/GOAL.md`, `.harness/STATE.md`
- Write: `.harness/TASKS.md`, `.harness/STATE.md`

## Human Approval

Ask for approval before taking destructive actions, widening scope, or adopting a materially different implementation approach than the one in `.harness/PLAN.md`.

## Notes

`harness-run` follows the plan. It does not authorize new scope by itself.
