// Purpose: Build insights summary from local telemetry events.
// Layer: application
// Depends on: domain, infrastructure, presentation

import path from "node:path";
import { buildAnonymizedExport, type ExportOptions, type ExportPayload } from "../domain/export-payload";
import { summarizeEvents, type Summary } from "../domain/summary";
import type { Event } from "../domain/event";
import { readEvents, resolveEventsPath } from "../infrastructure/event-reader";
import { formatInsightsText } from "../presentation/format-insights-text";

export interface Insights {
  target: string;
  eventsPath: string;
  events: Event[];
  summary: Summary;
  output: string;
}

export function buildInsights(targetRoot: string): Insights {
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

export function buildInsightsExport(
  targetRoot: string,
  options: ExportOptions = {}
): ExportPayload {
  const insights = buildInsights(targetRoot);
  return buildAnonymizedExport(insights.summary, {
    includeFingerprint: true,
    ...options,
  });
}
