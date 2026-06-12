const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { initHarnessProfile } = require("../../dist/features/install/infrastructure/harness-skeleton.js");

const harnessSkeletonSource = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "features",
  "install",
  "infrastructure",
  "harness-skeleton.ts"
);

const EXPECTED = [
  "HARNESS.md",
  "TEAM.md",
  "SKILLS.md",
  "WORKFLOW.md",
  "GATES.md",
  "MEMORY.md",
  "DECISIONS.md",
  "HAZARDS.md",
  "INDEX.md",
  "config.json",
  "skills/.gitkeep",
  "memory/workers/.gitkeep",
  "specs/.gitkeep",
  "policies.json",
  "goals/.gitkeep",
];

test("initHarnessProfile creates the full .harness skeleton", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  const result = initHarnessProfile({ targetAbs: dir, dryRun: false });
  for (const rel of EXPECTED) {
    assert.equal(fs.existsSync(path.join(dir, ".harness", rel)), true, `${rel} should exist`);
  }
  // result tracks created files
  assert.equal(result.created.length, EXPECTED.length);
  assert.equal(result.overwritten.length, 0);
  assert.equal(result.skipped.length, 0);
});

test("every skeleton markdown file has an H1 heading and trailing newline", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  initHarnessProfile({ targetAbs: dir, dryRun: false });
  for (const rel of EXPECTED.filter((f) => f.endsWith(".md"))) {
    const body = fs.readFileSync(path.join(dir, ".harness", rel), "utf8");
    assert.ok(body.length > 0, `${rel} should be non-empty`);
    assert.ok(body.startsWith("# "), `${rel} should start with an H1`);
    assert.ok(body.endsWith("\n"), `${rel} should end with newline`);
  }
});

test("initHarnessProfile dryRun creates nothing but still populates result arrays", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  const result = initHarnessProfile({ targetAbs: dir, dryRun: true });
  // nothing written to disk
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false);
  // planned actions are still reported
  assert.ok(result.created.length >= 9, "dryRun should report planned creates");
  assert.equal(result.overwritten.length, 0);
  assert.equal(result.skipped.length, 0);
});

test("initHarnessProfile does not overwrite an existing file unless forced", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  fs.mkdirSync(path.join(dir, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".harness", "HARNESS.md"), "MINE\n");
  const result = initHarnessProfile({ targetAbs: dir, dryRun: false });
  assert.equal(fs.readFileSync(path.join(dir, ".harness", "HARNESS.md"), "utf8"), "MINE\n");
  // HARNESS.md should be in skipped, the rest created
  assert.ok(result.skipped.includes(".harness/HARNESS.md"));
  assert.equal(result.created.length, EXPECTED.length - 1);
  assert.equal(result.overwritten.length, 0);
});

test("initHarnessProfile overwrites an existing file when force=true", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  fs.mkdirSync(path.join(dir, ".harness"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".harness", "HARNESS.md"), "MINE\n");
  const result = initHarnessProfile({ targetAbs: dir, dryRun: false, force: true });
  const content = fs.readFileSync(path.join(dir, ".harness", "HARNESS.md"), "utf8");
  assert.notEqual(content, "MINE\n");
  assert.ok(content.includes("# Harness Profile"));
  // overwritten array must include the file
  assert.ok(result.overwritten.includes(".harness/HARNESS.md"));
  assert.equal(result.skipped.length, 0);
});

test("writeTargetFile docstring explains newline normalization and first overwrite candidates", () => {
  const source = fs.readFileSync(harnessSkeletonSource, "utf8");

  assert.match(source, /All generated markdown ends with a trailing newline/);
  assert.match(source, /older installers may therefore show a first overwrite/);
});

test("generated harness skeleton sources do not contain placeholder TODO or FIXME markers", () => {
  const sources = [harnessSkeletonSource];

  for (const file of sources) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /\bTODO\b/);
    assert.doesNotMatch(source, /\bFIXME\b/);
  }
});

test("policy skeleton stays aligned without a default scope guard rule", () => {
  const tsSource = fs.readFileSync(harnessSkeletonSource, "utf8");
  const policyGenerator = fs.readFileSync(
    path.join(__dirname, "..", "..", "src", "features", "validate", "infrastructure", "policy", "generator.ts"),
    "utf8"
  );

  assert.doesNotMatch(tsSource, /"id": "scope-guard"/);
  assert.doesNotMatch(tsSource, /"value": "\*\*"/);
  assert.match(policyGenerator, /No default scope-guard rule is enabled\./);
});

test("skeleton files include concrete examples instead of empty placeholders", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hs-"));
  initHarnessProfile({ targetAbs: dir, dryRun: false });

  const harness = fs.readFileSync(path.join(dir, ".harness", "HARNESS.md"), "utf8");
  const skills = fs.readFileSync(path.join(dir, ".harness", "SKILLS.md"), "utf8");
  const workflow = fs.readFileSync(path.join(dir, ".harness", "WORKFLOW.md"), "utf8");
  const gates = fs.readFileSync(path.join(dir, ".harness", "GATES.md"), "utf8");
  const memory = fs.readFileSync(path.join(dir, ".harness", "MEMORY.md"), "utf8");
  const decisions = fs.readFileSync(path.join(dir, ".harness", "DECISIONS.md"), "utf8");
  const hazards = fs.readFileSync(path.join(dir, ".harness", "HAZARDS.md"), "utf8");
  const index = fs.readFileSync(path.join(dir, ".harness", "INDEX.md"), "utf8");
  const config = fs.readFileSync(path.join(dir, ".harness", "config.json"), "utf8");

  assert.match(harness, /harness-start -> harness-discuss -> harness-plan/);
  assert.match(harness, /\.harness\/specs\//);
  assert.match(harness, /\.harness\/memory\/workers\//);
  assert.match(skills, /using-harness/);
  assert.match(skills, /Selected Domain Skills/);
  assert.match(workflow, /\| 1 \| `harness-start` \| always \|/);
  assert.match(workflow, /Domain Selection/);
  assert.match(gates, /`npm test`/);
  assert.match(memory, /Verification impact:/);
  assert.match(memory, /delegated worker/i);
  assert.match(decisions, /## Example/);
  assert.match(hazards, /worktree-backed repo/);
  assert.match(index, /npm test/);
  assert.match(config, /"domains": \[\]/);
});
