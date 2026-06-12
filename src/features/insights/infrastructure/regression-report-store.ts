// Purpose: Write eval regression reports to disk.
// Layer: infrastructure
// Depends on: nothing

import fs from "node:fs";
import path from "node:path";

export function buildRegressionReportPath(targetRoot: string): string {
  const root = path.join(targetRoot, ".harness", "telemetry", "eval-regression");
  fs.mkdirSync(root, { recursive: true });
  return path.join(root, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
}

export function writeRegressionReport(reportPath: string, payload: Record<string, unknown>): void {
  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
