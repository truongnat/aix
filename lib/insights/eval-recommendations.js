"use strict";

const { buildInsights } = require("./index");

const GUARD_TO_TASKS = {
  "harness-run": ["sample-bugfix", "sample-divide", "sample-max"],
  "harness-verify": ["sample-verify-md", "sample-response-contract"],
  "harness-ship": ["sample-ship-md", "example-health-report"],
  "harness-plan": ["sample-plan-md", "sample-context-md"],
};

function buildEvalRecommendations(targetRoot) {
  const insights = buildInsights(targetRoot);
  const recommendations = [];
  const seen = new Set();

  for (const [command, count] of insights.summary.guardBlocks) {
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

  for (const entry of insights.summary.tools) {
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

  if (recommendations.length === 0 && insights.summary.totalEvents > 0) {
    recommendations.push({
      taskId: "sample-response-contract",
      reason: "Telemetry present with no guard blocks — validate response contract discipline",
      signal: "baseline",
      command: "",
      count: insights.summary.totalEvents,
    });
  }

  return {
    target: insights.target,
    eventsPath: insights.eventsPath,
    totalEvents: insights.summary.totalEvents,
    recommendations,
  };
}

function formatEvalRecommendations(result) {
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

module.exports = {
  buildEvalRecommendations,
  formatEvalRecommendations,
};
