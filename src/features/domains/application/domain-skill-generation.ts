// Purpose: Generate domain skill surfaces into target repos
// Layer: application
// Depends on: shared/stack-detect, legacy codex bridge

import fs from "node:fs";
import path from "node:path";
import type { DomainId, StackScanResult } from "../../../shared/stack-detect";
import { DOMAIN_LABELS, normalizeDomainSelection } from "../../../shared/stack-detect";
import { legacyCodexRuleGeneration } from "../infrastructure/legacy-deps";
const { renderCodexRuleSet } = legacyCodexRuleGeneration;

interface WriteOptions {
  packRoot: string;
  targetAbs: string;
  dryRun: boolean;
  force: boolean;
}

interface WriteResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

const GENERATED_AGENTS_BLOCK_START =
  "<!-- ai-engineering-harness generated-domain-skills start -->";
const GENERATED_AGENTS_BLOCK_END = "<!-- ai-engineering-harness generated-domain-skills end -->";

interface DomainDefinition {
  id: DomainId;
  title: string;
  pack: string;
  summary: string;
  whenToUse: string[];
  whenNotToUse: string[];
  inputs: string[];
  workflow: string[];
  reasoning: string[];
  actionLoop: string[];
  examples: string[];
  outputContract: string[];
  checklist: string[];
  commonFailureModes: Array<{ failure: string; symptom: string; counter: string }>;
  commands: string[];
  checks: string[];
}

const DOMAIN_DEFINITIONS: Record<DomainId, DomainDefinition> = {
  frontend: {
    id: "frontend",
    title: "Frontend Domain Skill",
    pack: "frontend",
    summary: "Route UI, browser, and component work toward the right harness checks.",
    whenToUse: [
      "React, Next.js, Vue, Svelte, Angular, or browser-facing UI work",
      "responsive behavior, forms, accessibility, or visual regressions",
      "client-side state, component boundaries, or loading/error UX",
    ],
    whenNotToUse: [
      "backend-only APIs or persistence changes",
      "documentation-only work with no UI surface",
      "mobile or infrastructure tasks without browser UI impact",
    ],
    inputs: [
      "detected frontend stack signals",
      "target route or component",
      "design or issue context",
    ],
    workflow: [
      "identify the UI boundary and the affected route or component",
      "map the minimal file set before changing code",
      "select verification that covers interaction, accessibility, and layout",
      "update the selected pack references in `.harness/SKILLS.md`",
    ],
    reasoning: [
      "prefer the narrowest component or page that explains the visible issue",
      "separate loading, empty, success, and error states",
      "treat accessibility as correctness when interaction changes",
    ],
    actionLoop: [
      "inspect the component tree and related styles",
      "decide whether the change belongs in the frontend pack or a narrower skill",
      "implement the minimal user-visible fix",
      "verify responsive and accessible behavior",
    ],
    examples: [
      "Next.js page with form validation -> select frontend and verification skills",
      "broken keyboard focus on a dialog -> map, plan, run, and verify the component boundary",
    ],
    outputContract: [
      "record selected domains in `.harness/config.json` and `.harness/SKILLS.md`",
      "create `.harness/skills/frontend/SKILL.md` and `prompt.md` when the domain is selected",
    ],
    checklist: [
      "do not generate a frontend domain skill if the repository has no browser-facing surface",
      "do not override user domain selections without explicit confirmation",
    ],
    commonFailureModes: [
      {
        failure: "render-only verification",
        symptom: "the component appears in screenshots but interaction is broken",
        counter: "exercise the changed interaction path and record the result",
      },
      {
        failure: "layout regressions",
        symptom: "desktop works but mobile clips or overflows",
        counter: "check at least one narrow and one wide viewport when visuals change",
      },
    ],
    commands: ["harness-map", "harness-plan", "harness-run", "harness-verify"],
    checks: ["targeted UI tests", "responsive viewport check", "accessibility sanity check"],
  },
  backend: {
    id: "backend",
    title: "Backend Domain Skill",
    pack: "backend",
    summary: "Route API, service, and persistence work toward contract-safe checks.",
    whenToUse: [
      "API endpoints, request handling, business logic, or persistence changes",
      "auth boundaries, queues, jobs, and data consistency work",
      "service-side contract changes with side effects",
    ],
    whenNotToUse: [
      "UI-only work",
      "docs-only edits",
      "infrastructure changes without application logic",
    ],
    inputs: ["target service boundary", "expected contract change", "data or auth constraints"],
    workflow: [
      "map the affected handlers, services, and persistence boundary",
      "choose tests that exercise the contract instead of only happy paths",
      "treat migrations and idempotency as first-class verification items",
      "capture root cause and reusable commands after shipping",
    ],
    reasoning: [
      "start from the request/response contract and work inward",
      "verify durability and error handling where state changes",
      "prefer integration checks for boundaries that can drift silently",
    ],
    actionLoop: [
      "inspect the request path and storage boundary",
      "narrow the change set before implementation",
      "run focused contract or integration tests",
      "record any rollback or migration notes explicitly",
    ],
    examples: [
      "new API endpoint -> backend domain skill with migration and auth checks",
      "job queue bug -> backend domain skill with idempotency verification",
    ],
    outputContract: [
      "record selected backend signals in the project config and skills profile",
      "generate `.harness/skills/backend/` when selected",
    ],
    checklist: [
      "do not generate if the repository has no server-side signals",
      "do not skip migration or auth checks when the change crosses those boundaries",
    ],
    commonFailureModes: [
      {
        failure: "happy-path-only tests",
        symptom: "endpoint returns 200 but durable state is wrong",
        counter: "assert the persisted side effect directly",
      },
      {
        failure: "missing migration",
        symptom: "local dev passes but clean environment fails",
        counter: "test on a clean database or explicit migration state",
      },
    ],
    commands: ["harness-map", "harness-discuss", "harness-plan", "harness-verify"],
    checks: ["contract tests", "migration validation", "auth boundary checks"],
  },
  devops: {
    id: "devops",
    title: "DevOps Domain Skill",
    pack: "devops",
    summary: "Route CI, deployment, and infra changes toward environment-aware checks.",
    whenToUse: [
      "CI/CD changes, deployment config, Dockerfiles, or infra work",
      "observability or environment-sensitive changes",
      "release automation or rollback-path updates",
    ],
    whenNotToUse: [
      "feature code without deployment or infra implications",
      "documentation-only work",
    ],
    inputs: [
      "pipeline or environment target",
      "rollback expectations",
      "secrets and blast radius constraints",
    ],
    workflow: [
      "map the deployment path and affected environments",
      "run dry-run or config validation where possible",
      "verify the real consumer path, not just file syntax",
      "record rollback and health-check evidence",
    ],
    reasoning: [
      "assume environment drift until proven otherwise",
      "treat rollout and rollback as part of correctness",
      "prefer narrow changes that do not widen blast radius",
    ],
    actionLoop: [
      "inspect the deployment or pipeline surface",
      "validate the exact runner or environment config",
      "check health and logs after applying the change",
      "document the fallback path before shipping",
    ],
    examples: [
      "CI job tweak -> devops domain skill with pipeline validation",
      "Dockerfile change -> devops domain skill with build and smoke test",
    ],
    outputContract: [
      "record selected infra domains in config and skills profile",
      "generate `.harness/skills/devops/` when selected",
    ],
    checklist: [
      "do not claim success without environment-specific validation",
      "do not store secrets or access details in generated artifacts",
    ],
    commonFailureModes: [
      {
        failure: "config-only optimism",
        symptom: "pipeline passes syntax checks but deploy fails",
        counter: "exercise the consumer path or a dry-run equivalent",
      },
      {
        failure: "missing rollback",
        symptom: "change is not reversible in a hurry",
        counter: "write the rollback command or revert path down",
      },
    ],
    commands: ["harness-map", "harness-plan", "harness-run", "harness-verify", "harness-remember"],
    checks: ["pipeline validation", "build verification", "health check"],
  },
  mobile: {
    id: "mobile",
    title: "Mobile Domain Skill",
    pack: "mobile",
    summary: "Route native and cross-platform mobile work toward platform-aware checks.",
    whenToUse: [
      "Flutter, React Native, iOS, or Android work",
      "permissions, onboarding, offline, lifecycle, or navigation paths",
      "platform-specific code or UI regressions",
    ],
    whenNotToUse: ["backend-only work", "infrastructure-only work", "docs-only changes"],
    inputs: [
      "platform targets",
      "device or simulator constraints",
      "auth/offline/lifecycle behavior",
    ],
    workflow: [
      "map the affected platform surface",
      "prefer the smallest targeted test or flow that covers the change",
      "verify at least the affected platform paths",
      "record any device or simulator gaps explicitly",
    ],
    reasoning: [
      "platform paths diverge quickly, so verify the exact path that changed",
      "lifecycle and permissions are correctness issues, not later polish",
    ],
    actionLoop: [
      "inspect the mobile entrypoint and navigation flow",
      "narrow the changed screens or modules",
      "run targeted tests or device flows",
      "note any unverified platform gap before shipping",
    ],
    examples: [
      "offline login issue -> mobile domain skill with simulator verification",
      "navigation regression -> mobile domain skill with back-stack checks",
    ],
    outputContract: [
      "store selected mobile signals in config and the skills profile",
      "generate `.harness/skills/mobile/` when selected",
    ],
    checklist: [
      "do not generate if the repository has no mobile markers",
      "do not assume one platform proves the other",
    ],
    commonFailureModes: [
      {
        failure: "platform mismatch",
        symptom: "Android passes, iOS breaks or vice versa",
        counter: "check the affected platform explicitly",
      },
      {
        failure: "permission gap",
        symptom: "happy path works but denial path crashes",
        counter: "toggle permissions and verify the deny flow",
      },
    ],
    commands: ["harness-map", "harness-plan", "harness-run", "harness-verify"],
    checks: ["device/simulator flow", "navigation check", "lifecycle check"],
  },
  "data-ai": {
    id: "data-ai",
    title: "Data & AI Domain Skill",
    pack: "data-ai",
    summary: "Route data engineering, ML, and AI workflow work toward model-aware checks.",
    whenToUse: [
      "pandas, numpy, scikit-learn, torch, tensorflow, langchain, or LLM workflow changes",
      "notebooks, pipelines, datasets, embeddings, or retrieval logic",
      "model evaluation or data transformation work",
    ],
    whenNotToUse: [
      "UI-only work",
      "plain backend CRUD with no data/AI aspect",
      "docs-only changes",
    ],
    inputs: ["dataset or model boundary", "evaluation criteria", "reproducibility constraints"],
    workflow: [
      "identify the dataset or model boundary",
      "prefer reproducible checks over ad hoc notebook inspection",
      "verify the transformation or evaluation path explicitly",
      "record any data quality or drift risks",
    ],
    reasoning: [
      "treat data shape and evaluation as the contract",
      "prefer deterministic fixtures when possible",
      "separate training, inference, and retrieval concerns",
    ],
    actionLoop: [
      "inspect the pipeline or notebook entrypoint",
      "narrow the changed transformation or inference step",
      "run reproducible data/model checks",
      "record reproducibility gaps and seeds",
    ],
    examples: [
      "RAG chain change -> data-ai domain skill with retrieval evaluation",
      "feature engineering tweak -> data-ai domain skill with reproducible dataset checks",
    ],
    outputContract: [
      "store selected data/AI signals in config and the skills profile",
      "generate `.harness/skills/data-ai/` when selected",
    ],
    checklist: [
      "do not generate if the repository has no data or model signals",
      "do not leave evaluation criteria implicit",
    ],
    commonFailureModes: [
      {
        failure: "non-reproducible notebook",
        symptom: "works once but cannot be rerun or reviewed",
        counter: "use deterministic scripts or saved notebooks with inputs",
      },
      {
        failure: "evaluation gap",
        symptom: "output looks plausible but quality is unmeasured",
        counter: "record the metric or rubric used to judge the result",
      },
    ],
    commands: ["harness-map", "harness-plan", "harness-run", "harness-verify"],
    checks: ["fixture-based data check", "reproducible model evaluation"],
  },
  security: {
    id: "security",
    title: "Security Domain Skill",
    pack: "security",
    summary: "Route auth, secrets, and security-sensitive changes toward threat-aware checks.",
    whenToUse: [
      "authentication, authorization, secrets handling, or policy logic",
      "sensitive data paths or security review changes",
      "security-sensitive libraries or external integrations",
    ],
    whenNotToUse: [
      "UI-only work",
      "docs-only changes",
      "generic feature work with no security boundary",
    ],
    inputs: [
      "threat model boundary",
      "secrets handling expectations",
      "policy or auth constraints",
    ],
    workflow: [
      "map the trust boundary first",
      "check how secrets and credentials move through the change",
      "verify denial paths, not just happy paths",
      "document any residual risk explicitly",
    ],
    reasoning: [
      "assume the weakest input is the one that matters",
      "check for leaks in logs, configs, and generated artifacts",
      "prefer deny-by-default behavior where possible",
    ],
    actionLoop: [
      "inspect the sensitive boundary and data flow",
      "narrow the change to the minimum necessary surface",
      "run boundary checks and negative tests",
      "record residual risk and escalation needs",
    ],
    examples: [
      "auth rule change -> security domain skill with deny-path checks",
      "secret-handling update -> security domain skill with log inspection",
    ],
    outputContract: [
      "store selected security signals in config and the skills profile",
      "generate `.harness/skills/security/` when selected",
    ],
    checklist: [
      "do not generate if no security or auth signals exist",
      "do not store secrets or private business data in generated files",
    ],
    commonFailureModes: [
      {
        failure: "happy-path auth test only",
        symptom: "unauthorized access still works in a bypass path",
        counter: "verify the deny path directly",
      },
      {
        failure: "secret leakage",
        symptom: "logs or generated files expose credentials",
        counter: "grep and inspect changed artifacts for sensitive values",
      },
    ],
    commands: ["harness-map", "harness-discuss", "harness-plan", "harness-verify"],
    checks: ["negative auth tests", "secret scan", "policy validation"],
  },
  cloud: {
    id: "cloud",
    title: "Cloud Domain Skill",
    pack: "cloud",
    summary: "Route provider and cloud-integration work toward environment-aware checks.",
    whenToUse: [
      "AWS, Azure, Cloudflare, GCP, serverless, or hosted integration changes",
      "cloud infrastructure, edge functions, or deployment topology work",
      "provider-specific configuration that can drift by environment",
    ],
    whenNotToUse: [
      "pure application logic",
      "docs-only work",
      "local-only changes with no cloud boundary",
    ],
    inputs: [
      "provider boundary",
      "deployment target",
      "environment variables or identity constraints",
    ],
    workflow: [
      "identify the cloud provider or hosting boundary",
      "verify the exact deployment consumer path",
      "check the environment-specific configuration",
      "record rollback and access assumptions",
    ],
    reasoning: [
      "treat provider configuration as a contract",
      "assume environment differences until proven otherwise",
      "prefer safe defaults and explicit credentials handling",
    ],
    actionLoop: [
      "inspect the cloud entrypoint or config",
      "narrow the affected service or deployment path",
      "run dry-runs or provider validation",
      "note environment-specific risks and fallbacks",
    ],
    examples: [
      "Cloudflare worker change -> cloud domain skill with deployment validation",
      "AWS SDK change -> cloud domain skill with region and credential checks",
    ],
    outputContract: [
      "store selected cloud signals in config and the skills profile",
      "generate `.harness/skills/cloud/` when selected",
    ],
    checklist: [
      "do not generate if no cloud or infrastructure markers exist",
      "do not hide provider-specific rollback assumptions",
    ],
    commonFailureModes: [
      {
        failure: "environment drift",
        symptom: "local config passes but cloud deploy fails",
        counter: "validate the exact provider consumer path",
      },
      {
        failure: "missing rollback",
        symptom: "a failed deploy cannot be reversed quickly",
        counter: "write the rollback or revert path in the plan",
      },
    ],
    commands: ["harness-map", "harness-plan", "harness-run", "harness-verify"],
    checks: ["dry-run deployment", "provider validation", "health check"],
  },
  debugging: {
    id: "debugging",
    title: "Debugging Domain Skill",
    pack: "debugging",
    summary: "Route bugs, flaky behavior, and regressions toward root-cause checks.",
    whenToUse: [
      "bug investigations, flaky tests, or regressions",
      "performance or correctness issues",
      "when diagnosis dominates implementation",
    ],
    whenNotToUse: ["feature work with no bug signal", "docs-only changes", "pure routing work"],
    inputs: ["failing repro", "symptom description", "relevant logs or tests"],
    workflow: [
      "reproduce the issue or isolate the failing check",
      "state one falsifiable hypothesis at a time",
      "confirm the root cause before applying the fix",
      "add regression coverage for the original failure",
    ],
    reasoning: [
      "symptom-only fixes are not durable",
      "the smallest reproducible failure is the best guide",
      "adjacent-flow checks matter after the fix",
    ],
    actionLoop: [
      "inspect the failing path and surrounding code",
      "narrow the hypothesis set",
      "run the targeted repro or test",
      "record the confirmed cause and the regression guard",
    ],
    examples: [
      "flaky integration test -> debugging domain skill with reproduction steps",
      "performance regression -> debugging domain skill with targeted benchmark",
    ],
    outputContract: [
      "store selected debugging signals in config and the skills profile",
      "generate `.harness/skills/debugging/` when selected",
    ],
    checklist: [
      "do not generate if there is no failing signal or debugging need",
      "do not ship a root-cause claim without evidence",
    ],
    commonFailureModes: [
      {
        failure: "symptom-only fix",
        symptom: "bug reappears in a nearby path",
        counter: "prove the root cause and check an adjacent flow",
      },
      {
        failure: "unreproduced bug",
        symptom: "fix lands without proof of failure",
        counter: "capture a failing test or reliable repro first when possible",
      },
    ],
    commands: [
      "harness-map",
      "harness-discuss",
      "harness-plan",
      "harness-verify",
      "harness-remember",
    ],
    checks: ["failing-before evidence", "passing-after evidence", "regression check"],
  },
};

function ensureDir(dirPath: string, dryRun: boolean): void {
  if (!dryRun) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(
  targetPath: string,
  content: string,
  options: Pick<WriteOptions, "dryRun" | "force">
): "created" | "overwritten" | "skipped" {
  const exists = fs.existsSync(targetPath);
  if (exists && !options.force) {
    return "skipped";
  }
  if (!options.dryRun) {
    ensureDir(path.dirname(targetPath), false);
    fs.writeFileSync(targetPath, `${content.trimEnd()}\n`, "utf8");
  }
  return exists ? "overwritten" : "created";
}

function bulletList(lines: string[]): string {
  return lines.map((line) => `- ${line}`).join("\n");
}

function toPosixRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function renderDomainSkillMarkdown(definition: DomainDefinition): string {
  return `---
id: ${definition.id}
name: ${definition.title}
status: draft
scope: domain
version: 1
can_block: false
can_write: false
inputs:
${definition.inputs.map((input) => `  - ${input}`).join("\n")}
outputs:
  - selected domain guidance
  - generated harness profile entries
tools:
  - harness-map
  - harness-discuss
  - harness-plan
  - harness-verify
---

# ${definition.title}

## Purpose

${definition.summary}

## When To Use

${bulletList(definition.whenToUse)}

## When Not To Use

${bulletList(definition.whenNotToUse)}

## Inputs

${bulletList(definition.inputs)}

## Workflow

${bulletList(definition.workflow)}

## Operating Principles

${bulletList([
  `Prefer the ${definition.pack} pack as the routing aid for this repository.`,
  "Keep the generated surface small and reviewable.",
  "Do not generate a domain skill when the stack signal is weak or absent.",
])}

## Reasoning Procedure

${bulletList(definition.reasoning)}

## Action Loop

${bulletList(definition.actionLoop)}

## Examples

${bulletList(definition.examples)}

## Output Contract

${bulletList(definition.outputContract)}

## Checklist Before Done

${bulletList(definition.checklist)}

## Common Failure Modes

${definition.commonFailureModes
  .map((item) => `- ${item.failure}: ${item.symptom}\n  - Counter: ${item.counter}`)
  .join("\n")}
`;
}

function renderDomainPromptMarkdown(definition: DomainDefinition): string {
  return `# ${definition.title} Prompt

## Role & Persona

You are the project-local ${definition.pack} domain skill generator and routing guide.

## Context

This repository has selected the ${DOMAIN_LABELS[definition.id]} domain because the stack detector, an explicit operator choice, or both justified it.

## Task

Help the harness choose the smallest relevant skill surface, generate the target profile artifacts, and keep the output aligned with the selected domain pack.

## Reasoning Procedure

${bulletList([
  "Identify the strongest stack signal before suggesting a domain.",
  "Prefer a narrow pack selection over a broad catalog dump.",
  "Keep generated artifacts concise and easy to diff.",
])}

## Action Loop

${bulletList([
  "Inspect the current repo signals and the selected pack.",
  "Generate or refresh the project-local domain skill surface.",
  "Record selected domains in the harness config and profile docs.",
])}

## Constraints & Rules

${bulletList([
  "Do not generate domain skills when the repository has no matching signals.",
  "Do not write sensitive data into generated artifacts.",
  "Do not override a human's explicit domain selection without confirmation.",
])}

## Examples

${bulletList([
  `${definition.pack} stack detected -> generate .harness/skills/${definition.id}/ and select the pack in .harness/config.json`,
  `No strong signals -> keep .harness/SKILLS.md on the core skills only`,
])}

## Output Format

${bulletList([
  "write the generated files under .harness/skills/",
  "update .harness/SKILLS.md and .harness/WORKFLOW.md",
  "record the selected domains in .harness/config.json",
])}
`;
}

function renderCodexDomainSkillMarkdown(definition: DomainDefinition): string {
  return `---
name: ${JSON.stringify(definition.title)}
description: ${JSON.stringify(definition.summary)}
---

# ${definition.title}

## Purpose

${definition.summary}

## When To Use

${bulletList(definition.whenToUse)}

## When Not To Use

${bulletList(definition.whenNotToUse)}

## Reasoning Procedure

${bulletList(definition.reasoning)}

## Action Loop

${bulletList(definition.actionLoop)}

## Examples

${bulletList(definition.examples)}

## Checklist Before Done

${bulletList(definition.checklist)}
`;
}

function renderCodexSkillOpenAiYaml(definition: DomainDefinition): string {
  return `interface:
  display_name: ${JSON.stringify(definition.title)}
  short_description: ${JSON.stringify(definition.summary)}
  default_prompt: ${JSON.stringify(
    `Use ${definition.id} domain guidance to keep the repo aligned with ${definition.pack}.`
  )}
`;
}

function renderCodexDomainAgentToml(definition: DomainDefinition): string {
  return [
    `name = "domain-${definition.id}"`,
    `description = ${JSON.stringify(`Harness generated ${definition.pack} domain agent`)}`,
    `developer_instructions = """${definition.title}`,
    "",
    "Use this agent to route repository work toward the generated domain skill.",
    "",
    "Responsibilities:",
    "- Read the selected domain skill and related harness artifacts",
    "- Keep the output bounded and decision-oriented",
    "- Return a concise result that points the main agent to the next command",
    "",
    "Forbidden actions:",
    "- Do not modify source files unless explicitly dispatched as a fixer",
    "- Do not dispatch other workers",
    "- Do not claim verification without evidence",
    '"""',
    'model = "inherit"',
    'sandbox_mode = "read-only"',
    "",
  ].join("\n");
}

function renderGeneratedAgentsBlock(selectedDomains: DomainId[]): string {
  const lines = [
    GENERATED_AGENTS_BLOCK_START,
    "## Generated Domain Skills",
    "",
    "The following domain assets were generated from project analysis:",
    "",
  ];

  if (selectedDomains.length === 0) {
    lines.push("- None selected");
  } else {
    for (const domainId of selectedDomains) {
      const definition = DOMAIN_DEFINITIONS[domainId];
      lines.push(`- \`${definition.id}\`: ${definition.summary}`);
      lines.push(`  - \`.harness/skills/${definition.id}/SKILL.md\``);
      lines.push(`  - \`.agents/skills/${definition.id}/SKILL.md\``);
      lines.push(`  - \`.codex/agents/domain-${definition.id}.toml\``);
    }
  }

  lines.push("");
  lines.push("## Codex Notes");
  lines.push("");
  lines.push(
    "- Trust the project's `.codex/` layer in Codex and restart the app after generating."
  );
  lines.push(GENERATED_AGENTS_BLOCK_END);
  return lines.join("\n");
}

function upsertGeneratedAgentsBlock(existing: string, block: string): string {
  if (
    existing.includes(GENERATED_AGENTS_BLOCK_START) &&
    existing.includes(GENERATED_AGENTS_BLOCK_END)
  ) {
    const start = existing.indexOf(GENERATED_AGENTS_BLOCK_START);
    const end = existing.indexOf(GENERATED_AGENTS_BLOCK_END) + GENERATED_AGENTS_BLOCK_END.length;
    return `${existing.slice(0, start).trimEnd()}\n\n${block}\n${existing.slice(end).trimStart()}`.trimEnd();
  }

  const trimmed = existing.trimEnd();
  if (!trimmed) {
    return `${block}\n`;
  }
  return `${trimmed}\n\n${block}\n`;
}

function writeAugmentedAgentsMarkdown(
  targetAbs: string,
  selectedDomains: DomainId[],
  options: WriteOptions
): "created" | "overwritten" | "skipped" {
  if (selectedDomains.length === 0) {
    return "skipped";
  }

  const targetPath = path.join(targetAbs, "AGENTS.md");
  const exists = fs.existsSync(targetPath);
  const current = exists ? fs.readFileSync(targetPath, "utf8") : "";
  const block = renderGeneratedAgentsBlock(selectedDomains);
  const next = upsertGeneratedAgentsBlock(current, block);

  if (exists && current === next) {
    return "skipped";
  }

  if (!options.dryRun) {
    ensureDir(path.dirname(targetPath), false);
    fs.writeFileSync(targetPath, next, "utf8");
  }
  return exists ? "overwritten" : "created";
}

function renderSkillsProfileMarkdown(selectedDomains: DomainId[]): string {
  const selectedDomainRows = selectedDomains.length
    ? selectedDomains
        .map((domainId) => {
          const def = DOMAIN_DEFINITIONS[domainId];
          return `| \`${def.id}\` | ${def.summary} | \`.harness/skills/${def.id}/SKILL.md\` |`;
        })
        .join("\n")
    : "| (none) | No generated domain skills were selected | `.harness/skills/` remains empty |";

  return `# Skills Profile

## Purpose

Describe the selected core skills, generated domain skills, and pack routing for this repository.

## Current Status

- Status: generated
- Review selected skills before first harness-run

## Selected Core Skills

The following core skills remain selected for this repository:

| Skill | Purpose |
|---|---|
| \`using-harness\` | Session discipline |
| \`mapping-codebase\` | Understand affected areas before planning |
| \`discussing-goals\` | Clarify goal and scope before planning |
| \`writing-plans\` | Produce approved plan before implementation |
| \`executing-plans\` | Execute plan steps surgically |
| \`verification\` | Gather fresh evidence before shipping |
| \`code-review\` | Independent risk check |
| \`remembering\` | Capture durable lessons after shipping |

## Selected Domain Skills

Generated domain skills for this repository:

| Domain | Why selected | Generated file |
|---|---|---|
${selectedDomainRows}

## Selected Skill Packs

| Pack | When to add |
|---|---|
| \`frontend\` | UI, browser behavior, responsive work |
| \`backend\` | APIs, services, persistence, auth |
| \`devops\` | CI/CD, deployment, infrastructure |
| \`mobile\` | iOS, Android, React Native |
| \`debugging\` | Bug investigation and regressions |
| \`data-ai\` | Data engineering, ML, LLM workflows |
| \`security\` | Auth, secrets, trust boundaries |
| \`cloud\` | Cloud providers and hosted integrations |

## Excluded Skills Or Packs

- Packs that do not match the detected repository surface
- Generated domain skills that are not selected in .harness/config.json
- Optional provider-native rule files when the provider directory does not exist

## Human Review

Review selected domains after the first harness-init completes.
`;
}

function renderWorkflowProfileMarkdown(selectedDomains: DomainId[]): string {
  const selected = selectedDomains.length ? selectedDomains.join(", ") : "none";
  return `# Workflow Profile

## Purpose

Describe the workflow stages and how selected domain skills fit into the core loop.

## Current Status

- Status: generated
- Review and confirm before first harness-run

## Selected Workflow

core-loop

Default workflow for all work types.

## Domain Selection

- Selected domains: ${selected}
- The init flow may generate \`.harness/skills/<domain>/\` entries for the selected domains.
- Generated domain skills should stay aligned with the core loop and the selected pack surface.

## Command Sequence

| # | Command | Required | Purpose | Skip when |
|---|---|---|---|---|
| 1 | \`harness-start\` | Always | Restore context, detect session, identify next command | Never |
| 2 | \`harness-discuss\` | Non-trivial work | Clarify goal, scope, success criteria, constraints | Truly trivial typo fixes only |
| 3 | \`harness-plan\` | Any implementation | Break work into ordered tasks; stop before coding | Never |
| 4 | \`harness-run\` | After plan approved | Execute approved tasks, small surgical steps | Never |
| 5 | \`harness-verify\` | After implementation | Run gates fresh, record evidence in VERIFY.md | Never |
| 6 | \`harness-ship\` | After verification | Summarize, write PR notes; chain to remember when \`shipped\` | When no shipping artifact needed |
| 7 | \`harness-remember\` | Default: chained after successful ship | Capture durable lessons in DECISIONS/HAZARDS/INDEX | Ship-only handoff, gaps/failure, or nothing reusable |

## Default Phase Chaining

- **Ship → Remember**: when ship status is \`shipped\`, run remember in the same turn unless the user requests ship-only or skip conditions in \`docs/phase-discipline.md\` apply.

## Execution Rules

- Do not run \`harness-run\` without an approved \`PLAN-*.md\` (status: approved)
- Do not run \`harness-ship\` without a passed or explicitly-gapped \`VERIFY.md\`
- When blocked, write \`.harness/sessions/<id>/BLOCKED.md\` and stop
- When goal changes mid-work, return to \`harness-discuss\` before continuing
- When a plan gap is discovered during execution, stop and return to \`harness-plan\`

## Alternate Workflows

| Workflow | When to use |
|---|---|
| \`feature\` | New user-visible capability |
| \`bugfix\` | Restoring expected behavior |
| \`refactor\` | Structural improvements that preserve behavior |
| \`incident\` | Urgent failures requiring compressed action |
| \`code-review\` | Reviewing changes before accepting or merging |

## Human Review

Confirm the selected domains, generated skill files, and any repo-specific workflow exceptions before first harness-run.
`;
}

function readJsonFile(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const current =
        result[key] && typeof result[key] === "object" && !Array.isArray(result[key])
          ? (result[key] as Record<string, unknown>)
          : {};
      result[key] = deepMerge(current, value as Record<string, unknown>);
      continue;
    }
    result[key] = value;
  }
  return result;
}

function normalizeDomains(input: string[]): DomainId[] {
  return normalizeDomainSelection(input);
}

function updateConfigWithDomains(
  packRoot: string,
  targetAbs: string,
  selectedDomains: DomainId[],
  options: WriteOptions,
  stackMeta?: StackScanResult | null
): "created" | "overwritten" | "skipped" {
  const templatePath = path.join(packRoot, "templates", "harness-config.json");
  const template = readJsonFile(templatePath);
  const targetPath = path.join(targetAbs, ".harness", "config.json");
  const existing = readJsonFile(targetPath);
  const merged = deepMerge(template, existing);
  merged.domains = [...selectedDomains];
  if (stackMeta) {
    merged.stack = {
      languages: stackMeta.languages,
      frameworks: stackMeta.frameworks,
      evidence: stackMeta.evidence,
      notes: stackMeta.notes,
    };
  }
  const serialized = `${JSON.stringify(merged, null, 2)}\n`;

  const exists = fs.existsSync(targetPath);
  if (exists && !options.force) {
    if (fs.readFileSync(targetPath, "utf8") === serialized) {
      return "skipped";
    }
  }

  if (!options.dryRun) {
    ensureDir(path.dirname(targetPath), false);
    fs.writeFileSync(targetPath, serialized, "utf8");
  }
  return exists ? "overwritten" : "created";
}

function writeGeneratedDomainRules(
  targetAbs: string,
  domainId: DomainId,
  options: WriteOptions
): WriteResult {
  const definition = DOMAIN_DEFINITIONS[domainId];
  const outputs: Array<{ relativePath: string; content: string }> = [];
  const body = `# ${definition.title}

Use the generated domain skill at \`.harness/skills/${definition.id}/SKILL.md\`.

- Domain: ${definition.pack}
- Commands: ${definition.commands.join(", ")}
- Checks: ${definition.checks.join(", ")}
`;
  const codexRule = `# ${definition.title}

# ai-engineering-harness Codex domain rule
# Generated from project analysis. Shell-level policy only.

${renderCodexRuleSet([
  {
    prefixes: ["rg", "git status", "git diff", "git log", "ls", "cat"],
    decision: "allow",
    justification: "Read-only inspection commands do not modify repository state.",
  },
  {
    prefixes: ["npm install", "pnpm install", "yarn add", "gh pr merge", "vercel", "npm publish"],
    decision: "prompt",
    justification: "Confirm before changing dependencies, merging, or deploying.",
  },
  {
    prefixes: [
      "git push --force",
      "git push --force-with-lease",
      "git reset --hard",
      "git clean -fdx",
      "rm -rf",
    ],
    decision: "forbidden",
    justification: "Use a safer alternative: revert, branch, or targeted cleanup.",
  },
])}`;

  if (fs.existsSync(path.join(targetAbs, ".claude"))) {
    outputs.push({
      relativePath: toPosixRelativePath(
        path.join(".claude", "rules", `domain-${definition.id}.md`)
      ),
      content: `# ${definition.title}\n\nUse the generated domain skill at \`.harness/skills/${definition.id}/SKILL.md\`.\n\n- Domain: ${definition.pack}\n- Commands: ${definition.commands.join(", ")}\n- Checks: ${definition.checks.join(", ")}\n`,
    });
  }

  if (fs.existsSync(path.join(targetAbs, ".cursor"))) {
    outputs.push({
      relativePath: toPosixRelativePath(
        path.join(".cursor", "rules", `domain-${definition.id}.mdc`)
      ),
      content: body,
    });
  }

  outputs.push({
    relativePath: toPosixRelativePath(
      path.join(".codex", "rules", `domain-${definition.id}.rules`)
    ),
    content: codexRule,
  });

  if (fs.existsSync(path.join(targetAbs, ".gemini"))) {
    outputs.push({
      relativePath: toPosixRelativePath(
        path.join(
          ".gemini",
          "extensions",
          "ai-engineering-harness",
          "rules",
          `domain-${definition.id}.md`
        )
      ),
      content: body,
    });
  }

  const created: string[] = [];
  const overwritten: string[] = [];
  const skipped: string[] = [];
  for (const entry of outputs) {
    const fullPath = path.join(targetAbs, entry.relativePath);
    const action = writeFile(fullPath, entry.content, options);
    if (action === "created") created.push(entry.relativePath);
    else if (action === "overwritten") overwritten.push(entry.relativePath);
    else skipped.push(entry.relativePath);
  }
  return { created, overwritten, skipped };
}

function writeGeneratedDomainSkill(
  targetAbs: string,
  domainId: DomainId,
  options: WriteOptions
): WriteResult {
  const definition = DOMAIN_DEFINITIONS[domainId];
  const outputs: Array<{ relativePath: string; content: string }> = [
    {
      relativePath: toPosixRelativePath(path.join(".harness", "skills", definition.id, "SKILL.md")),
      content: renderDomainSkillMarkdown(definition),
    },
    {
      relativePath: toPosixRelativePath(
        path.join(".harness", "skills", definition.id, "prompt.md")
      ),
      content: renderDomainPromptMarkdown(definition),
    },
    {
      relativePath: toPosixRelativePath(
        path.join(".harness", "skills", definition.id, "references", ".gitkeep")
      ),
      content: "",
    },
    {
      relativePath: toPosixRelativePath(path.join(".agents", "skills", definition.id, "SKILL.md")),
      content: renderCodexDomainSkillMarkdown(definition),
    },
    {
      relativePath: toPosixRelativePath(
        path.join(".agents", "skills", definition.id, "agents", "openai.yaml")
      ),
      content: renderCodexSkillOpenAiYaml(definition),
    },
    {
      relativePath: toPosixRelativePath(
        path.join(".codex", "agents", `domain-${definition.id}.toml`)
      ),
      content: renderCodexDomainAgentToml(definition),
    },
  ];

  const created: string[] = [];
  const overwritten: string[] = [];
  const skipped: string[] = [];
  for (const entry of outputs) {
    const fullPath = path.join(targetAbs, entry.relativePath);
    const action = writeFile(fullPath, entry.content, options);
    if (action === "created") created.push(entry.relativePath);
    else if (action === "overwritten") overwritten.push(entry.relativePath);
    else skipped.push(entry.relativePath);
  }
  return { created, overwritten, skipped };
}

function writeDomainSkillSurface(
  packRoot: string,
  targetAbs: string,
  selectedDomains: string[],
  options: WriteOptions,
  stackMeta?: StackScanResult | null
): WriteResult {
  const normalized = normalizeDomains(selectedDomains);
  const created: string[] = [];
  const overwritten: string[] = [];
  const skipped: string[] = [];

  const configAction = updateConfigWithDomains(packRoot, targetAbs, normalized, options, stackMeta);
  if (configAction === "created") created.push(".harness/config.json");
  else if (configAction === "overwritten") overwritten.push(".harness/config.json");
  else skipped.push(".harness/config.json");

  const skillsProfilePath = path.join(targetAbs, ".harness", "SKILLS.md");
  const skillsContent = renderSkillsProfileMarkdown(normalized);
  const skillsAction = writeFile(skillsProfilePath, skillsContent, options);
  if (skillsAction === "created") created.push(".harness/SKILLS.md");
  else if (skillsAction === "overwritten") overwritten.push(".harness/SKILLS.md");
  else skipped.push(".harness/SKILLS.md");

  const workflowProfilePath = path.join(targetAbs, ".harness", "WORKFLOW.md");
  const workflowContent = renderWorkflowProfileMarkdown(normalized);
  const workflowAction = writeFile(workflowProfilePath, workflowContent, options);
  if (workflowAction === "created") created.push(".harness/WORKFLOW.md");
  else if (workflowAction === "overwritten") overwritten.push(".harness/WORKFLOW.md");
  else skipped.push(".harness/WORKFLOW.md");

  const agentsAction = writeAugmentedAgentsMarkdown(targetAbs, normalized, options);
  if (agentsAction === "created") created.push("AGENTS.md");
  else if (agentsAction === "overwritten") overwritten.push("AGENTS.md");
  else skipped.push("AGENTS.md");

  const skillsAnchorPath = path.join(targetAbs, ".harness", "skills", ".gitkeep");
  const skillsAnchorAction = writeFile(skillsAnchorPath, "", options);
  if (skillsAnchorAction === "created") created.push(".harness/skills/.gitkeep");
  else if (skillsAnchorAction === "overwritten") overwritten.push(".harness/skills/.gitkeep");
  else skipped.push(".harness/skills/.gitkeep");

  for (const domainId of normalized) {
    const skillFiles = writeGeneratedDomainSkill(targetAbs, domainId, options);
    const ruleFiles = writeGeneratedDomainRules(targetAbs, domainId, options);
    for (const relativePath of skillFiles.created) created.push(relativePath);
    for (const relativePath of skillFiles.overwritten) overwritten.push(relativePath);
    for (const relativePath of skillFiles.skipped) skipped.push(relativePath);
    for (const relativePath of ruleFiles.created) created.push(relativePath);
    for (const relativePath of ruleFiles.overwritten) overwritten.push(relativePath);
    for (const relativePath of ruleFiles.skipped) skipped.push(relativePath);
  }

  return { created, overwritten, skipped };
}

function getDomainDefinition(domainId: DomainId): DomainDefinition {
  return DOMAIN_DEFINITIONS[domainId];
}

function listDomainDefinitions(): DomainDefinition[] {
  return Object.values(DOMAIN_DEFINITIONS);
}

function validateDomainIds(domainIds: string[]): DomainId[] {
  return normalizeDomains(domainIds);
}

export {
  DOMAIN_DEFINITIONS,
  getDomainDefinition,
  listDomainDefinitions,
  renderDomainPromptMarkdown,
  renderDomainSkillMarkdown,
  renderSkillsProfileMarkdown,
  renderWorkflowProfileMarkdown,
  validateDomainIds,
  writeDomainSkillSurface,
};
export type { DomainDefinition, WriteOptions, WriteResult };
