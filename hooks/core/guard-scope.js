#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  extractField,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  readText,
  resolveSessionDir,
} = require("./_util.js");

const SPEC = {
  files: { required: true },
  session: { required: true },
};

function extractReferencedFiles(sessionDir, repoRoot) {
  const referencedFiles = new Set();

  // Extract from GOAL.md
  const goalPath = path.join(sessionDir, "GOAL.md");
  if (fs.existsSync(goalPath)) {
    const goalContent = readText(goalPath);
    // Look for file references in markdown code blocks and paths
    const fileMatches = goalContent.match(/[\w\-./]+\.(js|ts|json|md|py|go|rs)/g);
    if (fileMatches) {
      fileMatches.forEach((file) => referencedFiles.add(file));
    }
  }

  // Extract from PLAN.md (current_plan lives in repo-root STATE.md)
  const statePath = path.join(repoRoot, ".harness", "STATE.md");
  let planName = "PLAN-001.md";
  if (fs.existsSync(statePath)) {
    planName = extractField(readText(statePath), "current_plan") || planName;
  }
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

function isFileInScope(filePath, referencedFiles) {
  // If no referenced files, allow all (conservative)
  if (referencedFiles.length === 0) {
    return true;
  }

  // Check if file matches any referenced pattern
  const normalizedPath = filePath.replace(/\\/g, "/");

  for (const ref of referencedFiles) {
    const normalizedRef = ref.replace(/\\/g, "/");

    // Exact match
    if (normalizedPath === normalizedRef) {
      return true;
    }

    // Directory match (if ref is a directory)
    if (normalizedPath.startsWith(normalizedRef + "/")) {
      return true;
    }

    // Pattern match (if ref contains wildcards)
    if (ref.includes("*")) {
      const regex = new RegExp(ref.replace(/\*/g, ".*"));
      if (regex.test(normalizedPath)) {
        return true;
      }
    }
  }

  return false;
}

function guardScope(options) {
  const sessionDir = resolveSessionDir(options.session);
  const repoRoot = findHarnessRoot(sessionDir);
  const files = String(options.files || "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const referencedFiles = extractReferencedFiles(sessionDir, repoRoot);
  const outOfScopeFiles = [];

  for (const file of files) {
    const absoluteFile = path.isAbsolute(file) ? file : path.resolve(repoRoot, file);
    const relativePath = path.relative(repoRoot, absoluteFile);
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

function main() {
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
    const sessionDir = resolveSessionDir(options.session);
    const result = guardScope(options);
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

module.exports = { guardScope, extractReferencedFiles, isFileInScope };
