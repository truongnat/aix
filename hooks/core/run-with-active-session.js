#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { extractField, readText } = require("./_util.js");

function readActiveSession(cwd) {
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

function resolveSessionPath(sessionField) {
  if (!sessionField) {
    return null;
  }

  if (sessionField.startsWith(".harness/")) {
    return sessionField;
  }

  return `.harness/${sessionField}`;
}

function resolveHookScript(cwd, scriptName) {
  const installed = path.join(cwd, ".ai-harness", "hooks", "core", `${scriptName}.js`);
  if (fs.existsSync(installed)) {
    return installed;
  }

  const source = path.join(cwd, "hooks", "core", `${scriptName}.js`);
  if (fs.existsSync(source)) {
    return source;
  }

  return installed;
}

function main() {
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

module.exports = { readActiveSession, resolveSessionPath, resolveHookScript };
