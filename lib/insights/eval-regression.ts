// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: application (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/application/run-eval-regression.js") as {
  runRecommendedEvalRegression: typeof import("../../src/features/insights/application/run-eval-regression").runRecommendedEvalRegression;
  buildRegressionReportPath: typeof import("../../src/features/insights/infrastructure/regression-report-store").buildRegressionReportPath;
};

export const runRecommendedEvalRegression = api.runRecommendedEvalRegression;
export const buildRegressionReportPath = api.buildRegressionReportPath;
export type RegressionRunOptions =
  import("../../src/features/insights/application/run-eval-regression").RegressionRunOptions;
export type RegressionRunEntry =
  import("../../src/features/insights/application/run-eval-regression").RegressionRunEntry;
export type EvalRegressionResult =
  import("../../src/features/insights/application/run-eval-regression").EvalRegressionResult;
