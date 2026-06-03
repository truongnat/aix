# harness-discuss

## Purpose

Synthesize existing harness artifacts and produce a decision-oriented discussion that clarifies goals, review outcomes, or plan direction before the next phase.

## Minimum Read Set

- `.harness/STATE.md` if present
- `.harness/GOAL.md` if present
- `.harness/REVIEW.md` if present
- `.harness/PLAN.md` if present
- `.harness/DISCUSSION.md` if present
- `.harness/CONTEXT.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/HAZARDS.md` if present

## Preconditions

- There is either a current goal to clarify or an existing artifact that needs interpretation.
- Implementation is not already the correct next command.

## When To Use

- before planning non-trivial work when goal or scope is still forming
- when `.harness/REVIEW.md` exists and the team needs a merge or ship decision discussion
- when `.harness/PLAN.md` exists and direction needs reconciliation
- when scope is ambiguous and no actionable artifact exists yet

## Skills To Use

- `using-harness`
- `discussing-goals`
- `remembering` when prior decisions constrain the solution

## Step-By-Step Workflow

1. Read the minimum read set in order of artifact priority, including typed memory artifacts when they shape scope or constraints.
2. If `.harness/REVIEW.md` exists, synthesize it into a decision-oriented discussion instead of repeating the whole review.
3. Otherwise restate the request, separate confirmed requirements from assumptions, and compare realistic approaches.
4. Write or update `.harness/DISCUSSION.md`.
5. End with the next recommended command, not a vague prompt.

## Required Outputs

- `.harness/DISCUSSION.md` updated on every successful run
- explicit scope, constraints, and preferred direction
- one recommended next command

## Redirect Behavior

- If the repository is still unmapped, redirect to `harness-map`.
- If no current goal or usable artifact exists, stop and request or create a goal through `harness-start` or direct human clarification.
- If the discussion is already settled enough for implementation planning, redirect to `harness-plan`.

## Failure Conditions

- Do not ask for clarification when sufficient local context exists.
- Do not ask the user what mode they want when local artifacts already answer the situation.
- Do not duplicate full review text instead of synthesizing it.
- Do not plan or implement inside `harness-discuss`.
- Do not claim branch freshness without evidence.

## Forbidden when REVIEW.md exists

- `What output do you need?`
- asking the user whether to summarize or re-run a readable review instead of synthesizing it first
- more than at most one closing question

## Completion Gate

The command is complete when the discussion artifact makes the goal, boundaries, assumptions, and preferred direction explicit enough to plan or decide without inventing requirements.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/GOAL.md`, `.harness/REVIEW.md`, `.harness/PLAN.md`, `.harness/DISCUSSION.md`, `.harness/CONTEXT.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/REMEMBER.md`
- Write: `.harness/DISCUSSION.md`, optional `.harness/GOAL.md` or `.harness/REQUIREMENTS.md`

## Human Approval

Ask for approval when choosing between materially different approaches or waiving blockers surfaced by review artifacts.

## Notes

`harness-discuss` reduces ambiguity by acting on existing artifacts first. It is not a passive intake form.
