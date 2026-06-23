# harness-discuss

**Harness Discuss** — Discuss scope, constraints, and approach before planning.

This command is **project-scoped** for the repository that contains this `.ai-harness/` directory.

## Before doing anything

1. Read `.ai-harness/manifest.json`.
2. Read `.ai-harness/activation.md`.
3. Read `.ai-harness/commands/harness-discuss.md` (full command contract).
4. Read relevant artifacts under `.harness/` (REVIEW, PLAN, STATE, GOAL, etc.).
5. Do **not** use global or sibling-repo harness files unless the user explicitly requests it.

## Behavior (discuss)

If `.harness/REVIEW.md` (or PLAN/STATUS/DISCUSSION) exists: **synthesize and discuss immediately** — do not ask what output the user wants. Max one closing question. See `docs/harness-command-behavior.md`.

## Then

Execute the workflow defined in `.ai-harness/commands/harness-discuss.md` for **this repository only**. Use existing local artifacts first; ask only when blocked.
