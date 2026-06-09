import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";

interface TelemetryExportPayload {
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

interface TelemetryServerOptions {
  routePath?: string;
  storageDir?: string;
  maxBodyBytes?: number;
  maxStorageBytes?: number;
}

interface TelemetryIngestResult {
  accepted: boolean;
  statusCode: number;
  body: Record<string, unknown>;
}

interface TelemetryWriteResult {
  storagePath: string;
  bytesWritten: number;
}

const DEFAULT_MAX_STORAGE_BYTES = 50 * 1024 * 1024;

function defaultStoragePath(storageDir: string): string {
  return path.join(storageDir, "harness-telemetry.ndjson");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateTelemetryPayload(payload: unknown): payload is TelemetryExportPayload {
  if (!isPlainObject(payload)) {
    return false;
  }
  if (payload.schema !== "harness-insights-export-v1") {
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

function readRequestBody(req: IncomingMessage, maxBodyBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;

    req.on("data", (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;
      if (totalBytes > maxBodyBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(buffer);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", (error) => reject(error));
  });
}

function writeTelemetryExport(
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
  return {
    storagePath,
    bytesWritten: lineBytes,
  };
}

function jsonResponse(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(body, null, 2)}\n`);
}

async function handleTelemetryRequest(
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
    jsonResponse(res, 200, { ok: true });
    return { accepted: true, statusCode: 200, body: { ok: true } };
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
    if (!validateTelemetryPayload(payload)) {
      jsonResponse(res, 422, {
        ok: false,
        error: "Invalid telemetry export payload",
      });
      return {
        accepted: false,
        statusCode: 422,
        body: { ok: false, error: "Invalid telemetry export payload" },
      };
    }

    const record = writeTelemetryExport(storageDir, payload, maxStorageBytes);
    jsonResponse(res, 202, {
      ok: true,
      accepted: true,
      schema: payload.schema,
      fingerprint: payload.fingerprint || null,
      bytesWritten: record.bytesWritten,
    });
    return {
      accepted: true,
      statusCode: 202,
      body: {
        ok: true,
        accepted: true,
        schema: payload.schema,
        fingerprint: payload.fingerprint || null,
        bytesWritten: record.bytesWritten,
      },
    };
  } catch (error) {
    const message = (error as Error).message || "Telemetry ingest failed";
    const statusCode =
      message === "Request body too large"
        ? 413
        : message.startsWith("Telemetry storage limit exceeded")
          ? 507
          : 400;
    jsonResponse(res, statusCode, { ok: false, error: message });
    return {
      accepted: false,
      statusCode,
      body: { ok: false, error: message },
    };
  }
}

function createTelemetryServer(options: TelemetryServerOptions = {}) {
  return createServer((req, res) => {
    void handleTelemetryRequest(req, res, options);
  });
}

export {
  DEFAULT_MAX_STORAGE_BYTES,
  createTelemetryServer,
  defaultStoragePath,
  handleTelemetryRequest,
  validateTelemetryPayload,
  writeTelemetryExport,
};
export type {
  TelemetryExportPayload,
  TelemetryIngestResult,
  TelemetryServerOptions,
  TelemetryWriteResult,
};
