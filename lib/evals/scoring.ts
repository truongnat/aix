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
  extended?: any;
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
          mode: rubricJudge.mode!,
          rubricId: rubricJudge.rubricId!,
          passed: rubricJudge.passed!,
          llm: rubricJudge.llm,
        }
      : null,
  };
}

export { scoreRun };
export type { CheckResult, Summary, RubricJudge, CheckResults, Score };
