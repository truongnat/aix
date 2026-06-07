const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

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
      scope: "project",
      visibility: "private",
      dryRun: true,
      initHarness: true,
      installCache: true,
      force: false,
    },
    {
      packRoot: repoRoot,
      target: path.resolve(target),
      provider: "claude",
      scope: "project",
      visibility: "private",
      dryRun: true,
      initHarness: false,
      installCache: false,
      force: false,
    },
  ]);
});

test("runInstallWizard interactive flow warns for non-git targets and installs selected provider", async () => {
  const calls = [];
  const warnings = [];
  const successes = [];
  const target = makeTempDir();

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
    const originalSelectInstallMode = mod.selectInstallMode;
    const originalConfirmInitHarness = mod.confirmInitHarness;
    const originalConfirmInstallCache = mod.confirmInstallCache;
    const originalShowInstallPlan = mod.showInstallPlan;
    const originalShowWarning = mod.showWarning;
    const originalConfirmProceed = mod.confirmProceed;
    const originalRunWithSpinner = mod.runWithSpinner;
    const originalShowSuccess = mod.showSuccess;
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => ["cursor"];
    mod.selectInstallMode = async () => "project-private";
    mod.confirmInitHarness = async () => true;
    mod.confirmInstallCache = async () => true;
    mod.showInstallPlan = () => {};
    mod.showWarning = (message) => warnings.push(message);
    mod.confirmProceed = async () => true;
    mod.runWithSpinner = async (_label, fn) => fn();
    mod.showSuccess = (message) => successes.push(message);
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
      mod.selectInstallMode = originalSelectInstallMode;
      mod.confirmInitHarness = originalConfirmInitHarness;
      mod.confirmInstallCache = originalConfirmInstallCache;
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
  assert.equal(calls[0].installCache, true);
  assert.equal(calls[0].initHarness, true);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /not a Git repo/);
  assert.deepEqual(successes, ["Installed"]);
});

test("runInstallWizard interactive cancel exits before backend calls", async () => {
  const target = makeTempDir();
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
    mod.useInteractiveUi = () => true;
    mod.introBanner = () => {};
    mod.selectProviders = async () => null;
    return () => {
      mod.useInteractiveUi = originalUseInteractiveUi;
      mod.introBanner = originalIntroBanner;
      mod.selectProviders = originalSelectProviders;
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

test("runUpdateWizard non-interactive update calls backend for each provider", async () => {
  const calls = [];
  const target = makeTempDir();

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

test("runStatusOrDoctor forwards status to aih.sh", () => {
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
  const harnessDir = path.join(target, ".harness");
  const installCalls = [];
  const evalCalls = [];
  let output = "";

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
      yes: false,
    });

    assert.equal(status, 0);
    assert.equal(installCalls.length, 1);
    assert.deepEqual(installCalls[0].providers, ["cursor"]);
    assert.equal(installCalls[0].yes, true);
    assert.equal(installCalls[0].scope, "project");
    assert.equal(installCalls[0].visibility, "private");
    assert.equal(evalCalls.length, 0);
    assert.equal(fs.existsSync(path.join(harnessDir, "GOAL.md")), true);
    assert.match(output, /Initializing harness/);
    assert.match(output, /Init complete/);
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
