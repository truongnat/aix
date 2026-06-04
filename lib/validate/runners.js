const {
  harnessRepositoryValidators,
  targetGoalValidators,
  targetProfileValidators
} = require("./registry.js");
const { root } = require("./constants.js");

function runValidators(validators, context) {
  for (const validator of validators) {
    validator.run(context);
  }
  return context.failures;
}

function validateHarnessRepository(baseDir = root) {
  return runValidators(harnessRepositoryValidators, {
    baseDir,
    failures: []
  });
}

function validateRepository(baseDir = root) {
  return validateHarnessRepository(baseDir);
}

function validateTargetHarnessProfile(baseDir) {
  return runValidators(targetProfileValidators, {
    baseDir,
    failures: [],
    runtime: null
  });
}

function validateTargetProfile(baseDir, runtime) {
  return runValidators(targetProfileValidators, {
    baseDir,
    failures: [],
    runtime
  });
}

function validateTargetGoal(baseDir, goalId, runtime) {
  return runValidators(targetGoalValidators, {
    baseDir,
    failures: [],
    goalId,
    runtime
  });
}

function countCheckedContracts() {
  const validators = [...harnessRepositoryValidators];
  return validators.reduce((sum, validator) => sum + (validator.weight || 0), 0);
}

module.exports = {
  countCheckedContracts,
  validateHarnessRepository,
  validateRepository,
  validateTargetGoal,
  validateTargetHarnessProfile,
  validateTargetProfile
};
