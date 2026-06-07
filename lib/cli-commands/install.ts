import fs from "node:fs";
import path from "node:path";

import { modeToScopeVisibility, isNonInteractive, type ParseOptions } from "../cli-args";
import { ACTIVE_PROVIDERS, providerPriorityLabel, isRuntimeNative } from "../cli-providers";
import { detectRecommendedProviders, detectLegacyProviderResidue, isGitRepo } from "../cli-detect";
import { buildInstallPlan, type PlanProviderId } from "../cli-plan";
import * as ui from "../cli-ui";
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  failWithBackendError,
} from "../cli-command-helpers";
import { runInstall } from "../backend/install-orchestrator";

interface InstallWizardOptions extends ParseOptions {
  command: string;
  scope: string;
  visibility: string;
}

interface InstallContextExtended {
  target: string;
  dryRun: boolean;
  yes: boolean;
  providers: string[];
  scope: string;
  visibility: string;
  initHarness: boolean;
  installCache: boolean;
}

function toPlanProviders(providers: string[]): PlanProviderId[] {
  return providers as PlanProviderId[];
}

async function runInstallBackend(
  packRoot: string,
  ctx: InstallContextExtended,
  options: ParseOptions
): Promise<number> {
  const run = () => {
    let lastResult: { ok: boolean; messages: string[] } = { ok: true, messages: [] };
    for (let i = 0; i < ctx.providers.length; i += 1) {
      const provider = ctx.providers[i];
      lastResult = runInstall({
        packRoot,
        target: ctx.target,
        provider,
        scope: ctx.scope,
        visibility: ctx.visibility,
        dryRun: ctx.dryRun,
        initHarness: ctx.initHarness && i === 0,
        installCache: ctx.installCache && i === 0,
        force: false,
      });
      if (!lastResult.ok) {
        break;
      }
    }
    if (!lastResult.ok) {
      return {
        ok: false,
        status: failWithBackendError(
          "Install",
          { status: 1, combined: lastResult.messages.join("\n") },
          options
        ),
        combined: lastResult.messages.join("\n"),
      };
    }
    return { ok: true, status: 0, spinnerMessage: ctx.dryRun ? "Dry-run complete" : "Installed" };
  };

  if (ui.useInteractiveUi(options)) {
    const result = await ui.runWithSpinner(
      ctx.dryRun ? "Previewing install…" : "Installing harness…",
      async () => run()
    );
    return result?.status ?? 0;
  }

  if (!options.verbose) {
    process.stdout.write(ctx.dryRun ? "Running install dry-run…\n" : "Installing harness…\n");
  }
  const result = run();
  return result.status ?? 0;
}

async function runInstallWizard(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const legacyProviders = detectLegacyProviderResidue(targetAbs);
  if (legacyProviders.length > 0 && !ui.useInteractiveUi(options)) {
    console.error(
      `warning: legacy provider residue detected: ${legacyProviders.join(", ")}. See docs/uninstall-usage.md for legacy cleanup guidance if this is stale.`
    );
  }

  const interactive = ui.useInteractiveUi(options);
  let providers = [...options.providers];

  if (isNonInteractive(options)) {
    if (providers.length === 0) {
      throw new Error("No provider selected. Pass --provider cursor or run interactively.");
    }
    validateProviderSelection(providers);
    validateManualMix(providers);

    const scopeVis = options.scope
      ? { scope: options.scope, visibility: options.visibility || "private" }
      : modeToScopeVisibility("project-private");
    if (options.scope && !options.visibility && scopeVis.scope === "project") {
      scopeVis.visibility = "private";
    }

    const initHarness = !fs.existsSync(path.join(targetAbs, ".harness"));
    const installCache =
      scopeVis.scope === "project" && providers.some((id) => isRuntimeNative(id));
    const plan = buildInstallPlan({
      providers: toPlanProviders(providers),
      initHarness,
      installCache,
      mode: scopeVis.visibility === "shared" ? "project-shared" : "project-private",
      isGit: isGitRepo(targetAbs),
    });
    ui.showInstallPlan(plan, { compact: true });
    if (plan.mode === "project-private" && !plan.isGit) {
      console.log(
        "\nwarning: target is not a Git repo; private .git/info/exclude cannot be updated."
      );
    }

    const status = await runInstallBackend(
      packRoot,
      {
        providers,
        target: targetAbs,
        scope: scopeVis.scope,
        visibility: scopeVis.visibility,
        dryRun: options.dryRun,
        yes: true,
        initHarness,
        installCache,
      },
      options
    );
    if (status === 0) {
      console.log(options.dryRun ? "\nDry-run complete." : "\nInstalled.");
    }
    return status;
  }

  ui.introBanner({
    version: readPackageVersion(packRoot),
    target: targetAbs,
    gitRepo: isGitRepo(targetAbs),
  });

  const recommended = detectRecommendedProviders(targetAbs);
  const providerItems = ACTIVE_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    implemented: p.implemented,
    recommended: recommended.includes(p.id),
    priorityLabel: providerPriorityLabel(p),
  }));

  const selectedProviders = await ui.selectProviders(providerItems);
  if (!selectedProviders) {
    return 1;
  }
  providers = selectedProviders;
  validateProviderSelection(providers);
  validateManualMix(providers);

  const mode = await ui.selectInstallMode();
  if (!mode) {
    return 1;
  }

  const harnessExists = fs.existsSync(path.join(targetAbs, ".harness"));
  const initHarness = await ui.confirmInitHarness(!harnessExists);
  if (initHarness === null) {
    return 1;
  }

  const { scope } = modeToScopeVisibility(mode);
  const defaultCache = scope === "project" && providers.some((id) => isRuntimeNative(id));
  const installCacheChoice = await ui.confirmInstallCache(defaultCache);
  if (installCacheChoice === null) {
    return 1;
  }
  const installCache = installCacheChoice;

  const { scope: resolvedScope, visibility } = modeToScopeVisibility(mode);
  const plan = buildInstallPlan({
    providers: toPlanProviders(providers),
    initHarness,
    installCache,
    mode,
    isGit: isGitRepo(targetAbs),
  });
  ui.showInstallPlan(plan);
  if (plan.mode === "project-private" && !plan.isGit) {
    ui.showWarning(
      "Target is not a Git repo; private .git/info/exclude cannot be updated.\nRun `git init` first or choose project shared."
    );
  }

  const proceed = await ui.confirmProceed("Proceed with install?");
  if (!proceed) {
    return 1;
  }

  const status = await runInstallBackend(
    packRoot,
    {
      providers,
      target: targetAbs,
      scope: resolvedScope,
      visibility,
      dryRun: options.dryRun,
      yes: true,
      initHarness,
      installCache,
    },
    options
  );

  if (status === 0 && interactive) {
    ui.showSuccess(options.dryRun ? "Dry-run complete" : "Installed");
  }
  return status;
}

export { runInstallBackend, runInstallWizard };
