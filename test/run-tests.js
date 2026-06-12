const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const validateApi = require(path.join(repoRoot, "dist", "features", "validate", "index.js"));
const validateConstants = require(
  path.join(repoRoot, "dist", "features", "validate", "domain", "constants.js")
);
const installCacheApi = require(
  path.join(repoRoot, "dist", "features", "install", "infrastructure", "install-cache.js")
);

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-test-"));
}

const VALIDATION_REPO_COPY_PATHS = new Set([
  ...validateConstants.requiredFiles,
  ...validateConstants.commandFiles,
  ...validateConstants.skillFiles,
  ...validateConstants.templateFiles,
  ...validateConstants.promptTemplateFiles,
  ...validateConstants.sessionMemoryDocFiles,
  ...validateConstants.sessionAwareCommandFiles,
  "docs/phase-discipline.md",
  "workflows/core-loop.md",
  "workflows/feature.md",
  "workflows/bugfix.md",
  "workflows/refactor.md",
  "workflows/incident.md",
]);

function shouldCopyValidationPath(relative) {
  const normalized = relative.replace(/[\\/]+/g, "/");
  for (const allowed of VALIDATION_REPO_COPY_PATHS) {
    if (normalized === allowed || allowed.startsWith(`${normalized}/`)) {
      return true;
    }
  }
  return false;
}

function makeTempRepoCopy() {
  const target = makeTempDir();
  fs.cpSync(repoRoot, target, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repoRoot, source);
      if (!relative) {
        return true;
      }
      return shouldCopyValidationPath(relative);
    },
  });
  childProcess.spawnSync("git", ["init", "-q"], { cwd: target });
  return target;
}

function writeRepoFile(baseDir, relativePath, updater) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relativePath), fullPath);
  }
  const current = fs.readFileSync(fullPath, "utf8");
  fs.writeFileSync(fullPath, updater(current));
}

function assertRepositoryFailure(baseDir, expectedPattern) {
  const failures = validateApi.validateRepository(baseDir);
  assert.notEqual(failures.length, 0, "expected validation failures");
  assert.match(failures.join("\n").replace(/[\\/]+/g, "/"), expectedPattern);
}

function runNode(args, options = {}) {
  return childProcess.spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 30000,
    ...options,
  });
}

describe("Validation API", () => {
  test("validate repository passes", () => {
    const failures = validateApi.validateRepository(repoRoot);
    assert.deepEqual(failures, []);
  });

  test("parseValidateArgs supports repository, profile, and goal modes", () => {
    assert.equal(validateApi.parseValidateArgs([]).mode, "harness-repository");
    assert.equal(validateApi.parseValidateArgs(["--target", "../demo"]).mode, "target-profile");
    const goal = validateApi.parseValidateArgs(["--target", "../demo", "--goal", "health-check"]);
    assert.equal(goal.mode, "target-goal");
    assert.equal(goal.goalId, "health-check");
  });

  test("validate target profile fixture passes", () => {
    const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-profile");
    assert.deepEqual(validateApi.validateTargetProfile(fixture), []);
  });

  test("validate target goal fixture passes", () => {
    const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-goal");
    assert.deepEqual(validateApi.validateTargetGoal(fixture, "2026-06-04-google-login"), []);
  });

  test("invalid target profile fixture fails", () => {
    const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-profile");
    assert.notEqual(validateApi.validateTargetProfile(fixture).length, 0);
  });

  test("invalid target goal fixture fails", () => {
    const fixture = path.join(repoRoot, "test", "fixtures", "invalid-target-goal");
    const failures = validateApi.validateTargetGoal(fixture, "2026-06-04-google-login");
    assert.notEqual(failures.length, 0);
    assert.match(failures.join("\n"), /PLAN-404\.md|STATE\.md/);
  });
});

describe("Tool Discovery & Routing", () => {
  test("discover-tools JSON mode exits cleanly with expected keys", () => {
    const result = runNode([path.join(repoRoot, "scripts", "discover-tools.js")]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const parsed = JSON.parse(result.stdout);
    for (const key of [
      "git",
      "gitWorktree",
      "rg",
      "gitGrep",
      "grep",
      "find",
      "markitdown",
      "codegraph",
      "gitNexus",
    ]) {
      assert.ok(Object.prototype.hasOwnProperty.call(parsed, key), `missing key ${key}`);
      assert.equal(typeof parsed[key].available, "boolean");
    }
  });

  test("discover-tools markdown mode exits cleanly", () => {
    const result = runNode([path.join(repoRoot, "scripts", "discover-tools.js"), "--markdown"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Tool Context/);
    assert.match(result.stdout, /Routing/);
  });

  test("tool capability files include required headings", () => {
    const headings = [
      "## Purpose",
      "## Detect",
      "## Use When",
      "## Do Not Use When",
      "## Example Commands",
      "## Fallback",
    ];
    for (const fileName of [
      "git.md",
      "grep-ripgrep.md",
      "git-worktree.md",
      "markitdown.md",
      "code-graph.md",
      "git-nexus.md",
    ]) {
      const text = fs.readFileSync(
        path.join(repoRoot, "tool-capabilities", "tools", fileName),
        "utf8"
      );
      for (const heading of headings) {
        assert.match(text, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      }
    }
  });

  test("tool routing docs define expected capabilities", () => {
    const text = fs.readFileSync(
      path.join(repoRoot, "tool-capabilities", "TOOL_ROUTING.md"),
      "utf8"
    );
    for (const capability of [
      "code-search",
      "diff-review",
      "history-review",
      "parallel-work",
      "document-to-markdown",
      "repo-structure",
      "dependency-scan",
    ]) {
      assert.match(text, new RegExp(capability));
    }
  });
});

describe("Session Memory & Documentation", () => {
  test("session memory templates exist", () => {
    for (const relativePath of [
      "templates/INDEX.md",
      "templates/STATE.md",
      "templates/MEMORY.md",
      "templates/TOOL_CONTEXT.md",
      "templates/SESSION.md",
      "templates/GOAL.md",
      "templates/DISCUSSION.md",
      "templates/PLAN.md",
      "templates/CHANGE_SPEC.md",
      "templates/TASKS.md",
      "templates/VERIFY.md",
      "templates/SHIP.md",
      "templates/REMEMBER.md",
      "templates/BLOCKED.md",
      "templates/NOTES.md",
      "templates/DECISION.md",
      "templates/HAZARD.md",
      "templates/harness-config.json",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
  });

  test("session memory docs exist", () => {
    for (const relativePath of [
      "docs/session-memory.md",
      "docs/memory-migration.md",
      "docs/context-engineering.md",
      "docs/token-budget.md",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
  });

  test("context engineering doc names the retrieval and spec discipline", () => {
    const body = fs.readFileSync(path.join(repoRoot, "docs", "context-engineering.md"), "utf8");
    assert.match(body, /just-in-time retrieval/i);
    assert.match(body, /INDEX\.md/i);
    assert.match(body, /CHANGE_SPEC\.md/);
    assert.match(body, /\.harness\/specs\//);
    assert.match(body, /subagent isolation/i);
  });

  test("validate repository fails when session-memory source-of-truth language is removed", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "docs/session-memory.md", (content) =>
      content.replace(/files are the source of truth/gi, "memory is handled automatically")
    );
    assertRepositoryFailure(
      tempRepo,
      /docs\/session-memory\.md must state that files are the source of truth/
    );
  });

  test("validate repository fails when harness config no longer uses file-backed memory", () => {
    const tempRepo = makeTempRepoCopy();
    let config;
    writeRepoFile(tempRepo, "templates/harness-config.json", (content) => {
      config = JSON.parse(content);
      config.memory.backend = "sqlite";
      return JSON.stringify(config, null, 2);
    });
    assertRepositoryFailure(
      tempRepo,
      /templates\/harness-config\.json must set memory\.backend to "files"/
    );
  });

  test("validate repository fails when harness config no longer exposes the spec layer opt-in", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "templates/harness-config.json", (content) => {
      const config = JSON.parse(content);
      config.specs.enabled = true;
      return JSON.stringify(config, null, 2);
    });
    assertRepositoryFailure(
      tempRepo,
      /templates\/harness-config\.json must set specs\.enabled to false/
    );
  });

  test("validate repository fails when harness config no longer exposes worker memory opt-in", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "templates/harness-config.json", (content) => {
      const config = JSON.parse(content);
      config.workerMemory.enabled = true;
      return JSON.stringify(config, null, 2);
    });
    assertRepositoryFailure(
      tempRepo,
      /templates\/harness-config\.json must set workerMemory\.enabled to false/
    );
  });

  test("validate repository fails when harness config worker memory directory drifts", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "templates/harness-config.json", (content) => {
      const config = JSON.parse(content);
      config.workerMemory.directory = ".harness/memory/agents";
      return JSON.stringify(config, null, 2);
    });
    assertRepositoryFailure(
      tempRepo,
      /templates\/harness-config\.json must set workerMemory\.directory to "\.harness\/memory\/workers"/
    );
  });

  test("validate repository fails when change specs lose delta headings", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "templates/CHANGE_SPEC.md", (content) =>
      content.replace(
        /## ADDED Requirements[\s\S]*?## MODIFIED Requirements/,
        "## MODIFIED Requirements"
      )
    );
    assertRepositoryFailure(
      tempRepo,
      /templates\/CHANGE_SPEC\.md is missing heading: ## ADDED Requirements/
    );
  });

  test("validate repository fails when a session-aware command drops STATE routing", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "commands/harness-plan.md", (content) =>
      content.replace(/\.harness\/STATE\.md/g, ".harness/ROUTER.md")
    );
    assertRepositoryFailure(
      tempRepo,
      /commands\/harness-plan\.md must reference \.harness\/STATE\.md/
    );
  });
});

describe("Workflow Command Documentation", () => {
  test("validate repository fails when start and map docs drift from their command semantics", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "commands/harness-map.md", (content) =>
      content
        .replace(/manual context refresh/gi, "full workflow entrypoint")
        .replace(/compatibility/gi, "replacement")
    );
    assertRepositoryFailure(
      tempRepo,
      /commands\/harness-map\.md must describe compatibility or manual context refresh semantics/
    );
  });

  test("validate repository fails when a workflow doc breaks canonical phase order", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "workflows/feature.md", (content) =>
      content.replace(
        /harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember/,
        "harness-start -> harness-map -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember"
      )
    );
    assertRepositoryFailure(
      tempRepo,
      /workflows\/feature\.md must use canonical harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember order/
    );
  });

  test("command metadata keeps start and map with updated descriptions and no brief", () => {
    const { WORKFLOW_COMMANDS } = require(
      path.join(
        repoRoot,
        "dist",
        "features",
        "install",
        "infrastructure",
        "runtime-command-catalog"
      )
    );
    const byId = new Map(WORKFLOW_COMMANDS.map((spec) => [spec.id, spec]));
    assert.equal(byId.get("start").canonical, "harness-start");
    assert.match(byId.get("start").description, /Session Start|restore|context/i);
    assert.equal(byId.get("map").canonical, "harness-map");
    assert.match(
      byId.get("map").description,
      /compatibility|manual context refresh|context refresh/i
    );
    assert.equal(byId.has("brief"), false);
  });

  test("validate repository fails when a command doc drops tool discovery guidance", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "commands/harness-run.md", (content) =>
      content.replace("## Tool Discovery", "## Discovery")
    );
    assertRepositoryFailure(
      tempRepo,
      /commands\/harness-run\.md must include ## Tool Discovery and ## Tool Routing sections/
    );
  });

  test("validate repository fails when a prompt template drops tool routing guidance", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "prompt-templates/harness-run.md", (content) =>
      content.replace("### Tool Routing", "### Routing")
    );
    assertRepositoryFailure(
      tempRepo,
      /prompt-templates\/harness-run\.md must include ### Tool Discovery and ### Tool Routing sections/
    );
  });

  test("workflow commands require session start when state unknown", () => {
    for (const fileName of [
      "harness-plan.md",
      "harness-run.md",
      "harness-verify.md",
      "harness-ship.md",
      "harness-remember.md",
    ]) {
      const content = fs.readFileSync(path.join(repoRoot, "commands", fileName), "utf8");
      assert.match(
        content,
        /Session Start|harness-start/i,
        `${fileName} must mention Session Start`
      );
    }
  });

  test("command files expose tool frontmatter and live git context where report asks for it", () => {
    const run = fs.readFileSync(path.join(repoRoot, "commands", "harness-run.md"), "utf8");
    const verify = fs.readFileSync(path.join(repoRoot, "commands", "harness-verify.md"), "utf8");
    const ship = fs.readFileSync(path.join(repoRoot, "commands", "harness-ship.md"), "utf8");

    assert.match(run, /^---\nallowed_tools:/);
    assert.match(verify, /^---\nallowed_tools:/);
    assert.match(verify, /Current Working State/);
    assert.match(verify, /git diff --stat HEAD/);
    assert.match(verify, /git status --short/);
    assert.match(ship, /Current Working State/);
    assert.match(ship, /node scripts\/generate-report-context\.js --json/);
  });

  test("workflow docs include decision trees and artifact checklists for active flows", () => {
    for (const relativePath of [
      "workflows/core-loop.md",
      "workflows/bugfix.md",
      "workflows/feature.md",
      "workflows/refactor.md",
      "workflows/code-review.md",
      "workflows/incident.md",
      "workflows/review-and-verify.md",
      "workflows/release-readiness.md",
      "workflows/daily-dev-report.md",
      "workflows/compose-skills.md",
      "workflows/create-skill.md",
    ]) {
      const body = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
      assert.match(body, /## Decision Tree/);
      assert.match(body, /## Artifact Checklist/);
    }
  });
});

describe("Installation & Packaging", () => {
  test("install surface includes tool discovery assets and excludes harness-build docs", () => {
    assert.ok(installCacheApi.cacheExportPaths.includes("tool-capabilities"));
    assert.ok(installCacheApi.cacheExportPaths.includes("scripts/discover-tools.js"));
    assert.ok(installCacheApi.cacheExportPaths.includes("agent-system/"));
    assert.ok(installCacheApi.cacheExportPaths.includes("docs/tool-discovery-and-routing.md"));
    assert.equal(installCacheApi.cacheExportPaths.includes("docs/harness-build-usage.md"), false);
  });

  test("install cache dry-run includes tool assets", () => {
    const target = makeTempDir();
    const results = installCacheApi.installCapabilityCache({
      packRoot: repoRoot,
      target,
      dryRun: true,
      force: false,
    });
    assert.ok(results.some((entry) => /tool-capabilities/.test(entry.relativePath)));
    assert.ok(results.some((entry) => /scripts\/discover-tools\.js/.test(entry.relativePath)));
    assert.ok(results.some((entry) => /agent-system\/SYSTEM_PROMPT\.md/.test(entry.relativePath)));
  });

  test("README install guidance points to current adoption docs", () => {
    const text = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
    assert.doesNotMatch(text, /harness-build/i);
    assert.match(text, /adoption-guide/i);
  });

  test("package publishes tool capability assets", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    assert.ok(pkg.files.includes("tool-capabilities/"));
    assert.ok(pkg.files.includes("scripts/discover-tools.js"));
    assert.ok(pkg.files.includes("workers/"));
  });
});

describe("Delegated Workers", () => {
  test("delegated worker repository surface exists", () => {
    for (const relativePath of [
      "dist/workers/registry.js",
      "workers/explorer.md",
      "workers/reviewer.md",
      "workers/verifier.md",
      "workers/gatekeeper.md",
      "workers/fixer.md",
      "templates/WORKER_RUN.md",
      "docs/delegated-workers.md",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
  });

  test("worker registry exports canonical v1 workers", () => {
    const registry = require(path.join(repoRoot, "dist", "workers", "registry.js"));
    assert.deepEqual(
      [...registry.WORKER_IDS],
      ["explorer", "reviewer", "verifier", "gatekeeper", "fixer"]
    );
    assert.equal(registry.workers.length, 5);
    for (const worker of registry.workers) {
      assert.equal(worker.canDispatch, false);
      assert.equal(worker.resultSchema, "agent-result-v1");
    }
    const explorer = registry.getWorkerById("explorer");
    assert.equal(explorer.writeAccess, "none");
    const fixer = registry.getWorkerById("fixer");
    assert.equal(fixer.writeAccess, "write");
    for (const id of ["reviewer", "verifier", "gatekeeper"]) {
      assert.equal(registry.getWorkerById(id).writeAccess, "none");
    }
  });

  test("worker definitions include frontmatter and agent result envelope", () => {
    const { parseFrontmatter } = require(
      path.join(repoRoot, "dist", "features", "validate", "domain", "utils.js")
    );
    for (const workerId of ["explorer", "reviewer", "verifier", "gatekeeper", "fixer"]) {
      const text = fs.readFileSync(path.join(repoRoot, "workers", `${workerId}.md`), "utf8");
      const frontmatter = parseFrontmatter(text);
      assert.ok(frontmatter, `${workerId}.md must include frontmatter`);
      for (const field of ["id", "role", "mode", "writeAccess", "canDispatch", "resultSchema"]) {
        assert.ok(frontmatter[field], `${workerId}.md frontmatter must include ${field}`);
      }
      assert.ok(Array.isArray(frontmatter.requiredInputs) && frontmatter.requiredInputs.length > 0);
      assert.equal(String(frontmatter.canDispatch), "false");
      assert.match(text, /### Agent Result/);
    }
  });

  test("worker provider support values are valid", () => {
    const registry = require(path.join(repoRoot, "dist", "workers", "registry.js"));
    for (const worker of registry.workers) {
      for (const value of Object.values(worker.providerSupport)) {
        assert.ok(
          registry.VALID_PROVIDER_SUPPORT.includes(value),
          `invalid support value: ${value}`
        );
      }
      assert.equal(worker.providerSupport.claude, "native");
      assert.equal(worker.providerSupport.cursor, "adapter");
      assert.equal(worker.providerSupport.codex, "adapter");
    }
  });

  test("command docs reference delegated worker contract", () => {
    const verify = fs.readFileSync(path.join(repoRoot, "commands", "harness-verify.md"), "utf8");
    const ship = fs.readFileSync(path.join(repoRoot, "commands", "harness-ship.md"), "utf8");
    const run = fs.readFileSync(path.join(repoRoot, "commands", "harness-run.md"), "utf8");
    assert.match(verify, /reviewer/);
    assert.match(verify, /verifier/);
    assert.match(verify, /WORKER_RUN|worker contract|delegated worker/i);
    assert.match(ship, /gatekeeper/);
    assert.match(run, /fixer/);
  });
});

describe("Provider Rules & Adapters", () => {
  test("claude worker adapter renders native agent files", () => {
    const { renderClaudeAgentFile } = require(
      path.join(repoRoot, "dist", "workers", "claude-adapter.js")
    );
    const body = fs
      .readFileSync(path.join(repoRoot, "workers", "reviewer.md"), "utf8")
      .replace(/^---[\s\S]*?---\s*/, "");
    const rendered = renderClaudeAgentFile("reviewer", body);
    assert.match(rendered, /^---\nname: harness-reviewer/);
    assert.match(rendered, /tools: Read, Grep, Glob, Bash/);
    assert.match(rendered, /### Agent Result/);
  });

  test("delegated workers doc describes support levels honestly", () => {
    const text = fs.readFileSync(path.join(repoRoot, "docs", "delegated-workers.md"), "utf8");
    for (const level of ["native", "adapter", "fallback", "unsupported"]) {
      assert.match(text, new RegExp(level));
    }
    assert.match(text, /Claude.*native|native.*Claude/i);
    assert.match(text, /Cursor.*adapter|adapter.*Cursor/i);
    assert.match(text, /Codex.*adapter|adapter.*Codex/i);
  });

  test("provider rule renderer composes core fragments for each provider", () => {
    const renderer = require(
      path.join(
        repoRoot,
        "dist",
        "features",
        "install",
        "infrastructure",
        "provider-rule-renderer.js"
      )
    );
    const samples = [
      [".claude/CLAUDE.md", renderer.renderClaudeProjectMd()],
      [".cursor/rules/ai-engineering-harness.mdc", renderer.renderCursorActivationMdc()],
      [".cursor/rules/ai-engineering-harness-commands.mdc", renderer.renderCursorCommandsMdc()],
      ["AGENTS.md", renderer.renderCodexAgentsMd()],
      [".gemini/extensions/ai-engineering-harness/GEMINI.md", renderer.renderGeminiMd()],
    ];
    const failures = [];
    for (const [relativePath, content] of samples) {
      renderer.assertProviderRuleContent(relativePath, content, failures);
      assert.match(content, /harness-plan/);
      assert.match(content, /evidence/i);
      if (relativePath.includes(".cursor/")) {
        assert.match(content, /\.cursor\/commands\//);
      }
    }
    assert.deepEqual(failures, []);
  });

  test("provider rule renderer renders Claude command files from a provider template", () => {
    const renderer = require(
      path.join(
        repoRoot,
        "dist",
        "features",
        "install",
        "infrastructure",
        "provider-rule-renderer.js"
      )
    );
    const templatePath = path.join(repoRoot, "rules", "providers", "claude", "command.md");
    assert.ok(fs.existsSync(templatePath), "rules/providers/claude/command.md must exist");

    const content = renderer.renderClaudeCommandFile({
      canonical: "harness-plan",
      title: "Harness Plan",
      sourceCommand: "commands/harness-plan.md",
    });

    const template = fs.readFileSync(templatePath, "utf8");
    assert.match(template, /\{\{COMMAND_TITLE\}\}/);
    assert.match(template, /\{\{COMMAND_CANONICAL\}\}/);
    assert.match(content, /Read:/);
    assert.match(content, /\.ai-harness\/prompt-templates\/harness-plan\.md/);
    assert.match(content, /Then follow the harness command contract/);
    assert.doesNotMatch(content, /\{\{[A-Z_]+\}\}/);
  });

  test("provider rule adapters declare honest native slash support", () => {
    const { PROVIDER_RULE_ADAPTERS } = require(
      path.join(
        repoRoot,
        "dist",
        "features",
        "install",
        "infrastructure",
        "provider-rule-renderer.js"
      )
    );
    assert.equal(PROVIDER_RULE_ADAPTERS.claude.nativeSlashCommands, true);
    assert.equal(PROVIDER_RULE_ADAPTERS.claude.supportsSubagents, true);
    assert.equal(PROVIDER_RULE_ADAPTERS.cursor.nativeSlashCommands, true);
    assert.equal(PROVIDER_RULE_ADAPTERS.codex.nativeSlashCommands, false);
    assert.equal(PROVIDER_RULE_ADAPTERS.gemini.nativeSlashCommands, false);
  });
});

describe("Provider Command Support", () => {
  test("provider command support merges rule adapter metadata", () => {
    const { providerCommandSupport } = require(
      path.join(
        repoRoot,
        "dist",
        "features",
        "install",
        "infrastructure",
        "runtime-command-catalog"
      )
    );
    const claude = providerCommandSupport("claude");
    const cursor = providerCommandSupport("cursor");
    assert.equal(claude.nativeSlashCommands, true);
    assert.ok(Array.isArray(claude.ruleEntrypoints));
    assert.match(claude.ruleEntrypoints.join(" "), /\.claude\/agents/);
    assert.match(claude.ruleEntrypoints.join(" "), /\.claude\/skills/);
    assert.equal(cursor.nativeSlashCommands, true);
    assert.match(cursor.ruleEntrypoints.join(" "), /\.cursor\/commands/);
    assert.match(cursor.ruleEntrypoints.join(" "), /guardrails/);
  });
});

describe("Hooks & Skills Layer", () => {
  test("hooks and skills layer surface exists", () => {
    for (const relativePath of [
      "hooks/README.md",
      "dist/hooks/core/guard-phase.js",
      "dist/hooks/core/record-tool-output.js",
      "dist/hooks/core/record-subagent-result.js",
      "dist/hooks/core/compact-session-memory.js",
      "dist/hooks/core/record-skill-run.js",
      "dist/hooks/core/archive-session-skill.js",
      "docs/hooks-and-skills-layer.md",
      "docs/skill-lifecycle.md",
      "workflows/create-skill.md",
      "workflows/compose-skills.md",
      "workflows/review-and-verify.md",
      "templates/SKILL_DISPOSAL.md",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
  });

  test("hook scripts support --help", () => {
    for (const script of [
      "dist/hooks/core/guard-phase.js",
      "dist/hooks/core/record-tool-output.js",
      "dist/hooks/core/record-subagent-result.js",
      "dist/hooks/core/record-skill-run.js",
      "dist/hooks/core/archive-session-skill.js",
      "dist/hooks/core/compact-session-memory.js",
    ]) {
      const result = runNode([path.join(repoRoot, script), "--help"]);
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
  });

  test("guard-phase passes for approved fixture session on harness-verify", () => {
    const fixture = path.join(repoRoot, "test", "fixtures", "valid-target-goal");
    const session = ".harness/sessions/2026-06-04-google-login";
    const result = runNode(
      [
        path.join(repoRoot, "dist", "hooks", "core", "guard-phase.js"),
        "--command",
        "harness-verify",
        "--session",
        path.join(fixture, session),
        "--json",
      ],
      { cwd: fixture }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.ok, true);
  });

  test("install cache includes hooks directory", () => {
    assert.ok(installCacheApi.cacheExportPaths.includes("hooks/"));
  });

  test("skill packs and review references include concrete failure modes and anti-shortcut guidance", () => {
    for (const relativePath of [
      "skills/packs/backend.md",
      "skills/packs/debugging.md",
      "skills/packs/devops.md",
      "skills/packs/frontend.md",
      "skills/packs/mobile.md",
    ]) {
      const body = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
      assert.match(body, /## Common Failure Modes/);
      assert.match(body, /## Verification Strategy/);
      assert.match(body, /## Anti-Rationalization/);
    }

    const severityGuide = fs.readFileSync(
      path.join(repoRoot, "skills", "code-review", "references", "severity-guide.md"),
      "utf8"
    );
    assert.match(severityGuide, /## Critical/);
    assert.match(severityGuide, /## Important/);
    assert.match(severityGuide, /## Minor/);
    assert.match(severityGuide, /## No Finding/);

    const gateContract = fs.readFileSync(
      path.join(repoRoot, "skills", "gatekeeper", "references", "gate-contract.md"),
      "utf8"
    );
    assert.match(gateContract, /## Decision Rules/);
    assert.match(gateContract, /## Output Requirements/);
    assert.match(gateContract, /allow \| block \| defer/);

    const evidenceContract = fs.readFileSync(
      path.join(repoRoot, "skills", "verification", "references", "evidence-contract.md"),
      "utf8"
    );
    assert.match(evidenceContract, /## Acceptable Evidence/);
    assert.match(evidenceContract, /## Unacceptable Evidence/);
    assert.match(evidenceContract, /## Decision Rule/);
  });

  test("Claude path-scoped rules exist for session, memory, and policy files", () => {
    for (const relativePath of [
      ".claude/rules/harness-sessions.md",
      ".claude/rules/harness-memory.md",
      ".claude/rules/policy-files.md",
    ]) {
      const body = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
      assert.match(body, /^---/);
      assert.match(body, /paths:/);
    }
  });

  test("deep skills for debugging and security follow the expected reusable contract shape", () => {
    for (const relativePath of [
      "skills/debugging-investigation/SKILL.md",
      "skills/security-review/SKILL.md",
    ]) {
      const body = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
      assert.match(body, /## Purpose/);
      assert.match(body, /## When To Use/);
      assert.match(body, /## When Not To Use/);
      assert.match(body, /## Workflow/);
      assert.match(body, /## Reasoning Procedure/);
      assert.match(body, /## Action Loop/);
      assert.match(body, /## Examples/);
      assert.match(body, /## Output Contract/);
      assert.match(body, /## Common Failure Modes/);
      assert.match(body, /## Verification Requirements/);
      assert.match(body, /## Checklist Before Done/);
    }

    const verificationPrompt = fs.readFileSync(
      path.join(repoRoot, "skills", "verification", "prompt.md"),
      "utf8"
    );
    assert.match(verificationPrompt, /## Evidence Example/);
    assert.match(verificationPrompt, /## Stop Condition/);
  });
});

describe("Daily Dev Report Layer", () => {
  test("daily dev report layer surface exists", () => {
    for (const relativePath of [
      "templates/REPORT.md",
      "templates/PR_MESSAGE.md",
      "templates/CHANGE_SUMMARY.md",
      "skills/report-writer/SKILL.md",
      "workflows/daily-dev-report.md",
      "docs/daily-dev-report.md",
      "scripts/generate-report-context.js",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
  });

  test("generate-report-context supports --help and --json", () => {
    const script = path.join(repoRoot, "scripts", "generate-report-context.js");
    const help = runNode([script, "--help"]);
    assert.equal(help.status, 0, help.stderr || help.stdout);
    const json = runNode([script, "--json"], { cwd: repoRoot });
    assert.equal(json.status, 0, json.stderr || json.stdout);
    const parsed = JSON.parse(json.stdout);
    assert.equal(typeof parsed.ok, "boolean");
    assert.equal(parsed.ok, true);
    assert.ok(Array.isArray(parsed.files));
  });

  test("harness-ship references report artifacts", () => {
    const command = fs.readFileSync(path.join(repoRoot, "commands", "harness-ship.md"), "utf8");
    const prompt = fs.readFileSync(
      path.join(repoRoot, "prompt-templates", "harness-ship.md"),
      "utf8"
    );
    for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
      assert.match(command, new RegExp(artifact));
      assert.match(prompt, new RegExp(artifact));
    }
  });
});

describe("Session Start Protocol", () => {
  test("session start protocol surface exists", () => {
    for (const relativePath of [
      "docs/session-start.md",
      "templates/SESSION_START.md",
      "commands/harness-start.md",
    ]) {
      assert.ok(fs.existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
    }
    const start = fs.readFileSync(path.join(repoRoot, "commands", "harness-start.md"), "utf8");
    assert.match(start, /Session Start/i);
    const agents = fs.readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");
    assert.match(agents, /## Session Start/i);
  });

  test("validate repository fails when canonical Session Start flow disappears from docs", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "docs/phase-discipline.md", (content) =>
      content.replace(
        /Session Start → Discuss → Plan → Run → Verify → Ship → Remember/,
        "Discuss → Plan → Run → Verify → Ship → Remember"
      )
    );
    assertRepositoryFailure(
      tempRepo,
      /docs\/phase-discipline\.md must include the canonical Session Start → Discuss → Plan → Run → Verify → Ship → Remember flow/
    );
  });

  test("validate repository fails when README drops storage architecture references", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "README.md", (content) =>
      content.replace(/\.harness\/history\/events\.jsonl/g, ".harness/history/log.txt")
    );
    assertRepositoryFailure(
      tempRepo,
      /README\.md must reference \.harness\/context\.md, \.harness\/history\/events\.jsonl, and \.harness\/memory\//
    );
  });

  test("validate repository fails when AGENTS drops the Session Start section", () => {
    const tempRepo = makeTempRepoCopy();
    writeRepoFile(tempRepo, "AGENTS.md", (content) =>
      content.replace("## Session Start", "## Start")
    );
    assertRepositoryFailure(tempRepo, /AGENTS\.md must include Session Start section/);
  });
});
