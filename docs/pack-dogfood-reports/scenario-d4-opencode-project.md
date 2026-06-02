# Pack Dogfood Report — Scenario D4 OpenCode Project Runtime

## Scenario

**D4 — OpenCode project runtime** (plugin + config dogfood). Tests `--runtime opencode --scope project --init-harness` with runtime-aware validation after D3 patch.

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-opencode`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`opencode` (project scope) via local `install.sh` from pack source clone.

## Consumption Mode

Runtime-native install: writes `.opencode/plugins/ai-engineering-harness.js`, merges `opencode.json`, and project-local `.harness/`. Does **not** copy pack operating surface to target root. Does **not** create `AGENTS.md`.

## Commands Run

```bash
# From ai-engineering-harness pack root
sh install.sh --runtime opencode --scope project --target ../harness-dogfood-opencode --init-harness --dry-run --yes

sh install.sh --runtime opencode --scope project --target ../harness-dogfood-opencode --init-harness --yes

node validate.js --target ../harness-dogfood-opencode --runtime opencode --profile-only

node validate.js --target ../harness-dogfood-opencode --profile-only

# Idempotency (no --force)
sh install.sh --runtime opencode --scope project --target ../harness-dogfood-opencode --init-harness --yes
```

## Artifacts Created

| Path | Purpose |
|---|---|
| `.opencode/plugins/ai-engineering-harness.js` | OpenCode plugin (matches pack payload) |
| `opencode.json` | Config fragment merge (`$schema` only on fresh install) |
| `.harness/HARNESS.md` … `MEMORY.md` | Structural profile skeleton |
| `.harness/goals/.gitkeep` | Goals directory placeholder |

Pre-existing in target (unchanged): `README.md`, `package.json`.

**Not created:** `AGENTS.md` (expected).

## opencode.json Check

| Check | Result |
|---|---|
| Valid JSON | pass (`python3 -m json.tool`) |
| `$schema` | present: `https://opencode.ai/config.json` |
| Plugin array / explicit plugin entry | **not added** by installer |
| Merge on fresh target | CREATE with `{ "$schema": "..." }` only |

**OpenCode loading model:** Per [runtime-native-install-audit.md](../runtime-native-install-audit.md), project-local plugins under `.opencode/plugins/` are loaded by OpenCode without an npm `plugin` array entry; `opencode.json` merge only ensures schema URL. No patch required from this dogfood unless manual OpenCode check shows otherwise.

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node validate.js --target ../harness-dogfood-opencode --runtime opencode --profile-only` | **pass** | `.harness/` + plugin paths |
| `node validate.js --target ../harness-dogfood-opencode --profile-only` | **FAIL** (expected) | `Missing required path: AGENTS.md` — legacy mode |

## Root Pollution Check

Confirmed **not** present after write install:

- `AGENTS.md`, `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`

## Skip Behavior Check

Second write install (no `--force`):

- **SKIP** all `.harness/` files
- **SKIP** `.opencode/plugins/ai-engineering-harness.js`
- **SKIP** `opencode.json` (unchanged merge — no UPDATE)

## Manual OpenCode Check

| Item | Result |
|---|---|
| OpenCode CLI on dogfood host | **not installed** (`opencode` not on PATH) |
| Plugin load / `session.created` console bootstrap | **BLOCKED / not run** |
| Payload diff vs pack | pass |

Do **not** claim stable OpenCode support until manual session confirms plugin load.

## Dry-Run Summary (fresh target)

- **Runtime:** opencode (OpenCode)
- **Scope:** project
- **Target:** `../harness-dogfood-opencode`
- **Init:** WOULD CREATE `.harness/*` (no `AGENTS.md`)
- **Runtime:** WOULD CREATE plugin + `opencode.json`
- No root pack copy in plan text

## Write Install Summary (first run)

- **CREATE:** `.harness/` skeleton + `goals/.gitkeep`
- **CREATE:** `.opencode/plugins/ai-engineering-harness.js`, `opencode.json`

## What Worked

- Dry-run and write install exited 0
- Plugin file byte-identical to pack `runtime/opencode/plugins/ai-engineering-harness.js`
- `opencode.json` valid JSON with `$schema`
- Runtime-aware profile validation **pass**
- Legacy validation **fails without AGENTS.md** as expected (not an install bug)
- No root pollution; skip behavior on re-install
- Init does not create `AGENTS.md`

## What Was Confusing

- Install plan bullet still mentions `AGENTS.md` in generic runtime-path list when runtime is `opencode` only
- `validate.js` success message in harness-init docs without `--runtime` may mislead OpenCode-only adopters
- `opencode.json` contains only `$schema` — adopters may expect explicit plugin registration (docs clarify auto-load)

## Missing Docs

- Optional: one-line in [runtime-native-install.md](../runtime-native-install.md) — “validate OpenCode with `--runtime opencode`”
- Manual OpenCode dogfood steps when CLI is available

## Pack Surface Issues

- None blocking for file/install path

## Runtime Issues

- Manual OpenCode verification not performed (CLI absent)
- Global scope not dogfooded in D4 (project only)

## Safety Notes

- External target has no secrets or customer data
- Report uses relative paths only
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| Manual OpenCode plugin load smoke test | D4 follow-up optional |
| Install plan runtime-specific wording | v0.9.x patch (repeat) |
| Dogfood global OpenCode scope separately | later optional |

## Verdict

**experimental PASS** — OpenCode project runtime-native install + `.harness/` init validated; runtime-aware validation **pass**. **Stable claim remains No** — manual OpenCode check **BLOCKED** (CLI not installed on dogfood host).
