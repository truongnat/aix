// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/backend.js") as any;

export const packRootFromModule = api.packRootFromModule;
