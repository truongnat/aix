#!/usr/bin/env node
// Purpose: Dispatch a hook script using the active session from STATE.md.
// Layer: infrastructure
// Depends on: nothing

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

function readActiveSession(cwd: string): string | null {
  const statePath = path.join(cwd, ".harness", "STATE.md");
  if (!fs.existsSync(statePath)) return null;
  const content = fs.readFileSync(statePath, "utf8");
  const match = content.match(/##\s+Active Session\s*\n+`([^`]+)`/);
  return match ? match[1].trim() : null;
}

function main(): void {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Usage: run-with-active-session.js <script-name> [extra-args...]");
    process.exit(1);
  }

  const [scriptName, ...extraArgs] = args;
  const cwd = process.cwd();
  const session = readActiveSession(cwd);

  if (!session) {
    // No active session — skip silently
    process.exit(0);
  }

  const sessionPath = path.join(".harness", "sessions", session);
  const scriptPath = path.join(cwd, ".ai-harness", "hooks", "core", `${scriptName}.js`);

  if (!fs.existsSync(scriptPath)) {
    console.error(`Hook script not found: ${scriptPath}`);
    process.exit(1);
  }

  execFileSync(process.execPath, [scriptPath, "--session", sessionPath, ...extraArgs], {
    stdio: "inherit",
    cwd,
  });
}

main();
