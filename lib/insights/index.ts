// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: presentation (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/insights/index.js") as typeof import("../../src/features/insights/index");

export const buildInsights = api.buildInsights;
export const buildInsightsExport = api.buildInsightsExport;
export const buildAnonymizedExport = api.buildAnonymizedExport;
export const createTelemetryServer = api.createTelemetryServer;
export const formatInsightsText = api.formatInsightsText;
export const readEvents = api.readEvents;
export const handleTelemetryRequest = api.handleTelemetryRequest;
export const resolveEventsPath = api.resolveEventsPath;
export const summarizeEvents = api.summarizeEvents;
export const validateTelemetryPayload = api.validateTelemetryPayload;
export const writeTelemetryExport = api.writeTelemetryExport;

export type Insights = import("../../src/features/insights/application/build-insights").Insights;
export type Event = import("../../src/features/insights/domain/event").Event;
export type Summary = import("../../src/features/insights/domain/summary").Summary;
export type ExportOptions =
  import("../../src/features/insights/domain/export-payload").ExportOptions;
export type ExportPayload =
  import("../../src/features/insights/domain/export-payload").ExportPayload;
export type TelemetryServerOptions =
  import("../../src/features/telemetry/presentation/routes").TelemetryServerOptions;
export type TelemetryExportPayload =
  import("../../src/features/telemetry/domain/telemetry-payload").TelemetryExportPayload;
export type TelemetryIngestResult =
  import("../../src/features/telemetry/presentation/routes").TelemetryIngestResult;
export type TelemetryWriteResult =
  import("../../src/features/telemetry/infrastructure/file-storage").TelemetryWriteResult;
