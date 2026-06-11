// Purpose: Eval check definitions and runners
// Layer: domain
// Depends on: nothing

import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface Check {
  type: string;
  path?: string;
  pattern?: string;
  command?: string;
  cwd?: string;
}

interface CheckResult {
  type: string;
  passed: boolean;
  detail: string;
}

const FORBIDDEN_SHELL_PATTERN = /[|&;<>()`$%]/;

function isolatedCommandEnv(): Record<string, string | undefined> {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith("NODE_TEST")) {
      delete env[key];
    }
  }
  delete env.NODE_OPTIONS;
  return env;
}

function tokenizeCommand(command: string): string[] {
  const trimmed = command.trim();
  if (!trimmed) {
    throw new Error("Command check requires a non-empty command.");
  }
  if (FORBIDDEN_SHELL_PATTERN.test(trimmed)) {
    throw new Error(`Command check contains unsupported shell syntax: ${command}`);
  }

  const tokens: string[] = [];
  const pattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|[^\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(trimmed)) !== null) {
    if (match[1] !== undefined) {
      tokens.push(match[1].replace(/\\(["\\])/g, "$1"));
    } else if (match[2] !== undefined) {
      tokens.push(match[2].replace(/\\(['\\])/g, "$1"));
    } else {
      tokens.push(match[0]);
    }
  }

  if (tokens.length === 0) {
    throw new Error(`Unable to parse command check: ${command}`);
  }

  return tokens;
}

function hasExecutableExtension(executable: string): boolean {
  return path.extname(executable) !== "";
}

function isEnoentError(error: Error | undefined): boolean {
  return Boolean(error && "code" in error && error.code === "ENOENT");
}

function spawnCommand(
  executable: string,
  args: string[],
  cwd: string
): childProcess.SpawnSyncReturns<string> {
  return childProcess.spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 15000,
    env: isolatedCommandEnv(),
  });
}

function runCommand(command: string, cwd: string): childProcess.SpawnSyncReturns<string> {
  const [executable, ...args] = tokenizeCommand(command);
  const firstAttempt = spawnCommand(executable, args, cwd);
  if (
    process.platform !== "win32" ||
    !isEnoentError(firstAttempt.error) ||
    executable.includes("\\") ||
    executable.includes("/") ||
    hasExecutableExtension(executable)
  ) {
    return firstAttempt;
  }

  for (const suffix of [".cmd", ".exe", ".bat"]) {
    const retried = spawnCommand(`${executable}${suffix}`, args, cwd);
    if (!isEnoentError(retried.error)) {
      return retried;
    }
  }

  return firstAttempt;
}

function runSingleCheck(cwd: string, check: Check): CheckResult {
  if (check.type === "artifact-exists") {
    const target = path.join(cwd, check.path!);
    return {
      type: check.type,
      passed: fs.existsSync(target),
      detail: target,
    };
  }

  if (check.type === "file-contains") {
    const target = path.join(cwd, check.path!);
    const content = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    return {
      type: check.type,
      passed: fs.existsSync(target) && content.includes(check.pattern!),
      detail: target,
    };
  }

  if (check.type === "command") {
    const result = runCommand(check.command!, path.join(cwd, check.cwd || "."));
    return {
      type: check.type,
      passed: result.status === 0,
      detail: (result.stdout || result.stderr || "").trim(),
    };
  }

  throw new Error(`Unsupported check type: ${check.type}`);
}

interface Task {
  successChecks: Check[];
  behaviorChecks: Check[];
}

interface CheckResults {
  outcome: CheckResult[];
  behavior: CheckResult[];
}

async function runChecks(cwd: string, task: Task): Promise<CheckResults> {
  const outcome = task.successChecks.map((check) => runSingleCheck(cwd, check));
  const behavior = task.behaviorChecks.map((check) => runSingleCheck(cwd, check));
  return { outcome, behavior };
}

export { runChecks, runSingleCheck };
export type { Check, CheckResult, Task, CheckResults };
