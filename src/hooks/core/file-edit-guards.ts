// Purpose: Shared scope and test-first guards for file-edit hook events.
// Layer: infrastructure
// Depends on: ../shared/util, ./guard-scope, ./guard-test-first

import * as fs from "node:fs";
import * as path from "node:path";
import { extractField, findHarnessRoot, readText, type HarnessResult } from "../shared/util";
import { guardScope } from "./guard-scope";
import { guardTestFirst } from "./guard-test-first";

interface HookPayload {
  cwd?: string;
  working_directory?: string;
  workingDirectory?: string;
  tool_input?: unknown;
  toolInput?: unknown;
  input?: unknown;
  tool_name?: string;
  toolName?: string;
  tool?: string;
}

export function readHookPayload(): HookPayload {
  try {
    if (process.stdin.isTTY) {
      return {};
    }
    const raw = fs.readFileSync(0, "utf8").trim();
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as HookPayload;
  } catch {
    return {};
  }
}

export function getToolInput(payload: HookPayload): unknown {
  return payload.tool_input || payload.toolInput || payload.input || {};
}

export function extractFilePaths(toolInput: unknown): string[] {
  const paths: string[] = [];
  if (!toolInput || typeof toolInput !== "object") {
    return paths;
  }

  const input = toolInput as Record<string, unknown>;
  const candidates = [
    input.path,
    input.file_path,
    input.filePath,
    input.target_path,
    input.targetPath,
    input.file,
    input.notebook_path,
    input.notebookPath,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      paths.push(candidate.trim());
    }
  }

  if (Array.isArray(input.paths)) {
    for (const entry of input.paths) {
      if (typeof entry === "string" && entry.trim()) {
        paths.push(entry.trim());
      }
    }
  }

  return [...new Set(paths)];
}

export function resolveActiveSession(repoRoot: string): string | null {
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

export function runFileEditGuards(repoRoot: string, filePaths: string[]): HarnessResult | null {
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

export function resolveRepoRoot(payload: HookPayload): string {
  const cwd = payload.cwd || payload.working_directory || payload.workingDirectory || process.cwd();
  try {
    return findHarnessRoot(cwd);
  } catch {
    return cwd;
  }
}

export function evaluateFileEditHook(payload: HookPayload): HarnessResult | null {
  const repoRoot = resolveRepoRoot(payload);
  const filePaths = extractFilePaths(getToolInput(payload));
  return runFileEditGuards(repoRoot, filePaths);
}

export const EDIT_TOOL_PATTERN = /Write|Edit|MultiEdit|apply_patch|NotebookEdit/i;

export function isEditTool(payload: HookPayload): boolean {
  const toolName = payload.tool_name || payload.toolName || payload.tool || "";
  return typeof toolName === "string" && EDIT_TOOL_PATTERN.test(toolName);
}
