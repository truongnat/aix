#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const requiredPaths = [
  "dist/server/telemetry.js",
  "dist/features/telemetry/index.js",
  "dist/features/insights/index.js",
  "dist/features/validate/index.js",
  "dist/features/eval/index.js",
  "dist/features/install/index.js",
  "dist/features/scan/index.js",
  "dist/features/domains/index.js",
  "dist/shared/install-kernel/index.js",
  "dist/shared/stack-detect/index.js",
  "dist/cli/main.js",
  "dist/cli/args.js",
  "dist/cli/ui/index.js",
  "dist/lib/cli-main.js",
  "dist/lib/cli-ui.js",
  "dist/lib/evals/index.js",
  "dist/lib/validate/index.js",
  "dist/lib/backend/install-orchestrator.js",
  "dist/workers/registry.js",
];

const missing = requiredPaths.filter((relativePath) => {
  return !fs.existsSync(path.join(repoRoot, relativePath));
});

if (missing.length > 0) {
  console.error("Compiled dist/ output is incomplete.");
  console.error("");
  console.error("Missing files:");
  for (const relativePath of missing) {
    console.error(`  - ${relativePath}`);
  }
  console.error("");
  console.error("Run `npm run build` and fix the TypeScript/build error before running tests.");
  process.exit(1);
}

console.log("Verified dist/ test entrypoints.");
