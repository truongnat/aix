import fs from "node:fs";
import path from "node:path";

const HARNESS_MARKER = "ai-engineering-harness";

function fileContainsHarnessMarker(filePath: string): boolean {
  try {
    return fs.readFileSync(filePath, "utf8").includes(HARNESS_MARKER);
  } catch {
    return false;
  }
}

function pathExists(targetRoot: string, relativePath: string): boolean {
  return fs.existsSync(path.join(targetRoot, ...relativePath.split("/")));
}

/**
 * Recommend providers from project hints (does not imply install).
 */
function detectRecommendedProviders(targetRoot: string): string[] {
  const recommended: string[] = [];

  if (pathExists(targetRoot, ".claude") || pathExists(targetRoot, ".claude/CLAUDE.md")) {
    recommended.push("claude");
  }
  if (
    pathExists(targetRoot, ".cursor") ||
    pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")
  ) {
    recommended.push("cursor");
  }
  if (pathExists(targetRoot, ".codex") || pathExists(targetRoot, ".codex-plugin/plugin.json")) {
    recommended.push("codex");
  }
  if (pathExists(targetRoot, ".gemini")) {
    recommended.push("gemini");
  }

  return [...new Set(recommended)];
}

/**
 * Detect installed harness runtime entrypoints.
 */
function detectInstalledProviders(targetRoot: string): string[] {
  const installed: string[] = [];

  if (pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")) {
    installed.push("cursor");
  }
  if (pathExists(targetRoot, ".claude/CLAUDE.md")) {
    installed.push("claude");
  }
  if (pathExists(targetRoot, ".codex-plugin/plugin.json")) {
    installed.push("codex");
  }
  if (pathExists(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md")) {
    installed.push("gemini");
  }
  const agentsPath = path.join(targetRoot, "AGENTS.md");
  if (
    fs.existsSync(agentsPath) &&
    fileContainsHarnessMarker(agentsPath) &&
    !installed.includes("codex")
  ) {
    installed.push("generic");
  }

  return [...new Set(installed)];
}

function detectLegacyProviderResidue(targetRoot: string): string[] {
  const legacy: string[] = [];

  if (pathExists(targetRoot, ".opencode/plugins/ai-engineering-harness.js")) {
    legacy.push("opencode");
  }

  return legacy;
}

function isGitRepo(targetRoot: string): boolean {
  const gitPath = path.join(targetRoot, ".git");
  return fs.existsSync(gitPath);
}

export {
  detectRecommendedProviders,
  detectInstalledProviders,
  detectLegacyProviderResidue,
  isGitRepo,
  fileContainsHarnessMarker,
};
