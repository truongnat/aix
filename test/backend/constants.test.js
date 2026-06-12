const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { ignorePathsForProvider } = require(
  path.join(repoRoot, "dist", "shared", "install-kernel", "constants.js")
);

test('ignorePathsForProvider("all") includes the opencode plugin path', () => {
  const paths = ignorePathsForProvider("all", false);
  assert.ok(paths.includes(".opencode/plugins/ai-engineering-harness.js"));
});
