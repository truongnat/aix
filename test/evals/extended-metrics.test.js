const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { compareAbMetrics, scoreExtendedMetrics } = require(
  path.join(repoRoot, "dist", "features", "eval", "infrastructure", "extended-metrics.js")
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
  assert.ok(comparison.estimatedEfficiencyGain > 0);
  assert.ok(comparison.phaseDisciplineDelta > 0);
});

test("scoreExtendedMetrics only marks self-correction ready for strong with-harness behavior", () => {
  const task = { id: "sample-bugfix", metrics: { withHarnessSteps: 3, withoutHarnessSteps: 8 } };
  const strongScore = {
    outcome: { failed: 0, passed: 1, total: 1, percent: 1 },
    behavior: { failed: 0, passed: 4, total: 5, percent: 0.8 },
  };
  const weakScore = {
    outcome: { failed: 0, passed: 1, total: 1, percent: 1 },
    behavior: { failed: 3, passed: 2, total: 5, percent: 0.4 },
  };

  assert.equal(
    scoreExtendedMetrics(task, "with-harness", strongScore, repoRoot).selfCorrectionReady,
    true
  );
  assert.equal(
    scoreExtendedMetrics(task, "with-harness", weakScore, repoRoot).selfCorrectionReady,
    false
  );
  assert.equal(
    scoreExtendedMetrics(task, "without-harness", strongScore, repoRoot).selfCorrectionReady,
    false
  );
});
