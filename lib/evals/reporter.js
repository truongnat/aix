"use strict";

const fs = require("node:fs");
const path = require("node:path");

function writeModeArtifacts(modeDir, payload) {
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

function writeRunSummary(runRoot, payload) {
  const summaryPath = path.join(runRoot, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(payload, null, 2));
  return summaryPath;
}

module.exports = {
  writeModeArtifacts,
  writeRunSummary,
};
