// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/application/session-start.js") as typeof import("../../src/features/validate/application/session-start");

export const assertSessionStartLayer = api.assertSessionStartLayer;
