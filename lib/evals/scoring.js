"use strict";

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

function scoreRun(checks) {
  return {
    outcome: summarize(checks.outcome),
    behavior: summarize(checks.behavior),
  };
}

module.exports = {
  scoreRun,
};
