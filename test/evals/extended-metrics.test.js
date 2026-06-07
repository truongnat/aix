const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { compareAbMetrics } = require(
  path.join(repoRoot, "dist", "lib", "evals", "extended-metrics.js")
);

test("compareAbMetrics reports self-correction when only with-harness passes", () => {
  const task = { id: "sample-bugfix", metrics: { withHarnessSteps: 3, withoutHarnessSteps: 8 } };
  const withHarness = {
    outcome: { failed: 0, passed: 1, total: 1, percent: 1 },
    behavior: { failed: 0, passed: 1, total: 1, percent: 1 },
  };
  const withoutHarness = {
    outcome: { failed: 1, passed: 0, total: 1, percent: 0 },
    behavior: { failed: 1, passed: 0, total: 1, percent: 0 },
  };

  const comparison = compareAbMetrics(task, withHarness, withoutHarness, repoRoot);
  assert.equal(comparison.selfCorrectionDemonstrated, true);
  assert.ok(comparison.efficiencyGain > 0);
  assert.ok(comparison.phaseDisciplineDelta > 0);
});
