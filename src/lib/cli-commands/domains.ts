// Purpose: Backward-compat shim — implementation in src/.
// Layer: presentation (shim)
// Depends on: dist (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../features/domains/presentation/domains-command.js") as any;

export const runDomainsCommand = api.runDomainsCommand;
