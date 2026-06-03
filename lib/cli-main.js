"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { parseArgv, modeToScopeVisibility, isNonInteractive } = require("./cli-args");
const { PROVIDERS, isRuntimeNative } = require("./cli-providers");
const { detectRecommendedProviders, detectInstalledProviders, isGitRepo } = require("./cli-detect");
const { selectMany, selectOne, confirm } = require("./cli-prompts");
const { buildInstallPlan, printPlan } = require("./cli-plan");
const {
  packRootFromModule,
  runAihSh,
  buildInstallArgs,
  buildUpdateArgs,
  buildUninstallArgs,
  SH_MISSING_MSG
} = require("./cli-backend");

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

Non-interactive install:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run

Options:
  --provider <id>     Provider(s), comma-separated (alias: --runtime)
  --scope project|global
  --visibility private|shared
  --target <path>     Target directory (default: .)
  --ref <git-ref>     GitHub ref for remote aih.sh bootstrap (default: main)
  --dry-run           Preview without writing
  --yes               Skip confirmation prompts

Shell fallback:
  sh aih.sh install --runtime cursor --scope project --visibility private --yes

Note: v0.10.0 uses aih.sh as backend; Git Bash or WSL required on Windows.`);
}

function resolveTargetAbs(target) {
  return path.resolve(process.cwd(), target);
}

function printHeader(packRoot, targetAbs) {
  const version = readPackageVersion(packRoot);
  const git = isGitRepo(targetAbs) ? "yes" : "no";
  console.log("ai-engineering-harness");
  console.log("");
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Version: ${version}`);
  console.log(`Target: ${targetAbs}`);
  console.log(`Git repo: ${git}`);
  console.log("");
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

async function runInstallWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  printHeader(packRoot, targetAbs);

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
    printPlan(plan);

    if (!options.yes) {
      const ok = await confirm("Proceed with install?", true);
      if (!ok) {
        console.log("Aborted.");
        return 1;
      }
    }

    return runInstallBackend(packRoot, {
      providers,
      target: targetAbs,
      ref: options.ref,
      scope: scopeVis.scope,
      visibility: scopeVis.visibility,
      dryRun: options.dryRun,
      yes: true,
      initHarness,
      installCache
    });
  }

  const recommended = detectRecommendedProviders(targetAbs);
  const providerItems = PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    implemented: p.implemented,
    recommended: recommended.includes(p.id)
  }));

  console.log("Select provider(s) to install (space to toggle, enter to confirm)");
  providers = await selectMany(providerItems, {
    title: "",
    hint: "(space to toggle, enter to confirm)",
    minSelected: 1
  });
  validateProviderSelection(providers);
  validateManualMix(providers);

  console.log("");
  const mode = await selectOne(
    [
      {
        id: "project-private",
        label: "Project private",
        description: "local to this checkout, ignored via .git/info/exclude"
      },
      {
        id: "project-shared",
        label: "Project shared",
        description: "visible in git status"
      },
      {
        id: "global",
        label: "Global",
        description: "runtime-level install where supported"
      }
    ],
    { title: "Install mode:", defaultId: "project-private" }
  );

  const harnessExists = fs.existsSync(path.join(targetAbs, ".harness"));
  const initHarness = await confirm("Initialize .harness project state?", !harnessExists);

  const { scope } = modeToScopeVisibility(mode);
  const defaultCache = scope === "project" && providers.some((id) => isRuntimeNative(id));
  const installCache = await confirm("Install .ai-harness capability cache?", defaultCache);

  const { scope: resolvedScope, visibility } = modeToScopeVisibility(mode);
  const plan = buildInstallPlan({
    providers,
    initHarness,
    installCache,
    mode,
    isGit: isGitRepo(targetAbs)
  });
  printPlan(plan);

  const proceed = await confirm("Proceed with install?", true);
  if (!proceed) {
    console.log("Aborted.");
    return 1;
  }

  return runInstallBackend(packRoot, {
    providers,
    target: targetAbs,
    ref: options.ref,
    scope: resolvedScope,
    visibility,
    dryRun: options.dryRun,
    yes: true,
    initHarness,
    installCache
  });
}

function runInstallBackend(packRoot, ctx) {
  let lastStatus = 0;
  for (let i = 0; i < ctx.providers.length; i++) {
    const provider = ctx.providers[i];
    const args = buildInstallArgs(provider, ctx, i);
    const result = runAihSh(packRoot, args, { cwd: process.cwd() });
    if (result.status !== 0) {
      lastStatus = result.status || 1;
      break;
    }
  }
  return lastStatus;
}

async function runUpdateWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  printHeader(packRoot, targetAbs);

  let providers = [...options.providers];
  const installed = detectInstalledProviders(targetAbs);

  if (!isNonInteractive(options) || providers.length === 0) {
    if (installed.length === 0 && providers.length === 0) {
      throw new Error("No installed providers detected. Pass --provider or install first.");
    }
    if (providers.length === 0) {
      const items = PROVIDERS.filter((p) => installed.includes(p.id)).map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        recommended: true
      }));
      console.log("Select provider(s) to update");
      providers = await selectMany(items, {
        title: "",
        minSelected: 1
      });
    }
  }

  validateProviderSelection(providers);

  if (!options.yes && process.stdin.isTTY) {
    const proceed = await confirm("Proceed with update?", true);
    if (!proceed) {
      console.log("Aborted.");
      return 1;
    }
  }

  const ctx = {
    target: targetAbs,
    ref: options.ref,
    scope: options.scope || "project",
    visibility: options.visibility || "private",
    dryRun: options.dryRun,
    yes: true
  };

  let lastStatus = 0;
  for (const provider of providers) {
    const result = runAihSh(packRoot, buildUpdateArgs(provider, ctx), { cwd: process.cwd() });
    if (result.status !== 0) {
      lastStatus = result.status || 1;
      break;
    }
  }
  return lastStatus;
}

async function runUninstallWizard(packRoot, options) {
  const targetAbs = resolveTargetAbs(options.target);
  printHeader(packRoot, targetAbs);

  let providers = [...options.providers];
  const installed = detectInstalledProviders(targetAbs);

  if (!isNonInteractive(options) || providers.length === 0) {
    if (installed.length === 0 && providers.length === 0) {
      throw new Error("No installed providers detected. Pass --provider or install first.");
    }
    if (providers.length === 0) {
      const items = PROVIDERS.filter((p) => installed.includes(p.id)).map((p) => ({
        id: p.id,
        label: p.label,
        implemented: true,
        recommended: true
      }));
      console.log("Select provider(s) to uninstall");
      providers = await selectMany(items, { title: "", minSelected: 1 });
    }
  }

  validateProviderSelection(providers);

  let removeCache = false;
  let removeState = false;
  let fullCleanup = false;

  if (!isNonInteractive(options)) {
    removeCache = await confirm("Remove .ai-harness/?", false);
    removeState = await confirm("Remove .harness/?", false);
    fullCleanup = await confirm("Full cleanup (runtime + cache + state + exclude block)?", false);
    const proceed = await confirm("Proceed with uninstall?", true);
    if (!proceed) {
      console.log("Aborted.");
      return 1;
    }
  }

  const ctx = {
    target: targetAbs,
    scope: options.scope || "project",
    dryRun: options.dryRun,
    yes: true,
    removeCache,
    removeState,
    fullCleanup
  };

  let lastStatus = 0;
  for (const provider of providers) {
    const result = runAihSh(packRoot, buildUninstallArgs(provider, ctx), { cwd: process.cwd() });
    if (result.status !== 0) {
      lastStatus = result.status || 1;
      break;
    }
  }
  return lastStatus;
}

function runStatusOrDoctor(packRoot, command, options) {
  const targetAbs = resolveTargetAbs(options.target);
  const args = [command, "--target", targetAbs];
  if (options.scope) {
    args.push("--scope", options.scope);
  }
  const result = runAihSh(packRoot, args, { cwd: process.cwd() });
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
    if (error.code === "SH_MISSING") {
      console.error(`ai-engineering-harness: ${SH_MISSING_MSG}`);
      return 1;
    }
    console.error(`ai-engineering-harness: ${error.message}`);
    return 1;
  }
}

module.exports = {
  main,
  printHelp,
  SOURCE_URL
};
