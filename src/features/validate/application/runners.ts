import {
  harnessRepositoryValidators,
  targetGoalValidators,
  targetProfileValidators,
} from "./registry";
import { root } from "../domain/constants";

interface ValidationContext {
  baseDir: string;
  failures: string[];
  runtime?: string | null;
  goalId?: string;
}

interface Validator {
  run: (context: ValidationContext) => void;
  weight?: number;
}

function runValidators(validators: Validator[], context: ValidationContext): string[] {
  for (const validator of validators) {
    validator.run(context);
  }
  return context.failures;
}

function validateHarnessRepository(baseDir: string = root): string[] {
  return runValidators(harnessRepositoryValidators, {
    baseDir,
    failures: [],
  });
}

function validateRepository(baseDir: string = root): string[] {
  return validateHarnessRepository(baseDir);
}

function validateTargetHarnessProfile(baseDir: string): string[] {
  return runValidators(targetProfileValidators, {
    baseDir,
    failures: [],
    runtime: null,
  });
}

function validateTargetProfile(baseDir: string, runtime: string | null): string[] {
  return runValidators(targetProfileValidators, {
    baseDir,
    failures: [],
    runtime,
  });
}

function validateTargetGoal(baseDir: string, goalId: string, runtime: string | null): string[] {
  return runValidators(targetGoalValidators, {
    baseDir,
    failures: [],
    goalId,
    runtime,
  });
}

function countCheckedContracts(): number {
  const validators = [...harnessRepositoryValidators];
  return validators.reduce((sum, validator) => sum + (validator.weight || 0), 0);
}

export {
  countCheckedContracts,
  validateHarnessRepository,
  validateRepository,
  validateTargetGoal,
  validateTargetHarnessProfile,
  validateTargetProfile,
};
export type { ValidationContext, Validator };
