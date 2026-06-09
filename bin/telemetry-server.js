#!/usr/bin/env node
"use strict";

const path = require("node:path");
const { createTelemetryServer } = require("../dist/lib/insights");

function readArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[index + 1];
}

const port = Number(readArg("--port", process.env.HARNESS_TELEMETRY_PORT || "8787"));
const host = readArg("--host", process.env.HARNESS_TELEMETRY_HOST || "127.0.0.1");
const storageDir = readArg(
  "--storage-dir",
  process.env.HARNESS_TELEMETRY_STORAGE_DIR || path.join(process.cwd(), ".harness", "telemetry")
);
const routePath = readArg("--route", process.env.HARNESS_TELEMETRY_ROUTE || "/api/telemetry");

const server = createTelemetryServer({
  storageDir,
  routePath,
});

server.listen(port, host, () => {
  process.stdout.write(
    `Telemetry backend listening on http://${host}:${port}${routePath}\n` +
      `Health check: http://${host}:${port}/health\n` +
      `Storage: ${path.join(storageDir, "harness-telemetry.ndjson")}\n`
  );
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
  server.close(() => process.exit(1));
});
