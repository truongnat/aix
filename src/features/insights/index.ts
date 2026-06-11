// Purpose: Public exports for insights feature.
// Layer: presentation
// Depends on: all insights layers + telemetry re-exports

export { buildInsights, buildInsightsExport, type Insights } from "./application/build-insights";
export { buildAnonymizedExport, type ExportOptions, type ExportPayload } from "./domain/export-payload";
export {
  buildEvalRecommendations,
  type EvalRecommendationsResult,
  type Recommendation,
} from "./application/recommend-evals";
export { formatEvalRecommendations } from "./presentation/format-eval-recommendations";
export {
  runRecommendedEvalRegression,
  buildRegressionReportPath,
  type RegressionRunOptions,
  type RegressionRunEntry,
  type EvalRegressionResult,
} from "./application/run-eval-regression";
export { uploadInsightsExport, type UploadOptions, type UploadResult } from "./application/upload-insights";
export { readEvents, resolveEventsPath, type Event } from "./infrastructure/event-reader";
export { readHarnessConfig, resolveRemoteUploadConfig, type HarnessConfig, type RemoteUploadConfig } from "./infrastructure/harness-config";
export { summarizeEvents, type Summary } from "./domain/summary";
export { formatInsightsText } from "./presentation/format-insights-text";

export {
  createTelemetryServer,
  handleTelemetryRequest,
  validateTelemetryPayload,
  writeTelemetryExport,
  DEFAULT_MAX_STORAGE_BYTES,
  defaultStoragePath,
  type TelemetryServerOptions,
  type TelemetryExportPayload,
  type TelemetryIngestResult,
  type TelemetryWriteResult,
} from "../telemetry";
