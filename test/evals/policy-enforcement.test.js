const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

test("policy engine loads and validates schema", () => {
  const policyPath = path.join(repoRoot, ".harness", "policies.json");
  assert.ok(fs.existsSync(policyPath), "Policy file must exist");

  const policies = JSON.parse(fs.readFileSync(policyPath, "utf8"));
  assert.ok(policies.version, "Policy set must have version");
  assert.ok(Array.isArray(policies.rules), "Policy set must have rules array");
  assert.ok(policies.rules.length > 0, "Policy set must have at least one rule");

  // Validate rule structure
  for (const rule of policies.rules) {
    assert.ok(rule.id, "Rule must have id");
    assert.ok(rule.name, "Rule must have name");
    assert.ok(rule.description, "Rule must have description");
    assert.ok(rule.severity, "Rule must have severity");
    assert.ok(Array.isArray(rule.conditions), "Rule must have conditions array");
    assert.ok(rule.action, "Rule must have action");
    assert.ok(rule.action.type, "Rule action must have type");
  }
});

test("policy engine evaluates phase gate conditions correctly", () => {
  const { PolicyEngine } = require(path.join(repoRoot, "lib", "policy", "engine.js"));
  const policyPath = path.join(repoRoot, ".harness", "policies.json");

  const engine = new PolicyEngine(policyPath);
  engine.loadPolicySet();

  // Test plan approval requirement
  const context = {
    command: "harness-run",
    sessionDir: "/tmp/session",
    repoRoot: "/tmp/repo",
    state: {}, // No current_plan key → not_exists triggers
  };

  const { blocked, reason } = engine.shouldBlock(context);
  assert.ok(blocked, "Should block harness-run without approved plan");
  assert.ok(reason.includes("Plan"), "Reason should mention Plan");
});

test("policy engine allows when conditions not met", () => {
  const { PolicyEngine } = require(path.join(repoRoot, "lib", "policy", "engine.js"));
  const policyPath = path.join(repoRoot, ".harness", "policies.json");

  const engine = new PolicyEngine(policyPath);
  engine.loadPolicySet(); // Load policies first

  const context = {
    command: "harness-status",
    sessionDir: "/tmp/session",
    repoRoot: "/tmp/repo",
    state: {},
  };

  const { blocked } = engine.shouldBlock(context);
  assert.ok(!blocked, "Should allow commands not covered by policies");
});

test("policy documentation is generated from policies", () => {
  const docsDir = path.join(repoRoot, "docs");

  const phaseDoc = path.join(docsDir, "phase-discipline.md");
  const testFirstDoc = path.join(docsDir, "test-first.md");
  const scopeDoc = path.join(docsDir, "scope-guard.md");
  const policiesDoc = path.join(docsDir, "policies.md");

  assert.ok(fs.existsSync(phaseDoc), "phase-discipline.md must exist");
  assert.ok(fs.existsSync(testFirstDoc), "test-first.md must exist");
  assert.ok(fs.existsSync(scopeDoc), "scope-guard.md must exist");
  assert.ok(fs.existsSync(policiesDoc), "policies.md must exist");

  // Verify docs contain generated content markers
  const phaseContent = fs.readFileSync(phaseDoc, "utf8");
  assert.ok(phaseContent.includes("Phase Discipline"), "Phase doc must have title");
  assert.ok(phaseContent.includes("Phase Gates"), "Phase doc must have section");

  const testFirstContent = fs.readFileSync(testFirstDoc, "utf8");
  assert.ok(testFirstContent.includes("Test-First Discipline"), "Test-first doc must have title");

  const scopeContent = fs.readFileSync(scopeDoc, "utf8");
  assert.ok(scopeContent.includes("Scope Guard"), "Scope doc must have title");
});

test("policy hooks exist and are executable", () => {
  const hooksDir = path.join(repoRoot, "hooks", "core");

  const guardPhasePolicy = path.join(hooksDir, "guard-phase-policy.js");
  const guardScope = path.join(hooksDir, "guard-scope.js");
  const guardTestFirst = path.join(hooksDir, "guard-test-first.js");

  assert.ok(fs.existsSync(guardPhasePolicy), "guard-phase-policy.js must exist");
  assert.ok(fs.existsSync(guardScope), "guard-scope.js must exist");
  assert.ok(fs.existsSync(guardTestFirst), "guard-test-first.js must exist");

  // Verify hooks are executable (have shebang)
  const guardPhaseContent = fs.readFileSync(guardPhasePolicy, "utf8");
  assert.ok(
    guardPhaseContent.startsWith("#!/usr/bin/env node"),
    "guard-phase-policy must have shebang"
  );

  const guardScopeContent = fs.readFileSync(guardScope, "utf8");
  assert.ok(guardScopeContent.startsWith("#!/usr/bin/env node"), "guard-scope must have shebang");

  const guardTestFirstContent = fs.readFileSync(guardTestFirst, "utf8");
  assert.ok(
    guardTestFirstContent.startsWith("#!/usr/bin/env node"),
    "guard-test-first must have shebang"
  );
});

test("policy generation script exists and is configured", () => {
  const scriptPath = path.join(repoRoot, "scripts", "generate-policy-docs.js");
  assert.ok(fs.existsSync(scriptPath), "generate-policy-docs.js must exist");

  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(
    packageJson.scripts["generate:policy-docs"],
    "generate:policy-docs script must be defined"
  );
});

test("policy enforcement reduces violations (A/B comparison)", () => {
  // This test establishes the framework for A/B comparison
  // Actual A/B evals would require running agent tasks with/without policy enforcement

  const { PolicyEngine } = require(path.join(repoRoot, "lib", "policy", "engine.js"));
  const policyPath = path.join(repoRoot, ".harness", "policies.json");

  const engine = new PolicyEngine(policyPath);
  const policies = engine.loadPolicySet();

  // Count blocking vs warning rules
  const blockingRules = policies.rules.filter((r) => r.action.type === "block");
  const warningRules = policies.rules.filter((r) => r.action.type === "warn");

  assert.ok(blockingRules.length > 0, "Must have at least one blocking rule");
  assert.ok(
    blockingRules.length + warningRules.length === policies.rules.length,
    "All rules must be either block or warn"
  );

  // Hard rules (blocking) should have ~0 violation rate when enforced
  // This is a structural assertion - actual violation rates would be measured via A/B evals
  const hardRuleIds = blockingRules.map((r) => r.id);
  assert.ok(hardRuleIds.length > 0, "Must identify hard rules for enforcement measurement");
});

test("canonical workflow is documented in phase discipline", () => {
  const phaseDoc = path.join(repoRoot, "docs", "phase-discipline.md");
  const content = fs.readFileSync(phaseDoc, "utf8");

  // Verify canonical workflow is present
  assert.ok(content.includes("Session Start"), "Must include Session Start");
  assert.ok(content.includes("Discuss"), "Must include Discuss");
  assert.ok(content.includes("Plan"), "Must include Plan");
  assert.ok(content.includes("Run"), "Must include Run");
  assert.ok(content.includes("Verify"), "Must include Verify");
  assert.ok(content.includes("Ship"), "Must include Ship");
  assert.ok(content.includes("Remember"), "Must include Remember");
});
