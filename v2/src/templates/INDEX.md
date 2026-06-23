# Harness Index

> Root `.harness/` is an index and router. Sessions own working artifacts. Do not include credentials, tokens, customer data, or private business data.

## Read Order

1. `.harness/STATE.md`
2. Active session `SESSION.md`
3. Active session `GOAL.md`
4. Active session current `PLAN-*.md`
5. Active session `TASKS.md`
6. `.harness/MEMORY.md`
7. Relevant files under `.harness/memory/`
8. Relevant files under `.harness/decisions/` and `.harness/hazards/`

## Active Session

- Session path:
- Session summary:
- Last Session Start:

## Session Start

- Protocol doc: `docs/session-start.md`
- Latest summary: active session `SESSION_START.md`
- Next allowed command: see `.harness/STATE.md`

## Durable Memory

- Root summary: `.harness/MEMORY.md`
- Project memory:
- Decisions:
- Hazards:

## Rules

- Do not write new working artifacts directly into root `.harness/` unless updating router files.
- Use `.harness/sessions/<active-session>/` for current working state.
- Files are the source of truth.
