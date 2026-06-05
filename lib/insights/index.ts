import path from "node:path";
import { readEvents, resolveEventsPath, type Event } from "./event-reader";
import { buildAnonymizedExport, type ExportOptions, type ExportPayload } from "./export";
import { formatInsightsText, summarizeEvents, type Summary } from "./summarize";

interface Insights {
  target: string;
  eventsPath: string;
  events: Event[];
  summary: Summary;
  output: string;
}

function buildInsights(targetRoot: string): Insights {
  const resolvedTarget = path.resolve(targetRoot || ".");
  const eventsPath = resolveEventsPath(resolvedTarget);
  const events = readEvents(eventsPath);
  const summary = summarizeEvents(events);

  return {
    target: resolvedTarget,
    eventsPath,
    events,
    summary,
    output: formatInsightsText(summary, eventsPath),
  };
}

function buildInsightsExport(targetRoot: string, options: ExportOptions = {}): ExportPayload {
  const insights = buildInsights(targetRoot);
  return buildAnonymizedExport(insights.summary, {
    includeFingerprint: true,
    ...options,
  });
}

export {
  buildInsights,
  buildInsightsExport,
  buildAnonymizedExport,
  formatInsightsText,
  readEvents,
  resolveEventsPath,
  summarizeEvents,
};
export type { Insights, Event, Summary, ExportOptions, ExportPayload };
