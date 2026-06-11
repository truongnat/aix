// Purpose: Backward-compat shim — implementation in src/features/scan/.
// Layer: infrastructure (shim)
// Depends on: dist/features/scan (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../features/scan/infrastructure/stack-scanner.js") as any;

export const stackScanner = api.stackScanner;
