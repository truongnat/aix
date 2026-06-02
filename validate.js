const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;

const requiredFiles = [
  "CHANGELOG.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "SECURITY.md",
  "TARGET.md",
  "docs/gap-analysis.md",
  "docs/system-positioning.md",
  "docs/adoption-guide.md",
  "docs/adoption-smoke-test.md",
  "docs/usage-examples.md",
  "docs/host-repo-checklist.md",
  "docs/repository-profile.md",
  "docs/release-checklist.md",
  "docs/session-start-checklist.md",
  "docs/v0.1.0-release-notes.md",
  "docs/versioning.md",
  "docs/quality-gates-matrix.md",
  "docs/runtime-compatibility.md",
  "docs/runtimes/README.md",
  "docs/runtimes/claude-code.md",
  "docs/runtimes/cursor.md",
  "docs/runtimes/codex.md",
  "docs/runtimes/gemini-cli.md",
  "docs/runtimes/opencode.md",
  "skills/packs/README.md",
  "skills/packs/frontend.md",
  "skills/packs/backend.md",
  "skills/packs/mobile.md",
  "skills/packs/devops.md",
  "skills/packs/debugging.md",
  "examples/workflows/README.md",
  "examples/workflows/feature-google-login.md",
  "examples/workflows/bugfix-stale-widget-data.md",
  "examples/workflows/refactor-auth-boundary.md",
  "examples/workflows/incident-api-errors.md",
  "commands/harness-build.md",
  "templates/HARNESS.md",
  "templates/TEAM.md",
  "templates/SKILLS.md",
  "templates/WORKFLOW.md",
  "templates/GATES.md",
  "templates/MEMORY.md"
];

const commandFiles = [
  "commands/harness-map.md",
  "commands/harness-start.md",
  "commands/harness-discuss.md",
  "commands/harness-build.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
  "commands/harness-remember.md"
];

const skillFiles = [
  "skills/using-harness/SKILL.md",
  "skills/mapping-codebase/SKILL.md",
  "skills/discussing-goals/SKILL.md",
  "skills/writing-plans/SKILL.md",
  "skills/executing-plans/SKILL.md",
  "skills/test-driven-development/SKILL.md",
  "skills/code-review/SKILL.md",
  "skills/verification/SKILL.md",
  "skills/remembering/SKILL.md",
  "skills/writing-skills/SKILL.md"
];

const commandHeadings = [
  "## Purpose",
  "## When To Use",
  "## Required Reads",
  "## Skills To Use",
  "## Step-By-Step Workflow",
  "## Output Artifacts",
  "## Completion Gate"
];

const skillHeadings = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Workflow",
  "## Operating Principles",
  "## Output Format",
  "## Checklist Before Done"
];

const templateFiles = [
  "templates/PROJECT.md",
  "templates/HARNESS.md",
  "templates/TEAM.md",
  "templates/SKILLS.md",
  "templates/WORKFLOW.md",
  "templates/GATES.md",
  "templates/MEMORY.md",
  "templates/REQUIREMENTS.md",
  "templates/ROADMAP.md",
  "templates/STATE.md",
  "templates/CONTEXT.md",
  "templates/GOAL.md",
  "templates/DISCUSSION.md",
  "templates/PLAN.md",
  "templates/TASKS.md",
  "templates/REVIEW.md",
  "templates/VERIFY.md",
  "templates/SHIP.md",
  "templates/REMEMBER.md"
];

const agentsRequiredHeadings = ["## Completion Gate", "## Memory Discipline"];

function assertExists(baseDir, relativePath, failures) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required path: ${relativePath}`);
  }
}

function readFile(baseDir, relativePath) {
  return fs.readFileSync(path.join(baseDir, relativePath), "utf8");
}

function assertHeadings(baseDir, relativePath, headings, failures) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = readFile(baseDir, relativePath);
  for (const heading of headings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertNonEmpty(baseDir, relativePath, failures) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = readFile(baseDir, relativePath).trim();
  if (content.length === 0) {
    failures.push(`${relativePath} is empty`);
  }
}

function assertAgentsContent(baseDir, failures) {
  const fullPath = path.join(baseDir, "AGENTS.md");
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = readFile(baseDir, "AGENTS.md");
  for (const heading of agentsRequiredHeadings) {
    if (!content.includes(heading)) {
      failures.push(`AGENTS.md is missing heading: ${heading}`);
    }
  }
}

function countCheckedContracts() {
  return (
    requiredFiles.length +
    commandFiles.length * commandHeadings.length +
    skillFiles.length * skillHeadings.length +
    templateFiles.length +
    agentsRequiredHeadings.length
  );
}

function validateRepository(baseDir = root) {
  const failures = [];

  for (const relativePath of requiredFiles) {
    assertExists(baseDir, relativePath, failures);
  }

  for (const relativePath of commandFiles) {
    assertHeadings(baseDir, relativePath, commandHeadings, failures);
  }

  for (const relativePath of skillFiles) {
    assertHeadings(baseDir, relativePath, skillHeadings, failures);
  }

  for (const relativePath of templateFiles) {
    assertNonEmpty(baseDir, relativePath, failures);
  }

  assertAgentsContent(baseDir, failures);

  return failures;
}

function main() {
  const failures = validateRepository(root);

  if (failures.length > 0) {
    console.error("Harness validation failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Harness validation passed. Checked ${countCheckedContracts()} required files/contracts.`);
}

if (require.main === module) {
  main();
}

module.exports = {
  commandFiles,
  commandHeadings,
  countCheckedContracts,
  requiredFiles,
  skillFiles,
  skillHeadings,
  templateFiles,
  validateRepository
};
