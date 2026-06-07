/**
 * Policy-to-Markdown Generator
 *
 * Generates documentation from policy definitions, making policy the single source of truth.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  PolicySet,
  PolicyRule,
  PolicyCondition,
  PolicyAction,
  PolicyConditionType,
  PolicyOperator,
  PolicyActionType,
} from "./schema";

export function generatePolicyDocs(policies: PolicySet): string {
  const sections: string[] = [];

  sections.push(`# Policy Documentation`);
  sections.push(``);
  sections.push(`**Version:** ${policies.version}`);
  sections.push(`**Total Rules:** ${policies.rules.length}`);
  sections.push(``);
  sections.push(
    `This documentation is automatically generated from \`.harness/policies.json\`. Do not edit manually.`
  );
  sections.push(``);

  // Group rules by category
  const phaseGateRules = policies.rules.filter((r) => r.id.startsWith("phase-gate"));
  const testFirstRules = policies.rules.filter((r) => r.id.includes("test-first"));
  const scopeRules = policies.rules.filter((r) => r.id.includes("scope"));
  const otherRules = policies.rules.filter(
    (r) => !r.id.startsWith("phase-gate") && !r.id.includes("test-first") && !r.id.includes("scope")
  );

  if (phaseGateRules.length > 0) {
    sections.push(`## Phase Gate Policies`);
    sections.push(``);
    sections.push(phaseGateRules.map(generateRuleMarkdown).join("\n\n"));
  }

  if (testFirstRules.length > 0) {
    sections.push(`## Test-First Policies`);
    sections.push(``);
    sections.push(testFirstRules.map(generateRuleMarkdown).join("\n\n"));
  }

  if (scopeRules.length > 0) {
    sections.push(`## Scope Guard Policies`);
    sections.push(``);
    sections.push(scopeRules.map(generateRuleMarkdown).join("\n\n"));
  }

  if (otherRules.length > 0) {
    sections.push(`## Other Policies`);
    sections.push(``);
    sections.push(otherRules.map(generateRuleMarkdown).join("\n\n"));
  }

  return sections.join("\n");
}

export function generateRuleMarkdown(rule: PolicyRule): string {
  const lines: string[] = [];

  lines.push(`### ${rule.name}`);
  lines.push(``);
  lines.push(`**ID:** \`${rule.id}\``);
  lines.push(`**Severity:** ${rule.severity}`);
  lines.push(``);
  lines.push(rule.description);
  lines.push(``);

  lines.push(`#### Conditions`);
  lines.push(``);
  lines.push(`| Type | Operator | Value |`);
  lines.push(`|------|----------|-------|`);
  for (const condition of rule.conditions) {
    const value = typeof condition.value === "string" ? condition.value : condition.value.source;
    lines.push(`| ${condition.type} | ${condition.operator} | \`${value}\` |`);
  }
  lines.push(``);

  lines.push(`#### Action`);
  lines.push(``);
  lines.push(`**Type:** ${rule.action.type}`);
  lines.push(`**Message:** ${rule.action.message}`);
  if (rule.action.nextCommand) {
    lines.push(`**Next Command:** \`${rule.action.nextCommand}\``);
  }
  if (rule.action.questions && rule.action.questions.length > 0) {
    lines.push(`**Questions:**`);
    for (const question of rule.action.questions) {
      lines.push(`- ${question}`);
    }
  }
  lines.push(``);

  return lines.join("\n");
}

export function generatePhaseDisciplineDoc(policies: PolicySet): string {
  const phaseRules = policies.rules.filter((r) => r.id.startsWith("phase-gate"));

  const lines: string[] = [];
  lines.push(`# Phase Discipline`);
  lines.push(``);
  lines.push(
    `Phase discipline ensures that work progresses through a structured workflow: Session Start → Discuss → Plan → Run → Verify → Ship → Remember.`
  );
  lines.push(
    `Each phase has specific requirements that must be met before proceeding to the next.`
  );
  lines.push(``);
  lines.push(`## Phase Gates`);
  lines.push(``);

  for (const rule of phaseRules) {
    lines.push(`### ${rule.name}`);
    lines.push(``);
    lines.push(rule.description);
    lines.push(``);
    lines.push(
      `**When enforced:** ${rule.conditions.map((c) => `${c.type} ${c.operator} ${c.value}`).join(" AND ")}`
    );
    lines.push(`**Action:** ${rule.action.type} - ${rule.action.message}`);
    if (rule.action.nextCommand) {
      lines.push(`**Next step:** Run \`${rule.action.nextCommand}\``);
    }
    lines.push(``);
  }

  lines.push(`## Workflow`);
  lines.push(``);
  lines.push(`1. **Session Start**: Establish session state and active goal`);
  lines.push(`2. **Discuss Phase**: Clarify requirements and scope`);
  lines.push(`3. **Plan Phase**: Create and approve a plan in PLAN.md`);
  lines.push(`4. **Run Phase**: Implement according to the approved plan`);
  lines.push(`5. **Verify Phase**: Collect evidence and run verification checks`);
  lines.push(`6. **Ship Phase**: Ship only when verification passes`);
  lines.push(`7. **Remember Phase**: Capture lessons and update memory`);
  lines.push(``);

  return lines.join("\n");
}

export function generateTestFirstDoc(policies: PolicySet): string {
  const testRules = policies.rules.filter((r) => r.id.includes("test-first"));

  const lines: string[] = [];
  lines.push(`# Test-First Discipline`);
  lines.push(``);
  lines.push(
    `Test-first discipline ensures that code changes are validated by tests before implementation.`
  );
  lines.push(``);
  lines.push(`## Policy`);
  lines.push(``);

  for (const rule of testRules) {
    lines.push(`### ${rule.name}`);
    lines.push(``);
    lines.push(rule.description);
    lines.push(``);
    lines.push(
      `**When enforced:** ${rule.conditions.map((c) => `${c.type} ${c.operator} ${c.value}`).join(" AND ")}`
    );
    lines.push(`**Action:** ${rule.action.type} - ${rule.action.message}`);
    lines.push(``);
  }

  lines.push(`## Requirements`);
  lines.push(``);
  lines.push(`1. Create or update test file before editing source code`);
  lines.push(`2. Test file must have a failing assertion (test should fail initially)`);
  lines.push(`3. Implement the feature to make the test pass`);
  lines.push(`4. Run tests to verify the implementation`);
  lines.push(``);

  return lines.join("\n");
}

export function generateScopeGuardDoc(policies: PolicySet): string {
  const scopeRules = policies.rules.filter((r) => r.id.includes("scope"));

  const lines: string[] = [];
  lines.push(`# Scope Guard`);
  lines.push(``);
  lines.push(
    `Scope guard ensures that edits stay within the approved scope defined in the goal or plan.`
  );
  lines.push(``);
  lines.push(`## Policy`);
  lines.push(``);

  if (scopeRules.length === 0) {
    lines.push(`No default scope-guard rule is enabled.`);
    lines.push(
      `Add a custom scope policy in \`.harness/policies.json\` when a repository needs it.`
    );
    lines.push(``);
  } else {
    for (const rule of scopeRules) {
      lines.push(`### ${rule.name}`);
      lines.push(``);
      lines.push(rule.description);
      lines.push(``);
      lines.push(
        `**When enforced:** ${rule.conditions.map((c) => `${c.type} ${c.operator} ${c.value}`).join(" AND ")}`
      );
      lines.push(`**Action:** ${rule.action.type} - ${rule.action.message}`);
      lines.push(``);
    }
  }

  lines.push(`## Scope Definition`);
  lines.push(``);
  lines.push(`Scope is defined by files referenced in:`);
  lines.push(`- GOAL.md: Files mentioned in the goal description`);
  lines.push(`- PLAN.md: Files listed in the implementation plan`);
  lines.push(``);
  lines.push(`## Enforcement`);
  lines.push(``);
  lines.push(`- Edits to files outside the defined scope will be blocked or warned`);
  lines.push(`- If no scope is defined, all edits are allowed (conservative)`);
  lines.push(``);

  return lines.join("\n");
}

export function updateWorkflowDocs(policies: PolicySet, repoRoot: string): void {
  const docsDir = path.join(repoRoot, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate individual discipline docs
  const phaseDoc = generatePhaseDisciplineDoc(policies);
  const testFirstDoc = generateTestFirstDoc(policies);
  const scopeDoc = generateScopeGuardDoc(policies);

  // Write docs
  fs.writeFileSync(path.join(docsDir, "phase-discipline.md"), phaseDoc, "utf8");
  fs.writeFileSync(path.join(docsDir, "test-first.md"), testFirstDoc, "utf8");
  fs.writeFileSync(path.join(docsDir, "scope-guard.md"), scopeDoc, "utf8");

  // Generate comprehensive policy doc
  const policyDoc = generatePolicyDocs(policies);
  fs.writeFileSync(path.join(docsDir, "policies.md"), policyDoc, "utf8");
}

export function regenerateDocsFromPolicy(repoRoot: string, policyPath?: string): void {
  const policyFile = policyPath || path.join(repoRoot, ".harness", "policies.json");

  if (!fs.existsSync(policyFile)) {
    throw new Error(`Policy file not found: ${policyFile}`);
  }

  const content = fs.readFileSync(policyFile, "utf8");
  const policies = JSON.parse(content) as PolicySet;

  updateWorkflowDocs(policies, repoRoot);
}
