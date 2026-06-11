// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/domain/task-registry.js") as any;

export const formatTaskList = api.formatTaskList;
export const loadRegistry = api.loadRegistry;
export const validateTaskManifest = api.validateTaskManifest;

export type Task = any;
export type Registry = any;
