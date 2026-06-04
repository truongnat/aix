# harness-plan

## Purpose

Translate the agreed goal into an explicit, reviewable implementation plan.

## Minimum Read Set

- `.harness/GOAL.md`
- `.harness/DISCUSSION.md` if present
- `.harness/STATE.md`
- `.harness/CONTEXT.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/HAZARDS.md` if present
- `.harness/INDEX.md` if present

## Preconditions

- A current goal exists.
- Goal and scope are explicit enough to break into ordered work.
- Implementation has not started for the current scope.

## When To Use

- after `harness-discuss`
- before implementation or content changes
- when an existing plan is missing, stale, or invalidated

## Skills To Use

- `using-harness`
- `writing-plans`
- `brainstorming` when the plan still depends on an unresolved approach choice
- `mapping-codebase` when affected areas need more detail

## Dispatch Template

For execution-facing dispatch, read `.ai-harness/prompt-templates/harness-plan.md`.

Use this command doc as the reference contract for phase behavior and artifact discipline. Use the prompt template as the execution instruction. Do not execute `harness-plan` freestyle when the prompt template is available.

## Step-By-Step Workflow

1. Restate the approved goal and scope after recalling relevant decisions, hazards, and reusable commands.
2. Identify the files, systems, and `.harness/` artifacts that will change.
3. Break the work into small ordered tasks that are easy to verify independently.
4. Define verification strategy for each task cluster, approval checkpoints, and not-run risks.
5. Record assumptions, dependencies, rollback considerations, and scope boundaries.
6. Write the plan to `.harness/PLAN.md` and update `.harness/TASKS.md` if task tracking is needed.
7. Stop before implementation.

## Required Outputs

- `.harness/PLAN.md`
- `.harness/TASKS.md` when tasks need tracking
- `.harness/STATE.md` updated with planning status

## Redirect Behavior

- If the goal is missing or still materially ambiguous, stop and redirect to `harness-discuss`.
- If the affected area is not understood well enough to plan safely, redirect to `harness-map`.
- If implementation has already begun without a plan, stop, document the gap, and return to planning before further edits.

## Blocking Questions

- If the goal is still ambiguous, approval expectations are unclear, or verification requirements cannot be named concretely, the agent must ask the user and stop.
- If a missing artifact or unresolved tradeoff prevents an execution-ready plan, record the blocker in `.harness/BLOCKED.md` and redirect to the earliest safe command.
- Do not continue by assuming acceptance criteria, approval ownership, or verification commands.

## Failure Conditions

- Do not write a vague plan with no verification strategy.
- Do not mix planning with implementation.
- Do not mark the plan execution-ready if approval status is still unclear.

## Completion Gate

The command is complete when `.harness/PLAN.md` contains concrete ordered work, explicit scope, affected areas, task-sized verification expectations, approval checkpoints, an **Approval Status** block (`status: draft` until human approval, then `status: approved`), and implementation has not yet started.

## Artifact Paths

- Read: `.harness/GOAL.md`, `.harness/DISCUSSION.md`, `.harness/STATE.md`, `.harness/CONTEXT.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/INDEX.md`
- Write: `.harness/PLAN.md`, `.harness/TASKS.md`, `.harness/STATE.md`

## Human Approval

Ask for approval before leaving `harness-plan` if the plan changes scope materially, introduces risky operations, or requires a tradeoff the human has not accepted.

## Notes

`harness-plan` is a hard stop before `harness-run`. If the plan is not clear enough to execute, the command is not complete.
