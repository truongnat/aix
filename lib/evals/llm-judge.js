"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { runSingleCheck } = require("./checks");

function loadRubric(packRoot, rubricPath) {
  if (!rubricPath) {
    return null;
  }
  const resolved = path.isAbsolute(rubricPath) ? rubricPath : path.join(packRoot, rubricPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Rubric not found: ${rubricPath}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function runDeterministicRubric(cwd, rubric) {
  if (!rubric) {
    return { mode: "none", checks: [], passed: true };
  }

  const checks = (rubric.behaviorChecks || []).map((check) => runSingleCheck(cwd, check));
  const passed = checks.every((check) => check.passed);
  return {
    mode: "deterministic",
    rubricId: rubric.id,
    checks,
    passed,
  };
}

async function judgeWithLlmFallback(packRoot, cwd, task, options = {}) {
  const rubric = loadRubric(packRoot, task.rubric);
  const deterministic = runDeterministicRubric(cwd, rubric);

  if (!options.useLlmJudge || !process.env.EVAL_JUDGE_ENDPOINT) {
    return {
      ...deterministic,
      llm: { attempted: false, reason: "LLM judge disabled or EVAL_JUDGE_ENDPOINT unset" },
    };
  }

  return {
    ...deterministic,
    llm: {
      attempted: true,
      passed: deterministic.passed,
      reason: "LLM judge stub: using deterministic rubric fallback",
    },
  };
}

module.exports = {
  judgeWithLlmFallback,
  loadRubric,
  runDeterministicRubric,
};
