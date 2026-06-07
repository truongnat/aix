const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runUninstall } = require("../../dist/lib/backend/uninstall.js");

function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "un-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

test("claude uninstall removes always-owned files, keeps settings.json", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".claude", "commands"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "anything\n"); // ownership always -> removed regardless of content
  fs.writeFileSync(path.join(dir, ".claude", "settings.json"), "{}\n"); // claude-settings -> kept
  fs.writeFileSync(path.join(dir, ".claude", "commands", "harness-plan.md"), "x\n");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")),
    false,
    "CLAUDE.md removed (always)"
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "settings.json")),
    true,
    "settings.json kept"
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "commands")),
    false,
    "commands dir removed (always)"
  );
});

test("AGENTS.md removed only when it contains the harness marker (codex provider)", () => {
  const owned = tmpRepo();
  fs.writeFileSync(path.join(owned, "AGENTS.md"), "# ai-engineering-harness\n");
  runUninstall({
    targetAbs: owned,
    provider: "codex",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(owned, "AGENTS.md")), false, "marker AGENTS.md removed");

  const foreign = tmpRepo();
  fs.writeFileSync(path.join(foreign, "AGENTS.md"), "my own agents file\n");
  runUninstall({
    targetAbs: foreign,
    provider: "codex",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(foreign, "AGENTS.md")), true, "non-marker AGENTS.md kept");
});

test("cache/state dirs kept unless requested; all=true removes both", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".ai-harness"));
  fs.mkdirSync(path.join(dir, ".harness"));
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), true, "cache kept by default");
  assert.equal(fs.existsSync(path.join(dir, ".harness")), true, "state kept by default");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: true,
  });
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), false, "cache removed with all");
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false, "state removed with all");
});

test("dryRun removes nothing", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "CLAUDE.md"), "x\n");
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: true,
    removeCache: true,
    removeState: true,
    all: true,
  });
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), true);
});

test("uninstall strips the git exclude harness block", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".git", "info", "exclude"),
    "x/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n"
  );
  runUninstall({
    targetAbs: dir,
    provider: "claude",
    scope: "project",
    dryRun: false,
    removeCache: false,
    removeState: false,
    all: false,
  });
  assert.doesNotMatch(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /ai-engineering-harness/
  );
});
