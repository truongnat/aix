// Purpose: Append telemetry exports to NDJSON storage with size cap.
// Layer: infrastructure
// Depends on: domain/constants, domain/telemetry-payload

import fs from "node:fs";
import path from "node:path";
import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";
import type { TelemetryExportPayload } from "../domain/telemetry-payload";

export interface TelemetryWriteResult {
  storagePath: string;
  bytesWritten: number;
}

export function defaultStoragePath(storageDir: string): string {
  return path.join(storageDir, "harness-telemetry.ndjson");
}

export function appendTelemetryExport(
  storageDir: string,
  payload: TelemetryExportPayload,
  maxStorageBytes = DEFAULT_MAX_STORAGE_BYTES
): TelemetryWriteResult {
  fs.mkdirSync(storageDir, { recursive: true });
  const storagePath = defaultStoragePath(storageDir);
  const line = `${JSON.stringify(payload)}\n`;
  const existingSize = fs.existsSync(storagePath) ? fs.statSync(storagePath).size : 0;
  const lineBytes = Buffer.byteLength(line);

  if (existingSize + lineBytes > maxStorageBytes) {
    throw new Error(`Telemetry storage limit exceeded (${maxStorageBytes} bytes)`);
  }

  fs.appendFileSync(storagePath, line, "utf8");
  return { storagePath, bytesWritten: lineBytes };
}
