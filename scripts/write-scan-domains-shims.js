#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function writeShim({ lib, dist, requirePath, exports, types = [], defaultExport = null }) {
  const resolvedRequire = requirePath ?? `../../${dist}.js`;
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/.",
    "// Layer: presentation (shim)",
    "// Depends on: dist (built by build:src)",
    "",
    "/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */",
    `const api = require("${resolvedRequire}") as any;`,
    "",
  ];

  if (defaultExport) {
    lines.push(`export default api.${defaultExport};`);
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

function writeScannerShim() {
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/features/scan/.",
    "// Layer: infrastructure (shim)",
    "// Depends on: dist/features/scan (built by build:src)",
    "",
    "/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */",
    'const api = require("../features/scan/infrastructure/stack-scanner.js") as any;',
    "",
    "export const stackScanner = api.stackScanner;",
    "",
  ];
  fs.writeFileSync(path.join(root, "lib/stack-scanner.ts"), lines.join("\n"));
}

const shims = [
  {
    lib: "lib/stack-detect.ts",
    requirePath: "../shared/stack-detect/index.js",
    exports: [
      "DOMAIN_LABELS",
      "isKnownDomainId",
      "mergeStackSignals",
      "normalizeDomainSelection",
      "parseProjectAnalysis",
    ],
    types: [
      "DomainId",
      "ParsedProjectAnalysis",
      "ProjectAnalysisDomain",
      "ProjectAnalysisInput",
      "ProjectAnalysisMeta",
      "StackScanResult",
    ],
  },
  {
    lib: "lib/domain-skill-generation.ts",
    requirePath: "../features/domains/index.js",
    exports: [
      "DOMAIN_DEFINITIONS",
      "getDomainDefinition",
      "listDomainDefinitions",
      "renderDomainPromptMarkdown",
      "renderDomainSkillMarkdown",
      "renderSkillsProfileMarkdown",
      "renderWorkflowProfileMarkdown",
      "validateDomainIds",
      "writeDomainSkillSurface",
    ],
    types: ["DomainDefinition", "WriteOptions", "WriteResult"],
  },
  {
    lib: "lib/cli-commands/scan.ts",
    dist: "features/scan/presentation/scan-command",
    exports: ["runScanCommand"],
  },
  {
    lib: "lib/cli-commands/domains.ts",
    dist: "features/domains/presentation/domains-command",
    exports: ["runDomainsCommand"],
  },
];

for (const shim of shims) {
  writeShim(shim);
}

writeScannerShim();

console.log("Wrote scan + domains phase 6 shims:", shims.length + 1);
