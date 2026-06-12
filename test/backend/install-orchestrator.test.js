const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runInstall } = require("../../dist/features/install/application/run-install.js");
const PACK_ROOT = path.resolve(__dirname, "..", "..");

function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "io-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "io-ng-"));
}

function captureConsole(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;
  const lines = [];
  const captureWrite = (chunk) => {
    const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
    lines.push(text);
    return true;
  };

  console.log = (...args) => {
    lines.push(args.join(" "));
  };
  console.error = (...args) => {
    lines.push(args.join(" "));
  };
  process.stdout.write = captureWrite;
  process.stderr.write = captureWrite;

  try {
    const result = fn();
    return { result, lines };
  } finally {
    console.log = originalLog;
    console.error = originalError;
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
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
  assert.equal(fs.existsSync(path.join(dir, ".claude", "agents")), true);
  assert.equal(fs.existsSync(path.join(dir, ".claude", "skills")), true);
  assert.equal(
    fs.existsSync(path.join(dir, ".harness", "HARNESS.md")),
    true,
    "harness skeleton written"
  );
  assert.equal(fs.existsSync(path.join(dir, ".harness", "policies.json")), true);
  const settings = JSON.parse(fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf8"));
  assert.match(
    settings.hooks.PreToolUse[0].hooks[0].command,
    /\.ai-harness\/hooks\/core\/guard-phase\.js/
  );
  assert.match(
    settings.hooks.PostToolUse[0].hooks[0].command,
    /\.ai-harness\/hooks\/core\/record-tool-output\.js/
  );
  assert.match(
    settings.hooks.SubagentStop[0].hooks[0].command,
    /\.ai-harness\/hooks\/core\/record-subagent-result\.js/
  );
  assert.match(
    settings.hooks.Stop[0].hooks[0].command,
    /\.ai-harness\/hooks\/core\/compact-session-memory\.js/
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "skills", "using-harness", "SKILL.md")),
    true
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".claude", "skills", "verification", "SKILL.md")),
    true
  );
  // private+project => git exclude block present
  assert.match(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /# ai-engineering-harness start/
  );
});

test("runInstall provisions codex skills in .agents/skills", () => {
  const dir = tmpRepo();
  const r = runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "codex",
    scope: "project",
    visibility: "private",
    dryRun: false,
    initHarness: false,
    installCache: false,
    force: false,
  });
  assert.equal(r.ok, true);
  const skillsRoot = path.join(dir, ".agents", "skills");
  assert.equal(fs.existsSync(skillsRoot), true);
  const skillDirs = fs
    .readdirSync(skillsRoot)
    .filter((entry) => fs.statSync(path.join(skillsRoot, entry)).isDirectory());
  assert.ok(skillDirs.length > 0, "at least one Codex skill directory should be written");
  const verificationSkill = path.join(skillsRoot, "verification", "SKILL.md");
  assert.equal(fs.existsSync(verificationSkill), true);
  const content = fs.readFileSync(verificationSkill, "utf8");
  assert.match(content, /^---\n/m);
  assert.match(content, /name:\s*"?verification"?/i);
  assert.match(content, /description:/i);
  assert.equal(fs.existsSync(path.join(skillsRoot, "verification", "agents", "openai.yaml")), true);
  assert.match(
    fs.readFileSync(path.join(skillsRoot, "verification", "agents", "openai.yaml"), "utf8"),
    /display_name:/i
  );
});

test("runInstall provisions codex native hooks, rules, and agents", () => {
  const dir = tmpRepo();
  const { result: r, lines } = captureConsole(() =>
    runInstall({
      packRoot: PACK_ROOT,
      target: dir,
      provider: "codex",
      scope: "project",
      visibility: "private",
      dryRun: false,
      initHarness: false,
      installCache: false,
      force: false,
    })
  );
  assert.equal(r.ok, true);
  assert.equal(fs.existsSync(path.join(dir, ".codex", "hooks.json")), true);
  assert.equal(fs.existsSync(path.join(dir, ".codex", "rules", "default.rules")), true);
  assert.equal(fs.existsSync(path.join(dir, ".codex", "agents", "explorer.toml")), true);
  assert.equal(fs.existsSync(path.join(dir, ".codex-plugin", "plugin.json")), false);
  const hooksJson = JSON.parse(fs.readFileSync(path.join(dir, ".codex", "hooks.json"), "utf8"));
  assert.equal(typeof hooksJson.hooks, "object");
  assert.ok(hooksJson.hooks.SessionStart.length > 0);
  assert.ok(hooksJson.hooks.PermissionRequest.length > 0);
  assert.match(hooksJson.hooks.PostToolUse[0].hooks[0].command, /codex-hook-router\.js/);
  assert.match(
    fs.readFileSync(path.join(dir, ".codex", "rules", "default.rules"), "utf8"),
    /pattern = \["git","status"\]/
  );
  assert.match(
    fs.readFileSync(path.join(dir, ".codex", "rules", "default.rules"), "utf8"),
    /decision = "forbidden"/
  );
  assert.doesNotMatch(
    fs.readFileSync(path.join(dir, ".codex", "rules", "default.rules"), "utf8"),
    /prefixes\s*=|action\s*=|message\s*=/
  );
  assert.ok(
    lines.some((line) => /Trust \.codex\/ in Codex|\/harness-\* slash commands/i.test(line))
  );
  assert.ok(lines.some((line) => /restart the app|UserPromptSubmit hook/i.test(line)));
});

test("runInstall on a non-git project prepares private git exclude setup for future git init", () => {
  const dir = tmpDir();
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
  assert.equal(fs.existsSync(path.join(dir, ".claude", "CLAUDE.md")), true);
  assert.equal(fs.existsSync(path.join(dir, ".harness", "HARNESS.md")), true);
  assert.equal(fs.existsSync(path.join(dir, ".ai-harness")), true);
  assert.equal(fs.existsSync(path.join(dir, ".git", "info", "exclude")), true);
  assert.match(
    fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8"),
    /# ai-engineering-harness start/
  );
  assert.equal(cp.spawnSync("git", ["status", "--short"], { cwd: dir }).status, 128);
  assert.equal(cp.spawnSync("git", ["init", "-q"], { cwd: dir }).status, 0);
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
