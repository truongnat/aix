// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/domain/scoring.js") as any;

export const scoreRun = api.scoreRun;

export type ExtendedMetrics = any;
export type ComparisonMetrics = any;
export type Score = any;
