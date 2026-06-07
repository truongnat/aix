const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const guardPhaseScript = path.join(repoRoot, "hooks", "core", "guard-phase.js");

test("guard-phase.js uses the policy engine when policies are provisioned", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "guard-phase-"));
  fs.mkdirSync(path.join(tmpRoot, ".harness", "sessions", "s1"), { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), "current_goal: demo\n");
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
