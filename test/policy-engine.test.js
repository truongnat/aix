const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { PolicyEngine } = require(
  path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
);

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

/* ── Additional coverage ────────────────────────────────────────────── */

test("globToRegExp matches exact filename", () => {
  const re = PolicyEngine.globToRegExp("foo.txt");
  assert.ok(re.test("foo.txt"));
  assert.ok(!re.test("bar.txt"));
});

test("globToRegExp single * matches within one segment", () => {
  const re = PolicyEngine.globToRegExp("src/*.ts");
  assert.ok(re.test("src/foo.ts"));
  assert.ok(!re.test("src/sub/foo.ts"));
});

test("globToRegExp ** matches across segments", () => {
  const re = PolicyEngine.globToRegExp("src/**/*.ts");
  assert.ok(re.test("src/a/b/c.ts"));
  // src/x.ts does not match because ** / * requires at least one path separator
  assert.ok(!re.test("src/x.ts"));
  assert.ok(re.test("src/sub/x.ts"));
});

test("compileRegex caches and reuses compiled patterns", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "command", operator: "matches", value: "^install$" }],
    action: { type: "block", message: "blocked" },
  });
  const ctx = { command: "install", sessionDir: "", repoRoot: "" };
  const r1 = engine.evaluate(rule, ctx);
  const r2 = engine.evaluate(rule, ctx);
  assert.equal(r1.type, "block");
  assert.equal(r2.type, "block");
});

test("compileRegex throws when pattern exceeds max length (1000 chars)", () => {
  const engine = new PolicyEngine("/nonexistent");
  const longPattern = "a".repeat(1001);
  const rule = makeRule({
    conditions: [{ type: "command", operator: "matches", value: longPattern }],
    action: { type: "block", message: "blocked" },
  });
  assert.throws(
    () => engine.evaluate(rule, { command: "x", sessionDir: "", repoRoot: "" }),
    /Regex pattern too long/
  );
});

test("loadPolicySet throws when file not found", () => {
  const engine = new PolicyEngine("/nonexistent/missing.json");
  assert.throws(() => engine.loadPolicySet(), /Policy file not found/);
});

test("loadPolicySet throws on invalid JSON", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-pe-badjson-"));
  const filePath = path.join(tempRoot, "bad.json");
  fs.writeFileSync(filePath, "NOT JSON!!!");
  const engine = new PolicyEngine(filePath);
  assert.throws(() => engine.loadPolicySet());
  fs.rmSync(tempRoot, { recursive: true, force: true });
});

test("evaluateCondition: file_pattern exists matches glob", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "file_pattern", operator: "exists", value: "src/**/*.ts" }],
    action: { type: "block", message: "ts found" },
  });
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", files: ["src/a/b.ts"] })
      .type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", files: ["readme.md"] }).type,
    "allow"
  );
});

test("evaluateCondition: file_pattern not_exists returns true when no files match", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "file_pattern", operator: "not_exists", value: "*.secret" }],
    action: { type: "block", message: "no secrets" },
  });
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", files: ["app.ts"] }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", files: ["keys.secret"] })
      .type,
    "allow"
  );
});

test("evaluateCondition: phase equals matches current phase", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "phase", operator: "equals", value: "deploy" }],
    action: { type: "block", message: "deploy phase" },
  });
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "deploy" })
      .type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "build" })
      .type,
    "allow"
  );
});

test("evaluateCondition: phase matches uses regex", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "phase", operator: "matches", value: "^deploy" }],
    action: { type: "block", message: "deploy-ish" },
  });
  assert.equal(
    engine.evaluate(rule, {
      command: "",
      sessionDir: "",
      repoRoot: "",
      currentPhase: "deploy-prod",
    }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "build" })
      .type,
    "allow"
  );
});

test("evaluateCondition: phase exists and not_exists", () => {
  const engine = new PolicyEngine("/nonexistent");
  const existsRule = makeRule({
    conditions: [{ type: "phase", operator: "exists", value: "" }],
    action: { type: "block", message: "has phase" },
  });
  const notExistsRule = makeRule({
    conditions: [{ type: "phase", operator: "not_exists", value: "" }],
    action: { type: "block", message: "no phase" },
  });
  assert.equal(
    engine.evaluate(existsRule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "x" })
      .type,
    "block"
  );
  assert.equal(
    engine.evaluate(existsRule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "" })
      .type,
    "allow"
  );
  assert.equal(
    engine.evaluate(notExistsRule, { command: "", sessionDir: "", repoRoot: "", currentPhase: "" })
      .type,
    "block"
  );
});

test("evaluateCondition: command equals matches exact command", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "command", operator: "equals", value: "install" }],
    action: { type: "block", message: "blocked" },
  });
  assert.equal(
    engine.evaluate(rule, { command: "install", sessionDir: "", repoRoot: "" }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "update", sessionDir: "", repoRoot: "" }).type,
    "allow"
  );
});

test("evaluateCondition: command matches uses regex", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "command", operator: "matches", value: "^(install|update)$" }],
    action: { type: "block", message: "blocked" },
  });
  assert.equal(
    engine.evaluate(rule, { command: "install", sessionDir: "", repoRoot: "" }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "status", sessionDir: "", repoRoot: "" }).type,
    "allow"
  );
});

test("evaluateCondition: state exists and not_exists", () => {
  const engine = new PolicyEngine("/nonexistent");
  const existsRule = makeRule({
    conditions: [{ type: "state", operator: "exists", value: "env" }],
    action: { type: "block", message: "has env" },
  });
  const notExistsRule = makeRule({
    conditions: [{ type: "state", operator: "not_exists", value: "env" }],
    action: { type: "block", message: "no env" },
  });
  assert.equal(
    engine.evaluate(existsRule, { command: "", sessionDir: "", repoRoot: "", state: { env: "x" } })
      .type,
    "block"
  );
  assert.equal(
    engine.evaluate(existsRule, { command: "", sessionDir: "", repoRoot: "", state: {} }).type,
    "allow"
  );
  assert.equal(
    engine.evaluate(notExistsRule, { command: "", sessionDir: "", repoRoot: "", state: {} }).type,
    "block"
  );
});

test("evaluateCondition: state equals matches key:value", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditions: [{ type: "state", operator: "equals", value: "env:production" }],
    action: { type: "block", message: "prod" },
  });
  assert.equal(
    engine.evaluate(rule, {
      command: "",
      sessionDir: "",
      repoRoot: "",
      state: { env: "production" },
    }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, { command: "", sessionDir: "", repoRoot: "", state: { env: "staging" } })
      .type,
    "allow"
  );
});

test("conditionLogic and requires all conditions", () => {
  const engine = new PolicyEngine("/nonexistent");
  const rule = makeRule({
    conditionLogic: "and",
    conditions: [
      { type: "command", operator: "equals", value: "deploy" },
      { type: "phase", operator: "equals", value: "production" },
    ],
    action: { type: "block", message: "blocked" },
  });
  assert.equal(
    engine.evaluate(rule, {
      command: "deploy",
      sessionDir: "",
      repoRoot: "",
      currentPhase: "production",
    }).type,
    "block"
  );
  assert.equal(
    engine.evaluate(rule, {
      command: "deploy",
      sessionDir: "",
      repoRoot: "",
      currentPhase: "staging",
    }).type,
    "allow"
  );
});
