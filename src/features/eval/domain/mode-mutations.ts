// Purpose: Eval mode mutation metrics
// Layer: domain
// Depends on: nothing

import fs from "node:fs";
import path from "node:path";

interface Task {
  id: string;
  metrics?: {
    withHarnessSteps: number;
    withoutHarnessSteps: number;
    phases: string[];
  };
}

interface MutationEntry {
  withHarness?: Record<string, string>;
  withoutHarness?: Record<string, string>;
  metrics?: {
    withHarnessSteps: number;
    withoutHarnessSteps: number;
    phases: string[];
  };
}

interface MutationRegistry {
  [taskId: string]: MutationEntry;
}

const registryCache = new Map<string, MutationRegistry>();

function loadMutationRegistry(packRoot: string): MutationRegistry {
  const cached = registryCache.get(packRoot);
  if (cached) {
    return cached;
  }
  const registryPath = path.join(packRoot, "evals", "mutations", "registry.json");
  if (!fs.existsSync(registryPath)) {
    const empty: MutationRegistry = {};
    registryCache.set(packRoot, empty);
    return empty;
  }
  let registry: MutationRegistry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as MutationRegistry;
  } catch {
    throw new Error(`Failed to parse mutation registry: ${registryPath}`);
  }
  registryCache.set(packRoot, registry);
  return registry;
}

function applyModeMutation(mode: string, cwd: string, task: Task, packRoot: string): void {
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

function mutationMetrics(
  task: Task,
  packRoot: string
): {
  withHarnessSteps: number;
  withoutHarnessSteps: number;
  phases: string[];
} {
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

export { applyModeMutation, loadMutationRegistry, mutationMetrics };
export type { MutationEntry, MutationRegistry };
