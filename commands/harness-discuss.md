# harness-discuss

## Purpose

Synthesize existing harness artifacts and produce a decision-oriented discussion that clarifies goals, review outcomes, or plan direction before the next phase.

## System Prompt Requirement

This command MUST be executed under the ai-engineering-harness system prompt.

Read:
- `.ai-harness/agent-system/SYSTEM_PROMPT.md`
- `.ai-harness/agent-system/RESPONSE_CONTRACT.md`

## Minimum Read Set

- `.harness/STATE.md` if present
- active session `GOAL.md` if present
- `.harness/REVIEW.md` if present
- active session current `PLAN-*.md` if present
- active session `DISCUSSION.md` if present
- `.harness/CONTEXT.md` if present
- `.harness/DECISIONS.md` if present
- `.harness/HAZARDS.md` if present

## Preconditions

- There is either a current goal to clarify or an existing artifact that needs interpretation.
- Implementation is not already the correct next command.

## When To Use

- before planning non-trivial work when goal or scope is still forming
- when `.harness/REVIEW.md` exists and the team needs a merge or ship decision discussion
- when the active session current `PLAN-*.md` exists and direction needs reconciliation
- when scope is ambiguous and no actionable artifact exists yet

## Skills To Use

- `using-harness`
- `discussing-goals`
- `brainstorming` when the goal needs option-shaping before planning
- `remembering` when prior decisions constrain the solution

## Step-By-Step Workflow

1. Read the minimum read set in order of artifact priority, including typed memory artifacts when they shape scope or constraints.
2. If `.harness/REVIEW.md` exists, synthesize it into a decision-oriented discussion instead of repeating the whole review.
3. Otherwise restate the request, separate confirmed requirements from assumptions, and make the following explicit before handing off to planning: goal, success criteria, scope boundaries, constraints, and unresolved risks.
4. Compare realistic approaches, recommend one, and note tradeoffs the planner must preserve.
4. Write or update the active session `DISCUSSION.md`.
5. End with the next recommended command, not a vague prompt.

## Required Outputs

- active session `DISCUSSION.md` updated on every successful run
- explicit goal, success criteria, scope boundaries, constraints, unresolved risks, and preferred direction
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

The command is complete when the discussion artifact makes the goal, success criteria, boundaries, constraints, assumptions, unresolved risks, and preferred direction explicit enough to plan or decide without inventing requirements.

## Artifact Paths

- Read: `.harness/STATE.md`, `.harness/sessions/<active-session>/GOAL.md`, `.harness/REVIEW.md`, `.harness/sessions/<active-session>/PLAN-*.md`, `.harness/sessions/<active-session>/DISCUSSION.md`, `.harness/CONTEXT.md`, `.harness/DECISIONS.md`, `.harness/HAZARDS.md`, `.harness/sessions/<active-session>/REMEMBER.md`
- Write: `.harness/sessions/<active-session>/DISCUSSION.md`, optional `.harness/sessions/<active-session>/GOAL.md` or `.harness/REQUIREMENTS.md`

## Human Approval

Ask for approval when choosing between materially different approaches or waiving blockers surfaced by review artifacts.

## Notes

`harness-discuss` reduces ambiguity by acting on existing artifacts first. It is not a passive intake form.
