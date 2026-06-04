"use strict";

const { VALID_TARGET_RUNTIMES } = require("./constants.js");

function normalizeTargetRuntime(runtime) {
  return runtime;
}

function getRuntimeBootstrapPaths(runtime) {
  const normalized = normalizeTargetRuntime(runtime);

  switch (normalized) {
    case "generic":
    case "codex":
    case "manual":
      return ["AGENTS.md"];
    case "cursor":
      return [".cursor/rules/ai-engineering-harness.mdc"];
    case "gemini":
      return [
        ".gemini/extensions/ai-engineering-harness/gemini-extension.json",
        ".gemini/extensions/ai-engineering-harness/GEMINI.md",
      ];
    case "claude":
      return [".claude/CLAUDE.md", ".claude/settings.json"];
    default:
      return null;
  }
}

function isValidTargetRuntime(runtime) {
  return VALID_TARGET_RUNTIMES.includes(runtime);
}

module.exports = {
  getRuntimeBootstrapPaths,
  isValidTargetRuntime,
  normalizeTargetRuntime,
};
