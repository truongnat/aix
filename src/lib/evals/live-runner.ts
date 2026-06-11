// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/infrastructure/live-runner.js") as any;

export const runLiveProviderCommand = api.runLiveProviderCommand;

export type LiveRunOptions = any;
export type LiveRunResult = any;
