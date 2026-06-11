// Purpose: Backward-compat shim — implementation in src/.
// Layer: presentation (shim)
// Depends on: dist (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/scan/presentation/scan-command.js") as any;

export const runScanCommand = api.runScanCommand;
