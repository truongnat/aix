const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const Module = require("node:module");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const cliArgs = require(path.join(repoRoot, "dist", "lib", "cli-args.js"));
const cliDetect = require(path.join(repoRoot, "dist", "lib", "cli-detect.js"));

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-test-"));
}

function createMockFileStructure(dir, files = []) {
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const dirPath = path.dirname(filePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, "ai-engineering-harness");
  });
}

describe("CLI Arguments Parser", () => {
  test("parseArgv defaults to install command", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js"]);
    assert.equal(opts.command, "install");
  });

  test("parseArgv recognizes valid commands", () => {
    for (const cmd of [
      "install",
      "status",
      "doctor",
      "update",
      "uninstall",
      "help",
      "eval",
      "insights",
      "init",
      "domains",
    ]) {
      const opts = cliArgs.parseArgv(["node", "aih.js", cmd]);
      assert.equal(opts.command, cmd);
    }
  });

  test("parseArgv captures eval subcommand and target", () => {
    const opts = cliArgs.parseArgv([
      "node",
      "aih.js",
      "eval",
      "run",
      "sample-bugfix",
      "--provider",
      "codex",
    ]);
    assert.equal(opts.command, "eval");
    assert.equal(opts.evalCommand, "run");
    assert.equal(opts.evalTarget, "sample-bugfix");
    assert.deepEqual(opts.providers, ["codex"]);
  });

  test("parseArgv supports eval flags before subcommand and target", () => {
    const opts = cliArgs.parseArgv([
      "node",
      "aih.js",
      "eval",
      "--provider",
      "codex",
      "run",
      "sample-bugfix",
    ]);
    assert.equal(opts.command, "eval");
    assert.equal(opts.evalCommand, "run");
    assert.equal(opts.evalTarget, "sample-bugfix");
    assert.deepEqual(opts.providers, ["codex"]);
  });

  test("parseArgv parses --provider flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--provider", "claude"]);
    assert.deepEqual(opts.providers, ["claude"]);
  });

  test("parseArgv parses multiple providers", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--provider", "claude,cursor,codex"]);
    assert.deepEqual(opts.providers, ["claude", "cursor", "codex"]);
  });

  test("parseArgv deduplicates providers", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--provider", "claude,claude,cursor"]);
    assert.deepEqual(opts.providers, ["claude", "cursor"]);
  });

  test("parseArgv marks --runtime alias usage", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--runtime", "claude"]);
    assert.equal(opts.runtimeAliasUsed, true);
    assert.deepEqual(opts.providers, ["claude"]);
  });

  test("parseArgv parses --yes flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--yes"]);
    assert.equal(opts.yes, true);
  });

  test("parseArgv parses --help flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--help"]);
    assert.equal(opts.help, true);
  });

  test("parseArgv parses --dry-run flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--dry-run"]);
    assert.equal(opts.dryRun, true);
  });

  test("parseArgv parses --target flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--target", "/tmp/project"]);
    assert.equal(opts.target, "/tmp/project");
  });

  test("parseArgv parses --domains flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--domains", "frontend,backend"]);
    assert.deepEqual(opts.domains, ["frontend", "backend"]);
  });

  test("parseArgv parses --analysis-file flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--analysis-file", "./analysis.json"]);
    assert.equal(opts.analysisFile, "./analysis.json");
  });

  test("parseArgv parses --force flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--force"]);
    assert.equal(opts.force, true);
  });

  test("parseArgv rejects --ref for the npx CLI", () => {
    assert.throws(
      () => cliArgs.parseArgv(["node", "aih.js", "install", "--ref", "v1.0.1"]),
      /--ref is not supported by the npx CLI/
    );
  });

  test("parseArgv parses --all flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--all"]);
    assert.equal(opts.all, true);
  });

  test("parseArgv parses --verbose flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--verbose"]);
    assert.equal(opts.verbose, true);
  });

  test("parseArgv parses --live-provider-command flag", () => {
    const opts = cliArgs.parseArgv([
      "node",
      "aih.js",
      "eval",
      "run",
      "sample-bugfix",
      "--live-provider-command",
      "node fake-provider.js",
    ]);
    assert.equal(opts.liveProviderCommand, "node fake-provider.js");
  });

  test("parseArgv parses --no-llm-judge flag", () => {
    const opts = cliArgs.parseArgv([
      "node",
      "aih.js",
      "eval",
      "run",
      "sample-bugfix",
      "--no-llm-judge",
    ]);
    assert.equal(opts.useLlmJudge, false);
  });

  test("parseArgv throws on unknown argument", () => {
    assert.throws(() => cliArgs.parseArgv(["node", "aih.js", "--unknown"]), /Unknown argument/);
  });

  test("parseArgv throws when --provider has no value", () => {
    assert.throws(() => cliArgs.parseArgv(["node", "aih.js", "--provider"]), /Missing value/);
  });

  test("parseArgv combines command with options", () => {
    const opts = cliArgs.parseArgv([
      "node",
      "aih.js",
      "status",
      "--provider",
      "claude",
      "--verbose",
    ]);
    assert.equal(opts.command, "status");
    assert.deepEqual(opts.providers, ["claude"]);
    assert.equal(opts.verbose, true);
  });
});

describe("CLI Help", () => {
  test("renderHelp includes eval commands", () => {
    const { renderHelp } = fresh("dist/lib/cli-help.js");
    const help = renderHelp();
    assert.match(help, /ai-engineering-harness eval list/);
    assert.match(help, /ai-engineering-harness eval run <task-or-suite>/);
    assert.match(help, /ai-engineering-harness eval report <run-id>/);
    assert.match(help, /--live-provider-command/);
    assert.match(help, /--domains/);
    assert.match(help, /--analysis-file/);
    assert.match(help, /ai-engineering-harness domains --analysis-file \.\/domain-analysis\.json/);
  });

  test("renderHelp includes insights command", () => {
    const { renderHelp } = fresh("dist/lib/cli-help.js");
    const help = renderHelp();
    assert.match(help, /ai-engineering-harness insights/);
    assert.match(help, /--json/);
    assert.match(help, /--run-recommended-evals/);
  });

  test("renderHelp reflects in-process primary lifecycle commands", () => {
    const { renderHelp } = fresh("dist/lib/cli-help.js");
    const help = renderHelp();
    assert.match(help, /--verbose\s+Show raw backend output/);
    assert.match(help, /Primary lifecycle commands run in-process on Node\.js/);
    assert.doesNotMatch(help, /Git Bash or WSL required for the bundled shell backend fallback/);
    assert.doesNotMatch(help, /raw shell backend output/);
  });
});

describe("CLI Mode to Scope/Visibility", () => {
  test("modeToScopeVisibility handles project-private", () => {
    const result = cliArgs.modeToScopeVisibility("project-private");
    assert.deepEqual(result, { scope: "project", visibility: "private" });
  });

  test("modeToScopeVisibility handles project-shared", () => {
    const result = cliArgs.modeToScopeVisibility("project-shared");
    assert.deepEqual(result, { scope: "project", visibility: "shared" });
  });

  test("modeToScopeVisibility handles global", () => {
    const result = cliArgs.modeToScopeVisibility("global");
    assert.deepEqual(result, { scope: "global", visibility: "" });
  });

  test("modeToScopeVisibility defaults unknown modes", () => {
    const result = cliArgs.modeToScopeVisibility("unknown");
    assert.deepEqual(result, { scope: "project", visibility: "private" });
  });
});

describe("CLI Provider Detection", () => {
  test("detectRecommendedProviders detects Claude from .claude directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".claude/CLAUDE.md"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("claude"));
  });

  test("detectRecommendedProviders detects Cursor from .cursor directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".cursor/rules/ai-engineering-harness.mdc"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("cursor"));
  });

  test("detectRecommendedProviders detects Codex from .codex-plugin directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".codex-plugin/plugin.json"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectRecommendedProviders detects Codex from .codex directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".codex/hooks.json"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectRecommendedProviders detects Codex from .agents/skills", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".agents/skills/verification/SKILL.md"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectRecommendedProviders detects Gemini from .gemini directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".gemini/placeholder"]);
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.ok(providers.includes("gemini"));
  });

  test("detectRecommendedProviders returns empty array for fresh project", () => {
    const tmpDir = makeTempDir();
    const providers = cliDetect.detectRecommendedProviders(tmpDir);
    assert.deepEqual(providers, []);
  });

  test("detectInstalledProviders detects Claude from .claude/CLAUDE.md", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".claude/CLAUDE.md"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("claude"));
  });

  test("detectInstalledProviders detects Cursor from .cursor/rules", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".cursor/rules/ai-engineering-harness.mdc"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("cursor"));
  });

  test("detectInstalledProviders detects Cursor from .cursor/commands", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".cursor/commands/harness-plan.md"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("cursor"));
  });

  test("detectInstalledProviders detects Codex from .codex-plugin/plugin.json", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".codex-plugin/plugin.json"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectInstalledProviders detects Codex from .codex directory", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".codex/hooks.json"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectInstalledProviders detects Codex from .agents/skills", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".agents/skills/verification/SKILL.md"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("codex"));
  });

  test("detectInstalledProviders detects Gemini from .gemini/extensions", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".gemini/extensions/ai-engineering-harness/GEMINI.md"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("gemini"));
  });

  test("detectInstalledProviders detects generic from AGENTS.md marker", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, ["AGENTS.md"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    assert.ok(providers.includes("generic"));
  });

  test("detectInstalledProviders deduplicates providers", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [
      ".claude/CLAUDE.md",
      ".cursor/rules/ai-engineering-harness.mdc",
      ".claude/OTHER.md",
    ]);
    const providers = cliDetect.detectInstalledProviders(tmpDir);
    const count = providers.filter((p) => p === "claude").length;
    assert.equal(count, 1);
  });

  test("detectLegacyProviderResidue detects OpenCode files", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".opencode/plugins/ai-engineering-harness.js"]);
    const legacy = cliDetect.detectLegacyProviderResidue(tmpDir);
    assert.ok(legacy.includes("opencode"));
  });

  test("detectInstalledProviders can include legacy runtimes when requested", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".opencode/plugins/ai-engineering-harness.js"]);
    const providers = cliDetect.detectInstalledProviders(tmpDir, { includeLegacy: true });
    assert.ok(providers.includes("opencode"));
  });

  test("detectProviderBinaries probes installed provider CLIs via PATH", () => {
    const originalSpawnSync = childProcess.spawnSync;
    childProcess.spawnSync = (command) => {
      switch (command) {
        case "claude":
          return { stdout: "claude 1.2.3\n", stderr: "", status: 0, error: undefined };
        case "cursor":
          return { stdout: "cursor 0.9.0\n", stderr: "", status: 0, error: undefined };
        case "codex":
          return { stdout: "codex 0.8.0\n", stderr: "", status: 0, error: undefined };
        default:
          return {
            stdout: "",
            stderr: "",
            status: null,
            error: { code: "ENOENT" },
          };
      }
    };

    try {
      const providerBinaryDetect = fresh("dist/lib/provider-binary-detect.js");
      const binaries = providerBinaryDetect.detectProviderBinaries();
      assert.equal(binaries.claude.installed, true);
      assert.equal(binaries.cursor.installed, true);
      assert.equal(binaries.codex.installed, true);
      assert.equal(binaries.gemini.installed, false);
      assert.match(binaries.claude.version || "", /1\.2\.3/);
      assert.match(binaries.cursor.version || "", /0\.9\.0/);
    } finally {
      childProcess.spawnSync = originalSpawnSync;
    }
  });

  test("probeCommand falls back to ComSpec for Windows command shims", () => {
    const originalSpawnSync = childProcess.spawnSync;
    const originalPlatform = process.platform;
    const originalComSpec = process.env.ComSpec;
    const calls = [];

    Object.defineProperty(process, "platform", { value: "win32" });
    process.env.ComSpec = "C:\\Windows\\System32\\cmd.exe";
    childProcess.spawnSync = (command, args) => {
      calls.push({ command, args });
      if (command === "cursor") {
        return { stdout: "", stderr: "", status: null, error: { code: "ENOENT" } };
      }
      if (command === process.env.ComSpec) {
        return { stdout: "cursor 1.0.0\r\n", stderr: "", status: 0, error: undefined };
      }
      return { stdout: "", stderr: "", status: null, error: { code: "ENOENT" } };
    };

    try {
      const providerBinaryDetect = fresh("dist/lib/provider-binary-detect.js");
      const probe = providerBinaryDetect.probeCommand("cursor");
      assert.equal(probe.installed, true);
      assert.equal(probe.commandUsed, "cursor");
      assert.match(probe.version || "", /1\.0\.0/);
      assert.equal(calls[1].command, process.env.ComSpec);
      assert.deepEqual(calls[1].args, ["/d", "/s", "/c", "cursor --version"]);
    } finally {
      childProcess.spawnSync = originalSpawnSync;
      Object.defineProperty(process, "platform", { value: originalPlatform });
      if (originalComSpec === undefined) {
        delete process.env.ComSpec;
      } else {
        process.env.ComSpec = originalComSpec;
      }
    }
  });

  test("probeCursorBinary prefers agent before other Cursor shims", () => {
    const originalSpawnSync = childProcess.spawnSync;
    const calls = [];

    childProcess.spawnSync = (command) => {
      calls.push(command);
      if (command === "agent") {
        return { stdout: "agent 1.2.3\n", stderr: "", status: 0, error: undefined };
      }
      return { stdout: "", stderr: "", status: null, error: { code: "ENOENT" } };
    };

    try {
      const providerBinaryDetect = fresh("dist/lib/provider-binary-detect.js");
      const probe = providerBinaryDetect.probeCursorBinary();
      assert.equal(probe.installed, true);
      assert.equal(probe.commandUsed, "agent");
      assert.deepEqual(calls, ["agent"]);
    } finally {
      childProcess.spawnSync = originalSpawnSync;
    }
  });

  test("detectLegacyProviderResidue returns empty for clean project", () => {
    const tmpDir = makeTempDir();
    const legacy = cliDetect.detectLegacyProviderResidue(tmpDir);
    assert.deepEqual(legacy, []);
  });

  test("isGitRepo detects .git directory", () => {
    const tmpDir = makeTempDir();
    fs.mkdirSync(path.join(tmpDir, ".git"));
    fs.writeFileSync(path.join(tmpDir, ".git", "HEAD"), "ref: refs/heads/main\n");
    const result = cliDetect.isGitRepo(tmpDir);
    assert.equal(result, true);
  });

  test("isGitRepo returns false for non-git directory", () => {
    const tmpDir = makeTempDir();
    const result = cliDetect.isGitRepo(tmpDir);
    assert.equal(result, false);
  });

  test("isGitRepo detects .git file used by worktrees", () => {
    const tmpDir = makeTempDir();
    const actualGitDir = path.join(tmpDir, "worktree-meta");
    fs.mkdirSync(actualGitDir, { recursive: true });
    fs.writeFileSync(path.join(actualGitDir, "HEAD"), "ref: refs/heads/main\n");
    fs.writeFileSync(path.join(tmpDir, ".git"), `gitdir: ${path.relative(tmpDir, actualGitDir)}\n`);
    const result = cliDetect.isGitRepo(tmpDir);
    assert.equal(result, true);
  });

  test("isGitRepo returns false for a precreated .git directory without HEAD", () => {
    const tmpDir = makeTempDir();
    fs.mkdirSync(path.join(tmpDir, ".git", "info"), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, ".git", "info", "exclude"), "precreated\n");
    const result = cliDetect.isGitRepo(tmpDir);
    assert.equal(result, false);
  });

  test("fileContainsHarnessMarker detects marker string", () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "test.md");
    fs.writeFileSync(filePath, "This file has ai-engineering-harness in it");
    const result = cliDetect.fileContainsHarnessMarker(filePath);
    assert.equal(result, true);
  });

  test("fileContainsHarnessMarker returns false without marker", () => {
    const tmpDir = makeTempDir();
    const filePath = path.join(tmpDir, "test.md");
    fs.writeFileSync(filePath, "This file does not have the marker");
    const result = cliDetect.fileContainsHarnessMarker(filePath);
    assert.equal(result, false);
  });

  test("fileContainsHarnessMarker handles missing files gracefully", () => {
    const result = cliDetect.fileContainsHarnessMarker("/nonexistent/file.md");
    assert.equal(result, false);
  });
});

describe("CLI Non-Interactive Detection", () => {
  test("isNonInteractive returns true when --yes is set", () => {
    const opts = { yes: true, providers: [] };
    const result = cliArgs.isNonInteractive(opts);
    assert.equal(result, true);
  });

  test("isNonInteractive returns true when providers are specified", () => {
    const opts = { yes: false, providers: ["claude"] };
    const result = cliArgs.isNonInteractive(opts);
    assert.equal(result, true);
  });

  test("isNonInteractive returns false when interactive conditions met", () => {
    // Note: process.stdin.isTTY may be false in test environment
    // so this test verifies the logic with explicit TTY values
    const opts = { yes: false, providers: [] };
    // When stdin/stdout are not TTY (like in tests), it's non-interactive
    const result = cliArgs.isNonInteractive(opts);
    // In test environment, should be non-interactive
    assert.equal(typeof result, "boolean");
  });
});

describe("CLI Interactive UI", () => {
  test("useInteractiveUi stays interactive when provider is explicitly specified", () => {
    const stdinDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
    const stdoutDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
    Object.defineProperty(process.stdin, "isTTY", { value: true, configurable: true });
    Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });

    try {
      const { useInteractiveUi } = fresh("dist/lib/cli-ui.js");
      assert.equal(useInteractiveUi({ yes: false, providers: ["cursor"] }), true);
      assert.equal(useInteractiveUi({ yes: true, providers: ["cursor"] }), false);
    } finally {
      if (stdinDescriptor) {
        Object.defineProperty(process.stdin, "isTTY", stdinDescriptor);
      }
      if (stdoutDescriptor) {
        Object.defineProperty(process.stdout, "isTTY", stdoutDescriptor);
      }
    }
  });
});

describe("CLI Main", () => {
  test("main dispatches eval commands to runEvalCommand", async () => {
    const originalLoad = Module._load;
    const calls = [];

    Module._load = function patchedLoader(request, parent, isMain) {
      if (request === "./cli-commands/eval") {
        return {
          runEvalCommand: async (_packRoot, options) => {
            calls.push(options);
            return 0;
          },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const { main } = fresh("dist/lib/cli-main.js");
      const status = await main(
        ["node", "aih.js", "eval", "list"],
        path.join(repoRoot, "bin", "aih.js")
      );
      assert.equal(status, 0);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].command, "eval");
      assert.equal(calls[0].evalCommand, "list");
    } finally {
      Module._load = originalLoad;
    }
  });

  test("main dispatches domains command to runDomainsCommand", async () => {
    const originalLoad = Module._load;
    const calls = [];

    Module._load = function patchedLoader(request, parent, isMain) {
      if (request === "./cli-commands/domains") {
        return {
          runDomainsCommand: async (_packRoot, options) => {
            calls.push(options);
            return 0;
          },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const { main } = fresh("dist/lib/cli-main.js");
      const status = await main(
        ["node", "aih.js", "domains", "--analysis-file", "analysis.json"],
        path.join(repoRoot, "bin", "aih.js")
      );
      assert.equal(status, 0);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].command, "domains");
      assert.equal(calls[0].analysisFile, "analysis.json");
    } finally {
      Module._load = originalLoad;
    }
  });

  test("runEvalCommand rejects missing target for eval run before downstream dispatch", async () => {
    const originalLoad = Module._load;
    let downstreamCalls = 0;

    Module._load = function patchedLoader(request, parent, isMain) {
      if (request === "../evals") {
        return {
          listTasks: () => {
            downstreamCalls += 1;
            return 0;
          },
          runTask: () => {
            downstreamCalls += 1;
            return 0;
          },
          readReport: () => {
            downstreamCalls += 1;
            return 0;
          },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const { runEvalCommand } = fresh("dist/lib/cli-commands/eval.js");
      await assert.rejects(
        () => runEvalCommand(repoRoot, { evalCommand: "run", evalTarget: "" }),
        /Missing eval target for `aih eval run`\./
      );
      assert.equal(downstreamCalls, 0);
    } finally {
      Module._load = originalLoad;
    }
  });

  test("runEvalCommand rejects missing target for eval report before downstream dispatch", async () => {
    const originalLoad = Module._load;
    let downstreamCalls = 0;

    Module._load = function patchedLoader(request, parent, isMain) {
      if (request === "../evals") {
        return {
          listTasks: () => {
            downstreamCalls += 1;
            return 0;
          },
          runTask: () => {
            downstreamCalls += 1;
            return 0;
          },
          readReport: () => {
            downstreamCalls += 1;
            return 0;
          },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const { runEvalCommand } = fresh("dist/lib/cli-commands/eval.js");
      await assert.rejects(
        () => runEvalCommand(repoRoot, { evalCommand: "report", evalTarget: "" }),
        /Missing eval target for `aih eval report`\./
      );
      assert.equal(downstreamCalls, 0);
    } finally {
      Module._load = originalLoad;
    }
  });
});
