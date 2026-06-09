# Workflow Profile

## Purpose

Describe the workflow stages and how selected domain skills fit into the core loop.

## Current Status

- Status: draft
- Review and confirm before first harness-run

## Selected Workflow

core-loop

Default workflow for all work types.

## Domain Selection

- Domain skills may be generated under `.harness/skills/` after init
- Selected domains are recorded in `.harness/config.json`
- Keep generated domain skills aligned with the detected repository stack

## Command Sequence

| # | Command | Required | Purpose | Skip when |
|---|---|---|---|---|
| 1 | `harness-start` | Always | Restore context, detect session, identify next command | Never |
| 2 | `harness-discuss` | Non-trivial work | Clarify goal, scope, success criteria, constraints | Truly trivial typo fixes only |
| 3 | `harness-plan` | Any implementation | Break work into ordered tasks; stop before coding | Never |
| 4 | `harness-run` | After plan approved | Execute approved tasks, small surgical steps | Never |
| 5 | `harness-verify` | After implementation | Run gates fresh, record evidence in VERIFY.md | Never |
| 6 | `harness-ship` | After verification | Summarize, write PR notes; chain to remember when `shipped` | When no shipping artifact needed |
| 7 | `harness-remember` | Default: chained after successful ship | Capture durable lessons in DECISIONS/HAZARDS/INDEX | Ship-only handoff, gaps/failure, or nothing reusable |

## Default Phase Chaining

- **Ship → Remember**: when ship status is `shipped`, run remember in the same turn unless the user requests ship-only or skip conditions in `docs/phase-discipline.md` apply.

## Execution Rules

- Do not run `harness-run` without an approved `PLAN-*.md` (status: approved)
- Do not run `harness-ship` without a passed or explicitly-gapped `VERIFY.md`
- When blocked, write `.harness/sessions/<id>/BLOCKED.md` and stop
- When goal changes mid-work, return to `harness-discuss` before continuing
- When a plan gap is discovered during execution, stop and return to `harness-plan`

## Alternate Workflows

| Workflow | When to use |
|---|---|
| `feature` | New user-visible capability |
| `bugfix` | Restoring expected behavior |
| `refactor` | Structural improvements that preserve behavior |
| `incident` | Urgent failures requiring compressed action |
| `code-review` | Reviewing changes before accepting or merging |

## Human Review

List repo-specific workflow exceptions that still need approval.
