"use strict";

const { mutationMetrics } = require("./mode-mutations");

function scoreExtendedMetrics(task, mode, baseScore, packRoot) {
  const metrics = mutationMetrics(task, packRoot);
  const steps = mode === "with-harness" ? metrics.withHarnessSteps : metrics.withoutHarnessSteps;
  const phaseDiscipline = {
    phases: metrics.phases || [],
    behaviorPassRate: baseScore.behavior.percent,
    passed: baseScore.behavior.failed === 0,
  };

  return {
    steps,
    efficiency: {
      steps,
      baselineSteps: metrics.withoutHarnessSteps,
      harnessSteps: metrics.withHarnessSteps,
      improvement:
        metrics.withoutHarnessSteps > 0
          ? (metrics.withoutHarnessSteps - metrics.withHarnessSteps) / metrics.withoutHarnessSteps
          : 0,
    },
    phaseDiscipline,
    selfCorrectionReady: mode === "with-harness",
  };
}

function compareAbMetrics(task, withHarnessScore, withoutHarnessScore, packRoot) {
  const withMetrics = scoreExtendedMetrics(task, "with-harness", withHarnessScore, packRoot);
  const withoutMetrics = scoreExtendedMetrics(
    task,
    "without-harness",
    withoutHarnessScore,
    packRoot
  );

  return {
    efficiencyGain: withMetrics.efficiency.improvement,
    withHarnessSteps: withMetrics.efficiency.harnessSteps,
    withoutHarnessSteps: withoutMetrics.efficiency.steps,
    phaseDisciplineDelta: withHarnessScore.behavior.percent - withoutHarnessScore.behavior.percent,
    selfCorrectionDemonstrated:
      withoutHarnessScore.outcome.failed > 0 && withHarnessScore.outcome.failed === 0,
    phases: withMetrics.phaseDiscipline.phases,
  };
}

module.exports = {
  compareAbMetrics,
  scoreExtendedMetrics,
};
