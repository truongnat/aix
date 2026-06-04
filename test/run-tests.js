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
  DOGFOOD_DEMO_PREFIX,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  ACTIVE_COMMAND_NAMING_PATHS,
  assertPublicDemoPolish,
  assertPlanTemplateContract,
  assertVerifyTemplateContract,
  extractMarkdownSection,
  hasConcreteFailureRule,
  hasSubstantiveSectionBody,
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
const commandContractHeadings = [
  "## Purpose",
  "## Minimum Read Set",
  "## Preconditions",
  "## Required Outputs",
  "## Redirect Behavior",
  "## Failure Conditions"
];
const skillContractHeadings = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Output Contract",
  "## Common Failure Modes"
];

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

runTest("command docs include execution contract headings", () => {
  const commandDir = path.join(repoRoot, "commands");

  for (const fileName of fs.readdirSync(commandDir)) {
    const fullPath = path.join(commandDir, fileName);
    const text = fs.readFileSync(fullPath, "utf8");

    for (const heading of commandContractHeadings) {
      assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
});

runTest("phase command docs include Blocking Questions sections", () => {
  for (const fileName of [
    "harness-plan.md",
    "harness-run.md",
    "harness-verify.md",
    "harness-ship.md"
  ]) {
    const text = fs.readFileSync(path.join(repoRoot, "commands", fileName), "utf8");
    assert.match(text, /## Blocking Questions/);
    assert.match(text, /must ask the user and stop|must stop and ask/i);
  }
});

runTest("BLOCKED template exists with required headings", () => {
  const text = fs.readFileSync(path.join(repoRoot, "templates", "BLOCKED.md"), "utf8");
  for (const heading of [
    "# Blocked",
    "## Status",
    "## Current Command",
    "## Missing Preconditions",
    "## Blocking Questions",
    "## Suggested Next Command",
    "## Notes"
  ]) {
    assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(text, /status:\s*blocked/i);
});

runTest("validated skills include contract headings", () => {
  const skillDirs = [
    "using-harness",
    "mapping-codebase",
    "discussing-goals",
    "writing-plans",
    "executing-plans",
    "test-driven-development",
    "code-review",
    "verification",
    "remembering",
    "writing-skills"
  ];

  for (const dirName of skillDirs) {
    const text = fs.readFileSync(path.join(repoRoot, "skills", dirName, "SKILL.md"), "utf8");

    for (const heading of skillContractHeadings) {
      assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
});

runTest("VERIFY template uses evidence-first contract headings", () => {
  const text = fs.readFileSync(path.join(repoRoot, "templates", "VERIFY.md"), "utf8");

  for (const heading of ["## Status", "## Tests Run", "## Manual Checks", "## Evidence", "## Known Gaps"]) {
    assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

runTest("VERIFY template uses structured status and safe Known Gaps default", () => {
  const text = fs.readFileSync(path.join(repoRoot, "templates", "VERIFY.md"), "utf8");
  assert.match(text, /status:\s*pending/i);
  assert.match(text, /freshness:/i);
  assert.match(text, /Not assessed yet/i);
  assert.doesNotMatch(text, /## Known Gaps\s*\n\s*-?\s*None\s*$/im);
  const failures = [];
  assertVerifyTemplateContract(repoRoot, failures);
  assert.deepEqual(failures, []);
});

runTest("valid target goal VERIFY artifact uses machine-readable status and freshness", () => {
  const text = fs.readFileSync(
    path.join(
      repoRoot,
      "test",
      "fixtures",
      "valid-target-goal",
      ".harness",
      "goals",
      "google-login",
      "VERIFY.md"
    ),
    "utf8"
  );
  assert.match(text, /status:\s*(pending|passed|failed|blocked|partial)/i);
  assert.match(text, /freshness:/i);
});

runTest("PLAN template includes Approval Status fields", () => {
  const text = fs.readFileSync(path.join(repoRoot, "templates", "PLAN.md"), "utf8");
  assert.match(text, /## Approval Status/);
  assert.match(text, /status:\s*draft/i);
  assert.match(text, /approved_by:/i);
  assert.match(text, /approved_at:/i);
  const failures = [];
  assertPlanTemplateContract(repoRoot, failures);
  assert.deepEqual(failures, []);
});

runTest("contract helpers reject placeholder-only sections", () => {
  assert.equal(hasSubstantiveSectionBody("- TBD"), false);
  assert.equal(hasSubstantiveSectionBody("- \n- "), false);
  assert.equal(
    hasSubstantiveSectionBody("- Do not implement unplanned work without updating the plan."),
    true
  );
  assert.equal(hasConcreteFailureRule("- Do not ship without verification evidence."), true);
  assert.equal(hasConcreteFailureRule("- TBD"), false);
});

runTest("command contract validation rejects empty Preconditions", () => {
  const failures = [];
  const content = [
    "# harness-test",
    "## Preconditions",
    "",
    "## Required Outputs",
    "- `.harness/PLAN.md` updated with concrete tasks.",
    "## Redirect Behavior",
    "- redirect to `harness-plan` if missing.",
    "## Failure Conditions",
    "- Do not implement without approval."
  ].join("\n");
  assertCommandContractStructure("commands/harness-test.md", content, failures);
  assert.ok(
    failures.some((f) => f.includes("Preconditions") && f.includes("substantive"))
  );
});

runTest("command contract validation rejects placeholder-only Required Outputs", () => {
  const failures = [];
  const content = [
    "# harness-test",
    "## Preconditions",
    "- Goal exists in `.harness/GOAL.md`.",
    "## Required Outputs",
    "- TBD",
    "## Redirect Behavior",
    "- use harness-discuss when unclear.",
    "## Failure Conditions",
    "- Do not claim completion early."
  ].join("\n");
  assertCommandContractStructure("commands/harness-test.md", content, failures);
  assert.ok(failures.some((f) => f.includes("Required Outputs")));
});

runTest("command contract validation rejects Redirect without harness command", () => {
  const failures = [];
  const content = [
    "# harness-test",
    "## Preconditions",
    "- Goal exists.",
    "## Required Outputs",
    "- State file updated.",
    "## Redirect Behavior",
    "- ask the user what to do next.",
    "## Failure Conditions",
    "- Do not improvise scope."
  ].join("\n");
  assertCommandContractStructure("commands/harness-test.md", content, failures);
  assert.ok(failures.some((f) => f.includes("Redirect Behavior")));
});

runTest("CI workflow ci.yml exists and runs validate, test, dogfood", () => {
  const ciPath = path.join(repoRoot, ".github", "workflows", "ci.yml");
  assert.ok(fs.existsSync(ciPath));
  const ci = fs.readFileSync(ciPath, "utf8");
  assert.match(ci, /node-version:\s*20/);
  assert.match(ci, /node validate\.js/);
  assert.match(ci, /npm test/);
  assert.match(ci, /examples\/dogfood-tiny-node-api/);
  assert.equal(fs.existsSync(path.join(repoRoot, ".github", "workflows", "validate.yml")), false);
});

runTest("README includes CI badge and dogfood demo section", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /actions\/workflows\/ci\.yml\/badge\.svg/);
  assert.match(readme, /## Demo/);
  assert.match(readme, /examples\/dogfood-tiny-node-api/);
  assert.match(readme, /workflow-artifact dogfood/i);
  const failures = [];
  assertPublicDemoPolish(repoRoot, failures);
  assert.deepEqual(failures, []);
});

runTest("dogfood tiny node api project files exist", () => {
  const root = path.join(repoRoot, DOGFOOD_DEMO_PREFIX);
  for (const rel of [
    "package.json",
    "src/server.js",
    "test/health.test.js",
    "README.md",
    "TRANSCRIPT.md",
    ".harness/GOAL.md",
    ".harness/DISCUSSION.md",
    ".harness/PLAN.md",
    ".harness/TASKS.md",
    ".harness/VERIFY.md",
    ".harness/SHIP.md",
    ".harness/REMEMBER.md"
  ]) {
    assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
  }
});

runTest("dogfood demo passes validate.js contract checks", () => {
  const failures = [];
  assertDogfoodDemoContract(repoRoot, failures);
  assert.deepEqual(failures, [], failures.join("\n"));
});

runTest("dogfood demo npm test passes", () => {
  const result = childProcess.spawnSync(process.execPath, ["--test", "test/health.test.js"], {
    cwd: path.join(repoRoot, DOGFOOD_DEMO_PREFIX),
    encoding: "utf8",
    timeout: 30000
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /pass 2/);
});

runTest("dogfood VERIFY records passed status and npm test evidence", () => {
  const verify = fs.readFileSync(
    path.join(repoRoot, DOGFOOD_DEMO_PREFIX, ".harness", "VERIFY.md"),
    "utf8"
  );
  assert.match(verify, /status:\s*passed/i);
  assert.match(verify, /npm test/i);
  assert.match(verify, /Exit Code[\s\S]*\|\s*0\s*\|/i);
});

runTest("active docs use hyphen-form harness command IDs only", () => {
  const failures = [];
  assertHyphenCommandNamingInActiveDocs(repoRoot, failures);
  assert.deepEqual(failures, [], failures.join("\n"));
  assert.ok(ACTIVE_COMMAND_NAMING_PATHS.includes("README.md"));
});

runTest("repository command docs pass substantive contract validation", () => {
  const failures = [];
  const commandDir = path.join(repoRoot, "commands");
  for (const fileName of fs.readdirSync(commandDir)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }
    const relativePath = `commands/${fileName}`;
    const content = fs.readFileSync(path.join(commandDir, fileName), "utf8");
    assertCommandContractStructure(relativePath, content, failures);
  }
  assert.deepEqual(failures, [], failures.join("\n"));
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

runTest("runtime-aware validation: opencode runtime is rejected (v0.11.0)", () => {
  const failures = validateTargetProfile(validTargetProfileFixture, "opencode");
  assert.ok(failures.some((f) => /Unsupported runtime: opencode/.test(f)));
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

const aihShPath = path.join(repoRoot, "aih.sh");
const aihBinPath = path.join(repoRoot, "bin", "aih.js");
const aihPs1Path = path.join(repoRoot, "aih.ps1");
const installShPath = path.join(repoRoot, "install.sh");
const packageJsonPath = path.join(repoRoot, "package.json");

function runAihCli(args, options = {}) {
  return childProcess.spawnSync(process.execPath, [aihBinPath, ...args], {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: options.timeout || 120000
  });
}

runTest("aih.sh exists at repository root", () => {
  assert.ok(fs.existsSync(aihShPath));
});

runTest("aih.ps1 exists at repository root", () => {
  assert.ok(fs.existsSync(aihPs1Path));
});

runTest("install.sh exists at repository root", () => {
  assert.ok(fs.existsSync(installShPath));
});

runTest("aih.sh includes supported flags", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.match(script, /--target/);
  assert.match(script, /--dry-run/);
  assert.match(script, /--force/);
  assert.match(script, /--ref/);
  assert.match(script, /--help/);
});

runTest("aih.sh delegates to install.js", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.match(script, /node install\.js/);
});

runTest("aih.sh references GitHub archive tarball URL", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.match(script, /github\.com\/\$\{REPO\}\/archive\/\$\{REF\}\.tar\.gz/);
  assert.match(script, /truongnat\/ai-engineering-harness/);
});

runTest("aih.sh does not use sudo", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.equal(/\bsudo\b/.test(script), false);
});

runTest("aih.sh does not contain telemetry strings", () => {
  const script = fs.readFileSync(aihShPath, "utf8").toLowerCase();

  assert.equal(script.includes("telemetry"), false);
  assert.equal(script.includes("analytics"), false);
});

runTest("aih.sh includes runtime selector flags", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

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

runTest("aih.sh includes runtime option names", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  for (const name of ["claude", "codex", "cursor", "gemini", "generic", "all", "manual"]) {
    assert.match(script, new RegExp(name));
  }
  assert.match(script, /opencode removed v0\.11/i);
});

runTest("aih.sh warns manual root copy is fallback", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.match(script, /fallback/i);
  assert.match(script, /warning/i);
});

runTest("aih.sh delegates to install-runtime.js", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

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
  const script = fs.readFileSync(path.join(repoRoot, "lib", "install-runtime.js"), "utf8");
  assert.doesNotMatch(script, /packRoot,\s*["']commands\//);
  assert.doesNotMatch(script, /packPath\([^)]*["']commands\//);
  assert.equal(script.includes("installHarness"), false);
});

runTest("install-runtime.js supports expected runtimes", () => {
  const { ALL_RUNTIMES } = require(path.join(repoRoot, "install-runtime.js"));
  assert.deepEqual(ALL_RUNTIMES, ["cursor", "claude", "codex", "gemini", "generic"]);
});

runTest("aih.sh does not document windsurf alias", () => {
  const script = fs.readFileSync(aihShPath, "utf8");
  assert.doesNotMatch(script, /windsurf/);
  assert.doesNotMatch(script, /Windsurf/);
});

runTest("aih.sh legacy-root aliases manual fallback", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

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

function runAihSh(args, options = {}) {
  return childProcess.spawnSync("sh", [aihShPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: 15000
  });
}

runTest("install.sh wrapper points to aih.sh", () => {
  const script = fs.readFileSync(installShPath, "utf8");

  assert.match(script, /aih\.sh/);
  assert.match(script, /raw\.githubusercontent\.com/);
});

runTest("aih.sh help shows simple commands first", () => {
  const result = runAihSh(["help"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Recommended:/);
  assert.match(result.stdout, /sh aih\.sh install/);
  assert.match(result.stdout, /sh aih\.sh update/);
  assert.match(result.stdout, /sh aih\.sh uninstall/);
  assert.match(result.stdout, /sh aih\.sh status/);
  assert.match(result.stdout, /sh aih\.sh doctor/);
});

runTest("aih.sh claude dry-run exits 0 without network", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-claude-dry-"));
  const result = runAihSh(
    ["--runtime", "claude", "--scope", "project", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD CREATE|WOULD UPDATE/);
  assert.match(result.stdout, /\.claude/);
});

runTest("aih.sh claude write installs runtime files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-claude-write-"));
  const result = runAihSh(
    ["--runtime", "claude", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".claude", "CLAUDE.md")));
});

runTest("aih.sh install works for simple auto-detected cursor project", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aih-install-cursor-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });

  const result = runAihSh(["install", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
});

runTest("aih.sh uninstall works for installed cursor project", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aih-uninstall-cursor-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  assert.equal(runAihSh(["install", "--yes", "--target", tmp], { env: { PATH: process.env.PATH } }).status, 0);

  const result = runAihSh(["uninstall", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")), false);
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
    ["--runtime", "claude", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".claude", "CLAUDE.md")));
});

const agentsProjectBootstrapMarker = "ai-engineering-harness";

function expectedProjectAgentsWithAliases() {
  const bootstrap = fs.readFileSync(
    path.join(repoRoot, "runtime", "bootstrap", "AGENTS.project.md"),
    "utf8"
  );
  const { renderAgentsCommandAliasesSection } = require(path.join(repoRoot, "runtime-command-catalog.js"));
  return `${bootstrap.trimEnd()}\n${renderAgentsCommandAliasesSection()}`;
}

function normalizeEol(text) {
  return text.replace(/\r\n/g, "\n");
}

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
  const expected = expectedProjectAgentsWithAliases();
  const result = runInstallSh(
    ["--runtime", "generic", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8");
  assert.equal(normalizeEol(agents), normalizeEol(expected));
  assert.match(agents, new RegExp(agentsProjectBootstrapMarker));
  assert.match(result.stdout, /CREATE AGENTS\.md/);
  assert.doesNotMatch(result.stdout.split("--- .harness/ init ---")[1]?.split("--- .harness/ init complete ---")[0] ?? "", /CREATE AGENTS\.md/);
});

runTest("install.sh codex init-harness writes AGENTS.project.md bootstrap", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-codex-write-"));
  const expected = expectedProjectAgentsWithAliases();
  const result = runInstallSh(
    ["--runtime", "codex", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(normalizeEol(fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8")), normalizeEol(expected));
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
  const expected = expectedProjectAgentsWithAliases();
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
  assert.equal(normalizeEol(fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8")), normalizeEol(expected));
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

runTest("install.sh simple install auto-detects cursor project defaults", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-simple-install-cursor-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });

  const result = runInstallSh(["install", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });
  const exclude = readInfoExclude(tmp);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
  assert.match(exclude, /\.ai-harness\//);
  assert.match(exclude, /\.harness\//);
  assert.match(exclude, /\.cursor\/rules\/ai-engineering-harness\.mdc/);
});

runTest("install.sh simple install without detectable provider fails non-interactive", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-simple-install-no-provider-"));
  initFakeGitWorkTree(tmp);

  const result = runInstallSh(["install", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /could not detect provider for install/i);
  assert.equal(fs.existsSync(path.join(tmp, "commands")), false);
  assert.equal(fs.existsSync(path.join(tmp, "skills")), false);
  assert.equal(fs.existsSync(path.join(tmp, "workflows")), false);
});

runTest("install.sh simple install does not default to manual root copy", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-simple-install-no-manual-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });

  const result = runInstallSh(["install", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, "commands")), false);
  assert.equal(fs.existsSync(path.join(tmp, "skills")), false);
  assert.equal(fs.existsSync(path.join(tmp, "workflows")), false);
  assert.equal(fs.existsSync(path.join(tmp, "AGENTS.md")), false);
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
});

runTest("install.sh explicit long command still works", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-explicit-long-command-"));
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
      "--yes",
      "--target",
      tmp
    ],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".harness", "HARNESS.md")));
  assert.ok(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")));
});

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

runTest("install.sh private all runtime block includes union paths for active runtimes", () => {
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
  assert.doesNotMatch(exclude, /\.opencode\/plugins\/ai-engineering-harness\.js/);
  assert.match(exclude, /AGENTS\.md/);
});

runTest("install.sh rejects opencode runtime for install (v0.11.0)", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-opencode-reject-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    ["install", "--runtime", "opencode", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /opencode removed v0\.11|invalid --runtime/i);
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

runTest("install.sh private --no-install-cache skips capability cache files", () => {
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
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness", "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness", "commands")), false);
  assert.ok(fs.existsSync(path.join(tmp, ".cursor/rules/ai-engineering-harness.mdc")));
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

runTest("install.sh uninstall all removes union runtime files for active providers", () => {
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
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".harness")), false);
});

runTest("install.sh uninstall without runtime auto-detects installed cursor runtime", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-auto-runtime-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(["install", "--runtime", "cursor", "--scope", "project", "--init-harness", "--yes", "--target", tmp], {
      env: { PATH: process.env.PATH }
    }).status,
    0
  );

  const result = runInstallSh(["uninstall", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), true);
  assert.equal(fs.existsSync(path.join(tmp, ".harness")), true);
});

runTest("install.sh uninstall --all removes runtime cache and state with auto-detected runtimes", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-auto-all-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  assert.equal(runInstallSh(["install", "--yes", "--target", tmp], { env: { PATH: process.env.PATH } }).status, 0);

  const result = runInstallSh(["uninstall", "--all", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".harness")), false);
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

runTest("install.sh update project path is implemented", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

runTest("install.sh update cursor dry-run prints update plan", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-dry-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--ref", "main", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /--- Update plan ---/);
  assert.match(result.stdout, /Refresh \.ai-harness\/ capability cache/);
});

runTest("install.sh update cursor overwrites .ai-harness and runtime entrypoint", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-overwrite-"));
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  fs.writeFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "# stale cache\n", "utf8");
  fs.writeFileSync(
    path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"),
    "stale runtime\n",
    "utf8"
  );

  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--ref", "main", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.notEqual(fs.readFileSync(path.join(tmp, ".ai-harness", "AGENTS.md"), "utf8"), "# stale cache\n");
  assert.notEqual(
    fs.readFileSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"), "utf8"),
    "stale runtime\n"
  );
});

runTest("install.sh update does not overwrite .harness/HARNESS.md", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-harness-"));
  assert.equal(
    runInstallSh(
      ["install", "--runtime", "cursor", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );

  fs.writeFileSync(path.join(tmp, ".harness", "HARNESS.md"), "# user state\n", "utf8");

  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--ref", "main", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(path.join(tmp, ".harness", "HARNESS.md"), "utf8"), "# user state\n");
});

runTest("install.sh update without runtime auto-detects installed cursor runtime", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-auto-runtime-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(["install", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp], {
      env: { PATH: process.env.PATH }
    }).status,
    0
  );

  fs.writeFileSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"), "stale runtime\n", "utf8");

  const result = runInstallSh(["update", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.notEqual(
    fs.readFileSync(path.join(tmp, ".cursor", "rules", "ai-engineering-harness.mdc"), "utf8"),
    "stale runtime\n"
  );
});

runTest("install.sh update with --visibility private updates .git/info/exclude", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-private-"));
  initFakeGitWorkTree(tmp);

  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--ref", "main", "--visibility", "private", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  const exclude = readInfoExclude(tmp);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(exclude, /ai-engineering-harness start/);
  assert.match(exclude, /\.cursor\/rules\/ai-engineering-harness\.mdc/);
  assert.match(exclude, /\.ai-harness\//);
});

runTest("install.sh update without visibility does not create exclude block", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-no-visibility-"));
  initFakeGitWorkTree(tmp);

  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--ref", "main", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(readInfoExclude(tmp), "");
});

runTest("install.sh update global dry-run documents planned but not implemented", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-global-dry-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "global", "--dry-run", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout + result.stderr, /Global update is planned but not implemented/i);
});

runTest("install.sh update manual fails with clear message", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-manual-"));
  const result = runInstallSh(
    ["update", "--runtime", "manual", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /Manual fallback update is not supported/i);
});

runTest("install.sh update rejects --init-harness", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-init-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /--init-harness is only valid for install/i);
});

runTest("install.sh update rejects --remove-cache and --remove-state", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-update-remove-"));
  const result = runInstallSh(
    ["update", "--runtime", "cursor", "--scope", "project", "--remove-cache", "--remove-state", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /--remove-cache and --remove-state are only valid for uninstall/i);
});

runTest("install.sh status prints detected runtime cache state and exclude block", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-status-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  assert.equal(runInstallSh(["install", "--yes", "--target", tmp], { env: { PATH: process.env.PATH } }).status, 0);

  const result = runInstallSh(["status", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /detected runtimes:\s+cursor/);
  assert.match(result.stdout, /\.ai-harness exists:\s+yes/);
  assert.match(result.stdout, /\.harness exists:\s+yes/);
  assert.match(result.stdout, /exclude block exists:\s+yes/);
});

runTest("install.sh doctor passes after install", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doctor-pass-"));
  initFakeGitWorkTree(tmp);
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  assert.equal(runInstallSh(["install", "--yes", "--target", tmp], { env: { PATH: process.env.PATH } }).status, 0);

  const result = runInstallSh(["doctor", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /PASS \.ai-harness exists/);
  assert.match(result.stdout, /PASS runtime entrypoint detected/);
  assert.match(result.stdout, /PASS cursor entrypoint references \.ai-harness\//);
});

runTest("install.sh doctor fails before install with useful output", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doctor-fail-"));
  initFakeGitWorkTree(tmp);

  const result = runInstallSh(["doctor", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /FAIL \.ai-harness missing/);
  assert.match(result.stdout + result.stderr, /FAIL \.harness missing/);
  assert.match(result.stdout + result.stderr, /FAIL no runtime entrypoint detected/);
});

runTest("primary docs prefer aih.sh lifecycle commands", () => {
  const simpleCli = fs.readFileSync(path.join(repoRoot, "docs", "simple-cli-ux.md"), "utf8");
  const pluginUx = fs.readFileSync(path.join(repoRoot, "docs", "plugin-install-ux.md"), "utf8");

  assert.match(simpleCli, /sh aih\.sh uninstall/);
  assert.doesNotMatch(simpleCli, /sh install\.sh uninstall/);
  assert.match(pluginUx, /sh aih\.sh update/);
});

runTest("README shell fallback section documents aih.sh", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /Shell fallback/i);
  assert.match(readme, /sh aih\.sh install/);
});

runTest("npx-cli-ux documents Windows sh requirement", () => {
  const doc = fs.readFileSync(path.join(repoRoot, "docs", "npx-cli-ux.md"), "utf8");
  assert.match(doc, /Git Bash|WSL/);
  assert.match(doc, /v0\.10\.x/);
});

runTest("aih.ps1 includes clear missing sh guidance", () => {
  const script = fs.readFileSync(aihPs1Path, "utf8");

  assert.match(script, /sh was not found\./);
  assert.match(script, /Install Git for Windows and run from Git Bash, or install WSL\./);
  assert.match(script, /Native PowerShell mode is planned\./);
});

runTest("aih.ps1 help includes -Yes", () => {
  const script = fs.readFileSync(aihPs1Path, "utf8");

  assert.match(script, /install -Runtime cursor -Yes/);
  assert.match(script, /Without -Yes/);
});

runTest("aih.ps1 warns about non-Git target in private project mode", () => {
  const script = fs.readFileSync(aihPs1Path, "utf8");

  assert.match(script, /target is not a Git repo/);
  assert.match(script, /private \.git\/info\/exclude cannot be updated/);
  assert.match(script, /git init/);
});

runTest("aih.sh doctor message includes git init remediation", () => {
  const script = fs.readFileSync(aihShPath, "utf8");

  assert.match(
    script,
    /FAIL target is not a Git repo — run git init or run inside a cloned repository/
  );
});

runTest("package.json bin has ai-engineering-harness", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.equal(pkg.bin["ai-engineering-harness"], "./bin/aih.js");
});

runTest("package.json bin has aih", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.equal(pkg.bin.aih, "./bin/aih.js");
});

runTest("bin/aih.js exists with Node shebang", () => {
  assert.ok(fs.existsSync(aihBinPath));
  const head = fs.readFileSync(aihBinPath, "utf8").split("\n")[0];
  assert.match(head, /^#!\/usr\/bin\/env node/);
});

runTest("package.json name is ai-engineering-harness", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.equal(pkg.name, "ai-engineering-harness");
  assert.equal(pkg.private, false);
});

runTest("package.json files excludes test directory", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.ok(Array.isArray(pkg.files));
  assert.equal(pkg.files.includes("test/"), false);
  assert.equal(pkg.files.includes("examples/"), false);
  assert.ok(pkg.files.includes("bin/"));
  assert.ok(pkg.files.includes("aih.sh"));
});

runTest("aih cli help mentions npx ai-engineering-harness install", () => {
  const result = runAihCli(["--help"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /npx ai-engineering-harness install/);
});

runTest("cli provider model includes active and fallback providers", () => {
  const {
    PROVIDERS,
    ACTIVE_PROVIDER_IDS,
    FALLBACK_PROVIDER_IDS,
    SUPPORTED_PROVIDER_IDS
  } = require(path.join(repoRoot, "lib", "cli-providers.js"));
  for (const id of ["cursor", "claude", "codex", "gemini", "generic", "manual"]) {
    assert.ok(PROVIDERS.some((p) => p.id === id), `missing provider ${id}`);
  }
  assert.ok(!PROVIDERS.some((p) => p.id === "opencode"));
  assert.deepEqual(ACTIVE_PROVIDER_IDS, ["claude", "cursor", "codex", "gemini"]);
  assert.deepEqual(FALLBACK_PROVIDER_IDS, ["generic", "manual"]);
  assert.deepEqual(SUPPORTED_PROVIDER_IDS, ["claude", "cursor", "codex", "gemini", "generic", "manual"]);
  const claude = PROVIDERS.find((p) => p.id === "claude");
  assert.equal(claude.priority, "primary");
});

runTest("cli antigravity provider is disabled planned", () => {
  const { PROVIDERS } = require(path.join(repoRoot, "lib", "cli-providers.js"));
  const ag = PROVIDERS.find((p) => p.id === "antigravity");
  assert.equal(ag.implemented, false);
  assert.match(ag.description, /planned/i);
});

runTest("README primary quickstart is npx ai-engineering-harness install", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const quickstart = readme.slice(readme.indexOf("## Quickstart"));
  const npxPos = quickstart.indexOf("npx ai-engineering-harness install");
  const curlPos = quickstart.indexOf("curl -fsSL");
  assert.ok(npxPos >= 0);
  if (curlPos >= 0) {
    assert.ok(npxPos < curlPos, "npx quickstart should appear before curl fallback");
  }
});

runTest("README does not present curl aih.sh as primary quickstart", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const quickstart = readme.slice(readme.indexOf("## Quickstart"), readme.indexOf("## The loop"));
  const firstFence = quickstart.match(/```bash\r?\n([\s\S]*?)```/);
  assert.ok(firstFence);
  assert.match(firstFence[1], /npx ai-engineering-harness install/);
  assert.doesNotMatch(firstFence[1], /curl -fsSL/);
});

runTest("README keeps aih.sh as shell fallback", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /Shell fallback/i);
  assert.match(readme, /aih\.sh/);
});

runTest("non-interactive aih cli install without provider fails clearly", () => {
  const result = runAihCli(["install", "--yes"], {
    env: { ...process.env, CI: "1" }
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr + result.stdout, /No provider selected/);
});

runTest("non-interactive aih cli install dry-run with cursor provider", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-dry-"));
  initFakeGitWorkTree(tmp);
  const result = runAihCli(
    ["install", "--provider", "cursor", "--yes", "--dry-run", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /WOULD|Will install|\.cursor\/rules/i);
  assert.match(result.stdout, /\.gitignore/);
});

runTest("npx-cli-ux documents detection as recommendation only", () => {
  const doc = fs.readFileSync(path.join(repoRoot, "docs", "npx-cli-ux.md"), "utf8");
  assert.match(doc, /recommendation only|recommends only|not auto-install/i);
});

runTest("npm pack dry-run excludes test fixtures", () => {
  const result = childProcess.spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: true
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const entries = JSON.parse(result.stdout.trim());
  const packEntry = Array.isArray(entries) ? entries[0] : entries;
  const files = packEntry.files.map((f) => f.path);
  assert.equal(files.some((p) => p.startsWith("test/")), false);
  assert.equal(files.some((p) => p.startsWith("examples/")), false);
  assert.ok(files.some((p) => p === "bin/aih.js"));
  assert.ok(files.some((p) => p === "aih.sh"));
});

runTest("aih cli status delegates to shell backend", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-status-"));
  initFakeGitWorkTree(tmp);
  const result = runAihCli(["status", "--target", tmp], { env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ai-engineering-harness status|git repo/i);
});

runTest("interactive install does not auto-assign providers from detection alone", () => {
  const installSrc = fs.readFileSync(path.join(repoRoot, "lib", "cli-commands", "install.js"), "utf8");
  const uiSrc = fs.readFileSync(path.join(repoRoot, "lib", "cli-ui.js"), "utf8");
  assert.match(installSrc, /ui\.selectProviders/);
  assert.doesNotMatch(installSrc, /providers\s*=\s*detectRecommendedProviders/);
  assert.match(installSrc, /recommended: recommended\.includes/);
  assert.match(uiSrc, /detected/);
});

runTest("package.json includes @clack/prompts dependency", () => {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  assert.ok(pkg.dependencies);
  assert.ok(pkg.dependencies["@clack/prompts"]);
  assert.equal(pkg.version, "0.11.0");
});

runTest("cli-ui uses clack note(message, title) signature (not object title)", () => {
  const uiSrc = fs.readFileSync(path.join(repoRoot, "lib", "cli-ui.js"), "utf8");
  assert.doesNotMatch(uiSrc, /note\([^)]*,\s*\{\s*title:/);
});

runTest("cli-ui exports wizard helpers", () => {
  const ui = require(path.join(repoRoot, "lib", "cli-ui.js"));
  for (const name of [
    "introBanner",
    "selectProviders",
    "selectInstallMode",
    "confirmInitHarness",
    "confirmInstallCache",
    "showInstallPlan",
    "showUpdatePlan",
    "showUninstallPlan",
    "showSuccess",
    "showCancel",
    "showWarning",
    "showError",
    "runWithSpinner",
    "formatStatus",
    "formatDoctor",
    "useInteractiveUi"
  ]) {
    assert.equal(typeof ui[name], "function", `missing export ${name}`);
  }
});

runTest("bin/cli-ui re-exports lib/cli-ui", () => {
  const binUi = require(path.join(repoRoot, "bin", "cli-ui.js"));
  const libUi = require(path.join(repoRoot, "lib", "cli-ui.js"));
  assert.equal(binUi.formatDoctor, libUi.formatDoctor);
});

runTest("cli-args parses --verbose flag", () => {
  const { parseArgv } = require(path.join(repoRoot, "lib", "cli-args.js"));
  const opts = parseArgv(["node", "aih", "install", "--provider", "cursor", "--yes", "--verbose"]);
  assert.equal(opts.verbose, true);
});

runTest("cli-args normalizes --provider and deprecated --runtime into providers only", () => {
  const { parseArgv } = require(path.join(repoRoot, "lib", "cli-args.js"));
  const providerOpts = parseArgv(["node", "aih", "install", "--provider", "cursor,claude", "--yes"]);
  const runtimeOpts = parseArgv(["node", "aih", "install", "--runtime", "cursor,claude", "--yes"]);
  assert.deepEqual(providerOpts.providers, ["cursor", "claude"]);
  assert.deepEqual(runtimeOpts.providers, ["cursor", "claude"]);
  assert.equal(Object.prototype.hasOwnProperty.call(providerOpts, "runtime"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(runtimeOpts, "runtime"), false);
  assert.equal(runtimeOpts.runtimeAliasUsed, true);
});

runTest("cli-backend defaults to capture unless verbose", () => {
  const src = fs.readFileSync(path.join(repoRoot, "lib", "cli-backend.js"), "utf8");
  assert.match(src, /capture/);
  assert.match(src, /verbose/);
});

runTest("cli-backend shell fallback wording does not mention old v0.10.x", () => {
  const { SH_MISSING_MSG } = require(path.join(repoRoot, "lib", "cli-backend.js"));
  assert.doesNotMatch(SH_MISSING_MSG, /v0\.10\.x/i);
  assert.match(SH_MISSING_MSG, /bundled shell backend/i);
  assert.match(SH_MISSING_MSG, /Git Bash|WSL/i);
});

runTest("README links wizard UX docs", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /terminal-wizard-ux\.md/);
  assert.match(readme, /npx-cli-ux\.md/);
});

runTest("validate requires terminal-wizard-ux doc", () => {
  const validateSrc = fs.readFileSync(path.join(repoRoot, "lib", "validate.js"), "utf8");
  assert.match(validateSrc, /docs\/terminal-wizard-ux\.md/);
  assert.ok(fs.existsSync(path.join(repoRoot, "docs", "terminal-wizard-ux.md")));
});

runTest("non-interactive install plan includes Will install block", () => {
  const { buildInstallPlan } = require(path.join(repoRoot, "lib", "cli-plan.js"));
  const plan = buildInstallPlan({
    providers: ["cursor"],
    initHarness: true,
    installCache: true,
    mode: "project-private",
    isGit: true
  });
  assert.ok(plan.willInstall.length > 0);
  assert.ok(plan.willNotModify.includes(".gitignore"));
});

runTest("aih cli help mentions --verbose", () => {
  const result = runAihCli(["--help"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /--verbose/);
});

runTest("runtime command catalog generates harness-plan with activation refs", () => {
  const tmp = makeTempDir();
  const {
    installRuntimeCommandCatalog,
    WORKFLOW_COMMANDS,
    CLI_DIAGNOSTIC_COMMANDS
  } = require(path.join(repoRoot, "runtime-command-catalog.js"));
  installRuntimeCommandCatalog(tmp, { dryRun: false, force: true });
  const planPath = path.join(tmp, ".ai-harness/runtime-commands/harness-plan.md");
  assert.ok(fs.existsSync(planPath));
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness/runtime-commands/harness-status.md")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".ai-harness/runtime-commands/harness-doctor.md")), false);
  const text = fs.readFileSync(planPath, "utf8");
  assert.match(text, /harness-plan/);
  assert.doesNotMatch(text, /^# \/harness-plan/m);
  assert.match(text, /\.ai-harness\/activation\.md/);
  assert.match(text, /\.ai-harness\/commands\/harness-plan\.md/);
  const manifest = JSON.parse(fs.readFileSync(path.join(tmp, ".ai-harness/manifest.json"), "utf8"));
  assert.equal(manifest.commandNamespace, "harness");
  assert.ok(manifest.canonicalCommands.includes("harness-plan"));
  assert.deepEqual(
    WORKFLOW_COMMANDS.map((command) => command.canonical),
    [
      "harness-start",
      "harness-map",
      "harness-discuss",
      "harness-plan",
      "harness-run",
      "harness-verify",
      "harness-ship",
      "harness-remember"
    ]
  );
  assert.deepEqual(CLI_DIAGNOSTIC_COMMANDS, ["status", "doctor"]);
  assert.equal(manifest.canonicalCommands.includes("harness-status"), false);
  assert.equal(manifest.canonicalCommands.includes("harness-doctor"), false);
  assert.ok(manifest.commandSurface);
  assert.equal(manifest.commandSurface.providers.cursor.mode, "plugin-ready");
  assert.equal(
    Object.prototype.hasOwnProperty.call(manifest.commandSurface.providers.claude, "actualInvocation"),
    false
  );
  assert.match(manifest.commandSurface.providers.claude.workflowInvocation, /\/harness-plan/);
});

runTest("runtime-command-surface doc has provider capability matrix", () => {
  const doc = fs.readFileSync(path.join(repoRoot, "docs/runtime-command-surface.md"), "utf8");
  assert.match(doc, /plugin-ready/);
  assert.match(doc, /plugin-packaging|fallback-only/);
  assert.match(doc, /native-plugin/);
  assert.doesNotMatch(doc, /\| OpenCode \|/);
});

runTest("README does not claim universal native slash commands", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /Plugin-ready|plugin packaging|marketplace pending|Slash commands vary/i);
  assert.match(readme, /harness-plan/);
  assert.doesNotMatch(readme, /Native `\/harness-\*`.*Yes/i);
  assert.doesNotMatch(readme, /harness:plan|\/harness:plan|harness_plan|\/harness plan/i);
});

runTest("active docs validation rejects forbidden workflow alias forms", () => {
  const tmp = makeTempDir();
  fs.mkdirSync(path.join(tmp, "docs"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "README.md"), "Use /harness:plan or harness_plan.\n", "utf8");
  const failures = [];
  assertHyphenCommandNamingInActiveDocs(tmp, failures);
  assert.ok(failures.some((failure) => /hyphen-form command IDs/i.test(failure)));
});

runTest("pack contains provider plugin manifests", () => {
  const cursor = JSON.parse(
    fs.readFileSync(path.join(repoRoot, ".cursor-plugin/plugin.json"), "utf8")
  );
  assert.equal(cursor.commands, "./commands/");
  assert.equal(cursor.skills, "./skills/");
  assert.ok(fs.existsSync(path.join(repoRoot, ".claude-plugin/plugin.json")));
  assert.ok(fs.existsSync(path.join(repoRoot, "gemini-extension.json")));
  assert.equal(fs.existsSync(path.join(repoRoot, ".opencode/INSTALL.md")), false);
});

runTest(".codex-plugin/plugin.json has skills and interface (no commands field)", () => {
  const codex = JSON.parse(
    fs.readFileSync(path.join(repoRoot, ".codex-plugin/plugin.json"), "utf8")
  );
  assert.equal(codex.name, "ai-engineering-harness");
  assert.equal(codex.skills, "./skills/");
  assert.ok(codex.interface);
  assert.ok(codex.interface.displayName);
  assert.ok(Array.isArray(codex.interface.defaultPrompt));
  assert.equal(codex.commands, undefined);
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(pkg.files.includes(".codex-plugin/"));
});

runTest("codex provider model says nativeSlashCommands false", () => {
  const { PROVIDERS } = require(path.join(repoRoot, "lib", "cli-providers.js"));
  const codex = PROVIDERS.find((p) => p.id === "codex");
  assert.equal(codex.nativeSlashCommands, false);
  assert.equal(codex.pluginManifest, ".codex-plugin/plugin.json");
  assert.match(codex.installMode, /plugin-packaging/);
});

runTest("install.sh codex dry-run does not create fake slash command paths", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-codex-dry-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    ["install", "--runtime", "codex", "--scope", "project", "--yes", "--dry-run", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".codex/commands")), false);
  assert.equal(fs.existsSync(path.join(tmp, ".opencode/commands/harness-plan.md")), false);
  assert.match(result.stdout + result.stderr, /\/plugins|plugin/i);
});

runTest("harness-discuss command is action-oriented when context exists", () => {
  const discuss = fs.readFileSync(path.join(repoRoot, "commands/harness-discuss.md"), "utf8");
  assert.match(discuss, /Do not ask for clarification when sufficient local context exists/i);
  assert.match(discuss, /\.harness\/REVIEW\.md/);
  assert.match(discuss, /What output do you need/i);
  assert.match(discuss, /Forbidden when REVIEW\.md exists/);
  assert.match(discuss, /at most one/i);
});

runTest("generated runtime harness-discuss references review behavior", () => {
  const tmp = makeTempDir();
  const { installRuntimeCommandCatalog } = require(path.join(repoRoot, "runtime-command-catalog.js"));
  installRuntimeCommandCatalog(tmp, { force: true });
  const rt = fs.readFileSync(
    path.join(tmp, ".ai-harness/runtime-commands/harness-discuss.md"),
    "utf8"
  );
  assert.match(rt, /\.harness\/REVIEW\.md/);
  assert.match(rt, /do not ask what output/i);
  assert.match(rt, /\.ai-harness\/commands\/harness-discuss\.md/);
});

runTest("harness-command-behavior doc exists with one closing question rule", () => {
  const doc = fs.readFileSync(path.join(repoRoot, "docs/harness-command-behavior.md"), "utf8");
  assert.match(doc, /one closing question/i);
  assert.match(doc, /harness-discuss/);
  assert.match(doc, /REVIEW\.md/);
});

runTest("README links command behavior policy for discuss", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /harness-discuss/);
  assert.match(readme, /harness-command-behavior/);
  const behavior = fs.readFileSync(path.join(repoRoot, "docs/harness-command-behavior.md"), "utf8");
  assert.match(behavior, /REVIEW\.md/);
});

runTest("README does not claim Codex /harness-plan slash", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const codexRow = readme.split("| Codex |")[1]?.split("\n")[0] || "";
  assert.doesNotMatch(codexRow, /\/harness-plan/);
  assert.match(readme, /codex-plugin-support/i);
});

runTest("install.sh claude install creates native command files harness-plan.md", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-claude-cmd-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    ["install", "--runtime", "claude", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const claudePlan = path.join(tmp, ".claude/commands/harness-plan.md");
  assert.ok(fs.existsSync(claudePlan));
  assert.match(fs.readFileSync(claudePlan, "utf8"), /\.ai-harness\/activation\.md/);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness/runtime-commands/harness-plan.md")));
});

runTest("install.sh cursor install creates fallback rule only (no native slash claim)", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-cursor-cmd-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    ["install", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".cursor/commands/harness-plan.md")), false);
  const rule = fs.readFileSync(
    path.join(tmp, ".cursor/rules/ai-engineering-harness-commands.mdc"),
    "utf8"
  );
  assert.ok(rule.includes("fallback"));
  assert.match(rule, /harness-plan/);
  const manifest = JSON.parse(fs.readFileSync(path.join(tmp, ".ai-harness/manifest.json"), "utf8"));
  assert.equal(manifest.commandSurface.providers.cursor.mode, "plugin-ready");
});

runTest("AGENTS.md bootstrap includes harness command alias section after generic install", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-generic-cmd-"));
  initFakeGitWorkTree(tmp);
  const result = runInstallSh(
    ["install", "--runtime", "generic", "--scope", "project", "--yes", "--target", tmp],
    { env: { PATH: process.env.PATH } }
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const agents = fs.readFileSync(path.join(tmp, "AGENTS.md"), "utf8");
  assert.match(agents, /Harness commands/);
  assert.match(agents, /harness-plan/);
  assert.match(agents, /\.ai-harness\/runtime-commands\/harness-plan\.md/);
  assert.match(agents, /Do not assume a native/);
});

runTest("uninstall claude removes harness command directory", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-uninstall-cmd-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(["install", "--runtime", "claude", "--yes", "--target", tmp], {
      env: { PATH: process.env.PATH }
    }).status,
    0
  );
  assert.ok(fs.existsSync(path.join(tmp, ".claude/commands/harness-plan.md")));
  const result = runInstallSh(["uninstall", "--runtime", "claude", "--yes", "--target", tmp], {
    env: { PATH: process.env.PATH }
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.existsSync(path.join(tmp, ".claude/commands/harness-plan.md")), false);
  assert.ok(fs.existsSync(path.join(tmp, ".ai-harness/runtime-commands/harness-plan.md")));
});

runTest("providerCommandSupport marks cursor plugin-ready without opencode entry", () => {
  const { providerCommandSupport, PROVIDER_COMMAND_SUPPORT } = require(
    path.join(repoRoot, "runtime-command-catalog.js")
  );
  assert.equal(providerCommandSupport("cursor").status, "plugin-ready");
  assert.equal(providerCommandSupport("claude").status, "native-plugin");
  assert.equal(providerCommandSupport("codex").status, "plugin-packaging");
  assert.equal(providerCommandSupport("codex").nativeSlashCommands, false);
  assert.equal(PROVIDER_COMMAND_SUPPORT.opencode, undefined);
});

runTest("doctor warns cursor plugin-ready via command-surface-report", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doc-cursor-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runInstallSh(["install", "--runtime", "cursor", "--scope", "project", "--yes", "--target", tmp], {
      env: { PATH: process.env.PATH }
    }).status,
    0
  );
  const { formatDoctorCommandLines } = require(path.join(
    repoRoot,
    "lib/command-surface-report.js"
  ));
  const lines = formatDoctorCommandLines(tmp, ["cursor"]);
  assert.ok(lines.some((l) => /WARN.*Cursor.*plugin-ready/i.test(l)));
});

runTest("docs provider-native-command-research exists", () => {
  const doc = fs.readFileSync(
    path.join(repoRoot, "docs/provider-native-command-research.md"),
    "utf8"
  );
  assert.match(doc, /superpowers/i);
  assert.match(doc, /removed from active scope v0\.11\.0/i);
});

runTest("manifest separates nativeCommands from fallbackActivation", () => {
  const tmp = makeTempDir();
  const { installRuntimeCommandCatalog, installProviderCommandSurface } = require(
    path.join(repoRoot, "runtime-command-catalog.js")
  );
  installRuntimeCommandCatalog(tmp, { force: true });
  installProviderCommandSurface("claude", "project", tmp, repoRoot, { force: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(tmp, ".ai-harness/manifest.json"), "utf8"));
  const cl = manifest.commandSurface.providers.claude;
  assert.equal(cl.nativeCommands, true);
  assert.equal(cl.fallbackActivation, true);
});

runTest("aih.sh doctor reports runtime-commands after claude install", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doctor-cmd-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runAihSh(
      ["install", "--runtime", "claude", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );
  const result = runAihSh(["doctor", "--target", tmp], { env: { PATH: process.env.PATH } });
  assert.match(result.stdout, /runtime-commands exists/);
  assert.match(result.stdout, /activation\.md exists/);
});

runTest("detectInstalledProviders excludes legacy OpenCode from normal installed providers", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-detect-legacy-"));
  fs.mkdirSync(path.join(tmp, ".opencode", "plugins"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".opencode", "plugins", "ai-engineering-harness.js"), "// legacy\n", "utf8");
  const {
    detectInstalledProviders,
    detectLegacyProviderResidue
  } = require(path.join(repoRoot, "lib", "cli-detect.js"));
  assert.deepEqual(detectInstalledProviders(tmp), []);
  assert.deepEqual(detectLegacyProviderResidue(tmp), ["opencode"]);
});

runTest("aih.sh doctor reports workflow PASS for approved plan, verification evidence, and typed memory", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doctor-workflow-pass-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runAihSh(
      ["install", "--runtime", "claude", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );
  fs.writeFileSync(path.join(tmp, ".harness", "GOAL.md"), "# Goal\n", "utf8");

  fs.writeFileSync(
    path.join(tmp, ".harness", "PLAN.md"),
    `# Plan

## Approval Status

status: approved
approved_by: test
approved_at: 2026-06-03
notes: approved in fixture
`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(tmp, ".harness", "VERIFY.md"),
    `# Verification

## Status

status: passed
summary: focused checks passed

## Tests Run

| Command | Exit Code | Result | Notes |
|---|---:|---|---|
| \`npm test\` | 0 | passed | focused doctor fixture |

## Evidence

- Commands executed: \`npm test\`
- Output summary: 1 suite passed
`,
    "utf8"
  );
  fs.writeFileSync(path.join(tmp, ".harness", "DECISIONS.md"), "# Decisions\n", "utf8");
  fs.writeFileSync(path.join(tmp, ".harness", "HAZARDS.md"), "# Hazards\n", "utf8");
  fs.writeFileSync(path.join(tmp, ".harness", "INDEX.md"), "# Index\n", "utf8");

  const result = runAihSh(["doctor", "--target", tmp], { env: { PATH: process.env.PATH } });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Harness workflow/i);
  assert.match(result.stdout, /Goal\s+✅ ready/i);
  assert.match(result.stdout, /Plan\s+✅ approved/i);
  assert.match(result.stdout, /Next allowed command:\s*\n\s*harness-ship/i);
  assert.match(result.stdout, /PASS \.harness\/PLAN\.md approval status approved/);
  assert.match(result.stdout, /PASS \.harness\/VERIFY\.md contains verification evidence/);
  assert.match(result.stdout, /PASS typed memory artifacts present/);
});

runTest("aih.sh doctor warns on unapproved plan, fails weak verification evidence, and warns on missing typed memory", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "harness-doctor-workflow-fail-"));
  initFakeGitWorkTree(tmp);
  assert.equal(
    runAihSh(
      ["install", "--runtime", "claude", "--scope", "project", "--init-harness", "--yes", "--target", tmp],
      { env: { PATH: process.env.PATH } }
    ).status,
    0
  );
  fs.writeFileSync(path.join(tmp, ".harness", "GOAL.md"), "# Goal\n", "utf8");

  fs.writeFileSync(
    path.join(tmp, ".harness", "PLAN.md"),
    `# Plan

## Approval Status

status: draft
approved_by:
approved_at:
notes:
`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(tmp, ".harness", "VERIFY.md"),
    `# Verification

## Status

status: passed
summary: claimed pass without real evidence

## Tests Run

| Command | Exit Code | Result | Notes |
|---|---:|---|---|
| | | | |

## Evidence

- Commands executed:
- Files inspected:
- Link, log, or snippet:
`,
    "utf8"
  );
  fs.rmSync(path.join(tmp, ".harness", "DECISIONS.md"), { force: true });
  fs.rmSync(path.join(tmp, ".harness", "HAZARDS.md"), { force: true });
  fs.rmSync(path.join(tmp, ".harness", "INDEX.md"), { force: true });

  const result = runAihSh(["doctor", "--target", tmp], { env: { PATH: process.env.PATH } });

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /Harness workflow/i);
  assert.match(result.stdout, /Approval\s+⛔ required/i);
  assert.match(result.stdout, /Run\s+⛔ blocked/i);
  assert.match(result.stdout, /Next allowed command:\s*\n\s*harness-plan/i);
  assert.match(result.stdout, /Blocking reason:\s*\n\s*PLAN\.md is not approved\./i);
  assert.match(result.stdout, /WARN \.harness\/PLAN\.md approval status is draft/);
  assert.match(result.stdout, /FAIL \.harness\/VERIFY\.md claims completed verification without concrete evidence/);
  assert.match(result.stdout, /WARN typed memory artifacts missing: DECISIONS\.md, HAZARDS\.md, INDEX\.md/);
});

runTest("README provider support lists four active providers without OpenCode install", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const section = readme.slice(readme.indexOf("## Providers"));
  assert.match(section, /Claude Code.*Primary/i);
  assert.match(section, /Cursor.*Secondary/i);
  assert.match(section, /Codex.*Experimental/i);
  assert.match(section, /Gemini.*Experimental/i);
  assert.match(section, /OpenCode.*Out of scope/i);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
