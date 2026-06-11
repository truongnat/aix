// Purpose: Extended A/B comparison metrics for eval runs
// Layer: infrastructure
// Depends on: domain

import { mutationMetrics } from "../domain/mode-mutations";
import type { Task } from "../domain/task-registry";
import type { ExtendedMetrics, ComparisonMetrics, Score } from "../domain/scoring";

function scoreExtendedMetrics(
  task: Task,
  mode: string,
  baseScore: Score,
  packRoot: string
): ExtendedMetrics {
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
    selfCorrectionReady: mode === "with-harness" && baseScore.behavior.percent >= 0.8,
  };
}

function compareAbMetrics(
  task: Task,
  withHarnessScore: Score,
  withoutHarnessScore: Score,
  packRoot: string
): ComparisonMetrics {
  const withMetrics = scoreExtendedMetrics(task, "with-harness", withHarnessScore, packRoot);
  const withoutMetrics = scoreExtendedMetrics(
    task,
    "without-harness",
    withoutHarnessScore,
    packRoot
  );

  return {
    estimatedEfficiencyGain: withMetrics.efficiency.improvement,
    withHarnessSteps: withMetrics.efficiency.harnessSteps,
    withoutHarnessSteps: withoutMetrics.efficiency.steps,
    phaseDisciplineDelta: withHarnessScore.behavior.percent - withoutHarnessScore.behavior.percent,
    selfCorrectionDemonstrated:
      withoutHarnessScore.behavior.failed > 0 && withHarnessScore.behavior.failed === 0,
    phases: withMetrics.phaseDiscipline.phases,
  };
}

export { compareAbMetrics, scoreExtendedMetrics };
export type { ExtendedMetrics, ComparisonMetrics };
