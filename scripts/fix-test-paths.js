#!/usr/bin/env node
"use strict";
// One-shot script: update all test dist/lib references to new clean arch paths.

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

// Each entry: [old path.join segment string, new path.join segment string]
// These are the inner portions of path.join(repoRoot, "dist", "lib", ...)
const MAPPINGS = [
  // policy
  ['"dist", "lib", "policy", "engine.js"', '"dist", "features", "validate", "infrastructure", "policy", "engine.js"'],
  ['"dist", "lib", "policy", "generator.js"', '"dist", "features", "validate", "infrastructure", "policy", "generator.js"'],
  // evals
  ['"dist", "lib", "evals", "index.js"', '"dist", "features", "eval", "index.js"'],
  ['"dist", "lib", "evals", "ab-runner.js"', '"dist", "features", "eval", "application", "ab-runner.js"'],
  ['"dist", "lib", "evals", "checks.js"', '"dist", "features", "eval", "domain", "checks.js"'],
  ['"dist", "lib", "evals", "extended-metrics.js"', '"dist", "features", "eval", "infrastructure", "extended-metrics.js"'],
  ['"dist", "lib", "evals", "fixture-manager.js"', '"dist", "features", "eval", "infrastructure", "fixture-manager.js"'],
  ['"dist", "lib", "evals", "live-runner.js"', '"dist", "features", "eval", "infrastructure", "live-runner.js"'],
  ['"dist", "lib", "evals", "llm-judge.js"', '"dist", "features", "eval", "infrastructure", "llm-judge.js"'],
  ['"dist", "lib", "evals", "mode-mutations.js"', '"dist", "features", "eval", "domain", "mode-mutations.js"'],
  ['"dist", "lib", "evals", "reporter.js"', '"dist", "features", "eval", "infrastructure", "reporter.js"'],
  ['"dist", "lib", "evals", "run-context.js"', '"dist", "features", "eval", "infrastructure", "run-context.js"'],
  ['"dist", "lib", "evals", "scoring.js"', '"dist", "features", "eval", "domain", "scoring.js"'],
  ['"dist", "lib", "evals", "task-registry.js"', '"dist", "features", "eval", "domain", "task-registry.js"'],
  // insights
  ['"dist", "lib", "insights", "index.js"', '"dist", "features", "insights", "index.js"'],
  ['"dist", "lib", "insights", "eval-recommendations.js"', '"dist", "features", "insights", "index.js"'],
  ['"dist", "lib", "insights", "eval-regression.js"', '"dist", "features", "insights", "application", "run-eval-regression.js"'],
  ['"dist", "lib", "insights", "event-reader.js"', '"dist", "features", "insights", "infrastructure", "event-reader.js"'],
  ['"dist", "lib", "insights", "summarize.js"', '"dist", "features", "insights", "index.js"'],
  ['"dist", "lib", "insights", "remote-upload.js"', '"dist", "features", "insights", "application", "upload-insights.js"'],
  ['"dist", "lib", "insights", "telemetry-server.js"', '"dist", "features", "telemetry", "index.js"'],
  ['"dist", "lib", "insights", "harness-config.js"', '"dist", "features", "insights", "infrastructure", "harness-config.js"'],
  ['"dist", "lib", "insights", "export.js"', '"dist", "features", "insights", "domain", "export-payload.js"'],
  // validate
  ['"dist", "lib", "validate", "index.js"', '"dist", "features", "validate", "index.js"'],
  ['"dist", "lib", "validate", "constants.js"', '"dist", "features", "validate", "domain", "constants.js"'],
  ['"dist", "lib", "validate", "target.js"', '"dist", "features", "validate", "infrastructure", "target.js"'],
  ['"dist", "lib", "validate", "utils.js"', '"dist", "features", "validate", "domain", "utils.js"'],
  ['"dist", "lib", "validate", "contracts.js"', '"dist", "features", "validate", "domain", "contracts.js"'],
  ['"dist", "lib", "validate", "runners.js"', '"dist", "features", "validate", "application", "runners.js"'],
  // backend (now in features or shared)
  ['"dist", "lib", "backend", "constants.js"', '"dist", "shared", "install-kernel", "constants.js"'],
  ['"dist", "lib", "backend", "git-hygiene.js"', '"dist", "shared", "install-kernel", "git-hygiene.js"'],
  ['"dist", "lib", "backend", "harness-skeleton.js"', '"dist", "features", "install", "infrastructure", "harness-skeleton.js"'],
  ['"dist", "lib", "backend", "install-orchestrator.js"', '"dist", "features", "install", "application", "run-install.js"'],
  ['"dist", "lib", "backend", "status-doctor.js"', '"dist", "features", "install", "infrastructure", "status-doctor.js"'],
  ['"dist", "lib", "backend", "uninstall.js"', '"dist", "features", "uninstall", "application", "run-uninstall.js"'],
  ['"dist", "lib", "backend", "update.js"', '"dist", "features", "update", "application", "run-update.js"'],
  // cli-commands
  ['"dist", "lib", "cli-commands", "diagnostics.js"', '"dist", "cli", "commands", "diagnostics.js"'],
  ['"dist", "lib", "cli-commands", "insights.js"', '"dist", "cli", "commands", "insights.js"'],
  ['"dist", "lib", "cli-commands", "eval.js"', '"dist", "features", "eval", "presentation", "eval-command.js"'],
  ['"dist", "lib", "cli-commands", "install.js"', '"dist", "features", "install", "presentation", "install-command.js"'],
  ['"dist", "lib", "cli-commands", "scan.js"', '"dist", "features", "scan", "presentation", "scan-command.js"'],
  ['"dist", "lib", "cli-commands", "uninstall.js"', '"dist", "features", "uninstall", "presentation", "uninstall-command.js"'],
  ['"dist", "lib", "cli-commands", "update.js"', '"dist", "features", "update", "presentation", "update-command.js"'],
  ['"dist", "lib", "cli-commands", "domains.js"', '"dist", "features", "domains", "presentation", "domains-command.js"'],
  // top-level cli shims
  ['"dist", "lib", "cli-main.js"', '"dist", "cli", "main.js"'],
  ['"dist", "lib", "cli-ui.js"', '"dist", "cli", "ui", "index.js"'],
  ['"dist", "lib", "cli-args.js"', '"dist", "cli", "args.js"'],
  ['"dist", "lib", "cli-help.js"', '"dist", "cli", "help.js"'],
  ['"dist", "lib", "cli-plan.js"', '"dist", "cli", "plan.js"'],
  ['"dist", "lib", "cli-detect.js"', '"dist", "cli", "detect.js"'],
  ['"dist", "lib", "cli-backend.js"', '"dist", "cli", "backend.js"'],
  ['"dist", "lib", "cli-providers.js"', '"dist", "cli", "providers.js"'],
  ['"dist", "lib", "cli-prompts.js"', '"dist", "cli", "ui", "prompts.js"'],
  ['"dist", "lib", "cli-command-helpers.js"', '"dist", "cli", "command-helpers.js"'],
  // install
  ['"dist", "lib", "install-cache.js"', '"dist", "features", "install", "infrastructure", "install-cache.js"'],
  ['"dist", "lib", "install-runtime.js"', '"dist", "features", "install", "infrastructure", "install-runtime.js"'],
  // shared/install-infra
  ['"dist", "lib", "stack-detect.js"', '"dist", "shared", "stack-detect", "index.js"'],
  ['"dist", "lib", "stack-scanner.js"', '"dist", "features", "scan", "infrastructure", "stack-scanner.js"'],
  ['"dist", "lib", "domain-skill-generation.js"', '"dist", "features", "domains", "index.js"'],
  ['"dist", "lib", "provider-binary-detect.js"', '"dist", "features", "install", "infrastructure", "provider-binary-detect.js"'],
  ['"dist", "lib", "provider-detection.js"', '"dist", "features", "install", "infrastructure", "provider-detection.js"'],
  ['"dist", "lib", "provider-interaction-tools.js"', '"dist", "features", "install", "infrastructure", "provider-interaction-tools.js"'],
  ['"dist", "lib", "provider-registry.js"', '"dist", "features", "install", "infrastructure", "provider-registry.js"'],
  ['"dist", "lib", "provider-rule-renderer.js"', '"dist", "features", "install", "infrastructure", "provider-rule-renderer.js"'],
  ['"dist", "lib", "codex-rule-generation.js"', '"dist", "features", "install", "infrastructure", "codex-rule-generation.js"'],
  ['"dist", "lib", "report-template-discovery.js"', '"dist", "features", "install", "infrastructure", "report-template-discovery.js"'],
  ['"dist", "lib", "runtime-command-catalog"', '"dist", "features", "install", "infrastructure", "runtime-command-catalog"'],
  ['"dist", "lib", "command-surface-report.js"', '"dist", "features", "install", "infrastructure", "command-surface-report.js"'],
  ['"dist", "lib", "file-operations.js"', '"dist", "features", "install", "infrastructure", "file-operations.js"'],
  ['"dist", "lib", "plugin-packaging.js"', '"dist", "features", "install", "infrastructure", "plugin-packaging.js"'],
  ['"dist", "lib", "worker-claude-adapter.js"', '"dist", "workers", "claude-adapter.js"'],
];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  for (const [from, to] of MAPPINGS) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  updated: ${path.relative(repoRoot, filePath)}`);
  }
}

function walk(dir, ext) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      files.push(...walk(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const testDir = path.join(repoRoot, "test");
const files = [
  ...walk(testDir, ".js"),
  ...walk(testDir, ".ts"),
  path.join(repoRoot, "bin", "validate.js"),
  path.join(repoRoot, "scripts", "verify-dist.js"),
];

console.log("Fixing dist/lib references...");
for (const file of files) {
  if (fs.existsSync(file)) fixFile(file);
}
console.log("Done.");
