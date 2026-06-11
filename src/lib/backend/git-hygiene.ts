// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../shared/install-kernel/git-hygiene.js") as any;

export const collectIgnorePaths = api.collectIgnorePaths;
export const hasHarnessExcludeBlock = api.hasHarnessExcludeBlock;
export const applyPrivateIgnore = api.applyPrivateIgnore;
export const removeIgnoreBlock = api.removeIgnoreBlock;
export const reconcileDeferredPrivateIgnore = api.reconcileDeferredPrivateIgnore;

export type IgnoreContext = any;
export type IgnoreResult = any;
