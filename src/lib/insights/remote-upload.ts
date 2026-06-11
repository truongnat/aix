// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: application (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/application/upload-insights.js") as {
  uploadInsightsExport: typeof import("../../features/insights/application/upload-insights").uploadInsightsExport;
};

export const uploadInsightsExport = api.uploadInsightsExport;
export type UploadOptions =
  import("../../features/insights/application/upload-insights").UploadOptions;
export type UploadResult =
  import("../../features/insights/application/upload-insights").UploadResult;
