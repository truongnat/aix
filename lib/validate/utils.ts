// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/domain/utils.js") as typeof import("../../src/features/validate/domain/utils");

export const HARNESS_COMMAND_PATTERN = api.HARNESS_COMMAND_PATTERN;
export const assertExists = api.assertExists;
export const assertHeadings = api.assertHeadings;
export const assertNonEmpty = api.assertNonEmpty;
export const extractMachineField = api.extractMachineField;
export const extractMarkdownSection = api.extractMarkdownSection;
export const hasConcreteFailureRule = api.hasConcreteFailureRule;
export const hasSubstantiveSectionBody = api.hasSubstantiveSectionBody;
export const isPlaceholderBullet = api.isPlaceholderBullet;
export const parseFrontmatter = api.parseFrontmatter;
export const parseNestedFrontmatterMap = api.parseNestedFrontmatterMap;
export const readFile = api.readFile;
export const resolvePath = api.resolvePath;
