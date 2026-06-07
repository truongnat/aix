# Command Loop

The harness loop is:

`Session Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember`

`Map` remains a compatibility/manual context-refresh command outside the primary loop.
Not every task needs every command, but skipping a command should be deliberate, not accidental.

## Start

Load context for the session and confirm the next step.

## Discuss

Clarify scope, constraints, success criteria, and tradeoffs.

## Plan

Write the implementation plan and stop before making changes.

## Run

Execute the approved plan in small, surgical steps.

## Verify

Run fresh checks and collect evidence. Never infer success from confidence.

## Ship

Summarize the verified outcome, note follow-ups, and prepare handoff.

## Remember

Capture only durable, non-sensitive lessons for future sessions.

## Map

Use `Map` only when a manual context refresh is needed outside normal Session Start flow.

## Loop Discipline

- `Plan` blocks `Run` until scope is clear.
- `Verify` blocks `Ship` until evidence exists.
- `Remember` happens after meaningful, verified work.
