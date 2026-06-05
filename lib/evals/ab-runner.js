"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { materializeFixture } = require("./fixture-manager");
const { runChecks } = require("./checks");
const { scoreRun } = require("./scoring");
const { createRunContext } = require("./run-context");
const { writeModeArtifacts, writeRunSummary } = require("./reporter");

function applyModeMutation(mode, cwd, task) {
  if (mode === "with-harness" && task.id === "sample-bugfix") {
    fs.writeFileSync(
      path.join(cwd, "src", "math.js"),
      `"use strict";\n\nfunction add(a, b) {\n  return a + b;\n}\n\nmodule.exports = {\n  add,\n};\n`
    );
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Fixed add() and verified tests.");
  }

  if (mode === "without-harness" && task.id === "sample-bugfix") {
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Attempted task without harness.");
  }

  if (mode === "with-harness" && task.id === "example-health-report") {
    fs.writeFileSync(
      path.join(cwd, "HEALTH_REPORT.md"),
      "# Health Report\n\nStatus: ready\nSummary: deterministic fixture generated.\n"
    );
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Generated health report.");
  }

  if (mode === "without-harness" && task.id === "example-health-report") {
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Attempted report generation.");
  }
}

async function runMode(packRoot, task, runContext, mode, options = {}) {
  const workspace = materializeFixture(packRoot, task);
  applyModeMutation(mode, workspace.cwd, task);
  const checks = await runChecks(workspace.cwd, task);
  const score = scoreRun(checks);
  const modeDir = runContext.modeDir(mode);
  const provider = options.provider || "deterministic-local";
  const artifacts = writeModeArtifacts(modeDir, {
    summary: {
      taskId: task.id,
      mode,
      provider,
      outcome: score.outcome,
      behavior: score.behavior,
    },
    metrics: score,
    transcript: `# ${task.id} ${mode}\n\nProvider: ${provider}\n`,
    report: `# Eval Report\n\n- Task: ${task.id}\n- Mode: ${mode}\n- Outcome: ${score.outcome.passed}/${score.outcome.total}\n- Behavior: ${score.behavior.passed}/${score.behavior.total}\n`,
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

  const summaryPath = writeRunSummary(runContext.runRoot, {
    runId: runContext.runId,
    taskId: task.id,
    modes: {
      "with-harness": withHarness.score,
      "without-harness": withoutHarness.score,
    },
  });

  return {
    runId: runContext.runId,
    runRoot: runContext.runRoot,
    summaryPath,
    exitCode: withHarness.score.outcome.failed === 0 ? 0 : 1,
  };
}

module.exports = {
  runAbTask,
};
