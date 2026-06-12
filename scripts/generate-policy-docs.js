#!/usr/bin/env node
"use strict";

const path = require("node:path");
const { regenerateDocsFromPolicy } = require("../dist/features/validate/infrastructure/policy/generator.js");

const repoRoot = process.cwd();
const policyPath = process.argv[2] || path.join(repoRoot, ".harness", "policies.json");

try {
  regenerateDocsFromPolicy(repoRoot, policyPath);
  console.log("Policy documentation generated successfully.");
  console.log("Updated files:");
  console.log("  - docs/phase-discipline.md");
  console.log("  - docs/test-first.md");
  console.log("  - docs/scope-guard.md");
  console.log("  - docs/policies.md");
} catch (error) {
  console.error(`Error generating policy docs: ${error.message}`);
  process.exit(1);
}
