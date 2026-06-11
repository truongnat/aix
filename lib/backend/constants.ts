// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../shared/install-kernel/constants.js") as any;

export const EXCLUDE_BLOCK_START = api.EXCLUDE_BLOCK_START;
export const EXCLUDE_BLOCK_END = api.EXCLUDE_BLOCK_END;
export const HARNESS_MARKER = api.HARNESS_MARKER;
export const providerCommandPaths = api.providerCommandPaths;
export const ignorePathsForProvider = api.ignorePathsForProvider;
export const uninstallPathsForProvider = api.uninstallPathsForProvider;
