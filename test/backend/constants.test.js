const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { ignorePathsForProvider } = require(
  path.join(repoRoot, "dist", "lib", "backend", "constants.js")
);

test('ignorePathsForProvider("all") includes the opencode plugin path', () => {
  const paths = ignorePathsForProvider("all", false);
  assert.ok(paths.includes(".opencode/plugins/ai-engineering-harness.js"));
});
