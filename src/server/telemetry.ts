// Purpose: Start telemetry HTTP server from CLI.
// Layer: presentation
// Depends on: features/telemetry

import { parseTelemetryServerConfig } from "../features/telemetry/infrastructure/server-config";
import { createTelemetryServer } from "../features/telemetry/presentation/create-server";

const config = parseTelemetryServerConfig();
const server = createTelemetryServer({
  storageDir: config.storageDir,
  routePath: config.routePath,
});

server.listen(config.port, config.host, () => {
  process.stdout.write(
    `Telemetry backend listening on http://${config.host}:${config.port}${config.routePath}\n` +
      `Health check: http://${config.host}:${config.port}/health\n` +
      `Storage: ${config.storageDir}/harness-telemetry.ndjson\n`
  );
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
  server.close(() => process.exit(1));
});
