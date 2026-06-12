import fs from "node:fs";
import path from "node:path";
import { HARNESS_MARKER } from "../../../shared/install-kernel/constants";

interface DetectInstalledProviderOptions {
  includeLegacy?: boolean;
}

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

function detectRecommendedProviders(targetRoot: string): string[] {
  const recommended: string[] = [];

  if (pathExists(targetRoot, ".claude") || pathExists(targetRoot, ".claude/CLAUDE.md")) {
    recommended.push("claude");
  }
  if (
    pathExists(targetRoot, ".cursor") ||
    pathExists(targetRoot, ".cursor/commands") ||
    pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")
  ) {
    recommended.push("cursor");
  }
  if (pathExists(targetRoot, ".codex") || pathExists(targetRoot, ".codex-plugin/plugin.json")) {
    recommended.push("codex");
  }
  if (pathExists(targetRoot, ".agents/skills")) {
    recommended.push("codex");
  }
  if (pathExists(targetRoot, ".gemini")) {
    recommended.push("gemini");
  }

  return [...new Set(recommended)];
}

function detectInstalledProviders(
  targetRoot: string,
  options: DetectInstalledProviderOptions = {}
): string[] {
  const installed: string[] = [];
  const includeLegacy = options.includeLegacy ?? false;

  if (
    pathExists(targetRoot, ".cursor/commands") ||
    pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")
  ) {
    installed.push("cursor");
  }
  if (pathExists(targetRoot, ".claude/CLAUDE.md")) {
    installed.push("claude");
  }
  if (
    pathExists(targetRoot, ".codex") ||
    pathExists(targetRoot, ".codex/hooks.json") ||
    pathExists(targetRoot, ".codex-plugin/plugin.json")
  ) {
    installed.push("codex");
  }
  if (pathExists(targetRoot, ".agents/skills")) {
    installed.push("codex");
  }
  if (pathExists(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md")) {
    installed.push("gemini");
  }
  if (includeLegacy && pathExists(targetRoot, ".opencode/plugins/ai-engineering-harness.js")) {
    installed.push("opencode");
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
  try {
    if (!fs.existsSync(gitPath)) {
      return false;
    }
    const stat = fs.statSync(gitPath);
    if (stat.isDirectory()) {
      return fs.existsSync(path.join(gitPath, "HEAD"));
    }
    if (!stat.isFile()) {
      return false;
    }

    const content = fs.readFileSync(gitPath, "utf8");
    const match = content.match(/^gitdir:\s*(.+)$/m);
    if (!match) {
      return false;
    }
    const resolved = path.resolve(targetRoot, match[1].trim());
    return fs.existsSync(path.join(resolved, "HEAD"));
  } catch {
    return false;
  }
}

export {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
};
export type { DetectInstalledProviderOptions };
