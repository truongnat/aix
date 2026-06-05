// @ts-ignore - JS file with checkJs
import { isNonInteractive, type ParseOptions } from "../cli-args";
// @ts-ignore - JS file with checkJs
import { ACTIVE_PROVIDERS, FALLBACK_TARGETS } from "../cli-providers";
// @ts-ignore - JS file with checkJs
import { detectInstalledProviders, isGitRepo } from "../cli-detect";
import { runAihSh, buildUninstallArgs, type UninstallContext } from "../cli-backend";
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  backendOpts,
  failWithBackendError,
} from "../cli-command-helpers";

async function runUninstallWizard(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  let providers = [...options.providers];
  const installed = detectInstalledProviders(targetAbs);

  let removeCache = false;
  let removeState = false;
  let fullCleanup = options.all;

  // @ts-ignore - ui will be available when this is called from CLI context
  const ui = require("../cli-ui");

  if (isNonInteractive(options)) {
    if (installed.length === 0 && providers.length === 0) {
      throw new Error("No installed providers detected. Pass --provider or install first.");
    }
    if (providers.length === 0 && !options.all) {
      throw new Error("No provider selected. Pass --provider cursor or run interactively.");
    }
    if (options.all) {
      fullCleanup = true;
    }
  } else {
    ui.introBanner({
      version: readPackageVersion(packRoot),
      target: targetAbs,
      gitRepo: isGitRepo(targetAbs),
    });
    if (installed.length === 0) {
      throw new Error("No installed providers detected.");
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
    if (!options.all) {
      removeCache = await ui.confirmInstallCache(false);
      if (removeCache === null) {
        return 1;
      }
      removeState = await ui.confirmRemoveState(false);
      if (removeState === null) {
        return 1;
      }
      fullCleanup = await ui.confirmFullCleanup(false);
      if (fullCleanup === null) {
        return 1;
      }
    }
    ui.showUninstallPlan({ providers, removeCache, removeState, fullCleanup });
    const proceed = await ui.confirmProceed("Proceed with uninstall?");
    if (!proceed) {
      return 1;
    }
  }

  validateProviderSelection(providers);
  ui.showUninstallPlan(
    { providers, removeCache, removeState, fullCleanup },
    { compact: isNonInteractive(options) }
  );

  const ctx: UninstallContext = {
    target: targetAbs,
    scope: options.scope || "project",
    dryRun: options.dryRun,
    yes: true,
    removeCache,
    removeState,
    fullCleanup,
  };

  const run = () => {
    let lastResult: { status: number | null; combined: string } = { status: 0, combined: "" };
    for (const provider of providers) {
      lastResult = runAihSh(packRoot, buildUninstallArgs(provider, ctx), {
        cwd: process.cwd(),
        ...backendOpts(options),
      });
      if ((lastResult.status ?? 0) !== 0) {
        break;
      }
    }
    if ((lastResult.status ?? 0) !== 0) {
      return { ok: false, status: failWithBackendError("Uninstall", lastResult, options) };
    }
    return { ok: true, status: 0, spinnerMessage: "Uninstalled" };
  };

  let status;
  if (ui.useInteractiveUi(options)) {
    const result = await ui.runWithSpinner("Uninstalling…", async () => run());
    status = result?.status ?? 0;
    if (status === 0) {
      ui.showSuccess("Uninstalled");
    }
  } else {
    if (!options.verbose) {
      process.stdout.write("Uninstalling…\n");
    }
    status = run().status ?? 0;
    if (status === 0) {
      console.log("\nUninstalled.");
    }
  }
  return status;
}

export { runUninstallWizard };
