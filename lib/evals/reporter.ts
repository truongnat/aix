// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/infrastructure/reporter.js") as any;

export const writeModeArtifacts = api.writeModeArtifacts;
export const writeRunSummary = api.writeRunSummary;

export type ModeArtifactsPayload = any;
export type RunSummaryPayload = any;
export type ModeArtifactsPaths = any;
