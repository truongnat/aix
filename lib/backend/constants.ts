export const EXCLUDE_BLOCK_START = "# ai-engineering-harness start";
export const EXCLUDE_BLOCK_END = "# ai-engineering-harness end";
export const HARNESS_MARKER = "ai-engineering-harness";

/** Provider command surface paths written into a target repo. */
export function providerCommandPaths(provider: string): string[] {
  switch (provider) {
    case "cursor":
      return [".cursor/commands/", ".cursor/rules/"];
    case "claude":
      return [".claude/commands/"];
    case "gemini":
      return [".gemini/extensions/ai-engineering-harness/commands/"];
    default:
      return [];
  }
}

/** Paths to ignore for a provider install. */
export function ignorePathsForProvider(provider: string, initHarness: boolean): string[] {
  const out: string[] = [".harness/"];
  void initHarness;
  switch (provider) {
    case "cursor":
      out.push(...providerCommandPaths("cursor"));
      break;
    case "claude":
      out.push(
        ".claude/CLAUDE.md",
        ".claude/settings.json",
        ".claude/agents/",
        ".claude/skills/",
        ...providerCommandPaths("claude")
      );
      break;
    case "gemini":
      out.push(".gemini/extensions/ai-engineering-harness/", ...providerCommandPaths("gemini"));
      break;
    case "opencode":
      out.push(".opencode/plugins/ai-engineering-harness.js");
      break;
    case "codex":
    case "generic":
    case "manual":
      out.push("AGENTS.md");
      if (provider === "codex") {
        out.push(".codex/");
        out.push(".agents/skills/");
      }
      break;
    case "all":
      out.push(
        ".cursor/commands/",
        ".cursor/rules/",
        ".claude/CLAUDE.md",
        ".claude/settings.json",
        ".claude/agents/",
        ".claude/skills/",
        ".claude/commands/",
        ".codex/",
        ".gemini/extensions/ai-engineering-harness/",
        ".opencode/plugins/ai-engineering-harness.js",
        "AGENTS.md",
        ".agents/skills/"
      );
      break;
  }
  return out;
}

/** Paths removed on uninstall for a provider (.harness/ excluded — handled by removeState flag). */
export function uninstallPathsForProvider(provider: string): string[] {
  return ignorePathsForProvider(provider, false).filter((p) => p !== ".harness/");
}
