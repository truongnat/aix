// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/update/application/run-update.js") as any;

export const runUpdate = api.runUpdate;

export type UpdateContext = any;
export type UpdateResult = any;
