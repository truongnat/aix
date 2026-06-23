#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function writeShim({ lib, requirePath, exports, types = [], defaultExport = false }) {
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/cli/.",
    "// Layer: presentation (shim)",
    "// Depends on: dist/cli (built by build:src)",
    "",
    "/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */",
    `const api = require("${requirePath}") as any;`,
    "",
  ];

  if (defaultExport) {
    lines.push("export default api.default ?? api;");
    lines.push("");
  }

  for (const name of exports) {
    lines.push(`export const ${name} = api.${name};`);
  }
  lines.push("");

  for (const typeName of types) {
    lines.push(`export type ${typeName} = any;`);
  }

  if (types.length > 0) {
    lines.push("");
  }

  fs.writeFileSync(path.join(root, lib), lines.join("\n"));
}

const shims = [
  {
    lib: "lib/cli-main.ts",
    requirePath: "../cli/main.js",
    exports: ["main", "printHelp", "SOURCE_URL"],
  },
  {
    lib: "lib/cli-args.ts",
    requirePath: "../cli/args.js",
    exports: [
      "COMMANDS",
      "EVAL_COMMANDS",
      "parseArgv",
      "modeToScopeVisibility",
      "isNonInteractive",
    ],
    types: ["ParseOptions", "ScopeVisibility"],
  },
  {
    lib: "lib/cli-backend.ts",
    requirePath: "../cli/backend.js",
    exports: ["packRootFromModule"],
  },
  {
    lib: "lib/cli-help.ts",
    requirePath: "../cli/help.js",
    exports: ["renderHelp", "printHelp"],
  },
  {
    lib: "lib/cli-providers.ts",
    requirePath: "../cli/providers.js",
    exports: [
      "ACTIVE_PROVIDERS",
      "ACTIVE_PROVIDER_IDS",
      "FALLBACK_TARGETS",
      "RUNTIME_NATIVE_PROVIDER_IDS",
      "getProvider",
      "isRuntimeNative",
      "isSupportedProvider",
      "providerPriorityLabel",
    ],
    types: ["ProviderDescriptor", "ProviderPriority"],
  },
  {
    lib: "lib/cli-plan.ts",
    requirePath: "../cli/plan.js",
    exports: [
      "NON_GIT_PRIVATE_WARNING",
      "NON_GIT_PRIVATE_WARNING_FOLLOWUP",
      "pathsForProvider",
      "buildInstallPlan",
      "printPlan",
      "warnNonGitPrivate",
    ],
    types: ["InstallPlan", "PlanProviderId"],
  },
  {
    lib: "lib/cli-detect.ts",
    requirePath: "../cli/detect.js",
    exports: [
      "detectInstalledProviders",
      "detectLegacyProviderResidue",
      "detectRecommendedProviders",
      "fileContainsHarnessMarker",
      "isGitRepo",
      "detectProviderBinaries",
      "listDetectedProviderBinaryIds",
    ],
  },
  {
    lib: "lib/cli-command-helpers.ts",
    requirePath: "../cli/command-helpers.js",
    exports: [
      "readPackageVersion",
      "resolveTargetAbs",
      "validateProviderSelection",
      "validateManualMix",
      "backendOpts",
      "failWithBackendError",
    ],
  },
  {
    lib: "lib/cli-ui.ts",
    requirePath: "../cli/ui/index.js",
    defaultExport: true,
    exports: [
      "useInteractiveUi",
      "introBanner",
      "selectProviders",
      "selectInstallScope",
      "confirmInstallCache",
      "confirmRemoveState",
      "confirmFullCleanup",
      "confirmProceed",
      "showInstallPlan",
      "showUpdatePlan",
      "showUninstallPlan",
      "showSuccess",
      "showCancel",
      "showWarning",
      "showError",
      "runWithSpinner",
      "formatStatus",
      "formatDoctor",
      "isCancel",
    ],
    types: ["IntroMeta", "ProviderItem", "InstallPlan", "UninstallContext", "SpinnerResult"],
  },
  {
    lib: "lib/cli-prompts.ts",
    requirePath: "../cli/ui/prompts.js",
    exports: ["selectMany", "selectOne", "confirm"],
  },
  {
    lib: "lib/cli-commands/diagnostics.ts",
    requirePath: "../../cli/commands/diagnostics.js",
    exports: ["runStatusOrDoctor"],
  },
  {
    lib: "lib/cli-commands/insights.ts",
    requirePath: "../../cli/commands/insights.js",
    exports: ["runInsightsCommand"],
  },
];

for (const shim of shims) {
  writeShim(shim);
}

console.log("Wrote CLI phase 7 shims:", shims.length);
