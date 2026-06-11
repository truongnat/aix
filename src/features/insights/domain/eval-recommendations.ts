// Purpose: Map guard/tool signals to eval task recommendations.
// Layer: domain
// Depends on: summary.ts

import type { Summary } from "./summary";

export const GUARD_TO_TASKS: Record<string, string[]> = {
  "harness-run": ["sample-bugfix", "sample-divide", "sample-max"],
  "harness-verify": ["sample-verify-md", "sample-response-contract"],
  "harness-ship": ["sample-ship-md", "example-health-report"],
  "harness-plan": ["sample-plan-md", "sample-context-md"],
};

export interface Recommendation {
  taskId: string;
  reason: string;
  signal: string;
  command: string;
  count: number;
}

export function buildRecommendationsFromSummary(
  summary: Summary,
  target: string,
  eventsPath: string
): {
  target: string;
  eventsPath: string;
  totalEvents: number;
  recommendations: Recommendation[];
} {
  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();

  for (const [command, count] of summary.guardBlocks) {
    const tasks = GUARD_TO_TASKS[command] || [];
    for (const taskId of tasks) {
      if (seen.has(taskId)) {
        continue;
      }
      seen.add(taskId);
      recommendations.push({
        taskId,
        reason: `Phase guard '${command}' blocked ${count} time(s) in local telemetry`,
        signal: "guard-block",
        command,
        count,
      });
    }
  }

  for (const entry of summary.tools) {
    if (entry.failures > 0 && !seen.has("sample-bugfix")) {
      seen.add("sample-bugfix");
      recommendations.push({
        taskId: "sample-bugfix",
        reason: `Tool '${entry.command}' failed ${entry.failures}/${entry.count} runs`,
        signal: "tool-failure",
        command: entry.command,
        count: entry.failures,
      });
    }
  }

  if (recommendations.length === 0 && summary.totalEvents > 0) {
    recommendations.push({
      taskId: "sample-response-contract",
      reason: "Telemetry present with no guard blocks — validate response contract discipline",
      signal: "baseline",
      command: "",
      count: summary.totalEvents,
    });
  }

  return {
    target,
    eventsPath,
    totalEvents: summary.totalEvents,
    recommendations,
  };
}
