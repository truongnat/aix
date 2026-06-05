"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTargetProfile = exports.validateTargetHarnessProfile = exports.validateTargetGoal = exports.validateRuntimeCommandSurface = exports.validateRepository = exports.validateHarnessRepository = exports.templateFiles = exports.taskHeadings = exports.skillTemplateHeadings = exports.skillHeadings = exports.skillFiles = exports.requiredFiles = exports.promptTemplateHeadings = exports.promptTemplateFiles = exports.parseValidateArgs = exports.isValidTargetRuntime = exports.hasSubstantiveSectionBody = exports.hasConcreteFailureRule = exports.getRuntimeBootstrapPaths = exports.extractMarkdownSection = exports.executionHeadings = exports.countCheckedContracts = exports.commandHeadings = exports.commandFiles = exports.assertVerifyTemplateContract = exports.assertVerifyArtifactContent = exports.assertSkillContractStructure = exports.assertPublicDemoPolish = exports.assertPromptTemplateContract = exports.assertPlanTemplateContract = exports.assertHyphenCommandNamingInActiveDocs = exports.assertDogfoodDemoContract = exports.assertCommandContractStructure = exports.assertBlockedTemplateContract = exports.VALID_TARGET_RUNTIMES = exports.DOGFOOD_DEMO_PREFIX = exports.ACTIVE_COMMAND_NAMING_PATHS = void 0;
exports.main = main;
const constants_1 = require("./constants");
Object.defineProperty(exports, "commandFiles", { enumerable: true, get: function () { return constants_1.commandFiles; } });
Object.defineProperty(exports, "commandHeadings", { enumerable: true, get: function () { return constants_1.commandHeadings; } });
Object.defineProperty(exports, "promptTemplateFiles", { enumerable: true, get: function () { return constants_1.promptTemplateFiles; } });
Object.defineProperty(exports, "promptTemplateHeadings", { enumerable: true, get: function () { return constants_1.promptTemplateHeadings; } });
Object.defineProperty(exports, "requiredFiles", { enumerable: true, get: function () { return constants_1.requiredFiles; } });
Object.defineProperty(exports, "skillFiles", { enumerable: true, get: function () { return constants_1.skillFiles; } });
Object.defineProperty(exports, "skillHeadings", { enumerable: true, get: function () { return constants_1.skillHeadings; } });
Object.defineProperty(exports, "templateFiles", { enumerable: true, get: function () { return constants_1.templateFiles; } });
Object.defineProperty(exports, "VALID_TARGET_RUNTIMES", { enumerable: true, get: function () { return constants_1.VALID_TARGET_RUNTIMES; } });
const args_1 = require("./args");
Object.defineProperty(exports, "parseValidateArgs", { enumerable: true, get: function () { return args_1.parseValidateArgs; } });
const target_1 = require("./target");
Object.defineProperty(exports, "getRuntimeBootstrapPaths", { enumerable: true, get: function () { return target_1.getRuntimeBootstrapPaths; } });
Object.defineProperty(exports, "isValidTargetRuntime", { enumerable: true, get: function () { return target_1.isValidTargetRuntime; } });
const contracts_1 = require("./contracts");
Object.defineProperty(exports, "ACTIVE_COMMAND_NAMING_PATHS", { enumerable: true, get: function () { return contracts_1.ACTIVE_COMMAND_NAMING_PATHS; } });
Object.defineProperty(exports, "DOGFOOD_DEMO_PREFIX", { enumerable: true, get: function () { return contracts_1.DOGFOOD_DEMO_PREFIX; } });
Object.defineProperty(exports, "assertCommandContractStructure", { enumerable: true, get: function () { return contracts_1.assertCommandContractStructure; } });
Object.defineProperty(exports, "assertDogfoodDemoContract", { enumerable: true, get: function () { return contracts_1.assertDogfoodDemoContract; } });
Object.defineProperty(exports, "assertHyphenCommandNamingInActiveDocs", { enumerable: true, get: function () { return contracts_1.assertHyphenCommandNamingInActiveDocs; } });
Object.defineProperty(exports, "assertPlanTemplateContract", { enumerable: true, get: function () { return contracts_1.assertPlanTemplateContract; } });
Object.defineProperty(exports, "assertPromptTemplateContract", { enumerable: true, get: function () { return contracts_1.assertPromptTemplateContract; } });
Object.defineProperty(exports, "assertPublicDemoPolish", { enumerable: true, get: function () { return contracts_1.assertPublicDemoPolish; } });
Object.defineProperty(exports, "assertSkillContractStructure", { enumerable: true, get: function () { return contracts_1.assertSkillContractStructure; } });
Object.defineProperty(exports, "assertVerifyArtifactContent", { enumerable: true, get: function () { return contracts_1.assertVerifyArtifactContent; } });
Object.defineProperty(exports, "assertVerifyTemplateContract", { enumerable: true, get: function () { return contracts_1.assertVerifyTemplateContract; } });
Object.defineProperty(exports, "validateRuntimeCommandSurface", { enumerable: true, get: function () { return contracts_1.validateRuntimeCommandSurface; } });
Object.defineProperty(exports, "assertBlockedTemplateContract", { enumerable: true, get: function () { return contracts_1.assertBlockedTemplateContract; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "extractMarkdownSection", { enumerable: true, get: function () { return utils_1.extractMarkdownSection; } });
Object.defineProperty(exports, "hasConcreteFailureRule", { enumerable: true, get: function () { return utils_1.hasConcreteFailureRule; } });
Object.defineProperty(exports, "hasSubstantiveSectionBody", { enumerable: true, get: function () { return utils_1.hasSubstantiveSectionBody; } });
const runners_1 = require("./runners");
Object.defineProperty(exports, "countCheckedContracts", { enumerable: true, get: function () { return runners_1.countCheckedContracts; } });
Object.defineProperty(exports, "validateHarnessRepository", { enumerable: true, get: function () { return runners_1.validateHarnessRepository; } });
Object.defineProperty(exports, "validateRepository", { enumerable: true, get: function () { return runners_1.validateRepository; } });
Object.defineProperty(exports, "validateTargetGoal", { enumerable: true, get: function () { return runners_1.validateTargetGoal; } });
Object.defineProperty(exports, "validateTargetHarnessProfile", { enumerable: true, get: function () { return runners_1.validateTargetHarnessProfile; } });
Object.defineProperty(exports, "validateTargetProfile", { enumerable: true, get: function () { return runners_1.validateTargetProfile; } });
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
exports.executionHeadings = executionHeadings;
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
exports.skillTemplateHeadings = skillTemplateHeadings;
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
exports.taskHeadings = taskHeadings;
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
function main() {
    const args = (0, args_1.parseValidateArgs)(process.argv.slice(2));
    if (args.usageErrors && args.usageErrors.length > 0) {
        console.error("Validation usage error:");
        for (const error of args.usageErrors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }
    let failures;
    if (args.mode === "target-profile") {
        failures = (0, runners_1.validateTargetProfile)(args.baseDir, args.runtime ?? null);
    }
    else if (args.mode === "target-goal") {
        failures = (0, runners_1.validateTargetGoal)(args.baseDir, args.goalId ?? "", args.runtime ?? null);
    }
    else {
        failures = (0, runners_1.validateHarnessRepository)(args.baseDir);
    }
    if (failures.length > 0) {
        console.error(args.mode === "harness-repository"
            ? "Harness validation failed:"
            : "Target repository validation failed:");
        for (const failure of failures) {
            console.error(`- ${failure}`);
        }
        process.exit(1);
    }
    if (args.mode === "target-profile") {
        console.log(args.runtime
            ? `Target repository validation passed. Checked profile contract (runtime: ${args.runtime}).`
            : "Target repository validation passed. Checked profile contract.");
        return;
    }
    if (args.mode === "target-goal") {
        console.log(args.runtime
            ? `Target repository validation passed. Checked session contract: ${args.goalId} (runtime: ${args.runtime}).`
            : `Target repository validation passed. Checked session contract: ${args.goalId}.`);
        return;
    }
    console.log(`Harness validation passed. Checked ${(0, runners_1.countCheckedContracts)()} required files/contracts.`);
}
