/**
 * In-process install orchestrator.
 *
 * Replaces the aih.sh dispatch sequence (lines ~2120-2167):
 *   apply_private_ignore → run_capability_cache_install → init_harness_profile → run_runtime_native_install
 *
 * Calling these functions in-process (rather than shelling out to the compiled
 * dist/ scripts) is what fixes the provider-file no-op bug: the compiled scripts
 * had no main() invocation, so shelling out was effectively a no-op for all
 * provider file writes.
 */

import fs from "node:fs";
import path from "node:path";
import { applyPrivateIgnore } from "./git-hygiene";
import { initHarnessProfile } from "./harness-skeleton";
import { installCapabilityCache } from "../install-cache";
import { installRuntime } from "../install-runtime";
import { installHarness } from "../install-legacy";
import { isRuntimeNative } from "../cli-providers";
import type { RuntimeId } from "../install-runtime";

export interface InstallContext {
  packRoot: string;
  target: string; // absolute target dir
  provider: string; // provider/runtime id
  scope: string; // "project" | "global"
  visibility: string; // "private" | "shared"
  dryRun: boolean;
  initHarness: boolean;
  installCache: boolean;
  force?: boolean;
}

export interface InstallResult {
  ok: boolean;
  messages: string[];
}

interface InstallRunOptions {
  runtimeBannerVerb?: "install" | "update";
}

/**
 * Resolve EFFECTIVE_IGNORE_STRATEGY from scope/visibility.
 * Mirrors aih.sh resolve_git_hygiene_settings (lines 814-855):
 *   - scope === "global" → "none"
 *   - visibility === "shared" → "none"
 *   - project + private → "info-exclude"
 */
function resolveIgnoreStrategy(scope: string, visibility: string): string {
  if (scope === "global") {
    return "none";
  }
  if (visibility === "shared") {
    return "none";
  }
  // project + private
  return "info-exclude";
}

/**
 * Run the full install dispatch sequence in-process.
 *
 * Step 1: applyPrivateIgnore (git hygiene) — with computed ignoreStrategy.
 * Step 2: capability cache — if scope === "project" AND installCache.
 * Step 3: initHarnessProfile — if initHarness AND scope === "project".
 * Step 4a: runtime-native install (cursor/claude/codex/gemini/generic).
 * Step 4b: manual install (legacy root-copy fallback).
 */
export function runInstall(ctx: InstallContext, options: InstallRunOptions = {}): InstallResult {
  const messages: string[] = [];
  const force = ctx.force ?? false;

  try {
    const ignoreStrategy = resolveIgnoreStrategy(ctx.scope, ctx.visibility);

    // Step 1: Git hygiene (apply_private_ignore)
    // Print banners only when strategy is info-exclude AND target is a git repo.
    // Mirrors aih.sh:657-664: non-git repos degrade to a stderr warning (applyPrivateIgnore
    // handles that path itself), so we must not emit the success banners in that case.
    const isGitRepo = fs.existsSync(path.join(ctx.target, ".git"));
    if (ignoreStrategy === "info-exclude" && isGitRepo) {
      process.stdout.write("\n--- Git exclude (private) ---\n");
    }
    applyPrivateIgnore({
      targetAbs: ctx.target,
      provider: ctx.provider,
      initHarness: ctx.initHarness,
      installCache: ctx.installCache,
      scope: ctx.scope,
      visibility: ctx.visibility,
      dryRun: ctx.dryRun,
      ignoreStrategy,
    });
    if (ignoreStrategy === "info-exclude" && isGitRepo) {
      process.stdout.write("--- Git exclude complete ---\n\n");
    }
    messages.push("git-hygiene: ok");

    // Step 2: Capability cache (.ai-harness/)
    if (ctx.scope === "project" && ctx.installCache) {
      process.stdout.write("\n--- Capability cache (.ai-harness/) ---\n");
      const cacheResults = installCapabilityCache({
        packRoot: ctx.packRoot,
        target: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      process.stdout.write("--- Capability cache complete ---\n\n");
      messages.push(`cache: ${cacheResults.length} entries`);
    }

    // Step 3: Harness skeleton init
    if (ctx.initHarness && ctx.scope === "project") {
      initHarnessProfile({
        targetAbs: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      messages.push("harness-skeleton: ok");
    }

    // Step 4: Provider install
    const verb = options.runtimeBannerVerb ?? "install";
    if (isRuntimeNative(ctx.provider)) {
      // Runtime-native path: cursor/claude/codex/gemini/generic
      process.stdout.write(`\n--- Runtime-native ${verb} ---\n`);
      installRuntime({
        packRoot: ctx.packRoot,
        runtime: ctx.provider as RuntimeId,
        scope: ctx.scope as "project" | "global",
        target: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      process.stdout.write(`\nRuntime '${ctx.provider}' install finished.\n`);
      messages.push(`runtime-native(${ctx.provider}): ok`);
    } else {
      // Manual/legacy fallback path
      installHarness({
        target: ctx.target,
        targetArg: ctx.target,
        targetDisplay: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      messages.push("manual-install: ok");

      // Manual path also calls initHarnessProfile (mirrors aih.sh:2163-2166)
      if (ctx.initHarness) {
        initHarnessProfile({
          targetAbs: ctx.target,
          dryRun: ctx.dryRun,
          force,
        });
        messages.push("harness-skeleton (manual): ok");
      }
    }

    return { ok: true, messages };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    messages.push(`error: ${message}`);
    return { ok: false, messages };
  }
}
