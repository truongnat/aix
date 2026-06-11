// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/domain/constants.js") as typeof import("../../src/features/validate/domain/constants");

export const root = api.root;
export const requiredFiles = api.requiredFiles;
export const commandFiles = api.commandFiles;
export const skillFiles = api.skillFiles;
export const templateFiles = api.templateFiles;
export const promptTemplateFiles = api.promptTemplateFiles;
export const sessionMemoryDocFiles = api.sessionMemoryDocFiles;
export const sessionAwareCommandFiles = api.sessionAwareCommandFiles;
export const commandHeadings = api.commandHeadings;
export const skillHeadings = api.skillHeadings;
export const promptTemplateHeadings = api.promptTemplateHeadings;
export const toolFileHeadings = api.toolFileHeadings;
export const packRequiredHeadings = api.packRequiredHeadings;
export const harnessHeadings = api.harnessHeadings;
export const teamHeadings = api.teamHeadings;
export const selectedSkillsHeadings = api.selectedSkillsHeadings;
export const workflowHeadings = api.workflowHeadings;
export const gatesHeadings = api.gatesHeadings;
export const memoryHeadings = api.memoryHeadings;
export const decisionsHeadings = api.decisionsHeadings;
export const hazardsHeadings = api.hazardsHeadings;
export const indexHeadings = api.indexHeadings;
export const targetHarnessProfileFiles = api.targetHarnessProfileFiles;
export const targetProfileHeadingContracts = api.targetProfileHeadingContracts;
export const goalArtifactHeadings = api.goalArtifactHeadings;
export const sessionStateHeadings = api.sessionStateHeadings;
export const VALID_TARGET_RUNTIMES = api.VALID_TARGET_RUNTIMES;
export const TOOL_DISCOVERY_KEYS = api.TOOL_DISCOVERY_KEYS;
