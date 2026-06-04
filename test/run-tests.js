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
  assert.deepEqual(validateApi.validateTargetGoal(fixture, "2026-06-04-google-login"), []);
});

runTest("invalid target profile fixture fails", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-profile");
  assert.notEqual(validateApi.validateTargetProfile(fixture).length, 0);
});

runTest("invalid target goal fixture fails", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-goal");
  const failures = validateApi.validateTargetGoal(fixture, "2026-06-04-google-login");
  assert.notEqual(failures.length, 0);
  assert.match(failures.join("\n"), /PLAN-404\.md|STATE\.md/);
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
    "codegraph",
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
  assert.ok(pkg.files.includes("workers/"));
});

runTest("delegated worker repository surface exists", () => {
  for (const relativePath of [
    "workers/registry.js",
    "workers/reviewer.md",
    "workers/verifier.md",
    "workers/gatekeeper.md",
    "workers/fixer.md",
    "templates/WORKER_RUN.md",
    "docs/delegated-workers.md"
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
});

runTest("worker registry exports canonical v1 workers", () => {
  const registry = require(path.join(repoRoot, "workers", "registry.js"));
  assert.deepEqual([...registry.WORKER_IDS], ["reviewer", "verifier", "gatekeeper", "fixer"]);
  assert.equal(registry.workers.length, 4);
  for (const worker of registry.workers) {
    assert.equal(worker.canDispatch, false);
    assert.equal(worker.resultSchema, "agent-result-v1");
  }
  const fixer = registry.getWorkerById("fixer");
  assert.equal(fixer.writeAccess, "write");
  for (const id of ["reviewer", "verifier", "gatekeeper"]) {
    assert.equal(registry.getWorkerById(id).writeAccess, "none");
  }
});

runTest("worker definitions include frontmatter and agent result envelope", () => {
  const { parseFrontmatter } = require(path.join(repoRoot, "lib", "validate", "utils.js"));
  for (const workerId of ["reviewer", "verifier", "gatekeeper", "fixer"]) {
    const text = fs.readFileSync(path.join(repoRoot, "workers", `${workerId}.md`), "utf8");
    const frontmatter = parseFrontmatter(text);
    assert.ok(frontmatter, `${workerId}.md must include frontmatter`);
    for (const field of [
      "id",
      "role",
      "mode",
      "writeAccess",
      "canDispatch",
      "resultSchema"
    ]) {
      assert.ok(frontmatter[field], `${workerId}.md frontmatter must include ${field}`);
    }
    assert.ok(Array.isArray(frontmatter.requiredInputs) && frontmatter.requiredInputs.length > 0);
    assert.equal(String(frontmatter.canDispatch), "false");
    assert.match(text, /### Agent Result/);
  }
});

runTest("worker provider support values are valid", () => {
  const registry = require(path.join(repoRoot, "workers", "registry.js"));
  for (const worker of registry.workers) {
    for (const value of Object.values(worker.providerSupport)) {
      assert.ok(registry.VALID_PROVIDER_SUPPORT.includes(value), `invalid support value: ${value}`);
    }
    assert.equal(worker.providerSupport.claude, "native");
    assert.equal(worker.providerSupport.cursor, "adapter");
    assert.equal(worker.providerSupport.codex, "adapter");
  }
});

runTest("command docs reference delegated worker contract", () => {
  const verify = fs.readFileSync(path.join(repoRoot, "commands", "harness-verify.md"), "utf8");
  const ship = fs.readFileSync(path.join(repoRoot, "commands", "harness-ship.md"), "utf8");
  const run = fs.readFileSync(path.join(repoRoot, "commands", "harness-run.md"), "utf8");
  assert.match(verify, /reviewer/);
  assert.match(verify, /verifier/);
  assert.match(verify, /WORKER_RUN|worker contract|delegated worker/i);
  assert.match(ship, /gatekeeper/);
  assert.match(run, /fixer/);
});

runTest("claude worker adapter renders native agent files", () => {
  const { renderClaudeAgentFile } = require(path.join(repoRoot, "lib", "worker-claude-adapter.js"));
  const body = fs.readFileSync(path.join(repoRoot, "workers", "reviewer.md"), "utf8").replace(/^---[\s\S]*?---\s*/, "");
  const rendered = renderClaudeAgentFile("reviewer", body);
  assert.match(rendered, /^---\nname: harness-reviewer/);
  assert.match(rendered, /tools: Read, Grep, Glob, Bash/);
  assert.match(rendered, /### Agent Result/);
});

runTest("delegated workers doc describes support levels honestly", () => {
  const text = fs.readFileSync(path.join(repoRoot, "docs", "delegated-workers.md"), "utf8");
  for (const level of ["native", "adapter", "fallback", "unsupported"]) {
    assert.match(text, new RegExp(level));
  }
  assert.match(text, /Claude.*native|native.*Claude/i);
  assert.match(text, /Cursor.*adapter|adapter.*Cursor/i);
  assert.match(text, /Codex.*adapter|adapter.*Codex/i);
});

runTest("provider rule renderer composes core fragments for each provider", () => {
  const renderer = require(path.join(repoRoot, "lib", "provider-rule-renderer.js"));
  const samples = [
    [".claude/CLAUDE.md", renderer.renderClaudeProjectMd()],
    [".cursor/rules/ai-engineering-harness.mdc", renderer.renderCursorActivationMdc()],
    [".cursor/rules/ai-engineering-harness-commands.mdc", renderer.renderCursorCommandsMdc()],
    ["AGENTS.md", renderer.renderCodexAgentsMd()],
    [".gemini/extensions/ai-engineering-harness/GEMINI.md", renderer.renderGeminiMd()]
  ];
  const failures = [];
  for (const [relativePath, content] of samples) {
    renderer.assertProviderRuleContent(relativePath, content, failures);
    assert.match(content, /harness-plan/);
  }
  assert.deepEqual(failures, []);
});

runTest("provider rule adapters declare honest native slash support", () => {
  const { PROVIDER_RULE_ADAPTERS } = require(path.join(repoRoot, "lib", "provider-rule-renderer.js"));
  assert.equal(PROVIDER_RULE_ADAPTERS.claude.nativeSlashCommands, true);
  assert.equal(PROVIDER_RULE_ADAPTERS.claude.supportsSubagents, true);
  assert.equal(PROVIDER_RULE_ADAPTERS.cursor.nativeSlashCommands, false);
  assert.equal(PROVIDER_RULE_ADAPTERS.codex.nativeSlashCommands, false);
  assert.equal(PROVIDER_RULE_ADAPTERS.gemini.nativeSlashCommands, false);
});

runTest("provider command support merges rule adapter metadata", () => {
  const { providerCommandSupport } = require(path.join(repoRoot, "lib", "runtime-command-catalog.js"));
  const claude = providerCommandSupport("claude");
  const cursor = providerCommandSupport("cursor");
  assert.equal(claude.nativeSlashCommands, true);
  assert.ok(Array.isArray(claude.ruleEntrypoints));
  assert.match(claude.ruleEntrypoints.join(" "), /\.claude\/agents/);
  assert.equal(cursor.nativeSlashCommands, false);
  assert.match(cursor.ruleEntrypoints.join(" "), /guardrails/);
});

runTest("hooks and skills layer surface exists", () => {
  for (const relativePath of [
    "hooks/README.md",
    "hooks/core/guard-phase.js",
    "hooks/core/record-tool-output.js",
    "hooks/core/record-subagent-result.js",
    "hooks/core/compact-session-memory.js",
    "hooks/core/record-skill-run.js",
    "hooks/core/archive-session-skill.js",
    "docs/hooks-and-skills-layer.md",
    "docs/skill-lifecycle.md",
    "workflows/create-skill.md",
    "workflows/compose-skills.md",
    "workflows/review-and-verify.md",
    "templates/SKILL_DISPOSAL.md"
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
});

runTest("hook scripts support --help", () => {
  for (const script of [
    "hooks/core/guard-phase.js",
    "hooks/core/record-tool-output.js",
    "hooks/core/record-subagent-result.js",
    "hooks/core/record-skill-run.js",
    "hooks/core/archive-session-skill.js",
    "hooks/core/compact-session-memory.js"
  ]) {
    const result = runNode([path.join(repoRoot, script), "--help"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
});

runTest("guard-phase passes for approved fixture session on harness-verify", () => {
  const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-goal");
  const session = ".harness/sessions/2026-06-04-google-login";
  const result = runNode([
    path.join(repoRoot, "hooks", "core", "guard-phase.js"),
    "--command",
    "harness-verify",
    "--session",
    path.join(fixture, session),
    "--json"
  ], { cwd: fixture });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.ok, true);
});

runTest("install cache includes hooks directory", () => {
  assert.ok(installCacheApi.cacheExportPaths.includes("hooks/"));
});

runTest("daily dev report layer surface exists", () => {
  for (const relativePath of [
    "templates/REPORT.md",
    "templates/PR_MESSAGE.md",
    "templates/CHANGE_SUMMARY.md",
    "skills/report-writer/SKILL.md",
    "workflows/daily-dev-report.md",
    "docs/daily-dev-report.md",
    "scripts/generate-report-context.js"
  ]) {
    assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
});

runTest("generate-report-context supports --help and --json", () => {
  const script = path.join(repoRoot, "scripts", "generate-report-context.js");
  const help = runNode([script, "--help"]);
  assert.equal(help.status, 0, help.stderr || help.stdout);
  const json = runNode([script, "--json"], { cwd: repoRoot });
  assert.equal(json.status, 0, json.stderr || json.stdout);
  const parsed = JSON.parse(json.stdout);
  assert.equal(typeof parsed.ok, "boolean");
  assert.equal(parsed.ok, true);
  assert.ok(Array.isArray(parsed.files));
});

runTest("harness-ship references report artifacts", () => {
  const command = fs.readFileSync(path.join(repoRoot, "commands", "harness-ship.md"), "utf8");
  const prompt = fs.readFileSync(path.join(repoRoot, "prompt-templates", "harness-ship.md"), "utf8");
  for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
    assert.match(command, new RegExp(artifact));
    assert.match(prompt, new RegExp(artifact));
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
