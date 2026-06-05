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

function runCommand(command: string, cwd: string): childProcess.SpawnSyncReturns<string> {
  return childProcess.spawnSync(command, {
    cwd,
    encoding: "utf8",
    shell: true,
    timeout: 15000,
    env: isolatedCommandEnv(),
  });
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
