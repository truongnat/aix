const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { formatTaskList, loadRegistry, validateTaskManifest } = require(
  path.join(repoRoot, "lib", "evals", "task-registry.js")
);
const { listTasks } = require(path.join(repoRoot, "lib", "evals", "index.js"));

test("loadRegistry returns task manifests with ids, fixtures, and checks", () => {
  const registry = loadRegistry(repoRoot);
  assert.ok(registry.tasks.length >= 5);
  assert.deepEqual(
    registry.tasks.map((task) => task.id),
    [
      "example-health-report",
      "sample-bugfix",
      "sample-config-patch",
      "sample-response-contract",
      "sample-string-trim",
    ]
  );

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
});

test("listTasks returns registry and formatted output through the public boundary", () => {
  const result = listTasks(repoRoot);

  assert.ok(result);
  assert.ok(result.registry);
  assert.ok(Array.isArray(result.registry.tasks));
  assert.equal(typeof result.output, "string");
  assert.deepEqual(
    result.registry.tasks.map((task) => task.id),
    [
      "example-health-report",
      "sample-bugfix",
      "sample-config-patch",
      "sample-response-contract",
      "sample-string-trim",
    ]
  );
  assert.match(
    result.output,
    /^example-health-report \| Produce a concise health report from repo context \| workflow-discipline/m
  );
  assert.match(result.output, /^sample-bugfix \| Fix the broken add\(\) helper \| bugfix/m);
});
