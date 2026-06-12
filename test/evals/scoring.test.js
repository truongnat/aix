const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { runChecks, runSingleCheck } = require(
  path.join(repoRoot, "dist", "features", "eval", "domain", "checks.js")
);
const { scoreRun } = require(
  path.join(repoRoot, "dist", "features", "eval", "domain", "scoring.js")
);

test("scoreRun separates outcome and behavior results", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-score-"));
  fs.writeFileSync(path.join(tempRoot, "final-response.txt"), "done");

  const checks = await runChecks(tempRoot, {
    successChecks: [],
    behaviorChecks: [{ type: "artifact-exists", path: "final-response.txt" }],
  });

  const score = scoreRun(checks);
  assert.equal(score.outcome.passed, 0);
  assert.equal(score.behavior.passed, 1);
  assert.equal(score.behavior.total, 1);
});

test("runChecks passes command checks when fixture tests succeed", async () => {
  const sourceDir = path.join(repoRoot, "evals", "fixtures", "sample-bugfix");
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-command-"));
  fs.cpSync(sourceDir, tempRoot, { recursive: true });
  fs.writeFileSync(
    path.join(tempRoot, "src", "math.js"),
    `"use strict";\n\nfunction add(a, b) {\n  return a + b;\n}\n\nmodule.exports = {\n  add,\n};\n`
  );

  const checks = await runChecks(tempRoot, {
    successChecks: [{ type: "command", command: "npm test", cwd: "." }],
    behaviorChecks: [],
  });
  const score = scoreRun(checks);
  assert.equal(score.outcome.passed, 1);
});

test("runChecks passes file-contains checks", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-contains-"));
  fs.writeFileSync(path.join(tempRoot, "HEALTH_REPORT.md"), "Status: ready\n");

  const checks = await runChecks(tempRoot, {
    successChecks: [{ type: "file-contains", path: "HEALTH_REPORT.md", pattern: "Status:" }],
    behaviorChecks: [],
  });

  const score = scoreRun(checks);
  assert.equal(score.outcome.passed, 1);
});

test("runSingleCheck rejects shell metacharacters in command checks", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-shell-"));
  assert.throws(
    () =>
      runSingleCheck(tempRoot, {
        type: "command",
        command: "npm test && echo pwned",
        cwd: ".",
      }),
    /unsupported shell syntax/
  );
});

test("scoreRun normalizes missing rubric fields instead of emitting undefined", () => {
  const score = scoreRun(
    { outcome: [], behavior: [] },
    {
      mode: "none",
      passed: true,
      checks: [],
    }
  );

  assert.deepEqual(score.rubric, {
    mode: "none",
    rubricId: "",
    passed: true,
    llm: undefined,
  });
});
