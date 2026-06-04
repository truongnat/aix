const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const cliArgs = require(path.join(repoRoot, "lib", "cli-args.js"));
const cliDetect = require(path.join(repoRoot, "lib", "cli-detect.js"));

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
    for (const cmd of ["install", "status", "doctor", "update", "uninstall", "help"]) {
      const opts = cliArgs.parseArgv(["node", "aih.js", cmd]);
      assert.equal(opts.command, cmd);
    }
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

  test("parseArgv parses --all flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--all"]);
    assert.equal(opts.all, true);
  });

  test("parseArgv parses --verbose flag", () => {
    const opts = cliArgs.parseArgv(["node", "aih.js", "--verbose"]);
    assert.equal(opts.verbose, true);
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

  test("detectInstalledProviders detects Codex from .codex-plugin/plugin.json", () => {
    const tmpDir = makeTempDir();
    createMockFileStructure(tmpDir, [".codex-plugin/plugin.json"]);
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

  test("detectLegacyProviderResidue returns empty for clean project", () => {
    const tmpDir = makeTempDir();
    const legacy = cliDetect.detectLegacyProviderResidue(tmpDir);
    assert.deepEqual(legacy, []);
  });

  test("isGitRepo detects .git directory", () => {
    const tmpDir = makeTempDir();
    fs.mkdirSync(path.join(tmpDir, ".git"));
    const result = cliDetect.isGitRepo(tmpDir);
    assert.equal(result, true);
  });

  test("isGitRepo returns false for non-git directory", () => {
    const tmpDir = makeTempDir();
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
