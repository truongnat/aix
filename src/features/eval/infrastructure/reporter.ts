// Purpose: Write eval run artifacts and summaries
// Layer: infrastructure
// Depends on: domain

import fs from "node:fs";
import path from "node:path";

interface ModeArtifactsPayload<
  TSummary extends object = Record<string, unknown>,
  TMetrics extends object = Record<string, unknown>,
> {
  summary: TSummary;
  metrics: TMetrics;
  transcript: string;
  report: string;
}

interface RunSummaryPayload<
  TModes extends object = Record<string, unknown>,
  TComparison extends object = Record<string, unknown>,
> {
  runId: string;
  taskId: string;
  modes: TModes;
  comparison: TComparison;
  telemetryHints: unknown;
}

interface ModeArtifactsPaths {
  summaryPath: string;
  metricsPath: string;
  transcriptPath: string;
  reportPath: string;
}

function writeModeArtifacts<TSummary extends object, TMetrics extends object>(
  modeDir: string,
  payload: ModeArtifactsPayload<TSummary, TMetrics>
): ModeArtifactsPaths {
  const summaryPath = path.join(modeDir, "summary.json");
  const metricsPath = path.join(modeDir, "metrics.json");
  const transcriptPath = path.join(modeDir, "transcript.md");
  const reportPath = path.join(modeDir, "report.md");

  fs.writeFileSync(
    summaryPath,
    JSON.stringify({ schemaVersion: "1", ...payload.summary }, null, 2)
  );
  fs.writeFileSync(
    metricsPath,
    JSON.stringify({ schemaVersion: "1", ...payload.metrics }, null, 2)
  );
  fs.writeFileSync(transcriptPath, payload.transcript);
  fs.writeFileSync(reportPath, payload.report);

  return { summaryPath, metricsPath, transcriptPath, reportPath };
}

function writeRunSummary<TModes extends object, TComparison extends object>(
  runRoot: string,
  payload: RunSummaryPayload<TModes, TComparison>
): string {
  const summaryPath = path.join(runRoot, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify({ schemaVersion: "1", ...payload }, null, 2));
  return summaryPath;
}

export { writeModeArtifacts, writeRunSummary };
export type { ModeArtifactsPayload, RunSummaryPayload, ModeArtifactsPaths };
