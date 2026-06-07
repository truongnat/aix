# ARCH-3 Root Shim Removal Design

> Scope: `ARCH-3` only
> Status: design draft for review

## Goal

Remove the top-level compatibility shims from the repository root so the supported runtime surface is explicit, smaller, and aligned with the dist-first build model shipped in `ARCH-2`.

## Problem Statement

The repository still exposes four root shims: `install.js`, `install-cache.js`, `install-runtime.js`, and `validate.js`. They exist only as compatibility wrappers, but they keep the public surface ambiguous, add maintenance cost, and make the packaging/docs surface harder to reason about.

The codebase already has the compiled runtime entrypoints under `dist/lib/**` and the CLI surface under `bin/aih.js`. `ARCH-3` makes that boundary explicit by removing the root shims and updating callers to use supported entrypoints directly.

## Non-Goals

- Do not change install, validate, or CLI behavior.
- Do not redesign the installer or validation internals.
- Do not remove `bin/aih.js` or the `dist/lib/**` entrypoints.
- Do not expand into unrelated docs cleanup or release automation.

## Approach

Use the compiled runtime entrypoints and the CLI binary as the supported surfaces:

- `bin/aih.js` remains the supported command entrypoint for install/update/uninstall/status/eval/insights/init.
- `dist/lib/validate/index.js` becomes the canonical validation entrypoint for direct validation execution.
- `dist/lib/install-legacy.js`, `dist/lib/install-cache.js`, and `dist/lib/install-runtime.js` remain internal compiled modules, but they are no longer exposed at the repository root.

The root shim files are deleted after all internal callers, scripts, tests, and docs stop referencing them.

## Architecture

The public surface shrinks to two categories:

1. CLI users call `bin/aih.js` or the published `aih` binary.
2. Maintainers and tests call compiled `dist/lib/**` modules directly when they need programmatic access.

This preserves behavior while removing the extra layer of root-level wrappers. The package manifest and docs become the source of truth for what is actually supported.

## Files To Change

- Modify: `package.json`
- Modify: `test/run-tests.js`
- Modify: `test/package-manifest.test.js`
- Modify: `docs/pack-verification-checklist.md`
- Modify: `docs/release-checklist.md`
- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `PACK.md`
- Modify: `docs/adoption-guide.md`
- Modify: `docs/install-output-example.md`
- Modify: `docs/plugin-install-security.md`
- Modify: `docs/runtime-native-install.md`
- Modify: `docs/validation-troubleshooting.md`
- Modify: `docs/runtimes/*.md` where they reference root shims
- Delete: `install.js`
- Delete: `install-cache.js`
- Delete: `install-runtime.js`
- Delete: `validate.js`

## Data Flow

Before this change, several flows started at the repository root and then delegated into `dist/lib/**`.

After this change:

- `npm run validate` invokes the compiled validate entrypoint directly.
- `npm run install:harness` invokes the CLI binary directly instead of `install.js`.
- `test/run-tests.js` imports compiled modules from `dist/lib/**`.
- Documentation examples point to `bin/aih.js`, `dist/lib/validate/index.js`, or the published binary surface instead of root shim files.

## Error Handling

- If a script or doc still references a deleted root shim, treat it as a regression.
- If `package.json` still lists a removed shim in `files`, fail the manifest test.
- If a test or script needs a runtime module, it must import the compiled `dist/lib/**` module directly.

## Testing Strategy

Add coverage that proves the package surface no longer exposes the deleted files:

- `test/package-manifest.test.js` should assert that `package.json > files` does not contain the removed root shim paths.
- `test/run-tests.js` should require `dist/lib/validate/index.js` and the compiled install modules directly.
- Any docs or checklist tests that enumerate the public surface should stop listing the deleted files.

Verification commands:

```bash
npm run build
npm test
npm run validate
npm pack --dry-run
node bin/aih.js --help
```

## Rollout Notes

This is a breaking cleanup for direct root-shim consumers, so the repo should treat the change as intentional and final for `v1.1.0`-style surface cleanup.

The docs should be updated in the same change so the supported entrypoints are obvious and there is no ambiguity about what stays supported after the shims are removed.
