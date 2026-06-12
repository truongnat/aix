const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { cleanupWorkspace, materializeFixture } = require(
  path.join(repoRoot, "dist", "features", "eval", "infrastructure", "fixture-manager.js")
);

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
  cleanupWorkspace(workspace);
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

test("cleanupWorkspace removes the temp root recursively", () => {
  const workspace = materializeFixture(repoRoot, {
    id: "sample-bugfix",
    fixture: { path: "evals/fixtures/sample-bugfix" },
  });

  assert.ok(fs.existsSync(workspace.root));
  cleanupWorkspace(workspace);
  assert.equal(fs.existsSync(workspace.root), false);
});

test(
  "materializeFixture preserves file symlinks when the platform supports them",
  { skip: process.platform === "win32" },
  () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-fixture-links-"));
    const sourceDir = path.join(fixtureRoot, "fixture");
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, "original.txt"), "hello\n", "utf8");
    fs.symlinkSync("original.txt", path.join(sourceDir, "linked.txt"));

    const workspace = materializeFixture(fixtureRoot, {
      id: "symlink-task",
      fixture: { path: "fixture" },
    });

    const linkedCopy = path.join(workspace.cwd, "linked.txt");
    assert.equal(fs.lstatSync(linkedCopy).isSymbolicLink(), true);
    assert.equal(fs.readlinkSync(linkedCopy), "original.txt");

    cleanupWorkspace(workspace);
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
);
