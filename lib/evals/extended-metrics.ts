// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/infrastructure/extended-metrics.js") as any;

export const compareAbMetrics = api.compareAbMetrics;
export const scoreExtendedMetrics = api.scoreExtendedMetrics;

export type ExtendedMetrics = any;
export type ComparisonMetrics = any;
