# Pack Dogfood Report — Scenario D2 Codex Project Runtime

## Scenario

**D2 — Codex project runtime** (second runtime-native dogfood). Tests `--runtime codex --scope project --init-harness` — same `AGENTS.md` surface as generic, but labeled for Codex CLI consumption.

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-codex`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`codex` (project scope) via local `install.sh` from pack source clone.

## Consumption Mode

Runtime-native install: writes `AGENTS.md` from [runtime/bootstrap/AGENTS.project.md](../../runtime/bootstrap/AGENTS.project.md) and project-local `.harness/`. Does **not** copy pack operating surface to target root.

## Commands Run

```bash
# From ai-engineering-harness pack root
sh install.sh --runtime codex --scope project --target ../harness-dogfood-codex --init-harness --dry-run --yes

sh install.sh --runtime codex --scope project --target ../harness-dogfood-codex --init-harness --yes

node bin/validate.js --target ../harness-dogfood-codex --profile-only

# Idempotency (no --force)
sh install.sh --runtime codex --scope project --target ../harness-dogfood-codex --init-harness --yes

# Manual Codex (CLI available; API blocked by usage limit)
cd ../harness-dogfood-codex
codex exec --skip-git-repo-check --sandbox read-only </dev/null \
  "In one short paragraph, summarize what project instructions you load from AGENTS.md in this repo. Mention .harness if present."
```

## Artifacts Created

| Path | Purpose |
|---|---|
| `AGENTS.md` | Harness-init minimal skeleton (codex runtime SKIP; not full `AGENTS.project.md`) |
| `.harness/HARNESS.md` … `MEMORY.md` | Structural profile skeleton |
| `.harness/goals/.gitkeep` | Goals directory placeholder |

Pre-existing in target (unchanged): `README.md`, `package.json`.

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ../harness-dogfood-codex --profile-only` | pass | Structural profile contract |

## Root Pollution Check

Confirmed **not** present after write install:

- `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`

## Skip Behavior Check

Second write install (no `--force`): **SKIP** on all `.harness/` files, init `AGENTS.md`, and codex runtime `AGENTS.md` — no overwrites.

## Manual Codex Check

| Item | Result |
|---|---|
| CLI installed | yes (`codex-cli 0.136.0`) |
| `codex exec` in target workdir | **BLOCKED** — API usage limit before agent completed response |
| Bootstrap file match | **partial** — installed `AGENTS.md` is harness-init minimal skeleton; codex runtime **SKIP** did not apply `AGENTS.project.md` (same pattern as D1) |

**Note:** Non-git disposable target requires `--skip-git-repo-check` for `codex exec`. Dogfood target has no `.git` by design.

Do **not** claim stable Codex support until a successful interactive or `codex exec` run confirms instruction load in a real session.

## Dry-Run Summary (fresh target)

- **Runtime:** codex (Codex CLI)
- **Scope:** project
- **Target:** `../harness-dogfood-codex`
- **WOULD CREATE:** `.harness/*`, `goals/.gitkeep`, `AGENTS.md` (init + codex both plan create on dry-run)
- Plan states no `commands/`, `skills/`, `workflows/` root copy

## Write Install Summary (first run)

- **CREATE:** all `.harness/` skeleton files, `goals/.gitkeep`, `AGENTS.md` (init)
- **Codex runtime:** `SKIP AGENTS.md` (already created by init — same pattern as D1)

## What Worked

- Dry-run and write install exited 0
- File tree matches D1 generic project layout
- No pack root pollution
- Profile validation passed
- Idempotent re-install skips all files
- Profile validation passes with harness-init `AGENTS.md` (minimal contract)

## What Was Confusing

- Dual-phase `AGENTS.md` CREATE (init minimal) then SKIP (codex) — **full `AGENTS.project.md` bootstrap never written** when using `--init-harness` (repeat of D1)
- Dry-run shows WOULD CREATE `AGENTS.md` twice; write only creates once
- `codex exec` requires `--skip-git-repo-check` on non-git dogfood repos
- Install plan may print absolute target path for relative `--target`

## Missing Docs

- Dogfood doc note: Codex CLI may require `--skip-git-repo-check` on throwaway repos without `git init`
- Optional: document that codex and generic project modes share `AGENTS.project.md` bootstrap

## Pack Surface Issues

- None blocking for codex project file/install path

## Runtime Issues

- Manual Codex session not completed (usage limit) — does not invalidate structural install evidence
- Codex trust/git check may surprise adopters using non-git sandboxes

## Safety Notes

- External target has no secrets or customer data
- Report uses relative paths only
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| `--init-harness` + codex/generic: init minimal `AGENTS.md` prevents runtime bootstrap overwrite | v0.9.x patch — merge bootstrap or skip init AGENTS when runtime will write |
| Dual-phase AGENTS.md CREATE/SKIP messaging | v0.9.x patch (repeat D1) |
| Document `--skip-git-repo-check` for dogfood/throwaway repos | v0.9.x patch |
| Re-run manual Codex exec when API quota available | D2 follow-up optional |
| Relative target in install summary | v0.9.x patch (repeat) |

## Verdict

**experimental PASS** — codex project runtime-native install + `.harness/` init validated structurally (same evidence bar as D1). **Stable claim remains No** — manual Codex instruction-load check **BLOCKED** (API usage limit); re-run `codex exec` or interactive session before promoting confidence beyond file/install behavior.

## Post-D2 Patch Note

Original dogfood observed harness init **CREATE** minimal `AGENTS.md`, then codex runtime **SKIP** — full `AGENTS.project.md` was not applied.

**Patch:** `.harness/` init no longer creates `AGENTS.md`; `codex`/`generic` runtime owns `runtime/bootstrap/AGENTS.project.md`. Re-run or spot-check D2 on a fresh target before treating codex project as stable.
