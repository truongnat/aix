# Memory Migration

## Purpose

This document explains how to migrate from the legacy flat `.harness` layout to the session-based memory model.

## Legacy Layout

Legacy flat layout means working artifacts such as these live directly under root `.harness/`:

- `GOAL.md`
- `PLAN.md`
- `TASKS.md`
- `VERIFY.md`

## Migration Rules

- detect legacy layout explicitly
- do not silently continue as if it were session-based
- do not silently delete legacy artifacts
- preserve originals under `.harness/legacy/`
- stop and ask when source of truth would otherwise be ambiguous

## Safe Migration Flow

1. Detect the flat working artifacts.
2. Create a new session id using the session naming rules.
3. Create `.harness/legacy/<timestamp>/`.
4. Preserve the original files there.
5. Create `.harness/sessions/<session-id>/`.
6. Move or copy the working artifacts into the new session.
7. Update `.harness/INDEX.md` and `.harness/STATE.md`.
8. Block if both layouts still appear active.

## Blocking Cases

Commands should block when:

- flat and session layouts both appear active
- migration would overwrite data
- a safe active session cannot be identified

## Source Of Truth Reminder

After migration, files remain the source of truth, and the active session owns the working artifacts.
