import { isNonInteractive, type ParseOptions } from "../cli-args";
import { ACTIVE_PROVIDERS, FALLBACK_TARGETS } from "../cli-providers";
import { detectInstalledProviders, isGitRepo } from "../cli-detect";
import * as ui from "../cli-ui";
import { runUninstall } from "../backend/uninstall";
import { readInstalledCommandSurface } from "../runtime-command-catalog";
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  failWithBackendError,
} from "../cli-command-helpers";

async function runUninstallWizard(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  let providers = [...options.providers];
  const installedSurface = readInstalledCommandSurface(targetAbs);
  const manifestInstalledProviders = installedSurface?.installedProviders || [];
  const installed =
    manifestInstalledProviders.length > 0
      ? manifestInstalledProviders
      : detectInstalledProviders(targetAbs, { includeLegacy: true });

  let removeCache = false;
  let removeState = false;
  let fullCleanup = options.all;

  if (isNonInteractive(options)) {
    if (installed.length === 0 && providers.length === 0) {
      throw new Error("No installed providers detected. Pass --provider or install first.");
    }
    if (providers.length === 0 && !options.all) {
      providers = [...installed];
    }
    if (options.all) {
      fullCleanup = true;
      if (providers.length === 0) {
        providers = [...ACTIVE_PROVIDERS, ...FALLBACK_TARGETS].map((provider) => provider.id);
      }
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
          installed: true,
          hint: "installed in manifest or detected on disk",
        }));
      const selectedProviders = await ui.selectProviders(items);
      if (!selectedProviders) {
        return 1;
      }
      providers = selectedProviders;
    }
    if (!options.all) {
      const removeCacheChoice = await ui.confirmInstallCache(false);
      if (removeCacheChoice === null) {
        return 1;
      }
      removeCache = removeCacheChoice;
      const removeStateChoice = await ui.confirmRemoveState(false);
      if (removeStateChoice === null) {
        return 1;
      }
      removeState = removeStateChoice;
      const fullCleanupChoice = await ui.confirmFullCleanup(false);
      if (fullCleanupChoice === null) {
        return 1;
      }
      fullCleanup = fullCleanupChoice;
    }
    ui.showUninstallPlan({ providers, removeCache, removeState, fullCleanup });
    const proceed = await ui.confirmProceed("Proceed with uninstall?");
    if (!proceed) {
      return 1;
    }
  }

  validateProviderSelection(providers);
  if (installed.length > 0) {
    const unknown = providers.filter((providerId) => !installed.includes(providerId));
    if (unknown.length > 0 && !options.all) {
      throw new Error(
        `Uninstall can only target providers recorded in .ai-harness/manifest.json: ${unknown.join(", ")}`
      );
    }
  }
  ui.showUninstallPlan(
    { providers, removeCache, removeState, fullCleanup },
    { compact: isNonInteractive(options) }
  );

  const ctx = {
    targetAbs,
    scope: options.scope || "project",
    dryRun: options.dryRun,
    removeCache,
    removeState,
    all: fullCleanup,
  };

  const run = () => {
    let lastResult: { ok: boolean; messages: string[] } = { ok: true, messages: [] };
    for (const provider of providers) {
      lastResult = runUninstall({
        targetAbs: ctx.targetAbs,
        provider,
        scope: ctx.scope,
        dryRun: ctx.dryRun,
        removeCache: ctx.removeCache,
        removeState: ctx.removeState,
        all: ctx.all,
      });
      if (!lastResult.ok) {
        break;
      }
    }
    if (!lastResult.ok) {
      return {
        ok: false,
        status: failWithBackendError(
          "Uninstall",
          { status: 1, combined: lastResult.messages.join("\n") },
          options
        ),
      };
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
