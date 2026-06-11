// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/domain/mode-mutations.js") as any;

export const applyModeMutation = api.applyModeMutation;
export const loadMutationRegistry = api.loadMutationRegistry;
export const mutationMetrics = api.mutationMetrics;

export type MutationEntry = any;
export type MutationRegistry = any;
