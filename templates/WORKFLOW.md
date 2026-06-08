# Workflow Profile

## Status: draft — review and confirm before first harness-run

## Selected Workflow: core-loop

Default workflow for all work types.

## Command Sequence

| # | Command | Required | Purpose | Skip when |
|---|---|---|---|---|
| 1 | `harness-start` | Always | Restore context, detect session, identify next command | Never |
| 2 | `harness-discuss` | Non-trivial work | Clarify goal, scope, success criteria, constraints | Truly trivial typo fixes only |
| 3 | `harness-plan` | Any implementation | Break work into ordered tasks; stop before coding | Never |
| 4 | `harness-run` | After plan approved | Execute approved tasks, small surgical steps | Never |
| 5 | `harness-verify` | After implementation | Run gates fresh, record evidence in VERIFY.md | Never |
| 6 | `harness-ship` | After verification | Summarize, write PR notes, close session | When no shipping artifact needed |
| 7 | `harness-remember` | After shipping | Capture durable lessons in DECISIONS/HAZARDS/INDEX | When session produced nothing reusable |

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
