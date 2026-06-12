const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { writeModeArtifacts, writeRunSummary } = require(
  path.join(repoRoot, "dist", "features", "eval", "infrastructure", "reporter.js")
);

test("reporter writes schemaVersion into mode and run summary JSON", () => {
  const runRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-reporter-"));
  const modeDir = path.join(runRoot, "with-harness");
  fs.mkdirSync(modeDir, { recursive: true });

  const modePaths = writeModeArtifacts(modeDir, {
    summary: { taskId: "sample-bugfix" },
    metrics: { outcome: { passed: 1 } },
    transcript: "# transcript\n",
    report: "# report\n",
  });
  const summaryPath = writeRunSummary(runRoot, {
    runId: "run-1",
    taskId: "sample-bugfix",
    modes: {},
    comparison: {},
    telemetryHints: null,
  });

  assert.equal(JSON.parse(fs.readFileSync(modePaths.summaryPath, "utf8")).schemaVersion, "1");
  assert.equal(JSON.parse(fs.readFileSync(modePaths.metricsPath, "utf8")).schemaVersion, "1");
  assert.equal(JSON.parse(fs.readFileSync(summaryPath, "utf8")).schemaVersion, "1");
});
