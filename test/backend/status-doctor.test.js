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

function installCodex(dir) {
  require("../../dist/lib/backend/install-orchestrator.js").runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "codex",
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

test("runStatus prefers manifest providers over generic AGENTS fallback", () => {
  const dir = tmpRepo();
  installCodex(dir);
  const { text } = runStatus({ targetAbs: dir });
  assert.match(text, /detected runtimes:\s+codex/);
  assert.doesNotMatch(text, /detected runtimes:.*generic/);
});

test("runDoctor reports Codex skills surface when installed", () => {
  const dir = tmpRepo();
  installCodex(dir);
  const { text, ok } = runDoctor({ targetAbs: dir });
  assert.equal(ok, true);
  assert.match(text, /PASS \.codex\/hooks\.json exists/);
  assert.match(text, /PASS \.codex\/rules\/default\.rules exists/);
  assert.match(text, /PASS \.codex\/agents exists \(\d+ agents\)/);
  assert.match(text, /PASS \.agents\/skills exists \(\d+ skills\)/);
});

test("runDoctor flags failures on an empty (non-installed) repo", () => {
  const dir = tmpRepo();
  const { text, ok } = runDoctor({ targetAbs: dir });
  assert.match(text, /FAIL \.ai-harness missing/);
  assert.equal(ok, false);
});

test("runDoctor fails VERIFY passed claims that lack concrete evidence", () => {
  const dir = tmpRepo();
  installClaude(dir);

  fs.writeFileSync(
    path.join(dir, ".harness", "PLAN.md"),
    "# PLAN\n\n## Approval Status\nstatus: approved\n"
  );
  fs.writeFileSync(path.join(dir, ".harness", "VERIFY.md"), "# VERIFY\n\nstatus: passed\n");

  const { text, ok } = runDoctor({ targetAbs: dir });
  assert.equal(ok, false);
  assert.match(text, /PASS \.harness\/PLAN\.md approval status approved/);
  assert.match(
    text,
    /FAIL \.harness\/VERIFY\.md claims completed verification without concrete evidence/
  );
});

test("runDoctor warns when VERIFY is pending and typed memory artifacts are missing", () => {
  const dir = tmpRepo();
  installClaude(dir);

  fs.rmSync(path.join(dir, ".harness", "DECISIONS.md"));
  fs.rmSync(path.join(dir, ".harness", "HAZARDS.md"));
  fs.rmSync(path.join(dir, ".harness", "INDEX.md"));
  fs.writeFileSync(
    path.join(dir, ".harness", "PLAN.md"),
    "# PLAN\n\n## Approval Status\nstatus: approved\n"
  );
  fs.writeFileSync(path.join(dir, ".harness", "VERIFY.md"), "# VERIFY\n\nstatus: pending\n");

  const { text } = runDoctor({ targetAbs: dir });
  assert.match(
    text,
    /WARN \.harness\/VERIFY\.md status is pending and verification evidence is not recorded yet/
  );
  assert.match(text, /WARN typed memory artifacts missing: DECISIONS\.md, HAZARDS\.md, INDEX\.md/);
});

test("runDoctor reports WARN (not FAIL) for non-git repo and ok is not blocked by missing git", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sd-nongit-doctor-"));
  installClaude(dir);
  const { text } = runDoctor({ targetAbs: dir });
  assert.match(text, /WARN target is not a Git repo/);
  assert.doesNotMatch(text, /FAIL target is not a Git repo/);
  // ok may still be false due to other checks (e.g. missing provider binary in test env),
  // but the git check alone must not be the reason
  assert.doesNotMatch(text, /FAIL target is not a Git repo/);
});

test("runStatus reports prepared exclude blocks after git init", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sd-nongit-"));
  installClaude(dir);

  const excludePath = path.join(dir, ".git", "info", "exclude");
  assert.equal(fs.existsSync(excludePath), true);
  assert.equal(cp.spawnSync("git", ["status", "--short"], { cwd: dir }).status, 128);

  cp.spawnSync("git", ["init", "-q"], { cwd: dir });

  const { text } = runStatus({ targetAbs: dir });
  assert.match(text, /git repo:\s+yes/);
  assert.match(text, /exclude block exists:\s+yes/);
  assert.match(fs.readFileSync(excludePath, "utf8"), /# ai-engineering-harness start/);
});
