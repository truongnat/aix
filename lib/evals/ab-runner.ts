import { materializeFixture } from "./fixture-manager";
import { runChecks } from "./checks";
import { judgeWithLlmFallback } from "./llm-judge";
import { compareAbMetrics, scoreExtendedMetrics } from "./extended-metrics";
import { applyModeMutation } from "./mode-mutations";
import { scoreRun } from "./scoring";
import { createRunContext, type RunContext } from "./run-context";
import { writeModeArtifacts, writeRunSummary } from "./reporter";
import { buildEvalRecommendations } from "../insights/eval-recommendations";

interface Task {
  id: string;
  fixture: {
    path: string;
  };
  successChecks?: any[];
  behaviorChecks?: any[];
}

interface RunOptions {
  provider?: string;
  verbose?: boolean;
  useLlmJudge?: boolean;
  targetRoot?: string;
}

interface ModeResult {
  mode: string;
  workspace: any;
  checks: any;
  score: any;
  artifacts: any;
}

interface AbTaskResult {
  runId: string;
  runRoot: string;
  summaryPath: string;
  comparison: any;
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
  applyModeMutation(mode, workspace.cwd, task, packRoot);
  // @ts-ignore - Task type compatibility between modules
  const checks = await runChecks(workspace.cwd, task);
  const rubric = await judgeWithLlmFallback(packRoot, workspace.cwd, task, options);
  const score = scoreRun(checks, rubric);
  // @ts-ignore - Task type compatibility between modules
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

async function runAbTask(
  packRoot: string,
  task: Task,
  options: RunOptions = {}
): Promise<AbTaskResult> {
  const runContext = createRunContext(packRoot, task.id);
  const withHarness = await runMode(packRoot, task, runContext, "with-harness", options);
  const withoutHarness = await runMode(packRoot, task, runContext, "without-harness", options);
  // @ts-ignore - Task type compatibility between modules
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

export { runAbTask };
export type { RunOptions, ModeResult, AbTaskResult };
