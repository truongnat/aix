const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

test("package.json files entries exist on disk", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  for (const entry of pkg.files) {
    if (entry.startsWith("!")) {
      continue;
    }
    const normalized = entry.replace(/\/$/, "");
    assert.ok(fs.existsSync(path.join(repoRoot, normalized)), `Missing packaged path: ${entry}`);
  }
});

test("package includes evals and documents eval command surface", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const docs = fs.readFileSync(path.join(repoRoot, "docs", "evals.md"), "utf8");

  assert.ok(pkg.files.includes("evals/"));
  assert.match(readme, /eval list/);
  assert.match(readme, /Evals/);
  assert.match(docs, /with-harness/);
  assert.match(docs, /without-harness/);
});
