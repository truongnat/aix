// Purpose: Validate and persist a telemetry export.
// Layer: application
// Depends on: domain/telemetry-payload, infrastructure/file-storage

import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";
import { validateTelemetryPayload } from "../domain/telemetry-payload";
import { appendTelemetryExport } from "../infrastructure/file-storage";

export interface IngestTelemetryOptions {
  maxStorageBytes?: number;
}

export interface IngestTelemetryResult {
  ok: boolean;
  statusCode: number;
  error?: string;
  bytesWritten?: number;
  schema?: string;
  fingerprint?: string | null;
}

export function ingestTelemetryExport(
  storageDir: string,
  payload: unknown,
  options: IngestTelemetryOptions = {}
): IngestTelemetryResult {
  if (!validateTelemetryPayload(payload)) {
    return {
      ok: false,
      statusCode: 422,
      error: "Invalid telemetry export payload",
    };
  }

  try {
    const maxStorageBytes = options.maxStorageBytes ?? DEFAULT_MAX_STORAGE_BYTES;
    const record = appendTelemetryExport(storageDir, payload, maxStorageBytes);
    return {
      ok: true,
      statusCode: 202,
      schema: payload.schema,
      fingerprint: payload.fingerprint ?? null,
      bytesWritten: record.bytesWritten,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telemetry ingest failed";
    const statusCode = message.startsWith("Telemetry storage limit exceeded") ? 507 : 400;
    return { ok: false, statusCode, error: message };
  }
}
