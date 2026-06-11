// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/infrastructure/target.js") as typeof import("../../features/validate/infrastructure/target");

export const getRuntimeBootstrapPaths = api.getRuntimeBootstrapPaths;
export const isValidTargetRuntime = api.isValidTargetRuntime;
export const normalizeTargetRuntime = api.normalizeTargetRuntime;
