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

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "io-ng-"));
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
  assert.equal(fs.existsSync(path.join(dir, ".harness", "policies.json")), true);
  const settings = JSON.parse(fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf8"));
  assert.match(settings.hooks.PreToolUse[0].hooks[0].command, /hooks\/core\/guard-phase\.js/);
  assert.match(
    settings.hooks.PostToolUse[0].hooks[0].command,
    /hooks\/core\/record-tool-output\.js/
  );
  assert.match(
    settings.hooks.SubagentStop[0].hooks[0].command,
    /hooks\/core\/record-subagent-result\.js/
  );
  assert.match(settings.hooks.Stop[0].hooks[0].command, /compact-session-memory\.js/);
  // private+project => git exclude block present
  assert.match(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /# ai-engineering-harness start/
  );
});

test("runInstall hard-stops on non-git project installs before writing", () => {
  const dir = tmpDir();
  const r = runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "shared",
    dryRun: false,
    initHarness: true,
    installCache: true,
    force: false,
  });
  assert.equal(r.ok, false);
  assert.match(r.messages.join(" "), /Git repo/);
  assert.equal(fs.existsSync(path.join(dir, ".claude")), false);
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false);
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), false);
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
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), false);
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
  assert.equal(fs.existsSync(path.join(dir, "rules")), false);
  const excl = path.join(dir, ".git", "info", "exclude");
  if (fs.existsSync(excl)) {
    assert.doesNotMatch(fs.readFileSync(excl, "utf8"), /ai-engineering-harness/);
  }
});

test("runInstall uses the manual fallback as a project-local AGENTS install", () => {
  const dir = tmpRepo();
  const r = runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "manual",
    scope: "project",
    visibility: "private",
    dryRun: false,
    initHarness: true,
    installCache: false,
    force: false,
  });
  assert.equal(r.ok, true);
  assert.equal(fs.existsSync(path.join(dir, "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(dir, ".harness", "HARNESS.md")), true);
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), false);
  assert.match(r.messages.join("\n"), /runtime-native\(manual\): ok/);
});
