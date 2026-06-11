// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/index.js") as typeof import("../../src/features/validate/index");

export const ACTIVE_COMMAND_NAMING_PATHS = api.ACTIVE_COMMAND_NAMING_PATHS;
export const DOGFOOD_DEMO_PREFIX = api.DOGFOOD_DEMO_PREFIX;
export const VALID_TARGET_RUNTIMES = api.VALID_TARGET_RUNTIMES;
export const assertBlockedTemplateContract = api.assertBlockedTemplateContract;
export const assertCommandContractStructure = api.assertCommandContractStructure;
export const assertDogfoodDemoContract = api.assertDogfoodDemoContract;
export const assertChangeSpecTemplateContract = api.assertChangeSpecTemplateContract;
export const assertHyphenCommandNamingInActiveDocs = api.assertHyphenCommandNamingInActiveDocs;
export const assertPlanTemplateContract = api.assertPlanTemplateContract;
export const assertPromptTemplateContract = api.assertPromptTemplateContract;
export const assertPublicDemoPolish = api.assertPublicDemoPolish;
export const assertSkillContractStructure = api.assertSkillContractStructure;
export const assertVerifyArtifactContent = api.assertVerifyArtifactContent;
export const assertVerifyTemplateContract = api.assertVerifyTemplateContract;
export const commandFiles = api.commandFiles;
export const commandHeadings = api.commandHeadings;
export const countCheckedContracts = api.countCheckedContracts;
export const executionHeadings = api.executionHeadings;
export const extractMarkdownSection = api.extractMarkdownSection;
export const getRuntimeBootstrapPaths = api.getRuntimeBootstrapPaths;
export const hasConcreteFailureRule = api.hasConcreteFailureRule;
export const hasSubstantiveSectionBody = api.hasSubstantiveSectionBody;
export const isValidTargetRuntime = api.isValidTargetRuntime;
export const main = api.main;
export const parseValidateArgs = api.parseValidateArgs;
export const promptTemplateFiles = api.promptTemplateFiles;
export const promptTemplateHeadings = api.promptTemplateHeadings;
export const requiredFiles = api.requiredFiles;
export const skillFiles = api.skillFiles;
export const skillHeadings = api.skillHeadings;
export const skillTemplateHeadings = api.skillTemplateHeadings;
export const taskHeadings = api.taskHeadings;
export const templateFiles = api.templateFiles;
export const validateHarnessRepository = api.validateHarnessRepository;
export const validateRepository = api.validateRepository;
export const validateRuntimeCommandSurface = api.validateRuntimeCommandSurface;
export const validateTargetGoal = api.validateTargetGoal;
export const validateTargetHarnessProfile = api.validateTargetHarnessProfile;
export const validateTargetProfile = api.validateTargetProfile;
