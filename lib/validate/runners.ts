// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/application/runners.js") as typeof import("../../src/features/validate/application/runners");

export const countCheckedContracts = api.countCheckedContracts;
export const validateHarnessRepository = api.validateHarnessRepository;
export const validateRepository = api.validateRepository;
export const validateTargetGoal = api.validateTargetGoal;
export const validateTargetHarnessProfile = api.validateTargetHarnessProfile;
export const validateTargetProfile = api.validateTargetProfile;

export type ValidationContext =
  import("../../src/features/validate/application/runners").ValidationContext;
export type Validator = import("../../src/features/validate/application/runners").Validator;
