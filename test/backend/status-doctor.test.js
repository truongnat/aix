const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runStatus, runDoctor } = require("../../dist/lib/backend/status-doctor.js");
const PACK_ROOT = path.resolve(__dirname, "..", "..");

function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sd-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

function installClaude(dir) {
  require("../../dist/lib/backend/install-orchestrator.js").runInstall({
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
}

test("runStatus reports the status header and key fields", () => {
  const dir = tmpRepo();
  installClaude(dir);
  const { text } = runStatus({ targetAbs: dir });
  assert.match(text, /ai-engineering-harness status/);
  assert.match(text, /git repo:\s+yes/);
  assert.match(text, /\.ai-harness exists:\s+yes/); // install bug now fixed -> yes
  assert.match(text, /\.harness exists:\s+yes/);
});

test("runDoctor passes core checks on a freshly installed repo", () => {
  const dir = tmpRepo();
  installClaude(dir);
  const { text, ok } = runDoctor({ targetAbs: dir });
  assert.match(text, /ai-engineering-harness doctor/);
  assert.match(text, /PASS node available/);
  assert.match(text, /PASS target is a Git repo/);
  assert.match(text, /PASS \.ai-harness exists/);
  assert.match(text, /PASS \.harness exists/);
  assert.equal(typeof ok, "boolean");
});

test("runDoctor flags failures on an empty (non-installed) repo", () => {
  const dir = tmpRepo();
  const { text, ok } = runDoctor({ targetAbs: dir });
  assert.match(text, /FAIL \.ai-harness missing/);
  assert.equal(ok, false);
});
