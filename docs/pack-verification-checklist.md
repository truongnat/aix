# Pack Verification Checklist

## Purpose

Help maintainers verify the `ai-engineering-harness` capability pack before a release or manual release archive distribution.

Use this checklist to confirm `PACK.md`, the distributable surface, the installed surface, and release archive expectations stay aligned.

## When To Use

Use this checklist when:

- preparing a `v0.7.x` or later packaging release
- assembling a manual release archive
- auditing manifest drift after changing `install.js` or distribution docs
- confirming an extracted archive matches the source pack contract

Do not treat this checklist as application correctness validation. It verifies pack identity and surface consistency only.

## Manifest Checks

- [ ] `PACK.md` exists at the repository or archive root
- [ ] **Pack Name** is stable (`ai-engineering-harness`)
- [ ] **Pack Version** matches the release intent (for example `v0.7.0`, not an old tag)
- [ ] **Pack Type** remains `plugin-like markdown capability pack`
- [ ] **Purpose** still describes target-repo agent discipline, not a product framework
- [ ] **Included Surface** matches [installed-surface-contract.md](installed-surface-contract.md) and [release-archive-checklist.md](release-archive-checklist.md)
- [ ] **Consumption Modes** match [consumption-modes.md](consumption-modes.md)
- [ ] **Runtime Compatibility** matches documented runtimes under `docs/runtimes/` (Claude Code, Cursor, Codex, Gemini CLI, OpenCode)
- [ ] **Validation Commands** match the commands in the Validation Commands section below
- [ ] **Safety Boundaries** are present and unchanged in intent
- [ ] **Non-Goals** are present (no npm publishing, marketplace, adapters, semantic validation)

Compare manifest sections to [pack-manifest-spec.md](pack-manifest-spec.md).

## Included Surface Checks

Confirm the source pack or archive contains the distributable capability-pack surface:

- [ ] `AGENTS.md`
- [ ] `commands/`
- [ ] `skills/`
- [ ] `workflows/`
- [ ] `patterns/`
- [ ] `templates/`
- [ ] selected adoption and validation docs under `docs/` (per release archive checklist)
- [ ] `install.js`
- [ ] `validate.js`
- [ ] `README.md`
- [ ] `LICENSE`
- [ ] `PACK.md` (required for source pack and release archive; optional in target repos)

## Installed Surface Checks

- [ ] compare `install.js` `exportPaths` with [installed-surface-contract.md](installed-surface-contract.md)
- [ ] required installed files in the contract are covered by `exportPaths`
- [ ] required installed directories (`commands/`, `skills/`, `workflows/`, `patterns/`, `templates/`) are in `exportPaths`
- [ ] `PACK.md` is not required in target repos by default (per installed-surface contract)
- [ ] target repos do not receive maintenance-only files (release notes, CI-only files, private artifacts) unless explicitly intended
- [ ] optional installed docs in the contract match optional paths in `exportPaths` when present

Current `install.js` exports: `AGENTS.md`, `commands`, `skills`, `workflows`, `patterns`, `templates`, and the adoption or validation docs listed in `install.js`.

## Release Archive Checks

- [ ] compare archive contents with [release-archive-checklist.md](release-archive-checklist.md)
- [ ] `PACK.md` travels with the archive root
- [ ] archive includes `install.js` and `validate.js`
- [ ] archive excludes private, local, or generated artifacts
- [ ] archive excludes maintenance-only repository files unless explicitly useful
- [ ] archive does not imply runtime adapters or server behavior

## Runtime Guide Checks

- [ ] [docs/runtimes/README.md](runtimes/README.md) lists supported runtime guides
- [ ] [docs/runtimes/comparison.md](runtimes/comparison.md) matches **Runtime Compatibility** in `PACK.md`
- [ ] per-runtime guides exist for Claude Code, Cursor, Codex, Gemini CLI, and OpenCode
- [ ] runtime docs remain docs-only (no adapter or integration claims)

## Validation Commands

Run from the source pack repository root:

```bash
node validate.js
npm test
node validate.js --target test/fixtures/valid-target-profile --profile-only
node validate.js --target test/fixtures/valid-target-goal --goal google-login
```

After install into a target repository, run target validation there as documented in `PACK.md`.

## Safety Review

- [ ] markdown remains the source of truth
- [ ] no secrets, tokens, or private business data in pack or archive artifacts
- [ ] validation remains structural only
- [ ] no runtime adapters, marketplace automation, or package publishing automation were added under packaging work
- [ ] no archive generation automation was added unless explicitly scoped

## Release Decision

Proceed with release or archive distribution only when:

- manifest checks pass
- included surface and installed surface checks are consistent
- release archive checks pass (if distributing an archive)
- all validation commands pass
- safety review passes

If manifest version, `CHANGELOG.md`, or `PACK.md` disagree, fix them before tagging or publishing an archive.
