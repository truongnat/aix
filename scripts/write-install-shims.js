#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function writeShim({ lib, dist, exports, types = [] }) {
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/ clean architecture.",
    "// Layer: presentation (shim)",
    "// Depends on: dist/features or dist/shared (built by build:src)",
    "",
    "/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */",
    `const api = require("../../${dist}.js") as any;`,
    "",
  ];

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
    lib: "lib/backend/constants.ts",
    dist: "shared/install-kernel/constants",
    exports: [
      "EXCLUDE_BLOCK_START",
      "EXCLUDE_BLOCK_END",
      "HARNESS_MARKER",
      "providerCommandPaths",
      "ignorePathsForProvider",
      "uninstallPathsForProvider",
    ],
  },
  {
    lib: "lib/backend/git-hygiene.ts",
    dist: "shared/install-kernel/git-hygiene",
    exports: [
      "collectIgnorePaths",
      "hasHarnessExcludeBlock",
      "applyPrivateIgnore",
      "removeIgnoreBlock",
      "reconcileDeferredPrivateIgnore",
    ],
    types: ["IgnoreContext", "IgnoreResult"],
  },
  {
    lib: "lib/backend/harness-skeleton.ts",
    dist: "features/install/infrastructure/harness-skeleton",
    exports: ["initHarnessProfile"],
    types: ["SkeletonContext", "SkeletonResult"],
  },
  {
    lib: "lib/backend/install-orchestrator.ts",
    dist: "features/install/application/run-install",
    exports: ["runInstall"],
    types: ["InstallContext", "InstallResult"],
  },
  {
    lib: "lib/backend/update.ts",
    dist: "features/update/application/run-update",
    exports: ["runUpdate"],
    types: ["UpdateContext", "UpdateResult"],
  },
  {
    lib: "lib/backend/uninstall.ts",
    dist: "features/uninstall/application/run-uninstall",
    exports: ["runUninstall"],
    types: ["UninstallContext", "UninstallResult"],
  },
  {
    lib: "lib/install-cache.ts",
    dist: "features/install/infrastructure/install-cache",
    exports: [
      "CACHE_DIR",
      "cacheExportPaths",
      "formatResults",
      "installCapabilityCache",
      "cacheRelativePath",
      "listFiles",
      "main",
      "parseArgs",
    ],
    types: ["InstallCacheOptions", "CacheInstallResult"],
  },
  {
    lib: "lib/install-runtime.ts",
    dist: "features/install/infrastructure/install-runtime",
    exports: ["ALL_RUNTIMES", "deepMerge", "installRuntime", "installProviderCommands"],
    types: [
      "RuntimeId",
      "InstallScope",
      "InstallRuntimeOptions",
      "ProviderCommandEntry",
      "JsonObject",
    ],
  },
  {
    lib: "lib/cli-commands/install.ts",
    dist: "features/install/presentation/install-command",
    exports: ["runInstallBackend", "runInstallWizard"],
  },
  {
    lib: "lib/cli-commands/update.ts",
    dist: "features/update/presentation/update-command",
    exports: ["runUpdateWizard"],
  },
  {
    lib: "lib/cli-commands/uninstall.ts",
    dist: "features/uninstall/presentation/uninstall-command",
    exports: ["runUninstallWizard"],
  },
];

for (const shim of shims) {
  writeShim(shim);
}

console.log("Wrote install phase 4 shims:", shims.length);
