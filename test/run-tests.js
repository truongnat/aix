const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const childProcess = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..");
const {
  exportPaths,
  formatNextSteps,
  formatSummary,
  formatTargetDisplay,
  installHarness,
  parseArgs,
  summarizeResults
} = require(path.join(repoRoot, "install.js"));
const {
  packRequiredHeadings,
  parseValidateArgs,
  validateRepository,
  validateTargetGoal,
  validateTargetProfile
} = require(path.join(repoRoot, "validate.js"));
const { installRuntime } = require(path.join(repoRoot, "install-runtime.js"));
const invalidFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness");
const invalidPackManifestFixture = path.join(repoRoot, "test", "fixtures", "invalid-pack-manifest");
const invalidHarnessProfileFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness-profile");
const validTargetProfileFixture = path.join(repoRoot, "test", "fixtures", "valid-target-profile");
const validTargetProfileCursorFixture = path.join(
  repoRoot,
  "test",
  "fixtures",
  "valid-target-profile-cursor"
);
const invalidTargetProfileFixture = path.join(repoRoot, "test", "fixtures", "invalid-target-profile");
const validTargetGoalFixture = path.join(repoRoot, "test", "fixtures", "valid-target-goal");
const invalidTargetGoalFixture = path.join(repoRoot, "test", "fixtures", "invalid-target-goal");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ai-harness-test-"));
}

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

runTest("install.js dry-run reports files without writing them", () => {
  const targetDir = makeTempDir();
  const options = parseArgs(["--target", targetDir, "--dry-run"]);
  const results = installHarness(options);

  assert.ok(results.some((result) => result.action === "WOULD COPY" && result.relativePath === "AGENTS.md"));
  assert.ok(results.some((result) => result.action === "WOULD COPY" && result.relativePath === "docs/harness-build-usage.md"));
  assert.equal(fs.existsSync(path.join(targetDir, "AGENTS.md")), false);
});

runTest("install.js export surface includes post-install docs", () => {
  assert.ok(exportPaths.includes("docs/adoption-guide.md"));
  assert.ok(exportPaths.includes("docs/harness-build-usage.md"));
  assert.ok(exportPaths.includes("docs/target-repo-validation.md"));
  assert.ok(exportPaths.includes("docs/install-to-profile-walkthrough.md"));
  assert.ok(exportPaths.includes("docs/validation-troubleshooting.md"));
  assert.ok(exportPaths.includes("docs/small-repo-memory.md"));
});

runTest("install.js exportPaths includes core required installed surface", () => {
  assert.ok(exportPaths.includes("AGENTS.md"));
  assert.ok(exportPaths.includes("commands"));
  assert.ok(exportPaths.includes("skills"));
  assert.ok(exportPaths.includes("workflows"));
  assert.ok(exportPaths.includes("patterns"));
  assert.ok(exportPaths.includes("templates"));
});

runTest("install.js exportPaths does not include PACK.md", () => {
  assert.equal(exportPaths.includes("PACK.md"), false);
});

runTest("install.js exportPaths does not include validate.js", () => {
  assert.equal(exportPaths.includes("validate.js"), false);
});

runTest("PACK.md frozen headings match packRequiredHeadings", () => {
  const packText = fs.readFileSync(path.join(repoRoot, "PACK.md"), "utf8");

  for (const heading of packRequiredHeadings) {
    assert.ok(packText.includes(heading), `PACK.md must include ${heading}`);
  }
  assert.equal(packRequiredHeadings.length, 10);
});

runTest("install.js summary helper counts copied and skipped actions", () => {
  const summary = summarizeResults([
    { action: "WOULD COPY", relativePath: "AGENTS.md" },
    { action: "WOULD SKIP", relativePath: "docs/adoption-guide.md" },
    { action: "COPY", relativePath: "commands/harness-start.md" }
  ]);

  assert.deepEqual(summary, {
    copied: 2,
    skipped: 1,
    failed: 0
  });
});

runTest("install.js next steps helper explains dry-run follow-up", () => {
  const text = formatNextSteps({
    target: path.resolve("/tmp/example-target"),
    targetDisplay: "../my-project",
    dryRun: true
  });

  assert.match(text, /Next steps:/);
  assert.match(text, /Review the files marked WOULD COPY/);
  assert.match(text, /node install\.js --target \.\.\/my-project/);
});

runTest("install.js formatTargetDisplay prefers --target argument", () => {
  const resolved = path.resolve(repoRoot, "../harness-dogfood-tiny");

  assert.equal(formatTargetDisplay("../harness-dogfood-tiny", resolved), "../harness-dogfood-tiny");
});

runTest("install.js parseArgs sets targetDisplay from --target argument", () => {
  const options = parseArgs(["--target", "../my-project", "--dry-run"]);

  assert.equal(options.targetDisplay, "../my-project");
  assert.equal(options.target, path.resolve(repoRoot, "../my-project"));
});

runTest("install.js summary helper formats compact install summary", () => {
  const text = formatSummary(
    {
      target: path.resolve("/tmp/example-target"),
      targetDisplay: "../my-project",
      dryRun: false
    },
    {
      copied: 5,
      skipped: 2,
      failed: 0
    }
  );

  assert.match(text, /Install summary:/);
  assert.match(text, /- mode: write/);
  assert.match(text, /- target: \.\.\/my-project/);
  assert.match(text, /- copied: 5/);
  assert.match(text, /- skipped: 2/);
});

runTest("install.js skips existing files unless --force is passed", () => {
  const targetDir = makeTempDir();
  const agentsPath = path.join(targetDir, "AGENTS.md");

  fs.writeFileSync(agentsPath, "existing agents contract\n", "utf8");

  const firstRun = installHarness(parseArgs(["--target", targetDir]));
  assert.ok(firstRun.some((result) => result.action === "SKIP" && result.relativePath === "AGENTS.md"));
  assert.equal(fs.readFileSync(agentsPath, "utf8"), "existing agents contract\n");

  const secondRun = installHarness(parseArgs(["--target", targetDir, "--force"]));
  assert.ok(secondRun.some((result) => result.action === "COPY" && result.relativePath === "AGENTS.md"));
  assert.notEqual(fs.readFileSync(agentsPath, "utf8"), "existing agents contract\n");
});

runTest("validate.js passes for the repository", () => {
  const failures = validateRepository(repoRoot);
  assert.deepEqual(failures, []);
});

runTest("frozen validation contract: empty args use harness-repository mode", () => {
  const parsed = parseValidateArgs([]);

  assert.equal(parsed.mode, "harness-repository");
  assert.equal(parsed.baseDir, repoRoot);
});

runTest("frozen validation contract: unsupported args return usage error", () => {
  const parsed = parseValidateArgs(["--wat"]);

  assert.deepEqual(parsed.usageErrors, ["Unsupported argument: --wat"]);
});

runTest("frozen validation contract: --target only uses target-profile mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project"]);

  assert.equal(parsed.mode, "target-profile");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
});

runTest("frozen validation contract: --target with --profile-only uses target-profile mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--profile-only"]);

  assert.equal(parsed.mode, "target-profile");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
});

runTest("frozen validation contract: --target with --goal uses target-goal mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--goal", "google-login"]);

  assert.equal(parsed.mode, "target-goal");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
  assert.equal(parsed.goalId, "google-login");
});

runTest("frozen validation contract: missing goal id after --goal is usage error", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--goal"]);

  assert.deepEqual(parsed.usageErrors, ["Missing required goal id after --goal"]);
});

runTest("frozen validation contract: --profile-only cannot combine with --goal", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--profile-only", "--goal", "google-login"]);

  assert.deepEqual(parsed.usageErrors, ["--profile-only cannot be combined with --goal"]);
});

runTest("frozen validation contract: --target with --runtime cursor sets runtime on profile mode", () => {
  const parsed = parseValidateArgs([
    "--target",
    "../my-project",
    "--runtime",
    "cursor",
    "--profile-only"
  ]);

  assert.equal(parsed.mode, "target-profile");
  assert.equal(parsed.runtime, "cursor");
});

runTest("frozen validation contract: invalid --runtime returns usage error", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--runtime", "not-a-runtime"]);

  assert.ok(parsed.usageErrors.some((error) => /Unsupported runtime: not-a-runtime/.test(error)));
});

runTest("runtime-aware validation: cursor fixture passes without AGENTS.md", () => {
  assert.equal(fs.existsSync(path.join(validTargetProfileCursorFixture, "AGENTS.md")), false);
  const failures = validateTargetProfile(validTargetProfileCursorFixture, "cursor");

  assert.deepEqual(failures, []);
});

runTest("runtime-aware validation: cursor fixture fails missing mdc", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-cursor-missing-mdc-"));
  for (const name of ["HARNESS.md", "TEAM.md", "SKILLS.md", "WORKFLOW.md", "GATES.md", "MEMORY.md"]) {
    fs.mkdirSync(path.join(tmp, ".harness"), { recursive: true });
    fs.copyFileSync(
      path.join(validTargetProfileCursorFixture, ".harness", name),
      path.join(tmp, ".harness", name)
    );
  }

  const failures = validateTargetProfile(tmp, "cursor");

  assert.ok(failures.includes("Missing required path: .cursor/rules/ai-engineering-harness.mdc"));
});

runTest("runtime-aware validation: default profile fails without AGENTS.md", () => {
  const failures = validateTargetProfile(validTargetProfileCursorFixture);

  assert.ok(failures.includes("Missing required path: AGENTS.md"));
});

runTest("runtime-aware validation: generic runtime passes with AGENTS.md and harness", () => {
  const failures = validateTargetProfile(validTargetProfileFixture, "generic");

  assert.deepEqual(failures, []);
});

runTest("runtime-aware validation: codex runtime passes with AGENTS.md and harness", () => {
  const failures = validateTargetProfile(validTargetProfileFixture, "codex");

  assert.deepEqual(failures, []);
});

runTest("runtime-aware validation: opencode runtime passes with plugin paths", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-opencode-validate-"));
  for (const name of ["HARNESS.md", "TEAM.md", "SKILLS.md", "WORKFLOW.md", "GATES.md", "MEMORY.md"]) {
    fs.mkdirSync(path.join(tmp, ".harness"), { recursive: true });
    fs.copyFileSync(
      path.join(validTargetProfileFixture, ".harness", name),
      path.join(tmp, ".harness", name)
    );
  }
  fs.mkdirSync(path.join(tmp, ".opencode", "plugins"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "opencode.json"), "{}");
  fs.writeFileSync(path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js"), "// plugin");

  const failures = validateTargetProfile(tmp, "opencode");

  assert.deepEqual(failures, []);
});

runTest("frozen validation contract: missing path message shape", () => {
  const failures = validateRepository(invalidFixture);

  assert.ok(failures.some((failure) => /^Missing required path: .+$/.test(failure)));
});

runTest("frozen validation contract: missing heading message shape", () => {
  const failures = validateTargetProfile(invalidTargetProfileFixture);

  assert.ok(
    failures.some((failure) => /^.+\.md is missing heading: ## .+$/.test(failure))
  );
});

runTest("validate.js reports missing harness profile headings", () => {
  const failures = validateRepository(invalidHarnessProfileFixture);

  assert.ok(failures.includes("templates/HARNESS.md is missing heading: ## Human Review"));
});

runTest("validate.js reports missing adoption docs and AGENTS contract headings", () => {
  const failures = validateRepository(invalidFixture);

  assert.ok(failures.includes("Missing required path: docs/adoption-guide.md"));
  assert.ok(failures.includes("Missing required path: docs/runtime-compatibility.md"));
  assert.ok(failures.includes("AGENTS.md is missing heading: ## Completion Gate"));
  assert.ok(failures.includes("AGENTS.md is missing heading: ## Memory Discipline"));
});

runTest("validate.js reports missing PACK.md required heading", () => {
  const failures = validateRepository(invalidPackManifestFixture);

  assert.ok(failures.includes("PACK.md is missing heading: ## Non-Goals"));
});

runTest("PACK.md heading validation passes for current repository", () => {
  const failures = validateRepository(repoRoot);
  const packFailures = failures.filter((failure) => failure.startsWith("PACK.md"));

  assert.deepEqual(packFailures, []);
});

runTest("frozen target profile contract: valid fixture passes", () => {
  const failures = validateTargetProfile(validTargetProfileFixture);

  assert.deepEqual(failures, []);
});

runTest("frozen target profile contract: invalid fixture fails missing heading", () => {
  const failures = validateTargetProfile(invalidTargetProfileFixture);

  assert.ok(failures.includes(".harness/HARNESS.md is missing heading: ## Human Review"));
});

runTest("frozen goal artifact contract: valid fixture passes", () => {
  const failures = validateTargetGoal(validTargetGoalFixture, "google-login");

  assert.deepEqual(failures, []);
});

runTest("frozen goal artifact contract: invalid fixture fails missing heading", () => {
  const failures = validateTargetGoal(invalidTargetGoalFixture, "google-login");

  assert.ok(failures.includes(".harness/goals/google-login/GOAL.md is missing heading: ## Acceptance Criteria"));
});

runTest("validate.js CLI target profile returns success for valid fixture", () => {
  const result = childProcess.spawnSync(process.execPath, ["validate.js", "--target", validTargetProfileFixture], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Target repository validation passed\. Checked profile contract\./);
});

runTest("validate.js CLI target profile returns failure for invalid fixture", () => {
  const result = childProcess.spawnSync(process.execPath, ["validate.js", "--target", invalidTargetProfileFixture], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Target repository validation failed:/);
  assert.match(result.stderr, /\.harness\/HARNESS\.md is missing heading: ## Human Review/);
});

runTest("validate.js CLI target goal returns success for valid fixture", () => {
  const result = childProcess.spawnSync(process.execPath, ["validate.js", "--target", validTargetGoalFixture, "--goal", "google-login"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Target repository validation passed\. Checked goal contract: google-login\./);
});

runTest("validate.js CLI target goal returns failure for invalid fixture", () => {
  const result = childProcess.spawnSync(process.execPath, ["validate.js", "--target", invalidTargetGoalFixture, "--goal", "google-login"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Target repository validation failed:/);
  assert.match(result.stderr, /\.harness\/goals\/google-login\/GOAL\.md is missing heading: ## Acceptance Criteria/);
});

runTest("validate.js CLI returns usage error for missing goal id after --goal", () => {
  const result = childProcess.spawnSync(process.execPath, ["validate.js", "--target", validTargetProfileFixture, "--goal"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Validation usage error:/);
  assert.match(result.stderr, /Missing required goal id after --goal/);
});

runTest("validate.js CLI returns conflict usage error for --profile-only with --goal", () => {
  const result = childProcess.spawnSync(
    process.execPath,
    ["validate.js", "--target", validTargetProfileFixture, "--profile-only", "--goal", "google-login"],
    {
      cwd: repoRoot,
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Validation usage error:/);
  assert.match(result.stderr, /--profile-only cannot be combined with --goal/);
});

const installShPath = path.join(repoRoot, "install.sh");

runTest("install.sh exists at repository root", () => {
  assert.ok(fs.existsSync(installShPath));
});

runTest("install.sh includes supported flags", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /--target/);
  assert.match(script, /--dry-run/);
  assert.match(script, /--force/);
  assert.match(script, /--ref/);
  assert.match(script, /--help/);
});

runTest("install.sh delegates to install.js", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /node install\.js/);
});

runTest("install.sh references GitHub archive tarball URL", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /github\.com\/\$\{REPO\}\/archive\/\$\{REF\}\.tar\.gz/);
  assert.match(script, /truongnat\/ai-engineering-harness/);
});

runTest("install.sh does not use sudo", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.equal(/\bsudo\b/.test(script), false);
});

runTest("install.sh does not contain telemetry strings", () => {
  const script = fs.readFileSync(installShPath, "utf8").toLowerCase();

  assert.equal(script.includes("telemetry"), false);
  assert.equal(script.includes("analytics"), false);
});

runTest("install.sh includes runtime selector flags", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /--runtime/);
  assert.match(script, /--scope/);
  assert.match(script, /--yes/);
  assert.match(script, /--init-harness/);
  assert.match(script, /--legacy-root/);
  assert.match(script, /--visibility/);
  assert.match(script, /--ignore-strategy/);
  assert.match(script, /--install-cache/);
  assert.match(script, /--no-install-cache/);
});

runTest("install.sh includes runtime option names", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  for (const name of ["claude", "codex", "cursor", "gemini", "opencode", "generic", "all", "manual"]) {
    assert.match(script, new RegExp(name));
  }
});

runTest("install.sh warns manual root copy is fallback", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /fallback/i);
  assert.match(script, /warning/i);
});

runTest("install.sh delegates to install-runtime.js", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /install-runtime\.js/);
  assert.match(script, /run_runtime_native_install/);
});

runTest("install-runtime.js exists at repository root", () => {
  assert.ok(fs.existsSync(path.join(repoRoot, "install-runtime.js")));
});

runTest("runtime payload directories exist", () => {
  for (const dir of ["bootstrap", "cursor", "claude", "gemini", "opencode"]) {
    assert.ok(fs.existsSync(path.join(repoRoot, "runtime", dir)), `missing runtime/${dir}`);
  }
  assert.ok(fs.existsSync(path.join(repoRoot, "runtime", "README.md")));
});

runTest("install-runtime.js does not reference root pack copy", () => {
  const script = fs.readFileSync(path.join(repoRoot, "install-runtime.js"), "utf8");
  assert.equal(script.includes("commands/"), false);
  assert.equal(script.includes("skills/"), false);
  assert.equal(script.includes("installHarness"), false);
});

runTest("install-runtime.js supports expected runtimes", () => {
  const { ALL_RUNTIMES } = require(path.join(repoRoot, "install-runtime.js"));
  assert.deepEqual(ALL_RUNTIMES, ["opencode", "cursor", "claude", "codex", "gemini", "generic"]);
});

runTest("install.sh does not document windsurf alias", () => {
  const script = fs.readFileSync(installShPath, "utf8");
  assert.doesNotMatch(script, /windsurf/);
  assert.doesNotMatch(script, /Windsurf/);
});

runTest("install.sh legacy-root aliases manual fallback", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /--legacy-root/);
  assert.match(script, /RUNTIME=manual/);
});

function runInstallSh(args, options = {}) {
  return childProcess.spawnSync("sh", [installShPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: 15000
  });
}

runTest("install.sh claude dry-run exits 0 without network", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-claude-dry-"));
  const result = runInstallSh(
    ["--runtime", "claude", "--scope", "project", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD CREATE|WOULD UPDATE/);
  assert.match(result.stdout, /\.claude/);
});

runTest("install.sh claude write installs runtime files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-claude-write-"));
  const result = runInstallSh(
    ["--runtime", "claude", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".claude", "CLAUDE.md")));
});

runTest("install.sh project init-harness dry-run prints WOULD CREATE HARNESS.md", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-dry-"));
  const result = runInstallSh(
    ["--runtime", "claude", "--scope", "project", "--init-harness", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD CREATE \.harness\/HARNESS\.md/);
  const initSection = result.stdout.split("--- .harness/ init ---")[1]?.split("--- .harness/ init complete ---")[0] ?? "";
  assert.doesNotMatch(initSection, /WOULD CREATE AGENTS\.md/);
  assert.doesNotMatch(initSection, /WOULD SKIP AGENTS\.md/);
});

runTest("install.sh project init-harness writes profile files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-write-"));
  const result = runInstallSh(
    ["--runtime", "opencode", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js")));
  assert.equal(fs.existsSync(path.join(tmp, "AGENTS.md")), false);
});

const agentsProjectBootstrapMarker = "ai-engineering-harness";

runTest("install.sh generic init-harness dry-run init does not plan AGENTS.md", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-generic-dry-"));
  const result = runInstallSh(
    ["--runtime", "generic", "--scope", "project", "--init-harness", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const initSection = result.stdout.split("--- .harness/ init ---")[1]?.split("--- .harness/ init complete ---")[0] ?? "";
  assert.doesNotMatch(initSection, /AGENTS\.md/);
  assert.match(result.stdout, /WOULD CREATE AGENTS\.md/);
});

runTest("install.sh generic init-harness writes AGENTS.project.md bootstrap", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-generic-write-"));
  const bootstrap = fs.readFileSync(
    path.join(repoRoot, "runtime", "bootstrap", "AGENTS.project.md"),
    "utf8"
  );
  const result = runInstallSh(
    ["--runtime", "generic", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8");
  assert.equal(agents, bootstrap);
  assert.match(agents, new RegExp(agentsProjectBootstrapMarker));
  assert.match(result.stdout, /CREATE AGENTS\.md/);
  assert.doesNotMatch(result.stdout.split("--- .harness/ init ---")[1]?.split("--- .harness/ init complete ---")[0] ?? "", /CREATE AGENTS\.md/);
});

runTest("install.sh codex init-harness writes AGENTS.project.md bootstrap", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-codex-write-"));
  const bootstrap = fs.readFileSync(
    path.join(repoRoot, "runtime", "bootstrap", "AGENTS.project.md"),
    "utf8"
  );
  const result = runInstallSh(
    ["--runtime", "codex", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8"), bootstrap);
});

runTest("install.sh generic init-harness skips existing AGENTS.md without force", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-generic-skip-agents-"));
  fs.writeFileSync(path.join(tmp, "AGENTS.md"), "# team custom\n");

  const result = runInstallSh(
    ["--runtime", "generic", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /SKIP AGENTS\.md/);
  assert.equal(fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8"), "# team custom\n");
});

runTest("install.sh generic init-harness force overwrites AGENTS.md via runtime", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-generic-force-agents-"));
  const bootstrap = fs.readFileSync(
    path.join(repoRoot, "runtime", "bootstrap", "AGENTS.project.md"),
    "utf8"
  );
  fs.writeFileSync(path.join(tmp, "AGENTS.md"), "# old\n");

  const result = runInstallSh(
    [
      "--runtime",
      "generic",
      "--scope",
      "project",
      "--init-harness",
      "--force",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OVERWRITE AGENTS\.md/);
  assert.equal(fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8"), bootstrap);
});

runTest("install.sh init-harness target passes profile validation", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-validate-"));
  const result = runInstallSh(
    ["--runtime", "generic", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const failures = validateTargetProfile(tmp);
  assert.equal(failures.length, 0, failures.join("\n"));
});

runTest("install.sh global init-harness exits non-zero", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-global-"));
  const result = runInstallSh(
    ["--runtime", "claude", "--scope", "global", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /cannot create shared \.harness state/i);
});

runTest("install.sh init-harness skips existing files without force", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-skip-"));
  fs.mkdirSync(path.join(tmp, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".harness", "HARNESS.md"), "# keep\n");

  const result = runInstallSh(
    ["--runtime", "claude", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /SKIP \.harness\/HARNESS\.md/);
  assert.equal(fs.readFileSync(path.join(tmp, ".harness", "HARNESS.md"), "utf8"), "# keep\n");
});

runTest("install.sh init-harness force overwrites existing files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-init-force-"));
  fs.mkdirSync(path.join(tmp, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".harness", "HARNESS.md"), "# old\n");

  const result = runInstallSh(
    [
      "--runtime",
      "claude",
      "--scope",
      "project",
      "--init-harness",
      "--force",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OVERWRITE \.harness\/HARNESS\.md/);
  assert.match(fs.readFileSync(path.join(tmp, ".harness", "HARNESS.md"), "utf8"), /## Purpose/);
});

runTest("install-runtime cursor project creates rule file", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-cursor-"));
  installRuntime({
    packRoot: repoRoot,
    runtime: "cursor",
    scope: "project",
    target: tmp,
    dryRun: false,
    force: false
  });
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
});

function initFakeGitWorkTree(dir) {
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });
}

function readInfoExclude(targetDir) {
  const excludePath = path.join(targetDir, ".git", "info", "exclude");
  return fs.existsSync(excludePath) ? fs.readFileSync(excludePath, "utf8") : "";
}

runTest("install.sh private cursor dry-run prints WOULD UPDATE .git/info/exclude", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-dry-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "install",
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--ignore-strategy",
      "info-exclude",
      "--init-harness",
      "--dry-run",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD UPDATE \.git\/info\/exclude/);
  assert.match(result.stdout, /\.cursor\/rules\/ai-engineering-harness\.mdc/);
  assert.match(result.stdout, /\.harness\//);
  assert.match(result.stdout, /\.ai-harness\//);
});

runTest("install.sh private cursor install writes .git/info/exclude block", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-write-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--init-harness",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const exclude = readInfoExclude(tmp);
  assert.match(exclude, /# ai-engineering-harness start/);
  assert.match(exclude, /# ai-engineering-harness end/);
  assert.match(exclude, /\.cursor\/rules\/ai-engineering-harness\.mdc/);
  assert.match(exclude, /\.harness\//);
  assert.match(exclude, /\.ai-harness\//);
  assert.equal(exclude.includes(".gitignore"), false);
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
});

runTest("install.sh shared cursor install does not modify .git/info/exclude", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-shared-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "shared",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const exclude = readInfoExclude(tmp);
  assert.doesNotMatch(exclude, /ai-engineering-harness start/);
});

runTest("install.sh private non-git install warns and does not fail", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-nogit-"));
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const combined = `${result.stdout}\n${result.stderr}`;
  assert.match(combined, /not a Git repository|\.git\/info\/exclude/i);
  assert.equal(fs.existsSync(path.join(tmp, ".git", "info", "exclude")), false);
});

runTest("install.sh private cursor install is idempotent for exclude block", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-idem-"));
  initFakeGitWorkTree(tmp);
  const args = [
    "--runtime",
    "cursor",
    "--scope",
    "project",
    "--visibility",
    "private",
    "--yes",
    "--target",
    tmp
  ];
  assert.equal(runInstallSh(args, { env: { PATH: process.env.PATH } }).status, 0);
  assert.equal(runInstallSh(args, { env: { PATH: process.env.PATH } }).status, 0);
  const exclude = readInfoExclude(tmp);
  const starts = (exclude.match(/# ai-engineering-harness start/g) || []).length;
  assert.equal(starts, 1);
});

runTest("install.sh private all runtime block includes union paths without opencode.json", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-all-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "all",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--init-harness",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const exclude = readInfoExclude(tmp);
  assert.match(exclude, /\.cursor\/rules\/ai-engineering-harness\.mdc/);
  assert.match(exclude, /\.opencode\/plugins\/ai-engineering-harness\.js/);
  assert.doesNotMatch(exclude, /^opencode\.json$/m);
  assert.match(exclude, /AGENTS\.md/);
});

runTest("install.sh private opencode block does not ignore opencode.json", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-private-opencode-"));
  initFakeGitWorkTree(tmp);
  runInstallSh(
    ["--runtime", "opencode", "--scope", "project", "--visibility", "private", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  const exclude = readInfoExclude(tmp);
  assert.match(exclude, /\.opencode\/plugins\/ai-engineering-harness\.js/);
  assert.doesNotMatch(exclude, /^opencode\.json$/m);
});

runTest("install.sh private cursor dry-run prints WOULD COPY .ai-harness paths", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-dry-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "install",
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--init-harness",
      "--dry-run",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD COPY \.ai-harness\//);
  assert.match(result.stdout, /\.ai-harness\/AGENTS\.md/);
});

runTest("install.sh private cursor install creates .ai-harness capability cache", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-write-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--init-harness",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "commands")));
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "skills")));
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "workflows")));
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "templates")));
  assert.equal(fs.existsSync(path.join(tmp, "commands")), false);
  assert.equal(fs.existsSync(path.join(tmp, "skills")), false);
  assert.equal(fs.existsSync(path.join(tmp, "workflows")), false);
  assert.equal(fs.existsSync(path.join(tmp, "templates")), false);

  const exclude = readInfoExclude(tmp);
  assert.match(exclude, /\.ai-harness\//);

  const mdc = fs.readFileSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"), "utf8");
  assert.match(mdc, /\.ai-harness\/AGENTS\.md/);
});

runTest("install.sh shared cursor project install creates .ai-harness by default", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-shared-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "shared",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  const exclude = readInfoExclude(tmp);
  assert.doesNotMatch(exclude, /ai-engineering-harness start/);
});

runTest("install.sh private --no-install-cache skips .ai-harness", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-no-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--no-install-cache",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), false);
  const exclude = readInfoExclude(tmp);
  assert.doesNotMatch(exclude, /\.ai-harness\//);
});

runTest("install.sh private cache skips existing file without force", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-skip-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".ai-harness"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "# keep\n");

  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /SKIP.*\.ai-harness\/AGENTS\.md/);
  assert.equal(fs.readFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "utf8"), "# keep\n");
});

runTest("install.sh private cache force overwrites existing file", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-force-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".ai-harness"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "# old\n");
  const packAgents = fs.readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");

  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--force",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "utf8"), packAgents);
});

runTest("install.sh claude private project creates .ai-harness and bootstrap points to cache", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-claude-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "claude",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--init-harness",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "skills")));
  const claudeMd = fs.readFileSync(path.join(tmp, ".claude", "CLAUDE.md"), "utf8");
  assert.match(claudeMd, /\.ai-harness\/AGENTS\.md/);
  assert.match(claudeMd, /\.harness\//);
  const exclude = readInfoExclude(tmp);
  assert.match(exclude, /\.claude\/CLAUDE\.md/);
  assert.match(exclude, /\.ai-harness\//);
});

runTest("install.sh generic project creates .ai-harness and AGENTS.md points to cache", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-generic-"));
  const result = runInstallSh(
    [
      "--runtime",
      "generic",
      "--scope",
      "project",
      "--init-harness",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "commands")));
  const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8");
  assert.match(agents, /\.ai-harness\/commands/);
  assert.equal(fs.existsSync(path.join(tmp, "commands")), false);
});

runTest("install.sh gemini project creates .ai-harness and GEMINI.md points to cache", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-gemini-"));
  const result = runInstallSh(
    ["--runtime", "gemini", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "workflows")));
  const geminiMd = fs.readFileSync(
    path.join(tmp, ".gemini", "extensions", "ai-engineering-harness", "GEMINI.md"),
    "utf8"
  );
  assert.match(geminiMd, /\.ai-harness\/AGENTS\.md/);
});

runTest("install.sh opencode project creates .ai-harness and plugin references cache", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-opencode-"));
  const result = runInstallSh(
    ["--runtime", "opencode", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  const plugin = fs.readFileSync(
    path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js"),
    "utf8"
  );
  assert.match(plugin, /\.ai-harness\/AGENTS\.md/);
  assert.match(plugin, /\.harness\//);
});

runTest("install-cache.js copies AGENTS.md under .ai-harness", () => {
  const { installCapabilityCache } = require(path.join(repoRoot, "install-cache.js"));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cache-unit-"));
  const results = installCapabilityCache({
    packRoot: repoRoot,
    target: tmp,
    dryRun: false,
    force: false
  });

  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  assert.ok(results.some((r) => r.relativePath === ".ai-harness/AGENTS.md" && r.action === "COPY"));
});

runTest("install.sh rejects gitignore strategy in Step 1", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-gitignore-reject-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    [
      "--runtime",
      "cursor",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--ignore-strategy",
      "gitignore",
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /not implemented in v0\.9\.2 Step 1/i);
});

runTest("install.sh uninstall cursor dry-run prints WOULD REMOVE runtime entrypoint", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-cursor-dry-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor", "rules"), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"),
    "ai-engineering-harness\n"
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "cursor", "--scope", "project", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD REMOVE \.cursor\/rules\/ai-engineering-harness\.mdc/);
});

runTest("install.sh uninstall cursor removes runtime file and keeps cache/state by default", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-cursor-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--visibility", "private", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")), true);
  assert.match(result.stdout, /KEEP \.ai-harness/);
  assert.match(result.stdout, /KEEP \.harness/);
});

runTest("install.sh uninstall cursor removes cache when requested", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-cache-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--visibility", "private", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "cursor", "--scope", "project", "--remove-cache", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), false);
});

runTest("install.sh uninstall cursor removes state when requested", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-state-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--visibility", "private", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "cursor", "--scope", "project", "--remove-state", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".harness")), false);
});

runTest("install.sh uninstall removes .git/info/exclude harness block and preserves unrelated lines", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-exclude-"));
  initFakeGitWorkTree(tmp);
  fs.writeFileSync(path.join(tmp, ".git", "info", "exclude"), "custom-line\n", "utf8");
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--visibility", "private", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  const exclude = readInfoExclude(tmp);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.doesNotMatch(exclude, /ai-engineering-harness start/);
  assert.match(exclude, /custom-line/);
});

runTest("install.sh uninstall all removes union runtime files and keeps opencode.json", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-all-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "all", "--scope", "project", "--visibility", "private", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  const result = runInstallSh(
    ["uninstall", "--runtime", "all", "--scope", "project", "--remove-cache", "--remove-state", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".claude", "CLAUDE.md")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".gemini", "extensions", "ai-engineering-harness")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".harness")), false);
  assert.equal(fs.existsSync(path.join(tmp, "opencode.json")), true);
});

runTest("install.sh uninstall generic skips AGENTS.md without harness marker", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-agents-skip-"));
  fs.writeFileSync(path.join(tmp, "AGENTS.md"), "# team custom\n", "utf8");

  const result = runInstallSh(
    ["uninstall", "--runtime", "generic", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, "AGENTS.md")), true);
  assert.match(result.stdout, /SKIP AGENTS\.md \(not clearly harness-owned\)/);
});

runTest("install.sh uninstall generic removes AGENTS.md with harness marker", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-agents-remove-"));
  fs.writeFileSync(path.join(tmp, "AGENTS.md"), "ai-engineering-harness\n", "utf8");

  const result = runInstallSh(
    ["uninstall", "--runtime", "generic", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, "AGENTS.md")), false);
});

runTest("install.sh update still reports not implemented", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /update is not implemented/i);
});

runTest("install-runtime opencode project creates plugin file", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rt-opencode-"));
  installRuntime({
    packRoot: repoRoot,
    runtime: "opencode",
    scope: "project",
    target: tmp,
    dryRun: false,
    force: false
  });
  assert.ok(fs.existsSync(path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js")));
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
