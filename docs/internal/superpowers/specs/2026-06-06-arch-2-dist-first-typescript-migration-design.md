# ARCH-2 Dist-First TypeScript Migration Design

## Status

- Date: 2026-06-06
- Scope: `ARCH-2` only
- Approved direction: `dist`-first runtime surface

## Goal

Complete the in-progress `ARCH-2` migration so the built `dist/` tree becomes the runtime source of truth for CLI entrypoints, validation, hooks, scripts, and tests that execute compiled code.

The outcome for this pass is operational correctness, not architectural cleanup. Root shims remain in place, but they must delegate to `dist/**` after build.

## Constraints

- Do not expand into `ARCH-3` root shim removal.
- Do not change release/admin backlog items (`OPS-*`).
- Preserve the current incremental migration model: TypeScript files can coexist with checked JS via `allowJs` and `checkJs`.
- Work within the existing dirty tree instead of reverting sub-agent changes.

## Approach

### Option considered

1. `dist`-first minimal completion
2. broader cleanup across runtime/docs/shims

This pass uses option 1 because it closes the broken runtime path assumptions with the smallest reliable diff.

## Design

### Runtime source of truth

After `npm run build`, runtime consumers that execute project code should load compiled modules from `dist/` rather than source modules from `lib/`.

Affected surfaces:

- `bin/aih.js`
- root shims such as `install.js`, `install-runtime.js`, `install-cache.js`, `validate.js`
- hook/runtime scripts that instantiate compiled library code
- tests that intentionally exercise runtime behavior through compiled modules

### Build and package expectations

- `tsconfig.lib.json` must model the `dist/` layout consistently enough for typecheck/build assumptions.
- `package.json` package contents and coverage paths must align with the built surface.
- validation contracts that check required runtime files must reference the compiled paths where appropriate.

### Path-sensitive module behavior

Any module that resolves repository-relative assets from `__dirname` must account for execution from `dist/lib/**` instead of `lib/**`.

The main known case is provider rule rendering, which must still resolve `rules/core/**` and `rules/providers/**` correctly after compilation.

## Out of Scope

- Removing root shims
- Rewriting docs beyond what is required to keep tests/validation truthful
- New release workflow changes
- Additional feature work outside the migration

## Success Criteria

- `npm run build` succeeds.
- `npm run typecheck` succeeds.
- `npm test` succeeds.
- `npm run validate` succeeds.
- No runtime entrypoint touched by this migration still depends on `lib/**` when it should execute compiled code from `dist/**`.

## Risks

- Some tests may still rely on source-tree paths and fail only after build output is used.
- Validation rules may mix “source must exist” and “runtime artifact must exist” assumptions; those need to be separated carefully instead of blanket-rewriting every path.
- Relative path calculations from compiled files can silently break asset loading.

## Verification Plan

Run, in order:

```bash
npm run build
npm run typecheck
npm test
npm run validate
```

If a failure shows the `dist` switch exposed another stale path assumption, fix that assumption only if it is part of `ARCH-2` runtime correctness.
