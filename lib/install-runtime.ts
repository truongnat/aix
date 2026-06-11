// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/install/infrastructure/install-runtime.js") as any;

export const ALL_RUNTIMES = api.ALL_RUNTIMES;
export const deepMerge = api.deepMerge;
export const installRuntime = api.installRuntime;
export const installProviderCommands = api.installProviderCommands;

export type RuntimeId = any;
export type InstallScope = any;
export type InstallRuntimeOptions = any;
export type ProviderCommandEntry = any;
export type JsonObject = any;
