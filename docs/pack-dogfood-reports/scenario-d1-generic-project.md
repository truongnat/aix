# Pack Dogfood Report — Scenario D1 Generic Project Runtime

## Scenario

**D1 — Generic project runtime** (first runtime-native dogfood). Tests the simplest runtime-native path: `--runtime generic --scope project --init-harness` with no marketplace or IDE dependency.

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-generic`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`generic` (project scope) via local `install.sh` from pack source clone.

## Consumption Mode

Runtime-native install: writes `AGENTS.md` bootstrap and project-local `.harness/` only. Does **not** copy `commands/`, `skills/`, `workflows/`, `patterns/`, or `templates/` to target root.

## Commands Run

```bash
# From ai-engineering-harness pack root
sh install.sh --runtime generic --scope project --target ../harness-dogfood-generic --init-harness --dry-run --yes

sh install.sh --runtime generic --scope project --target ../harness-dogfood-generic --init-harness --yes

node bin/validate.js --target ../harness-dogfood-generic --profile-only

# Idempotency (no --force)
sh install.sh --runtime generic --scope project --target ../harness-dogfood-generic --init-harness --yes
```

## Artifacts Created

| Path | Purpose |
|---|---|
| `AGENTS.md` | Generic runtime bootstrap (created during `.harness/` init) |
| `.harness/HARNESS.md` | Structural profile skeleton |
| `.harness/TEAM.md` | Structural profile skeleton |
| `.harness/SKILLS.md` | Structural profile skeleton |
| `.harness/WORKFLOW.md` | Structural profile skeleton |
| `.harness/GATES.md` | Structural profile skeleton |
| `.harness/MEMORY.md` | Structural profile skeleton |
| `.harness/goals/.gitkeep` | Goals directory placeholder |

Pre-existing in target (unchanged): `README.md`, `package.json`.

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node bin/validate.js --target ../harness-dogfood-generic --profile-only` | pass | Structural profile contract |

## Root Pollution Check

Confirmed **not** present in target after write install:

- `commands/`
- `skills/`
- `workflows/`
- `patterns/`
- `templates/`
- `docs/` (pack docs tree)

## Dry-Run Summary (fresh target, first run)

- **Runtime:** generic (Generic AGENTS.md bootstrap)
- **Scope:** project
- **Target:** `../harness-dogfood-generic` (sanitized; installer may print absolute path)
- **Init-harness:** yes
- **WOULD CREATE:** `.harness/HARNESS.md`, `TEAM.md`, `SKILLS.md`, `WORKFLOW.md`, `GATES.md`, `MEMORY.md`, `goals/.gitkeep`, `AGENTS.md`
- **Runtime step:** WOULD CREATE `AGENTS.md` (same file; second step may SKIP on write)
- Plan text states it does **not** copy `commands/`, `skills/`, `workflows/` to product repo root

## Write Install Summary (first run)

- **CREATE:** all `.harness/` skeleton files and `goals/.gitkeep`
- **CREATE:** `AGENTS.md` (harness init)
- **Runtime generic:** `SKIP AGENTS.md` (already created by init — expected, not an error)

## Idempotency (second write, no `--force`)

- **SKIP:** all `.harness/` files, `AGENTS.md`, and runtime `AGENTS.md` — no overwrites

## What Worked

- Dry-run and write install exited 0
- Project-local `.harness/` skeleton matches [harness-init-usage.md](../harness-init-usage.md) contract
- `AGENTS.md` present for profile validation
- No full pack root copy; pollution check clean
- `validate.js --profile-only` passed from source pack
- Repeat install skips existing files without `--force`

## What Was Confusing

- `AGENTS.md` appears in both `.harness/` init and generic runtime steps; first run CREATE then runtime SKIP — harmless but dual-phase wording could be clearer in install output
- Install plan/summary may show absolute target path when `--target` is relative (repeat from Scenarios A/B/C)

## Missing Docs

- Optional one-line callout in [runtime-native-install.md](../runtime-native-install.md): “generic + `--init-harness` creates `AGENTS.md` during init; runtime step may SKIP”

## Pack Surface Issues

- None blocking for generic project path

## Runtime Issues

- None blocking for file creation, skip behavior, or profile validation
- **Manual agent check not run** in this session (open repo in AGENTS.md-capable tool and confirm `.harness/` guidance) — recommended before claiming **stable**

## Safety Notes

- External target contains no secrets or customer data
- Report uses relative target path only
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| Clarify dual-phase `AGENTS.md` CREATE/SKIP in install output | v0.9.x patch |
| Relative target in install summary | v0.9.x patch (repeat) |
| Manual AGENTS.md agent smoke test for D1 | D1 follow-up optional |

## Verdict

**experimental PASS** — generic project runtime-native install + `.harness/` init validated structurally. **Stable claim remains No** per [runtime-native-install-audit.md](../runtime-native-install-audit.md) until additional runtimes dogfood and optional manual agent check is recorded.

## Post-D2 Patch Note

Original dogfood observed harness init **CREATE** minimal `AGENTS.md`, then generic runtime **SKIP** — full `AGENTS.project.md` was not applied.

**Patch:** `.harness/` init no longer creates `AGENTS.md`; `generic`/`codex` runtime owns `runtime/bootstrap/AGENTS.project.md`. Re-run or spot-check D1 on a fresh target before treating generic project as stable.
