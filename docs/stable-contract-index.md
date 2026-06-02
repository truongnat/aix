# Stable Contract Index

## Purpose

Map the core contracts frozen for `v0.9.0` on the path to `v1.0.0`.

Use this index before making changes that affect adopters, validators, or packaging.

## Contract Status

| Contract | Freeze target | Status in v0.9.0 planning |
|---|---|---|
| `PACK.md` | v0.9.0 | **frozen for v1.0.0** — [frozen-pack-contract.md](frozen-pack-contract.md) |
| Installed surface | v0.9.0 | **frozen for v1.0.0** — [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) |
| Target profile | v0.9.0 | **frozen for v1.0.0** — [frozen-target-profile-contract.md](frozen-target-profile-contract.md) |
| Goal artifacts | v0.9.0 | **frozen for v1.0.0** — [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md) |
| Validation behavior | v0.9.0 | indexed; Step 4+ alignment |
| Runtime consumption | v0.9.0 | indexed; Step 5+ alignment |
| Packaging / release | v0.9.0 | indexed; Step 5+ alignment |
| Source vs target boundary | v0.9.0 | indexed |

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
- **Stable source:** [harness-build-contract.md](harness-build-contract.md), templates under `templates/`
- **What is frozen:** `.harness/` profile files and heading sets; `AGENTS.md` required for `--profile-only`
- **May still change before v1.0.0:** additive optional sections if validator unchanged; example richness under `examples/`
- **Not guaranteed:** semantic quality of profile content; automatic profile generation

Enforced by: `node validate.js --target <path> --profile-only`.

---

## Goal Artifact Contract

- **Frozen record:** [frozen-goal-artifact-contract.md](frozen-goal-artifact-contract.md)
- **Stable source:** [harness-build-contract.md](harness-build-contract.md), goal templates
- **What is frozen:** `.harness/goals/<goal-id>/` with five required files and heading sets per file; path-based goal id
- **May still change before v1.0.0:** optional goal files only if not added to validator without migration
- **Not guaranteed:** application correctness; CI integration; automatic goal generation

Enforced by: `node validate.js --target <path> --goal <goal-id>` (includes profile contract first).

Mapping from examples: [harness-example-to-target-layout.md](harness-example-to-target-layout.md).

---

## Validation Contract

- **Stable source:** [target-repo-validation.md](target-repo-validation.md), `validate.js`
- **What is frozen:** structural-only checks; run from source pack with `--target`; modes `--profile-only` and `--goal`; failure messages for missing paths/headings; repository self-check includes `PACK.md` headings
- **May still change before v1.0.0:** additional required source-pack docs in `validate.js` file list; new fixtures if additive
- **Not guaranteed:** semantic validation; secret scanning; deep scanning; in-target `validate.js` copy

---

## Runtime Consumption Contract

- **Stable source:** [runtime-consumption-model.md](runtime-consumption-model.md), [docs/runtimes/](runtimes/), [consume-as-pack.md](consume-as-pack.md)
- **What is frozen:** target repo is product work tree; installed surface + `.harness/` in target; docs-only runtime guidance; no runtime adapters in v1 scope
- **May still change before v1.0.0:** runtime guide wording; comparison table rows if additive
- **Not guaranteed:** runtime-specific plugins; global capability folder standard

---

## Packaging Contract

- **Stable source:** [manual-packaging-guide.md](manual-packaging-guide.md), [pack-verification-checklist.md](pack-verification-checklist.md), [release-archive-model.md](release-archive-model.md)
- **What is frozen:** manual packaging flow; `PACK.md` travels with release archives; verification checklist before tag/archive
- **May still change before v1.0.0:** checklist items if additive; install `targetDisplay` behavior
- **Not guaranteed:** archive generation scripts; npm/marketplace publish

---

## Source Pack vs Target Repo Boundary

- **Stable source:** [plugin-model.md](plugin-model.md), [distribution-model.md](distribution-model.md), [TARGET.md](../TARGET.md)
- **What is frozen:** canonical source in this repository; target repo receives installed subset; product state in target `.harness/` and application code
- **May still change before v1.0.0:** clearer docs only (non-breaking)
- **Not guaranteed:** registry distribution; vendoring conventions as a separate standard

---

## Post-v1 Optional Extensions

Not part of v1.0.0 contract:

- minimal install tier ([minimal-install-tier-decision.md](minimal-install-tier-decision.md))
- archive generation automation
- marketplace / package publishing
- runtime adapters
- semantic validation and checksums
- optional in-target `validate.js`
