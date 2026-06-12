const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { applyModeMutation } = require(
  path.join(repoRoot, "dist", "features", "eval", "domain", "mode-mutations.js")
);

test("applyModeMutation writes with-harness fix for sample-divide", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-mutation-"));
  const sourceDir = path.join(repoRoot, "evals", "fixtures", "sample-divide");
  fs.cpSync(sourceDir, tempRoot, { recursive: true });

  applyModeMutation("with-harness", tempRoot, { id: "sample-divide" }, repoRoot);
  const content = fs.readFileSync(path.join(tempRoot, "src", "math.js"), "utf8");
  assert.match(content, /return a \/ b/);
  assert.ok(fs.existsSync(path.join(tempRoot, "final-response.txt")));
});
