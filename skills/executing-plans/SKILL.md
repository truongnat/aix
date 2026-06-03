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
