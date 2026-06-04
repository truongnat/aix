"use strict";

const { isRuntimeNative } = require("./cli-providers");
const {
  runtimeCommandCatalogPathsForPlan,
  formatCommandSupportForPlan
} = require("../runtime-command-catalog.js");

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
    for (const p of runtimeCommandCatalogPathsForPlan(providerId, "project")) {
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

  if (mode === "project-private" || mode === "project-shared") {
    if (mode === "project-private" && isGit) {
      willInstall.push(".git/info/exclude block");
    } else if (mode === "project-private" && !isGit) {
      willInstall.push("(no .git/info/exclude — target is not a Git repo)");
    }
  }

  const willNotModify = [
    ".gitignore",
    "root commands/",
    "root skills/",
    "root workflows/",
    "root templates/",
    "root patterns/"
  ];

  return { willInstall, willNotModify, mode, isGit, providers };
}

function warnNonGitPrivate(plan) {
  if (plan.mode === "project-private" && !plan.isGit) {
    console.log("");
    console.log(
      "warning: target is not a Git repo; private .git/info/exclude cannot be updated."
    );
    console.log("Run `git init` first or choose project shared / install inside a cloned repo.");
  }
}

function printPlan(plan) {
  console.log("");
  console.log("Will install:");
  for (const line of plan.willInstall) {
    console.log(`  ${line}`);
  }
  console.log("");
  console.log(formatCommandSupportForPlan(plan.providers || []));
  console.log("");
  console.log("Will not modify:");
  for (const line of plan.willNotModify) {
    console.log(`  ${line}`);
  }
}

module.exports = {
  pathsForProvider,
  buildInstallPlan,
  printPlan,
  warnNonGitPrivate
};
