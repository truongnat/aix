---
name: executing-plans
description: 'Skill: executing-plans'
x-kind: process
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---
# executing-plans

## Purpose

Execute an approved plan step by step without drifting scope or skipping state updates.

## When To Use

- after a plan has been approved
- when resuming planned implementation work
- when progress must stay tightly aligned to documented steps

## When Not To Use

- before a plan exists
- when the request is still being clarified
- when the work is a pure review with no implementation

## Inputs

- approved plan
- current task list and state
- relevant implementation files

## Workflow

1. Re-read the current plan before editing.
2. Execute the next smallest planned task.
3. Keep the change surgical and in scope.
4. Update task and state artifacts as progress changes.
5. Stop and re-plan if assumptions or scope change materially.

## Operating Principles

- The plan is the source of execution truth.
- Small steps reduce risk and rework.
- Unplanned discoveries should be documented, not hidden.
- Verification preparation should happen continuously without replacing the verify phase.

## Reasoning Procedure

1. Restate the approved step and the artifact it should change.
2. Check the current session state and any blockers before acting.
3. Derive the smallest execution action that matches the plan.
4. Stop and report blocked if the step is not approved or cannot be verified.

## Action Loop

- Thought: identify the next approved step and required evidence.
- Action: edit the planned artifact or run the planned command.
- Observation: record the actual result and whether it matched the step.
- Repeat until the step is complete or blocked.

## Examples

### Example 1

Input: Plan step: Add the prompt standard docs and validate the repo.

Output:
- Completed step: added skills/PROMPT_FORMAT_STANDARD.md and updated authoring docs.
- Updated notes: validator now requires the new headings on skills and prompts.
- Deviations: none.

### Example 2

Input: The step is not approved yet.

Output:
- Blocked: plan approval is missing.
- Needed next step: approve the plan before implementation continues.
## Output Contract

This skill must produce:

- a completed step summary
- updated task or state notes
- documented deviations or blockers

## Common Failure Modes

- implementing beyond the approved step
- silently rewriting the plan during execution
- treating draft verification notes as final evidence

## Checklist Before Done

- [ ] The active plan was re-read
- [ ] Work stayed within scope
- [ ] State or task tracking was updated
- [ ] Deviations were documented or re-planned
- [ ] The work is ready for the next command
