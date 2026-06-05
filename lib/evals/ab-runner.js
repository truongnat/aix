"use strict";

const { materializeFixture } = require("./fixture-manager");
const { runChecks } = require("./checks");
const { judgeWithLlmFallback } = require("./llm-judge");
const { compareAbMetrics, scoreExtendedMetrics } = require("./extended-metrics");
const { applyModeMutation } = require("./mode-mutations");
const { scoreRun } = require("./scoring");
const { createRunContext } = require("./run-context");
const { writeModeArtifacts, writeRunSummary } = require("./reporter");
const { buildEvalRecommendations } = require("../insights/eval-recommendations");

async function runMode(packRoot, task, runContext, mode, options = {}) {
  const workspace = materializeFixture(packRoot, task);
  applyModeMutation(mode, workspace.cwd, task, packRoot);
  const checks = await runChecks(workspace.cwd, task);
  const rubric = await judgeWithLlmFallback(packRoot, workspace.cwd, task, options);
  const score = scoreRun(checks, rubric);
  const extended = scoreExtendedMetrics(task, mode, score, packRoot);
  score.extended = extended;

  const modeDir = runContext.modeDir(mode);
  const provider = options.provider || "deterministic-local";
  const artifacts = writeModeArtifacts(modeDir, {
    summary: {
      taskId: task.id,
      mode,
      provider,
      outcome: score.outcome,
      behavior: score.behavior,
      extended,
    },
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
  const runContext = createRunContext(packRoot, task.id);
  const withHarness = await runMode(packRoot, task, runContext, "with-harness", options);
  const withoutHarness = await runMode(packRoot, task, runContext, "without-harness", options);
  const comparison = compareAbMetrics(task, withHarness.score, withoutHarness.score, packRoot);

  let telemetryHints = null;
  if (options.targetRoot) {
    try {
      telemetryHints = buildEvalRecommendations(options.targetRoot);
    } catch {
      telemetryHints = null;
    }
  }

  const summaryPath = writeRunSummary(runContext.runRoot, {
    runId: runContext.runId,
    taskId: task.id,
    modes: {
      "with-harness": withHarness.score,
      "without-harness": withoutHarness.score,
    },
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

module.exports = {
  runAbTask,
};
