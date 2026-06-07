/**
 * In-process update orchestrator.
 *
 * Ports aih.sh `run_update` (lines 1211-1232):
 *   - Rejects the "manual" provider (no supported update path).
 *   - Handles global scope as not-yet-implemented (dry-run → ok notice, real → error).
 *   - Applies private git-exclude when visibility=private + info-exclude strategy.
 *   - Runs capability-cache install + runtime-native install, both with force=true.
 *   - Does NOT init the .harness skeleton (unlike install).
 */

import { runInstall } from "./install-orchestrator";

export interface UpdateContext {
  packRoot: string;
  target: string;
  provider: string;
  scope: string;
  visibility: string;
  dryRun: boolean;
  /** Ignored — update always uses force=true. Present for forward-compat parity. */
  force?: boolean;
}

export interface UpdateResult {
  ok: boolean;
  messages: string[];
}

export function runUpdate(ctx: UpdateContext): UpdateResult {
  const messages: string[] = [];

  // Guard: manual provider is not supported for update.
  if (ctx.provider === "manual") {
    messages.push("error: Manual fallback update is not supported. Re-run install instead.");
    return { ok: false, messages };
  }

  // Guard: global scope update is not yet implemented.
  if (ctx.scope === "global") {
    const notice = "Global update is planned but not implemented in this step.";
    if (ctx.dryRun) {
      process.stdout.write("\n--- Update ---\n");
      process.stdout.write(`${notice}\n`);
      messages.push(`notice: ${notice}`);
      return { ok: true, messages };
    }
    messages.push(`error: ${notice}`);
    return { ok: false, messages };
  }

  // Delegate to runInstall with:
  //   initHarness: false  — update must NOT touch the .harness skeleton
  //   installCache: true  — mirrors run_capability_cache_install 1
  //   force: true         — mirrors the shell '1' arg (force overwrite)
  return runInstall(
    {
      packRoot: ctx.packRoot,
      target: ctx.target,
      provider: ctx.provider,
      scope: ctx.scope,
      visibility: ctx.visibility,
      dryRun: ctx.dryRun,
      initHarness: false,
      installCache: true,
      force: true,
    },
    {
      runtimeBannerVerb: "update",
    }
  );
}
