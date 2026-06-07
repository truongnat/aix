# Pack Dogfood Report — Scenario D5 Gemini Runtime

## Scenario

**D5 — Gemini runtime** (project + global file/install dogfood). Tests `--runtime gemini` with project `--init-harness` and global scope (no `.harness/` in home). Project-local extension path treated as **best-effort** for CLI load; global path is the documented primary surface.

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-gemini`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`gemini` via local `install.sh` — **project** scope with `--init-harness`, then **global** scope (dry-run + write).

## Consumption Mode

Runtime-native install writes extension manifest + `GEMINI.md` under `.gemini/extensions/ai-engineering-harness/` (project or `~/.gemini/extensions/…` global). Does **not** copy pack root surface. Does **not** create `AGENTS.md`.

## Commands Run

```bash
# Project mode
sh install.sh --runtime gemini --scope project --target ../harness-dogfood-gemini --init-harness --dry-run --yes
sh install.sh --runtime gemini --scope project --target ../harness-dogfood-gemini --init-harness --yes
node bin/validate.js --target ../harness-dogfood-gemini --runtime gemini --profile-only

# Global mode
sh install.sh --runtime gemini --scope global --target ../harness-dogfood-gemini --dry-run --yes
sh install.sh --runtime gemini --scope global --target ../harness-dogfood-gemini --yes

# Idempotency (project)
sh install.sh --runtime gemini --scope project --target ../harness-dogfood-gemini --init-harness --yes

# Manual (CLI present)
gemini extensions list
```

## Artifacts Created

### Project (`../harness-dogfood-gemini`)

| Path | Purpose |
|---|---|
| `.gemini/extensions/ai-engineering-harness/gemini-extension.json` | Extension manifest |
| `.gemini/extensions/ai-engineering-harness/GEMINI.md` | Context file |
| `.harness/*` | Profile skeleton + `goals/.gitkeep` |

### Global (dogfood host)

| Path | Purpose |
|---|---|
| `~/.gemini/extensions/ai-engineering-harness/gemini-extension.json` | Global manifest (CREATE — no prior extension) |
| `~/.gemini/extensions/ai-engineering-harness/GEMINI.md` | Global context |

**Rollback (global dogfood write):** `rm -rf ~/.gemini/extensions/ai-engineering-harness` if removing test extension from the machine.

## Gemini Manifest Check

| Check | Result |
|---|---|
| Valid JSON | pass |
| `name` | `ai-engineering-harness` |
| `version` | `0.9.1` |
| `contextFileName` | `GEMINI.md` |
| Match pack `runtime/gemini/gemini-extension.json` | pass |
| `GEMINI.md` match pack payload | pass |

Installer output uses short log labels (`CREATE gemini-extension.json`) because files are written inside the extension directory root.

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ../harness-dogfood-gemini --runtime gemini --profile-only` | **pass** | Project paths + `.harness/` |

## Root Pollution Check (project target)

**Clean** — no `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`.

## Global Dry-Run / Global Write Result

| Step | Result |
|---|---|
| Global dry-run | WOULD CREATE `gemini-extension.json`, `GEMINI.md` under `~/.gemini/extensions/ai-engineering-harness` |
| Pre-check | No existing `ai-engineering-harness` global extension |
| Global write | **run** — CREATE both files (no SKIP/OVERWRITE conflict) |
| `--init-harness` with global | Correctly **not** planned |

## Skip Behavior Check (project)

Second project write: **SKIP** all `.harness/` files, `gemini-extension.json`, `GEMINI.md`.

## Manual Gemini Check

| Item | Result |
|---|---|
| `gemini` CLI | installed (`gemini` 0.38.0) |
| `gemini extensions list` | **BLOCKED / inconclusive** — exit 0, empty output (extension load not confirmed) |
| Project-local extension CLI visibility | **not verified** — audit notes project path may not load; prefer global or `gemini extensions install <url>` |

Do **not** claim stable Gemini support until extension appears in CLI or session behavior is confirmed.

## What Worked

- Project dry-run/write exited 0
- Global dry-run/write exited 0 (safe CREATE; no `--force` overwrite of prior extension)
- Manifest + `GEMINI.md` match pack payloads
- Runtime-aware project validation **pass**
- No root pollution on project target
- Skip behavior on project re-install
- Installer prints `gemini extensions install` NEXT hint for project scope

## What Was Confusing

- Log lines show `CREATE gemini-extension.json` without `.gemini/extensions/…` prefix (destination is extension dir)
- `gemini extensions list` produced no visible listing after global install
- Project vs global: two valid install surfaces; only project path was validated structurally

## Missing Docs

- Explicit “project extension may not load — use global or `gemini extensions install`” in dogfood quick path
- Validator does not distinguish global vs project Gemini paths (project validation only checks repo-local paths)

## Pack Surface Issues

- None blocking for file/install

## Runtime Issues

- Project-local `.gemini/extensions/` load unverified (best-effort per audit)
- Global extension written on dogfood host — adopters must understand home-dir side effect

## Safety Notes

- Global write only after confirming no existing `~/.gemini/extensions/ai-engineering-harness`
- No secrets in target repo; report uses relative paths and `~/.gemini/…` shorthand
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| Manual `gemini extensions list` / session load after global install | D5 follow-up optional |
| Verify project-local extension loads in Gemini CLI | later optional |
| Sanitize install log paths for Gemini CREATE lines | v0.9.x patch |

## Verdict

**experimental PASS** — Gemini project file/install + runtime-aware validation pass; global file/install pass (safe CREATE). **Stable claim remains No** — project CLI load best-effort; manual extension visibility **not confirmed**.
