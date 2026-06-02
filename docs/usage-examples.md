# Usage Examples

These examples show how to prompt an agent to use the harness commands in a host repository. Keep markdown as the source of truth and keep the active project state in `.harness/`.

## `harness-map`

Use when the repository or affected area is still unfamiliar.

Example prompt:

> Run `harness-map` for this repository. Read the active `.harness/` artifacts first, map the auth and onboarding areas, and update `.harness/CONTEXT.md` with affected files, observed facts, and unknowns.

## `harness-start`

Use when starting a session or resuming paused work.

Example prompt:

> Run `harness-start`. Read `AGENTS.md`, `.harness/GOAL.md`, `.harness/STATE.md`, and `.harness/PLAN.md`, then tell me which command should run next and refresh `.harness/STATE.md` if it is stale.

## `harness-discuss`

Use when the goal, scope, or tradeoffs are not fully clear.

Example prompt:

> Run `harness-discuss` for “add Google login while preserving guest mode.” Clarify scope boundaries, identify risks, compare options, and write the agreed direction into `.harness/DISCUSSION.md`.

## `harness-plan`

Use when the goal is clear and implementation should be planned, not started.

Example prompt:

> Run `harness-plan`. Write `.harness/PLAN.md` for the approved goal, include in-scope and out-of-scope items, small tasks, verification strategy, risks, rollback plan, and stop before implementation.

## `harness-run`

Use when there is an approved plan and implementation should begin.

Example prompt:

> Run `harness-run` against the approved `.harness/PLAN.md`. Execute only the next planned task, keep changes surgical, update `.harness/TASKS.md`, and stop if the scope changes materially.

## `harness-verify`

Use when evidence is needed before claiming the work is complete.

Example prompt:

> Run `harness-verify`. Use the checks defined in `.harness/PLAN.md`, record what was run and what was not run in `.harness/VERIFY.md`, and do not assume success without evidence.

## `harness-ship`

Use after verification to summarize the result and prepare handoff.

Example prompt:

> Run `harness-ship`. Read `.harness/VERIFY.md`, summarize what changed and what was verified in `.harness/SHIP.md`, and list any remaining follow-ups or risks explicitly.

## `harness-remember`

Use after verified work ships to save durable lessons.

Example prompt:

> Run `harness-remember`. Capture the durable lesson from this change in `.harness/REMEMBER.md`, include reuse guidance, and make sure no secrets, tokens, customer data, or private business data are stored.
