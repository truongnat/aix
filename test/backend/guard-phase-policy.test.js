const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const guardPhaseScript = path.join(repoRoot, "dist", "hooks", "core", "guard-phase.js");

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function makeHarnessFixture() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "guard-phase-"));
  const sessionDir = path.join(tmpRoot, ".harness", "sessions", "s1");
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), "current_goal: demo\n");
  return { tmpRoot, sessionDir };
}

test("guard-phase.js uses the policy engine when policies are provisioned", () => {
  const { tmpRoot } = makeHarnessFixture();
  fs.writeFileSync(
    path.join(tmpRoot, ".harness", "policies.json"),
    fs.readFileSync(path.join(repoRoot, ".harness", "policies.json"), "utf8")
  );

  const result = cp.spawnSync(
    process.execPath,
    [guardPhaseScript, "--command", "harness-run", "--session", ".harness/sessions/s1", "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );

  assert.equal(result.status, 1, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, false);
  assert.equal(payload.status, "blocked");
  assert.match(payload.reason, /Plan must be approved/);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("guard-phase.js blocks harness-ship via the policy engine when verification is not approved", () => {
  const { tmpRoot } = makeHarnessFixture();
  fs.writeFileSync(
    path.join(tmpRoot, ".harness", "policies.json"),
    fs.readFileSync(path.join(repoRoot, ".harness", "policies.json"), "utf8")
  );

  const result = cp.spawnSync(
    process.execPath,
    [guardPhaseScript, "--command", "harness-ship", "--session", ".harness/sessions/s1", "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );

  assert.equal(result.status, 1, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, false);
  assert.equal(payload.status, "blocked");
  assert.equal(payload.nextCommand, "harness-verify");
  assert.match(payload.reason, /Verification must be completed and approved before shipping/);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("guard-phase.js surfaces warning actions from the policy engine", () => {
  const { tmpRoot, sessionDir } = makeHarnessFixture();
  fs.writeFileSync(path.join(sessionDir, "PLAN-001.md"), "# Plan\nstatus: approved\n");
  writeJson(path.join(tmpRoot, ".harness", "policies.json"), {
    version: "1.0.0",
    rules: [
      {
        id: "warn-on-run",
        name: "Warn on run",
        description: "surface a warning without blocking",
        severity: "warning",
        conditions: [{ type: "command", operator: "equals", value: "harness-run" }],
        action: { type: "warn", message: "Scope changed since plan approval" },
      },
    ],
  });

  const result = cp.spawnSync(
    process.execPath,
    [guardPhaseScript, "--command", "harness-run", "--session", ".harness/sessions/s1", "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true);
  assert.equal(payload.status, "ready");
  assert.deepEqual(payload.warnings, ["Scope changed since plan approval"]);
  assert.match(payload.summary, /ready with warnings/i);

  const eventsPath = path.join(tmpRoot, ".harness", "history", "events.jsonl");
  const lines = fs.readFileSync(eventsPath, "utf8").trim().split("\n");
  const lastEvent = JSON.parse(lines.at(-1));
  assert.deepEqual(lastEvent.warnings, ["Scope changed since plan approval"]);

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
