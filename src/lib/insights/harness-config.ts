// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: infrastructure (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/infrastructure/harness-config.js") as {
  readHarnessConfig: typeof import("../../features/insights/infrastructure/harness-config").readHarnessConfig;
  resolveRemoteUploadConfig: typeof import("../../features/insights/infrastructure/harness-config").resolveRemoteUploadConfig;
};

export const readHarnessConfig = api.readHarnessConfig;
export const resolveRemoteUploadConfig = api.resolveRemoteUploadConfig;
export type HarnessConfig =
  import("../../features/insights/infrastructure/harness-config").HarnessConfig;
export type RemoteUploadConfig =
  import("../../features/insights/infrastructure/harness-config").RemoteUploadConfig;
