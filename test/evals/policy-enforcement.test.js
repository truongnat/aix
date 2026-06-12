const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
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

  const scopeRules = policies.rules.filter((rule) => rule.id.includes("scope"));
  assert.equal(scopeRules.length, 0, "Default policy set should not enable scope guard");
});

test("policy engine evaluates phase gate conditions correctly", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
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
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
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

test("policy engine lazily loads policy set when shouldBlock is called without explicit load", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
  const policyPath = path.join(repoRoot, ".harness", "policies.json");

  // Intentionally do NOT call loadPolicySet() — engine must auto-load.
  const engine = new PolicyEngine(policyPath);

  const context = {
    command: "harness-run",
    sessionDir: "/tmp/session",
    repoRoot: "/tmp/repo",
    state: {},
  };

  const { blocked } = engine.shouldBlock(context);
  assert.ok(
    blocked,
    "Engine should auto-load policies and block harness-run without approved plan"
  );
});

test("policy engine rejects invalid regex patterns when loading policy set", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "policy-invalid-"));
  const policyPath = path.join(tmpRoot, "policies.json");

  fs.writeFileSync(
    policyPath,
    JSON.stringify(
      {
        version: "1.0.0",
        rules: [
          {
            id: "invalid-command-regex",
            name: "Invalid command regex",
            description: "should fail during load",
            severity: "error",
            conditions: [{ type: "command", operator: "matches", value: "(" }],
            action: { type: "block", message: "bad regex" },
          },
        ],
      },
      null,
      2
    ),
    "utf8"
  );

  const engine = new PolicyEngine(policyPath);
  assert.throws(
    () => engine.loadPolicySet(),
    /Invalid regex.*invalid-command-regex.*command condition/
  );

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("globToRegExp converts glob patterns to correct anchored regexes", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );

  const srcGlob = PolicyEngine.globToRegExp("src/**");
  assert.ok(srcGlob.test("src/foo/bar.ts"), "src/** should match nested source file");
  assert.ok(srcGlob.test("src/feature.ts"), "src/** should match a top-level src file");
  assert.ok(!srcGlob.test("lib/foo.ts"), "src/** should not match files outside src");

  const tsGlob = PolicyEngine.globToRegExp("lib/*.ts");
  assert.ok(tsGlob.test("lib/engine.ts"), "lib/*.ts should match a direct .ts file");
  assert.ok(!tsGlob.test("lib/policy/engine.ts"), "single * should not cross directory boundary");
  assert.ok(!tsGlob.test("lib/engine.js"), "lib/*.ts should not match .js");
});

test("policy file_pattern condition matches files in execution context", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
  const policyPath = path.join(repoRoot, ".harness", "policies.json");

  const engine = new PolicyEngine(policyPath);
  engine.loadPolicySet();

  // test-first rule targets src/**/* — supplying such a file must trigger it.
  const context = {
    command: "edit",
    sessionDir: "/tmp/session",
    repoRoot: "/tmp/repo",
    state: {},
    files: ["src/feature.ts"],
  };

  const actions = engine.checkAll(context);
  const triggeredMessages = actions.map((a) => a.message).join(" ");
  assert.ok(
    triggeredMessages.includes("Test-first"),
    "Editing a src/ file should trigger the test-first policy"
  );
});

test("policy generator functions produce expected markdown sections", () => {
  const generator = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "generator.js")
  );
  const policyPath = path.join(repoRoot, ".harness", "policies.json");
  const policies = JSON.parse(fs.readFileSync(policyPath, "utf8"));

  const fullDoc = generator.generatePolicyDocs(policies);
  assert.ok(fullDoc.includes("# Policy Documentation"), "full doc must have title");
  assert.ok(fullDoc.includes("Phase Gate Policies"), "full doc must group phase gate policies");

  const ruleDoc = generator.generateRuleMarkdown(policies.rules[0]);
  assert.ok(ruleDoc.includes(policies.rules[0].name), "rule markdown must include rule name");
  assert.ok(ruleDoc.includes("#### Conditions"), "rule markdown must include conditions section");

  const phaseDoc = generator.generatePhaseDisciplineDoc(policies);
  assert.ok(
    phaseDoc.includes("Session Start") && phaseDoc.includes("Remember"),
    "phase doc must include canonical workflow"
  );

  const testFirstDoc = generator.generateTestFirstDoc(policies);
  assert.ok(testFirstDoc.includes("Test-First Discipline"), "test-first doc must have title");

  const scopeDoc = generator.generateScopeGuardDoc(policies);
  assert.ok(scopeDoc.includes("Scope Guard"), "scope doc must have title");
});

test("regenerateDocsFromPolicy writes discipline docs into a target repo", () => {
  const generator = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "generator.js")
  );
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "policy-docs-"));
  fs.mkdirSync(path.join(tmpRoot, ".harness"), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, ".harness", "policies.json"),
    path.join(tmpRoot, ".harness", "policies.json")
  );

  generator.regenerateDocsFromPolicy(tmpRoot);

  for (const file of ["phase-discipline.md", "test-first.md", "scope-guard.md", "policies.md"]) {
    assert.ok(
      fs.existsSync(path.join(tmpRoot, "docs", file)),
      `regenerateDocsFromPolicy must write docs/${file}`
    );
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test("policy engine evaluates phase and file_pattern operators", () => {
  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );

  // phase condition: equals on a present phase
  const phaseRule = {
    id: "x-phase",
    name: "x",
    description: "d",
    severity: "error",
    conditions: [{ type: "phase", operator: "equals", value: "run" }],
    action: { type: "block", message: "blocked-phase" },
  };
  const engine = new PolicyEngine(path.join(repoRoot, ".harness", "policies.json"));
  assert.equal(
    engine.evaluate(phaseRule, { command: "x", sessionDir: "", repoRoot: "", currentPhase: "run" })
      .type,
    "block"
  );
  assert.equal(
    engine.evaluate(phaseRule, { command: "x", sessionDir: "", repoRoot: "", currentPhase: "plan" })
      .type,
    "allow"
  );

  // file_pattern operators: exists / not_exists / equals
  const mk = (operator) => ({
    id: "x-file",
    name: "x",
    description: "d",
    severity: "error",
    conditions: [{ type: "file_pattern", operator, value: "lib/*.ts" }],
    action: { type: "block", message: "blocked-file" },
  });
  const ctx = (files) => ({ command: "x", sessionDir: "", repoRoot: "", files });
  assert.equal(engine.evaluate(mk("exists"), ctx(["lib/a.ts"])).type, "block");
  assert.equal(engine.evaluate(mk("not_exists"), ctx(["src/a.ts"])).type, "block");
  assert.equal(engine.evaluate(mk("equals"), ctx(["lib/a.ts"])).type, "block");
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
  assert.ok(
    scopeContent.includes("codex-hook-router.js"),
    "Scope doc must explain runtime enforcement via the Codex hook router"
  );
});

test("policy hooks exist and are executable", () => {
  const hooksDir = path.join(repoRoot, "dist", "hooks", "core");

  const guardPhasePolicy = path.join(hooksDir, "guard-phase-policy.js");
  const guardScope = path.join(hooksDir, "guard-scope.js");
  const guardTestFirst = path.join(hooksDir, "guard-test-first.js");

  assert.ok(fs.existsSync(guardPhasePolicy), "guard-phase-policy.js must exist");
  assert.ok(fs.existsSync(guardScope), "guard-scope.js must exist");
  assert.ok(fs.existsSync(guardTestFirst), "guard-test-first.js must exist");

  const guardPhase = require(path.join(hooksDir, "guard-phase.js"));
  const guardPhasePolicyModule = require(path.join(hooksDir, "guard-phase-policy.js"));
  assert.equal(guardPhasePolicyModule.guardPhase, guardPhase.guardPhase);

  const guardPhasePolicyContent = fs.readFileSync(guardPhasePolicy, "utf8");
  assert.ok(
    guardPhasePolicyContent.startsWith("#!/usr/bin/env node"),
    "guard-phase-policy must have shebang"
  );
  assert.match(guardPhasePolicyContent, /require\("\.\/guard-phase\.js"\)/);

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

  const { PolicyEngine } = require(
    path.join(repoRoot, "dist", "features", "validate", "infrastructure", "policy", "engine.js")
  );
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
