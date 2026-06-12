// Purpose: Create Node HTTP server for telemetry routes.
// Layer: presentation
// Depends on: routes.ts

import { createServer } from "node:http";
import { handleTelemetryRequest, type TelemetryServerOptions } from "./routes";

export function createTelemetryServer(options: TelemetryServerOptions = {}) {
  return createServer((req, res) => {
    void handleTelemetryRequest(req, res, options);
  });
}
