// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/command-helpers.js") as any;

export const readPackageVersion = api.readPackageVersion;
export const resolveTargetAbs = api.resolveTargetAbs;
export const validateProviderSelection = api.validateProviderSelection;
export const validateManualMix = api.validateManualMix;
export const backendOpts = api.backendOpts;
export const failWithBackendError = api.failWithBackendError;
