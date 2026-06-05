"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEvalCommand = runEvalCommand;
async function runEvalCommand(packRoot, options) {
    const evalCommand = options.evalCommand || "list";
    switch (evalCommand) {
        case "list": {
            // @ts-ignore - JS file with checkJs
            const { listTasks } = require("../evals");
            const result = listTasks(packRoot, { targetRoot: options.target });
            process.stdout.write(`${result.output}\n`);
            return 0;
        }
        case "run": {
            if (!options.evalTarget) {
                throw new Error("Missing eval target for `aih eval run`.");
            }
            // @ts-ignore - JS file with checkJs
            const { runTask } = require("../evals");
            const result = await runTask(packRoot, options.evalTarget, {
                provider: options.providers[0] || "codex",
                verbose: options.verbose,
                useLlmJudge: options.useLlmJudge,
                targetRoot: options.target,
            });
            process.stdout.write(`${result.summaryPath}\n`);
            return result.exitCode;
        }
        case "report": {
            if (!options.evalTarget) {
                throw new Error("Missing eval target for `aih eval report`.");
            }
            // @ts-ignore - JS file with checkJs
            const { readReport } = require("../evals");
            const result = readReport(packRoot, options.evalTarget);
            process.stdout.write(`${result.output}\n`);
            return 0;
        }
        default:
            throw new Error(`Unknown eval subcommand: ${evalCommand}`);
    }
}
