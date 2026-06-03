# writing-plans

## Purpose

Produce a concrete implementation plan before changes begin.

## When To Use

- after goal discussion
- before code, document, or configuration changes
- when an existing plan is missing, stale, or invalidated

## When Not To Use

- when the session is only reading or reviewing
- when executing an already approved and still-valid plan
- when the goal is still materially unclear

## Inputs

- goal and discussion artifacts
- current state and context
- affected files, systems, and constraints

## Workflow

1. Restate the approved goal and scope.
2. List the affected files, systems, and artifacts.
3. Break work into ordered, small, verifiable tasks.
4. Define verification, not-run cases, and rollback considerations.
5. Save the plan in a durable artifact and stop before implementation.

## Operating Principles

- Planning is mandatory before implementation.
- Small steps are easier to verify and recover.
- Verification belongs in the plan, not just at the end.
- Plans should minimize room for interpretation and scope drift.

## Output Contract

This skill must produce:

- an implementation plan
- an ordered task list
- verification and rollback strategy
- explicit approval status or approval request

## Common Failure Modes

- writing a plan that is too vague to execute
- forgetting verification or rollback
- continuing into implementation after planning

## Checklist Before Done

- [ ] The goal and scope are restated
- [ ] Affected files or artifacts are listed
- [ ] Steps are ordered and concrete
- [ ] Verification is defined
- [ ] Approval points are explicit
- [ ] The plan is saved and implementation has not started
