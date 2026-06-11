// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: presentation (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/insights/index.js") as typeof import("../../features/insights/index");

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

export type Insights = import("../../features/insights/application/build-insights").Insights;
export type Event = import("../../features/insights/domain/event").Event;
export type Summary = import("../../features/insights/domain/summary").Summary;
export type ExportOptions =
  import("../../features/insights/domain/export-payload").ExportOptions;
export type ExportPayload =
  import("../../features/insights/domain/export-payload").ExportPayload;
export type TelemetryServerOptions =
  import("../../features/telemetry/presentation/routes").TelemetryServerOptions;
export type TelemetryExportPayload =
  import("../../features/telemetry/domain/telemetry-payload").TelemetryExportPayload;
export type TelemetryIngestResult =
  import("../../features/telemetry/presentation/routes").TelemetryIngestResult;
export type TelemetryWriteResult =
  import("../../features/telemetry/infrastructure/file-storage").TelemetryWriteResult;
