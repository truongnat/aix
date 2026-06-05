"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreRun = scoreRun;
function summarize(results) {
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
function scoreRun(checks, rubricJudge) {
    const behaviorResults = [...checks.behavior];
    if (rubricJudge && rubricJudge.checks && rubricJudge.checks.length > 0) {
        behaviorResults.push(...rubricJudge.checks);
    }
    return {
        outcome: summarize(checks.outcome),
        behavior: summarize(behaviorResults),
        rubric: rubricJudge
            ? {
                mode: rubricJudge.mode,
                rubricId: rubricJudge.rubricId,
                passed: rubricJudge.passed,
                llm: rubricJudge.llm,
            }
            : null,
    };
}
