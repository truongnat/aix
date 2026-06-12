const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const guardScopeScript = path.join(repoRoot, "dist", "hooks", "core", "guard-scope.js");

function makeScopeFixture() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "guard-scope-"));
  const sessionId = "scope-test";
  const sessionDir = path.join(tmpRoot, ".harness", "sessions", sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "lib"), { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, "lib", "foo.ts"), "// foo\n");
  fs.writeFileSync(path.join(tmpRoot, "lib", "bar.ts"), "// bar\n");
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "Implement lib/foo.ts only.\n");
  fs.writeFileSync(path.join(sessionDir, "PLAN-001.md"), "Modify lib/foo.ts\n");
  fs.writeFileSync(
    path.join(tmpRoot, ".harness", "STATE.md"),
    "session: sessions/scope-test\ncurrent_plan: PLAN-001.md\n"
  );
  return {
    tmpRoot,
    session: path.join(tmpRoot, ".harness", "sessions", sessionId),
    fooPath: path.join(tmpRoot, "lib", "foo.ts"),
    barPath: path.join(tmpRoot, "lib", "bar.ts"),
  };
}

function runGuardScope(tmpRoot, session, files) {
  return cp.spawnSync(
    process.execPath,
    [guardScopeScript, "--files", files, "--session", session, "--json"],
    { cwd: tmpRoot, encoding: "utf8" }
  );
}

test("guardScope reads current_plan from repo-root STATE.md without throwing", () => {
  const { tmpRoot, session, fooPath } = makeScopeFixture();
  const result = runGuardScope(tmpRoot, session, fooPath);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, true, payload.reason);
  assert.equal(payload.status, "ready");
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("guardScope blocks files outside GOAL/PLAN references", () => {
  const { tmpRoot, session, barPath } = makeScopeFixture();
  const result = runGuardScope(tmpRoot, session, barPath);
  assert.equal(result.status, 1, result.stderr || result.stdout);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.ok, false);
  assert.equal(payload.status, "blocked");
  assert.match(payload.reason, /outside approved scope/i);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
