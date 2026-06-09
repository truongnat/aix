import type { Event } from "./event-reader";

interface Summary {
  totalEvents: number;
  skills: [string, number][];
  guardBlocks: [string, number][];
  guardPasses: [string, number][];
  tools: Array<{ command: string; count: number; failures: number }>;
  subagents: [string, number][];
}

function incrementCounter(map: Map<string, number>, key: string | undefined, amount = 1): void {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) || 0) + amount);
}

function mapToSortedEntries(map: Map<string, number>): [string, number][] {
  return [...map.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  );
}

function summarizeEvents(events: Event[]): Summary {
  const skills = new Map<string, number>();
  const guardBlocks = new Map<string, number>();
  const guardPasses = new Map<string, number>();
  const tools = new Map<string, number>();
  const toolFailures = new Map<string, number>();
  const subagents = new Map<string, number>();

  for (const event of events) {
    if (event.type === "skill-run") {
      incrementCounter(skills, event.skill as string);
      continue;
    }

    if (event.type === "guard-phase") {
      if (event.ok) {
        incrementCounter(guardPasses, event.command as string);
      } else {
        incrementCounter(guardBlocks, event.command as string);
      }
      continue;
    }

    if (event.type === "tool-run") {
      incrementCounter(tools, event.command as string);
      if (Number(event.exit_code) !== 0) {
        incrementCounter(toolFailures, event.command as string);
      }
      continue;
    }

    if (event.type === "subagent-run") {
      incrementCounter(subagents, event.agent as string);
    }
  }

  return {
    totalEvents: events.length,
    skills: mapToSortedEntries(skills),
    guardBlocks: mapToSortedEntries(guardBlocks),
    guardPasses: mapToSortedEntries(guardPasses),
    tools: mapToSortedEntries(tools).map(([command, count]) => ({
      command,
      count,
      failures: toolFailures.get(command) || 0,
    })),
    subagents: mapToSortedEntries(subagents),
  };
}

function formatInsightsText(summary: Summary, eventsPath: string): string {
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

export { formatInsightsText, summarizeEvents };
export type { Summary };
