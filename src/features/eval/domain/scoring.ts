// Purpose: Eval scoring types and helpers
// Layer: domain
// Depends on: nothing

interface CheckResult {
  passed: boolean;
}

interface Summary {
  total: number;
  passed: number;
  failed: number;
  percent: number;
  results: CheckResult[];
}

interface RubricJudge {
  mode?: string;
  rubricId?: string;
  passed?: boolean;
  checks?: CheckResult[];
  llm?: {
    attempted: boolean;
    passed?: boolean;
    score?: number | null;
    reason?: string;
  } | null;
}

interface CheckResults {
  outcome: CheckResult[];
  behavior: CheckResult[];
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
  estimatedEfficiencyGain: number;
  withHarnessSteps: number;
  withoutHarnessSteps: number;
  phaseDisciplineDelta: number;
  selfCorrectionDemonstrated: boolean;
  phases: string[];
}

interface Score {
  outcome: Summary;
  behavior: Summary;
  rubric: {
    mode: string;
    rubricId: string;
    passed: boolean;
    llm:
      | {
          attempted: boolean;
          passed?: boolean;
          score?: number | null;
          reason?: string;
        }
      | null
      | undefined;
  } | null;
  extended?: ExtendedMetrics;
}

function summarize(results: CheckResult[]): Summary {
  const total = results.length;
  const passed = results.filter((item) => item.passed).length;
  return {
    total,
    passed,
    failed: total - passed,
    percent: total === 0 ? 1 : passed / total,
    results,
  };
}

function scoreRun(checks: CheckResults, rubricJudge: RubricJudge | null): Score {
  const behaviorResults = [...checks.behavior];
  if (rubricJudge && rubricJudge.checks && rubricJudge.checks.length > 0) {
    behaviorResults.push(...rubricJudge.checks);
  }

  return {
    outcome: summarize(checks.outcome),
    behavior: summarize(behaviorResults),
    rubric: rubricJudge
      ? {
          mode: rubricJudge.mode ?? "none",
          rubricId: rubricJudge.rubricId ?? "",
          passed: rubricJudge.passed ?? false,
          llm: rubricJudge.llm,
        }
      : null,
  };
}

export { scoreRun };
export type {
  CheckResult,
  Summary,
  RubricJudge,
  CheckResults,
  ExtendedMetrics,
  ComparisonMetrics,
  Score,
};
