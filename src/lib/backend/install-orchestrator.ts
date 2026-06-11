// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/install/application/run-install.js") as any;

export const runInstall = api.runInstall;

export type InstallContext = any;
export type InstallResult = any;
