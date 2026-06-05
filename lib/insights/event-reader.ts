import fs from "node:fs";
import path from "node:path";

interface Event {
  type: string;
  [key: string]: unknown;
}

function resolveEventsPath(targetRoot: string): string {
  return path.join(targetRoot, ".harness", "history", "events.jsonl");
}

function readEvents(eventsPath: string): Event[] {
  if (!fs.existsSync(eventsPath)) {
    return [];
  }

  const events: Event[] = [];
  const lines = fs.readFileSync(eventsPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Skip malformed lines so local history stays resilient.
    }
  }
  return events;
}

export { readEvents, resolveEventsPath };
export type { Event };
