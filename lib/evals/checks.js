"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function isolatedCommandEnv() {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith("NODE_TEST")) {
      delete env[key];
    }
  }
  delete env.NODE_OPTIONS;
  return env;
}

function runCommand(command, cwd) {
  return childProcess.spawnSync(command, {
    cwd,
    encoding: "utf8",
    shell: true,
    timeout: 15000,
    env: isolatedCommandEnv(),
  });
}

function runSingleCheck(cwd, check) {
  if (check.type === "artifact-exists") {
    const target = path.join(cwd, check.path);
    return {
      type: check.type,
      passed: fs.existsSync(target),
      detail: target,
    };
  }

  if (check.type === "file-contains") {
    const target = path.join(cwd, check.path);
    const content = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    return {
      type: check.type,
      passed: fs.existsSync(target) && content.includes(check.pattern),
      detail: target,
    };
  }

  if (check.type === "command") {
    const result = runCommand(check.command, path.join(cwd, check.cwd || "."));
    return {
      type: check.type,
      passed: result.status === 0,
      detail: (result.stdout || result.stderr || "").trim(),
    };
  }

  throw new Error(`Unsupported check type: ${check.type}`);
}

async function runChecks(cwd, task) {
  const outcome = task.successChecks.map((check) => runSingleCheck(cwd, check));
  const behavior = task.behaviorChecks.map((check) => runSingleCheck(cwd, check));
  return { outcome, behavior };
}

module.exports = {
  runChecks,
};
