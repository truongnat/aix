"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { extractField, findHarnessRoot, readText } = require("./_util.js");
const { guardScope } = require("./guard-scope.js");
const { guardTestFirst } = require("./guard-test-first.js");

function readHookPayload() {
  try {
    if (process.stdin.isTTY) {
      return {};
    }
    const raw = fs.readFileSync(0, "utf8").trim();
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getToolInput(payload) {
  return payload.tool_input || payload.toolInput || payload.input || {};
}

function extractFilePaths(toolInput) {
  const paths = [];
  if (!toolInput || typeof toolInput !== "object") {
    return paths;
  }

  const candidates = [
    toolInput.path,
    toolInput.file_path,
    toolInput.filePath,
    toolInput.target_path,
    toolInput.targetPath,
    toolInput.file,
    toolInput.notebook_path,
    toolInput.notebookPath,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      paths.push(candidate.trim());
    }
  }

  if (Array.isArray(toolInput.paths)) {
    for (const entry of toolInput.paths) {
      if (typeof entry === "string" && entry.trim()) {
        paths.push(entry.trim());
      }
    }
  }

  return [...new Set(paths)];
}

function resolveActiveSession(repoRoot) {
  const statePath = path.join(repoRoot, ".harness", "STATE.md");
  if (!fs.existsSync(statePath)) {
    return null;
  }

  const sessionField = extractField(readText(statePath), "session");
  if (!sessionField) {
    return null;
  }

  if (sessionField.startsWith(".harness/")) {
    return sessionField;
  }

  return `.harness/${sessionField}`;
}

function runFileEditGuards(repoRoot, filePaths) {
  if (!filePaths.length) {
    return null;
  }

  const session = resolveActiveSession(repoRoot);
  if (!session) {
    return null;
  }

  const sessionPath = path.isAbsolute(session) ? session : path.join(repoRoot, session);
  const absolutePaths = filePaths.map((filePath) =>
    path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath)
  );
  const filesArg = absolutePaths.join(",");

  const scopeResult = guardScope({ session: sessionPath, files: filesArg });
  if (!scopeResult.ok) {
    return scopeResult;
  }

  const testFirstResult = guardTestFirst({ session: sessionPath, files: filesArg });
  if (!testFirstResult.ok) {
    return testFirstResult;
  }

  return null;
}

function resolveRepoRoot(payload) {
  const cwd = payload.cwd || payload.working_directory || payload.workingDirectory || process.cwd();
  try {
    return findHarnessRoot(cwd);
  } catch {
    return cwd;
  }
}

function evaluateFileEditHook(payload) {
  const repoRoot = resolveRepoRoot(payload);
  const filePaths = extractFilePaths(getToolInput(payload));
  return runFileEditGuards(repoRoot, filePaths);
}

const EDIT_TOOL_PATTERN = /Write|Edit|MultiEdit|apply_patch|NotebookEdit/i;

function isEditTool(payload) {
  const toolName = payload.tool_name || payload.toolName || payload.tool || "";
  return typeof toolName === "string" && EDIT_TOOL_PATTERN.test(toolName);
}

module.exports = {
  evaluateFileEditHook,
  extractFilePaths,
  getToolInput,
  isEditTool,
  readHookPayload,
  resolveActiveSession,
  resolveRepoRoot,
  runFileEditGuards,
  EDIT_TOOL_PATTERN,
};
