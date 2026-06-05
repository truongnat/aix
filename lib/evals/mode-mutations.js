"use strict";

const fs = require("node:fs");
const path = require("node:path");

function loadMutationRegistry(packRoot) {
  const registryPath = path.join(packRoot, "evals", "mutations", "registry.json");
  if (!fs.existsSync(registryPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function applyModeMutation(mode, cwd, task, packRoot) {
  const registry = loadMutationRegistry(packRoot);
  const entry = registry[task.id];
  if (!entry) {
    return;
  }

  const files = mode === "with-harness" ? entry.withHarness : entry.withoutHarness;
  if (!files) {
    return;
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(cwd, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}

function mutationMetrics(task, packRoot) {
  const registry = loadMutationRegistry(packRoot);
  const entry = registry[task.id];
  if (entry && entry.metrics) {
    return entry.metrics;
  }
  if (task.metrics) {
    return task.metrics;
  }
  return {
    withHarnessSteps: 3,
    withoutHarnessSteps: 8,
    phases: ["verify"],
  };
}

module.exports = {
  applyModeMutation,
  loadMutationRegistry,
  mutationMetrics,
};
