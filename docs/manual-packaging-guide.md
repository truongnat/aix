# Manual Packaging Guide

## Purpose

Walk maintainers through preparing a versioned `ai-engineering-harness` capability pack release or manual release archive without adding archive generation automation.

## When To Use

Use this guide when:

- cutting a packaging release such as `v0.7.x`
- preparing a manual release archive for distribution
- verifying pack identity before the release workflow runs or before you cut an archive-only tag

Do not use this guide as application deployment or npm publishing instructions.

## Inputs

Before starting, have:

- the intended release version (for example `v0.7.0`)
- [v0.7.0 plan](v0.7.0-plan.md) or the active release scope doc
- current [PACK.md](../PACK.md)
- [pack-verification-checklist.md](pack-verification-checklist.md)
- [release-archive-checklist.md](release-archive-checklist.md)
- a clean working tree or a deliberate list of release commits

## Step 1: Confirm Release Scope

- read [v0.7.0-plan.md](v0.7.0-plan.md) or the active release plan
- confirm the release stays docs-only packaging work unless scope explicitly changed
- confirm non-goals remain out of scope: npm publishing, marketplace automation, runtime adapters, archive generation scripts, semantic validation

## Step 2: Update PACK.md Version

- open [PACK.md](../PACK.md)
- set **Pack Version** to the releasing version (for example `v0.7.0`, not `v0.7.0-unreleased`)
- confirm **Pack Name**, **Pack Type**, and **Purpose** still match the release intent
- confirm **Included Surface**, **Consumption Modes**, and **Runtime Compatibility** still match distribution docs

`node bin/validate.js` checks required `PACK.md` headings only. Update body content manually when scope changes.

## Step 3: Run Pack Verification Checklist

Complete [pack-verification-checklist.md](pack-verification-checklist.md).

Pay special attention to:

- manifest checks against [pack-manifest-spec.md](pack-manifest-spec.md)
- installed surface alignment with [installed-surface-contract.md](installed-surface-contract.md) and `bin/aih.js install` surface
- release archive checks if you plan to distribute an archive

## Step 4: Run Validation Commands

From the source pack repository root:

```bash
node bin/validate.js
npm test
node bin/validate.js --target test/fixtures/valid-target-profile --profile-only
node bin/validate.js --target test/fixtures/valid-target-goal --goal google-login
git status
```

All commands must pass before tagging or distributing an archive.

`node bin/validate.js` includes lightweight `PACK.md` heading validation. It does not validate manifest body content, version values, or archive file lists.

## Step 5: Review Installed Surface

- compare `bin/aih.js install` surface with [installed-surface-contract.md](installed-surface-contract.md)
- confirm required installed files and directories are exported
- confirm target repositories do not receive maintenance-only files by default
- confirm `PACK.md` is not required inside every target repo unless explicitly intended

## Step 6: Review Release Archive Surface

If distributing a manual archive:

- compare intended archive contents with [release-archive-model.md](release-archive-model.md)
- use [release-archive-checklist.md](release-archive-checklist.md) as the file checklist
- confirm `PACK.md` will travel with the archive root
- exclude private, local, generated, and maintenance-only artifacts unless explicitly useful

## Step 7: Prepare Release Notes

- update `CHANGELOG.md` with the dated release section
- add or update `docs/v0.x.x-release-notes.md` when the release is finalized
- align README release status when the release ships
- confirm release notes match what `PACK.md` claims

## Step 8: Follow The Release Or Archive Tagging Flow

After validation passes and docs are aligned:

- For npm package releases, follow [release-checklist.md](release-checklist.md) and let the `changesets` release workflow own package publication.
- For archive-only distribution snapshots, create and push a tag after final validation:

```bash
git status
git tag v0.7.0
git push origin v0.7.0
```

Replace `v0.7.0` with the actual archive tag.

See also [release-checklist.md](release-checklist.md) for the npm release flow and general release discipline.

## Step 9: Optional Manual Archive Assembly

Archive generation is **not** automated in `v0.7.0`.

To assemble an archive manually:

1. check out or export the tagged release commit
2. create a folder named like `ai-engineering-harness-v0.7.0`
3. copy the capability-pack surface listed in [release-archive-checklist.md](release-archive-checklist.md)
4. include `PACK.md` at the archive root with **Pack Version** matching the release tag
5. run the validation commands from Step 4 inside the archive folder if `validate.js` and tests are included
6. distribute the archive as a zip or tarball using your normal manual process

Conceptual archive contents:

- `PACK.md`, `AGENTS.md`, `bin/aih.js`, `bin/validate.js`, `LICENSE`, `README.md`
- `commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`
- required adoption and validation docs under `docs/`

Do not add a generation script in this step. Do not imply runtime adapters or server behavior through archive contents.

## Safety Review

- markdown remains the source of truth
- no secrets, tokens, or private business data in pack or archive artifacts
- validation remains structural only
- no runtime adapters, marketplace automation, or package publishing automation under packaging work
- no archive generation automation was added unless explicitly scoped in a later release

## What This Guide Does Not Automate

This guide does not provide or require:

- archive zip/tar generation scripts
- npm or marketplace publishing
- manifest body parsing or version enforcement in code
- semantic validation or deep repository scanning
- runtime adapter or plugin compilation

Future automation must stay optional and must not replace the markdown-first pack contract.

## Frozen Packaging Contract

v1.0.0-stable packaging and release behavior is recorded in [frozen-packaging-release-contract.md](frozen-packaging-release-contract.md).
