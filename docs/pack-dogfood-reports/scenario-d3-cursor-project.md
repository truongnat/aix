# Pack Dogfood Report — Scenario D3 Cursor Project Runtime

## Scenario

**D3 — Cursor project runtime** (first IDE-specific rule-file dogfood). Tests `--runtime cursor --scope project --init-harness` after the D2 patch separated `.harness/` init from runtime bootstrap ownership.

## Target Repo Type

Disposable external placeholder repo (`../harness-dogfood-cursor`): `README.md`, `package.json` only. Not committed to `ai-engineering-harness`.

## Runtime Used

`cursor` (project scope) via local `install.sh` from pack source clone.

## Consumption Mode

Runtime-native install: writes `.cursor/rules/ai-engineering-harness.mdc` and project-local `.harness/`. Does **not** copy pack operating surface to target root. Does **not** create `AGENTS.md` (by design for Cursor mode).

## Commands Run

```bash
# From ai-engineering-harness pack root
sh install.sh --runtime cursor --scope project --target ../harness-dogfood-cursor --init-harness --dry-run --yes

sh install.sh --runtime cursor --scope project --target ../harness-dogfood-cursor --init-harness --yes

node validate.js --target ../harness-dogfood-cursor --profile-only

# Idempotency (no --force)
sh install.sh --runtime cursor --scope project --target ../harness-dogfood-cursor --init-harness --yes
```

## Artifacts Created

| Path | Purpose |
|---|---|
| `.cursor/rules/ai-engineering-harness.mdc` | Cursor project rule (matches pack `runtime/cursor/rules/`) |
| `.harness/HARNESS.md` … `MEMORY.md` | Structural profile skeleton |
| `.harness/goals/.gitkeep` | Goals directory placeholder |

Pre-existing in target (unchanged): `README.md`, `package.json`.

**Not created:** `AGENTS.md` (expected for Cursor-only install).

## Validation Results

| Command | Result | Notes |
|---|---|---|
| `node validate.js --target ../harness-dogfood-cursor --profile-only` | **FAIL** | `Missing required path: AGENTS.md` |

**Interpretation:** Cursor install path succeeded; structural profile validator still hard-requires root `AGENTS.md` per [frozen-target-profile-contract.md](../frozen-target-profile-contract.md). This is a **validation contract gap**, not a Cursor runtime write failure. Cursor project mode is not required to create `AGENTS.md` unless product policy changes.

## Root Pollution Check

Confirmed **not** present after write install:

- `AGENTS.md`
- `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, `docs/`

## Skip Behavior Check

Second write install (no `--force`): **SKIP** on all `.harness/` files and `.cursor/rules/ai-engineering-harness.mdc` — no overwrites.

## Manual Cursor Check

| Item | Result |
|---|---|
| Cursor IDE session in target repo | **BLOCKED / not run** — automated dogfood only; no IDE rule-load verification in this session |
| Installed `.mdc` matches pack payload | pass (`diff` identical to `runtime/cursor/rules/ai-engineering-harness.mdc`) |

Do **not** claim stable Cursor support until manual check confirms rule visibility and Agent behavior in Cursor.

## Dry-Run Summary (fresh target)

- **Runtime:** cursor (Cursor / Windsurf)
- **Scope:** project
- **Target:** `../harness-dogfood-cursor`
- **Init:** WOULD CREATE `.harness/*`, `goals/.gitkeep` — no `AGENTS.md` in init section
- **Runtime:** WOULD CREATE `.cursor/rules/ai-engineering-harness.mdc`
- Plan states no `commands/`, `skills/`, `workflows/` root copy

## Write Install Summary (first run)

- **CREATE:** all `.harness/` skeleton files, `goals/.gitkeep`
- **CREATE:** `.cursor/rules/ai-engineering-harness.mdc`
- No `AGENTS.md` CREATE/SKIP lines (correct after D2 patch)

## What Worked

- Dry-run and write install exited 0
- `.mdc` rule file present and byte-identical to pack payload
- `.harness/` skeleton complete
- No pack root pollution; no accidental `AGENTS.md` from init
- Idempotent re-install skips all files
- Init section does not mention `AGENTS.md` (D2 patch confirmed)

## What Was Confusing

- Install plan still lists `AGENTS.md` in generic “runtime paths” bullet even when runtime is `cursor` only
- `validate.js --profile-only` fails on Cursor-only repos — adopters may think install failed
- Docs suggest “run validate after init” but Cursor + `--init-harness` alone cannot pass profile mode today

## Missing Docs

- Runtime-aware validation: when `--profile-only` applies vs Cursor rule-only repos
- Optional: “Cursor project install + validation” path (add `generic` pass, `manual` copy, or future `--runtime cursor` validator mode)

## Pack Surface Issues

- Frozen target profile contract requires `AGENTS.md` for all `--profile-only` runs — mismatch with Cursor-native consumption

## Runtime Issues

- None blocking for file creation or skip behavior
- Manual IDE verification still required

## Safety Notes

- External target has no secrets or customer data
- Report uses relative paths only
- Target repo not committed to source pack

## Follow-up Candidates

| Item | Classification |
|---|---|
| Runtime-aware `validate.js --profile-only` (or document Cursor exception) | v0.9 contract candidate |
| Install plan wording when runtime is cursor-only | v0.9.x patch |
| Manual Cursor rule load + Agent smoke test | D3 follow-up optional |
| Relative target in install summary | v0.9.x patch (repeat) |

## Verdict

**experimental PASS** — Cursor project runtime-native install + `.harness/` init validated for file/install behavior. **Stable claim remains No** — manual Cursor check not run; `--profile-only` **FAIL** due to missing `AGENTS.md` (contract gap, not install failure).
