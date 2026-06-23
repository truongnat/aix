// Purpose: Interactive update wizard CLI handler
// Layer: presentation
// Depends on: application, legacy CLI bridges

import { isNonInteractive, type ParseOptions } from "../../install/presentation/cli-legacy";
import { ACTIVE_PROVIDERS, FALLBACK_TARGETS } from "../../install/presentation/cli-legacy";
import { isGitRepo } from "../../install/presentation/cli-legacy";
import { ui } from "../../install/presentation/cli-legacy";
import { runUpdate } from "../application/run-update";
import { legacyRuntimeCommandCatalog } from "../../install/infrastructure/legacy-deps";
const { readInstalledCommandSurface } = legacyRuntimeCommandCatalog;
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  failWithBackendError,
} from "../../install/presentation/cli-legacy";

async function runUpdateWizard(packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  let providers = [...options.providers];
  const installedSurface = readInstalledCommandSurface(targetAbs);
  const installed = installedSurface?.installedProviders || [];

  if (options.scope === "global") {
    if (providers.length === 0) {
      if (isNonInteractive(options)) {
        throw new Error("Global update requires --provider or --provider list.");
      }
      const items = ACTIVE_PROVIDERS.map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        installed: true,
        hint: "global update target",
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
      throw new Error(
        "No installed providers detected in .ai-harness/manifest.json. Reinstall first."
      );
    }
    if (providers.length === 0) {
      providers = [...installed];
    }
  } else {
    ui.introBanner({
      version: readPackageVersion(packRoot),
      target: targetAbs,
      gitRepo: isGitRepo(targetAbs),
    });
    if (options.scope !== "global" && installed.length === 0) {
      throw new Error(
        "No installed providers detected in .ai-harness/manifest.json. Reinstall first."
      );
    }
    if (providers.length === 0 && options.scope !== "global") {
      const items = [...ACTIVE_PROVIDERS, ...FALLBACK_TARGETS]
        .filter((p) => installed.includes(p.id))
        .map((p) => ({
          id: p.id,
          label: p.label,
          implemented: true,
          installed: true,
          hint: "installed in manifest",
        }));
      const selectedProviders = await ui.selectProviders(items);
      if (!selectedProviders) {
        return 1;
      }
      providers = selectedProviders;
    }
    ui.showUpdatePlan(providers);
    const proceed = await ui.confirmProceed("Proceed with update?");
    if (!proceed) {
      return 1;
    }
  }

  validateProviderSelection(providers);
  if (options.scope !== "global") {
    const invalidProviders = providers.filter((providerId) => !installed.includes(providerId));
    if (invalidProviders.length > 0) {
      throw new Error(
        `Update can only refresh providers recorded in .ai-harness/manifest.json: ${invalidProviders.join(", ")}`
      );
    }
  }
  if (isNonInteractive(options)) {
    ui.showUpdatePlan(providers, { compact: true });
  }

  const ctx = {
    packRoot,
    target: targetAbs,
    scope: options.scope || "project",
    visibility: options.visibility || "private",
    dryRun: options.dryRun,
  };

  const run = () => {
    let lastResult: { ok: boolean; messages: string[] } = { ok: true, messages: [] };
    for (const provider of providers) {
      lastResult = runUpdate({
        packRoot: ctx.packRoot,
        target: ctx.target,
        provider,
        scope: ctx.scope,
        visibility: ctx.visibility,
        dryRun: ctx.dryRun,
      });
      if (!lastResult.ok) {
        break;
      }
    }
    if (!lastResult.ok) {
      return {
        ok: false,
        status: failWithBackendError(
          "Update",
          { status: 1, combined: lastResult.messages.join("\n") },
          options
        ),
      };
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

export { runUpdateWizard };
