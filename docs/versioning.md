# Versioning

## Current Meaning Of `v1.x`

`v1.x` means the core capability-pack operating contract is stable. Patch and minor releases should harden docs, validation, packaging, and adoption guidance without breaking the frozen `v1.0.0` baseline for adopters.

## Patch Changes

Patch releases should cover small, non-breaking improvements such as:

- documentation fixes
- validation fixes
- wording clarifications
- small consistency corrections

## Minor Changes

Minor releases can include additive improvements such as:

- new docs
- new skill packs
- new workflow examples
- adoption polish
- richer validation that does not break the core operating contract

## Major Changes Later

Major version changes are for future breaking changes to the operating contract, artifact model, or core harness expectations.

## Historical Meaning Of `v0.x`

`v0.x` covered the contract-freeze and release-hardening path that led to the first stable capability pack release. The version boundaries below remain as historical scope records for those pre-`v1.0.0` milestones.

## Scope Boundary For `v0.1.0`

Heavy runtime systems are not part of `v0.1.0`. The first release is the markdown-first operating model plus lightweight install and validation helpers.

## Scope Boundary For `v0.2.0`

`v0.2.0` remains runtime-light and markdown-first. It expands the repository into a Harness Design System through docs, templates, examples, and lightweight validation, without adding runtime adapters, servers, databases, or automation-heavy release infrastructure.

## Scope Boundary For `v0.3.0`

`v0.3.0` remains runtime-light and structural-only. It adds lightweight host repository validation for adopted `.harness/` artifacts without adding semantic validation, runtime adapters, servers, databases, deep scanning, or automation-heavy release infrastructure.

## Scope Boundary For `v0.10.x`

`v0.10.x` marked the historical **npm-published** interactive CLI (`npx ai-engineering-harness install`) as the primary consumer UX. Stable per-runtime support was still **not** claimed. At that stage the Node CLI still delegated install/update/uninstall to a bundled shell backend; later releases moved the primary lifecycle commands in-process.

## Scope Boundary For `v0.4.0`

`v0.4.0` remains runtime-light and ergonomics-focused. It improves adoption clarity, examples, walkthroughs, small-repo memory guidance, and validation troubleshooting without adding runtime adapters, automatic generation, interactive setup, semantic validation, secret scanning, deep scanning, or automation-heavy release infrastructure.

## Scope Boundary For `v0.5.0`

`v0.5.0` is a Plugin Distribution Model release and remains runtime-light. It clarifies pack consumption, installed-surface boundaries, and future distribution modes without adding marketplace automation, package publishing automation, release archive generation, runtime adapters, semantic validation, or deep scanning.

## Scope Boundary For `v0.6.0`

`v0.6.0` is a docs-only Runtime Consumption Guides release and remains runtime-light. It documents how common runtimes consume the capability pack in a target repository without adding runtime adapters, runtime integrations, marketplace automation, package publishing automation, semantic validation, or deep scanning.

## Scope Boundary For `v0.7.0`

`v0.7.0` is a Capability Pack Packaging release and remains runtime-light and manual-packaging only. It adds `PACK.md`, packaging contracts, verification checklists, heading validation, and manual packaging guidance without adding archive generation automation, package publishing automation, marketplace automation, runtime adapters, semantic manifest body validation, installed surface checksums, or deep scanning.

## Scope Boundary For `v0.8.0`

`v0.8.0` is a Real Capability Pack Dogfood release and remains runtime-light and manual. It adds executed dogfood scenarios, reports, friction tracking, dogfood-driven doc fixes, and an example-to-target layout guide without adding Scenario C as a requirement, runtime adapters, distribution automation, semantic validation, minimal install tiers, or deep scanning.

## Scope Boundary For `v0.9.0`

`v0.9.0` is a Stable Contract Freeze release and remains runtime-light and manual. It freezes eight core contracts (PACK.md, installed surface, target profile, goal artifacts, validation behavior, runtime consumption, packaging/release, source-vs-target boundary) documented in `docs/stable-contract-index.md` and `docs/frozen-*.md` without adding runtime adapters, distribution automation, semantic validation, minimal install tiers, or changes to frozen validator behavior unless a release blocker is found.

## Scope Boundary For `v0.9.1`

`v0.9.1` was the **Experimental Runtime-Native Installer** release. It introduced runtime/scope selection, `install-runtime.js`, project `.harness/` init, runtime-aware validation, and dogfood evidence (Scenarios C, D1–D6) without claiming stable runtime-native support, npm publishing, marketplace automation, or semantic validation. See [v0.9.1-release-notes.md](v0.9.1-release-notes.md) and [runtime-dogfood-summary.md](runtime-dogfood-summary.md).

## Scope Boundary For `v0.9.2`

`v0.9.2` was the **Experimental Simple Lifecycle CLI + Capability Cache + Git Hygiene** release. It introduced the lifecycle dispatcher, installed `.ai-harness/` as the provider-agnostic capability source for project runtime-native installs, added private `.git/info/exclude` hygiene, shipped project `update` and safe `uninstall`, and included F1 simple lifecycle dogfood evidence. It did **not** claim stable runtime support, did **not** add Antigravity, and did **not** add marketplace automation, npm publishing, or semantic validation.

## Scope Boundary For `v0.10.x`

`v0.10.x` was the **Experimental NPX CLI** release. Primary UX: `npx ai-engineering-harness install` with interactive provider selection (detection recommends only). npm package shipped `bin/aih.js` and a trimmed `files` list (no `test/` or `examples/`). It did **not** claim stable runtime support or ship Antigravity install.

## Scope Boundary For `v1.0.0`

`v1.0.0` is the first stable capability pack release using the `v0.9.0` frozen contracts as a baseline. It does **not** claim stable runtime-native support; those paths stay explicitly manual or experimental until selected runtimes pass release-quality checks or the contract is expanded in a documented future major/minor scope. Prefer release hardening and documentation finalization over new contract surface. Expand contracts only if a documented blocker appears; follow [breaking-change-policy.md](breaking-change-policy.md).
