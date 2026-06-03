"use strict";

const fs = require("node:fs");
const path = require("node:path");

const HARNESS_MARKER = "ai-engineering-harness";

function fileContainsHarnessMarker(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8").includes(HARNESS_MARKER);
  } catch {
    return false;
  }
}

function pathExists(targetRoot, relativePath) {
  return fs.existsSync(path.join(targetRoot, ...relativePath.split("/")));
}

/**
 * Recommend providers from project hints (does not imply install).
 * @param {string} targetRoot absolute path
 * @returns {string[]} provider ids
 */
function detectRecommendedProviders(targetRoot) {
  const recommended = [];

  if (
    pathExists(targetRoot, ".cursor") ||
    pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")
  ) {
    recommended.push("cursor");
  }
  if (pathExists(targetRoot, ".claude") || pathExists(targetRoot, ".claude/CLAUDE.md")) {
    recommended.push("claude");
  }
  if (pathExists(targetRoot, ".gemini")) {
    recommended.push("gemini");
  }
  if (pathExists(targetRoot, ".opencode")) {
    recommended.push("opencode");
  }
  const agentsPath = path.join(targetRoot, "AGENTS.md");
  if (fs.existsSync(agentsPath) && fileContainsHarnessMarker(agentsPath)) {
    recommended.push("generic");
  }

  return [...new Set(recommended)];
}

/**
 * Detect installed harness runtime entrypoints.
 * @param {string} targetRoot absolute path
 * @returns {string[]} provider ids
 */
function detectInstalledProviders(targetRoot) {
  const installed = [];

  if (pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")) {
    installed.push("cursor");
  }
  if (pathExists(targetRoot, ".claude/CLAUDE.md")) {
    installed.push("claude");
  }
  if (pathExists(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md")) {
    installed.push("gemini");
  }
  if (pathExists(targetRoot, ".opencode/plugins/ai-engineering-harness.js")) {
    installed.push("opencode");
  }
  const agentsPath = path.join(targetRoot, "AGENTS.md");
  if (fs.existsSync(agentsPath) && fileContainsHarnessMarker(agentsPath)) {
    installed.push("generic");
  }

  return [...new Set(installed)];
}

function isGitRepo(targetRoot) {
  const gitPath = path.join(targetRoot, ".git");
  return fs.existsSync(gitPath);
}

module.exports = {
  detectRecommendedProviders,
  detectInstalledProviders,
  isGitRepo,
  fileContainsHarnessMarker
};
