const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { runTask } = require(path.join(repoRoot, "lib", "evals", "index.js"));

test("runTask emits with-harness and without-harness reports", async () => {
  const result = await runTask(repoRoot, "sample-bugfix", {
    provider: "codex",
  });

  assert.equal(result.exitCode, 0);
  assert.ok(fs.existsSync(result.summaryPath));
  const summary = JSON.parse(fs.readFileSync(result.summaryPath, "utf8"));
  assert.ok(summary.modes["with-harness"]);
  assert.ok(summary.modes["without-harness"]);
  assert.equal(summary.taskId, "sample-bugfix");
  assert.ok(summary.modes["with-harness"].outcome.passed >= 1);
  assert.equal(summary.modes["without-harness"].outcome.passed, 0);
});

test("runTask passes example-health-report with harness", async () => {
  const result = await runTask(repoRoot, "example-health-report", {
    provider: "codex",
  });

  assert.equal(result.exitCode, 0);
  const summary = JSON.parse(fs.readFileSync(result.summaryPath, "utf8"));
  assert.equal(summary.modes["with-harness"].outcome.passed, 1);
  assert.equal(summary.modes["without-harness"].outcome.passed, 0);
});
