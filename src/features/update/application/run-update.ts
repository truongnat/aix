// Purpose: Refresh installed harness surfaces via install orchestrator
// Layer: application
// Depends on: domain, infrastructure, install-kernel

/** In-process update orchestrator. */

import os from "node:os";
import { runInstall } from "../../install/application/run-install";
import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";
const { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;

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
  const targetAbs = ctx.scope === "global" ? os.homedir() : ctx.target;
  const installedProviders = readInstalledCommandSurface(targetAbs)?.installedProviders || [];

  if (ctx.provider === "manual") {
    messages.push("error: Manual fallback update is not supported. Re-run install instead.");
    return { ok: false, messages };
  }

  if (ctx.scope !== "global") {
    if (installedProviders.length === 0) {
      messages.push(
        "error: No installed providers recorded in .ai-harness/manifest.json. Reinstall first."
      );
      return { ok: false, messages };
    }
    if (!installedProviders.includes(ctx.provider)) {
      messages.push(
        `error: Provider ${ctx.provider} is not recorded in .ai-harness/manifest.json. Reinstall first.`
      );
      return { ok: false, messages };
    }
  }

  return runInstall(
    {
      packRoot: ctx.packRoot,
      target: targetAbs,
      provider: ctx.provider,
      scope: ctx.scope,
      visibility: ctx.visibility,
      dryRun: ctx.dryRun,
      initHarness: false,
      installCache: true,
      domains: [],
      force: true,
    },
    {
      runtimeBannerVerb: "update",
    }
  );
}
