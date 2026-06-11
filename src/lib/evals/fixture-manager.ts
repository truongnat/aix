// Purpose: Backward-compat shim — implementation in src/features/eval/.
// Layer: presentation (shim)
// Depends on: dist/features/eval (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/eval/infrastructure/fixture-manager.js") as any;

export const materializeFixture = api.materializeFixture;
export const cleanupWorkspace = api.cleanupWorkspace;

export type Workspace = any;
