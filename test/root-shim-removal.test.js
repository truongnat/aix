const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

test("root shim files are removed from the repository root", () => {
  for (const relativePath of [
    "install.js",
    "install-cache.js",
    "install-runtime.js",
    "validate.js",
  ]) {
    assert.equal(
      fs.existsSync(path.join(repoRoot, relativePath)),
      false,
      `${relativePath} must not exist at repo root`
    );
  }
});
