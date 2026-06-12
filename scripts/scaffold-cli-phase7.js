#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const copies = [
  ["lib/cli-main.ts", "src/cli/main.ts", "presentation", "CLI argv router and command dispatch"],
  ["lib/cli-args.ts", "src/cli/args.ts", "domain", "Argv parsing and ParseOptions types"],
  [
    "lib/cli-backend.ts",
    "src/cli/backend.ts",
    "infrastructure",
    "Pack root resolution for CLI entry",
  ],
  ["lib/cli-help.ts", "src/cli/help.ts", "presentation", "CLI help text rendering"],
  ["lib/cli-providers.ts", "src/cli/providers.ts", "domain", "Provider registry for install UX"],
  ["lib/cli-plan.ts", "src/cli/plan.ts", "application", "Install plan rendering helpers"],
  [
    "lib/cli-detect.ts",
    "src/cli/detect.ts",
    "infrastructure",
    "Provider and git detection facades",
  ],
  [
    "lib/cli-command-helpers.ts",
    "src/cli/command-helpers.ts",
    "application",
    "Shared CLI command helpers",
  ],
  ["lib/cli-ui.ts", "src/cli/ui/index.ts", "presentation", "Interactive CLI UI facade"],
  ["lib/cli-prompts.ts", "src/cli/ui/prompts.ts", "presentation", "Readline fallback prompts"],
  [
    "lib/cli-commands/diagnostics.ts",
    "src/cli/commands/diagnostics.ts",
    "presentation",
    "status/doctor command handler",
  ],
  [
    "lib/cli-commands/insights.ts",
    "src/cli/commands/insights.ts",
    "presentation",
    "insights command handler",
  ],
];

const headers = {
  domain: (p) => `// Purpose: ${p}\n// Layer: domain\n// Depends on: nothing\n\n`,
  infrastructure: (p) =>
    `// Purpose: ${p}\n// Layer: infrastructure\n// Depends on: legacy lib bridges where needed\n\n`,
  application: (p) =>
    `// Purpose: ${p}\n// Layer: application\n// Depends on: domain, ui, legacy bridges\n\n`,
  presentation: (p) =>
    `// Purpose: ${p}\n// Layer: presentation\n// Depends on: application, features, ui\n\n`,
};

for (const [fromRel, toRel, layer, purpose] of copies) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let content = fs.readFileSync(from, "utf8");
  if (!content.startsWith("// Purpose:")) {
    content = headers[layer](purpose) + content;
  }
  fs.writeFileSync(to, content);
  console.log("copied", toRel);
}

const legacyDeps = `// Purpose: Bridge to legacy lib modules until later migration phases.
// Layer: infrastructure
// Depends on: dist/lib at runtime

/* eslint-disable @typescript-eslint/no-require-imports */

export const {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
} = require("../../lib/provider-detection.js") as {
  detectInstalledProviders: (...args: unknown[]) => string[];
  detectLegacyProviderResidue: (targetAbs: string) => string[];
  detectRecommendedProviders: (...args: unknown[]) => string[];
  fileContainsHarnessMarker: (content: string) => boolean;
  isGitRepo: (targetAbs: string) => boolean;
};

export const {
  detectProviderBinaries,
  listDetectedProviderIds: listDetectedProviderBinaryIds,
} = require("../../lib/provider-binary-detect.js") as {
  detectProviderBinaries: () => Record<string, unknown>;
  listDetectedProviderIds: () => string[];
};

export const {
  runtimeCommandCatalogPathsForPlan,
  formatCommandSupportForPlan,
} = require("../../lib/runtime-command-catalog.js") as {
  runtimeCommandCatalogPathsForPlan: (...args: unknown[]) => string[];
  formatCommandSupportForPlan: (...args: unknown[]) => string;
};

export const { runDoctor, runStatus } = require("../../lib/backend/status-doctor.js") as {
  runDoctor: (options: { targetAbs: string }) => { text?: string; ok?: boolean };
  runStatus: (options: { targetAbs: string }) => { text?: string };
};
`;

fs.mkdirSync(path.join(root, "src/cli/infrastructure"), { recursive: true });
fs.writeFileSync(path.join(root, "src/cli/infrastructure/legacy-deps.ts"), legacyDeps);
console.log("wrote src/cli/infrastructure/legacy-deps.ts");

const detectFacade = `// Purpose: Provider and git detection facades
// Layer: infrastructure
// Depends on: legacy-deps bridges

export {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
  detectProviderBinaries,
  listDetectedProviderBinaryIds,
} from "./infrastructure/legacy-deps";
`;

fs.writeFileSync(path.join(root, "src/cli/detect.ts"), detectFacade);
console.log("wrote src/cli/detect.ts facade");

const cliIndex = `// Purpose: Public exports for CLI package surface.
// Layer: presentation
// Depends on: main, help, args

export { main, printHelp, SOURCE_URL } from "./main";
export { parseArgv, modeToScopeVisibility, isNonInteractive, COMMANDS, EVAL_COMMANDS } from "./args";
export type { ParseOptions, ScopeVisibility } from "./args";
`;

fs.writeFileSync(path.join(root, "src/cli/index.ts"), cliIndex);
console.log("wrote src/cli/index.ts");

const replacements = [
  {
    base: "src/cli",
    files: ["main.ts"],
    rules: [
      ['from "./cli-args"', 'from "./args"'],
      ['from "./cli-help"', 'from "./help"'],
      ['from "./cli-backend"', 'from "./backend"'],
      ['from "./cli-ui"', 'from "./ui"'],
      ['from "./cli-commands/install"', 'from "../features/install/presentation/install-command"'],
      ['from "./cli-commands/update"', 'from "../features/update/presentation/update-command"'],
      [
        'from "./cli-commands/uninstall"',
        'from "../features/uninstall/presentation/uninstall-command"',
      ],
      ['from "./cli-commands/eval"', 'from "../features/eval/presentation/eval-command"'],
      ['from "./cli-commands/domains"', 'from "../features/domains/presentation/domains-command"'],
      ['from "./cli-commands/scan"', 'from "../features/scan/presentation/scan-command"'],
      ['from "./cli-commands/diagnostics"', 'from "./commands/diagnostics"'],
      ['from "./cli-commands/insights"', 'from "./commands/insights"'],
    ],
  },
  {
    base: "src/cli",
    files: ["plan.ts", "command-helpers.ts"],
    rules: [
      ['from "./cli-providers"', 'from "./providers"'],
      ['from "./cli-ui"', 'from "./ui"'],
      [
        'import {\n  runtimeCommandCatalogPathsForPlan,\n  formatCommandSupportForPlan,\n} from "./runtime-command-catalog";',
        'import {\n  runtimeCommandCatalogPathsForPlan,\n  formatCommandSupportForPlan,\n} from "./infrastructure/legacy-deps";',
      ],
    ],
  },
  {
    base: "src/cli/ui",
    files: ["index.ts"],
    rules: [['from "./runtime-command-catalog"', 'from "../infrastructure/legacy-deps"']],
  },
  {
    base: "src/cli/commands",
    files: ["diagnostics.ts"],
    rules: [
      ['from "../cli-args"', 'from "../args"'],
      ['from "../cli-detect"', 'from "../detect"'],
      ['import * as ui from "../cli-ui"', 'import ui from "../ui"'],
      ['from "../cli-command-helpers"', 'from "../command-helpers"'],
      ['from "../backend/status-doctor"', 'from "../infrastructure/legacy-deps"'],
    ],
  },
  {
    base: "src/cli/commands",
    files: ["insights.ts"],
    rules: [
      ['from "../cli-args"', 'from "../args"'],
      ['from "../insights"', 'from "../../features/insights"'],
      [
        'import {\n  buildEvalRecommendations,\n  formatEvalRecommendations,\n} from "../insights/eval-recommendations";',
        'import {\n  buildEvalRecommendations,\n  formatEvalRecommendations,\n} from "../../features/insights";',
      ],
      ['from "../insights/eval-regression"', 'from "../../features/insights"'],
      ['from "../insights/remote-upload"', 'from "../../features/insights"'],
    ],
  },
];

function applyRules(filePath, rules) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [from, to] of rules) {
    if (content.includes(from)) {
      content = content.replace(from, to);
    }
  }
  fs.writeFileSync(filePath, content);
}

for (const { base, files, rules } of replacements) {
  for (const file of files) {
    applyRules(path.join(root, base, file), rules);
  }
}

console.log("Phase 7 CLI scaffold complete.");
