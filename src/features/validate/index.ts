// Purpose: Public exports for validate feature.
// Layer: presentation
// Depends on: all validate layers

export {
  ACTIVE_COMMAND_NAMING_PATHS,
  DOGFOOD_DEMO_PREFIX,
} from "./domain/contracts";

export { VALID_TARGET_RUNTIMES } from "./domain/constants";

export {
  assertBlockedTemplateContract,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertChangeSpecTemplateContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPlanTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertSkillContractStructure,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  validateRuntimeCommandSurface,
} from "./domain/contracts";

export {
  commandFiles,
  commandHeadings,
  promptTemplateFiles,
  promptTemplateHeadings,
  requiredFiles,
  skillFiles,
  skillHeadings,
  templateFiles,
} from "./domain/constants";

export { extractMarkdownSection, hasConcreteFailureRule, hasSubstantiveSectionBody } from "./domain/utils";

export {
  countCheckedContracts,
  validateHarnessRepository,
  validateRepository,
  validateTargetGoal,
  validateTargetHarnessProfile,
  validateTargetProfile,
} from "./application/runners";

export { getRuntimeBootstrapPaths, isValidTargetRuntime } from "./infrastructure/target";

export { parseValidateArgs } from "./presentation/args";

export {
  executionHeadings,
  skillTemplateHeadings,
  taskHeadings,
  main,
} from "./presentation/main";
