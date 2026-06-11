// Purpose: Run recommended eval tasks and persist regression report.
// Layer: application
// Depends on: recommend-evals, eval-task-runner, regression-report-store

import { buildEvalRecommendations, type EvalRecommendationsResult } from "./recommend-evals";
import { runEvalTask } from "../infrastructure/eval-task-runner";
import {
  buildRegressionReportPath,
  writeRegressionReport,
} from "../infrastructure/regression-report-store";
import type { Recommendation } from "../domain/eval-recommendations";

export interface RegressionRunOptions {
  provider?: string;
  liveProviderCommand?: string;
  useLlmJudge?: boolean;
}

export interface RegressionRunEntry {
  taskId: string;
  reason: string;
  signal: string;
  recommendationCommand: string;
  recommendationCount: number;
  summaryPath?: string;
  exitCode?: number;
}

export interface EvalRegressionResult {
  target: string;
  eventsPath: string;
  reportPath: string;
  totalEvents: number;
  recommendations: Recommendation[];
  runs: RegressionRunEntry[];
}

export async function runRecommendedEvalRegression(
  packRoot: string,
  targetRoot: string,
  options: RegressionRunOptions = {}
): Promise<EvalRegressionResult> {
  const recommendationResult = buildEvalRecommendations(targetRoot);
  const reportPath = buildRegressionReportPath(targetRoot);
  const runs: RegressionRunEntry[] = [];

  for (const recommendation of recommendationResult.recommendations) {
    const result = await runEvalTask(packRoot, recommendation.taskId, {
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

  writeRegressionReport(reportPath, payload);

  return {
    target: recommendationResult.target,
    eventsPath: recommendationResult.eventsPath,
    reportPath,
    totalEvents: recommendationResult.totalEvents,
    recommendations: recommendationResult.recommendations,
    runs,
  };
}

export { buildRegressionReportPath };

export type { EvalRecommendationsResult };
