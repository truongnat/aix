# harness-run

**Harness Run** — Execute the approved plan with evidence-backed progress.

This command is **project-scoped** for the repository that contains this `.ai-harness/` directory.

## Before doing anything

1. Read `.ai-harness/manifest.json`.
2. Read `.ai-harness/activation.md`.
3. Read `.ai-harness/commands/harness-run.md` (full command contract).
4. Read `.ai-harness/prompt-templates/harness-run.md`.
5. Fill its placeholders from local artifacts and repo state.
6. Follow its blocked or success output format exactly.
7. Read relevant artifacts under `.harness/` (REVIEW, PLAN, STATE, GOAL, etc.).
8. Do **not** use global or sibling-repo harness files unless the user explicitly requests it.

## Then

Execute the workflow defined in `.ai-harness/commands/harness-run.md` for **this repository only**. Use existing local artifacts first; ask only when blocked.
