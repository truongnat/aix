const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { createRunContext, resolveArtifactsBase } = require(
  path.join(repoRoot, "dist", "features", "eval", "infrastructure", "run-context.js")
);

test("createRunContext sanitizes task ids before creating run directories", () => {
  const context = createRunContext(repoRoot, "regression/task:1");
  assert.match(context.runId, /regression-task-1$/);
  assert.equal(fs.existsSync(context.runRoot), true);
});

test("resolveArtifactsBase honors AIH_EVAL_ARTIFACTS_DIR", () => {
  const original = process.env.AIH_EVAL_ARTIFACTS_DIR;
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-artifacts-"));

  process.env.AIH_EVAL_ARTIFACTS_DIR = tempRoot;
  try {
    const context = createRunContext(repoRoot, "sample-bugfix");
    assert.equal(resolveArtifactsBase(repoRoot), tempRoot);
    assert.equal(context.runRoot.startsWith(path.join(tempRoot, "runs")), true);
  } finally {
    if (original === undefined) {
      delete process.env.AIH_EVAL_ARTIFACTS_DIR;
    } else {
      process.env.AIH_EVAL_ARTIFACTS_DIR = original;
    }
  }
});
