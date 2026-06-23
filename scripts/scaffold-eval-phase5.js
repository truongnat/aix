#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const copies = [
  [
    "lib/evals/checks.ts",
    "src/features/eval/domain/checks.ts",
    "domain",
    "Eval check definitions and runners",
  ],
  [
    "lib/evals/scoring.ts",
    "src/features/eval/domain/scoring.ts",
    "domain",
    "Eval scoring types and helpers",
  ],
  [
    "lib/evals/task-registry.ts",
    "src/features/eval/domain/task-registry.ts",
    "domain",
    "Eval task manifest registry",
  ],
  [
    "lib/evals/mode-mutations.ts",
    "src/features/eval/domain/mode-mutations.ts",
    "domain",
    "Eval mode mutation metrics",
  ],
  [
    "lib/evals/fixture-manager.ts",
    "src/features/eval/infrastructure/fixture-manager.ts",
    "infrastructure",
    "Materialize eval fixtures into temp workspaces",
  ],
  [
    "lib/evals/live-runner.ts",
    "src/features/eval/infrastructure/live-runner.ts",
    "infrastructure",
    "Run live provider commands for eval tasks",
  ],
  [
    "lib/evals/run-context.ts",
    "src/features/eval/infrastructure/run-context.ts",
    "infrastructure",
    "Resolve eval artifact paths and run context",
  ],
  [
    "lib/evals/reporter.ts",
    "src/features/eval/infrastructure/reporter.ts",
    "infrastructure",
    "Write eval run artifacts and summaries",
  ],
  [
    "lib/evals/llm-judge.ts",
    "src/features/eval/infrastructure/llm-judge.ts",
    "infrastructure",
    "Optional LLM judge fallback for eval checks",
  ],
  [
    "lib/evals/extended-metrics.ts",
    "src/features/eval/infrastructure/extended-metrics.ts",
    "infrastructure",
    "Extended A/B comparison metrics for eval runs",
  ],
  [
    "lib/evals/ab-runner.ts",
    "src/features/eval/application/ab-runner.ts",
    "application",
    "Run A/B eval tasks end-to-end",
  ],
  [
    "lib/evals/index.ts",
    "src/features/eval/application/eval-api.ts",
    "application",
    "Public eval list/run/report API",
  ],
  [
    "lib/cli-commands/eval.ts",
    "src/features/eval/presentation/eval-command.ts",
    "presentation",
    "CLI handler for eval list | run | report",
  ],
];

const headers = {
  domain: (p) => `// Purpose: ${p}\n// Layer: domain\n// Depends on: nothing\n\n`,
  infrastructure: (p) => `// Purpose: ${p}\n// Layer: infrastructure\n// Depends on: domain\n\n`,
  application: (p) =>
    `// Purpose: ${p}\n// Layer: application\n// Depends on: domain, infrastructure, insights\n\n`,
  presentation: (p) =>
    `// Purpose: ${p}\n// Layer: presentation\n// Depends on: application, cli-types\n\n`,
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

const replacements = [
  { base: "domain", rules: [] },
  {
    base: "infrastructure",
    rules: [
      ['from "./checks"', 'from "../domain/checks"'],
      ['from "./mode-mutations"', 'from "../domain/mode-mutations"'],
      ['from "./task-registry"', 'from "../domain/task-registry"'],
      ['from "./scoring"', 'from "../domain/scoring"'],
    ],
  },
  {
    base: "application",
    rules: [
      ['from "./checks"', 'from "../domain/checks"'],
      ['from "./mode-mutations"', 'from "../domain/mode-mutations"'],
      ['from "./task-registry"', 'from "../domain/task-registry"'],
      ['from "./scoring"', 'from "../domain/scoring"'],
      ['from "./fixture-manager"', 'from "../infrastructure/fixture-manager"'],
      ['from "./live-runner"', 'from "../infrastructure/live-runner"'],
      ['from "./run-context"', 'from "../infrastructure/run-context"'],
      ['from "./reporter"', 'from "../infrastructure/reporter"'],
      ['from "./llm-judge"', 'from "../infrastructure/llm-judge"'],
      ['from "./extended-metrics"', 'from "../infrastructure/extended-metrics"'],
      [
        'import { buildEvalRecommendations } from "../insights/eval-recommendations";',
        'import { buildEvalRecommendations } from "../../insights/application/recommend-evals";',
      ],
      [
        'import {\n  buildEvalRecommendations,\n  formatEvalRecommendations,\n} from "../insights/eval-recommendations";',
        'import { buildEvalRecommendations } from "../../insights/application/recommend-evals";\nimport { formatEvalRecommendations } from "../../insights/presentation/format-eval-recommendations";',
      ],
      ['from "./ab-runner"', 'from "./ab-runner"'],
      ['from "./task-registry"', 'from "../domain/task-registry"'],
      ['from "./run-context"', 'from "../infrastructure/run-context"'],
    ],
  },
  {
    base: "presentation",
    rules: [
      ['from "../cli-args"', 'from "../../install/presentation/cli-types"'],
      ['from "../evals"', 'from "../application/eval-api"'],
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
  const dir = path.join(root, "src/features/eval", base);
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".ts")) continue;
    applyRules(path.join(dir, entry), rules);
  }
}

console.log("Phase 5 eval scaffold complete.");
