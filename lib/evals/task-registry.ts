import fs from "node:fs";
import path from "node:path";
import type { Check } from "./checks";

const REQUIRED_FIELDS = ["id", "suite", "title", "goal", "mode", "fixture", "prompt"];

interface Task {
  id: string;
  suite: string;
  title: string;
  goal: string;
  mode: string;
  rubric?: string;
  fixture: {
    path: string;
  };
  prompt: string;
  successChecks: Check[];
  behaviorChecks: Check[];
  metrics?: {
    withHarnessSteps: number;
    withoutHarnessSteps: number;
    phases: string[];
  };
  tags?: string[];
}

interface Registry {
  tasks: Task[];
}

function validateTaskManifest(task: Record<string, unknown>): Task {
  for (const field of REQUIRED_FIELDS) {
    if (!task || !task[field]) {
      throw new Error(`Missing required task field: ${field}`);
    }
  }

  const fixture = task.fixture as Record<string, unknown> | undefined;
  if (!fixture || !fixture.path) {
    throw new Error("Missing required task field: fixture.path");
  }

  return {
    id: task.id as string,
    suite: task.suite as string,
    title: task.title as string,
    goal: task.goal as string,
    mode: task.mode as string,
    rubric: task.rubric as string | undefined,
    fixture: { path: fixture.path as string },
    prompt: task.prompt as string,
    successChecks: Array.isArray(task.successChecks) ? task.successChecks : [],
    behaviorChecks: Array.isArray(task.behaviorChecks) ? task.behaviorChecks : [],
    metrics: task.metrics as Task["metrics"],
    tags: Array.isArray(task.tags) ? task.tags : [],
  };
}

function loadManifest(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    throw new Error(`Failed to parse eval task manifest: ${filePath}`);
  }
}

function loadRegistry(packRoot: string): Registry {
  const registryRoot = path.join(packRoot, "evals", "registry");
  const tasks: Task[] = [];

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

function formatTaskList(registry: Registry): string {
  return registry.tasks.map((task) => `${task.id} | ${task.title} | ${task.mode}`).join("\n");
}

export { formatTaskList, loadRegistry, validateTaskManifest };
export type { Task, Registry };
