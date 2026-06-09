/** In-process install orchestrator. */

import { applyPrivateIgnore, reconcileDeferredPrivateIgnore } from "./git-hygiene";
import { initHarnessProfile } from "./harness-skeleton";
import { writeDomainSkillSurface } from "../domain-skill-generation";
import { installCapabilityCache } from "../install-cache";
import { installProviderInteraction } from "../catalog/command-installation";
import { installRuntime } from "../install-runtime";
import { isRuntimeNative } from "../cli-providers";
import { isGitRepo } from "../provider-detection";
import type { RuntimeId } from "../install-runtime";

export interface InstallContext {
  packRoot: string;
  target: string; // absolute target dir
  provider: string; // provider/runtime id
  plannedProviders?: string[];
  scope: string; // "project" | "global"
  visibility: string; // "private" | "shared"
  dryRun: boolean;
  initHarness: boolean;
  plannedInitHarness?: boolean;
  installCache: boolean;
  plannedInstallCache?: boolean;
  domains: string[];
  force?: boolean;
}

export interface InstallResult {
  ok: boolean;
  messages: string[];
}

interface InstallRunOptions {
  runtimeBannerVerb?: "install" | "update";
}

/** Resolve the effective ignore strategy from scope/visibility. */
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

/** Run the full install dispatch sequence in-process. */
export function runInstall(ctx: InstallContext, options: InstallRunOptions = {}): InstallResult {
  const messages: string[] = [];
  const force = ctx.force ?? false;
  const domains = ctx.domains ?? [];
  const plannedProviders = ctx.plannedProviders?.length ? ctx.plannedProviders : [ctx.provider];
  const plannedInitHarness = ctx.plannedInitHarness ?? ctx.initHarness;
  const plannedInstallCache = ctx.plannedInstallCache ?? ctx.installCache;

  try {
    const ignoreStrategy = resolveIgnoreStrategy(ctx.scope, ctx.visibility);

    const gitRepo = isGitRepo(ctx.target);
    reconcileDeferredPrivateIgnore({
      targetAbs: ctx.target,
      dryRun: ctx.dryRun,
    });
    if (ignoreStrategy === "info-exclude" && gitRepo) {
      process.stdout.write("\n--- Git exclude (private) ---\n");
    }
    const ignoreResult = applyPrivateIgnore({
      targetAbs: ctx.target,
      provider: ctx.provider,
      plannedProviders,
      initHarness: ctx.initHarness,
      plannedInitHarness,
      installCache: ctx.installCache,
      plannedInstallCache,
      scope: ctx.scope,
      visibility: ctx.visibility,
      dryRun: ctx.dryRun,
      ignoreStrategy,
    });
    if (ignoreStrategy === "info-exclude" && gitRepo) {
      process.stdout.write("--- Git exclude complete ---\n\n");
    }
    messages.push("git-hygiene: ok");

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

    if (ctx.initHarness && ctx.scope === "project") {
      initHarnessProfile({
        targetAbs: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      messages.push("harness-skeleton: ok");

      if (domains.length > 0) {
        writeDomainSkillSurface(ctx.packRoot, ctx.target, domains, {
          packRoot: ctx.packRoot,
          targetAbs: ctx.target,
          dryRun: ctx.dryRun,
          force,
        });
        messages.push(`domain-skills: ${domains.join(", ")}`);
      }
    }

    const verb = options.runtimeBannerVerb ?? "install";
    const runtime = ctx.provider === "manual" ? "generic" : ctx.provider;
    if (isRuntimeNative(runtime)) {
      process.stdout.write(`\n--- Runtime-native ${verb} ---\n`);
      installRuntime({
        packRoot: ctx.packRoot,
        runtime: runtime as RuntimeId,
        scope: ctx.scope as "project" | "global",
        target: ctx.target,
        dryRun: ctx.dryRun,
        force,
      });
      process.stdout.write(`\nRuntime '${ctx.provider}' install finished.\n`);
      messages.push(`runtime-native(${ctx.provider}): ok`);
    }

    if (ctx.scope === "project" && ctx.installCache) {
      const runtime = ctx.provider === "manual" ? "generic" : ctx.provider;
      installProviderInteraction(ctx.target, [runtime], { dryRun: ctx.dryRun, force: true });
      messages.push(`provider-interaction(${runtime}): ok`);
    }

    return { ok: true, messages };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    messages.push(`error: ${message}`);
    return { ok: false, messages };
  }
}
