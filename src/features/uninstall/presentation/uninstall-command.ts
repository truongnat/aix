// Purpose: Interactive uninstall wizard CLI handler
// Layer: presentation
// Depends on: application, legacy CLI bridges

import { isNonInteractive, type ParseOptions } from "../../install/presentation/cli-legacy";
import { ACTIVE_PROVIDERS, FALLBACK_TARGETS } from "../../install/presentation/cli-legacy";
import { detectInstalledProviders, isGitRepo } from "../../install/presentation/cli-legacy";
import os from "node:os";
import { ui } from "../../install/presentation/cli-legacy";
import { runUninstall } from "../application/run-uninstall";
import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";
const { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  failWithBackendError,
} from "../../install/presentation/cli-legacy";

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

  if (options.scope === "global") {
    if (providers.length === 0) {
      if (isNonInteractive(options)) {
        throw new Error("Global uninstall requires --provider or --provider list.");
      }
      const items = ACTIVE_PROVIDERS.map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        installed: true,
        hint: "global uninstall target",
      }));
      const selectedProviders = await ui.selectProviders(items);
      if (!selectedProviders) {
        return 1;
      }
      providers = selectedProviders;
    }
  }

  if (isNonInteractive(options)) {
    if (options.scope !== "global" && installed.length === 0 && providers.length === 0) {
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
    if (options.scope !== "global" && installed.length === 0) {
      throw new Error("No installed providers detected.");
    }
    if (providers.length === 0 && options.scope !== "global") {
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
      removeCache = removeCacheChoice ?? false;
      const removeStateChoice = await ui.confirmRemoveState(false);
      if (removeStateChoice === null) {
        return 1;
      }
      removeState = removeStateChoice ?? false;
      const fullCleanupChoice = await ui.confirmFullCleanup(false);
      if (fullCleanupChoice === null) {
        return 1;
      }
      fullCleanup = fullCleanupChoice ?? false;
    }
    ui.showUninstallPlan({ providers, removeCache, removeState, fullCleanup });
    const proceed = await ui.confirmProceed("Proceed with uninstall?");
    if (!proceed) {
      return 1;
    }
  }

  validateProviderSelection(providers);
  if (options.scope !== "global" && installed.length > 0) {
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
    targetAbs: options.scope === "global" ? os.homedir() : targetAbs,
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
