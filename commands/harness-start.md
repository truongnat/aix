# harness-start

## Purpose

Start a session by loading the active `.harness/` state and deciding which command should run next.

## Minimum Read Set

- `AGENTS.md`
- `.harness/STATE.md` if present
- `.harness/GOAL.md` if present
- `.harness/PLAN.md` if present
- `.harness/CONTEXT.md` if present

## Preconditions

- The session is beginning, resuming, or switching to a new repository area.
- No implementation should start until the next command is explicit.

## When To Use

- at the start of a new task
- when resuming paused work
- when switching to a different subsystem or repository area

## Skills To Use

- `using-harness`
- `mapping-codebase`
- `discussing-goals` when the goal is still ambiguous

## Step-By-Step Workflow

1. Read the active goal, state, context, and plan artifacts before touching code.
2. Confirm whether the task is new, resumed, blocked, or ready for verification.
3. Decide which harness command should run next.
4. Refresh `.harness/STATE.md` if the recorded status is stale.
5. Stop with a clear next action instead of drifting into implementation.

## Required Outputs

- `.harness/STATE.md` updated if stale
- a short session-start summary
- one explicit next command

## Redirect Behavior

- If the repository is unfamiliar and impact scope is unclear, redirect to `harness-map`.
- If no current goal exists, redirect to `harness-discuss`.
- If a valid approved plan exists and execution is the next step, redirect to `harness-run`.

## Failure Conditions

- Do not treat `harness-start` as implementation.
- Do not claim the next command is clear if the goal or state is still ambiguous.
- Do not assume the previous session ended cleanly without checking artifacts.

## Completion Gate

The command is complete when the session has a clear current state, the relevant artifacts are loaded, and the next command is explicit.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/GOAL.md`, `.harness/PLAN.md`, `.harness/CONTEXT.md`
- Write: `.harness/STATE.md`

## Human Approval

Ask for approval if the previously recorded plan is invalid and a materially different direction is required.

## Notes

Use `harness-start` to restore discipline at session boundaries. It should be short and explicit.
