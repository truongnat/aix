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
const invalidFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness");
const invalidPackManifestFixture = path.join(repoRoot, "test", "fixtures", "invalid-pack-manifest");
const invalidHarnessProfileFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness-profile");
const validTargetProfileFixture = path.join(repoRoot, "test", "fixtures", "valid-target-profile");
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

runTest("parseValidateArgs accepts empty args as default mode", () => {
  const parsed = parseValidateArgs([]);

  assert.equal(parsed.mode, "harness-repository");
  assert.equal(parsed.baseDir, repoRoot);
});

runTest("parseValidateArgs returns usage error for unsupported args", () => {
  const parsed = parseValidateArgs(["--wat"]);

  assert.deepEqual(parsed.usageErrors, ["Unsupported argument: --wat"]);
});

runTest("parseValidateArgs accepts --target as target profile mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project"]);

  assert.equal(parsed.mode, "target-profile");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
});

runTest("parseValidateArgs accepts --target with --profile-only as target profile mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--profile-only"]);

  assert.equal(parsed.mode, "target-profile");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
});

runTest("parseValidateArgs accepts --target with --goal as target goal mode", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--goal", "google-login"]);

  assert.equal(parsed.mode, "target-goal");
  assert.equal(parsed.baseDir, path.resolve(repoRoot, "..", "my-project"));
  assert.equal(parsed.goalId, "google-login");
});

runTest("parseValidateArgs returns usage error for missing goal id after --goal", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--goal"]);

  assert.deepEqual(parsed.usageErrors, ["Missing required goal id after --goal"]);
});

runTest("parseValidateArgs returns conflict usage error for --profile-only with --goal", () => {
  const parsed = parseValidateArgs(["--target", "../my-project", "--profile-only", "--goal", "google-login"]);

  assert.deepEqual(parsed.usageErrors, ["--profile-only cannot be combined with --goal"]);
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

if (process.exitCode) {
  process.exit(process.exitCode);
}
