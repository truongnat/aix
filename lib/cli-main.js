"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { parseArgv, modeToScopeVisibility, isNonInteractive } = require("./cli-args");
const { PROVIDERS, isRuntimeNative, providerPriorityLabel } = require("./cli-providers");
const { detectRecommendedProviders, detectInstalledProviders, isGitRepo } = require("./cli-detect");
const { buildInstallPlan } = require("./cli-plan");
const {
  packRootFromModule,
  runAihSh,
  buildInstallArgs,
  buildUpdateArgs,
  buildUninstallArgs,
  SH_MISSING_MSG
} = require("./cli-backend");
const ui = require("./cli-ui");

const SOURCE_URL = "https://github.com/truongnat/ai-engineering-harness";

function readPackageVersion(packRoot) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(packRoot, "package.json"), "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

function printHelp() {
  console.log(`ai-engineering-harness (experimental)

Primary:
  npx ai-engineering-harness install
  npx ai-engineering-harness status
  npx ai-engineering-harness doctor
  npx ai-engineering-harness update
  npx ai-engineering-harness uninstall

Non-interactive:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
  npx ai-engineering-harness uninstall --provider cursor --yes
  npx ai-engineering-harness uninstall --all --yes

Options:
  --provider <id>     Provider(s), comma-separated (alias: --runtime)
  --scope project|global
  --visibility private|shared
  --target <path>     Target directory (default: .)
  --ref <git-ref>     Git ref for tarball/bootstrap (default: main)
  --dry-run           Preview without writing
  --yes               Skip confirmation prompts
  --verbose           Show raw shell backend output
  --all               Uninstall: full cleanup (runtime + cache + state + exclude)

Shell fallback:
  sh aih.sh install --runtime cursor --scope project --visibility private --yes

Windows: Git Bash or WSL required for shell backend in v0.10.x.`);
}

function resolveTargetAbs(target) {
  return path.resolve(process.cwd(), target);
}

function validateProviderSelection(providers) {
  const unknown = providers.filter((id) => !PROVIDERS.some((p) => p.id === id));
  if (unknown.length) {
    throw new Error(`Unknown provider(s): ${unknown.join(", ")}`);
  }
  const disabled = providers.filter((id) => {
    const p = PROVIDERS.find((x) => x.id === id);
    return p && !p.implemented;
  });
  if (disabled.length) {
    throw new Error(`Provider(s) not implemented: ${disabled.join(", ")}`);
  }
}

function validateManualMix(providers) {
  const hasManual = providers.includes("manual");
  const hasNative = providers.some((id) => isRuntimeNative(id));
  if (hasManual && hasNative) {
    throw new Error(
      "Manual fallback cannot be combined with runtime-native providers in one install. Select manual alone or only runtime-native providers."
    );
  }
}

function backendOpts(options) {
  return {
    verbose: options.verbose,
    capture: !options.verbose
  };
}

function failWithBackendError(kind, result, options) {
  const reason =
    (result.combined || "")
      .split("\n")
      .find((l) => /error:|FAIL /i.test(l)) ||
    `${kind} exited with code ${result.status || 1}`;
  if (options.verbose && result.combined) {
    process.stdout.write(result.combined);
  }
  if (ui.useInteractiveUi(options)) {
    ui.showError(`${kind} failed`, reason.trim());
  } else {
    console.error(`\n${kind} failed.\n\nReason:\n  ${reason.trim()}\n`);
    console.error("Try:");
    console.error("  npx ai-engineering-harness doctor");
    console.error("  npx ai-engineering-harness install --provider cursor --yes --verbose");
  }
  return result.status || 1;
}

async function runInstallWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const interactive = ui.useInteractiveUi(options);
  let providers = [...options.providers];

  if (isNonInteractive(options)) {
    if (providers.length === 0) {
      throw new Error(
        "No provider selected. Pass --provider cursor or run interactively."
      );
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
    const installCache = scopeVis.scope === "project" && providers.some((id) => isRuntimeNative(id));
    const plan = buildInstallPlan({
      providers,
      initHarness,
      installCache,
      mode: scopeVis.visibility === "shared" ? "project-shared" : "project-private",
      isGit: isGitRepo(targetAbs)
    });
    ui.showInstallPlan(plan, { compact: true });
    if (plan.mode === "project-private" && !plan.isGit) {
      console.log("\nwarning: target is not a Git repo; private .git/info/exclude cannot be updated.");
    }

    const status = await runInstallBackend(packRoot, {
      providers,
      target: targetAbs,
      ref: options.ref,
      scope: scopeVis.scope,
      visibility: scopeVis.visibility,
      dryRun: options.dryRun,
      yes: true,
      initHarness,
      installCache
    }, options);
    if (status === 0) {
      console.log(options.dryRun ? "\nDry-run complete." : "\nInstalled.");
    }
    return status;
  }

  ui.introBanner({
    version: readPackageVersion(packRoot),
    target: targetAbs,
    gitRepo: isGitRepo(targetAbs)
  });

  const recommended = detectRecommendedProviders(targetAbs);
  const providerItems = PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    implemented: p.implemented,
    recommended: recommended.includes(p.id),
    priorityLabel: providerPriorityLabel(p)
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
    isGit: isGitRepo(targetAbs)
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
      installCache
    },
    options
  );

  if (status === 0 && interactive) {
    ui.showSuccess(options.dryRun ? "Dry-run complete" : "Installed");
  }
  return status;
}

async function runInstallBackend(packRoot, ctx, options) {
  const run = () => {
    let lastResult = { status: 0, combined: "" };
    for (let i = 0; i < ctx.providers.length; i++) {
      const provider = ctx.providers[i];
      const args = buildInstallArgs(provider, ctx, i);
      lastResult = runAihSh(packRoot, args, { cwd: process.cwd(), ...backendOpts(options) });
      if (lastResult.status !== 0) {
        break;
      }
    }
    if (lastResult.status !== 0) {
      return { ok: false, status: failWithBackendError("Install", lastResult, options), combined: lastResult.combined };
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
      gitRepo: isGitRepo(targetAbs)
    });
    if (installed.length === 0) {
      throw new Error("No installed providers detected. Install first.");
    }
    if (providers.length === 0) {
      const items = PROVIDERS.filter((p) => installed.includes(p.id)).map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        recommended: true
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
    yes: true
  };

  const run = () => {
    let lastResult = { status: 0, combined: "" };
    for (const provider of providers) {
      lastResult = runAihSh(packRoot, buildUpdateArgs(provider, ctx), {
        cwd: process.cwd(),
        ...backendOpts(options)
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

async function runUninstallWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  let providers = [...options.providers];
  const installed = detectInstalledProviders(targetAbs);

  let removeCache = false;
  let removeState = false;
  let fullCleanup = options.all;

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
      gitRepo: isGitRepo(targetAbs)
    });
    if (installed.length === 0) {
      throw new Error("No installed providers detected.");
    }
    if (providers.length === 0) {
      const items = PROVIDERS.filter((p) => installed.includes(p.id)).map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        recommended: true
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

  const ctx = {
    target: targetAbs,
    scope: options.scope || "project",
    dryRun: options.dryRun,
    yes: true,
    removeCache,
    removeState,
    fullCleanup
  };

  const run = () => {
    let lastResult = { status: 0, combined: "" };
    for (const provider of providers) {
      lastResult = runAihSh(packRoot, buildUninstallArgs(provider, ctx), {
        cwd: process.cwd(),
        ...backendOpts(options)
      });
      if (lastResult.status !== 0) {
        break;
      }
    }
    if (lastResult.status !== 0) {
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

function runStatusOrDoctor(packRoot, command, options) {
  const targetAbs = resolveTargetAbs(options.target);
  const args = [command, "--target", targetAbs];
  if (options.scope) {
    args.push("--scope", options.scope);
  }
  const result = runAihSh(packRoot, args, {
    cwd: process.cwd(),
    verbose: options.verbose,
    capture: !options.verbose
  });

  if (options.verbose) {
    return result.status || 0;
  }

  if (command === "status") {
    ui.formatStatus(result.combined || result.stdout || "", { compact: isNonInteractive(options) });
  } else {
    ui.formatDoctor(result.combined || result.stdout || "", { compact: isNonInteractive(options) });
  }
  return result.status || 0;
}

async function main(argv, moduleFilename) {
  const packRoot = packRootFromModule(moduleFilename);

  let options;
  try {
    options = parseArgv(argv);
  } catch (error) {
    console.error(`ai-engineering-harness: ${error.message}`);
    return 1;
  }

  if (options.help || options.command === "help") {
    printHelp();
    return 0;
  }

  try {
    switch (options.command) {
      case "install":
        return await runInstallWizard(packRoot, options);
      case "update":
        return await runUpdateWizard(packRoot, options);
      case "uninstall":
        return await runUninstallWizard(packRoot, options);
      case "status":
      case "doctor":
        return runStatusOrDoctor(packRoot, options.command, options);
      default:
        printHelp();
        return 0;
    }
  } catch (error) {
    if (error.code === "SH_MISSING" || error.code === "AIH_SH_MISSING") {
      ui.showError("Setup error", error.message);
      return 1;
    }
    if (ui.useInteractiveUi(options)) {
      ui.showError("Error", error.message);
    } else {
      console.error(`ai-engineering-harness: ${error.message}`);
    }
    return 1;
  }
}

module.exports = {
  main,
  printHelp,
  SOURCE_URL
};
