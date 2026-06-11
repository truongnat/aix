// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/plan.js") as any;

export const NON_GIT_PRIVATE_WARNING = api.NON_GIT_PRIVATE_WARNING;
export const NON_GIT_PRIVATE_WARNING_FOLLOWUP = api.NON_GIT_PRIVATE_WARNING_FOLLOWUP;
export const buildInstallPlan = api.buildInstallPlan;
export const formatInstallPlan = api.formatInstallPlan;

export type InstallPlan = any;
export type PlanProviderId = any;
