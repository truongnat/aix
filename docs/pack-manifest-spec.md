# Pack Manifest Spec

## Purpose

Define a simple markdown-first manifest format for the `ai-engineering-harness` capability pack.

## Canonical File

- file name: `PACK.md`
- location: repository root of the source pack and release archive root
- format: markdown with required `##` sections only

Do not use JSON unless a future release has a strong justification. Keep manifests human-readable and agent-friendly.

## Required Sections

Every `PACK.md` must include these sections in order:

### Pack Name

The stable pack identifier (for example `ai-engineering-harness`).

### Pack Version

The pack version this manifest describes (for example `v0.7.0` or `v0.7.0-unreleased` during development).

### Pack Type

A short type label (for example `plugin-like markdown capability pack`).

### Purpose

One or two sentences on what the pack helps agents do.

### Included Surface

Bullet list of directories, key files, and doc groups that belong in a distributable pack or release archive.

Must align with [installed-surface-contract.md](installed-surface-contract.md) and [release-archive-checklist.md](release-archive-checklist.md).

### Consumption Modes

Supported ways to consume the pack (install/copy, vendored directory, global capability folder, release archive, future registry).

### Runtime Compatibility

Runtime names the pack documents for consumption guidance (not adapters).

### Validation Commands

Commands to verify the source pack or an extracted archive before adoption.

### Safety Boundaries

Non-negotiable limits: markdown source of truth, no secrets in artifacts, structural validation only, no runtime adapters.

### Non-Goals

What this pack release does not include (publishing automation, marketplace, semantic validation, and similar).

## Optional Future Sections

Later manifests may add optional sections such as:

- Minimum Node version
- Archive file name pattern
- Installed surface hash or file list

Do not add optional sections to `v0.7.0` unless they stay simple and dependency-free.

## Relationship To Other Docs

- [packaging-model.md](packaging-model.md) explains the packaging concepts
- [installed-surface-contract.md](installed-surface-contract.md) defines default install copy behavior
- [release-archive-model.md](release-archive-model.md) defines archive shape

## Validation Expectations

`node validate.js` checks that `PACK.md` exists and contains required section headings.

Current validation is heading-only:

- it checks required `##` heading presence
- it does not validate heading order
- it does not validate body contents
- it does not validate pack version values
- it does not validate release archive file lists

Maintainers should complete [pack-verification-checklist.md](pack-verification-checklist.md) before each release or manual archive distribution to confirm manifest content matches installed surface, release archive, and runtime docs.
