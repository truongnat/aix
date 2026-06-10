#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  resolveSessionDir,
} = require("./_util.js");

const SPEC = {
  files: { required: true },
  session: { required: true },
};

function findCorrespondingTestFile(sourceFile, repoRoot) {
  const relativePath = path.relative(repoRoot, sourceFile);
  const parsed = path.parse(relativePath);

  // Common test file patterns
  const testPatterns = [
    path.join(parsed.dir, `${parsed.name}.test${parsed.ext}`),
    path.join(parsed.dir, `${parsed.name}.spec${parsed.ext}`),
    path.join(parsed.dir, "test", `${parsed.name}.test${parsed.ext}`),
    path.join(parsed.dir, "__tests__", `${parsed.name}.test${parsed.ext}`),
    path.join("test", parsed.dir, `${parsed.name}.test${parsed.ext}`),
    path.join("tests", parsed.dir, `${parsed.name}.test${parsed.ext}`),
  ];

  for (const testPattern of testPatterns) {
    const testPath = path.join(repoRoot, testPattern);
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }

  return null;
}

function hasFailingAssertion(testContent) {
  const failingPatterns = [
    /assert\.(fail|false|notOk|notStrictEqual|notDeepStrictEqual)/,
    /expect\([^)]+\)\.toBe\(\s*false\s*\)/,
    /expect\([^)]+\)\.not\./,
    /expect\([^)]+\)\.toThrow\(/,
    /\.should\.\w+\.not\./,
  ];

  return failingPatterns.some((pattern) => pattern.test(testContent));
}

function guardTestFirst(options) {
  const sessionDir = resolveSessionDir(options.session);
  const repoRoot = findHarnessRoot(sessionDir);
  const files = String(options.files || "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const violations = [];

  for (const file of files) {
    const relativePath = path.relative(repoRoot, file);

    // Only check source files (not test files themselves)
    if (
      relativePath.includes("/test/") ||
      relativePath.includes("/__tests__/") ||
      relativePath.includes("\\test\\") ||
      relativePath.includes("\\__tests__\\") ||
      relativePath.endsWith(".test.js") ||
      relativePath.endsWith(".test.ts") ||
      relativePath.endsWith(".spec.js") ||
      relativePath.endsWith(".spec.ts")
    ) {
      continue;
    }

    // Check for corresponding test file
    const testFile = findCorrespondingTestFile(file, repoRoot);

    if (!testFile) {
      violations.push({
        file: relativePath,
        reason: "No corresponding test file found",
      });
      continue;
    }

    // Check if test file has failing assertion
    const testContent = fs.readFileSync(testFile, "utf8");
    if (!hasFailingAssertion(testContent)) {
      violations.push({
        file: relativePath,
        testFile: path.relative(repoRoot, testFile),
        reason: "Test file exists but has no failing assertion (test may already pass)",
      });
    }
  }

  if (violations.length > 0) {
    const violationDetails = violations
      .map((v) => `${v.file}: ${v.reason}${v.testFile ? ` (${v.testFile})` : ""}`)
      .join("\n  ");

    return {
      ok: false,
      status: "blocked",
      reason: `Test-first discipline violated:\n  ${violationDetails}`,
      questions: [
        "Create or update the corresponding test file first",
        "Ensure test has a failing assertion before implementing the feature",
      ],
    };
  }

  return {
    ok: true,
    status: "ready",
  };
}

function main() {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("guard-test-first.js", [
        "Usage:",
        "  node hooks/core/guard-test-first.js --files file1.ts,file2.ts --session .harness/sessions/<id> [--json]",
        "",
        "Checks:",
        "  Ensures source file edits have corresponding test files with failing assertions",
        "",
        "Exit code 0 when test-first discipline satisfied, 1 when violated.",
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session);
    const result = guardTestFirst(options);
    try {
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "guard-test-first",
        status: result.status,
        ok: result.ok,
        reason: result.reason || null,
      });
    } catch {
      // Event logging is best-effort
    }
    emitResult(result, options.json);
    exitFromResult(result);
  } catch (error) {
    const result = { ok: false, status: "failed", reason: error.message };
    emitResult(result, process.argv.includes("--json"));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { guardTestFirst, hasFailingAssertion, findCorrespondingTestFile };
