# Stable Contract Index

## Purpose

Map core capability pack contracts on the path to `v1.0.0`.

Use this index before making changes that affect adopters, validators, or packaging.

## Pre-v1 Status (Pivot)

Tag `v0.9.0` shipped **draft contract records** (`docs/frozen-*.md`). Tag **`v0.9.1`** shipped the **experimental runtime-native installer** (dogfood C + D1–D6) — [v0.9.1-release-notes.md](v0.9.1-release-notes.md).

Frozen docs remain **pre-v1 contract candidates** until v1 re-freeze. Runtime-native install paths are **experimental**; manual root copy is **fallback only** ([plugin-install-ux.md](plugin-install-ux.md)).

## Contract Status

| Contract | Intended v1 topic | Status |
|---|---|---|
| `PACK.md` | manifest headings | **pre-v1 candidate** — [frozen-pack-contract.md](frozen-pack-contract.md) |
| Installed surface | default `exportPaths` | **obsolete / pre-pivot candidate** — root bulk copy is fallback only; not v1 default — [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) |
| Target profile | `.harness/` profile | **pre-v1 candidate** — [frozen-target-profile-contract.md](frozen-target-profile-contract.md) |
| Goal artifacts | `.harness/goals/` | **pre-v1 candidate** — [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md) |
| Validation behavior | `validate.js` CLI | **pre-v1 candidate** — [frozen-validation-contract.md](frozen-validation-contract.md) |
| Runtime consumption | docs-only runtimes | **pre-v1 candidate** — [frozen-runtime-consumption-contract.md](frozen-runtime-consumption-contract.md) |
| Packaging / release | manual packaging | **pre-v1 candidate** — [frozen-packaging-release-contract.md](frozen-packaging-release-contract.md) |
| Source vs target boundary | pack vs product repo | **pre-v1 candidate** — [frozen-source-target-boundary-contract.md](frozen-source-target-boundary-contract.md) |
| Runtime install matrix | per-runtime paths and scopes | **experimental** — [runtime-native-install-audit.md](runtime-native-install-audit.md) |
| Interactive installer | runtime + scope wizard | **implemented** — [interactive-installer-design.md](interactive-installer-design.md) |
| Runtime-native writes | `install-runtime.js` | **experimental** — D1–D6 dogfood complete; stable **No** — [runtime-dogfood-summary.md](runtime-dogfood-summary.md) |
| Project state policy | `.harness/` per repo vs global plugin | **implemented** (scaffold) — [harness-init-usage.md](harness-init-usage.md) |
| Plugin install UX (fallback) | one-line `install.sh` + `install.js` copy | **dogfooded; fallback only** — [install.sh](../install.sh), [install-sh-usage.md](install-sh-usage.md), [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md) |

Breaking changes: [breaking-change-policy.md](breaking-change-policy.md).

---

## PACK.md Contract

- **Frozen record:** [frozen-pack-contract.md](frozen-pack-contract.md)
- **Stable source:** [pack-manifest-spec.md](pack-manifest-spec.md), [PACK.md](../PACK.md)
- **What is frozen:** required `##` section headings; markdown-first manifest; manifest at source pack and release archive roots; target repos do not require `PACK.md` by default
- **May still change before v1.0.0:** non-heading body wording; pack version string; optional future manifest sections if additive and non-breaking
- **Not guaranteed:** manifest body semantic validation; version value enforcement; archive file list hashing

Enforced by: `node validate.js` (`packRequiredHeadings` in `validate.js`).

---

## Installed Surface Contract

- **Frozen record:** [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md)
- **Stable source:** [installed-surface-contract.md](installed-surface-contract.md), `install.js` `exportPaths`
- **What is frozen:** default `exportPaths` install surface; required files and directories; `PACK.md` and `validate.js` not installed by default; target validation from source pack with `--target`
- **May still change before v1.0.0:** additive paths in `exportPaths`; install summary display strings
- **Not guaranteed:** minimal install tier (deferred post-v1 — [minimal-install-tier-decision.md](minimal-install-tier-decision.md))

Enforced by: `install.js` `exportPaths` + tests; structural target validation from source pack.

---

## Target Profile Contract

- **Frozen record:** [frozen-target-profile-contract.md](frozen-target-profile-contract.md)
- **Stable source:** [frozen-target-profile-contract.md](frozen-target-profile-contract.md), templates under `templates/`
- **What is frozen:** `.harness/` profile files and heading sets; `AGENTS.md` required for `--profile-only`
- **May still change before v1.0.0:** additive optional sections if validator unchanged; example richness under `examples/`
- **Not guaranteed:** semantic quality of profile content; automatic profile generation

Enforced by: `node validate.js --target <path> --profile-only`.

---

## Goal Artifact Contract

- **Frozen record:** [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md)
- **Stable source:** [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md), goal templates
- **What is frozen:** `.harness/goals/<goal-id>/` with five required files and heading sets per file; path-based goal id
- **May still change before v1.0.0:** optional goal files only if not added to validator without migration
- **Not guaranteed:** application correctness; CI integration; automatic goal generation

Enforced by: `node validate.js --target <path> --goal <goal-id>` (includes profile contract first).

Mapping from examples: [harness-example-to-target-layout.md](harness-example-to-target-layout.md).

---

## Validation Contract

- **Frozen record:** [frozen-validation-contract.md](frozen-validation-contract.md)
- **Stable source:** [target-repo-validation.md](target-repo-validation.md), `validate.js`
- **What is frozen:** CLI modes; structural-only checks; `--target` defaults to profile validation; failure message shapes; usage error rules
- **May still change before v1.0.0:** additive `requiredFiles` in source pack; new fixtures
- **Not guaranteed:** semantic validation; secret scanning; deep scanning; in-target `validate.js` copy

---

## Runtime Consumption Contract

- **Frozen record:** [frozen-runtime-consumption-contract.md](frozen-runtime-consumption-contract.md)
- **Stable source:** [runtime-consumption-model.md](runtime-consumption-model.md), [docs/runtimes/](runtimes/), [consume-as-pack.md](consume-as-pack.md)
- **What is frozen:** source pack canonical; target repo product work tree; `.harness/` in target; docs-only runtime guides for Claude Code, Cursor, Codex, Gemini CLI, OpenCode
- **May still change before v1.0.0:** guide wording; additive comparison rows
- **Not guaranteed:** runtime adapters; global capability folder standard

---

## Packaging Contract

- **Frozen record:** [frozen-packaging-release-contract.md](frozen-packaging-release-contract.md)
- **Stable source:** [manual-packaging-guide.md](manual-packaging-guide.md), [pack-verification-checklist.md](pack-verification-checklist.md), [release-archive-model.md](release-archive-model.md)
- **What is frozen:** manual packaging; `PACK.md` at archive root; manual verification and release checklists; no archive automation in v1
- **May still change before v1.0.0:** additive checklist items
- **Not guaranteed:** archive scripts; npm/marketplace publish

---

## Source Pack vs Target Repo Boundary

- **Frozen record:** [frozen-source-target-boundary-contract.md](frozen-source-target-boundary-contract.md)
- **Stable source:** [plugin-model.md](plugin-model.md), [distribution-model.md](distribution-model.md), [TARGET.md](../TARGET.md)
- **What is frozen:** source owns pack authoring; target owns product code and `.harness/`; validation from source with `--target`
- **May still change before v1.0.0:** clearer docs only (non-breaking)
- **Not guaranteed:** registry distribution; optional vendoring conventions

---

## Post-v1 Optional Extensions

Not part of v1.0.0 contract:

- minimal install tier ([minimal-install-tier-decision.md](minimal-install-tier-decision.md))
- archive generation automation
- marketplace / package publishing
- runtime adapters
- semantic validation and checksums
- optional in-target `validate.js`
