// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/index.js") as any;

export const listTasks = api.listTasks;
export const readReport = api.readReport;
export const runTask = api.runTask;

export type ListOptions = any;
export type ListResult = any;
export type RunOptions = any;
