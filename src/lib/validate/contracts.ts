// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/domain/contracts.js") as typeof import("../../features/validate/domain/contracts");

export const ACTIVE_COMMAND_NAMING_PATHS = api.ACTIVE_COMMAND_NAMING_PATHS;
export const DOGFOOD_DEMO_PREFIX = api.DOGFOOD_DEMO_PREFIX;
export const assertAgentsContent = api.assertAgentsContent;
export const assertBlockedTemplateContract = api.assertBlockedTemplateContract;
export const assertCommandContractStructure = api.assertCommandContractStructure;
export const assertDogfoodDemoContract = api.assertDogfoodDemoContract;
export const assertHyphenCommandNamingInActiveDocs = api.assertHyphenCommandNamingInActiveDocs;
export const assertPackContract = api.assertPackContract;
export const assertPlanTemplateContract = api.assertPlanTemplateContract;
export const assertChangeSpecTemplateContract = api.assertChangeSpecTemplateContract;
export const assertPromptTemplateContract = api.assertPromptTemplateContract;
export const assertPublicDemoPolish = api.assertPublicDemoPolish;
export const assertReviewTemplateContract = api.assertReviewTemplateContract;
export const assertSessionAwareCommandRouting = api.assertSessionAwareCommandRouting;
export const assertSessionConfigTemplate = api.assertSessionConfigTemplate;
export const assertTargetHarnessConfig = api.assertTargetHarnessConfig;
export const assertSessionMemoryDocContracts = api.assertSessionMemoryDocContracts;
export const assertSessionStartReferenceContracts = api.assertSessionStartReferenceContracts;
export const assertSkillContractStructure = api.assertSkillContractStructure;
export const assertToolDiscoveryScript = api.assertToolDiscoveryScript;
export const assertToolFileContract = api.assertToolFileContract;
export const assertToolRoutingDocs = api.assertToolRoutingDocs;
export const assertVerifyArtifactContent = api.assertVerifyArtifactContent;
export const assertVerifyTemplateContract = api.assertVerifyTemplateContract;
export const assertWorkflowDocumentationContracts = api.assertWorkflowDocumentationContracts;
export const assertWorkerContract = api.assertWorkerContract;
export const validateRuntimeCommandSurface = api.validateRuntimeCommandSurface;
