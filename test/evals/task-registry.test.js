const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const { formatTaskList, loadRegistry, validateTaskManifest } = require(
  path.join(repoRoot, "dist", "features", "eval", "domain", "task-registry.js")
);
const { listTasks } = require(path.join(repoRoot, "dist", "features", "eval", "index.js"));

test("loadRegistry returns task manifests with ids, fixtures, and checks", () => {
  const registry = loadRegistry(repoRoot);
  assert.equal(registry.tasks.length, 31);
  assert.ok(registry.tasks.some((task) => task.id === "sample-divide"));
  assert.ok(registry.tasks.some((task) => task.id === "sample-plan-md"));
  assert.ok(registry.tasks.some((task) => task.id === "sample-multiply"));
  assert.ok(registry.tasks.some((task) => task.id === "sample-report-md"));
  assert.ok(registry.tasks.some((task) => task.id === "sample-verify-conformance"));

  const bugfix = registry.tasks.find((task) => task.id === "sample-bugfix");
  assert.ok(bugfix);
  assert.equal(bugfix.fixture.path, "evals/fixtures/sample-bugfix");
  assert.equal(bugfix.mode, "bugfix");
  assert.ok(Array.isArray(bugfix.successChecks));
  assert.ok(Array.isArray(bugfix.behaviorChecks));
  assert.deepEqual(bugfix.tags, ["sample", "bugfix", "deterministic", "node"]);
});

test("validateTaskManifest rejects manifests without required fields", () => {
  assert.throws(() => validateTaskManifest({ id: "bad-task" }), /Missing required task field/);
});

test("formatTaskList returns task ids, titles, and modes", () => {
  const registry = loadRegistry(repoRoot);
  const output = formatTaskList(registry);

  assert.match(output, /sample-bugfix/);
  assert.match(output, /example-health-report/);
  assert.match(output, /Fix the broken add\(\) helper/);
  assert.match(output, /workflow-discipline/);
  assert.match(output, /sample-verify-conformance/);
});

test("listTasks returns registry and formatted output through the public boundary", () => {
  const result = listTasks(repoRoot);

  assert.ok(result);
  assert.ok(result.registry);
  assert.ok(Array.isArray(result.registry.tasks));
  assert.equal(typeof result.output, "string");
  assert.equal(result.registry.tasks.length, 31);
  assert.match(
    result.output,
    /^example-health-report \| Produce a concise health report from repo context \| workflow-discipline/m
  );
  assert.match(result.output, /^sample-bugfix \| Fix the broken add\(\) helper \| bugfix/m);
  assert.match(
    result.output,
    /^sample-report-md \| Produce REPORT\.md with status evidence \| workflow-discipline/m
  );
  assert.match(
    result.output,
    /^sample-verify-conformance \| Produce VERIFY\.md with concrete evidence and no boilerplate \| workflow-discipline/m
  );
});

test("verify conformance checker accepts concrete output and rejects boilerplate", () => {
  const tmpDir = fs.mkdtempSync(path.join(require("node:os").tmpdir(), "aih-verify-conformance-"));
  const script = path.join(
    repoRoot,
    "evals",
    "fixtures",
    "sample-verify-md",
    "check-conformance.js"
  );

  fs.writeFileSync(
    path.join(tmpDir, "VERIFY.md"),
    ["Status: passed", "Evidence: node bin/validate.js -> exit 0", "Known Gaps: none"].join("\n")
  );

  const passResult = childProcess.spawnSync(process.execPath, [script, "VERIFY.md"], {
    cwd: tmpDir,
    encoding: "utf8",
  });
  assert.equal(passResult.status, 0, passResult.stderr || passResult.stdout);

  fs.writeFileSync(
    path.join(tmpDir, "VERIFY.md"),
    ["Status: passed", "Evidence: follows the Output Contract", "Known Gaps: none"].join("\n")
  );

  const failResult = childProcess.spawnSync(process.execPath, [script, "VERIFY.md"], {
    cwd: tmpDir,
    encoding: "utf8",
  });
  assert.notEqual(failResult.status, 0);
});
