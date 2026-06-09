const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { ACTIVE_PROVIDER_IDS } = require(path.join(repoRoot, "dist", "lib", "cli-providers.js"));

const originals = [];

function patchModule(modulePath, patcher) {
  const mod = require(path.join(repoRoot, modulePath));
  const restore = patcher(mod);
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
  return patchModule("dist/lib/provider-binary-detect.js", (mod) => {
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
});

test("runInstallWizard non-interactive install calls backend with selected providers", async () => {
  const calls = [];
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalShowInstallPlan = mod.showInstallPlan;
    mod.showInstallPlan = () => {};
    return () => {
      mod.showInstallPlan = originalShowInstallPlan;
    };
  });

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

test("runInstallWizard interactive flow installs selected provider from binary-gated picker", async () => {
  const calls = [];
  const warnings = [];
  const successes = [];
  let scopePrompted = false;
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

test("runInitWizard with no domain flags scaffolds empty domain config and no generated skills", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  fs.mkdirSync(target, { recursive: true });
  mockProviderBinaries(["cursor"]);

  const { runInitWizard } = fresh("dist/lib/cli-commands/init.js");
  const status = await runInitWizard(repoRoot, {
    providers: [],
    target,
    scope: "",
    visibility: "",
    dryRun: false,
    yes: false,
    verbose: false,
    skipDemoEval: true,
  });

  assert.equal(status, 0);
  const config = JSON.parse(fs.readFileSync(path.join(target, ".harness", "config.json"), "utf8"));
  assert.deepEqual(config.domains, []);
  assert.ok(fs.existsSync(path.join(target, ".harness", "skills")));
  assert.deepEqual(fs.readdirSync(path.join(target, ".harness", "skills")), [".gitkeep"]);
  assert.equal(fs.existsSync(path.join(target, ".harness", "skills", "frontend")), false);
  assert.equal(fs.existsSync(path.join(target, ".harness", "skills", "backend")), false);
});

test("runInstallWizard interactive cancel exits before backend calls", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor", "claude"]);
  let backendCalled = false;

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = (ctx) => {
      calls.push(ctx);
      return originalRunInstall(ctx);
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

  patchModule("dist/lib/backend/install-orchestrator.js", (mod) => {
    const originalRunInstall = mod.runInstall;
    mod.runInstall = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runInstall = originalRunInstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runInstallWizard } = fresh("dist/lib/cli-commands/install.js");
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

  patchModule("dist/lib/backend/update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalShowUpdatePlan = mod.showUpdatePlan;
    mod.showUpdatePlan = () => {};
    return () => {
      mod.showUpdatePlan = originalShowUpdatePlan;
    };
  });

  const { runUpdateWizard } = fresh("dist/lib/cli-commands/update.js");
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

  patchModule("dist/lib/backend/update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = () => ({
      ok: false,
      messages: ["FAIL simulated update failure"],
    });
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalShowUpdatePlan = mod.showUpdatePlan;
    mod.showUpdatePlan = () => {};
    return () => {
      mod.showUpdatePlan = originalShowUpdatePlan;
    };
  });

  const { runUpdateWizard } = fresh("dist/lib/cli-commands/update.js");
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

  patchModule("dist/lib/backend/update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = () => {
      backendCalled = true;
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runUpdateWizard } = fresh("dist/lib/cli-commands/update.js");
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

  patchModule("dist/lib/backend/update.js", (mod) => {
    const originalRunUpdate = mod.runUpdate;
    mod.runUpdate = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUpdate = originalRunUpdate;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runUpdateWizard } = fresh("dist/lib/cli-commands/update.js");
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

  patchModule("dist/lib/backend/uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalShowUninstallPlan = mod.showUninstallPlan;
    mod.showUninstallPlan = () => {};
    return () => {
      mod.showUninstallPlan = originalShowUninstallPlan;
    };
  });

  const { runUninstallWizard } = fresh("dist/lib/cli-commands/uninstall.js");
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

  patchModule("dist/lib/backend/uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = (ctx) => {
      calls.push(ctx);
      return { ok: true, messages: [] };
    };
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
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

  const { runUninstallWizard } = fresh("dist/lib/cli-commands/uninstall.js");
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

  patchModule("dist/lib/backend/uninstall.js", (mod) => {
    const originalRunUninstall = mod.runUninstall;
    mod.runUninstall = () => ({
      ok: false,
      messages: ["FAIL simulated uninstall failure"],
    });
    return () => {
      mod.runUninstall = originalRunUninstall;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalShowUninstallPlan = mod.showUninstallPlan;
    mod.showUninstallPlan = () => {};
    return () => {
      mod.showUninstallPlan = originalShowUninstallPlan;
    };
  });

  const { runUninstallWizard } = fresh("dist/lib/cli-commands/uninstall.js");
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

  patchModule("dist/lib/backend/status-doctor.js", (mod) => {
    const originalRunStatus = mod.runStatus;
    mod.runStatus = ({ targetAbs }) => {
      calls.push(targetAbs);
      return { text: "status text" };
    };
    return () => {
      mod.runStatus = originalRunStatus;
    };
  });

  patchModule("dist/lib/cli-ui.js", (mod) => {
    const originalFormatStatus = mod.formatStatus;
    mod.formatStatus = () => {};
    return () => {
      mod.formatStatus = originalFormatStatus;
    };
  });

  const { runStatusOrDoctor } = fresh("dist/lib/cli-commands/diagnostics.js");
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

  patchModule("dist/lib/backend/status-doctor.js", (mod) => {
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
    const { runStatusOrDoctor } = fresh("dist/lib/cli-commands/diagnostics.js");
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

test("runInitWizard defaults to cursor and skips demo eval when requested", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor"]);
  const harnessDir = path.join(target, ".harness");
  const analysisFile = path.join(target, "domain-analysis.json");
  const installCalls = [];
  const evalCalls = [];
  let output = "";

  fs.writeFileSync(
    analysisFile,
    JSON.stringify(
      {
        domains: [
          { id: "debugging", confidence: 0.9, evidence: ["failing test"] },
          { id: "backend", confidence: 0.8, evidence: ["api surface"] },
        ],
        languages: ["typescript"],
        frameworks: ["vitest"],
        notes: "fixture",
      },
      null,
      2
    )
  );

  patchModule("dist/lib/cli-commands/install.js", (mod) => {
    const originalRunInstallWizard = mod.runInstallWizard;
    mod.runInstallWizard = async (_packRoot, options) => {
      installCalls.push(options);
      fs.mkdirSync(harnessDir, { recursive: true });
      return 0;
    };
    return () => {
      mod.runInstallWizard = originalRunInstallWizard;
    };
  });

  patchModule("dist/lib/evals/index.js", (mod) => {
    const originalRunTask = mod.runTask;
    mod.runTask = async (...args) => {
      evalCalls.push(args);
      return {
        summaryPath: path.join(target, "summary.json"),
        comparison: null,
        exitCode: 0,
      };
    };
    return () => {
      mod.runTask = originalRunTask;
    };
  });

  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const { runInitWizard } = fresh("dist/lib/cli-commands/init.js");
    const status = await runInitWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      skipDemoEval: true,
      analysisFile,
      yes: false,
    });

    assert.equal(status, 0);
    assert.equal(installCalls.length, 1);
    assert.deepEqual(installCalls[0].providers, ["cursor"]);
    assert.equal(installCalls[0].yes, true);
    assert.equal(installCalls[0].scope, "project");
    assert.equal(installCalls[0].visibility, "private");
    assert.deepEqual(installCalls[0].domains, ["debugging", "backend"]);
    assert.equal(evalCalls.length, 0);
    assert.equal(fs.existsSync(path.join(harnessDir, "GOAL.md")), true);
    assert.match(output, /Initializing harness/);
    assert.match(output, /Init complete/);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runInitWizard with no domain flags scaffolds empty domains", async () => {
  const target = makeTempDir();
  initGitRepo(target);
  mockProviderBinaries(["cursor"]);
  const harnessDir = path.join(target, ".harness");
  const evalCalls = [];

  patchModule("dist/lib/evals/index.js", (mod) => {
    const originalRunTask = mod.runTask;
    mod.runTask = async (...args) => {
      evalCalls.push(args);
      return {
        summaryPath: path.join(target, "summary.json"),
        comparison: null,
        exitCode: 0,
      };
    };
    return () => {
      mod.runTask = originalRunTask;
    };
  });

  const originalWrite = process.stdout.write;
  process.stdout.write = () => true;

  try {
    const { runInitWizard } = fresh("dist/lib/cli-commands/init.js");
    const status = await runInitWizard(repoRoot, {
      providers: [],
      target,
      scope: "",
      visibility: "",
      skipDemoEval: true,
      yes: false,
    });

    assert.equal(status, 0);
    assert.equal(evalCalls.length, 0);
    const config = JSON.parse(fs.readFileSync(path.join(harnessDir, "config.json"), "utf8"));
    assert.deepEqual(config.domains, []);
    assert.equal(fs.existsSync(path.join(harnessDir, "skills", "frontend")), false);
    assert.equal(fs.existsSync(path.join(harnessDir, "skills", "backend")), false);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runEvalCommand lists registry tasks", async () => {
  const { runEvalCommand } = fresh("dist/lib/cli-commands/eval.js");
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
