import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FORBIDDEN_SHELL_PATTERN = /[|&;<>()`$%]/;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

interface Task {
  id: string;
  title: string;
  goal: string;
  prompt: string;
}

interface Workspace {
  root: string;
  cwd: string;
}

interface LiveRunOptions {
  packRoot: string;
  task: Task;
  mode: string;
  provider: string;
  providerCommand: string;
  workspace: Workspace;
  timeoutMs?: number;
}

interface LiveRunResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  promptPath: string;
  guidePath?: string;
  statePath?: string;
  transcript: string;
}

function tokenizeProviderCommand(command: string): string[] {
  const trimmed = command.trim();
  if (!trimmed) {
    throw new Error("Missing live provider command for eval run.");
  }
  if (FORBIDDEN_SHELL_PATTERN.test(trimmed)) {
    throw new Error(`Live provider command contains unsupported shell syntax: ${command}`);
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
    throw new Error(`Unable to parse live provider command: ${command}`);
  }

  return tokens;
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeTextFile(filePath: string, content: string): void {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content);
}

function writeLiveHarnessFiles(
  workspace: Workspace,
  task: Task,
  options: LiveRunOptions
): {
  promptPath: string;
  guidePath?: string;
  statePath?: string;
} {
  const promptPath = path.join(workspace.cwd, "AIH_PROMPT.md");
  writeTextFile(promptPath, `# Eval Prompt\n\n` + `Task: ${task.id}\n\n` + `${task.prompt}\n`);

  if (options.mode !== "with-harness") {
    return { promptPath };
  }

  const guidePath = path.join(workspace.cwd, "AGENTS.md");
  const statePath = path.join(workspace.cwd, ".harness", "GOAL.md");

  writeTextFile(
    guidePath,
    `# Eval Harness Guidance\n\n` +
      `- Read [AIH_PROMPT.md](./AIH_PROMPT.md) first.\n` +
      `- Keep the change minimal and make the fixture tests pass.\n` +
      `- Use the harness prompt and preserve the workspace boundary.\n`
  );

  writeTextFile(
    statePath,
    `# Goal\n\n` + `Task: ${task.id}\n` + `Title: ${task.title}\n` + `Goal: ${task.goal}\n`
  );

  return { promptPath, guidePath, statePath };
}

function resolveTimeoutMs(timeoutMs?: number): number {
  if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  const rawEnvTimeout = process.env.AIH_EVAL_TIMEOUT_MS;
  if (!rawEnvTimeout) {
    return DEFAULT_TIMEOUT_MS;
  }

  const parsed = Number(rawEnvTimeout);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function runLiveProviderCommand(options: LiveRunOptions): LiveRunResult {
  const [executable, ...args] = tokenizeProviderCommand(options.providerCommand);

  const paths = writeLiveHarnessFiles(options.workspace, options.task, options);
  const env = {
    ...process.env,
    AIH_EVAL_PACK_ROOT: options.packRoot,
    AIH_EVAL_TASK_ID: options.task.id,
    AIH_EVAL_TASK_TITLE: options.task.title,
    AIH_EVAL_TASK_GOAL: options.task.goal,
    AIH_EVAL_TASK_PROMPT: options.task.prompt,
    AIH_EVAL_PROMPT_PATH: paths.promptPath,
    AIH_EVAL_WORKSPACE: options.workspace.cwd,
    AIH_EVAL_WORKSPACE_ROOT: options.workspace.root,
    AIH_EVAL_PROVIDER: options.provider,
    AIH_EVAL_MODE: options.mode,
  };

  const timeoutMs = resolveTimeoutMs(options.timeoutMs);

  const result = childProcess.spawnSync(executable, args, {
    cwd: options.workspace.cwd,
    encoding: "utf8",
    env,
    input: `${options.task.prompt}\n`,
    shell: false,
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  });

  const exitCode = typeof result.status === "number" ? result.status : result.error ? 127 : 0;
  const stdout = result.stdout || "";
  const stderr = result.stderr || result.error?.message || "";

  const transcript =
    `# Live Provider Run\n\n` +
    `- Task: ${options.task.id}\n` +
    `- Mode: ${options.mode}\n` +
    `- Provider: ${options.provider}\n` +
    `- Command: ${options.providerCommand}\n` +
    `- Exit code: ${exitCode}\n` +
    `- Prompt path: ${paths.promptPath}\n` +
    `${paths.guidePath ? `- Harness guide: ${paths.guidePath}\n` : ""}` +
    `${paths.statePath ? `- Harness state: ${paths.statePath}\n` : ""}` +
    `\n## Stdout\n\n\`\`\`\n${stdout.trim()}\n\`\`\`\n\n` +
    `## Stderr\n\n\`\`\`\n${stderr.trim()}\n\`\`\`\n`;

  return {
    command: options.providerCommand,
    exitCode,
    stdout,
    stderr,
    promptPath: paths.promptPath,
    guidePath: paths.guidePath,
    statePath: paths.statePath,
    transcript,
  };
}

export { runLiveProviderCommand };
export type { LiveRunOptions, LiveRunResult };
