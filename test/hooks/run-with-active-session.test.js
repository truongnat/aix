const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const wrapperScript = path.join(repoRoot, "hooks", "core", "run-with-active-session.js");
const {
  readActiveSession,
  resolveSessionPath,
} = require("../../hooks/core/run-with-active-session.js");

test("readActiveSession parses session: field from STATE.md", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-with-session-"));
  fs.mkdirSync(path.join(tmpRoot, ".harness"), { recursive: true });
  fs.writeFileSync(
    path.join(tmpRoot, ".harness", "STATE.md"),
    "session: sessions/fixture-id\ncurrent_plan: PLAN-001.md\n"
  );

  assert.equal(readActiveSession(tmpRoot), "sessions/fixture-id");
  assert.equal(resolveSessionPath("sessions/fixture-id"), ".harness/sessions/fixture-id");
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("readActiveSession still supports legacy backtick Active Session format", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-with-session-"));
  fs.mkdirSync(path.join(tmpRoot, ".harness"), { recursive: true });
  fs.writeFileSync(
    path.join(tmpRoot, ".harness", "STATE.md"),
    "## Active Session\n\n`sessions/legacy-id`\n"
  );

  assert.equal(readActiveSession(tmpRoot), "sessions/legacy-id");
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("run-with-active-session invokes hook when session field is present", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-with-session-"));
  const sessionId = "hook-test";
  const sessionDir = path.join(tmpRoot, ".harness", "sessions", sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "hooks", "core"), { recursive: true });

  for (const file of fs.readdirSync(path.join(repoRoot, "hooks", "core"))) {
    if (file.endsWith(".js")) {
      fs.copyFileSync(
        path.join(repoRoot, "hooks", "core", file),
        path.join(tmpRoot, "hooks", "core", file)
      );
    }
  }

  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), `session: sessions/${sessionId}\n`);
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "# Goal\n");

  const result = cp.spawnSync(
    process.execPath,
    [wrapperScript, "guard-phase", "--command", "harness-run", "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );

  assert.notEqual(result.status, 0, "wrapper should run guard-phase, not skip silently");
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("run-with-active-session skips silently when no session in STATE", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-with-session-"));
  fs.mkdirSync(path.join(tmpRoot, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), "current_goal: none\n");

  const result = cp.spawnSync(
    process.execPath,
    [wrapperScript, "guard-phase", "--command", "harness-run", "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );

  assert.equal(result.status, 0);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
