// Purpose: Backward-compat shim — implementation in src/features/validate/.
// Layer: presentation (shim)
// Depends on: dist/features/validate (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports */
const api =
  require("../../features/validate/application/daily-dev-report.js") as typeof import("../../src/features/validate/application/daily-dev-report");

export const assertDailyDevReportLayer = api.assertDailyDevReportLayer;
