import {
  commandFiles,
  commandHeadings,
  promptTemplateFiles,
  promptTemplateHeadings,
  requiredFiles,
  skillFiles,
  skillHeadings,
  templateFiles,
  VALID_TARGET_RUNTIMES,
} from "./constants";
import { parseValidateArgs } from "./args";
import { getRuntimeBootstrapPaths, isValidTargetRuntime } from "./target";
import {
  ACTIVE_COMMAND_NAMING_PATHS,
  DOGFOOD_DEMO_PREFIX,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPlanTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertSkillContractStructure,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  validateRuntimeCommandSurface,
  assertBlockedTemplateContract,
} from "./contracts";
import { extractMarkdownSection, hasConcreteFailureRule, hasSubstantiveSectionBody } from "./utils";
import {
  countCheckedContracts,
  validateHarnessRepository,
  validateRepository,
  validateTargetGoal,
  validateTargetHarnessProfile,
  validateTargetProfile,
} from "./runners";

const executionHeadings = [
  "## Active Goal",
  "## Current Task",
  "## Execution Log",
  "## Deviations From Plan",
  "## Review Loop",
  "## Verification Loop",
  "## Current State",
  "## Next Step",
  "## Safety Notes",
];

const skillTemplateHeadings = [
  "## Purpose",
  "## Boundary",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Workflow",
  "## Output Contract",
  "## Common Failure Modes",
  "## Checklist Before Done",
];

const taskHeadings = [
  "## Task ID",
  "## Goal",
  "## Status",
  "## Scope",
  "## Steps",
  "## Verification",
  "## Completion Evidence",
  "## Safety Notes",
];

/**
 * Main validation entry point.
 * Validates either:
 * - The harness repository itself (contracts, file structure, content)
 * - A target repository's profile (installed harness surface)
 * - A target repository's active session goal (session artifacts)
 *
 * Reads validation mode from command-line arguments.
 * Exits with code 0 on success, 1 on validation failure.
 *
 * @example
 * ```bash
 * # Validate harness repository
 * node validate.js
 *
 * # Validate target profile
 * node validate.js --target /path/to/project --profile-only
 *
 * # Validate target goal
 * node validate.js --target /path/to/project --goal SESSION_ID
 * ```
 */
function main(): void {
  const args = parseValidateArgs(process.argv.slice(2));

  if (args.usageErrors && args.usageErrors.length > 0) {
    console.error("Validation usage error:");
    for (const error of args.usageErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  let failures: string[];
  if (args.mode === "target-profile") {
    failures = validateTargetProfile(args.baseDir, args.runtime ?? null);
  } else if (args.mode === "target-goal") {
    failures = validateTargetGoal(args.baseDir, args.goalId ?? "", args.runtime ?? null);
  } else {
    failures = validateHarnessRepository(args.baseDir);
  }

  if (failures.length > 0) {
    console.error(
      args.mode === "harness-repository"
        ? "Harness validation failed:"
        : "Target repository validation failed:"
    );
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  if (args.mode === "target-profile") {
    console.log(
      args.runtime
        ? `Target repository validation passed. Checked profile contract (runtime: ${args.runtime}).`
        : "Target repository validation passed. Checked profile contract."
    );
    return;
  }

  if (args.mode === "target-goal") {
    console.log(
      args.runtime
        ? `Target repository validation passed. Checked session contract: ${args.goalId} (runtime: ${args.runtime}).`
        : `Target repository validation passed. Checked session contract: ${args.goalId}.`
    );
    return;
  }

  console.log(
    `Harness validation passed. Checked ${countCheckedContracts()} required files/contracts.`
  );
}

export {
  ACTIVE_COMMAND_NAMING_PATHS,
  DOGFOOD_DEMO_PREFIX,
  VALID_TARGET_RUNTIMES,
  assertBlockedTemplateContract,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPlanTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertSkillContractStructure,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  commandFiles,
  commandHeadings,
  countCheckedContracts,
  executionHeadings,
  extractMarkdownSection,
  getRuntimeBootstrapPaths,
  hasConcreteFailureRule,
  hasSubstantiveSectionBody,
  isValidTargetRuntime,
  main,
  parseValidateArgs,
  promptTemplateFiles,
  promptTemplateHeadings,
  requiredFiles,
  skillFiles,
  skillHeadings,
  skillTemplateHeadings,
  taskHeadings,
  templateFiles,
  validateHarnessRepository,
  validateRepository,
  validateRuntimeCommandSurface,
  validateTargetGoal,
  validateTargetHarnessProfile,
  validateTargetProfile,
};
