// Purpose: Map HTTP routes to telemetry use cases.
// Layer: presentation
// Depends on: application, infrastructure, json-response

import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { runHealthCheck } from "../application/health-check";
import { ingestTelemetryExport } from "../application/ingest-telemetry";
import { DEFAULT_MAX_STORAGE_BYTES } from "../domain/constants";
import { readRequestBody } from "../infrastructure/http-body-reader";
import { jsonResponse } from "./json-response";

export interface TelemetryServerOptions {
  routePath?: string;
  storageDir?: string;
  maxBodyBytes?: number;
  maxStorageBytes?: number;
}

export interface TelemetryIngestResult {
  accepted: boolean;
  statusCode: number;
  body: Record<string, unknown>;
}

export async function handleTelemetryRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: TelemetryServerOptions = {}
): Promise<TelemetryIngestResult> {
  const routePath = options.routePath || "/api/telemetry";
  const maxBodyBytes = options.maxBodyBytes || 1_048_576;
  const maxStorageBytes = options.maxStorageBytes || DEFAULT_MAX_STORAGE_BYTES;
  const storageDir = options.storageDir || path.join(process.cwd(), ".harness", "telemetry");
  const method = (req.method || "GET").toUpperCase();
  const urlPath = (req.url || "/").split("?")[0];

  if (urlPath === "/health") {
    if (method !== "GET") {
      jsonResponse(res, 405, { ok: false, error: "Method not allowed" });
      return { accepted: false, statusCode: 405, body: { ok: false, error: "Method not allowed" } };
    }
    const health = runHealthCheck();
    jsonResponse(res, 200, health);
    return { accepted: true, statusCode: 200, body: health };
  }

  if (urlPath !== routePath) {
    jsonResponse(res, 404, { ok: false, error: "Not found" });
    return { accepted: false, statusCode: 404, body: { ok: false, error: "Not found" } };
  }

  if (method !== "POST") {
    jsonResponse(res, 405, { ok: false, error: "Method not allowed" });
    return { accepted: false, statusCode: 405, body: { ok: false, error: "Method not allowed" } };
  }

  try {
    const rawBody = await readRequestBody(req, maxBodyBytes);
    const payload = JSON.parse(rawBody) as unknown;
    const result = ingestTelemetryExport(storageDir, payload, { maxStorageBytes });

    if (!result.ok) {
      jsonResponse(res, result.statusCode, { ok: false, error: result.error });
      return {
        accepted: false,
        statusCode: result.statusCode,
        body: { ok: false, error: result.error },
      };
    }

    const body = {
      ok: true,
      accepted: true,
      schema: result.schema,
      fingerprint: result.fingerprint ?? null,
      bytesWritten: result.bytesWritten,
    };
    jsonResponse(res, result.statusCode, body);
    return { accepted: true, statusCode: result.statusCode, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telemetry ingest failed";
    const statusCode = message === "Request body too large" ? 413 : 400;
    jsonResponse(res, statusCode, { ok: false, error: message });
    return { accepted: false, statusCode, body: { ok: false, error: message } };
  }
}
