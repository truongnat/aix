const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const version = "1.0.1";

test("release-facing files point at v1.0.1", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"));
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const docsIndex = fs.readFileSync(path.join(repoRoot, "docs", "README.md"), "utf8");
  const notesPath = path.join(repoRoot, "docs", "v1.0.1-release-notes.md");
  const hero = fs.readFileSync(path.join(repoRoot, "site", "src", "components", "Hero.tsx"), "utf8");
  const footer = fs.readFileSync(path.join(repoRoot, "site", "src", "components", "Footer.tsx"), "utf8");

  assert.equal(pkg.version, version);
  assert.equal(lock.version, version);
  assert.equal(lock.packages[""].version, version);
  assert.match(readme, /v1\.0\.1/);
  assert.match(readme, /docs\/v1\.0\.1-release-notes\.md/);
  assert.match(docsIndex, /v1\.0\.1/);
  assert.ok(fs.existsSync(notesPath), "docs/v1.0.1-release-notes.md must exist");

  const notes = fs.readFileSync(notesPath, "utf8");
  assert.match(notes, /# v1\.0\.1/);
  assert.match(hero, /v1\.0\.1/);
  assert.match(footer, /v1\.0\.1/);
});
