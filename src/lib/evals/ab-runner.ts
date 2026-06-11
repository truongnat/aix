// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/application/ab-runner.js") as any;

export const runAbTask = api.runAbTask;

export type RunOptions = any;
export type ModeResult = any;
export type AbTaskResult = any;
