"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { formatTaskList, loadRegistry } = require("./task-registry");
const { runAbTask } = require("./ab-runner");

function listTasks(packRoot) {
  const registry = loadRegistry(packRoot);
  return {
    registry,
    output: formatTaskList(registry),
  };
}

async function runTask(packRoot, taskId, options = {}) {
  const registry = loadRegistry(packRoot);
  const task = registry.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    throw new Error(`Unknown eval task: ${taskId}`);
  }
  return runAbTask(packRoot, task, options);
}

function readReport(packRoot, runId) {
  const summaryPath = path.join(packRoot, "artifacts", "runs", runId, "summary.json");
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`Eval run not found: ${runId}`);
  }
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  return {
    output: JSON.stringify(summary, null, 2),
    summary,
    summaryPath,
  };
}

module.exports = {
  listTasks,
  readReport,
  runTask,
};
