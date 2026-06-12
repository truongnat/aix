#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const shims = [
  {
    lib: "lib/validate/constants.ts",
    dist: "features/validate/domain/constants",
    src: "src/features/validate/domain/constants",
    exports: [
      "root",
      "requiredFiles",
      "commandFiles",
      "skillFiles",
      "templateFiles",
      "promptTemplateFiles",
      "sessionMemoryDocFiles",
      "sessionAwareCommandFiles",
      "commandHeadings",
      "skillHeadings",
      "promptTemplateHeadings",
      "toolFileHeadings",
      "packRequiredHeadings",
      "harnessHeadings",
      "teamHeadings",
      "selectedSkillsHeadings",
      "workflowHeadings",
      "gatesHeadings",
      "memoryHeadings",
      "decisionsHeadings",
      "hazardsHeadings",
      "indexHeadings",
      "targetHarnessProfileFiles",
      "targetProfileHeadingContracts",
      "goalArtifactHeadings",
      "sessionStateHeadings",
      "VALID_TARGET_RUNTIMES",
      "TOOL_DISCOVERY_KEYS",
    ],
  },
  {
    lib: "lib/validate/utils.ts",
    dist: "features/validate/domain/utils",
    src: "src/features/validate/domain/utils",
    exports: [
      "HARNESS_COMMAND_PATTERN",
      "assertExists",
      "assertHeadings",
      "assertNonEmpty",
      "extractMachineField",
      "extractMarkdownSection",
      "hasConcreteFailureRule",
      "hasSubstantiveSectionBody",
      "isPlaceholderBullet",
      "parseFrontmatter",
      "parseNestedFrontmatterMap",
      "readFile",
      "resolvePath",
    ],
  },
  {
    lib: "lib/validate/contracts.ts",
    dist: "features/validate/domain/contracts",
    src: "src/features/validate/domain/contracts",
    exports: [
      "ACTIVE_COMMAND_NAMING_PATHS",
      "DOGFOOD_DEMO_PREFIX",
      "assertAgentsContent",
      "assertBlockedTemplateContract",
      "assertCommandContractStructure",
      "assertDogfoodDemoContract",
      "assertHyphenCommandNamingInActiveDocs",
      "assertPackContract",
      "assertPlanTemplateContract",
      "assertChangeSpecTemplateContract",
      "assertPromptTemplateContract",
      "assertPublicDemoPolish",
      "assertReviewTemplateContract",
      "assertSessionAwareCommandRouting",
      "assertSessionConfigTemplate",
      "assertTargetHarnessConfig",
      "assertSessionMemoryDocContracts",
      "assertSessionStartReferenceContracts",
      "assertSkillContractStructure",
      "assertToolDiscoveryScript",
      "assertToolFileContract",
      "assertToolRoutingDocs",
      "assertVerifyArtifactContent",
      "assertVerifyTemplateContract",
      "assertWorkflowDocumentationContracts",
      "assertWorkerContract",
      "validateRuntimeCommandSurface",
    ],
  },
  {
    lib: "lib/validate/args.ts",
    dist: "features/validate/presentation/args",
    src: "src/features/validate/presentation/args",
    exports: ["parseValidateArgs"],
    types: ["ParseResult"],
  },
  {
    lib: "lib/validate/target.ts",
    dist: "features/validate/infrastructure/target",
    src: "src/features/validate/infrastructure/target",
    exports: ["getRuntimeBootstrapPaths", "isValidTargetRuntime", "normalizeTargetRuntime"],
  },
  {
    lib: "lib/validate/runners.ts",
    dist: "features/validate/application/runners",
    src: "src/features/validate/application/runners",
    exports: [
      "countCheckedContracts",
      "validateHarnessRepository",
      "validateRepository",
      "validateTargetGoal",
      "validateTargetHarnessProfile",
      "validateTargetProfile",
    ],
    types: ["ValidationContext", "Validator"],
  },
  {
    lib: "lib/validate/registry.ts",
    dist: "features/validate/application/registry",
    src: "src/features/validate/application/registry",
    exports: ["harnessRepositoryValidators", "targetGoalValidators", "targetProfileValidators"],
    types: ["ValidationContext", "Validator"],
  },
  {
    lib: "lib/validate/agent-system.ts",
    dist: "features/validate/application/agent-system",
    src: "src/features/validate/application/agent-system",
    exports: ["assertAgentSystemLayer"],
  },
  {
    lib: "lib/validate/session-start.ts",
    dist: "features/validate/application/session-start",
    src: "src/features/validate/application/session-start",
    exports: ["assertSessionStartLayer"],
  },
  {
    lib: "lib/validate/daily-dev-report.ts",
    dist: "features/validate/application/daily-dev-report",
    src: "src/features/validate/application/daily-dev-report",
    exports: ["assertDailyDevReportLayer"],
  },
  {
    lib: "lib/validate/hooks-skills.ts",
    dist: "features/validate/application/hooks-skills",
    src: "src/features/validate/application/hooks-skills",
    exports: ["assertHooksAndSkillsLayer"],
  },
];

function writeShim({ lib, dist, src, exports, types = [] }) {
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/features/validate/.",
    "// Layer: presentation (shim)",
    "// Depends on: dist/features/validate (built by build:src)",
    "",
    "/* eslint-disable @typescript-eslint/no-require-imports */",
    `const api = require("../../${dist}.js") as typeof import("../../${src}");`,
    "",
  ];

  for (const name of exports) {
    lines.push(`export const ${name} = api.${name};`);
  }
  lines.push("");

  for (const typeName of types) {
    lines.push(`export type ${typeName} = import("../../${src}").${typeName};`);
  }

  if (types.length > 0) {
    lines.push("");
  }

  fs.writeFileSync(path.join(repoRoot, lib), lines.join("\n"));
}

for (const shim of shims) {
  writeShim(shim);
}

const indexExports = [
  "ACTIVE_COMMAND_NAMING_PATHS",
  "DOGFOOD_DEMO_PREFIX",
  "VALID_TARGET_RUNTIMES",
  "assertBlockedTemplateContract",
  "assertCommandContractStructure",
  "assertDogfoodDemoContract",
  "assertChangeSpecTemplateContract",
  "assertHyphenCommandNamingInActiveDocs",
  "assertPlanTemplateContract",
  "assertPromptTemplateContract",
  "assertPublicDemoPolish",
  "assertSkillContractStructure",
  "assertVerifyArtifactContent",
  "assertVerifyTemplateContract",
  "commandFiles",
  "commandHeadings",
  "countCheckedContracts",
  "executionHeadings",
  "extractMarkdownSection",
  "getRuntimeBootstrapPaths",
  "hasConcreteFailureRule",
  "hasSubstantiveSectionBody",
  "isValidTargetRuntime",
  "main",
  "parseValidateArgs",
  "promptTemplateFiles",
  "promptTemplateHeadings",
  "requiredFiles",
  "skillFiles",
  "skillHeadings",
  "skillTemplateHeadings",
  "taskHeadings",
  "templateFiles",
  "validateHarnessRepository",
  "validateRepository",
  "validateRuntimeCommandSurface",
  "validateTargetGoal",
  "validateTargetHarnessProfile",
  "validateTargetProfile",
];

writeShim({
  lib: "lib/validate/index.ts",
  dist: "features/validate/index",
  src: "src/features/validate/index",
  exports: indexExports,
});

console.log("Wrote validate shims:", shims.length + 1);
