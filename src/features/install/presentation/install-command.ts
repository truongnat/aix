// Purpose: Interactive install wizard CLI handler
// Layer: presentation
// Depends on: application, legacy CLI bridges

import fs from "node:fs";
import path from "node:path";

import { modeToScopeVisibility, type ParseOptions, type ProviderBinaryMap } from "./cli-legacy";
import { ACTIVE_PROVIDERS, providerPriorityLabel } from "./cli-legacy";
import { detectProviderBinaries, isGitRepo } from "./cli-legacy";
import {
  NON_GIT_PRIVATE_WARNING,
  NON_GIT_PRIVATE_WARNING_FOLLOWUP,
  buildInstallPlan,
  type PlanProviderId,
} from "./cli-legacy";
import { ui } from "./cli-legacy";
import { readPackageVersion, resolveTargetAbs, failWithBackendError } from "./cli-legacy";
import { runInstall } from "../application/run-install";


interface InstallContextExtended {
  target: string;
  dryRun: boolean;
  yes: boolean;
  providers: string[];
  plannedProviders: string[];
  domains: string[];
  scope: string;
  visibility: string;
  initHarness: boolean;
  plannedInitHarness: boolean;
  installCache: boolean;
  plannedInstallCache: boolean;
}

function toPlanProviders(providers: string[]): PlanProviderId[] {
  return providers as PlanProviderId[];
}

function resolveInstallMode(options: ParseOptions): "project" | "global" {
  return options.scope === "global" ? "global" : "project";
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
        plannedInitHarness: ctx.plannedInitHarness,
        installCache: ctx.installCache && i === 0,
        plannedInstallCache: ctx.plannedInstallCache,
        domains: ctx.initHarness && i === 0 ? ctx.domains : [],
        plannedProviders: ctx.plannedProviders,
        force: options.force ?? false,
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

  let providers = [...options.providers];

  const binaryStatus: ProviderBinaryMap = detectProviderBinaries();
  const availableProviders = ACTIVE_PROVIDERS.filter(
    (provider) => binaryStatus[provider.id]?.installed
  );

  ui.introBanner({
    version: readPackageVersion(packRoot),
    target: targetAbs,
    gitRepo: isGitRepo(targetAbs),
  });

  if (availableProviders.length === 0) {
    throw new Error(
      "No supported provider CLI detected. Install claude, codex, cursor, or gemini first."
    );
  }

  const providerItems = ACTIVE_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    implemented: p.implemented,
    installed: binaryStatus[p.id]?.installed ?? false,
    version: binaryStatus[p.id]?.version || null,
    hint: binaryStatus[p.id]?.installed
      ? binaryStatus[p.id]?.version
        ? `detected ${binaryStatus[p.id]?.version}`
        : "detected"
      : `not installed — run ${p.id} --version`,
    priorityLabel: providerPriorityLabel(p),
  }));

  const selectedProviders = await ui.selectProviders(
    providerItems,
    providers.length > 0 ? providers : undefined
  );
  if (!selectedProviders) {
    return 1;
  }
  providers = selectedProviders;

  let mode = resolveInstallMode(options);
  if (!options.scope) {
    const selectedScope = await ui.selectInstallScope();
    if (!selectedScope) {
      return 1;
    }
    mode = selectedScope === "global" ? "global" : "project";
  }

  const { scope: resolvedScope, visibility } = modeToScopeVisibility(mode);
  const installCache = resolvedScope === "project";
  const harnessExists = fs.existsSync(path.join(targetAbs, ".harness"));
  const initHarness = resolvedScope === "project" && !harnessExists;
  const plan = buildInstallPlan({
    providers: toPlanProviders(providers),
    initHarness,
    installCache,
    mode,
    isGit: isGitRepo(targetAbs),
  });

  ui.showInstallPlan(plan);

  if (plan.mode === "project" && !plan.isGit) {
    ui.showWarning(
      `${NON_GIT_PRIVATE_WARNING}\nHarness will defer the .git/info/exclude update until this directory is initialized with git.\n${NON_GIT_PRIVATE_WARNING_FOLLOWUP}`
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
      plannedProviders: providers,
      target: targetAbs,
      scope: resolvedScope,
      visibility,
      dryRun: options.dryRun,
      yes: true,
      initHarness,
      plannedInitHarness: initHarness,
      installCache,
      plannedInstallCache: installCache,
      domains: [],
    },
    options
  );

  if (status === 0) {
    ui.showSuccess(options.dryRun ? "Dry-run complete" : "Installed");
  }
  return status;
}

export { runInstallBackend, runInstallWizard };
