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

afterEach(() => {
  while (originals.length) {
    originals.pop()();
  }
});

test("runInstallWizard non-interactive install calls backend with selected providers", async () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("lib/cli-backend.js", (mod) => {
    const originalRunAihSh = mod.runAihSh;
    mod.runAihSh = (_packRoot, args) => {
      calls.push(args);
      return { status: 0, combined: "" };
    };
    return () => {
      mod.runAihSh = originalRunAihSh;
    };
  });

  patchModule("lib/cli-ui", (mod) => {
    const originalShowInstallPlan = mod.showInstallPlan;
    mod.showInstallPlan = () => {};
    return () => {
      mod.showInstallPlan = originalShowInstallPlan;
    };
  });

  const { runInstallWizard } = fresh("lib/cli-commands/install.js");
  const status = await runInstallWizard(repoRoot, {
    providers: ["cursor", "claude"],
    target,
    scope: "project",
    visibility: "private",
    ref: "v1.0.1",
    dryRun: true,
    yes: true,
    verbose: true,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    [
      "install",
      "--runtime",
      "cursor",
      "--target",
      path.resolve(target),
      "--ref",
      "v1.0.1",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--dry-run",
      "--yes",
      "--init-harness",
      "--install-cache",
    ],
    [
      "install",
      "--runtime",
      "claude",
      "--target",
      path.resolve(target),
      "--ref",
      "v1.0.1",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--dry-run",
      "--yes",
      "--no-install-cache",
    ],
  ]);
});

test("runUpdateWizard non-interactive update calls backend for each provider", async () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("lib/cli-backend.js", (mod) => {
    const originalRunAihSh = mod.runAihSh;
    mod.runAihSh = (_packRoot, args) => {
      calls.push(args);
      return { status: 0, combined: "" };
    };
    return () => {
      mod.runAihSh = originalRunAihSh;
    };
  });

  patchModule("lib/cli-ui", (mod) => {
    const originalShowUpdatePlan = mod.showUpdatePlan;
    mod.showUpdatePlan = () => {};
    return () => {
      mod.showUpdatePlan = originalShowUpdatePlan;
    };
  });

  const { runUpdateWizard } = fresh("lib/cli-commands/update.js");
  const status = await runUpdateWizard(repoRoot, {
    providers: ["cursor", "claude"],
    target,
    scope: "project",
    visibility: "private",
    ref: "v1.0.1",
    dryRun: true,
    yes: true,
    verbose: true,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [
    [
      "update",
      "--runtime",
      "cursor",
      "--target",
      path.resolve(target),
      "--ref",
      "v1.0.1",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--dry-run",
      "--yes",
    ],
    [
      "update",
      "--runtime",
      "claude",
      "--target",
      path.resolve(target),
      "--ref",
      "v1.0.1",
      "--scope",
      "project",
      "--visibility",
      "private",
      "--dry-run",
      "--yes",
    ],
  ]);
});

test("runUninstallWizard non-interactive uninstall calls backend with full cleanup", async () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("lib/cli-backend.js", (mod) => {
    const originalRunAihSh = mod.runAihSh;
    mod.runAihSh = (_packRoot, args) => {
      calls.push(args);
      return { status: 0, combined: "" };
    };
    return () => {
      mod.runAihSh = originalRunAihSh;
    };
  });

  patchModule("lib/cli-ui", (mod) => {
    const originalShowUninstallPlan = mod.showUninstallPlan;
    mod.showUninstallPlan = () => {};
    return () => {
      mod.showUninstallPlan = originalShowUninstallPlan;
    };
  });

  const { runUninstallWizard } = fresh("lib/cli-commands/uninstall.js");
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
    [
      "uninstall",
      "--runtime",
      "cursor",
      "--target",
      path.resolve(target),
      "--scope",
      "project",
      "--yes",
      "--dry-run",
      "--all",
    ],
  ]);
});

test("runStatusOrDoctor forwards status to aih.sh", () => {
  const calls = [];
  const target = makeTempDir();

  patchModule("lib/cli-backend.js", (mod) => {
    const originalRunAihSh = mod.runAihSh;
    mod.runAihSh = (_packRoot, args) => {
      calls.push(args);
      return { status: 0, combined: "  target: ok" };
    };
    return () => {
      mod.runAihSh = originalRunAihSh;
    };
  });

  patchModule("lib/cli-ui", (mod) => {
    const originalFormatStatus = mod.formatStatus;
    mod.formatStatus = () => {};
    return () => {
      mod.formatStatus = originalFormatStatus;
    };
  });

  const { runStatusOrDoctor } = fresh("lib/cli-commands/diagnostics.js");
  const status = runStatusOrDoctor(repoRoot, "status", {
    providers: [],
    target,
    scope: "project",
    yes: true,
    verbose: false,
  });

  assert.equal(status, 0);
  assert.deepEqual(calls, [["status", "--target", path.resolve(target), "--scope", "project"]]);
});

test("runEvalCommand lists registry tasks", async () => {
  const { runEvalCommand } = fresh("lib/cli-commands/eval.js");
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
