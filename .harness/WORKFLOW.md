# Workflow Profile

## Purpose

Describe the workflow stages, command loop, and how the repository uses them.

## Current Status

- Status: draft
- Primary workflow: Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember

## Selected Workflow

- Default path: `harness-start` -> `harness-discuss` -> `harness-plan` -> `harness-run` -> `harness-verify` -> `harness-ship` -> `harness-remember`
- Compatibility command: `harness-map` for manual context refresh only

## Domain Selection

- Domain skills may be generated under `.harness/skills/` after init
- Selected domains are recorded in `.harness/config.json`
- Keep generated domain skills aligned with the detected repository stack

## Command Sequence

| # | Command | Required | Purpose | Skip when |
| --- | --- | --- | --- | --- |
| 1 | `harness-start` | always | restore context and identify the next legal command | never |
| 2 | `harness-discuss` | non-trivial work | clarify goal, constraints, and success criteria | truly trivial typo-only work |
| 3 | `harness-plan` | implementation work | break work into ordered tasks and stop before coding | never |
| 4 | `harness-run` | after plan approval | implement the approved scope in small steps | never |
| 5 | `harness-verify` | after implementation | run gates and record evidence | never |
| 6 | `harness-ship` | after verification | summarize outcome; chain to remember when `shipped` | when no ship artifact is needed |
| 7 | `harness-remember` | default: chained after successful ship | capture durable lessons worth reusing | ship-only handoff, gaps/failure, or nothing reusable |

## Default Phase Chaining

- **Ship → Remember**: when ship status is `shipped`, run remember in the same turn unless the user requests ship-only or skip conditions in `docs/phase-discipline.md` apply.

## Execution Rules

- Never skip plan approval for non-trivial changes
- Record blocked state instead of guessing
- Ship summary must link verification evidence
- Return to planning if implementation discovers a real scope gap

## Human Review

List repo-specific workflow exceptions that still need approval.

## Concrete Example

`harness-start` -> refresh `STATE.md` and confirm the active goal
`harness-discuss` -> capture open questions and tradeoffs
`harness-plan` -> write an approved `PLAN.md`
`harness-run` -> implement the scoped change and update `TASKS.md`
`harness-verify` -> record commands, results, and gaps in `VERIFY.md`
`harness-ship` -> summarize outcome in `SHIP.md`
`harness-remember` -> promote durable lessons into `DECISIONS.md`, `HAZARDS.md`, or `INDEX.md`
