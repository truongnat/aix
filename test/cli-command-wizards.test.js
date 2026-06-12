const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { ACTIVE_PROVIDER_IDS } = require(path.join(repoRoot, "dist", "cli", "providers.js"));

const originals = [];
const wizardModules = [
  "dist/features/install/presentation/install-command.js",
  "dist/features/update/presentation/update-command.js",
  "dist/features/uninstall/presentation/uninstall-command.js",
  "dist/features/install/presentation/cli-legacy.js",
  "dist/cli/ui/index.js",
  "dist/cli/detect.js",
  "dist/cli/infrastructure/legacy-deps.js",
];

function patchModule(modulePath, patcher) {
  const mod = require(path.join(repoRoot, modulePath));
  const patchTarget =
    modulePath === "dist/cli/ui/index.js" && mod.default
      ? new Proxy(mod, {
          set(target, property, value) {
            target[property] = value;
            if (property in target.default) {
              target.default[property] = value;
            }
            return true;
          },
        })
      : mod;
  const restore = patcher(patchTarget);
  originals.push(restore);
  return mod;
}

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-wizard-test-"));
}

function initGitRepo(dir) {
  require("node:child_process").spawnSync("git", ["init", "-q"], { cwd: dir });
}

function mockProviderBinaries(installedIds) {
  return patchModule("dist/features/install/infrastructure/provider-binary-detect.js", (mod) => {
    const originalDetectProviderBinaries = mod.detectProviderBinaries;
    mod.detectProviderBinaries = () => {
      const installed = new Set(installedIds);
      return Object.fromEntries(
        ACTIVE_PROVIDER_IDS.map((providerId) => [
          providerId,
          {
            providerId,
            commands: providerId === "cursor" ? ["agent", "cursor-agent", "cursor"] : [providerId],
            commandUsed: installed.has(providerId)
              ? providerId === "cursor"
                ? "agent"
                : providerId
              : null,
            installed: installed.has(providerId),
            version: installed.has(providerId) ? "1.0.0" : null,
            output: installed.has(providerId) ? `${providerId} 1.0.0` : "",
          },
        ])
      );
    };
    return () => {
      mod.detectProviderBinaries = originalDetectProviderBinaries;
    };
  });
}

function writeManifest(dir, providers) {
  const harnessDir = path.join(dir, ".ai-harness");
  fs.mkdirSync(harnessDir, { recursive: true });
  fs.writeFileSync(
    path.join(harnessDir, "manifest.json"),
    JSON.stringify(
      {
        installedProviders: providers,
        providerCommandEntrypoints: Object.fromEntries(
          providers.map((provider) => [provider, [`${provider}/entrypoint`]])
        ),
      },
      null,
      2
    ),
    "utf8"
  );
}

function withInteractiveTty(fn) {
  const stdinDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
  const stdoutDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  Object.defineProperty(process.stdin, "isTTY", { value: true, configurable: true });
  Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });
  const restore = () => {
    if (stdinDescriptor) {
      Object.defineProperty(process.stdin, "isTTY", stdinDescriptor);
    }
    if (stdoutDescriptor) {
      Object.defineProperty(process.stdout, "isTTY", stdoutDescriptor);
    }
  };
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
}

afterEach(() => {
  while (originals.length) {
    originals.pop()();
  }
  process.stdin.removeAllListeners("keypress");
  if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  for (const modulePath of wizardModules) {
    const resolved = require.resolve(path.join(repoRoot, modulePath));
    delete require.cache[resolved];
  }
});

test("runInstallWizard non-interactive install calls backend with selected providers", async () => {
  const calls = [];
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalShowInstallPlan = mod.showInstallPlan;
    mod.showInstallPlan = () => {};
    return () => {
      mod.showInstallPlan = originalShowInstallPlan;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await runInstallWizard(repoRoot, {
    providers: ["cursor", "claude"],
    target,
    scope: "project",
    visibility: "private",
    dryRun: true,
    yes: true,
    verbose: true,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "cursor",
      plannedProviders: ["cursor", "claude"],
      scope: "project",
      visibility: "private",
      dryRun: true,
      initHarness: true,
      plannedInitHarness: true,
      installCache: true,
      plannedInstallCache: true,
      domains: [],
      force: false,
    },
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "claude",
      plannedProviders: ["cursor", "claude"],
      scope: "project",
      visibility: "private",
      dryRun: true,
      initHarness: false,
      plannedInitHarness: true,
      installCache: false,
      plannedInstallCache: true,
      domains: [],
      force: false,
    },
  ]);
});

test("runInstallWizard non-interactive without --yes throws instead of silently installing", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["claude"]);

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  await assert.rejects(
    () =>
      runInstallWizard(repoRoot, {
        providers: ["claude"],
        target,
        scope: "project",
        visibility: "private",
        dryRun: false,
        yes: false,
        verbose: false,
      }),
    /Non-interactive install requires --yes/
  );
});

test("runInstallWizard interactive flow installs selected provider from binary-gated picker", async () => {
  const calls = [];
  const warnings = [];
  const successes = [];
  let scopePrompted = false;
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalSelectInstallScope = mod.selectInstallScope;
    const originalShowInstallPlan = mod.showInstallPlan;
    const originalShowWarning = mod.showWarning;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["cursor"];
    mod.selectInstallScope = async () => {
      scopePrompted = true;
      return "project";
    };
    mod.showInstallPlan = () => {};
    mod.showWarning = (message) => warnings.push(message);
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = (message) => successes.push(message);
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.selectInstallScope = originalSelectInstallScope;
      mod.showInstallPlan = originalShowInstallPlan;
      mod.showWarning = originalShowWarning;
      mod.confirmProceed = originalConfirmProceed;
      mod.runWithSpinner = originalRunWithSpinner;
      mod.showSuccess = originalShowSuccess;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await withInteractiveTty(() =>
    runInstallWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].provider, "cursor");
  assert.equal(scopePrompted, true);
  assert.equal(calls[0].installCache, true);
  assert.equal(calls[0].initHarness, true);
  assert.deepEqual(calls[0].domains, []);
  assert.equal(warnings.length, 0);
  assert.deepEqual(successes, ["Installed"]);
});

test("runInstallWizard interactive flow still prompts provider selection when only one provider CLI is available", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor"]);
  let pickerCalls = 0;
  const calls = [];

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalSelectInstallScope = mod.selectInstallScope;
    const originalShowInstallPlan = mod.showInstallPlan;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => {
      pickerCalls += 1;
      return ["cursor"];
    };
    mod.selectInstallScope = async () => "project";
    mod.showInstallPlan = () => {};
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = () => {};
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.selectInstallScope = originalSelectInstallScope;
      mod.showInstallPlan = originalShowInstallPlan;
      mod.confirmProceed = originalConfirmProceed;
      mod.runWithSpinner = originalRunWithSpinner;
      mod.showSuccess = originalShowSuccess;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await withInteractiveTty(() =>
    runInstallWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 0);
  assert.equal(pickerCalls, 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].provider, "cursor");
});

test("runInstallWizard interactive cancel exits before backend calls", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);
  let backendCalled = false;

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalSelectInstallScope = mod.selectInstallScope;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => null;
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.selectInstallScope = originalSelectInstallScope;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await withInteractiveTty(() =>
    runInstallWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 1);
  assert.equal(backendCalled, false);
});

test("runInstallWizard supports non-git targets and prepares git exclude setup for future git init", async () => {
  const target = makeTempDir();
  mockProviderBinaries(["cursor", "claude"]);
  const calls = [];

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return originalRunInstall(ctx);
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalSelectInstallScope = mod.selectInstallScope;
    const originalShowInstallPlan = mod.showInstallPlan;
    const originalShowWarning = mod.showWarning;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["cursor"];
    mod.selectInstallScope = async () => "project";
    mod.showInstallPlan = () => {};
    mod.showWarning = () => {};
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = () => {};
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.selectInstallScope = originalSelectInstallScope;
      mod.showInstallPlan = originalShowInstallPlan;
      mod.showWarning = originalShowWarning;
      mod.confirmProceed = originalConfirmProceed;
      mod.runWithSpinner = originalRunWithSpinner;
      mod.showSuccess = originalShowSuccess;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await withInteractiveTty(() =>
    runInstallWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );
  assert.equal(status, 0);
  assert.equal(calls.length, 1);
  assert.equal(fs.existsSync(path.join(target, ".ai-harness")), true);
  assert.equal(fs.existsSync(path.join(target, ".harness")), true);
  assert.equal(fs.existsSync(path.join(target, ".cursor")), true);
  assert.equal(fs.existsSync(path.join(target, ".git", "info", "exclude")), true);
  assert.equal(
    require("node:child_process").spawnSync("git", ["status", "--short"], { cwd: target }).status,
    128
  );
  assert.equal(
    require("node:child_process").spawnSync("git", ["init", "-q"], { cwd: target }).status,
    0
  );
  assert.match(
    fs.readFileSync(path.join(target, ".git", "info", "exclude"), "utf8"),
    /# ai-engineering-harness start/
  );
});

test("runInstallWizard with explicit provider still shows provider picker before install", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor"]);
  let backendCalled = false;
  let pickerCalls = 0;
  let selectedInitialProviders = null;

  patchModule("dist/features/install/application/run-install.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalShowInstallPlan = mod.showInstallPlan;
    const originalConfirmProceed = mod.confirmProceed;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async (_items, initialProviders) => {
      pickerCalls += 1;
      selectedInitialProviders = initialProviders;
      return ["cursor"];
    };
    mod.showInstallPlan = () => {};
    mod.confirmProceed = async () => false;
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.showInstallPlan = originalShowInstallPlan;
      mod.confirmProceed = originalConfirmProceed;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  const status = await withInteractiveTty(() =>
    runInstallWizard(repoRoot, {
      providers: ["cursor"],
      target,
      scope: "project",
      visibility: "private",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 1);
  assert.equal(pickerCalls, 1);
  assert.deepEqual(selectedInitialProviders, ["cursor"]);
  assert.equal(backendCalled, false);
});

test("runInstallWizard stops when no provider CLI is installed", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries([]);

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectInstallScope = mod.selectInstallScope;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectInstallScope = originalSelectInstallScope;
    };
  });

  const { runInstallWizard } = fresh("dist/features/install/presentation/install-command.js");
  await assert.rejects(
    withInteractiveTty(() =>
      runInstallWizard(repoRoot, {
        providers: [],
        target,
        scope: "",
        visibility: "",
        dryRun: false,
        yes: false,
        verbose: false,
      })
    ),
    /No supported provider CLI detected/
  );
});

test("runUpdateWizard non-interactive update calls backend for each provider", async () => {
  const calls = [];
  const target = makeTempDir();
  writeManifest(target, ["cursor", "claude"]);

  patchModule("dist/features/update/application/run-update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalShowUpdatePlan = mod.showUpdatePlan;
    mod.showUpdatePlan = () => {};
    return () => {
      mod.showUpdatePlan = originalShowUpdatePlan;
    };
  });

  const { runUpdateWizard } = fresh("dist/features/update/presentation/update-command.js");
  const status = await runUpdateWizard(repoRoot, {
    providers: ["cursor", "claude"],
    target,
    scope: "project",
    visibility: "private",
    dryRun: true,
    yes: true,
    verbose: true,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "cursor",
      scope: "project",
      visibility: "private",
      dryRun: true,
    },
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "claude",
      scope: "project",
      visibility: "private",
      dryRun: true,
    },
  ]);
});

test("runUpdateWizard surfaces backend failure status", async () => {
  const target = makeTempDir();
  writeManifest(target, ["cursor"]);

  patchModule("dist/features/update/application/run-update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = () => ({
      ok: false,
      messages: ["FAIL simulated update failure"],
    });
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalShowUpdatePlan = mod.showUpdatePlan;
    mod.showUpdatePlan = () => {};
    return () => {
      mod.showUpdatePlan = originalShowUpdatePlan;
    };
  });

  const { runUpdateWizard } = fresh("dist/features/update/presentation/update-command.js");
  const status = await runUpdateWizard(repoRoot, {
    providers: ["cursor"],
    target,
    scope: "project",
    visibility: "private",
    dryRun: true,
    yes: true,
    verbose: true,
  });

  assert.equal(status, 1);
});

test("runUpdateWizard interactive cancel after plan does not call backend", async () => {
  const target = makeTempDir();
  fs.mkdirSync(path.join(target, ".cursor", "commands"), { recursive: true });
  writeManifest(target, ["cursor"]);
  let backendCalled = false;

  patchModule("dist/features/update/application/run-update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalShowUpdatePlan = mod.showUpdatePlan;
    const originalConfirmProceed = mod.confirmProceed;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["cursor"];
    mod.showUpdatePlan = () => {};
    mod.confirmProceed = async () => false;
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.showUpdatePlan = originalShowUpdatePlan;
      mod.confirmProceed = originalConfirmProceed;
    };
  });

  const { runUpdateWizard } = fresh("dist/features/update/presentation/update-command.js");
  const status = await withInteractiveTty(() =>
    runUpdateWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 1);
  assert.equal(backendCalled, false);
});

test("runUpdateWizard global interactive flow can select active providers without a manifest", async () => {
  const calls = [];
  const target = makeTempDir();
  initGitRepo(target);

  patchModule("dist/features/update/application/run-update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalShowUpdatePlan = mod.showUpdatePlan;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["claude"];
    mod.showUpdatePlan = () => {};
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = () => {};
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.showUpdatePlan = originalShowUpdatePlan;
      mod.confirmProceed = originalConfirmProceed;
      mod.runWithSpinner = originalRunWithSpinner;
      mod.showSuccess = originalShowSuccess;
    };
  });

  const { runUpdateWizard } = fresh("dist/features/update/presentation/update-command.js");
  const status = await withInteractiveTty(() =>
    runUpdateWizard(repoRoot, {
      providers: [],
      target,
      scope: "global",
      visibility: "shared",
      dryRun: false,
      yes: false,
      verbose: false,
    })
  );

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "claude",
      scope: "global",
      visibility: "shared",
      dryRun: false,
    },
  ]);
});

test("runUninstallWizard non-interactive uninstall calls backend with full cleanup", async () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("dist/features/uninstall/application/run-uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalShowUninstallPlan = mod.showUninstallPlan;
    mod.showUninstallPlan = () => {};
    return () => {
      mod.showUninstallPlan = originalShowUninstallPlan;
    };
  });

  const { runUninstallWizard } = fresh("dist/features/uninstall/presentation/uninstall-command.js");
  const status = await runUninstallWizard(repoRoot, {
    providers: ["cursor"],
    target,
    scope: "project",
    dryRun: true,
    yes: true,
    verbose: true,
    all: true,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    {
      targetAbs: path.resolve(target),
      provider: "cursor",
      scope: "project",
      dryRun: true,
      removeCache: false,
      removeState: false,
      all: true,
    },
  ]);
});

test("runUninstallWizard interactive choices flow through to backend", async () => {
  const calls = [];
  const target = makeTempDir();
  fs.mkdirSync(path.join(target, ".cursor", "commands"), { recursive: true });

  patchModule("dist/features/uninstall/application/run-uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalUseInteractiveUi = mod.useInteractiveUi;
    const originalIntroBanner = mod.introBanner;
    const originalSelectProviders = mod.selectProviders;
    const originalConfirmInstallCache = mod.confirmInstallCache;
    const originalConfirmRemoveState = mod.confirmRemoveState;
    const originalConfirmFullCleanup = mod.confirmFullCleanup;
    const originalShowUninstallPlan = mod.showUninstallPlan;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["cursor"];
    mod.confirmInstallCache = async () => true;
    mod.confirmRemoveState = async () => true;
    mod.confirmFullCleanup = async () => false;
    mod.showUninstallPlan = () => {};
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = () => {};
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.confirmInstallCache = originalConfirmInstallCache;
      mod.confirmRemoveState = originalConfirmRemoveState;
      mod.confirmFullCleanup = originalConfirmFullCleanup;
      mod.showUninstallPlan = originalShowUninstallPlan;
      mod.confirmProceed = originalConfirmProceed;
      mod.runWithSpinner = originalRunWithSpinner;
      mod.showSuccess = originalShowSuccess;
    };
  });

  const { runUninstallWizard } = fresh("dist/features/uninstall/presentation/uninstall-command.js");
  const status = await withInteractiveTty(() =>
    runUninstallWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      dryRun: false,
      yes: false,
      verbose: false,
      all: false,
    })
  );

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    {
      targetAbs: path.resolve(target),
      provider: "cursor",
      scope: "project",
      dryRun: false,
      removeCache: true,
      removeState: true,
      all: false,
    },
  ]);
});

test("runUninstallWizard surfaces backend failure status", async () => {
  const target = makeTempDir();

  patchModule("dist/features/uninstall/application/run-uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = () => ({
      ok: false,
      messages: ["FAIL simulated uninstall failure"],
    });
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalShowUninstallPlan = mod.showUninstallPlan;
    mod.showUninstallPlan = () => {};
    return () => {
      mod.showUninstallPlan = originalShowUninstallPlan;
    };
  });

  const { runUninstallWizard } = fresh("dist/features/uninstall/presentation/uninstall-command.js");
  const status = await runUninstallWizard(repoRoot, {
    providers: ["cursor"],
    target,
    scope: "project",
    dryRun: true,
    yes: true,
    verbose: true,
    all: true,
  });

  assert.equal(status, 1);
});

test("runStatusOrDoctor forwards status to the in-process backend", () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("dist/cli/infrastructure/legacy-deps.js", (mod) => {
    const originalRunStatus = mod.runStatus;
    mod.runStatus = ({ targetAbs }) => {
      calls.push(targetAbs);
      return { text: "status text" };
    };
    return () => {
      mod.runStatus = originalRunStatus;
    };
  });

  patchModule("dist/cli/ui/index.js", (mod) => {
    const originalFormatStatus = mod.formatStatus;
    mod.formatStatus = () => {};
    return () => {
      mod.formatStatus = originalFormatStatus;
    };
  });

  const { runStatusOrDoctor } = fresh("dist/cli/commands/diagnostics.js");
  const status = runStatusOrDoctor(repoRoot, "status", {
    providers: [],
    target,
    scope: "project",
    yes: true,
    verbose: false,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [path.resolve(target)]);
});

test("runStatusOrDoctor returns doctor failure status in verbose mode", () => {
  const target = makeTempDir();
  let output = "";

  patchModule("dist/cli/infrastructure/legacy-deps.js", (mod) => {
    const originalRunDoctor = mod.runDoctor;
    mod.runDoctor = ({ targetAbs }) => ({
      text: `doctor report for ${targetAbs}`,
      ok: false,
    });
    return () => {
      mod.runDoctor = originalRunDoctor;
    };
  });

  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const { runStatusOrDoctor } = fresh("dist/cli/commands/diagnostics.js");
    const status = runStatusOrDoctor(repoRoot, "doctor", {
      providers: [],
      target,
      scope: "project",
      yes: true,
      verbose: true,
    });

    assert.equal(status, 1);
    assert.match(output, /doctor report/);
    assert.match(output, new RegExp(path.resolve(target).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runEvalCommand lists registry tasks", async () => {
  const { runEvalCommand } = fresh("dist/features/eval/presentation/eval-command.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runEvalCommand(repoRoot, {
      evalCommand: "list",
      evalTarget: "",
      target: repoRoot,
      providers: [],
      verbose: false,
    });
    assert.equal(status, 0);
    assert.match(output, /sample-bugfix/);
  } finally {
    process.stdout.write = originalWrite;
  }
});
