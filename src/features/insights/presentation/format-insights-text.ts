// Purpose: Render insights summary as human-readable CLI text.
// Layer: presentation
// Depends on: domain/summary.ts

import type { Summary } from "../domain/summary";

export function formatInsightsText(summary: Summary, eventsPath: string): string {
  const lines = [`Harness Insights (${eventsPath})`, `Events: ${summary.totalEvents}`, ""];

  const appendSection = <T>(title: string, rows: T[], formatter: (row: T) => string) => {
    lines.push(title);
    if (rows.length === 0) {
      lines.push("  (none)");
    } else {
      for (const row of rows) {
        lines.push(`  ${formatter(row)}`);
      }
    }
    lines.push("");
  };

  appendSection(
    "Skills:",
    summary.skills,
    ([name, count]: [string, number]) => `${name}: ${count}`
  );
  appendSection(
    "Phase guard blocks:",
    summary.guardBlocks,
    ([command, count]: [string, number]) => `${command}: ${count}`
  );
  appendSection(
    "Tools:",
    summary.tools,
    (entry: { command: string; count: number; failures: number }) =>
      `${entry.command}: ${entry.count} (${entry.failures} failed)`
  );
  appendSection(
    "Subagents:",
    summary.subagents,
    ([agent, count]: [string, number]) => `${agent}: ${count}`
  );

  return `${lines.join("\n").trim()}\n`;
}
