// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/install/infrastructure/harness-skeleton.js") as any;

export const initHarnessProfile = api.initHarnessProfile;

export type SkeletonContext = any;
export type SkeletonResult = any;
