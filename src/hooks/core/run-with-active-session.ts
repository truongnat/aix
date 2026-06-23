#!/usr/bin/env node
// Purpose: Dispatch a hook script using the active session from STATE.md.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { extractField, readText } from "../shared/util";

export function readActiveSession(cwd: string): string | null {
  const statePath = path.join(cwd, ".harness", "STATE.md");
  if (!fs.existsSync(statePath)) {
    return null;
  }

  const sessionField = extractField(readText(statePath), "session");
  if (!sessionField) {
    // Legacy: backtick-wrapped value under ## Active Session
    const content = readText(statePath);
    const match = content.match(/##\s+Active Session\s*\n+`([^`]+)`/);
    return match ? match[1].trim() : null;
  }

  return sessionField.trim();
}

export function resolveSessionPath(sessionField: string | null): string | null {
  if (!sessionField) {
    return null;
  }

  if (sessionField.startsWith(".harness/")) {
    return sessionField;
  }

  return `.harness/${sessionField}`;
}

export function resolveHookScript(cwd: string, scriptName: string): string {
  const candidates = [
    path.join(cwd, ".ai-harness", "hooks", "core", `${scriptName}.js`),
    path.join(cwd, "dist", "hooks", "core", `${scriptName}.js`),
    path.join(cwd, "hooks", "core", `${scriptName}.js`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function main(): void {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Usage: run-with-active-session.js <script-name> [extra-args...]");
    process.exit(1);
  }

  const [scriptName, ...extraArgs] = args;
  const cwd = process.cwd();
  const sessionField = readActiveSession(cwd);
  const sessionPath = resolveSessionPath(sessionField);

  if (!sessionPath) {
    // No active session — skip silently
    process.exit(0);
  }

  const scriptPath = resolveHookScript(cwd, scriptName);

  if (!fs.existsSync(scriptPath)) {
    console.error(`Hook script not found: ${scriptPath}`);
    process.exit(1);
  }

  execFileSync(process.execPath, [scriptPath, "--session", sessionPath, ...extraArgs], {
    stdio: "inherit",
    cwd,
  });
}

if (require.main === module) {
  main();
}
