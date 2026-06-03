# Runtime-Aware Target Validation

## Purpose

Validate **target repositories** after runtime-native install without forcing every runtime to provide root `AGENTS.md`.

## Problem

Legacy target profile validation (`node validate.js --target <repo> --profile-only`) always required `AGENTS.md`. That matched manual/`install.js` adoption and generic/codex project modes, but not:

- **Cursor** — `.cursor/rules/ai-engineering-harness.mdc`
- **Gemini** — `.gemini/extensions/ai-engineering-harness/…`
- **Claude** — `.claude/CLAUDE.md` + `.claude/settings.json`

Scenario D3 showed a **validation contract gap**: Cursor install succeeded while profile validation failed with `Missing required path: AGENTS.md`.

## Existing Validation Behavior

| Command | Bootstrap checked | `.harness/` profile |
|---|---|---|
| `node validate.js` | Source pack (full contract) | N/A |
| `node validate.js --target <repo>` | **`AGENTS.md` required** | Required headings |

This remains the **default** for backward compatibility (legacy targets, generic/codex without `--runtime`).

## Runtime-Aware Behavior

With `--runtime <name>` and `--target`:

1. Validate **`.harness/`** profile files and required headings (unchanged).
2. Validate **runtime bootstrap paths** for that runtime (existence only).
3. Do **not** require `AGENTS.md` unless the runtime is `generic`, `codex`, or `manual`.

Validation stays **structural only** — no semantic checks, no marketplace, no IDE behavior.

## CLI Contract

```bash
# Legacy / backward compatible (AGENTS.md + .harness/)
node validate.js --target <repo> --profile-only

# Runtime-native (bootstrap per runtime + .harness/)
node validate.js --target <repo> --runtime cursor --profile-only
node validate.js --target <repo> --runtime generic --profile-only
node validate.js --target <repo> --runtime claude --goal <goal-id>
```

Rules:

- `--runtime` is only valid with `--target`.
- `--runtime` is not supported for source-pack validation (no `--target`).
- Invalid runtime name → usage error.
- `--profile-only` and `--goal` remain mutually exclusive.
- `--goal` with `--runtime` validates runtime bootstrap + profile + goal artifacts.

Supported values: `generic`, `codex`, `cursor`, `gemini`, `claude`, `manual`. (`opencode` removed v0.11.0 — use legacy uninstall only via `aih.sh`.)

## Runtime Bootstrap Requirements

Structural **path existence** only:

| Runtime | Required paths |
|---|---|
| `generic`, `codex`, `manual` | `AGENTS.md` |
| `cursor` | `.cursor/rules/ai-engineering-harness.mdc` |
| `gemini` | `.gemini/extensions/ai-engineering-harness/gemini-extension.json`, `.gemini/extensions/ai-engineering-harness/GEMINI.md` (project scope; load path best-effort per audit) |
| `claude` | `.claude/CLAUDE.md`, `.claude/settings.json` |

**Global scope** validation is **not** implemented in this step (no `~/.cursor` checks from CLI).

## Backward Compatibility

- Omitting `--runtime` keeps **AGENTS.md + `.harness/`** checks.
- Existing fixtures and dogfood reports for generic/codex remain valid with default or `--runtime generic` / `--runtime codex`.

## What Is Not Validated

- Rule/plugin content semantics or IDE load behavior
- Global install paths under `$HOME`
- Marketplace plugin install state
- Whether Gemini project-local extensions load in the CLI

## Relationship To frozen-validation-contract.md

[frozen-validation-contract.md](frozen-validation-contract.md) documents the pre-v1 freeze including legacy target profile mode. Runtime-aware validation **extends** target validation for runtime-native installs. The AGENTS.md-only rule is **not** the final story for all runtimes at v1.

## Relationship To Runtime Native Install Audit

Use the same runtime names as [install.sh](../install.sh) / [install-runtime.js](../install-runtime.js). After install, validate with matching `--runtime`:

```bash
sh install.sh --runtime cursor --scope project --target . --init-harness --yes
node validate.js --target . --runtime cursor --profile-only
```

See [runtime-native-install-audit.md](runtime-native-install-audit.md) for dogfood status.

## Migration Notes

| Situation | Validation command |
|---|---|
| Legacy manual root copy + `.harness/` | `node validate.js --target <repo> --profile-only` |
| Generic/codex project runtime-native | `node validate.js --target <repo> --runtime generic --profile-only` (or omit `--runtime` if `AGENTS.md` present) |
| Cursor project runtime-native | `node validate.js --target <repo> --runtime cursor --profile-only` |
| Cursor-only repo (no `AGENTS.md`) | **Must** use `--runtime cursor` |

Re-check Scenario D3 after this patch:

```bash
node validate.js --target ../harness-dogfood-cursor --runtime cursor --profile-only
```
