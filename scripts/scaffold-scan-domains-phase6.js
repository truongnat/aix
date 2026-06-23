#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const copies = [
  [
    "lib/stack-detect.ts",
    "src/shared/stack-detect/stack-detect.ts",
    "domain",
    "Domain IDs, project analysis parsing, and stack signal merge",
  ],
  [
    "lib/stack-scanner.ts",
    "src/features/scan/infrastructure/stack-scanner.ts",
    "infrastructure",
    "Filesystem stack scanner for frameworks and domains",
  ],
  [
    "lib/domain-skill-generation.ts",
    "src/features/domains/application/domain-skill-generation.ts",
    "application",
    "Generate domain skill surfaces into target repos",
  ],
  [
    "lib/cli-commands/scan.ts",
    "src/features/scan/presentation/scan-command.ts",
    "presentation",
    "CLI handler for `aih scan`",
  ],
  [
    "lib/cli-commands/domains.ts",
    "src/features/domains/presentation/domains-command.ts",
    "presentation",
    "CLI handler for `aih domains`",
  ],
];

const headers = {
  domain: (purpose) => `// Purpose: ${purpose}\n// Layer: domain\n// Depends on: nothing\n\n`,
  infrastructure: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: infrastructure\n// Depends on: shared/stack-detect\n\n`,
  application: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: application\n// Depends on: shared/stack-detect, legacy codex bridge\n\n`,
  presentation: (purpose) =>
    `// Purpose: ${purpose}\n// Layer: presentation\n// Depends on: application, install CLI bridges\n\n`,
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
// Depends on: dist/lib codex-rule-generation at runtime

/* eslint-disable @typescript-eslint/no-require-imports */

export const legacyCodexRuleGeneration = require("../../../lib/codex-rule-generation.js") as {
  renderCodexRuleSet: (...args: unknown[]) => string;
};
`;

fs.mkdirSync(path.join(root, "src/features/domains/infrastructure"), { recursive: true });
fs.writeFileSync(path.join(root, "src/features/domains/infrastructure/legacy-deps.ts"), legacyDeps);
console.log("wrote src/features/domains/infrastructure/legacy-deps.ts");

const sharedIndex = `// Purpose: Public exports for stack-detect shared module.
// Layer: domain
// Depends on: stack-detect

export {
  DOMAIN_LABELS,
  isKnownDomainId,
  mergeStackSignals,
  normalizeDomainSelection,
  parseProjectAnalysis,
} from "./stack-detect";
export type {
  DomainId,
  ParsedProjectAnalysis,
  ProjectAnalysisDomain,
  ProjectAnalysisInput,
  ProjectAnalysisMeta,
  StackScanResult,
} from "./stack-detect";
`;

fs.writeFileSync(path.join(root, "src/shared/stack-detect/index.ts"), sharedIndex);
console.log("wrote src/shared/stack-detect/index.ts");

const scanIndex = `// Purpose: Public exports for scan feature.
// Layer: presentation
// Depends on: infrastructure, presentation

export { stackScanner } from "./infrastructure/stack-scanner";
export { runScanCommand } from "./presentation/scan-command";
`;

fs.writeFileSync(path.join(root, "src/features/scan/index.ts"), scanIndex);
console.log("wrote src/features/scan/index.ts");

const domainsIndex = `// Purpose: Public exports for domains feature.
// Layer: presentation
// Depends on: application, presentation

export {
  DOMAIN_DEFINITIONS,
  getDomainDefinition,
  listDomainDefinitions,
  renderDomainPromptMarkdown,
  renderDomainSkillMarkdown,
  renderSkillsProfileMarkdown,
  renderWorkflowProfileMarkdown,
  validateDomainIds,
  writeDomainSkillSurface,
} from "./application/domain-skill-generation";
export type { DomainDefinition, WriteOptions, WriteResult } from "./application/domain-skill-generation";

export { runDomainsCommand } from "./presentation/domains-command";
`;

fs.writeFileSync(path.join(root, "src/features/domains/index.ts"), domainsIndex);
console.log("wrote src/features/domains/index.ts");

const replacements = [
  {
    base: "src/shared/stack-detect",
    rules: [],
  },
  {
    base: "src/features/scan/infrastructure",
    rules: [
      ['from "./stack-detect.js"', 'from "../../../shared/stack-detect"'],
      ["module.exports = { stackScanner };", "export { stackScanner };"],
    ],
  },
  {
    base: "src/features/scan/presentation",
    rules: [
      ['from "../cli-args"', 'from "../../install/presentation/cli-types"'],
      ['from "../cli-command-helpers"', 'from "../../install/presentation/cli-legacy"'],
      [
        'const { stackScanner } = require("../stack-scanner.js") as {\n  stackScanner: (target: string) => unknown;\n};',
        'import { stackScanner } from "../infrastructure/stack-scanner";',
      ],
    ],
  },
  {
    base: "src/features/domains/application",
    rules: [
      ['from "./stack-detect"', 'from "../../../shared/stack-detect"'],
      ['from "../stack-detect"', 'from "../../../shared/stack-detect"'],
      [
        'import { renderCodexRuleSet } from "./codex-rule-generation";',
        'import { legacyCodexRuleGeneration } from "../infrastructure/legacy-deps";\nconst { renderCodexRuleSet } = legacyCodexRuleGeneration;',
      ],
    ],
  },
  {
    base: "src/features/domains/presentation",
    rules: [
      ['from "../cli-args"', 'from "../../install/presentation/cli-types"'],
      ['from "../cli-command-helpers"', 'from "../../install/presentation/cli-legacy"'],
      ['from "../stack-detect"', 'from "../../../shared/stack-detect"'],
      [
        'const { stackScanner } = require("../stack-scanner.js") as {\n  stackScanner: (target: string) => StackScanResult;\n};',
        'import { stackScanner } from "../../scan/infrastructure/stack-scanner";',
      ],
      [
        'import { writeDomainSkillSurface } from "../domain-skill-generation";',
        'import { writeDomainSkillSurface } from "../application/domain-skill-generation";',
      ],
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

for (const { base, rules } of replacements) {
  const dir = path.join(root, base);
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".ts") || entry === "index.ts") continue;
    applyRules(path.join(dir, entry), rules);
  }
}

console.log("Phase 6 scan + domains scaffold complete.");
