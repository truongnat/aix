#!/usr/bin/env node
// Purpose: Verify file edits stay within scope defined in GOAL.md or PLAN.md.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
import * as path from "node:path";
import {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  extractField,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  readText,
  resolveSessionDir,
} from "../shared/util";

const SPEC = {
  files: { required: true },
  session: { required: true },
};

function extractReferencedFiles(sessionDir: string): string[] {
  const referencedFiles = new Set<string>();

  const goalPath = path.join(sessionDir, "GOAL.md");
  if (fs.existsSync(goalPath)) {
    const goalContent = readText(goalPath);
    const fileMatches = goalContent.match(/[\w\-./]+\.(js|ts|json|md|py|go|rs)/g);
    if (fileMatches) {
      fileMatches.forEach((file) => referencedFiles.add(file));
    }
  }

  const statePath = path.join(sessionDir, "STATE.md");
  const stateContent = fs.existsSync(statePath) ? readText(statePath) : "";
  const planName = extractField(stateContent, "current_plan") || "PLAN-001.md";
  const planPath = path.join(sessionDir, planName);
  if (fs.existsSync(planPath)) {
    const planContent = readText(planPath);
    const fileMatches = planContent.match(/[\w\-./]+\.(js|ts|json|md|py|go|rs)/g);
    if (fileMatches) {
      fileMatches.forEach((file) => referencedFiles.add(file));
    }
  }

  return Array.from(referencedFiles);
}

function isFileInScope(filePath: string, referencedFiles: string[]): boolean {
  if (referencedFiles.length === 0) {
    return true;
  }

  const normalizedPath = filePath.replace(/\\/g, "/");

  for (const ref of referencedFiles) {
    const normalizedRef = ref.replace(/\\/g, "/");

    if (normalizedPath === normalizedRef) {
      return true;
    }

    if (normalizedPath.startsWith(normalizedRef + "/")) {
      return true;
    }

    if (ref.includes("*")) {
      const regex = new RegExp(ref.replace(/\*/g, ".*"));
      if (regex.test(normalizedPath)) {
        return true;
      }
    }
  }

  return false;
}

export function guardScope(options: { files: string; session: string }): {
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

  const referencedFiles = extractReferencedFiles(sessionDir);
  const outOfScopeFiles: string[] = [];

  for (const file of files) {
    const relativePath = path.relative(repoRoot, file);
    if (!isFileInScope(relativePath, referencedFiles)) {
      outOfScopeFiles.push(relativePath);
    }
  }

  if (outOfScopeFiles.length > 0) {
    return {
      ok: false,
      status: "blocked",
      reason: `Files outside approved scope: ${outOfScopeFiles.join(", ")}`,
      questions: [
        `Are these edits within the approved goal scope?`,
        `Referenced files: ${referencedFiles.join(", ") || "none"}`,
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
      printHelp("guard-scope.js", [
        "Usage:",
        "  node hooks/core/guard-scope.js --files file1.ts,file2.ts --session .harness/sessions/<id> [--json]",
        "",
        "Checks:",
        "  Ensures file edits stay within scope defined in GOAL.md or PLAN.md",
        "",
        "Exit code 0 when in scope, 1 when out of scope.",
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session as string);
    const result = guardScope(options as unknown as { files: string; session: string });
    try {
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "guard-scope",
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
