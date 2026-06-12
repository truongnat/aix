#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { loadProviderManifests } = require(
  path.join(repoRoot, "dist", "features", "install", "infrastructure", "provider-registry.js")
);
const { loadRegistry } = require(path.join(repoRoot, "dist", "features", "eval", "domain", "task-registry.js"));

function loadLiveEvalStats(repoRoot) {
  const runsRoot = path.join(repoRoot, "artifacts", "runs");
  if (!fs.existsSync(runsRoot)) {
    return new Map();
  }

  const statsByProvider = new Map();
  for (const runId of fs.readdirSync(runsRoot)) {
    const summaryPath = path.join(runsRoot, runId, "with-harness", "summary.json");
    if (!fs.existsSync(summaryPath)) {
      continue;
    }

    let summary;
    try {
      summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    } catch {
      continue;
    }

    if (summary.evidenceKind !== "live-provider-command") {
      continue;
    }

    const providerId = summary.provider || "unknown";
    const current = statsByProvider.get(providerId) || {
      tasks: new Map(),
    };

    const taskId = summary.taskId || "unknown-task";
    const previous = current.tasks.get(taskId);
    if (!previous || runId > previous.runId) {
      current.tasks.set(taskId, {
        runId,
        passedChecks: summary.outcome?.passed ?? 0,
        totalChecks: summary.outcome?.total ?? 0,
      });
    }

    statsByProvider.set(providerId, current);
  }

  for (const stats of statsByProvider.values()) {
    let passedChecks = 0;
    let totalChecks = 0;
    for (const taskStats of stats.tasks.values()) {
      passedChecks += taskStats.passedChecks;
      totalChecks += taskStats.totalChecks;
    }
    stats.passedChecks = passedChecks;
    stats.totalChecks = totalChecks;
    stats.taskCount = stats.tasks.size;
  }

  return statsByProvider;
}

function formatLiveEvalSummary(stats) {
  if (!stats || stats.totalChecks === 0) {
    return "no live evals yet";
  }

  const passRate = Math.round((stats.passedChecks / stats.totalChecks) * 100);
  const taskLabel = stats.taskCount === 1 ? "1 task" : `${stats.taskCount} tasks`;
  return `${stats.passedChecks}/${stats.totalChecks} passed (${passRate}% across ${taskLabel})`;
}

function buildMatrix() {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const providers = loadProviderManifests(repoRoot);
  const registry = loadRegistry(repoRoot);
  const liveStatsByProvider = loadLiveEvalStats(repoRoot);

  const lines = [
    "# Provider Compatibility Matrix",
    "",
    `Generated from pack version **v${pkg.version}** and eval registry.`,
    "",
    "| Provider | Native slash | Subagents | Status | Eval tasks verified | Live evals |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const provider of providers) {
    const liveStats = liveStatsByProvider.get(provider.id);
    lines.push(
      `| ${provider.label} | ${provider.nativeSlashCommands ? "yes" : "rules/fallback"} | ${provider.supportsSubagents ? "yes" : "adapter"} | ${provider.status} | deterministic local (${registry.tasks.length} tasks) | ${formatLiveEvalSummary(liveStats)} |`
    );
  }

  lines.push("", "## Eval tasks", "");
  for (const task of registry.tasks) {
    lines.push(`- \`${task.id}\` (${task.mode})`);
  }

  lines.push(
    "",
    "Regenerate:",
    "",
    "```bash",
    "node scripts/generate-compatibility-matrix.js",
    "```",
    ""
  );

  return `${lines.join("\n")}`;
}

function main() {
  const outputPath = path.join(repoRoot, "docs", "compatibility-matrix.md");
  fs.writeFileSync(outputPath, buildMatrix(), "utf8");
  process.stdout.write(`${outputPath}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildMatrix,
  formatLiveEvalSummary,
  loadLiveEvalStats,
};
