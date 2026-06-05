import { VALID_TARGET_RUNTIMES } from "./constants";

function normalizeTargetRuntime(runtime: string): string {
  return runtime;
}

function getRuntimeBootstrapPaths(runtime: string): string[] | null {
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

function isValidTargetRuntime(runtime: string): boolean {
  return VALID_TARGET_RUNTIMES.includes(runtime);
}

export { getRuntimeBootstrapPaths, isValidTargetRuntime, normalizeTargetRuntime };
