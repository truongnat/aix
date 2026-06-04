const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const validateApi = require(path.join(repoRoot, "validate.js"));
const installApi = require(path.join(repoRoot, "install.js"));
const installCacheApi = require(path.join(repoRoot, "install-cache.js"));

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack);
    process.exitCode = 1;
  }
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-test-"));
}

function runNode(args, options = {}) {
  return childProcess.spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 30000,
    ...options
  });
}

runTest("validate repository passes", () => {
  const failures = validateApi.validateRepository(repoRoot);
  assert.deepEqual(failures, []);
});

runTest("parseValidateArgs supports repository, profile, and goal modes", () => {
  assert.equal(validateApi.parseValidateArgs([]).mode, "harness-repository");
  assert.equal(validateApi.parseValidateArgs(["--target", "../demo"]).mode, "target-profile");
  const goal = validateApi.parseValidateArgs(["--target", "../demo", "--goal", "health-check"]);
  assert.equal(goal.mode, "target-goal");
  assert.equal(goal.goalId, "health-check");
});

runTest("validate target profile fixture passes", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-profile");
  assert.deepEqual(validateApi.validateTargetProfile(fixture), []);
});

runTest("validate target goal fixture passes", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-goal");
  assert.deepEqual(validateApi.validateTargetGoal(fixture, "google-login"), []);
});

runTest("invalid target profile fixture fails", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-profile");
  assert.notEqual(validateApi.validateTargetProfile(fixture).length, 0);
});

runTest("invalid target goal fixture fails", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-goal");
  assert.notEqual(validateApi.validateTargetGoal(fixture, "google-login").length, 0);
});

runTest("discover-tools JSON mode exits cleanly with expected keys", () => {
  const result = runNode([path.join(repoRoot, "scripts", "discover-tools.js")]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  for (const key of [
    "git",
    "gitWorktree",
    "rg",
    "gitGrep",
    "grep",
    "find",
    "markitdown",
    "joern",
    "sourcegraph",
    "repograph",
    "gitNexus"
  ]) {
    assert.ok(Object.prototype.hasOwnProperty.call(parsed, key), `missing key ${key}`);
    assert.equal(typeof parsed[key].available, "boolean");
  }
});

runTest("discover-tools markdown mode exits cleanly", () => {
  const result = runNode([path.join(repoRoot, "scripts", "discover-tools.js"), "--markdown"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Tool Context/);
  assert.match(result.stdout, /Routing/);
});

runTest("tool capability files include required headings", () => {
  const headings = [
    "## Purpose",
    "## Detect",
    "## Use When",
    "## Do Not Use When",
    "## Example Commands",
    "## Fallback"
  ];
  for (const fileName of [
    "git.md",
    "grep-ripgrep.md",
    "git-worktree.md",
    "markitdown.md",
    "code-graph.md",
    "git-nexus.md"
  ]) {
    const text = fs.readFileSync(
      path.join(repoRoot, "tool-capabilities", "tools", fileName),
      "utf8"
    );
    for (const heading of headings) {
      assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
});

runTest("tool routing docs define expected capabilities", () => {
  const text = fs.readFileSync(
    path.join(repoRoot, "tool-capabilities", "TOOL_ROUTING.md"),
    "utf8"
  );
  for (const capability of [
    "code-search",
    "diff-review",
    "history-review",
    "parallel-work",
    "document-to-markdown",
    "repo-structure",
    "dependency-scan"
  ]) {
    assert.match(text, new RegExp(capability));
  }
});

runTest("session memory templates exist", () => {
  for (const relativePath of [
    "templates/INDEX.md",
    "templates/STATE.md",
    "templates/MEMORY.md",
    "templates/TOOL_CONTEXT.md",
    "templates/SESSION.md",
    "templates/GOAL.md",
    "templates/DISCUSSION.md",
    "templates/PLAN.md",
    "templates/TASKS.md",
    "templates/VERIFY.md",
    "templates/SHIP.md",
    "templates/REMEMBER.md",
    "templates/BLOCKED.md",
    "templates/NOTES.md",
    "templates/DECISION.md",
    "templates/HAZARD.md",
    "templates/harness-config.json"
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
});

runTest("session memory docs exist", () => {
  for (const relativePath of [
    "docs/session-memory.md",
    "docs/memory-migration.md"
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
});

runTest("session memory config template parses as JSON", () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "templates", "harness-config.json"), "utf8")
  );
  assert.equal(config.memory.backend, "files");
  assert.equal(config.memory.sourceOfTruth, "files");
});

runTest("session memory docs say files are source of truth", () => {
  const sessionDoc = fs.readFileSync(path.join(repoRoot, "docs", "session-memory.md"), "utf8");
  const migrationDoc = fs.readFileSync(path.join(repoRoot, "docs", "memory-migration.md"), "utf8");
  assert.match(sessionDoc, /files are the source of truth/i);
  assert.match(sessionDoc, /root `?\.harness`? is an index and router/i);
  assert.match(sessionDoc, /sessions own working artifacts/i);
  assert.match(migrationDoc, /legacy/i);
  assert.match(migrationDoc, /preserve/i);
});

runTest("workflow command docs route through STATE and active sessions", () => {
  for (const fileName of [
    "harness-start.md",
    "harness-map.md",
    "harness-plan.md",
    "harness-run.md",
    "harness-verify.md",
    "harness-ship.md"
  ]) {
    const text = fs.readFileSync(path.join(repoRoot, "commands", fileName), "utf8");
    assert.match(text, /\.harness\/STATE\.md/);
    assert.match(text, /sessions\/<active-session>|active session/i);
  }
});

runTest("workflow command docs include tool discovery and routing guidance", () => {
  for (const fileName of [
    "harness-map.md",
    "harness-plan.md",
    "harness-run.md",
    "harness-verify.md",
    "harness-ship.md"
  ]) {
    const text = fs.readFileSync(path.join(repoRoot, "commands", fileName), "utf8");
    assert.match(text, /## Tool Discovery/);
    assert.match(text, /## Tool Routing/);
  }
});

runTest("prompt templates include tool discovery and routing guidance", () => {
  for (const fileName of [
    "harness-plan.md",
    "harness-run.md",
    "harness-verify.md",
    "harness-ship.md",
    "code-reviewer.md"
  ]) {
    const text = fs.readFileSync(path.join(repoRoot, "prompt-templates", fileName), "utf8");
    assert.match(text, /### Tool Discovery/);
    assert.match(text, /### Tool Routing/);
  }
});

runTest("install surface includes tool discovery assets and excludes harness-build docs", () => {
  assert.ok(installApi.exportPaths.includes("docs/tool-discovery-and-routing.md"));
  assert.ok(installCacheApi.cacheExportPaths.includes("tool-capabilities"));
  assert.ok(installCacheApi.cacheExportPaths.includes("scripts/discover-tools.js"));
  assert.equal(installApi.exportPaths.includes("docs/harness-build-usage.md"), false);
});

runTest("install cache dry-run includes tool assets", () => {
  const target = makeTempDir();
  const results = installCacheApi.installCapabilityCache({
    packRoot: repoRoot,
    target,
    dryRun: true,
    force: false
  });
  assert.ok(results.some((entry) => /tool-capabilities/.test(entry.relativePath)));
  assert.ok(results.some((entry) => /scripts\/discover-tools\.js/.test(entry.relativePath)));
});

runTest("install next steps no longer mention harness-build", () => {
  const text = installApi.formatNextSteps({
    target: path.resolve("/tmp/example"),
    targetDisplay: "../example",
    dryRun: false
  });
  assert.doesNotMatch(text, /harness-build/i);
  assert.match(text, /adoption-guide/i);
});

runTest("package publishes tool capability assets", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(pkg.files.includes("tool-capabilities/"));
  assert.ok(pkg.files.includes("scripts/discover-tools.js"));
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
