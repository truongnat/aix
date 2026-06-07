import { isNonInteractive, type ParseOptions } from "../cli-args";
import { ACTIVE_PROVIDERS, FALLBACK_TARGETS } from "../cli-providers";
import { detectInstalledProviders, isGitRepo } from "../cli-detect";
import * as ui from "../cli-ui";
import { runUpdate } from "../backend/update";
import {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  failWithBackendError,
} from "../cli-command-helpers";

async function runUpdateWizard(packRoot: string, options: ParseOptions): Promise<number> {
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
