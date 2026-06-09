import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";
import { fileReferencesActivation } from "../runtime-command-catalog";
import {
  promptTemplateHeadings,
  sessionAwareCommandFiles,
  toolFileHeadings,
  packRequiredHeadings,
  skillFiles,
  TOOL_DISCOVERY_KEYS,
} from "./constants";
import {
  HARNESS_COMMAND_PATTERN,
  assertExists,
  extractMarkdownSection,
  hasConcreteFailureRule,
  hasSubstantiveSectionBody,
  parseFrontmatter,
  parseNestedFrontmatterMap,
  readFile,
  resolvePath,
} from "./utils";
import { workers, VALID_PROVIDER_SUPPORT, WORKER_IDS } from "../../workers/registry";
import { assertClaudeWorkerSurface } from "../worker-claude-adapter";
import { listDomainDefinitions } from "../domain-skill-generation";

const skillContractSubstanceHeadings = [
  "## When Not To Use",
  "## Inputs",
  "## Output Contract",
  "## Common Failure Modes",
];

const DOGFOOD_DEMO_PREFIX = "examples/dogfood-tiny-node-api";
const CANONICAL_WORKFLOW_ORDER =
  "harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember";

const ACTIVE_COMMAND_NAMING_PATHS = [
  "README.md",
  "PACK.md",
  "AGENTS.md",
  "docs/provider-command-matrix.md",
  "docs/command-guardrails.md",
  "docs/runtime-command-surface.md",
  "docs/workflow-visualization.md",
  "docs/provider-native-command-research.md",
  "docs/harness-command-behavior.md",
  "docs/codex-plugin-support.md",
  "docs/npx-cli-ux.md",
  "docs/simple-cli-ux.md",
  "docs/private-capability-cache.md",
  "docs/terminal-wizard-ux.md",
  "runtime-command-catalog.js",
  "dist/lib/command-surface-report.js",
  "dist/lib/cli-ui.js",
];

const FORBIDDEN_COLON_COMMAND_PATTERNS = [
  { pattern: /\/harness:[a-z][a-z0-9-]*/i, label: "/harness:…" },
  { pattern: /\bharness:[a-z][a-z0-9-]*\b/i, label: "harness:…" },
  { pattern: /\/harness [a-z][a-z0-9-]*/i, label: "/harness …" },
  { pattern: /\bharness_[a-z][a-z0-9-]*\b/i, label: "harness_…" },
];

function assertCommandContractStructure(
  relativePath: string,
  content: string,
  failures: string[]
): void {
  for (const [heading, label] of [
    ["## Preconditions", "Preconditions"],
    ["## Required Outputs", "Required Outputs"],
  ]) {
    const body = extractMarkdownSection(content, heading);
    if (body !== null && !hasSubstantiveSectionBody(body)) {
      failures.push(
        `${relativePath}: ${label} must contain substantive contract content (not empty or placeholder-only)`
      );
    }
  }

  const redirectBody = extractMarkdownSection(content, "## Redirect Behavior");
  if (redirectBody !== null && !HARNESS_COMMAND_PATTERN.test(redirectBody)) {
    failures.push(
      `${relativePath}: Redirect Behavior must mention at least one harness command (harness-<name>)`
    );
  }

  const failureBody = extractMarkdownSection(content, "## Failure Conditions");
  if (failureBody !== null && !hasConcreteFailureRule(failureBody)) {
    failures.push(
      `${relativePath}: Failure Conditions must include at least one concrete negative rule`
    );
  }
}

function assertSkillContractStructure(
  relativePath: string,
  content: string,
  failures: string[]
): void {
  for (const heading of skillContractSubstanceHeadings) {
    const body = extractMarkdownSection(content, heading);
    if (body !== null && !hasSubstantiveSectionBody(body, { minChars: 10 })) {
      failures.push(
        `${relativePath}: ${heading.replace("## ", "")} must contain substantive contract content`
      );
    }
  }
}

function assertCodexRuleContractStructure(
  relativePath: string,
  content: string,
  failures: string[]
): void {
  if (!/prefix_rule\(/.test(content)) {
    failures.push(`${relativePath}: must contain at least one prefix_rule call`);
  }

  for (const field of ["prefixes =", "action =", "message ="]) {
    if (content.includes(field)) {
      failures.push(
        `${relativePath}: must not use legacy Codex rule field ${field.replace(" =", "")}`
      );
    }
  }

  if (!/pattern\s*=\s*\[[^\]]+\]/.test(content)) {
    failures.push(`${relativePath}: must define pattern arrays using Codex execpolicy schema`);
  }
  if (!/decision\s*=\s*"(allow|prompt|forbidden)"/.test(content)) {
    failures.push(`${relativePath}: must define a valid Codex decision field`);
  }
  if (!/justification\s*=\s*"/.test(content)) {
    failures.push(`${relativePath}: must define a justification field`);
  }
  if (/pattern\s*=\s*\[\s*"[^"]+\s+[^"]+"/.test(content)) {
    failures.push(
      `${relativePath}: pattern entries must be tokenized, not space-delimited strings`
    );
  }
}

function assertVerifyArtifactContent(
  relativePath: string,
  content: string,
  failures: string[],
  options: { isTemplate?: boolean } = {}
): void {
  const isTemplate = options.isTemplate ?? false;

  if (
    !/status:\s*(pending|passed|failed|blocked|partial|pending human verification)/i.test(content)
  ) {
    failures.push(`${relativePath} must include a machine-readable status field`);
  }
  if (!/freshness:\s*.+/i.test(content)) {
    failures.push(`${relativePath} must include a machine-readable freshness field`);
  }

  const testsBody = extractMarkdownSection(content, "## Tests Run");
  if (testsBody === null || !hasSubstantiveSectionBody(testsBody, { minChars: 20 })) {
    failures.push(
      `${relativePath}: Tests Run must contain at least one substantive verification entry`
    );
  }

  const gapsBody = extractMarkdownSection(content, "## Known Gaps");
  if (gapsBody !== null) {
    const onlyNone = /^\s*-?\s*None\s*\.?\s*$/im.test(gapsBody.trim());
    if (onlyNone || !hasSubstantiveSectionBody(gapsBody, { minChars: 8 })) {
      failures.push(`${relativePath}: Known Gaps must contain substantive pending wording`);
    }
  }

  if (isTemplate) {
    const evidenceBody = extractMarkdownSection(content, "## Evidence");
    if (evidenceBody === null || !hasSubstantiveSectionBody(evidenceBody, { minChars: 20 })) {
      failures.push(`${relativePath}: Evidence must contain structured summary prompts`);
    }
  }
}

function assertVerifyTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/VERIFY.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  assertVerifyArtifactContent(relativePath, readFile(baseDir, relativePath), failures, {
    isTemplate: true,
  });
}

function assertPlanTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/PLAN.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of ["## Approval Status", "## Success Criteria", "## Approval Checkpoints"]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
  if (!/status:\s*(draft|approved|blocked)/i.test(content)) {
    failures.push(`${relativePath} must include approval status field`);
  }
}

function assertChangeSpecTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/CHANGE_SPEC.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "## Current Behavior",
    "## ADDED Requirements",
    "## MODIFIED Requirements",
    "## REMOVED Requirements",
    "## Validation",
    "## Approval Status",
    "## Human Approval",
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertReviewTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/REVIEW.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "## Findings",
    "## Missing Verification",
    "## Evidence Reviewed",
    "## Ship Blockers",
    "## Review Status",
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertBlockedTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/BLOCKED.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "# Blocked",
    "## Status",
    "## Current Command",
    "## Missing Preconditions",
    "## Blocking Questions",
    "## Suggested Next Command",
    "## Notes",
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertPromptTemplateContract(
  relativePath: string,
  content: string,
  failures: string[]
): void {
  for (const heading of promptTemplateHeadings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
  if (
    /prompt-templates\/harness-(run|verify|ship)\.md$/.test(relativePath) &&
    !content.includes("### Blocked")
  ) {
    failures.push(`${relativePath} must include a ### Blocked output branch`);
  }
  if (/prompt-templates\/blocker-question\.md$/.test(relativePath)) {
    if (!/stop after asking|workflow is paused|no further phase was executed/i.test(content)) {
      failures.push(`${relativePath} must explicitly stop after asking the blocking question`);
    }
  }
}

function assertAgentsContent(baseDir: string, failures: string[]): void {
  const relativePath = "AGENTS.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "## Completion Gate",
    "## Stop Conditions",
    "## Wrong Phase Behavior",
    "## Memory Discipline",
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertPackContract(baseDir: string, failures: string[]): void {
  const relativePath = "PACK.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of packRequiredHeadings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertToolFileContract(baseDir: string, relativePath: string, failures: string[]): void {
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of toolFileHeadings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertToolDiscoveryScript(baseDir: string, failures: string[]): void {
  const relativePath = "scripts/discover-tools.js";
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }

  for (const args of [[], ["--markdown"]]) {
    const result = childProcess.spawnSync(process.execPath, [fullPath, ...args], {
      cwd: baseDir,
      encoding: "utf8",
      timeout: 30000,
    });
    if (result.status !== 0) {
      failures.push(
        `${relativePath} must exit 0 for ${args.length === 0 ? "JSON mode" : "--markdown mode"}`
      );
      continue;
    }
    if (args.length === 0) {
      try {
        const parsed = JSON.parse(result.stdout);
        for (const key of TOOL_DISCOVERY_KEYS) {
          if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
            failures.push(`${relativePath} JSON output must include key: ${key}`);
          }
        }
      } catch (error) {
        failures.push(`${relativePath} must output valid JSON in default mode`);
      }
    } else if (!/Tool Context|Code search|Git diff|Routing/i.test(result.stdout)) {
      failures.push(`${relativePath} --markdown output must be human-readable`);
    }
  }
}

function assertToolRoutingDocs(baseDir: string, failures: string[]): void {
  const relativePath = "tool-capabilities/TOOL_ROUTING.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const capability of [
    "code-search",
    "diff-review",
    "history-review",
    "parallel-work",
    "document-to-markdown",
    "repo-structure",
    "dependency-scan",
  ]) {
    if (!content.includes(capability)) {
      failures.push(`${relativePath} must define capability route: ${capability}`);
    }
  }
}

function assertSessionMemoryDocContracts(baseDir: string, failures: string[]): void {
  const sessionDocPath = "docs/session-memory.md";
  const migrationDocPath = "docs/memory-migration.md";

  if (!fs.existsSync(resolvePath(baseDir, sessionDocPath))) {
    failures.push(`Missing required path: ${sessionDocPath}`);
  } else {
    const content = readFile(baseDir, sessionDocPath);
    if (!/files are the source of truth/i.test(content)) {
      failures.push(`${sessionDocPath} must state that files are the source of truth`);
    }
    if (!/root `?\.harness`? is an index and router/i.test(content)) {
      failures.push(`${sessionDocPath} must define root .harness as the index/router`);
    }
    if (!/sessions own working artifacts/i.test(content)) {
      failures.push(`${sessionDocPath} must state that sessions own working artifacts`);
    }
  }

  if (!fs.existsSync(resolvePath(baseDir, migrationDocPath))) {
    failures.push(`Missing required path: ${migrationDocPath}`);
  } else {
    const content = readFile(baseDir, migrationDocPath);
    if (!/legacy/i.test(content) || !/preserve/i.test(content) || !/ambiguous/i.test(content)) {
      failures.push(
        `${migrationDocPath} must explain legacy migration, preservation, and ambiguity handling`
      );
    }
  }
}

function assertSessionConfigTemplate(baseDir: string, failures: string[]): void {
  const relativePath = "templates/harness-config.json";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }

  try {
    const config = JSON.parse(readFile(baseDir, relativePath));
    if (config?.memory?.backend !== "files") {
      failures.push(`${relativePath} must set memory.backend to "files"`);
    }
    if (config?.memory?.sourceOfTruth !== "files") {
      failures.push(`${relativePath} must set memory.sourceOfTruth to "files"`);
    }
    if (config?.specs?.enabled !== false) {
      failures.push(`${relativePath} must set specs.enabled to false`);
    }
    if (config?.specs?.sourceOfTruth !== "delta-specs") {
      failures.push(`${relativePath} must set specs.sourceOfTruth to "delta-specs"`);
    }
    if (config?.specs?.directory !== ".harness/specs") {
      failures.push(`${relativePath} must set specs.directory to ".harness/specs"`);
    }
    if (config?.workerMemory?.enabled !== false) {
      failures.push(`${relativePath} must set workerMemory.enabled to false`);
    }
    if (config?.workerMemory?.directory !== ".harness/memory/workers") {
      failures.push(`${relativePath} must set workerMemory.directory to ".harness/memory/workers"`);
    }
    if (!Array.isArray(config?.domains)) {
      failures.push(`${relativePath} must set domains to an array`);
    }
  } catch (error) {
    failures.push(`${relativePath} must contain valid JSON`);
  }
}

function assertTargetHarnessConfig(baseDir: string, failures: string[]): void {
  const relativePath = ".harness/config.json";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }

  try {
    const config = JSON.parse(readFile(baseDir, relativePath));
    if (config?.memory?.backend !== "files") {
      failures.push(`${relativePath} must set memory.backend to "files"`);
    }
    if (config?.memory?.sourceOfTruth !== "files") {
      failures.push(`${relativePath} must set memory.sourceOfTruth to "files"`);
    }
    if (config?.specs?.enabled !== false) {
      failures.push(`${relativePath} must set specs.enabled to false`);
    }
    if (config?.specs?.sourceOfTruth !== "delta-specs") {
      failures.push(`${relativePath} must set specs.sourceOfTruth to "delta-specs"`);
    }
    if (config?.specs?.directory !== ".harness/specs") {
      failures.push(`${relativePath} must set specs.directory to ".harness/specs"`);
    }
    if (config?.workerMemory?.enabled !== false) {
      failures.push(`${relativePath} must set workerMemory.enabled to false`);
    }
    if (config?.workerMemory?.directory !== ".harness/memory/workers") {
      failures.push(`${relativePath} must set workerMemory.directory to ".harness/memory/workers"`);
    }
    if (!Array.isArray(config?.domains)) {
      failures.push(`${relativePath} must set domains to an array`);
      return;
    }

    if (fs.existsSync(resolvePath(baseDir, ".claude/settings.json"))) {
      try {
        const settings = JSON.parse(readFile(baseDir, ".claude/settings.json"));
        const commands = JSON.stringify(settings);
        for (const hookPath of [
          ".ai-harness/hooks/core/guard-phase.js",
          ".ai-harness/hooks/core/record-tool-output.js",
          ".ai-harness/hooks/core/record-subagent-result.js",
          ".ai-harness/hooks/core/compact-session-memory.js",
        ]) {
          if (!commands.includes(hookPath)) {
            failures.push(`${relativePath} must reference ${hookPath} in Claude hook settings`);
          }
        }
      } catch {
        failures.push(`${relativePath} must keep Claude hook settings valid JSON`);
      }
    }

    if (fs.existsSync(resolvePath(baseDir, ".claude"))) {
      const claudeSkillIds = [...new Set(skillFiles.map((file) => file.split("/")[1]))];
      for (const skillId of claudeSkillIds) {
        assertExists(baseDir, path.join(".claude", "skills", skillId, "SKILL.md"), failures);
      }
    }

    if (fs.existsSync(resolvePath(baseDir, ".codex"))) {
      const codexDefaultRulesPath = path.join(".codex", "rules", "default.rules");
      assertExists(baseDir, path.join(".codex", "hooks.json"), failures);
      assertExists(baseDir, codexDefaultRulesPath, failures);
      if (fs.existsSync(resolvePath(baseDir, codexDefaultRulesPath))) {
        assertCodexRuleContractStructure(
          codexDefaultRulesPath,
          readFile(baseDir, codexDefaultRulesPath),
          failures
        );
      }
      const codexAgentsDir = path.join(".codex", "agents");
      if (!fs.existsSync(resolvePath(baseDir, codexAgentsDir))) {
        failures.push(`Missing required path: ${codexAgentsDir}`);
      } else {
        const agentFiles = fs
          .readdirSync(resolvePath(baseDir, codexAgentsDir))
          .filter((name) => name.endsWith(".toml"));
        if (agentFiles.length === 0) {
          failures.push(`${codexAgentsDir} must include at least one .toml agent`);
        }
      }
    }

    const validDomainIds = new Set<string>(
      listDomainDefinitions().map((definition) => definition.id)
    );
    for (const domainId of config.domains as unknown[]) {
      if (typeof domainId !== "string" || !validDomainIds.has(domainId)) {
        failures.push(`${relativePath} must only contain known domain ids`);
        break;
      }
      const knownDomainId = domainId as string;
      for (const suffix of ["SKILL.md", "prompt.md", path.join("references", ".gitkeep")]) {
        assertExists(baseDir, path.join(".harness", "skills", knownDomainId, suffix), failures);
      }
      if (fs.existsSync(resolvePath(baseDir, ".claude"))) {
        assertExists(
          baseDir,
          path.join(".claude", "rules", `domain-${knownDomainId}.md`),
          failures
        );
      }
      if (fs.existsSync(resolvePath(baseDir, ".cursor"))) {
        assertExists(
          baseDir,
          path.join(".cursor", "rules", `domain-${knownDomainId}.mdc`),
          failures
        );
      }
      if (fs.existsSync(resolvePath(baseDir, ".codex"))) {
        const domainRulePath = path.join(".codex", "rules", `domain-${knownDomainId}.rules`);
        assertExists(baseDir, domainRulePath, failures);
        if (fs.existsSync(resolvePath(baseDir, domainRulePath))) {
          assertCodexRuleContractStructure(
            domainRulePath,
            readFile(baseDir, domainRulePath),
            failures
          );
        }
        assertExists(
          baseDir,
          path.join(".codex", "agents", `domain-${knownDomainId}.toml`),
          failures
        );
      }
      if (fs.existsSync(resolvePath(baseDir, ".gemini"))) {
        assertExists(
          baseDir,
          path.join(
            ".gemini",
            "extensions",
            "ai-engineering-harness",
            "rules",
            `domain-${knownDomainId}.md`
          ),
          failures
        );
      }
    }
  } catch (error) {
    failures.push(`${relativePath} must contain valid JSON`);
  }
}

function assertSessionAwareCommandRouting(baseDir: string, failures: string[]): void {
  for (const relativePath of sessionAwareCommandFiles) {
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing required path: ${relativePath}`);
      continue;
    }
    const content = readFile(baseDir, relativePath);
    if (!/\.harness\/STATE\.md/.test(content)) {
      failures.push(`${relativePath} must reference .harness/STATE.md`);
    }
    if (!/sessions\/<active-session>|active session/i.test(content)) {
      failures.push(`${relativePath} must reference active-session routing`);
    }
  }
}

function assertWorkflowDocumentationContracts(baseDir: string, failures: string[]): void {
  const startDoc = "commands/harness-start.md";
  if (fs.existsSync(resolvePath(baseDir, startDoc))) {
    const content = readFile(baseDir, startDoc);
    if (
      !/session-scoped/i.test(content) ||
      !/important paths|quality gates|provider entrypoints|context mapping/i.test(content)
    ) {
      failures.push(`${startDoc} must describe Session Start as a session-scoped context restore`);
    }
  }

  const mapDoc = "commands/harness-map.md";
  if (fs.existsSync(resolvePath(baseDir, mapDoc))) {
    const content = readFile(baseDir, mapDoc);
    if (
      !/compatibility|manual context refresh/i.test(content) ||
      !/not required in the normal workflow|not teach it as part of the primary workflow/i.test(
        content
      )
    ) {
      failures.push(`${mapDoc} must describe compatibility or manual context refresh semantics`);
    }
  }

  for (const relativePath of [
    "workflows/core-loop.md",
    "workflows/feature.md",
    "workflows/bugfix.md",
    "workflows/refactor.md",
    "workflows/incident.md",
  ]) {
    if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
      continue;
    }
    const content = readFile(baseDir, relativePath);
    if (!content.includes(CANONICAL_WORKFLOW_ORDER)) {
      failures.push(`${relativePath} must use canonical ${CANONICAL_WORKFLOW_ORDER} order`);
    }
  }

  for (const relativePath of [
    "commands/harness-map.md",
    "commands/harness-plan.md",
    "commands/harness-run.md",
    "commands/harness-verify.md",
    "commands/harness-ship.md",
  ]) {
    if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
      continue;
    }
    const content = readFile(baseDir, relativePath);
    if (!content.includes("## Tool Discovery") || !content.includes("## Tool Routing")) {
      failures.push(`${relativePath} must include ## Tool Discovery and ## Tool Routing sections`);
    }
  }

  for (const relativePath of [
    "prompt-templates/harness-plan.md",
    "prompt-templates/harness-run.md",
    "prompt-templates/harness-verify.md",
    "prompt-templates/harness-ship.md",
    "prompt-templates/code-reviewer.md",
  ]) {
    if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
      continue;
    }
    const content = readFile(baseDir, relativePath);
    if (!content.includes("### Tool Discovery") || !content.includes("### Tool Routing")) {
      failures.push(
        `${relativePath} must include ### Tool Discovery and ### Tool Routing sections`
      );
    }
  }
}

function assertSessionStartReferenceContracts(baseDir: string, failures: string[]): void {
  const canonicalFlow = "Session Start → Discuss → Plan → Run → Verify → Ship → Remember";
  const readmePath = "README.md";
  if (fs.existsSync(resolvePath(baseDir, readmePath))) {
    const content = readFile(baseDir, readmePath);
    if (!content.includes(canonicalFlow)) {
      failures.push(`${readmePath} must include the canonical ${canonicalFlow} flow`);
    }
    const requiredRefs = [
      ".harness/context.md",
      ".harness/history/events.jsonl",
      ".harness/memory/",
    ];
    if (!requiredRefs.every((ref) => content.includes(ref))) {
      failures.push(
        `${readmePath} must reference .harness/context.md, .harness/history/events.jsonl, and .harness/memory/`
      );
    }
  }

  const phasePath = "docs/phase-discipline.md";
  if (fs.existsSync(resolvePath(baseDir, phasePath))) {
    const content = readFile(baseDir, phasePath);
    if (!content.includes(canonicalFlow)) {
      failures.push(`${phasePath} must include the canonical ${canonicalFlow} flow`);
    }
  }

  const quickPath = "docs/internal/process-artifacts/QUICK_REFERENCE.md";
  if (fs.existsSync(resolvePath(baseDir, quickPath))) {
    const content = readFile(baseDir, quickPath);
    if (!content.includes("START → DISCUSS → PLAN → RUN → VERIFY → SHIP → REMEMBER")) {
      failures.push(
        `${quickPath} must include the canonical START → DISCUSS → PLAN → RUN → VERIFY → SHIP → REMEMBER flow`
      );
    }
  }
}

function assertHyphenCommandNamingInActiveDocs(baseDir: string, failures: string[]): void {
  for (const relativePath of ACTIVE_COMMAND_NAMING_PATHS) {
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = readFile(baseDir, relativePath);
    for (const { pattern, label } of FORBIDDEN_COLON_COMMAND_PATTERNS) {
      if (pattern.test(content)) {
        failures.push(
          `${relativePath} must use hyphen-form command IDs (harness-plan), not colon form (${label})`
        );
        break;
      }
    }
  }
}

function assertPublicDemoPolish(baseDir: string, failures: string[]): void {
  const readmePath = "README.md";
  if (!fs.existsSync(resolvePath(baseDir, readmePath))) {
    failures.push(`Missing required path: ${readmePath}`);
    return;
  }
  const readme = readFile(baseDir, readmePath);
  if (!readme.includes("examples/dogfood-tiny-node-api")) {
    failures.push(`${readmePath} must link to examples/dogfood-tiny-node-api`);
  }
}

function assertDogfoodDemoContract(baseDir: string, failures: string[]): void {
  const verifyPath = `${DOGFOOD_DEMO_PREFIX}/.harness/VERIFY.md`;
  if (!fs.existsSync(resolvePath(baseDir, verifyPath))) {
    return;
  }
  const verify = readFile(baseDir, verifyPath);
  if (!/status:\s*passed/i.test(verify)) {
    failures.push(`${verifyPath} must include status: passed`);
  }
}

function validateRuntimeCommandSurface(baseDir: string, failures: string[]): void {
  const cacheDir = path.join(baseDir, ".ai-harness");
  if (!fs.existsSync(cacheDir)) {
    return;
  }
  assertExists(baseDir, ".ai-harness/activation.md", failures);
  assertExists(baseDir, ".ai-harness/manifest.json", failures);

  const planCatalogPath = path.join(baseDir, ".ai-harness/runtime-commands/harness-plan.md");
  if (fs.existsSync(planCatalogPath)) {
    const content = fs.readFileSync(planCatalogPath, "utf8");
    if (!content.includes(".ai-harness/activation.md")) {
      failures.push(
        ".ai-harness/runtime-commands/harness-plan.md must reference .ai-harness/activation.md"
      );
    }
  }

  const cursorPlan = path.join(baseDir, ".cursor/commands/harness-plan.md");
  if (fs.existsSync(cursorPlan) && !fileReferencesActivation(cursorPlan)) {
    failures.push(".cursor/commands/harness-plan.md must reference .ai-harness/activation.md");
  }

  const claudePlan = path.join(baseDir, ".claude/commands/harness-plan.md");
  if (fs.existsSync(claudePlan) && !fileReferencesActivation(claudePlan)) {
    failures.push(".claude/commands/harness-plan.md must reference .ai-harness/activation.md");
  }
}

function assertWorkerRunTemplateContract(baseDir: string, failures: string[]): void {
  const relativePath = "templates/WORKER_RUN.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "## Metadata",
    "## Task",
    "## Result Envelope",
    "## Full Result",
    "## Main Agent Decision",
    "## Next Allowed Command",
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertWorkerRegistryContract(baseDir: string, failures: string[]): void {
  const relativePath = "dist/workers/registry.js";
  assertExists(baseDir, relativePath, failures);
  const registryPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(registryPath)) {
    return;
  }

  let registryModule: { workers?: Array<{ id: string }> };
  try {
    delete require.cache[require.resolve(registryPath)];
    registryModule = require(registryPath);
  } catch (error) {
    failures.push(`${relativePath} must load cleanly: ${(error as Error).message}`);
    return;
  }

  if (!Array.isArray(registryModule.workers) || registryModule.workers.length === 0) {
    failures.push(`${relativePath} must export workers array`);
    return;
  }

  for (const expectedId of WORKER_IDS) {
    const entry = registryModule.workers.find((worker: { id: string }) => worker.id === expectedId);
    if (!entry) {
      failures.push(`${relativePath} is missing canonical worker: ${expectedId}`);
    }
  }
}

function assertWorkerDefinitionContract(baseDir: string, failures: string[]): void {
  for (const worker of workers) {
    const relativePath = worker.definitionPath;
    assertExists(baseDir, relativePath, failures);
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const content = readFile(baseDir, relativePath);
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      failures.push(`${relativePath} must include YAML frontmatter`);
      continue;
    }

    for (const field of ["id", "role", "mode", "writeAccess", "canDispatch", "resultSchema"]) {
      if (!frontmatter[field]) {
        failures.push(`${relativePath} frontmatter must include ${field}`);
      }
    }

    if (
      !Array.isArray(frontmatter.requiredInputs) ||
      (frontmatter.requiredInputs as string[]).length === 0
    ) {
      failures.push(`${relativePath} frontmatter must include requiredInputs list`);
    }

    const providerSupport = parseNestedFrontmatterMap(content, "providerSupport");
    if (!providerSupport) {
      failures.push(`${relativePath} frontmatter must include providerSupport map`);
    } else {
      for (const value of Object.values(providerSupport)) {
        if (!VALID_PROVIDER_SUPPORT.includes(value as (typeof VALID_PROVIDER_SUPPORT)[number])) {
          failures.push(`${relativePath} has invalid providerSupport value: ${value}`);
        }
      }
    }

    if (String(frontmatter.id) !== worker.id) {
      failures.push(`${relativePath} frontmatter id must match registry id ${worker.id}`);
    }
    if (String(frontmatter.canDispatch) !== "false") {
      failures.push(`${relativePath} must set canDispatch: false in v1`);
    }
    if (String(frontmatter.writeAccess) !== worker.writeAccess) {
      failures.push(`${relativePath} writeAccess must match registry (${worker.writeAccess})`);
    }
    if (!content.includes("### Agent Result")) {
      failures.push(`${relativePath} must include ### Agent Result envelope`);
    }
  }

  const readOnlyWorkers = workers.filter((worker) => worker.writeAccess === "none");
  for (const worker of readOnlyWorkers) {
    if (worker.writeAccess !== "none") {
      failures.push(`Worker ${worker.id} must remain read-only in v1`);
    }
  }

  const fixer = workers.find((worker) => worker.id === "fixer");
  if (fixer && fixer.writeAccess !== "write") {
    failures.push("fixer must be explicitly write-enabled");
  }
}

function assertWorkerAwareCommandDocs(baseDir: string, failures: string[]): void {
  for (const [relativePath, workersExpected] of [
    ["commands/harness-map.md", ["explorer"]] as const,
    ["commands/harness-verify.md", ["reviewer", "verifier"]] as const,
    ["commands/harness-ship.md", ["gatekeeper"]] as const,
    ["commands/harness-run.md", ["fixer"]] as const,
  ]) {
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = readFile(baseDir, relativePath);
    if (!/delegated worker|worker contract|WORKER_RUN/i.test(content)) {
      failures.push(`${relativePath} must reference delegated worker contract consumption`);
    }
    for (const workerId of workersExpected) {
      if (!content.includes(workerId)) {
        failures.push(`${relativePath} must reference worker: ${workerId}`);
      }
    }
  }
}

function assertWorkerContract(baseDir: string, failures: string[]): void {
  assertWorkerRegistryContract(baseDir, failures);
  assertWorkerDefinitionContract(baseDir, failures);
  assertWorkerRunTemplateContract(baseDir, failures);
  assertWorkerAwareCommandDocs(baseDir, failures);

  const claudeAgentsDir = resolvePath(baseDir, ".claude/agents");
  if (fs.existsSync(claudeAgentsDir)) {
    assertClaudeWorkerSurface(baseDir, failures);
  }

  const delegatedWorkersDoc = "docs/delegated-workers.md";
  if (fs.existsSync(resolvePath(baseDir, delegatedWorkersDoc))) {
    const content = readFile(baseDir, delegatedWorkersDoc);
    for (const level of VALID_PROVIDER_SUPPORT) {
      if (!content.includes(level)) {
        failures.push(`${delegatedWorkersDoc} must document support level: ${level}`);
      }
    }
    if (!/Claude.*native|native.*Claude/i.test(content)) {
      failures.push(`${delegatedWorkersDoc} must describe Claude as native support`);
    }
    if (!/Cursor.*adapter|adapter.*Cursor/i.test(content)) {
      failures.push(`${delegatedWorkersDoc} must describe Cursor as adapter support`);
    }
    if (!/Codex.*adapter|adapter.*Codex/i.test(content)) {
      failures.push(`${delegatedWorkersDoc} must describe Codex as adapter support`);
    }
  }
}

export {
  ACTIVE_COMMAND_NAMING_PATHS,
  DOGFOOD_DEMO_PREFIX,
  assertAgentsContent,
  assertBlockedTemplateContract,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPackContract,
  assertPlanTemplateContract,
  assertChangeSpecTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertReviewTemplateContract,
  assertSessionAwareCommandRouting,
  assertSessionConfigTemplate,
  assertTargetHarnessConfig,
  assertSessionMemoryDocContracts,
  assertSessionStartReferenceContracts,
  assertSkillContractStructure,
  assertToolDiscoveryScript,
  assertToolFileContract,
  assertToolRoutingDocs,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  assertWorkflowDocumentationContracts,
  assertWorkerContract,
  validateRuntimeCommandSurface,
};
