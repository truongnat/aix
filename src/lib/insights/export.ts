// Purpose: Backward-compat shim — implementation in src/features/insights/.
// Layer: domain (shim)
// Depends on: dist/features/insights

/* eslint-disable @typescript-eslint/no-require-imports */
const api = require("../../features/insights/domain/export-payload.js") as {
  buildAnonymizedExport: typeof import("../../features/insights/domain/export-payload").buildAnonymizedExport;
};

export const buildAnonymizedExport = api.buildAnonymizedExport;
export type ExportOptions =
  import("../../features/insights/domain/export-payload").ExportOptions;
export type ExportPayload =
  import("../../features/insights/domain/export-payload").ExportPayload;
