// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: presentation (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/index.js") as {
  summarizeEvents: typeof import("../../src/features/insights/domain/summary").summarizeEvents;
  formatInsightsText: typeof import("../../src/features/insights/presentation/format-insights-text").formatInsightsText;
};

export const summarizeEvents = api.summarizeEvents;
export const formatInsightsText = api.formatInsightsText;
export type Summary = import("../../src/features/insights/domain/summary").Summary;
