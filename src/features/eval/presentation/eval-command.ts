// Purpose: CLI handler for eval list | run | report
// Layer: presentation
// Depends on: application, cli-types

import type { ParseOptions } from "../../install/presentation/cli-types";
import { listTasks, readReport, runTask } from "../application/eval-api";

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
      const result = listTasks(packRoot, { targetRoot: options.target }) as ListTasksResult;
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    case "run": {
      if (!options.evalTarget) {
        throw new Error("Missing eval target for `aih eval run`.");
      }
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
      const result = readReport(packRoot, options.evalTarget) as ReadReportResult;
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    default:
      throw new Error(`Unknown eval subcommand: ${evalCommand}`);
  }
}

export { runEvalCommand };
