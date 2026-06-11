// Purpose: Remove provider surfaces and optional harness state
// Layer: application
// Depends on: domain, infrastructure, install-kernel

/**
 * Uninstall orchestrator.
 */

import * as fs from "node:fs";
import os from "node:os";
import * as path from "node:path";
import { uninstallPathsForProvider, HARNESS_MARKER } from "../../../shared/install-kernel/constants";
import { removeIgnoreBlock } from "../../../shared/install-kernel/git-hygiene";
import { legacyProviderDetection } from "../../install/infrastructure/legacy-deps";
const { isGitRepo } = legacyProviderDetection;

export interface UninstallContext {
  targetAbs: string;
  provider: string;
  scope: string; // "project" | "global"
  dryRun: boolean;
  removeCache: boolean;
  removeState: boolean;
  all: boolean;
}

export interface UninstallResult {
  ok: boolean;
  messages: string[];
}

function fileContainsHarnessMarker(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content.includes(HARNESS_MARKER);
  } catch {
    return false;
  }
}

function claudeSettingsIsHarnessOwned(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const keys = Object.keys(parsed);
    const allowedKeys = new Set(["hooks", "extraKnownMarketplaces"]);
    if (keys.some((key) => !allowedKeys.has(key))) {
      return false;
    }
    if (
      !content.includes(".ai-harness/hooks/core/guard-phase.js") ||
      !content.includes(".ai-harness/hooks/core/record-tool-output.js") ||
      !content.includes(".ai-harness/hooks/core/record-subagent-result.js") ||
      !content.includes(".ai-harness/hooks/core/compact-session-memory.js")
    ) {
      return false;
    }
    return Boolean(parsed && typeof parsed === "object");
  } catch {
    return false;
  }
}

/** Remove a file only when its ownership policy allows it. */
function removeFileIfHarnessOwned(
  rel: string,
  ownership: "marker" | "claude-settings" | "always",
  targetAbs: string,
  dryRun: boolean
): void {
  const absPath = path.join(targetAbs, rel);

  if (!fs.existsSync(absPath)) {
    process.stdout.write(`SKIP ${rel}\n`);
    return;
  }

  if (ownership === "marker" && !fileContainsHarnessMarker(absPath)) {
    process.stdout.write(`SKIP ${rel} (not clearly harness-owned)\n`);
    return;
  }

  if (ownership === "claude-settings") {
    if (!claudeSettingsIsHarnessOwned(absPath)) {
      process.stdout.write(`SKIP ${rel} (not clearly harness-owned)\n`);
      return;
    }
  }

  if (dryRun) {
    process.stdout.write(`WOULD REMOVE ${rel}\n`);
    return;
  }

  if (fs.statSync(absPath).isDirectory()) {
    fs.rmSync(absPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(absPath);
  }
  process.stdout.write(`REMOVE ${rel}\n`);
}

/** Remove a directory when requested. */
function removeDirIfRequested(
  rel: string,
  shouldRemove: boolean,
  targetAbs: string,
  dryRun: boolean
): void {
  if (!shouldRemove) {
    if (dryRun) {
      process.stdout.write(`WOULD KEEP ${rel}\n`);
    } else {
      process.stdout.write(`KEEP ${rel}\n`);
    }
    return;
  }

  const absPath = path.join(targetAbs, rel);
  if (!fs.existsSync(absPath)) {
    process.stdout.write(`SKIP ${rel}\n`);
    return;
  }

  if (dryRun) {
    process.stdout.write(`WOULD REMOVE ${rel}\n`);
    return;
  }

  fs.rmSync(absPath, { recursive: true, force: true });
  process.stdout.write(`REMOVE ${rel}\n`);
}

function removeGlobalPathIfExists(targetAbs: string, rel: string, dryRun: boolean): void {
  const absPath = path.join(targetAbs, rel);
  if (!fs.existsSync(absPath)) {
    process.stdout.write(`SKIP ${rel}\n`);
    return;
  }
  if (dryRun) {
    process.stdout.write(`WOULD REMOVE ${rel}\n`);
    return;
  }
  fs.rmSync(absPath, { recursive: true, force: true });
  process.stdout.write(`REMOVE ${rel}\n`);
}

function runGlobalUninstall(provider: string, dryRun: boolean): void {
  const home = os.homedir();
  switch (provider) {
    case "claude":
      removeFileIfHarnessOwned(".claude/CLAUDE.md", "always", home, dryRun);
      removeFileIfHarnessOwned(".claude/settings.json", "claude-settings", home, dryRun);
      removeGlobalPathIfExists(home, ".claude/agents", dryRun);
      removeGlobalPathIfExists(home, ".claude/skills", dryRun);
      removeGlobalPathIfExists(home, ".claude/commands", dryRun);
      break;
    case "cursor":
      removeGlobalPathIfExists(home, ".cursor/rules/ai-engineering-harness.mdc", dryRun);
      removeGlobalPathIfExists(home, ".cursor/rules/ai-engineering-harness-commands.mdc", dryRun);
      removeGlobalPathIfExists(home, ".cursor/rules/ai-engineering-harness-guardrails.mdc", dryRun);
      break;
    case "codex":
      removeGlobalPathIfExists(home, ".codex", dryRun);
      removeGlobalPathIfExists(home, ".agents/skills", dryRun);
      break;
    case "gemini":
      removeGlobalPathIfExists(home, ".gemini/extensions/ai-engineering-harness", dryRun);
      break;
    default:
      break;
  }
}

/** Remove provider-owned files plus optional cache/state directories. */
export function runUninstall(ctx: UninstallContext): UninstallResult {
  const messages: string[] = [];

  if (ctx.scope === "global") {
    process.stdout.write("\n--- Uninstall ---\n");
    runGlobalUninstall(ctx.provider, ctx.dryRun);
    process.stdout.write("--- Uninstall complete ---\n");
    messages.push("uninstall: ok");
    return { ok: true, messages };
  }

  const removeCache = ctx.all || ctx.removeCache;
  const removeState = ctx.all || ctx.removeState;

  process.stdout.write("\n--- Uninstall ---\n");

  const paths = uninstallPathsForProvider(ctx.provider);
  for (const rel of paths) {
    if (!rel) continue;

    let ownership: "marker" | "claude-settings" | "always";
    if (rel === "AGENTS.md") {
      ownership = "marker";
    } else if (rel === ".claude/settings.json") {
      ownership = "claude-settings";
    } else {
      ownership = "always";
    }

    removeFileIfHarnessOwned(rel, ownership, ctx.targetAbs, ctx.dryRun);
  }

  removeDirIfRequested(".ai-harness", removeCache, ctx.targetAbs, ctx.dryRun);
  removeDirIfRequested(".harness", removeState, ctx.targetAbs, ctx.dryRun);

  if (isGitRepo(ctx.targetAbs)) {
    removeIgnoreBlock({ targetAbs: ctx.targetAbs, dryRun: ctx.dryRun });
  } else {
    process.stdout.write("SKIP .git/info/exclude\n");
  }

  process.stdout.write("--- Uninstall complete ---\n");
  messages.push("uninstall: ok");
  return { ok: true, messages };
}
