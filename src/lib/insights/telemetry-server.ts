// Purpose: Backward-compat shim — implementation lives in src/features/telemetry/.
// Layer: infrastructure (shim)
// Depends on: dist/features/telemetry (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
import type {
  TelemetryExportPayload,
  TelemetryIngestResult,
  TelemetryServerOptions,
  TelemetryWriteResult,
} from "../../features/telemetry/index";

const api = require("../../features/telemetry/index.js") as {
  DEFAULT_MAX_STORAGE_BYTES: number;
  createTelemetryServer: (options?: TelemetryServerOptions) => import("node:http").Server;
  defaultStoragePath: (storageDir: string) => string;
  handleTelemetryRequest: (
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
    options?: TelemetryServerOptions
  ) => Promise<TelemetryIngestResult>;
  validateTelemetryPayload: (payload: unknown) => payload is TelemetryExportPayload;
  writeTelemetryExport: (
    storageDir: string,
    payload: TelemetryExportPayload,
    maxStorageBytes?: number
  ) => TelemetryWriteResult;
};

export const DEFAULT_MAX_STORAGE_BYTES = api.DEFAULT_MAX_STORAGE_BYTES;
export const createTelemetryServer = api.createTelemetryServer;
export const defaultStoragePath = api.defaultStoragePath;
export const handleTelemetryRequest = api.handleTelemetryRequest;
export const validateTelemetryPayload = api.validateTelemetryPayload;
export const writeTelemetryExport = api.writeTelemetryExport;

export type {
  TelemetryExportPayload,
  TelemetryIngestResult,
  TelemetryServerOptions,
  TelemetryWriteResult,
};
