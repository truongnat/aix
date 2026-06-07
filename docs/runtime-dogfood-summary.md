# Runtime Dogfood Summary

## Purpose

Consolidate evidence from Scenario **C** (manual one-line fallback), Scenarios **D1–D6** (runtime-native project/global dogfood), and Scenario **F1** (simple lifecycle CLI dogfood) for `v0.9.x` readiness. **v0.10.x** adds NPX CLI dogfood via [npx-cli-ux.md](npx-cli-ux.md) (primary UX: `npx ai-engineering-harness install`). This is an audit artifact, not a stable-support claim.

## Scope

- [install.sh](../install.sh) + [lib/install-runtime.ts](../lib/install-runtime.ts) runtime-native paths
- Project `.harness/` init via `--init-harness`
- [Runtime-aware validation](runtime-aware-validation.md)
- External disposable target repos (not committed to this pack)
- **Excludes:** `--runtime all` dogfood, semantic/tool-session proof, npm/marketplace publish

## Completed Scenarios

| ID | Report | Focus |
|---|---|---|
| C | [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md) | `curl \| sh` → manual root copy |
| D1 | [scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md) | `generic` + project + `.harness` |
| D2 | [scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md) | `codex` + project |
| D3 | [scenario-d3-cursor-project.md](pack-dogfood-reports/scenario-d3-cursor-project.md) | `cursor` + project |
| D4 | [scenario-d4-opencode-project.md](pack-dogfood-reports/scenario-d4-opencode-project.md) | `opencode` + project |
| D5 | [scenario-d5-gemini.md](pack-dogfood-reports/scenario-d5-gemini.md) | `gemini` project + global write |
| D6 | [scenario-d6-claude.md](pack-dogfood-reports/scenario-d6-claude.md) | `claude` project + global dry-run |
| F1 | [scenario-f1-simple-cli-lifecycle.md](pack-dogfood-reports/scenario-f1-simple-cli-lifecycle.md) | `aih.sh` install/status/doctor/update/uninstall/uninstall --all |

Post-D2 patch: `.harness/` init no longer creates `AGENTS.md`; runtime owns bootstrap ([runtime-native-install-audit.md](runtime-native-install-audit.md)).

## Runtime Results Table

| Scenario | Runtime | Scope | File/install | Runtime-aware validation | Manual runtime check | Root pollution | Verdict | Stable claim |
|---|---|---|---|---|---|---|---|---|
| C | manual | project (target) | PASS (root copy) | PASS (with AGENTS + `.harness` created for test) | N/A (shell install) | Root copy **by design** | PASS (fallback) | **No** (fallback only) |
| D1 | generic | project | PASS | PASS | Not run | Clean | experimental PASS | **No** |
| D2 | codex | project | PASS | PASS | **BLOCKED** (API quota) | Clean | experimental PASS | **No** |
| D3 | cursor | project | PASS | PASS | Not run | Clean | experimental PASS | **No** |
| D4 | opencode | project | PASS | PASS | Not run (CLI absent) | Clean | experimental PASS | **No** |
| D5 | gemini | project + global | PASS (global safe CREATE) | PASS (project) | **Inconclusive** (`extensions list` empty) | Clean (project) | experimental PASS | **No** |
| D6 | claude | project; global dry-run | PASS (project); global write **not run** | PASS (project) | Not run (`/plugin install` not run) | Clean (project) | experimental PASS | **No** |
| F1 | simple lifecycle (`aih.sh`) | project | PASS | PASS | N/A (shell lifecycle) | Clean after install/full uninstall; noisy after default uninstall if cache/state kept | experimental PASS | **No** |

**Windsurf:** historical alias of `cursor` in older installer flows; not separately dogfooded.

**`all`:** not dogfooded; do not treat as stable.

## What Passed

- Runtime-native installs do **not** copy `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`, or pack `docs/` to product repo root (D1–D6).
- Project `.harness/` skeleton + `goals/.gitkeep` with D1–D6 `--init-harness`.
- Per-runtime bootstrap files created at documented paths (see [runtime-native-install-audit.md](runtime-native-install-audit.md)).
- Skip/force behavior on re-install without `--force` (D1–D6).
- Runtime-aware `bin/validate.js --runtime <name> --profile-only` for dogfooded runtimes.
- D2 patch: `generic`/`codex` receive full `AGENTS.project.md` when using `--init-harness`.
- Manual legacy fallback (C) still works for adopters who need bulk copy.
- Simple lifecycle dispatcher `aih.sh` works end-to-end for install/status/doctor/update/uninstall/uninstall --all (F1).

## What Remains Experimental

- Every runtime-native mode in the table above — **file/install evidence only**.
- `--runtime all` sequential install.
- Global installs where dry-run shows **UPDATE** on existing user config (Claude settings, etc.) without explicit operator consent.
- Marketplace/plugin consumption (Claude `/plugin install`, Gemini `extensions install` URL path).
- Project-local Gemini extension load (best-effort per audit).

## Manual Checks Outstanding

| Runtime | Outstanding check | Blocks stable claim? |
|---|---|---|
| generic | Optional AGENTS.md agent smoke | Yes for “stable generic” |
| codex | `codex exec` / session instruction load | Yes |
| cursor | Rules visible in Cursor IDE | Yes |
| opencode | Plugin `session.created` bootstrap | Yes |
| gemini | Extension visible in Gemini CLI | Yes |
| claude | `/plugin install` + CLAUDE.md recognition | Yes |

These block **stable** claims, not necessarily an **experimental v0.9.x** release with clear labeling.

## Validation Findings

- **Legacy** `node bin/validate.js --target <repo> --profile-only` requires `AGENTS.md` — correct for manual/legacy targets; **fails** on cursor/opencode/gemini/claude-only repos (expected).
- **Runtime-aware** validation ([runtime-aware-validation.md](runtime-aware-validation.md)) addresses D3+ gap; use `--runtime` matching install.
- Structural only — no semantic or IDE-load checks.

## Root Pollution Findings

- **Runtime-native modes (D1–D6):** no accidental `commands/`/`skills/`/… root copy observed.
- **Manual fallback (C):** intentional full surface copy — not a runtime-native regression.

## Safety Findings

- Global Gemini write performed only when no prior `~/.gemini/extensions/ai-engineering-harness` (D5).
- Global Claude write **skipped** when `~/.claude/settings.json` would UPDATE (D6).
- Dogfood reports use relative paths; no secrets in reports.
- `--force` required to overwrite existing team `AGENTS.md` or profile files.

## Known Friction

See [pack-dogfood-friction-log.md](pack-dogfood-friction-log.md). Common themes:

- Absolute target path in install summary
- Dual-phase / init vs runtime messaging (addressed for AGENTS.md)
- Manual checks blocked or not run
- Gemini extension list inconclusive
- Claude plugin not automated
- Legacy validate without `--runtime` confuses adopters
- Default uninstall removes local exclude block even when `.ai-harness/` and `.harness/` are kept (F1)

## v0.9.x Release Implications

- May ship **experimental** runtime-native installer with honest docs and matrix in [plugin-install-ux.md](plugin-install-ux.md).
- Recommend default documented path: `--runtime <name> --scope project --init-harness` + `bin/validate.js --runtime <name>`.
- Keep `manual` / `curl | sh` without flags as fallback with warning.
- Do not market “stable runtime support.”

## v1.0.0 Implications

- Stable runtime-native support requires manual session evidence per runtime (or explicit scope reduction).
- Re-freeze or extend validation contract for runtime-aware profile as v1 norm.
- `all` runtime and semantic validation remain out of scope until explicitly designed.
- Root-copy default should not return as recommended UX.
