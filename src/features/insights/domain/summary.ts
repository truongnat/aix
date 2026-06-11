// Purpose: Aggregate telemetry events into summary counters.
// Layer: domain
// Depends on: event.ts

import type { Event } from "./event";

export interface Summary {
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

export function summarizeEvents(events: Event[]): Summary {
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
