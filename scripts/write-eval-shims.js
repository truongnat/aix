#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function writeShim({ lib, dist, exports, types = [] }) {
  const lines = [
    "// Purpose: Backward-compat shim — implementation in src/features/eval/.",
    "// Layer: presentation (shim)",
    "// Depends on: dist/features/eval (built by build:src)",
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
    lib: "lib/evals/checks.ts",
    dist: "features/eval/domain/checks",
    exports: ["runChecks", "runSingleCheck"],
    types: ["Check", "CheckResult", "Task", "CheckResults"],
  },
  {
    lib: "lib/evals/scoring.ts",
    dist: "features/eval/domain/scoring",
    exports: ["scoreRun"],
    types: ["ExtendedMetrics", "ComparisonMetrics", "Score"],
  },
  {
    lib: "lib/evals/task-registry.ts",
    dist: "features/eval/domain/task-registry",
    exports: ["formatTaskList", "loadRegistry", "validateTaskManifest"],
    types: ["Task", "Registry"],
  },
  {
    lib: "lib/evals/mode-mutations.ts",
    dist: "features/eval/domain/mode-mutations",
    exports: ["applyModeMutation", "loadMutationRegistry", "mutationMetrics"],
    types: ["MutationEntry", "MutationRegistry"],
  },
  {
    lib: "lib/evals/fixture-manager.ts",
    dist: "features/eval/infrastructure/fixture-manager",
    exports: ["materializeFixture", "cleanupWorkspace"],
    types: ["Workspace"],
  },
  {
    lib: "lib/evals/live-runner.ts",
    dist: "features/eval/infrastructure/live-runner",
    exports: ["runLiveProviderCommand"],
    types: ["LiveRunOptions", "LiveRunResult"],
  },
  {
    lib: "lib/evals/run-context.ts",
    dist: "features/eval/infrastructure/run-context",
    exports: ["createRunContext", "resolveArtifactsBase"],
    types: ["RunContext"],
  },
  {
    lib: "lib/evals/reporter.ts",
    dist: "features/eval/infrastructure/reporter",
    exports: ["writeModeArtifacts", "writeRunSummary"],
    types: ["ModeArtifactsPayload", "RunSummaryPayload", "ModeArtifactsPaths"],
  },
  {
    lib: "lib/evals/llm-judge.ts",
    dist: "features/eval/infrastructure/llm-judge",
    exports: ["judgeWithLlmFallback"],
    types: ["Rubric", "Task", "JudgeResult", "JudgeOptions"],
  },
  {
    lib: "lib/evals/extended-metrics.ts",
    dist: "features/eval/infrastructure/extended-metrics",
    exports: ["compareAbMetrics", "scoreExtendedMetrics"],
    types: ["ExtendedMetrics", "ComparisonMetrics"],
  },
  {
    lib: "lib/evals/ab-runner.ts",
    dist: "features/eval/application/ab-runner",
    exports: ["runAbTask"],
    types: ["RunOptions", "ModeResult", "AbTaskResult"],
  },
  {
    lib: "lib/evals/index.ts",
    dist: "features/eval/index",
    exports: ["listTasks", "readReport", "runTask"],
    types: ["ListOptions", "ListResult", "RunOptions"],
  },
  {
    lib: "lib/cli-commands/eval.ts",
    dist: "features/eval/presentation/eval-command",
    exports: ["runEvalCommand"],
  },
];

for (const shim of shims) {
  writeShim(shim);
}

console.log("Wrote eval phase 5 shims:", shims.length);
