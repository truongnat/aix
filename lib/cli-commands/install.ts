import fs from "node:fs";
import path from "node:path";

// @ts-ignore - JS file with checkJs
import { modeToScopeVisibility, isNonInteractive, type ParseOptions } from "../cli-args";
// @ts-ignore - JS file with checkJs
import { ACTIVE_PROVIDERS, providerPriorityLabel, isRuntimeNative } from "../cli-providers";
// @ts-ignore - JS file with checkJs
import { detectRecommendedProviders, detectLegacyProviderResidue, isGitRepo } from "../cli-detect";
// @ts-ignore - JS file with checkJs
import { buildInstallPlan } from "../cli-plan";
import { runAihSh, buildInstallArgs, type InstallContext } from "../cli-backend";
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  backendOpts,
  failWithBackendError,
} from "../cli-command-helpers";

interface InstallWizardOptions extends ParseOptions {
  command: string;
  scope: string;
  visibility: string;
}

interface InstallContextExtended extends InstallContext {
  target: string;
  ref: string;
  dryRun: boolean;
  yes: boolean;
  providers: string[];
}

async function runInstallBackend(
  packRoot: string,
  ctx: InstallContextExtended,
  options: ParseOptions
): Promise<number> {
  const run = () => {
    let lastResult: { status: number | null; combined: string } = { status: 0, combined: "" };
    for (let i = 0; i < ctx.providers.length; i += 1) {
      const provider = ctx.providers[i];
      const args = buildInstallArgs(provider, ctx, i);
      lastResult = runAihSh(packRoot, args, { cwd: process.cwd(), ...backendOpts(options) });
      if ((lastResult.status ?? 0) !== 0) {
        break;
      }
    }
    if ((lastResult.status ?? 0) !== 0) {
      return {
        ok: false,
        status: failWithBackendError("Install", lastResult, options),
        combined: lastResult.combined,
      };
    }
    return { ok: true, status: 0, spinnerMessage: ctx.dryRun ? "Dry-run complete" : "Installed" };
  };

  // @ts-ignore - ui will be available when this is called from CLI context
  const ui = require("../cli-ui");
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
  // @ts-ignore - ui will be available when this is called from CLI context
  const ui = require("../cli-ui");
  if (legacyProviders.length > 0 && !ui.useInteractiveUi(options)) {
    console.error(
      `warning: legacy provider residue detected: ${legacyProviders.join(", ")}. Clean up with aih.sh uninstall --runtime opencode if this is stale.`
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
    // @ts-ignore - cli-plan is JS with checkJs
    const plan = buildInstallPlan({
      providers: providers as any,
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
        ref: options.ref,
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

  providers = await ui.selectProviders(providerItems);
  if (!providers) {
    return 1;
  }
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
  const installCache = await ui.confirmInstallCache(defaultCache);
  if (installCache === null) {
    return 1;
  }

  const { scope: resolvedScope, visibility } = modeToScopeVisibility(mode);
  // @ts-ignore - cli-plan is JS with checkJs
  const plan = buildInstallPlan({
    providers: providers as any,
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
      ref: options.ref,
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
