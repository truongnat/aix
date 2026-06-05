"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareAbMetrics = compareAbMetrics;
exports.scoreExtendedMetrics = scoreExtendedMetrics;
// @ts-ignore - JS file with checkJs
const mode_mutations_1 = require("./mode-mutations");
function scoreExtendedMetrics(task, mode, baseScore, packRoot) {
    const metrics = (0, mode_mutations_1.mutationMetrics)(task, packRoot);
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
            improvement: metrics.withoutHarnessSteps > 0
                ? (metrics.withoutHarnessSteps - metrics.withHarnessSteps) / metrics.withoutHarnessSteps
                : 0,
        },
        phaseDiscipline,
        selfCorrectionReady: mode === "with-harness",
    };
}
function compareAbMetrics(task, withHarnessScore, withoutHarnessScore, packRoot) {
    const withMetrics = scoreExtendedMetrics(task, "with-harness", withHarnessScore, packRoot);
    const withoutMetrics = scoreExtendedMetrics(task, "without-harness", withoutHarnessScore, packRoot);
    return {
        efficiencyGain: withMetrics.efficiency.improvement,
        withHarnessSteps: withMetrics.efficiency.harnessSteps,
        withoutHarnessSteps: withoutMetrics.efficiency.steps,
        phaseDisciplineDelta: withHarnessScore.behavior.percent - withoutHarnessScore.behavior.percent,
        selfCorrectionDemonstrated: withoutHarnessScore.behavior.failed > 0 && withHarnessScore.behavior.failed === 0,
        phases: withMetrics.phaseDiscipline.phases,
    };
}
