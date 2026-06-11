// Purpose: Public exports for telemetry feature.
// Layer: presentation
// Depends on: all telemetry layers

export { DEFAULT_MAX_STORAGE_BYTES, TELEMETRY_SCHEMA_ID } from "./domain/constants";
export { validateTelemetryPayload, type TelemetryExportPayload } from "./domain/telemetry-payload";
export {
  defaultStoragePath,
  appendTelemetryExport,
  appendTelemetryExport as writeTelemetryExport,
  type TelemetryWriteResult,
} from "./infrastructure/file-storage";
export { createTelemetryServer } from "./presentation/create-server";
export {
  handleTelemetryRequest,
  type TelemetryServerOptions,
  type TelemetryIngestResult,
} from "./presentation/routes";
