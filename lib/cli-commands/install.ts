import fs from "node:fs";
import path from "node:path";

import { modeToScopeVisibility, isNonInteractive, type ParseOptions } from "../cli-args";
import { ACTIVE_PROVIDERS, providerPriorityLabel, isRuntimeNative } from "../cli-providers";
import { detectProviderBinaries, detectLegacyProviderResidue, isGitRepo } from "../cli-detect";
import { normalizeDomainSelection } from "../stack-detect";
import {
  NON_GIT_PRIVATE_WARNING,
  NON_GIT_PRIVATE_WARNING_FOLLOWUP,
  buildInstallPlan,
  type PlanProviderId,
} from "../cli-plan";
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
  plannedProviders: string[];
  domains: string[];
  scope: string;
  visibility: string;
  initHarness: boolean;
  plannedInitHarness: boolean;
  installCache: boolean;
  plannedInstallCache: boolean;
}

const NON_GIT_TARGET_ERROR =
  "Target directory is not a Git repo. Run git init first so generated files stay out of tracked content.";

function toPlanProviders(providers: string[]): PlanProviderId[] {
  return providers as PlanProviderId[];
}

function resolveInstallMode(
  options: ParseOptions
): "project-private" | "project-shared" | "global" {
  if (options.scope === "global") {
    return "global";
  }
  if (options.scope === "project" && options.visibility === "shared") {
    return "project-shared";
  }
  if (!options.scope && options.visibility === "shared") {
    return "project-shared";
  }
  return "project-private";
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
  const explicitDomains = normalizeDomainSelection(options.domains || []);
  const invalidDomainIds = (options.domains || []).filter(
    (domainId) => !normalizeDomainSelection([domainId]).length
  );
  if (invalidDomainIds.length > 0) {
    throw new Error(`Unknown domain skill(s): ${invalidDomainIds.join(", ")}`);
  }
  let domains = [...explicitDomains];
  const binaryStatus = detectProviderBinaries();
  const availableProviders = ACTIVE_PROVIDERS.filter(
    (provider) => binaryStatus[provider.id]?.installed
  );

  if (isNonInteractive(options)) {
    if (providers.length === 0) {
      throw new Error("No provider selected. Pass --provider cursor or run interactively.");
    }
    validateProviderSelection(providers);
    validateManualMix(providers);
    const missingProviders = providers.filter((id) => !binaryStatus[id]?.installed);
    if (missingProviders.length > 0) {
      const installHints = missingProviders
        .map((providerId) => {
          const probe = binaryStatus[providerId];
          const hint = probe?.commands?.length ? probe.commands.join(" or ") : providerId;
          return `${providerId} (${hint} --version not found)`;
        })
        .join(", ");
      throw new Error(`Provider binary not installed: ${installHints}`);
    }

    const mode = resolveInstallMode(options);
    const scopeVis = modeToScopeVisibility(mode);

    const initHarness =
      scopeVis.scope === "project" && !fs.existsSync(path.join(targetAbs, ".harness"));
    const installCache =
      scopeVis.scope === "project" && providers.some((id) => isRuntimeNative(id));
    const plan = buildInstallPlan({
      providers: toPlanProviders(providers),
      initHarness,
      installCache,
      mode:
        scopeVis.scope === "global"
          ? "global"
          : scopeVis.visibility === "shared"
            ? "project-shared"
            : "project-private",
      isGit: isGitRepo(targetAbs),
    });
    ui.showInstallPlan(plan, { compact: true });
    if (plan.mode === "project-private" && !plan.isGit) {
      console.log(`\n${NON_GIT_PRIVATE_WARNING}`);
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
        plannedInitHarness: initHarness,
        installCache,
        plannedInstallCache: installCache,
        domains,
        plannedProviders: providers,
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

  if (availableProviders.length === 0) {
    throw new Error(
      "No supported provider CLI detected. Install claude, codex, cursor, or gemini first."
    );
  }

  if (availableProviders.length === 1) {
    providers = [availableProviders[0].id];
    process.stdout.write(`Detected provider: ${providers[0]}\n`);
  } else {
    const selectedProviders = await ui.selectProviders(providerItems);
    if (!selectedProviders) {
      return 1;
    }
    providers = selectedProviders;
  }
  validateProviderSelection(providers);
  validateManualMix(providers);

  let mode = resolveInstallMode(options);
  if (!options.scope && interactive) {
    const selectedScope = await ui.selectInstallScope();
    if (!selectedScope) {
      return 1;
    }
    mode =
      selectedScope === "global"
        ? "global"
        : options.visibility === "shared"
          ? "project-shared"
          : "project-private";
  }

  const { scope } = modeToScopeVisibility(mode);
  const defaultCache = scope === "project" && providers.some((id) => isRuntimeNative(id));
  const installCache = defaultCache;
  const harnessExists = fs.existsSync(path.join(targetAbs, ".harness"));
  const initHarness = scope === "project" && !harnessExists;

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
    ui.showWarning(`${NON_GIT_PRIVATE_WARNING}\n${NON_GIT_PRIVATE_WARNING_FOLLOWUP}`);
    return failWithBackendError(
      "Install",
      { status: 1, combined: `error: ${NON_GIT_TARGET_ERROR}` },
      options
    );
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
      domains,
    },
    options
  );

  if (status === 0 && interactive) {
    ui.showSuccess(options.dryRun ? "Dry-run complete" : "Installed");
  }
  return status;
}

export { runInstallBackend, runInstallWizard };
