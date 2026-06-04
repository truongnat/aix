# harness-start

## Purpose

Start a session by loading the active `.harness/` state and deciding which command should run next.

## Minimum Read Set

- `AGENTS.md`
- `.harness/INDEX.md` if present
- `.harness/STATE.md` if present
- active session `SESSION.md` if present
- active session `GOAL.md` if present
- active session current `PLAN-*.md` if present
- active session `DISCUSSION.md` if present

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

1. Read `.harness/INDEX.md` and `.harness/STATE.md` before touching code.
2. Detect whether an active session already exists under `.harness/sessions/<active-session>/`.
3. If an active session exists, read its `SESSION.md`, `GOAL.md`, current `PLAN-*.md`, and related artifacts before deciding what to do next.
4. Decide whether to continue the active session, start a new session, or archive the old session and start a new one.
5. Refresh `.harness/STATE.md` and `.harness/INDEX.md` if the recorded routing state is stale.
6. Stop with a clear next action instead of drifting into implementation.

## Required Outputs

- `.harness/STATE.md` updated if stale
- `.harness/INDEX.md` updated if stale
- a short session-start summary
- one explicit next command

## Redirect Behavior

- If the repository is unfamiliar and impact scope is unclear, redirect to `harness-map`.
- If no current goal exists, redirect to `harness-discuss`.
- If a valid approved plan exists and execution is the next step, redirect to `harness-run`.

## Failure Conditions

- Do not treat `harness-start` as implementation.
- Do not claim the next command is clear if the goal or state is still ambiguous.
- Do not assume the previous session ended cleanly without checking active session artifacts.
- Do not continue if both flat root working artifacts and session-local working artifacts appear active.

## Completion Gate

The command is complete when the session has a clear current state, the relevant artifacts are loaded, and the next command is explicit.

## Artifact Paths

- Read: `.harness/INDEX.md`, `.harness/STATE.md`, `.harness/sessions/<active-session>/SESSION.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/sessions/<active-session>/PLAN-*.md`
- Write: `.harness/STATE.md`, `.harness/INDEX.md`

## Human Approval

Ask for approval if the previously recorded plan is invalid and a materially different direction is required.

## Notes

Use `harness-start` to restore discipline at session boundaries. Root `.harness` is the router; sessions own working artifacts.
