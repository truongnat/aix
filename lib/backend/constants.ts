export const EXCLUDE_BLOCK_START = "# ai-engineering-harness start";
export const EXCLUDE_BLOCK_END = "# ai-engineering-harness end";
/** Canonical marker string; lib/cli-detect.ts has a local duplicate that should migrate to import this during the CLI rewire task. */
export const HARNESS_MARKER = "ai-engineering-harness";

/** Provider command surface paths (relative to target). Mirrors aih.sh harness_provider_command_paths. */
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

/** Paths to ignore for a provider install. Mirrors aih.sh harness_ignore_paths_for_runtime. */
export function ignorePathsForProvider(provider: string, initHarness: boolean): string[] {
  const out: string[] = [];
  if (initHarness) out.push(".harness/");
  switch (provider) {
    case "cursor":
      out.push(...providerCommandPaths("cursor"));
      break;
    case "claude":
      out.push(".claude/CLAUDE.md", ".claude/settings.json", ...providerCommandPaths("claude"));
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
      break;
    case "all":
      out.push(
        ".cursor/commands/",
        ".cursor/rules/",
        ".claude/CLAUDE.md",
        ".claude/settings.json",
        ".claude/commands/",
        ".gemini/extensions/ai-engineering-harness/",
        ".opencode/plugins/ai-engineering-harness.js",
        "AGENTS.md"
      );
      break;
  }
  return out;
}

/** Paths removed on uninstall for a provider. Mirrors aih.sh runtime_paths_for_uninstall (aih.sh:281-315).
 *
 * Confirmed: runtime_paths_for_uninstall in the shell exactly matches harness_ignore_paths_for_runtime
 * with _init=0 (no .harness/ prefix). No divergence found.
 */
export function uninstallPathsForProvider(provider: string): string[] {
  return ignorePathsForProvider(provider, false);
}
