const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { PolicyEngine } = require(path.join(repoRoot, "dist", "lib", "policy", "engine.js"));

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function makePolicyFile(policySet) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-policy-engine-"));
  const policyPath = path.join(tempRoot, "policies.json");
  writeJson(policyPath, policySet);
  return { tempRoot, policyPath };
}

function makeRule(overrides = {}) {
  return {
    id: "rule-1",
    name: "Rule 1",
    description: "test rule",
    severity: "warning",
    conditions: [{ type: "command", operator: "equals", value: "harness-run" }],
    action: { type: "warn", message: "warn message" },
    ...overrides,
  };
}

test("globToRegExp escapes regex metacharacters and supports ? wildcards", () => {
  const regex = PolicyEngine.globToRegExp("lib/file?.test.ts");

  assert.ok(regex.test("lib/file1.test.ts"));
  assert.ok(regex.test("lib/fileA.test.ts"));
  assert.ok(!regex.test("lib/file12.test.ts"));
  assert.ok(!regex.test("lib/file1Xtest.ts"));
});

test("globToRegExp treats literal regex syntax in glob input as plain text", () => {
  const regex = PolicyEngine.globToRegExp("docs/v1.0.[0-9].md");

  assert.ok(regex.test("docs/v1.0.[0-9].md"));
  assert.ok(!regex.test("docs/v1.0.1.md"));
});

test("loadPolicySet rejects invalid state matchers without key or pattern", () => {
  for (const [value, expected] of [
    [":approved", /missing state key/],
    ["current_plan:", /missing state regex pattern|missing regex pattern/],
  ]) {
    const { tempRoot, policyPath } = makePolicyFile({
      version: "1.0.0",
      rules: [
        makeRule({
          id: `invalid-state-${value.replace(/[^a-z]/gi, "") || "empty"}`,
          conditions: [{ type: "state", operator: "matches", value }],
          action: { type: "block", message: "blocked" },
        }),
      ],
    });

    const engine = new PolicyEngine(policyPath);
    assert.throws(() => engine.loadPolicySet(), expected);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("loadPolicySet rejects invalid state equals matchers without a value", () => {
  const { tempRoot, policyPath } = makePolicyFile({
    version: "1.0.0",
    rules: [
      makeRule({
        id: "invalid-state-equals",
        conditions: [{ type: "state", operator: "equals", value: "current_plan:" }],
        action: { type: "block", message: "blocked" },
      }),
    ],
  });

  const engine = new PolicyEngine(policyPath);
  assert.throws(() => engine.loadPolicySet(), /missing state value/);
  fs.rmSync(tempRoot, { recursive: true, force: true });
});

test("evaluate handles command exists and not_exists operators", () => {
  const engine = new PolicyEngine(path.join(repoRoot, ".harness", "policies.json"));
  const existsRule = makeRule({
    conditions: [{ type: "command", operator: "exists", value: "" }],
    action: { type: "block", message: "command required" },
  });
  const notExistsRule = makeRule({
    conditions: [{ type: "command", operator: "not_exists", value: "" }],
    action: { type: "block", message: "command must be empty" },
  });

  assert.equal(
    engine.evaluate(existsRule, { command: "harness-run", sessionDir: "", repoRoot: "" }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(notExistsRule, { command: "", sessionDir: "", repoRoot: "" }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(notExistsRule, { command: "harness-run", sessionDir: "", repoRoot: "" }).type,
    "allow"
  );
});

test("evaluate handles state matches and missing state values safely", () => {
  const engine = new PolicyEngine(path.join(repoRoot, ".harness", "policies.json"));
  const matchRule = makeRule({
    conditions: [{ type: "state", operator: "matches", value: "verify:^approved|passed$" }],
    action: { type: "block", message: "verify matched" },
  });

  assert.equal(
    engine.evaluate(matchRule, {
      command: "harness-ship",
      sessionDir: "",
      repoRoot: "",
      state: { verify: "approved" },
    }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(matchRule, {
      command: "harness-ship",
      sessionDir: "",
      repoRoot: "",
      state: {},
    }).type,
    "allow"
  );
});

test("evaluate preserves colons after the first separator in state comparisons", () => {
  const engine = new PolicyEngine(path.join(repoRoot, ".harness", "policies.json"));
  const matchRule = makeRule({
    conditions: [
      {
        type: "state",
        operator: "equals",
        value: "plan_content:https://example.com/checklist",
      },
    ],
    action: { type: "block", message: "full value matched" },
  });

  assert.equal(
    engine.evaluate(matchRule, {
      command: "harness-ship",
      sessionDir: "",
      repoRoot: "",
      state: { plan_content: "https://example.com/checklist" },
    }).type,
    "block"
  );
});

test("evaluate supports OR logic across rule conditions", () => {
  const engine = new PolicyEngine(path.join(repoRoot, ".harness", "policies.json"));
  const rule = makeRule({
    conditionLogic: "or",
    conditions: [
      { type: "command", operator: "equals", value: "harness-run" },
      { type: "phase", operator: "equals", value: "ship" },
    ],
    action: { type: "block", message: "matched via OR" },
  });

  assert.equal(
    engine.evaluate(rule, {
      command: "status",
      sessionDir: "",
      repoRoot: "",
      currentPhase: "ship",
    }).type,
    "block"
  );
});

test("shouldBlock preserves warning actions without blocking execution", () => {
  const { tempRoot, policyPath } = makePolicyFile({
    version: "1.0.0",
    rules: [
      makeRule({
        id: "warn-run",
        action: { type: "warn", message: "plan is stale" },
      }),
    ],
  });

  const engine = new PolicyEngine(policyPath);
  const result = engine.shouldBlock({
    command: "harness-run",
    sessionDir: "",
    repoRoot: "",
  });

  assert.equal(result.blocked, false);
  assert.equal(result.reason, "");
  assert.deepEqual(result.actions, [{ type: "warn", message: "plan is stale" }]);

  fs.rmSync(tempRoot, { recursive: true, force: true });
});

test("shouldBlock returns only blocking actions when both warn and block rules trigger", () => {
  const { tempRoot, policyPath } = makePolicyFile({
    version: "1.0.0",
    rules: [
      makeRule({
        id: "warn-run",
        action: { type: "warn", message: "warn first" },
      }),
      makeRule({
        id: "block-run",
        action: { type: "block", message: "block second", nextCommand: "harness-plan" },
      }),
    ],
  });

  const engine = new PolicyEngine(policyPath);
  const result = engine.shouldBlock({
    command: "harness-run",
    sessionDir: "",
    repoRoot: "",
  });

  assert.equal(result.blocked, true);
  assert.equal(result.reason, "block second");
  assert.deepEqual(result.actions, [
    { type: "block", message: "block second", nextCommand: "harness-plan" },
  ]);

  fs.rmSync(tempRoot, { recursive: true, force: true });
});
