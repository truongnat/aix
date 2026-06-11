// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/application/registry.js") as typeof import("../../src/features/validate/application/registry");

export const harnessRepositoryValidators = api.harnessRepositoryValidators;
export const targetGoalValidators = api.targetGoalValidators;
export const targetProfileValidators = api.targetProfileValidators;

export type ValidationContext =
  import("../../src/features/validate/application/registry").ValidationContext;
export type Validator = import("../../src/features/validate/application/registry").Validator;
