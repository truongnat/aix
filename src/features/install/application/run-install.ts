// Purpose: Orchestrate full install dispatch sequence
// Layer: application
// Depends on: domain, infrastructure, install-kernel

/** In-process install orchestrator. */

import { applyPrivateIgnore, reconcileDeferredPrivateIgnore } from "../../../shared/install-kernel/git-hygiene";
import { initHarnessProfile } from "../infrastructure/harness-skeleton";
import { legacyDomainSkillGeneration } from "../infrastructure/legacy-deps";
const { writeDomainSkillSurface } = legacyDomainSkillGeneration;
import { installCapabilityCache } from "../infrastructure/install-cache";
import { legacyCommandInstallation } from "../infrastructure/legacy-deps";
const { installProviderInteraction } = legacyCommandInstallation;
import { getProviderAdapter } from "../infrastructure/adapters/registry";
import {
  createCoreSource,
  detectProjectContext,
  resolveCoreRoot,
} from "../domain/core-source";
import type { ProviderScope } from "../domain/provider-adapter";
import { legacyProviderDetection } from "../infrastructure/legacy-deps";
const { isGitRepo } = legacyProviderDetection;
import os from "node:os";

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
      process.stdout.write("\n--- Git exclude ---\n");
    }
    applyPrivateIgnore({
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
    const adapter = getProviderAdapter(runtime);
    if (adapter) {
      const scope = ctx.scope as ProviderScope;
      process.stdout.write(`\n--- Provider ${verb}: ${runtime} (${scope}) ---\n`);
      const core = createCoreSource(
        resolveCoreRoot({ scope, targetRoot: ctx.target, packRoot: ctx.packRoot })
      );
      const result = adapter.install({
        core,
        packRoot: ctx.packRoot,
        scope,
        targetRoot: ctx.target,
        homeRoot: os.homedir(),
        project: detectProjectContext(ctx.target, gitRepo),
        dryRun: ctx.dryRun,
        force,
      });
      messages.push(...result.messages);
      if (!result.ok) {
        throw new Error(`Provider '${runtime}' ${verb} failed`);
      }
      process.stdout.write(`\nProvider '${ctx.provider}' ${verb} finished.\n`);
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
