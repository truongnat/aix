// @ts-ignore - JS file with checkJs
import { mutationMetrics } from "./mode-mutations";

interface Task {
  id: string;
  metrics?: {
    withHarnessSteps: number;
    withoutHarnessSteps: number;
    phases: string[];
  };
}

interface Score {
  behavior: {
    percent: number;
    failed: number;
  };
}

interface ExtendedMetrics {
  steps: number;
  efficiency: {
    steps: number;
    baselineSteps: number;
    harnessSteps: number;
    improvement: number;
  };
  phaseDiscipline: {
    phases: string[];
    behaviorPassRate: number;
    passed: boolean;
  };
  selfCorrectionReady: boolean;
}

interface ComparisonMetrics {
  efficiencyGain: number;
  withHarnessSteps: number;
  withoutHarnessSteps: number;
  phaseDisciplineDelta: number;
  selfCorrectionDemonstrated: boolean;
  phases: string[];
}

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
    selfCorrectionReady: mode === "with-harness",
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
    efficiencyGain: withMetrics.efficiency.improvement,
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
