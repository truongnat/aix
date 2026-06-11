// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/domain/checks.js") as any;

export const runChecks = api.runChecks;
export const runSingleCheck = api.runSingleCheck;

export type Check = any;
export type CheckResult = any;
export type Task = any;
export type CheckResults = any;
