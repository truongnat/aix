#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

function readActiveSession(cwd) {
  const statePath = path.join(cwd, ".harness", "STATE.md");
  if (!fs.existsSync(statePath)) return null;
  const content = fs.readFileSync(statePath, "utf8");
  const match = content.match(/##\s+Active Session\s*\n+`([^`]+)`/);
  return match ? match[1].trim() : null;
}

function main() {
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
