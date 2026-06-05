import fs from "node:fs";
import path from "node:path";

interface ModeArtifactsPayload {
  summary: Record<string, unknown>;
  metrics: Record<string, unknown>;
  transcript: string;
  report: string;
}

interface RunSummaryPayload {
  runId: string;
  taskId: string;
  modes: Record<string, unknown>;
  comparison: Record<string, unknown>;
  telemetryHints: unknown;
}

interface ModeArtifactsPaths {
  summaryPath: string;
  metricsPath: string;
  transcriptPath: string;
  reportPath: string;
}

function writeModeArtifacts(modeDir: string, payload: ModeArtifactsPayload): ModeArtifactsPaths {
  const summaryPath = path.join(modeDir, "summary.json");
  const metricsPath = path.join(modeDir, "metrics.json");
  const transcriptPath = path.join(modeDir, "transcript.md");
  const reportPath = path.join(modeDir, "report.md");

  fs.writeFileSync(summaryPath, JSON.stringify(payload.summary, null, 2));
  fs.writeFileSync(metricsPath, JSON.stringify(payload.metrics, null, 2));
  fs.writeFileSync(transcriptPath, payload.transcript);
  fs.writeFileSync(reportPath, payload.report);

  return { summaryPath, metricsPath, transcriptPath, reportPath };
}

function writeRunSummary(runRoot: string, payload: RunSummaryPayload): string {
  const summaryPath = path.join(runRoot, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(payload, null, 2));
  return summaryPath;
}

export { writeModeArtifacts, writeRunSummary };
export type { ModeArtifactsPayload, RunSummaryPayload, ModeArtifactsPaths };
