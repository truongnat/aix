"use strict";

const { isNonInteractive } = require("../cli-args");
const { ACTIVE_PROVIDERS, FALLBACK_TARGETS } = require("../cli-providers");
const { detectInstalledProviders, isGitRepo } = require("../cli-detect");
const { runAihSh, buildUpdateArgs } = require("../cli-backend");
const {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  backendOpts,
  failWithBackendError,
} = require("../cli-command-helpers");
const ui = require("../cli-ui");

async function runUpdateWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  let providers = [...options.providers];
  const installed = detectInstalledProviders(targetAbs);

  if (isNonInteractive(options)) {
    if (installed.length === 0 && providers.length === 0) {
      throw new Error("No installed providers detected. Pass --provider or install first.");
    }
    if (providers.length === 0) {
      throw new Error("No provider selected. Pass --provider cursor or run interactively.");
    }
  } else {
    ui.introBanner({
      version: readPackageVersion(packRoot),
      target: targetAbs,
      gitRepo: isGitRepo(targetAbs),
    });
    if (installed.length === 0) {
      throw new Error("No installed providers detected. Install first.");
    }
    if (providers.length === 0) {
      const items = [...ACTIVE_PROVIDERS, ...FALLBACK_TARGETS]
        .filter((p) => installed.includes(p.id))
        .map((p) => ({
          id: p.id,
          label: p.label,
          implemented: true,
          recommended: true,
        }));
      providers = await ui.selectProviders(items);
      if (!providers) {
        return 1;
      }
    }
    ui.showUpdatePlan(providers);
    const proceed = await ui.confirmProceed("Proceed with update?");
    if (!proceed) {
      return 1;
    }
  }

  validateProviderSelection(providers);
  if (isNonInteractive(options)) {
    ui.showUpdatePlan(providers, { compact: true });
  }

  const ctx = {
    target: targetAbs,
    ref: options.ref,
    scope: options.scope || "project",
    visibility: options.visibility || "private",
    dryRun: options.dryRun,
    yes: true,
  };

  const run = () => {
    let lastResult = { status: 0, combined: "" };
    for (const provider of providers) {
      lastResult = runAihSh(packRoot, buildUpdateArgs(provider, ctx), {
        cwd: process.cwd(),
        ...backendOpts(options),
      });
      if (lastResult.status !== 0) {
        break;
      }
    }
    if (lastResult.status !== 0) {
      return { ok: false, status: failWithBackendError("Update", lastResult, options) };
    }
    return { ok: true, status: 0, spinnerMessage: "Updated" };
  };

  let status;
  if (ui.useInteractiveUi(options)) {
    const result = await ui.runWithSpinner("Updating harness…", async () => run());
    status = result?.status ?? 0;
    if (status === 0) {
      ui.showSuccess(options.dryRun ? "Dry-run complete" : "Updated");
    }
  } else {
    if (!options.verbose) {
      process.stdout.write("Updating harness…\n");
    }
    status = run().status ?? 0;
    if (status === 0) {
      console.log(options.dryRun ? "\nDry-run complete." : "\nUpdated.");
    }
  }
  return status;
}

module.exports = {
  runUpdateWizard,
};
