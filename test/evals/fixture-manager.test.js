const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { materializeFixture } = require(path.join(repoRoot, "lib", "evals", "fixture-manager.js"));

test("materializeFixture copies a fixture into an isolated temp workspace", () => {
  const workspace = materializeFixture(repoRoot, {
    id: "sample-bugfix",
    fixture: { path: "evals/fixtures/sample-bugfix" },
  });

  assert.equal(typeof workspace.cwd, "string");
  assert.equal(typeof workspace.root, "string");
  assert.equal(typeof workspace.sourceDir, "string");
  assert.match(workspace.root, /aih-eval-/);
  assert.equal(workspace.cwd, path.join(workspace.root, "sample-bugfix"));
  assert.equal(workspace.sourceDir, path.join(repoRoot, "evals", "fixtures", "sample-bugfix"));

  assert.ok(fs.existsSync(path.join(workspace.cwd, "package.json")));
  assert.ok(fs.existsSync(path.join(workspace.cwd, "src", "math.js")));
  assert.ok(fs.existsSync(path.join(workspace.cwd, "checks", "math-check.js")));

  const copiedFile = path.join(workspace.cwd, "src", "math.js");
  const sourceFile = path.join(workspace.sourceDir, "src", "math.js");
  fs.writeFileSync(copiedFile, '"use strict";\n');

  assert.notEqual(fs.readFileSync(copiedFile, "utf8"), fs.readFileSync(sourceFile, "utf8"));
});

test("materializeFixture rejects task ids that escape the temp root", () => {
  assert.throws(
    () =>
      materializeFixture(repoRoot, {
        id: "../escaped-workspace",
        fixture: { path: "evals/fixtures/sample-bugfix" },
      }),
    /Task workspace must stay within temp root/
  );
});

test("materializeFixture rejects fixture paths that escape packRoot", () => {
  assert.throws(
    () =>
      materializeFixture(repoRoot, {
        id: "sample-bugfix",
        fixture: { path: "../outside-fixture" },
      }),
    /Fixture source must stay within packRoot/
  );
});
