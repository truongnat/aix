// Purpose: Public eval list/run/report API
// Layer: application
// Depends on: domain, infrastructure, insights

import fs from "node:fs";
import path from "node:path";
import { formatTaskList, loadRegistry, type Registry } from "../domain/task-registry";
import { runAbTask, type AbTaskResult } from "./ab-runner";
import { resolveArtifactsBase } from "../infrastructure/run-context";
import { buildEvalRecommendations } from "../../insights/application/recommend-evals";
import { formatEvalRecommendations } from "../../insights/presentation/format-eval-recommendations";

interface ListOptions {
  targetRoot?: string;
}

interface ListResult {
  registry: Registry;
  output: string;
}

interface RunOptions {
  provider?: string;
  verbose?: boolean;
  useLlmJudge?: boolean;
  targetRoot?: string;
  liveProviderCommand?: string;
  timeoutMs?: number;
}

function listTasks(packRoot: string, options: ListOptions = {}): ListResult {
  const registry = loadRegistry(packRoot);
  let output = formatTaskList(registry);

  if (options.targetRoot) {
    try {
      const hints = buildEvalRecommendations(options.targetRoot);
      if (hints.recommendations.length > 0) {
        output += `\n\nTelemetry eval hints:\n`;
        output += formatEvalRecommendations(hints).split("\n").slice(2).join("\n");
      }
    } catch {
      /* optional telemetry hints */
    }
  }

  return {
    registry,
    output,
  };
}

async function runTask(
  packRoot: string,
  taskId: string,
  options: RunOptions = {}
): Promise<AbTaskResult> {
  const registry = loadRegistry(packRoot);
  const task = registry.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    throw new Error(`Unknown eval task: ${taskId}`);
  }
  return runAbTask(packRoot, task, options);
}

function readReport(
  packRoot: string,
  runId: string
): { output: string; summary: Record<string, unknown>; summaryPath: string } {
  const summaryPath = path.join(resolveArtifactsBase(packRoot), "runs", runId, "summary.json");
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`Eval run not found: ${runId}`);
  }
  let summary: Record<string, unknown>;
  try {
    summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  } catch {
    throw new Error(`Failed to parse eval summary: ${summaryPath}`);
  }
  return {
    output: JSON.stringify(summary, null, 2),
    summary,
    summaryPath,
  };
}

export { listTasks, readReport, runTask };
export type { ListOptions, ListResult, RunOptions };
