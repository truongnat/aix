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
