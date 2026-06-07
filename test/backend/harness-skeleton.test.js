const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { initHarnessProfile } = require("../../dist/lib/backend/harness-skeleton.js");

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

test("writeTargetFile docstring explains shell-era newline drift and first re-init overwrite candidates", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "..", "lib", "backend", "harness-skeleton.ts"),
    "utf8"
  );

  assert.match(source, /shell functions in aih\.sh use `\$\(\)` command[\s\S]*substitution/);
  assert.match(source, /show a 1-byte difference/);
  assert.match(source, /shell-era path can see the first/);
  assert.match(
    source,
    /TypeScript-backed install or re-init treat those files as changed\/overwrite/
  );
  assert.match(source, /improvement over the shell behaviour/);
});

test("generated harness skeleton sources do not contain placeholder TODO or FIXME markers", () => {
  const sources = [
    path.join(__dirname, "..", "..", "lib", "backend", "harness-skeleton.ts"),
    path.join(__dirname, "..", "..", "aih.sh"),
  ];

  for (const file of sources) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /\bTODO\b/);
    assert.doesNotMatch(source, /\bFIXME\b/);
  }
});

test("shell and TypeScript policy skeletons stay aligned without a default scope guard rule", () => {
  const tsSource = fs.readFileSync(
    path.join(__dirname, "..", "..", "lib", "backend", "harness-skeleton.ts"),
    "utf8"
  );
  const shellSource = fs.readFileSync(path.join(__dirname, "..", "..", "aih.sh"), "utf8");
  const policyGenerator = fs.readFileSync(
    path.join(__dirname, "..", "..", "lib", "policy", "generator.ts"),
    "utf8"
  );

  assert.doesNotMatch(tsSource, /"id": "scope-guard"/);
  assert.doesNotMatch(tsSource, /"value": "\*\*"/);
  assert.doesNotMatch(shellSource, /"id": "scope-guard"/);
  assert.doesNotMatch(shellSource, /"value": "\*\*"/);
  assert.match(policyGenerator, /No default scope-guard rule is enabled\./);
});

test("legacy manual install path emits the same deprecation warning in the shell fallback", () => {
  const shellSource = fs.readFileSync(path.join(__dirname, "..", "..", "aih.sh"), "utf8");

  assert.match(shellSource, /DEPRECATION WARNING/);
  assert.match(shellSource, /This install path \(flat-root\) is deprecated\./);
  assert.match(shellSource, /It will be removed in v1\.1\.0\./);
  assert.match(shellSource, /npx ai-engineering-harness install --provider claude --yes/);
  assert.match(shellSource, /node bin\/aih\.js install for provider-aware installation/);
});
