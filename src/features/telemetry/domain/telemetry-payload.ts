// Purpose: Telemetry export payload type and validation rules.
// Layer: domain
// Depends on: constants.ts

import { TELEMETRY_SCHEMA_ID } from "./constants";

export interface TelemetryExportPayload {
  schema?: string;
  generatedAt?: string;
  anonymized?: boolean;
  aggregate?: {
    totalEvents?: number;
    skills?: Record<string, number>;
    guardBlocks?: Record<string, number>;
    guardPasses?: Record<string, number>;
    tools?: Array<{ command: string; count: number; failures: number }>;
    subagents?: Record<string, number>;
  };
  fingerprint?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function validateTelemetryPayload(payload: unknown): payload is TelemetryExportPayload {
  if (!isPlainObject(payload)) {
    return false;
  }
  if (payload.schema !== TELEMETRY_SCHEMA_ID) {
    return false;
  }
  if (typeof payload.generatedAt !== "string") {
    return false;
  }
  if (typeof payload.anonymized !== "boolean") {
    return false;
  }
  if (!isPlainObject(payload.aggregate)) {
    return false;
  }
  if (typeof payload.aggregate.totalEvents !== "number") {
    return false;
  }
  return true;
}

export { TELEMETRY_SCHEMA_ID, DEFAULT_MAX_STORAGE_BYTES } from "./constants";
