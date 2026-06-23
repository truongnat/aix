#!/usr/bin/env node
// Purpose: Enforce test-first discipline by requiring failing tests before source edits.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
import * as path from "node:path";
import {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  resolveSessionDir,
} from "../shared/util";

const SPEC = {
  files: { required: true },
  session: { required: true },
};

export function findCorrespondingTestFile(sourceFile: string, repoRoot: string): string | null {
  const relativePath = path.relative(repoRoot, sourceFile);
  const parsed = path.parse(relativePath);

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

export function hasFailingAssertion(testContent: string): boolean {
  const failingPatterns = [
    /assert\.(fail|false|notOk|notStrictEqual|notDeepStrictEqual)/,
    /expect\([^)]+\)\.toBe\(\s*false\s*\)/,
    /expect\([^)]+\)\.not\./,
    /expect\([^)]+\)\.toThrow\(/,
    /\.should\.\w+\.not\./,
  ];

  return failingPatterns.some((pattern) => pattern.test(testContent));
}

export function guardTestFirst(options: { files: string; session: string }): {
  ok: boolean;
  status: string;
  reason?: string;
  questions?: string[];
} {
  const sessionDir = resolveSessionDir(options.session);
  const repoRoot = findHarnessRoot(sessionDir);
  const files = String(options.files || "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const violations: Array<{ file: string; testFile?: string; reason: string }> = [];

  for (const file of files) {
    const relativePath = path.relative(repoRoot, file);

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

    const testFile = findCorrespondingTestFile(file, repoRoot);

    if (!testFile) {
      violations.push({
        file: relativePath,
        reason: "No corresponding test file found",
      });
      continue;
    }

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

function main(): void {
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
    const sessionDir = resolveSessionDir(options.session as string);
    const result = guardTestFirst(options as unknown as { files: string; session: string });
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
    emitResult(result, options.json as boolean);
    exitFromResult(result);
  } catch (error) {
    const result = { ok: false, status: "failed", reason: (error as Error).message };
    emitResult(result, process.argv.includes("--json"));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
