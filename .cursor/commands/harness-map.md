# harness-map

**Harness Map** — Backward-compatible manual context refresh outside the normal workflow.

This command is **project-scoped** for the repository that contains this `.ai-harness/` directory.

## Before doing anything

1. Read `.ai-harness/manifest.json`.
2. Read `.ai-harness/activation.md`.
3. Read `.ai-harness/commands/harness-map.md` (full command contract).
4. Read relevant artifacts under `.harness/` (REVIEW, PLAN, STATE, GOAL, etc.).
5. Do **not** use global or sibling-repo harness files unless the user explicitly requests it.

## Then

Execute the workflow defined in `.ai-harness/commands/harness-map.md` for **this repository only**. Use existing local artifacts first; ask only when blocked.
