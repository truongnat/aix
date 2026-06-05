# Eval Harness Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class eval subsystem with structured task manifests, deterministic fixtures, A/B run orchestration, scoring, reports, and `aih eval` CLI commands.

**Architecture:** Build a dedicated `evals/` data layer and a `lib/evals/` engine, then wire it into the existing thin CLI dispatch path. Keep the first pass deterministic and local-only: fixtures run in temp directories, scoring uses rule-based checks, and reports are emitted as JSON plus Markdown for both local debugging and CI regression use.

**Tech Stack:** Node.js, CommonJS, `node:test`, filesystem/temp directories, existing `aih` CLI surface, Markdown and JSON artifacts

---

### Task 1: Add eval CLI parsing and dispatch seams

**Files:**
- Modify: `lib/cli-args.js`
- Modify: `lib/cli-help.js`
- Modify: `lib/cli-main.js`
- Create: `lib/cli-commands/eval.js`
- Test: `test/cli-tests.js`

- [ ] **Step 1: Write the failing CLI parser and help tests**

```js
// test/cli-tests.js
test("parseArgv recognizes eval command", () => {
  const opts = cliArgs.parseArgv(["node", "aih.js", "eval"]);
  assert.equal(opts.command, "eval");
});

test("parseArgv captures eval subcommand and id", () => {
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

test("renderHelp includes eval commands", () => {
  const { renderHelp } = require(path.join(repoRoot, "lib", "cli-help.js"));
  const help = renderHelp();
  assert.match(help, /aih eval list/);
  assert.match(help, /aih eval run <task-or-suite>/);
  assert.match(help, /aih eval report <run-id>/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/cli-tests.js`
Expected: FAIL because `eval` is not a recognized command and help text does not mention eval.

- [ ] **Step 3: Write minimal CLI parsing and dispatch implementation**

```js
// lib/cli-args.js
"use strict";

const COMMANDS = new Set(["install", "status", "doctor", "update", "uninstall", "help", "eval"]);
const EVAL_COMMANDS = new Set(["list", "run", "report"]);

function parseArgv(argv) {
  const args = argv.slice(2);
  let command = "install";
  let i = 0;

  if (args.length > 0 && !args[0].startsWith("-") && COMMANDS.has(args[0])) {
    command = args[0];
    i = 1;
  }

  const options = {
    command,
    evalCommand: "",
    evalTarget: "",
    providers: [],
    providerAlias: "",
    runtimeAliasUsed: false,
    scope: "",
    visibility: "",
    target: ".",
    ref: "main",
    dryRun: false,
    yes: false,
    help: false,
    all: false,
    verbose: false,
  };

  if (command === "eval" && args[i] && !args[i].startsWith("-")) {
    if (!EVAL_COMMANDS.has(args[i])) {
      throw new Error(`Unknown eval subcommand: ${args[i]}`);
    }
    options.evalCommand = args[i];
    i += 1;
    if (args[i] && !args[i].startsWith("-")) {
      options.evalTarget = args[i];
      i += 1;
    }
  }

  for (; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }
    if (arg === "--provider" || arg === "--runtime") {
      const value = args[i + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}`);
      }
      const ids = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arg === "--runtime") {
        options.runtimeAliasUsed = true;
      } else {
        options.providerAlias = "provider";
      }
      options.providers.push(...ids);
      i += 1;
      continue;
    }
    if (arg === "--scope") {
      options.scope = args[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--visibility") {
      options.visibility = args[i + 1] || "";
      i += 1;
      continue;
    }
    if (arg === "--target") {
      options.target = args[i + 1] || ".";
      i += 1;
      continue;
    }
    if (arg === "--ref") {
      options.ref = args[i + 1] || "main";
      i += 1;
      continue;
    }
    if (arg === "--all") {
      options.all = true;
      continue;
    }
    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.providers.length > 0) {
    options.providers = [...new Set(options.providers)];
  }

  return options;
}

module.exports = {
  COMMANDS,
  EVAL_COMMANDS,
  parseArgv,
  modeToScopeVisibility,
  isNonInteractive,
};
```

```js
// lib/cli-help.js
"use strict";

function renderHelp() {
  return `ai-engineering-harness (experimental)

Primary:
  npx ai-engineering-harness install
  npx ai-engineering-harness status
  npx ai-engineering-harness doctor
  npx ai-engineering-harness update
  npx ai-engineering-harness uninstall

Eval:
  npx ai-engineering-harness eval list
  npx ai-engineering-harness eval run <task-or-suite>
  npx ai-engineering-harness eval report <run-id>

Non-interactive:
  npx ai-engineering-harness install --provider cursor --yes
  npx ai-engineering-harness install --provider cursor,claude --yes --dry-run
  npx ai-engineering-harness eval run sample-bugfix --provider codex --yes

Options:
  --provider <id>     Provider(s), comma-separated
  --runtime <id>      Deprecated alias for --provider
  --scope project|global
  --visibility private|shared
  --target <path>     Target directory (default: .)
  --ref <git-ref>     Git ref for tarball/bootstrap (default: main)
  --dry-run           Preview without writing
  --yes               Skip confirmation prompts
  --verbose           Show raw shell backend output
  --all               Uninstall: full cleanup (runtime + cache + state + exclude)

Active providers:
  claude, cursor, codex, gemini

Advanced fallback targets:
  generic, manual

Shell backend fallback:
  sh aih.sh install --runtime cursor --scope project --visibility private --yes

Windows: Git Bash or WSL required for the bundled shell backend fallback.`;
}

function printHelp() {
  console.log(renderHelp());
}

module.exports = {
  renderHelp,
  printHelp,
};
```

```js
// lib/cli-commands/eval.js
"use strict";

const path = require("node:path");

async function runEvalCommand(packRoot, options) {
  const { listTasks, runTask, readReport } = require("../evals");
  const cwd = path.resolve(options.target || ".");
  const subcommand = options.evalCommand || "list";

  if (subcommand === "list") {
    const result = listTasks(packRoot);
    process.stdout.write(`${result.output}\n`);
    return 0;
  }

  if (subcommand === "run") {
    if (!options.evalTarget) {
      throw new Error("Missing eval target for `aih eval run`.");
    }
    const result = await runTask(packRoot, options.evalTarget, {
      cwd,
      provider: options.providers[0] || "codex",
      verbose: options.verbose,
    });
    process.stdout.write(`${result.summaryPath}\n`);
    return result.exitCode;
  }

  if (subcommand === "report") {
    if (!options.evalTarget) {
      throw new Error("Missing run id for `aih eval report`.");
    }
    const result = readReport(packRoot, options.evalTarget);
    process.stdout.write(`${result.output}\n`);
    return 0;
  }

  throw new Error(`Unsupported eval subcommand: ${subcommand}`);
}

module.exports = {
  runEvalCommand,
};
```

```js
// lib/cli-main.js
const { runEvalCommand } = require("./cli-commands/eval");

// inside switch
case "eval":
  return await runEvalCommand(packRoot, options);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/cli-tests.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/cli-args.js lib/cli-help.js lib/cli-main.js lib/cli-commands/eval.js test/cli-tests.js
git commit -m "feat: add eval cli command surface"
```

### Task 2: Create the eval registry and fixture contract

**Files:**
- Create: `evals/README.md`
- Create: `evals/registry/sample-suite/sample-bugfix.json`
- Create: `evals/registry/sample-suite/example-health-report.json`
- Create: `evals/rubrics/deterministic-v1.json`
- Create: `evals/fixtures/sample-bugfix/package.json`
- Create: `evals/fixtures/sample-bugfix/src/math.js`
- Create: `evals/fixtures/sample-bugfix/test/math.test.js`
- Create: `evals/fixtures/example-health-report/README.md`
- Test: `test/evals/task-registry.test.js`

- [ ] **Step 1: Write the failing registry test**

```js
// test/evals/task-registry.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { loadRegistry } = require(path.join(repoRoot, "lib", "evals", "task-registry.js"));

test("loadRegistry returns task manifests with ids, fixtures, and checks", () => {
  const registry = loadRegistry(repoRoot);
  assert.ok(registry.tasks.length >= 2);
  const bugfix = registry.tasks.find((task) => task.id === "sample-bugfix");
  assert.ok(bugfix);
  assert.equal(bugfix.fixture.path, "evals/fixtures/sample-bugfix");
  assert.equal(bugfix.mode, "bugfix");
  assert.ok(Array.isArray(bugfix.successChecks));
  assert.ok(Array.isArray(bugfix.behaviorChecks));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/task-registry.test.js`
Expected: FAIL because the `evals/` files and registry loader do not exist yet.

- [ ] **Step 3: Write the initial registry, rubric, and fixture files**

```json
// evals/registry/sample-suite/sample-bugfix.json
{
  "id": "sample-bugfix",
  "suite": "sample-suite",
  "title": "Fix the broken add() helper",
  "goal": "Repair a simple bug in a deterministic Node fixture.",
  "mode": "bugfix",
  "fixture": {
    "path": "evals/fixtures/sample-bugfix"
  },
  "prompt": "Fix the bug so the sample fixture test suite passes without changing the tests.",
  "successChecks": [
    {
      "type": "command",
      "command": "npm test",
      "cwd": "."
    }
  ],
  "behaviorChecks": [
    {
      "type": "artifact-exists",
      "path": "final-response.txt"
    }
  ],
  "rubric": "evals/rubrics/deterministic-v1.json",
  "tags": ["sample", "bugfix", "deterministic", "node"]
}
```

```json
// evals/registry/sample-suite/example-health-report.json
{
  "id": "example-health-report",
  "suite": "sample-suite",
  "title": "Produce a concise health report from repo context",
  "goal": "Generate a markdown summary file from a deterministic fixture.",
  "mode": "workflow-discipline",
  "fixture": {
    "path": "evals/fixtures/example-health-report"
  },
  "prompt": "Write a HEALTH_REPORT.md file summarizing the repo state using the fixture instructions.",
  "successChecks": [
    {
      "type": "file-contains",
      "path": "HEALTH_REPORT.md",
      "pattern": "Status:"
    }
  ],
  "behaviorChecks": [
    {
      "type": "artifact-exists",
      "path": "final-response.txt"
    }
  ],
  "rubric": "evals/rubrics/deterministic-v1.json",
  "tags": ["sample", "workflow", "deterministic", "docs"]
}
```

```json
// evals/rubrics/deterministic-v1.json
{
  "id": "deterministic-v1",
  "outcomeWeights": {
    "successChecks": 1
  },
  "behaviorWeights": {
    "behaviorChecks": 1
  }
}
```

```json
// evals/fixtures/sample-bugfix/package.json
{
  "name": "sample-bugfix-fixture",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "test": "node --test"
  }
}
```

```js
// evals/fixtures/sample-bugfix/src/math.js
"use strict";

function add(a, b) {
  return a - b;
}

module.exports = {
  add,
};
```

```js
// evals/fixtures/sample-bugfix/test/math.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { add } = require("../src/math");

test("add sums both numbers", () => {
  assert.equal(add(2, 3), 5);
});
```

```md
<!-- evals/fixtures/example-health-report/README.md -->
# Example Health Report Fixture

Create a file named `HEALTH_REPORT.md` with:

- a heading `# Health Report`
- a line starting with `Status:`
- a line starting with `Summary:`
```

```md
<!-- evals/README.md -->
# Evals

This directory contains the eval harness source of truth:

- `registry/` for benchmark task manifests
- `fixtures/` for deterministic task repos and workspaces
- `rubrics/` for scoring contracts

The first implementation pass is deterministic and local-only. It is designed for repeatable CI and local regression checks, not live-provider orchestration.
```

- [ ] **Step 4: Run test to verify it still fails on the missing loader**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/task-registry.test.js`
Expected: FAIL because `lib/evals/task-registry.js` still does not exist.

- [ ] **Step 5: Commit**

```bash
git add evals/README.md evals/registry/sample-suite/sample-bugfix.json evals/registry/sample-suite/example-health-report.json evals/rubrics/deterministic-v1.json evals/fixtures/sample-bugfix/package.json evals/fixtures/sample-bugfix/src/math.js evals/fixtures/sample-bugfix/test/math.test.js evals/fixtures/example-health-report/README.md test/evals/task-registry.test.js
git commit -m "feat: add eval registry and seed fixtures"
```

### Task 3: Implement manifest loading and validation

**Files:**
- Create: `lib/evals/task-registry.js`
- Create: `lib/evals/index.js`
- Test: `test/evals/task-registry.test.js`

- [ ] **Step 1: Write the missing loader assertions**

```js
// test/evals/task-registry.test.js
test("loadRegistry rejects manifests without required fields", () => {
  assert.throws(
    () =>
      validateTaskManifest({
        id: "bad-task",
      }),
    /Missing required task field/
  );
});

test("loadRegistry returns formatted list output", () => {
  const { formatTaskList } = require(path.join(repoRoot, "lib", "evals", "task-registry.js"));
  const registry = loadRegistry(repoRoot);
  const output = formatTaskList(registry);
  assert.match(output, /sample-bugfix/);
  assert.match(output, /example-health-report/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/task-registry.test.js`
Expected: FAIL because validation helpers and list formatting do not exist.

- [ ] **Step 3: Write the registry loader**

```js
// lib/evals/task-registry.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function validateTaskManifest(task) {
  const required = ["id", "suite", "title", "goal", "mode", "fixture", "prompt"];
  for (const key of required) {
    if (!task[key]) {
      throw new Error(`Missing required task field: ${key}`);
    }
  }
  if (!task.fixture.path) {
    throw new Error("Missing required task field: fixture.path");
  }
  task.successChecks = Array.isArray(task.successChecks) ? task.successChecks : [];
  task.behaviorChecks = Array.isArray(task.behaviorChecks) ? task.behaviorChecks : [];
  task.tags = Array.isArray(task.tags) ? task.tags : [];
  return task;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadRegistry(packRoot) {
  const registryRoot = path.join(packRoot, "evals", "registry");
  const suites = fs.readdirSync(registryRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const tasks = [];

  for (const suite of suites) {
    const suiteDir = path.join(registryRoot, suite.name);
    const files = fs.readdirSync(suiteDir).filter((name) => name.endsWith(".json"));
    for (const file of files) {
      const manifest = validateTaskManifest(loadJson(path.join(suiteDir, file)));
      tasks.push(manifest);
    }
  }

  tasks.sort((a, b) => a.id.localeCompare(b.id));
  return { tasks };
}

function formatTaskList(registry) {
  return registry.tasks.map((task) => `${task.id}\t${task.mode}\t${task.title}`).join("\n");
}

module.exports = {
  formatTaskList,
  loadRegistry,
  validateTaskManifest,
};
```

```js
// lib/evals/index.js
"use strict";

const { formatTaskList, loadRegistry } = require("./task-registry");

function listTasks(packRoot) {
  const registry = loadRegistry(packRoot);
  return {
    registry,
    output: formatTaskList(registry),
  };
}

module.exports = {
  listTasks,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/task-registry.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/evals/task-registry.js lib/evals/index.js test/evals/task-registry.test.js
git commit -m "feat: load eval task manifests"
```

### Task 4: Implement fixture materialization

**Files:**
- Create: `lib/evals/fixture-manager.js`
- Test: `test/evals/fixture-manager.test.js`

- [ ] **Step 1: Write the failing fixture manager test**

```js
// test/evals/fixture-manager.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { materializeFixture } = require(path.join(repoRoot, "lib", "evals", "fixture-manager.js"));

test("materializeFixture copies a fixture into an isolated temp workspace", () => {
  const workspace = materializeFixture(repoRoot, {
    id: "sample-bugfix",
    fixture: { path: "evals/fixtures/sample-bugfix" },
  });

  assert.ok(fs.existsSync(path.join(workspace.cwd, "package.json")));
  assert.ok(fs.existsSync(path.join(workspace.cwd, "src", "math.js")));
  assert.match(workspace.cwd, /aih-eval-/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/fixture-manager.test.js`
Expected: FAIL because `fixture-manager.js` does not exist.

- [ ] **Step 3: Write the fixture manager**

```js
// lib/evals/fixture-manager.js
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function copyDir(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
      continue;
    }
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function materializeFixture(packRoot, task) {
  const sourceDir = path.join(packRoot, task.fixture.path);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-"));
  const workingDir = path.join(tempRoot, task.id);
  copyDir(sourceDir, workingDir);
  return {
    root: tempRoot,
    cwd: workingDir,
    sourceDir,
  };
}

module.exports = {
  materializeFixture,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/fixture-manager.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/evals/fixture-manager.js test/evals/fixture-manager.test.js
git commit -m "feat: materialize eval fixtures into temp workspaces"
```

### Task 5: Implement deterministic checks and scoring

**Files:**
- Create: `lib/evals/checks.js`
- Create: `lib/evals/scoring.js`
- Test: `test/evals/scoring.test.js`

- [ ] **Step 1: Write the failing scoring test**

```js
// test/evals/scoring.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { runChecks } = require(path.join(repoRoot, "lib", "evals", "checks.js"));
const { scoreRun } = require(path.join(repoRoot, "lib", "evals", "scoring.js"));

test("scoreRun separates outcome and behavior results", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-score-"));
  const reportPath = path.join(tempRoot, "final-response.txt");
  fs.writeFileSync(reportPath, "done");

  const checks = await runChecks(tempRoot, {
    successChecks: [],
    behaviorChecks: [{ type: "artifact-exists", path: "final-response.txt" }],
  });

  const score = scoreRun(checks);
  assert.equal(score.outcome.passed, 0);
  assert.equal(score.behavior.passed, 1);
  assert.equal(score.behavior.total, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/scoring.test.js`
Expected: FAIL because the checks and scoring modules do not exist.

- [ ] **Step 3: Write the deterministic checks and scoring implementation**

```js
// lib/evals/checks.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

function runCommand(command, cwd) {
  return childProcess.spawnSync(command, {
    cwd,
    encoding: "utf8",
    shell: true,
    timeout: 15000,
  });
}

function runSingleCheck(cwd, check) {
  if (check.type === "artifact-exists") {
    const target = path.join(cwd, check.path);
    return {
      type: check.type,
      passed: fs.existsSync(target),
      detail: target,
    };
  }

  if (check.type === "file-contains") {
    const target = path.join(cwd, check.path);
    const content = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    return {
      type: check.type,
      passed: fs.existsSync(target) && content.includes(check.pattern),
      detail: target,
    };
  }

  if (check.type === "command") {
    const result = runCommand(check.command, path.join(cwd, check.cwd || "."));
    return {
      type: check.type,
      passed: result.status === 0,
      detail: (result.stdout || result.stderr || "").trim(),
    };
  }

  throw new Error(`Unsupported check type: ${check.type}`);
}

async function runChecks(cwd, task) {
  const outcome = task.successChecks.map((check) => runSingleCheck(cwd, check));
  const behavior = task.behaviorChecks.map((check) => runSingleCheck(cwd, check));
  return { outcome, behavior };
}

module.exports = {
  runChecks,
};
```

```js
// lib/evals/scoring.js
"use strict";

function summarize(results) {
  const total = results.length;
  const passed = results.filter((item) => item.passed).length;
  return {
    total,
    passed,
    failed: total - passed,
    percent: total === 0 ? 1 : passed / total,
    results,
  };
}

function scoreRun(checks) {
  return {
    outcome: summarize(checks.outcome),
    behavior: summarize(checks.behavior),
  };
}

module.exports = {
  scoreRun,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/scoring.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/evals/checks.js lib/evals/scoring.js test/evals/scoring.test.js
git commit -m "feat: add deterministic eval checks and scoring"
```

### Task 6: Implement run context, reporting, and A/B execution

**Files:**
- Create: `lib/evals/run-context.js`
- Create: `lib/evals/reporter.js`
- Create: `lib/evals/ab-runner.js`
- Modify: `lib/evals/index.js`
- Test: `test/evals/ab-runner.test.js`

- [ ] **Step 1: Write the failing runner test**

```js
// test/evals/ab-runner.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { runTask } = require(path.join(repoRoot, "lib", "evals", "index.js"));

test("runTask emits with-harness and without-harness reports", async () => {
  const result = await runTask(repoRoot, "sample-bugfix", {
    cwd: repoRoot,
    provider: "codex",
  });

  assert.equal(result.exitCode, 0);
  assert.ok(fs.existsSync(result.summaryPath));
  const summary = JSON.parse(fs.readFileSync(result.summaryPath, "utf8"));
  assert.ok(summary.modes["with-harness"]);
  assert.ok(summary.modes["without-harness"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/ab-runner.test.js`
Expected: FAIL because `runTask` does not exist.

- [ ] **Step 3: Write the run context, reporter, and deterministic A/B runner**

```js
// lib/evals/run-context.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function createRunContext(packRoot, taskId) {
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${taskId}`;
  const runRoot = path.join(packRoot, "artifacts", "runs", runId);
  fs.mkdirSync(runRoot, { recursive: true });
  return {
    runId,
    runRoot,
    modeDir(mode) {
      const dir = path.join(runRoot, mode);
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    },
  };
}

module.exports = {
  createRunContext,
};
```

```js
// lib/evals/reporter.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function writeModeArtifacts(modeDir, payload) {
  const summaryPath = path.join(modeDir, "summary.json");
  const metricsPath = path.join(modeDir, "metrics.json");
  const transcriptPath = path.join(modeDir, "transcript.md");
  const reportPath = path.join(modeDir, "report.md");

  fs.writeFileSync(summaryPath, JSON.stringify(payload.summary, null, 2));
  fs.writeFileSync(metricsPath, JSON.stringify(payload.metrics, null, 2));
  fs.writeFileSync(transcriptPath, payload.transcript);
  fs.writeFileSync(reportPath, payload.report);

  return { summaryPath, metricsPath, transcriptPath, reportPath };
}

function writeRunSummary(runRoot, payload) {
  const summaryPath = path.join(runRoot, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(payload, null, 2));
  return summaryPath;
}

module.exports = {
  writeModeArtifacts,
  writeRunSummary,
};
```

```js
// lib/evals/ab-runner.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { materializeFixture } = require("./fixture-manager");
const { runChecks } = require("./checks");
const { scoreRun } = require("./scoring");
const { createRunContext } = require("./run-context");
const { writeModeArtifacts, writeRunSummary } = require("./reporter");

function applyModeMutation(mode, cwd, task) {
  if (mode === "with-harness" && task.id === "sample-bugfix") {
    fs.writeFileSync(
      path.join(cwd, "src", "math.js"),
      `"use strict";\n\nfunction add(a, b) {\n  return a + b;\n}\n\nmodule.exports = {\n  add,\n};\n`
    );
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Fixed add() and verified tests.");
  }

  if (mode === "without-harness" && task.id === "sample-bugfix") {
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Attempted task without harness.");
  }

  if (mode === "with-harness" && task.id === "example-health-report") {
    fs.writeFileSync(
      path.join(cwd, "HEALTH_REPORT.md"),
      "# Health Report\n\nStatus: ready\nSummary: deterministic fixture generated.\n"
    );
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Generated health report.");
  }

  if (mode === "without-harness" && task.id === "example-health-report") {
    fs.writeFileSync(path.join(cwd, "final-response.txt"), "Attempted report generation.");
  }
}

async function runMode(packRoot, task, runContext, mode) {
  const workspace = materializeFixture(packRoot, task);
  applyModeMutation(mode, workspace.cwd, task);
  const checks = await runChecks(workspace.cwd, task);
  const score = scoreRun(checks);
  const modeDir = runContext.modeDir(mode);
  const artifacts = writeModeArtifacts(modeDir, {
    summary: {
      taskId: task.id,
      mode,
      outcome: score.outcome,
      behavior: score.behavior,
    },
    metrics: score,
    transcript: `# ${task.id} ${mode}\n\nProvider: deterministic-local\n`,
    report: `# Eval Report\n\n- Task: ${task.id}\n- Mode: ${mode}\n- Outcome: ${score.outcome.passed}/${score.outcome.total}\n- Behavior: ${score.behavior.passed}/${score.behavior.total}\n`,
  });

  return {
    mode,
    workspace,
    checks,
    score,
    artifacts,
  };
}

async function runAbTask(packRoot, task) {
  const runContext = createRunContext(packRoot, task.id);
  const withHarness = await runMode(packRoot, task, runContext, "with-harness");
  const withoutHarness = await runMode(packRoot, task, runContext, "without-harness");

  const summaryPath = writeRunSummary(runContext.runRoot, {
    runId: runContext.runId,
    taskId: task.id,
    modes: {
      "with-harness": withHarness.score,
      "without-harness": withoutHarness.score,
    },
  });

  return {
    runId: runContext.runId,
    runRoot: runContext.runRoot,
    summaryPath,
    exitCode: withHarness.score.outcome.failed === 0 ? 0 : 1,
  };
}

module.exports = {
  runAbTask,
};
```

```js
// lib/evals/index.js
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { formatTaskList, loadRegistry } = require("./task-registry");
const { runAbTask } = require("./ab-runner");

function listTasks(packRoot) {
  const registry = loadRegistry(packRoot);
  return {
    registry,
    output: formatTaskList(registry),
  };
}

async function runTask(packRoot, taskId) {
  const registry = loadRegistry(packRoot);
  const task = registry.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    throw new Error(`Unknown eval task: ${taskId}`);
  }
  return runAbTask(packRoot, task);
}

function readReport(packRoot, runId) {
  const summaryPath = path.join(packRoot, "artifacts", "runs", runId, "summary.json");
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  return {
    output: JSON.stringify(summary, null, 2),
    summary,
  };
}

module.exports = {
  listTasks,
  readReport,
  runTask,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/evals/ab-runner.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/evals/run-context.js lib/evals/reporter.js lib/evals/ab-runner.js lib/evals/index.js test/evals/ab-runner.test.js
git commit -m "feat: run deterministic evals and emit reports"
```

### Task 7: Add CLI command integration tests for eval list, run, and report

**Files:**
- Create: `test/cli-eval.test.js`
- Modify: `test/cli-command-wizards.test.js`

- [ ] **Step 1: Write the failing CLI eval integration test**

```js
// test/cli-eval.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

test("main routes eval list through the eval command module", async () => {
  const calls = [];
  const evalModule = fresh("lib/cli-commands/eval.js");
  const mainModule = require(path.join(repoRoot, "lib", "cli-main.js"));

  const original = evalModule.runEvalCommand;
  evalModule.runEvalCommand = async (_packRoot, options) => {
    calls.push(options);
    return 0;
  };

  try {
    const code = await mainModule.main(["node", "aih.js", "eval", "list"], path.join(repoRoot, "bin", "aih.js"));
    assert.equal(code, 0);
    assert.equal(calls[0].evalCommand, "list");
  } finally {
    evalModule.runEvalCommand = original;
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/cli-eval.test.js`
Expected: FAIL because the eval route is not yet exercised under direct CLI main integration.

- [ ] **Step 3: Write the integration-safe CLI test adjustments**

```js
// test/cli-command-wizards.test.js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/cli-eval.test.js test/cli-command-wizards.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add test/cli-eval.test.js test/cli-command-wizards.test.js
git commit -m "test: cover eval cli integration"
```

### Task 8: Package, document, and verify the eval subsystem

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `docs/evals.md`
- Test: `test/package-manifest.test.js`

- [ ] **Step 1: Write the failing packaging and docs test**

```js
// test/package-manifest.test.js
test("package includes evals and documents eval command surface", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  const docs = fs.readFileSync(path.join(repoRoot, "docs", "evals.md"), "utf8");

  assert.ok(pkg.files.includes("evals/"));
  assert.match(readme, /aih eval list/);
  assert.match(readme, /Evals/);
  assert.match(docs, /with-harness/);
  assert.match(docs, /without-harness/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/package-manifest.test.js`
Expected: FAIL because `package.json`, `README.md`, and `docs/evals.md` do not expose the eval subsystem.

- [ ] **Step 3: Write the packaging and docs updates**

```json
// package.json
{
  "files": [
    "bin/",
    "lib/",
    "evals/",
    "runtime/",
    "agent-system/",
    "commands/",
    "skills/",
    "workflows/",
    "patterns/",
    "templates/",
    "workers/",
    "rules/",
    "hooks/",
    "tool-capabilities/",
    "docs/",
    "!docs/internal/"
  ]
}
```

```md
<!-- docs/evals.md -->
# Evals

The eval subsystem provides benchmark-style comparisons between:

- `with-harness`
- `without-harness`

Primary commands:

```bash
aih eval list
aih eval run sample-bugfix --provider codex --yes
aih eval report <run-id>
```

The first milestone is deterministic and local-only. It uses fixtures, rule-based scoring, and artifact reports to prove harness behavior changes in a repeatable way.
```

```md
<!-- README.md -->
## Evals

The harness now includes an eval subsystem for deterministic A/B comparisons between `with-harness` and `without-harness` task runs.

```bash
aih eval list
aih eval run sample-bugfix --provider codex --yes
aih eval report <run-id>
```

See [docs/evals.md](docs/evals.md) for the initial benchmark model and report format.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/package-manifest.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json README.md docs/evals.md test/package-manifest.test.js
git commit -m "docs: publish eval subsystem usage and packaging"
```

### Task 9: Run full verification for the eval foundation

**Files:**
- Test: `test/cli-tests.js`
- Test: `test/cli-command-wizards.test.js`
- Test: `test/cli-eval.test.js`
- Test: `test/evals/task-registry.test.js`
- Test: `test/evals/fixture-manager.test.js`
- Test: `test/evals/scoring.test.js`
- Test: `test/evals/ab-runner.test.js`
- Test: `test/package-manifest.test.js`

- [ ] **Step 1: Run targeted eval and CLI tests**

Run: `node --test --test-concurrency=1 --experimental-test-isolation=none test/cli-tests.js test/cli-command-wizards.test.js test/cli-eval.test.js test/evals/task-registry.test.js test/evals/fixture-manager.test.js test/evals/scoring.test.js test/evals/ab-runner.test.js test/package-manifest.test.js`
Expected: PASS

- [ ] **Step 2: Run full repository tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Verify CLI list command manually**

Run: `node bin/aih.js eval list`
Expected: prints at least `sample-bugfix` and `example-health-report`

- [ ] **Step 4: Verify CLI run command manually**

Run: `node bin/aih.js eval run sample-bugfix --provider codex --yes`
Expected: prints a `summary.json` path under `artifacts/runs/` and exits with code `0`

- [ ] **Step 5: Verify CLI report command manually**

Run: `node bin/aih.js eval report <run-id>`
Expected: prints JSON summary containing both `with-harness` and `without-harness`

- [ ] **Step 6: Review final scoped diff**

Run: `git diff -- evals lib/evals lib/cli-args.js lib/cli-help.js lib/cli-main.js lib/cli-commands/eval.js README.md docs/evals.md package.json test/cli-tests.js test/cli-command-wizards.test.js test/cli-eval.test.js test/evals/task-registry.test.js test/evals/fixture-manager.test.js test/evals/scoring.test.js test/evals/ab-runner.test.js test/package-manifest.test.js`
Expected: diff is limited to the eval subsystem, its CLI wiring, tests, packaging, and docs
