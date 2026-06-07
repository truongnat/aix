import fs from "node:fs";
import path from "node:path";
import { buildEvalRecommendations, type EvalRecommendationsResult } from "./eval-recommendations";
import { runTask } from "../evals";

interface RegressionRunOptions {
  provider?: string;
  liveProviderCommand?: string;
  useLlmJudge?: boolean;
}

interface RegressionRunEntry {
  taskId: string;
  reason: string;
  signal: string;
  recommendationCommand: string;
  recommendationCount: number;
  summaryPath?: string;
  exitCode?: number;
}

interface EvalRegressionResult {
  target: string;
  eventsPath: string;
  reportPath: string;
  totalEvents: number;
  recommendations: EvalRecommendationsResult["recommendations"];
  runs: RegressionRunEntry[];
}

function buildRegressionReportPath(targetRoot: string): string {
  const root = path.join(targetRoot, ".harness", "telemetry", "eval-regression");
  fs.mkdirSync(root, { recursive: true });
  return path.join(root, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
}

async function runRecommendedEvalRegression(
  packRoot: string,
  targetRoot: string,
  options: RegressionRunOptions = {}
): Promise<EvalRegressionResult> {
  const recommendationResult = buildEvalRecommendations(targetRoot);
  const reportPath = buildRegressionReportPath(targetRoot);
  const runs: RegressionRunEntry[] = [];

  for (const recommendation of recommendationResult.recommendations) {
    const result = await runTask(packRoot, recommendation.taskId, {
      provider: options.provider || "codex",
      liveProviderCommand: options.liveProviderCommand || process.env.EVAL_PROVIDER_COMMAND || "",
      useLlmJudge: options.useLlmJudge,
      targetRoot,
    });
    runs.push({
      taskId: recommendation.taskId,
      reason: recommendation.reason,
      signal: recommendation.signal,
      recommendationCommand: recommendation.command,
      recommendationCount: recommendation.count,
      summaryPath: result.summaryPath,
      exitCode: result.exitCode,
    });
  }

  const payload = {
    schema: "harness-telemetry-eval-regression-v1",
    generatedAt: new Date().toISOString(),
    target: recommendationResult.target,
    eventsPath: recommendationResult.eventsPath,
    totalEvents: recommendationResult.totalEvents,
    recommendations: recommendationResult.recommendations,
    runs,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  return {
    target: recommendationResult.target,
    eventsPath: recommendationResult.eventsPath,
    reportPath,
    totalEvents: recommendationResult.totalEvents,
    recommendations: recommendationResult.recommendations,
    runs,
  };
}

export { runRecommendedEvalRegression, buildRegressionReportPath };
export type { RegressionRunOptions, RegressionRunEntry, EvalRegressionResult };
