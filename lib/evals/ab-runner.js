"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAbTask = runAbTask;
const fixture_manager_1 = require("./fixture-manager");
const checks_1 = require("./checks");
const llm_judge_1 = require("./llm-judge");
const extended_metrics_1 = require("./extended-metrics");
const mode_mutations_1 = require("./mode-mutations");
const scoring_1 = require("./scoring");
const run_context_1 = require("./run-context");
const reporter_1 = require("./reporter");
const eval_recommendations_1 = require("../insights/eval-recommendations");
async function runMode(packRoot, task, runContext, mode, options = {}) {
    const workspace = (0, fixture_manager_1.materializeFixture)(packRoot, task);
    (0, mode_mutations_1.applyModeMutation)(mode, workspace.cwd, task, packRoot);
    // @ts-ignore - Task type compatibility between modules
    const checks = await (0, checks_1.runChecks)(workspace.cwd, task);
    const rubric = await (0, llm_judge_1.judgeWithLlmFallback)(packRoot, workspace.cwd, task, options);
    const score = (0, scoring_1.scoreRun)(checks, rubric);
    // @ts-ignore - Task type compatibility between modules
    const extended = (0, extended_metrics_1.scoreExtendedMetrics)(task, mode, score, packRoot);
    score.extended = extended;
    const modeDir = runContext.modeDir(mode);
    const provider = options.provider || "deterministic-local";
    const artifacts = (0, reporter_1.writeModeArtifacts)(modeDir, {
        summary: {
            taskId: task.id,
            mode,
            provider,
            outcome: score.outcome,
            behavior: score.behavior,
            extended,
        },
        // @ts-ignore - Score assignable to Record<string, unknown>
        metrics: score,
        transcript: `# ${task.id} ${mode}\n\nProvider: ${provider}\nSteps: ${extended.steps}\n`,
        report: `# Eval Report\n\n- Task: ${task.id}\n- Mode: ${mode}\n- Outcome: ${score.outcome.passed}/${score.outcome.total}\n- Behavior: ${score.behavior.passed}/${score.behavior.total}\n- Steps: ${extended.steps}\n`,
    });
    return {
        mode,
        workspace,
        checks,
        score,
        artifacts,
    };
}
async function runAbTask(packRoot, task, options = {}) {
    const runContext = (0, run_context_1.createRunContext)(packRoot, task.id);
    const withHarness = await runMode(packRoot, task, runContext, "with-harness", options);
    const withoutHarness = await runMode(packRoot, task, runContext, "without-harness", options);
    // @ts-ignore - Task type compatibility between modules
    const comparison = (0, extended_metrics_1.compareAbMetrics)(task, withHarness.score, withoutHarness.score, packRoot);
    let telemetryHints = null;
    if (options.targetRoot) {
        try {
            telemetryHints = (0, eval_recommendations_1.buildEvalRecommendations)(options.targetRoot);
        }
        catch {
            telemetryHints = null;
        }
    }
    const summaryPath = (0, reporter_1.writeRunSummary)(runContext.runRoot, {
        runId: runContext.runId,
        taskId: task.id,
        modes: {
            "with-harness": withHarness.score,
            "without-harness": withoutHarness.score,
        },
        // @ts-ignore - ComparisonMetrics assignable to Record<string, unknown>
        comparison,
        telemetryHints,
    });
    return {
        runId: runContext.runId,
        runRoot: runContext.runRoot,
        summaryPath,
        comparison,
        exitCode: withHarness.score.outcome.failed === 0 ? 0 : 1,
    };
}
