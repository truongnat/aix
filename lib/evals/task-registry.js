"use strict";

const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_FIELDS = ["id", "suite", "title", "goal", "mode", "fixture", "prompt"];

function validateTaskManifest(task) {
  for (const field of REQUIRED_FIELDS) {
    if (!task || !task[field]) {
      throw new Error(`Missing required task field: ${field}`);
    }
  }

  if (!task.fixture.path) {
    throw new Error("Missing required task field: fixture.path");
  }

  return {
    ...task,
    successChecks: Array.isArray(task.successChecks) ? task.successChecks : [],
    behaviorChecks: Array.isArray(task.behaviorChecks) ? task.behaviorChecks : [],
    tags: Array.isArray(task.tags) ? task.tags : [],
  };
}

function loadManifest(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadRegistry(packRoot) {
  const registryRoot = path.join(packRoot, "evals", "registry");
  const tasks = [];

  for (const suiteEntry of fs.readdirSync(registryRoot, { withFileTypes: true })) {
    if (!suiteEntry.isDirectory()) {
      continue;
    }

    const suiteDir = path.join(registryRoot, suiteEntry.name);
    for (const fileName of fs.readdirSync(suiteDir)) {
      if (!fileName.endsWith(".json")) {
        continue;
      }

      const manifestPath = path.join(suiteDir, fileName);
      tasks.push(validateTaskManifest(loadManifest(manifestPath)));
    }
  }

  tasks.sort((left, right) => left.id.localeCompare(right.id));

  return { tasks };
}

function formatTaskList(registry) {
  return registry.tasks.map((task) => `${task.id} | ${task.title} | ${task.mode}`).join("\n");
}

module.exports = {
  formatTaskList,
  loadRegistry,
  validateTaskManifest,
};
