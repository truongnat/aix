"use strict";

async function runEvalCommand(packRoot, options) {
  const evalCommand = options.evalCommand || "list";

  switch (evalCommand) {
    case "list": {
      const { listTasks } = require("../evals");
      const result = listTasks(packRoot);
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    case "run": {
      if (!options.evalTarget) {
        throw new Error("Missing eval target for `aih eval run`.");
      }
      const { runTask } = require("../evals");
      const result = await runTask(packRoot, options.evalTarget, {
        provider: options.providers[0] || "codex",
        verbose: options.verbose,
      });
      process.stdout.write(`${result.summaryPath}\n`);
      return result.exitCode;
    }
    case "report": {
      if (!options.evalTarget) {
        throw new Error("Missing eval target for `aih eval report`.");
      }
      const { readReport } = require("../evals");
      const result = readReport(packRoot, options.evalTarget);
      process.stdout.write(`${result.output}\n`);
      return 0;
    }
    default:
      throw new Error(`Unknown eval subcommand: ${evalCommand}`);
  }
}

module.exports = {
  runEvalCommand,
};
