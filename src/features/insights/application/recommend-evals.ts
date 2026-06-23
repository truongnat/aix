// Purpose: Recommend eval tasks from local telemetry signals.
// Layer: application
// Depends on: build-insights, domain/eval-recommendations

import { buildRecommendationsFromSummary, type Recommendation } from "../domain/eval-recommendations";
import { buildInsights } from "./build-insights";

export interface EvalRecommendationsResult {
  target: string;
  eventsPath: string;
  totalEvents: number;
  recommendations: Recommendation[];
}

export function buildEvalRecommendations(targetRoot: string): EvalRecommendationsResult {
  const insights = buildInsights(targetRoot);
  return buildRecommendationsFromSummary(
    insights.summary,
    insights.target,
    insights.eventsPath
  );
}

export type { Recommendation };
