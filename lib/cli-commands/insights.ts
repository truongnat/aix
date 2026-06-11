// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../../cli/commands/insights.js") as any;

export const runInsightsCommand = api.runInsightsCommand;
