import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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

function runLiveProviderCommand(options: LiveRunOptions): LiveRunResult {
  if (!options.providerCommand.trim()) {
    throw new Error("Missing live provider command for eval run.");
  }

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

  const result = childProcess.spawnSync(options.providerCommand, {
    cwd: options.workspace.cwd,
    encoding: "utf8",
    env,
    input: `${options.task.prompt}\n`,
    shell: true,
    timeout: 10 * 60 * 1000,
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
