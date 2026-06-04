const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { fileReferencesActivation } = require("../runtime-command-catalog.js");
const {
  promptTemplateHeadings,
  toolFileHeadings,
  packRequiredHeadings,
  TOOL_DISCOVERY_KEYS
} = require("./constants.js");
const {
  HARNESS_COMMAND_PATTERN,
  assertExists,
  extractMarkdownSection,
  hasConcreteFailureRule,
  hasSubstantiveSectionBody,
  readFile,
  resolvePath
} = require("./utils.js");

const skillContractSubstanceHeadings = [
  "## When Not To Use",
  "## Inputs",
  "## Output Contract",
  "## Common Failure Modes"
];

const DOGFOOD_DEMO_PREFIX = "examples/dogfood-tiny-node-api";

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
  "lib/command-surface-report.js",
  "lib/cli-ui.js"
];

const FORBIDDEN_COLON_COMMAND_PATTERNS = [
  { pattern: /\/harness:[a-z][a-z0-9-]*/i, label: "/harness:…" },
  { pattern: /\bharness:[a-z][a-z0-9-]*\b/i, label: "harness:…" },
  { pattern: /\/harness [a-z][a-z0-9-]*/i, label: "/harness …" },
  { pattern: /\bharness_[a-z][a-z0-9-]*\b/i, label: "harness_…" }
];

function assertCommandContractStructure(relativePath, content, failures) {
  for (const [heading, label] of [
    ["## Preconditions", "Preconditions"],
    ["## Required Outputs", "Required Outputs"]
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

function assertSkillContractStructure(relativePath, content, failures) {
  for (const heading of skillContractSubstanceHeadings) {
    const body = extractMarkdownSection(content, heading);
    if (body !== null && !hasSubstantiveSectionBody(body, { minChars: 10 })) {
      failures.push(
        `${relativePath}: ${heading.replace("## ", "")} must contain substantive contract content`
      );
    }
  }
}

function assertVerifyArtifactContent(relativePath, content, failures, options = {}) {
  const isTemplate = options.isTemplate ?? false;

  if (!/status:\s*(pending|passed|failed|blocked|partial|pending human verification)/i.test(content)) {
    failures.push(`${relativePath} must include a machine-readable status field`);
  }
  if (!/freshness:\s*.+/i.test(content)) {
    failures.push(`${relativePath} must include a machine-readable freshness field`);
  }

  const testsBody = extractMarkdownSection(content, "## Tests Run");
  if (testsBody === null || !hasSubstantiveSectionBody(testsBody, { minChars: 20 })) {
    failures.push(`${relativePath}: Tests Run must contain at least one substantive verification entry`);
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

function assertVerifyTemplateContract(baseDir, failures) {
  const relativePath = "templates/VERIFY.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  assertVerifyArtifactContent(relativePath, readFile(baseDir, relativePath), failures, {
    isTemplate: true
  });
}

function assertPlanTemplateContract(baseDir, failures) {
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

function assertReviewTemplateContract(baseDir, failures) {
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
    "## Review Status"
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertBlockedTemplateContract(baseDir, failures) {
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
    "## Notes"
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertPromptTemplateContract(relativePath, content, failures) {
  for (const heading of promptTemplateHeadings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
  if (/prompt-templates\/harness-(run|verify|ship)\.md$/.test(relativePath) && !content.includes("### Blocked")) {
    failures.push(`${relativePath} must include a ### Blocked output branch`);
  }
  if (/prompt-templates\/blocker-question\.md$/.test(relativePath)) {
    if (!/stop after asking|workflow is paused|no further phase was executed/i.test(content)) {
      failures.push(`${relativePath} must explicitly stop after asking the blocking question`);
    }
  }
}

function assertAgentsContent(baseDir, failures) {
  const relativePath = "AGENTS.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of [
    "## Completion Gate",
    "## Stop Conditions",
    "## Wrong Phase Behavior",
    "## Memory Discipline"
  ]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertPackContract(baseDir, failures) {
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

function assertToolFileContract(baseDir, relativePath, failures) {
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

function assertToolDiscoveryScript(baseDir, failures) {
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
      timeout: 30000
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

function assertToolRoutingDocs(baseDir, failures) {
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
    "dependency-scan"
  ]) {
    if (!content.includes(capability)) {
      failures.push(`${relativePath} must define capability route: ${capability}`);
    }
  }
}

function assertHyphenCommandNamingInActiveDocs(baseDir, failures) {
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

function assertPublicDemoPolish(baseDir, failures) {
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

function assertDogfoodDemoContract(baseDir, failures) {
  const verifyPath = `${DOGFOOD_DEMO_PREFIX}/.harness/VERIFY.md`;
  if (!fs.existsSync(resolvePath(baseDir, verifyPath))) {
    return;
  }
  const verify = readFile(baseDir, verifyPath);
  if (!/status:\s*passed/i.test(verify)) {
    failures.push(`${verifyPath} must include status: passed`);
  }
}

function validateRuntimeCommandSurface(baseDir, failures) {
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
      failures.push(".ai-harness/runtime-commands/harness-plan.md must reference .ai-harness/activation.md");
    }
  }

  const claudePlan = path.join(baseDir, ".claude/commands/harness-plan.md");
  if (fs.existsSync(claudePlan) && !fileReferencesActivation(claudePlan)) {
    failures.push(".claude/commands/harness-plan.md must reference .ai-harness/activation.md");
  }
}

module.exports = {
  ACTIVE_COMMAND_NAMING_PATHS,
  DOGFOOD_DEMO_PREFIX,
  assertAgentsContent,
  assertBlockedTemplateContract,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPackContract,
  assertPlanTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertReviewTemplateContract,
  assertSkillContractStructure,
  assertToolDiscoveryScript,
  assertToolFileContract,
  assertToolRoutingDocs,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  validateRuntimeCommandSurface
};
