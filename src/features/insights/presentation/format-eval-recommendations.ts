// Purpose: Render eval recommendations as human-readable CLI text.
// Layer: presentation
// Depends on: application/recommend-evals.ts

import type { EvalRecommendationsResult } from "../application/recommend-evals";

export function formatEvalRecommendations(result: EvalRecommendationsResult): string {
  const lines = [
    `Eval recommendations (${result.eventsPath})`,
    `Events: ${result.totalEvents}`,
    "",
  ];

  if (result.recommendations.length === 0) {
    lines.push("No telemetry-driven eval recommendations (no events yet).");
  } else {
    for (const item of result.recommendations) {
      lines.push(`- ${item.taskId}: ${item.reason}`);
    }
  }

  return `${lines.join("\n").trim()}\n`;
}
