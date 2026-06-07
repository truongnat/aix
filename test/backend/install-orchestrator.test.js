const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runInstall } = require("../../dist/lib/backend/install-orchestrator.js");
const PACK_ROOT = path.resolve(__dirname, "..", "..");

function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "io-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

test("runInstall provisions a claude provider surface in-process (bug-fix regression)", () => {
  const dir = tmpRepo();
  const r = runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "private",
    dryRun: false,
    initHarness: true,
    installCache: true,
    force: false,
  });
  assert.equal(r.ok, true);
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")),
    true,
    "CLAUDE.md must be written"
  );
  assert.equal(fs.existsSync(path.join(dir, ".claude", "settings.json")), true);
  assert.equal(
    fs.existsSync(path.join(dir, ".harness", "HARNESS.md")),
    true,
    "harness skeleton written"
  );
  // private+project => git exclude block present
  assert.match(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /# ai-engineering-harness start/
  );
});

test("runInstall dryRun writes no provider files", () => {
  const dir = tmpRepo();
  runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "private",
    dryRun: true,
    initHarness: true,
    installCache: true,
    force: false,
  });
  assert.equal(fs.existsSync(path.join(dir, ".claude")), false);
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false);
});

test("runInstall with shared visibility writes no git exclude block", () => {
  const dir = tmpRepo();
  runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "cursor",
    scope: "project",
    visibility: "shared",
    dryRun: false,
    initHarness: false,
    installCache: false,
    force: false,
  });
  assert.equal(
    fs.existsSync(path.join(dir, ".cursor", "rules", "ai-engineering-harness.mdc")),
    true
  );
  const excl = path.join(dir, ".git", "info", "exclude");
  if (fs.existsSync(excl)) {
    assert.doesNotMatch(fs.readFileSync(excl, "utf8"), /ai-engineering-harness/);
  }
});
