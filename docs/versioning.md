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
