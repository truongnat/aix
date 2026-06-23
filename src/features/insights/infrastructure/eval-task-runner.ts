// Purpose: Bridge to eval runner.
// Layer: infrastructure

export interface RunEvalTaskOptions {
  provider?: string;
  verbose?: boolean;
  useLlmJudge?: boolean;
  targetRoot?: string;
  liveProviderCommand?: string;
  timeoutMs?: number;
}

export interface RunEvalTaskResult {
  exitCode?: number;
  summaryPath?: string;
}

export async function runEvalTask(
  packRoot: string,
  taskId: string,
  options: RunEvalTaskOptions = {}
): Promise<RunEvalTaskResult> {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { runTask } = require("../../../features/eval/index.js") as {
    runTask: (
      packRoot: string,
      taskId: string,
      options: RunEvalTaskOptions
    ) => Promise<RunEvalTaskResult>;
  };
  return runTask(packRoot, taskId, options);
}
