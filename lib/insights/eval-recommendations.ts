// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: application (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/index.js") as {
  buildEvalRecommendations: typeof import("../../src/features/insights/application/recommend-evals").buildEvalRecommendations;
  formatEvalRecommendations: typeof import("../../src/features/insights/presentation/format-eval-recommendations").formatEvalRecommendations;
};

export const buildEvalRecommendations = api.buildEvalRecommendations;
export const formatEvalRecommendations = api.formatEvalRecommendations;
export type Recommendation =
  import("../../src/features/insights/domain/eval-recommendations").Recommendation;
export type EvalRecommendationsResult =
  import("../../src/features/insights/application/recommend-evals").EvalRecommendationsResult;
