"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasks = listTasks;
exports.readReport = readReport;
exports.runTask = runTask;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const task_registry_1 = require("./task-registry");
const ab_runner_1 = require("./ab-runner");
const eval_recommendations_1 = require("../insights/eval-recommendations");
function listTasks(packRoot, options = {}) {
    const registry = (0, task_registry_1.loadRegistry)(packRoot);
    let output = (0, task_registry_1.formatTaskList)(registry);
    if (options.targetRoot) {
        try {
            const hints = (0, eval_recommendations_1.buildEvalRecommendations)(options.targetRoot);
            if (hints.recommendations.length > 0) {
                output += `\n\nTelemetry eval hints:\n`;
                output += (0, eval_recommendations_1.formatEvalRecommendations)(hints).split("\n").slice(2).join("\n");
            }
        }
        catch {
            /* optional telemetry hints */
        }
    }
    return {
        registry,
        output,
    };
}
async function runTask(packRoot, taskId, options = {}) {
    const registry = (0, task_registry_1.loadRegistry)(packRoot);
    const task = registry.tasks.find((entry) => entry.id === taskId);
    if (!task) {
        throw new Error(`Unknown eval task: ${taskId}`);
    }
    return (0, ab_runner_1.runAbTask)(packRoot, task, options);
}
function readReport(packRoot, runId) {
    const summaryPath = node_path_1.default.join(packRoot, "artifacts", "runs", runId, "summary.json");
    if (!node_fs_1.default.existsSync(summaryPath)) {
        throw new Error(`Eval run not found: ${runId}`);
    }
    const summary = JSON.parse(node_fs_1.default.readFileSync(summaryPath, "utf8"));
    return {
        output: JSON.stringify(summary, null, 2),
        summary,
        summaryPath,
    };
}
