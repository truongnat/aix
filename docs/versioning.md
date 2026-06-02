# Versioning

## Current Meaning Of `v0.x`

`v0.x` means the operating model is still stabilizing. The repository is usable, but the documentation structure, guidance, and operating contract may continue to evolve as the harness is refined.

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

## Scope Boundary For `v0.1.0`

Heavy runtime systems are not part of `v0.1.0`. The first release is the markdown-first operating model plus lightweight install and validation helpers.

## Scope Boundary For `v0.2.0`

`v0.2.0` remains runtime-light and markdown-first. It expands the repository into a Harness Design System through docs, templates, examples, and lightweight validation, without adding runtime adapters, servers, databases, or automation-heavy release infrastructure.

## Scope Boundary For `v0.3.0`

`v0.3.0` remains runtime-light and structural-only. It adds lightweight host repository validation for adopted `.harness/` artifacts without adding semantic validation, runtime adapters, servers, databases, deep scanning, or automation-heavy release infrastructure.

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
