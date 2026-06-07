import type { ParseOptions } from "../cli-args";

interface RunTaskOptions {
  provider: string;
  verbose: boolean;
  useLlmJudge: boolean;
  targetRoot: string;
  liveProviderCommand: string;
}

interface RunTaskResult {
  summaryPath: string;
  exitCode: number;
  comparison?: {
    selfCorrectionDemonstrated: boolean;
  };
}

interface ListTasksResult {
  output: string;
}

interface ReadReportResult {
  output: string;
}

async function runEvalCommand(packRoot: string, options: ParseOptions): Promise<number> {
  const evalCommand = options.evalCommand || "list";

  switch (evalCommand) {
    case "list": {
      // @ts-ignore - JS file with checkJs
      const { listTasks } = require("../evals");
      const result = listTasks(packRoot, { targetRoot: options.target }) as ListTasksResult;
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    case "run": {
      if (!options.evalTarget) {
        throw new Error("Missing eval target for `aih eval run`.");
      }
      // @ts-ignore - JS file with checkJs
      const { runTask } = require("../evals");
      const result = (await runTask(packRoot, options.evalTarget, {
        provider: options.providers[0] || "codex",
        verbose: options.verbose,
        useLlmJudge: options.useLlmJudge,
        targetRoot: options.target,
        liveProviderCommand: options.liveProviderCommand || process.env.EVAL_PROVIDER_COMMAND || "",
      })) as RunTaskResult;
      process.stdout.write(`${result.summaryPath}\n`);
      return result.exitCode;
    }
    case "report": {
      if (!options.evalTarget) {
        throw new Error("Missing eval target for `aih eval report`.");
      }
      // @ts-ignore - JS file with checkJs
      const { readReport } = require("../evals");
      const result = readReport(packRoot, options.evalTarget) as ReadReportResult;
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    default:
      throw new Error(`Unknown eval subcommand: ${evalCommand}`);
  }
}

export { runEvalCommand };
