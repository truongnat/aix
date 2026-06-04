"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { modeToScopeVisibility, isNonInteractive } = require("../cli-args");
const { ACTIVE_PROVIDERS, providerPriorityLabel, isRuntimeNative } = require("../cli-providers");
const {
  detectRecommendedProviders,
  detectLegacyProviderResidue,
  isGitRepo,
} = require("../cli-detect");
const { buildInstallPlan } = require("../cli-plan");
const { runAihSh, buildInstallArgs } = require("../cli-backend");
const {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  backendOpts,
  failWithBackendError,
} = require("../cli-command-helpers");
const ui = require("../cli-ui");

async function runInstallBackend(packRoot, ctx, options) {
  const run = () => {
    let lastResult = { status: 0, combined: "" };
    for (let i = 0; i < ctx.providers.length; i += 1) {
      const provider = ctx.providers[i];
      const args = buildInstallArgs(provider, ctx, i);
      lastResult = runAihSh(packRoot, args, { cwd: process.cwd(), ...backendOpts(options) });
      if (lastResult.status !== 0) {
        break;
      }
    }
    if (lastResult.status !== 0) {
      return {
        ok: false,
        status: failWithBackendError("Install", lastResult, options),
        combined: lastResult.combined,
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

async function runInstallWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const legacyProviders = detectLegacyProviderResidue(targetAbs);
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
    const plan = buildInstallPlan({
      providers,
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
  const plan = buildInstallPlan({
    providers,
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

module.exports = {
  runInstallBackend,
  runInstallWizard,
};
