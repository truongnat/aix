const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { installHarness, parseArgs } = require(path.join(repoRoot, "install.js"));
const { validateRepository } = require(path.join(repoRoot, "validate.js"));
const invalidFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness");
const invalidHarnessProfileFixture = path.join(repoRoot, "test", "fixtures", "invalid-harness-profile");

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
  assert.equal(fs.existsSync(path.join(targetDir, "AGENTS.md")), false);
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

if (process.exitCode) {
  process.exit(process.exitCode);
}
