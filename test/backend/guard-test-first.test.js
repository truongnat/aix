const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  hasFailingAssertion,
  findCorrespondingTestFile,
  guardTestFirst,
} = require("../../hooks/core/guard-test-first.js");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

test("hasFailingAssertion matches call-style expect().toBe(false)", () => {
  const content = `
    import { describe, it, expect } from "vitest";
    it("fails first", () => {
      expect(result).toBe(false);
    });
  `;
  assert.equal(hasFailingAssertion(content), true);
});

test("hasFailingAssertion matches expect().not matchers", () => {
  const content = "expect(value).not.toEqual(1);";
  assert.equal(hasFailingAssertion(content), true);
});

test("hasFailingAssertion ignores property-style expect.x patterns", () => {
  const content = "expect.x.toBe(false);";
  assert.equal(hasFailingAssertion(content), false);
});

test("guardTestFirst blocks source files without a failing assertion test", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "guard-test-first-"));
  const sessionId = "test-first";
  const sessionDir = path.join(tmpRoot, ".harness", "sessions", sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "lib"), { recursive: true });
  const sourcePath = path.join(tmpRoot, "lib", "widget.ts");
  const testPath = path.join(tmpRoot, "lib", "widget.test.ts");
  fs.writeFileSync(sourcePath, "export const widget = 1;\n");
  fs.writeFileSync(testPath, "expect(widget).toBe(1);\n");
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "Add widget in lib/widget.ts\n");
  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), `session: sessions/${sessionId}\n`);

  const previousCwd = process.cwd();
  process.chdir(tmpRoot);
  try {
    const result = guardTestFirst({
      session: `.harness/sessions/${sessionId}`,
      files: sourcePath,
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /no failing assertion/i);
    assert.equal(findCorrespondingTestFile(sourcePath, tmpRoot), testPath);
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("guardTestFirst allows source files when the test has a failing assertion", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "guard-test-first-"));
  const sessionId = "test-first-pass";
  const sessionDir = path.join(tmpRoot, ".harness", "sessions", sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(path.join(tmpRoot, "lib"), { recursive: true });
  const sourcePath = path.join(tmpRoot, "lib", "widget.ts");
  const testPath = path.join(tmpRoot, "lib", "widget.test.ts");
  fs.writeFileSync(sourcePath, "export const widget = 1;\n");
  fs.writeFileSync(testPath, "expect(widget).toBe(false);\n");
  fs.writeFileSync(path.join(sessionDir, "GOAL.md"), "Add widget in lib/widget.ts\n");
  fs.writeFileSync(path.join(tmpRoot, ".harness", "STATE.md"), `session: sessions/${sessionId}\n`);

  const previousCwd = process.cwd();
  process.chdir(tmpRoot);
  try {
    const result = guardTestFirst({
      session: `.harness/sessions/${sessionId}`,
      files: sourcePath,
    });
    assert.equal(result.ok, true, result.reason);
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
