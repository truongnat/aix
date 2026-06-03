"use strict";

const { isRuntimeNative } = require("./cli-providers");

function pathsForProvider(providerId, initHarness) {
  const paths = [];
  if (initHarness) {
    paths.push(".harness/");
  }
  if (isRuntimeNative(providerId)) {
    paths.push(".ai-harness/");
  }
  switch (providerId) {
    case "cursor":
      paths.push(".cursor/rules/ai-engineering-harness.mdc");
      break;
    case "claude":
      paths.push(".claude/CLAUDE.md", ".claude/settings.json");
      break;
    case "gemini":
      paths.push(".gemini/extensions/ai-engineering-harness/");
      break;
    case "opencode":
      paths.push(".opencode/plugins/ai-engineering-harness.js");
      break;
    case "codex":
    case "generic":
    case "manual":
      paths.push("AGENTS.md");
      break;
    default:
      break;
  }
  return [...new Set(paths)];
}

function buildInstallPlan({ providers, initHarness, installCache, mode, isGit }) {
  const willInstall = [];
  for (const providerId of providers) {
    for (const p of pathsForProvider(providerId, initHarness && willInstall.length === 0)) {
      if (!willInstall.includes(p)) {
        willInstall.push(p);
      }
    }
    if (initHarness && !willInstall.includes(".harness/")) {
      willInstall.push(".harness/");
    }
    if (installCache && isRuntimeNative(providerId) && !willInstall.includes(".ai-harness/")) {
      willInstall.push(".ai-harness/");
    }
  }

  if (mode === "project-private" && isGit) {
    willInstall.push(".git/info/exclude block");
  }

  const willNotModify = [".gitignore", "root commands/", "root skills/"];

  return { willInstall, willNotModify };
}

function printPlan(plan) {
  console.log("");
  console.log("Will install:");
  for (const line of plan.willInstall) {
    console.log(`  ${line}`);
  }
  console.log("");
  console.log("Will not modify:");
  for (const line of plan.willNotModify) {
    console.log(`  ${line}`);
  }
}

module.exports = {
  pathsForProvider,
  buildInstallPlan,
  printPlan
};
