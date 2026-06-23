// Purpose: Parse telemetry server CLI flags and environment variables.
// Layer: infrastructure
// Depends on: nothing

import path from "node:path";

export interface TelemetryServerConfig {
  port: number;
  host: string;
  storageDir: string;
  routePath: string;
}

function readArg(argv: string[], flag: string, fallback: string): string {
  const index = argv.indexOf(flag);
  if (index === -1 || index + 1 >= argv.length) {
    return fallback;
  }
  return argv[index + 1];
}

export function parseTelemetryServerConfig(argv: string[] = process.argv): TelemetryServerConfig {
  return {
    port: Number(readArg(argv, "--port", process.env.HARNESS_TELEMETRY_PORT || "8787")),
    host: readArg(argv, "--host", process.env.HARNESS_TELEMETRY_HOST || "127.0.0.1"),
    storageDir: readArg(
      argv,
      "--storage-dir",
      process.env.HARNESS_TELEMETRY_STORAGE_DIR || path.join(process.cwd(), ".harness", "telemetry")
    ),
    routePath: readArg(argv, "--route", process.env.HARNESS_TELEMETRY_ROUTE || "/api/telemetry"),
  };
}
