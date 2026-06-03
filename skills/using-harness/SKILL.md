# using-harness

## Purpose

Apply the harness operating contract to the current session.

## When To Use

- at the beginning of a task
- when resuming work
- when process drift or scope drift is likely

## When Not To Use

- when no engineering action will follow
- when a stricter repository contract overrides this harness
- when loading it would duplicate an already active command-specific process skill without adding decision value

## Inputs

- `AGENTS.md`
- the current command being executed
- the minimum read set for that command
- the active `.harness/` artifacts relevant to the current phase

## Workflow

1. Read the minimum necessary artifacts before acting.
2. Confirm the current goal, scope, and next command.
3. Check whether a plan exists for any non-trivial change.
4. Keep work aligned to the active plan and update state as needed.
5. Block completion claims until verification exists.
6. Capture only durable, safe memory after shipping.

## Operating Principles

- Artifacts outrank assumptions.
- Progressive loading beats loading the whole harness blindly.
- Plans precede implementation.
- Evidence outranks confidence.
- Skills should be loaded only when they directly support the current command and task.

## Output Contract

This skill must produce:

- a current state summary
- the chosen next command or confirmation of the active command
- an explicit list of missing artifacts, blockers, or risks

## Common Failure Modes

- loading broad related skills just because they seem generally relevant
- reading too many artifacts before identifying the current command
- letting implementation start before goal, plan, or verification expectations are clear

## Checklist Before Done

- [ ] Relevant artifacts were read first
- [ ] The current goal and scope are explicit
- [ ] The next command is clear
- [ ] A plan exists before implementation
- [ ] Verification expectations are known
- [ ] No sensitive data is being written to memory
