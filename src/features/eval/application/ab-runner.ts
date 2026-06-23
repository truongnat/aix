// Purpose: Run A/B eval tasks end-to-end
// Layer: application
// Depends on: domain, infrastructure, insights

import { cleanupWorkspace, materializeFixture } from "../infrastructure/fixture-manager";
import type { Workspace } from "../infrastructure/fixture-manager";
import { runChecks } from "../domain/checks";
import type { CheckResults } from "../domain/checks";
import { judgeWithLlmFallback } from "../infrastructure/llm-judge";
import type { JudgeResult } from "../infrastructure/llm-judge";
import { compareAbMetrics, scoreExtendedMetrics } from "../infrastructure/extended-metrics";
import type { ExtendedMetrics, ComparisonMetrics } from "../domain/scoring";
import { applyModeMutation } from "../domain/mode-mutations";
import { scoreRun } from "../domain/scoring";
import type { Score } from "../domain/scoring";
import { createRunContext, type RunContext } from "../infrastructure/run-context";
import { runLiveProviderCommand } from "../infrastructure/live-runner";
import type { LiveRunResult } from "../infrastructure/live-runner";
import { writeModeArtifacts, writeRunSummary } from "../infrastructure/reporter";
import type { ModeArtifactsPaths } from "../infrastructure/reporter";
import { buildEvalRecommendations } from "../../insights/application/recommend-evals";
import type { Task } from "../domain/task-registry";

interface RunOptions {
  provider?: string;
  verbose?: boolean;
  useLlmJudge?: boolean;
  targetRoot?: string;
  liveProviderCommand?: string;
  timeoutMs?: number;
}

interface ModeResult {
  mode: string;
  workspace: Workspace;
  checks: CheckResults;
  score: Score;
  artifacts: ModeArtifactsPaths;
  evidenceKind: string;
  liveProviderCommand: string;
  liveExitCode: number | null;
}

interface AbTaskResult {
  runId: string;
  runRoot: string;
  summaryPath: string;
  comparison: ComparisonMetrics;
  exitCode: number;
}

async function runMode(
  packRoot: string,
  task: Task,
  runContext: RunContext,
  mode: string,
  options: RunOptions = {}
): Promise<ModeResult> {
  const workspace = materializeFixture(packRoot, task);
  const provider = options.provider || "deterministic-local";
  const liveProviderCommand = options.liveProviderCommand?.trim();
  let liveRun: LiveRunResult | null = null;

  try {
    if (liveProviderCommand) {
      liveRun = runLiveProviderCommand({
        packRoot,
        task,
        mode,
        provider,
        providerCommand: liveProviderCommand,
        workspace,
        timeoutMs: options.timeoutMs,
      });
    } else {
      applyModeMutation(mode, workspace.cwd, task, packRoot);
    }
    const checks = await runChecks(workspace.cwd, task);
    const rubric: JudgeResult = await judgeWithLlmFallback(packRoot, workspace.cwd, task, options);
    const score = scoreRun(checks, rubric);
    const extended: ExtendedMetrics = scoreExtendedMetrics(task, mode, score, packRoot);
    score.extended = extended;

    const modeDir = runContext.modeDir(mode);
    const evidenceKind = liveRun ? "live-provider-command" : "synthetic-fixture";
    const artifacts = writeModeArtifacts(modeDir, {
      summary: {
        taskId: task.id,
        mode,
        provider,
        evidenceKind,
        liveProviderCommand: liveRun?.command || "",
        liveExitCode: liveRun?.exitCode ?? null,
        outcome: score.outcome,
        behavior: score.behavior,
        extended,
      },
      metrics: score,
      transcript: liveRun
        ? liveRun.transcript
        : `# ${task.id} ${mode}\n\nProvider: ${provider}\nSteps: ${extended.steps}\n`,
      report: liveRun
        ? `# Eval Report\n\n- Task: ${task.id}\n- Mode: ${mode}\n- Evidence kind: live-provider-command\n- Live provider command: ${liveRun.command}\n- Live exit code: ${liveRun.exitCode}\n- Outcome: ${score.outcome.passed}/${score.outcome.total}\n- Behavior: ${score.behavior.passed}/${score.behavior.total}\n- Steps: ${extended.steps}\n`
        : `# Eval Report\n\n- Task: ${task.id}\n- Mode: ${mode}\n- Evidence kind: synthetic-fixture\n- Outcome: ${score.outcome.passed}/${score.outcome.total}\n- Behavior: ${score.behavior.passed}/${score.behavior.total}\n- Steps: ${extended.steps}\n`,
    });

    return {
      mode,
      workspace,
      checks,
      score,
      artifacts,
      evidenceKind,
      liveProviderCommand: liveRun?.command || "",
      liveExitCode: liveRun?.exitCode ?? null,
    };
  } catch (error) {
    cleanupWorkspace(workspace);
    throw error;
  }
}

async function runAbTask(
  packRoot: string,
  task: Task,
  options: RunOptions = {}
): Promise<AbTaskResult> {
  const runContext = createRunContext(packRoot, task.id);
  let results: ModeResult[] = [];

  try {
    results = await Promise.all([
      runMode(packRoot, task, runContext, "with-harness", options),
      runMode(packRoot, task, runContext, "without-harness", options),
    ]);
    const [withHarness, withoutHarness] = results;
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
        "with-harness": {
          ...withHarness.score,
          evidenceKind: withHarness.evidenceKind,
          liveProviderCommand: withHarness.liveProviderCommand,
          liveExitCode: withHarness.liveExitCode,
        },
        "without-harness": {
          ...withoutHarness.score,
          evidenceKind: withoutHarness.evidenceKind,
          liveProviderCommand: withoutHarness.liveProviderCommand,
          liveExitCode: withoutHarness.liveExitCode,
        },
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
  } finally {
    for (const result of results) {
      cleanupWorkspace(result.workspace);
    }
  }
}

export { runAbTask };
export type { RunOptions, ModeResult, AbTaskResult };
