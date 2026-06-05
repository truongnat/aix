"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInitWizard = runInitWizard;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const cli_detect_1 = require("../cli-detect");
const cli_command_helpers_1 = require("../cli-command-helpers");
// @ts-ignore - JS file with checkJs
const install_1 = require("./install");
const INIT_DEMO_GOAL = `# Init Demo Goal

Complete the harness quickstart by confirming install and running one deterministic eval task.

## Steps
1. Confirm \`.harness/\` exists after init.
2. Review eval output from the init demo run.
3. Use \`aih insights\` to inspect local telemetry after your next session.
`;
async function runInitWizard(packRoot, options) {
    const targetAbs = (0, cli_command_helpers_1.resolveTargetAbs)(options.target);
    if (!node_fs_1.default.existsSync(targetAbs)) {
        throw new Error(`Target directory does not exist: ${targetAbs}`);
    }
    const recommended = (0, cli_detect_1.detectRecommendedProviders)(targetAbs);
    const providers = options.providers.length > 0
        ? options.providers
        : recommended.length > 0
            ? [recommended[0]]
            : ["cursor"];
    const initOptions = {
        ...options,
        command: "install",
        providers,
        yes: true,
        scope: options.scope || "project",
        visibility: options.visibility || "private",
    };
    process.stdout.write(`Initializing harness in ${targetAbs} for provider(s): ${providers.join(", ")}\n`);
    const status = await (0, install_1.runInstallWizard)(packRoot, initOptions);
    if (status !== 0) {
        return status;
    }
    const harnessDir = node_path_1.default.join(targetAbs, ".harness");
    if (!node_fs_1.default.existsSync(harnessDir)) {
        throw new Error("Init completed but .harness/ was not created.");
    }
    const demoGoalPath = node_path_1.default.join(harnessDir, "GOAL.md");
    if (!node_fs_1.default.existsSync(demoGoalPath)) {
        node_fs_1.default.writeFileSync(demoGoalPath, `${INIT_DEMO_GOAL}\n`, "utf8");
    }
    if (!options.skipDemoEval) {
        process.stdout.write("\nRunning init demo eval (sample-bugfix)...\n");
        // @ts-ignore - JS file with checkJs
        const { runTask } = require("../evals");
        const evalResult = await runTask(packRoot, "sample-bugfix", {
            provider: "deterministic-local",
            targetRoot: targetAbs,
        });
        process.stdout.write(`Demo eval summary: ${evalResult.summaryPath}\n`);
        if (evalResult.comparison && evalResult.comparison.selfCorrectionDemonstrated) {
            process.stdout.write("Harness A/B delta: with-harness passed, without-harness failed.\n");
        }
        if (evalResult.exitCode !== 0) {
            return evalResult.exitCode;
        }
    }
    process.stdout.write("\nInit complete.\n");
    process.stdout.write("Next:\n");
    process.stdout.write("  npx ai-engineering-harness status\n");
    process.stdout.write("  npx ai-engineering-harness eval list\n");
    process.stdout.write("  npx ai-engineering-harness insights\n");
    process.stdout.write(`See docs/first-5-minutes.md and docs/insights.md\n`);
    return 0;
}
