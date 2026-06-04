# Session Memory

## Purpose

This document explains the session-based file memory model for `.harness/`.

## Core Rules

- Root `.harness` is an index and router.
- Sessions own working artifacts.
- Files are the source of truth.
- Durable memory is promoted intentionally from session work.

## Root Layout

Root `.harness/` should stay small and explicit.

Recommended root files:

- `INDEX.md`
- `STATE.md`
- `MEMORY.md`
- `TOOL_CONTEXT.md`
- `config.json`

Recommended root folders:

- `sessions/`
- `memory/`
- `decisions/`
- `hazards/`

## Session Ownership

Each major workstream gets its own folder under:

```txt
.harness/sessions/YYYY-MM-DD-short-title/
```

That folder owns the current working artifacts for the session, including plan, tasks, verify, ship, and remember outputs.

## Why Files Stay Authoritative

Files are the source of truth because they are:

- git-friendly
- reviewable in diffs
- portable across agent environments
- readable without external infrastructure

Optional indexing layers may exist later, but they must not replace files as the authoritative record.

## Durable Memory Promotion

Session-local lessons may be promoted after verification or shipping into:

- `.harness/MEMORY.md`
- `.harness/memory/`
- `.harness/decisions/`
- `.harness/hazards/`

Only durable, non-sensitive lessons should be promoted.
