"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCheckedContracts = countCheckedContracts;
exports.validateHarnessRepository = validateHarnessRepository;
exports.validateRepository = validateRepository;
exports.validateTargetGoal = validateTargetGoal;
exports.validateTargetHarnessProfile = validateTargetHarnessProfile;
exports.validateTargetProfile = validateTargetProfile;
const registry_1 = require("./registry");
const constants_1 = require("./constants");
function runValidators(validators, context) {
    for (const validator of validators) {
        validator.run(context);
    }
    return context.failures;
}
function validateHarnessRepository(baseDir = constants_1.root) {
    return runValidators(registry_1.harnessRepositoryValidators, {
        baseDir,
        failures: [],
    });
}
function validateRepository(baseDir = constants_1.root) {
    return validateHarnessRepository(baseDir);
}
function validateTargetHarnessProfile(baseDir) {
    return runValidators(registry_1.targetProfileValidators, {
        baseDir,
        failures: [],
        runtime: null,
    });
}
function validateTargetProfile(baseDir, runtime) {
    return runValidators(registry_1.targetProfileValidators, {
        baseDir,
        failures: [],
        runtime,
    });
}
function validateTargetGoal(baseDir, goalId, runtime) {
    return runValidators(registry_1.targetGoalValidators, {
        baseDir,
        failures: [],
        goalId,
        runtime,
    });
}
function countCheckedContracts() {
    const validators = [...registry_1.harnessRepositoryValidators];
    return validators.reduce((sum, validator) => sum + (validator.weight || 0), 0);
}
