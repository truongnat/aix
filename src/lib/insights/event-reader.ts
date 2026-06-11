// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: infrastructure (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/infrastructure/event-reader.js") as {
  readEvents: typeof import("../../features/insights/infrastructure/event-reader").readEvents;
  resolveEventsPath: typeof import("../../features/insights/infrastructure/event-reader").resolveEventsPath;
};

export const readEvents = api.readEvents;
export const resolveEventsPath = api.resolveEventsPath;
export type Event = import("../../features/insights/domain/event").Event;
