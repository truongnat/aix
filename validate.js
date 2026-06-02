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
  "docs/skill-system.md",
  "docs/team-architecture-selection.md",
  "docs/memory-model.md",
  "docs/memory-safety.md",
  "docs/small-repo-memory.md",
  "docs/sdlc-execution-model.md",
  "docs/harness-build-contract.md",
  "docs/harness-build-usage.md",
  "docs/harness-build-review-checklist.md",
  "docs/harness-build-prompts.md",
  "docs/target-repo-validation.md",
  "docs/target-repo-validation-checklist.md",
  "docs/target-repo-validation-prompts.md",
  "docs/dogfood-notes.md",
  "docs/v0.2.0-readiness.md",
  "docs/v0.2.0-release-notes.md",
  "docs/v0.2.0-release-scope.md",
  "docs/v0.3.0-release-notes.md",
  "docs/v0.3.0-readiness.md",
  "docs/v0.3.0-release-scope.md",
  "docs/v0.3.1-release-notes.md",
  "docs/v0.4.0-plan.md",
  "docs/v0.4.0-readiness.md",
  "docs/v0.4.0-release-notes.md",
  "docs/v0.4.0-release-scope.md",
  "docs/v0.4.0-ideas.md",
  "docs/plugin-model.md",
  "docs/distribution-model.md",
  "docs/installed-surface-contract.md",
  "docs/consumption-modes.md",
  "docs/consume-as-pack.md",
  "docs/release-archive-model.md",
  "docs/release-archive-checklist.md",
  "docs/v0.5.0-strategy.md",
  "docs/v0.5.0-plan.md",
  "docs/v0.5.0-readiness.md",
  "docs/v0.5.0-release-scope.md",
  "docs/v0.3.0-plan.md",
  "docs/system-positioning.md",
  "docs/adoption-guide.md",
  "docs/install-output-example.md",
  "docs/install-to-profile-walkthrough.md",
  "docs/validation-troubleshooting.md",
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
  "skills/SKILL_AUTHORING_RULES.md",
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
  "examples/tiny-repo-adoption/README.md",
  "examples/tiny-repo-adoption/PROJECT.md",
  "examples/tiny-repo-adoption/HARNESS.md",
  "examples/tiny-repo-adoption/TEAM.md",
  "examples/tiny-repo-adoption/SKILLS.md",
  "examples/tiny-repo-adoption/WORKFLOW.md",
  "examples/tiny-repo-adoption/GATES.md",
  "examples/tiny-repo-adoption/MEMORY.md",
  "examples/tiny-repo-adoption/goals/health-check/GOAL.md",
  "examples/tiny-repo-adoption/goals/health-check/PLAN.md",
  "examples/tiny-repo-adoption/goals/health-check/TASKS.md",
  "examples/tiny-repo-adoption/goals/health-check/VERIFY.md",
  "examples/tiny-repo-adoption/goals/health-check/REMEMBER.md",
  "examples/harness-build/flutter-google-login/README.md",
  "examples/harness-build/flutter-google-login/PROJECT.md",
  "examples/harness-build/flutter-google-login/HARNESS.md",
  "examples/harness-build/flutter-google-login/TEAM.md",
  "examples/harness-build/flutter-google-login/SKILLS.md",
  "examples/harness-build/flutter-google-login/WORKFLOW.md",
  "examples/harness-build/flutter-google-login/GATES.md",
  "examples/harness-build/flutter-google-login/MEMORY.md",
  "examples/harness-build/flutter-google-login/goals/google-login/GOAL.md",
  "examples/harness-build/flutter-google-login/goals/google-login/PLAN.md",
  "examples/harness-build/flutter-google-login/goals/google-login/TASKS.md",
  "examples/harness-build/flutter-google-login/goals/google-login/VERIFY.md",
  "examples/harness-build/flutter-google-login/goals/google-login/REMEMBER.md",
  "commands/harness-build.md",
  "templates/HARNESS.md",
  "templates/TEAM.md",
  "templates/SKILLS.md",
  "templates/WORKFLOW.md",
  "templates/GATES.md",
  "templates/MEMORY.md",
  "templates/SMALL_MEMORY.md",
  "templates/TASK.md",
  "templates/EXECUTION.md",
  "templates/SKILL.md"
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
  "templates/TASK.md",
  "templates/EXECUTION.md",
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
const skillTemplateHeadings = [
  "## Purpose",
  "## Boundary",
  "## When To Use",
  "## When Not To Use",
  "## Workflow",
  "## Checklist Before Done"
];
const harnessHeadings = [
  "## Purpose",
  "## Current Status",
  "## Scope",
  "## Operating Model",
  "## Assumptions",
  "## Unknowns",
  "## Human Review"
];
const teamHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Pattern",
  "## Roles",
  "## Handoff Rules",
  "## Escalation Rules",
  "## Human Review"
];
const selectedSkillsHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Core Skills",
  "## Selected Skill Packs",
  "## Excluded Skills Or Packs",
  "## Human Review"
];
const workflowHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Workflow",
  "## Command Sequence",
  "## Execution Rules",
  "## Human Review"
];
const gatesHeadings = [
  "## Purpose",
  "## Current Status",
  "## Quality Gates",
  "## Evidence Requirements",
  "## Stop Conditions",
  "## Human Review"
];
const memoryHeadings = [
  "## Purpose",
  "## Current Status",
  "## Recall Before Planning",
  "## Remember After Shipping",
  "## Memory Types",
  "## Forbidden Content",
  "## Human Review"
];
const taskHeadings = [
  "## Task ID",
  "## Goal",
  "## Status",
  "## Scope",
  "## Steps",
  "## Verification",
  "## Completion Evidence",
  "## Safety Notes"
];
const executionHeadings = [
  "## Active Goal",
  "## Current Task",
  "## Execution Log",
  "## Deviations From Plan",
  "## Review Loop",
  "## Verification Loop",
  "## Current State",
  "## Next Step",
  "## Safety Notes"
];
const goalArtifactHeadings = {
  "examples/harness-build/flutter-google-login/goals/google-login/GOAL.md": [
    "## Goal",
    "## Scope",
    "## In Scope",
    "## Out Of Scope",
    "## Acceptance Criteria"
  ],
  "examples/harness-build/flutter-google-login/goals/google-login/PLAN.md": [
    "## Goal",
    "## Scope",
    "## Tasks",
    "## Verification Strategy",
    "## Risks",
    "## Human Approval"
  ],
  "examples/harness-build/flutter-google-login/goals/google-login/TASKS.md": [
    "## Goal",
    "## Task List",
    "## Review Notes",
    "## Current State"
  ],
  "examples/harness-build/flutter-google-login/goals/google-login/VERIFY.md": [
    "## Goal",
    "## Verification Commands",
    "## Manual Verification",
    "## Regression Checks",
    "## Not Run",
    "## Result",
    "## Evidence"
  ],
  "examples/harness-build/flutter-google-login/goals/google-login/REMEMBER.md": [
    "## Date",
    "## Project",
    "## Problem",
    "## Decision",
    "## Solution",
    "## Reuse Guidance",
    "## Sensitive Data Check"
  ]
};
const targetProfileFiles = [
  "AGENTS.md",
  ".harness/",
  ".harness/HARNESS.md",
  ".harness/TEAM.md",
  ".harness/SKILLS.md",
  ".harness/WORKFLOW.md",
  ".harness/GATES.md",
  ".harness/MEMORY.md"
];
const targetProfileHeadingContracts = [
  [".harness/HARNESS.md", harnessHeadings],
  [".harness/TEAM.md", teamHeadings],
  [".harness/SKILLS.md", selectedSkillsHeadings],
  [".harness/WORKFLOW.md", workflowHeadings],
  [".harness/GATES.md", gatesHeadings],
  [".harness/MEMORY.md", memoryHeadings]
];
const goalTemplateHeadings = Object.fromEntries(
  Object.entries(goalArtifactHeadings).map(([relativePath, headings]) => [path.basename(relativePath), headings])
);

function resolvePath(baseDir, relativePath) {
  return path.join(baseDir, relativePath);
}

function assertExists(baseDir, relativePath, failures) {
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required path: ${relativePath}`);
  }
}

function readFile(baseDir, relativePath) {
  return fs.readFileSync(resolvePath(baseDir, relativePath), "utf8");
}

function assertHeadings(baseDir, relativePath, headings, failures) {
  const fullPath = resolvePath(baseDir, relativePath);
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
  const fullPath = resolvePath(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = readFile(baseDir, relativePath).trim();
  if (content.length === 0) {
    failures.push(`${relativePath} is empty`);
  }
}

function assertAgentsContent(baseDir, failures) {
  const fullPath = resolvePath(baseDir, "AGENTS.md");
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
    skillTemplateHeadings.length +
    harnessHeadings.length * 2 +
    teamHeadings.length * 2 +
    selectedSkillsHeadings.length * 2 +
    workflowHeadings.length * 2 +
    gatesHeadings.length * 2 +
    memoryHeadings.length * 2 +
    taskHeadings.length +
    executionHeadings.length +
    Object.values(goalArtifactHeadings).reduce((sum, headings) => sum + headings.length, 0) +
    agentsRequiredHeadings.length
  );
}

function validateHarnessRepository(baseDir = root) {
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

  assertHeadings(baseDir, "templates/SKILL.md", skillTemplateHeadings, failures);
  assertHeadings(baseDir, "templates/HARNESS.md", harnessHeadings, failures);
  assertHeadings(baseDir, "templates/TEAM.md", teamHeadings, failures);
  assertHeadings(baseDir, "templates/SKILLS.md", selectedSkillsHeadings, failures);
  assertHeadings(baseDir, "templates/WORKFLOW.md", workflowHeadings, failures);
  assertHeadings(baseDir, "templates/GATES.md", gatesHeadings, failures);
  assertHeadings(baseDir, "templates/MEMORY.md", memoryHeadings, failures);
  assertHeadings(baseDir, "templates/TASK.md", taskHeadings, failures);
  assertHeadings(baseDir, "templates/EXECUTION.md", executionHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/HARNESS.md", harnessHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/TEAM.md", teamHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/SKILLS.md", selectedSkillsHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/WORKFLOW.md", workflowHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/GATES.md", gatesHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/MEMORY.md", memoryHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/HARNESS.md", harnessHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/TEAM.md", teamHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/SKILLS.md", selectedSkillsHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/WORKFLOW.md", workflowHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/GATES.md", gatesHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/MEMORY.md", memoryHeadings, failures);
  for (const [relativePath, headings] of Object.entries(goalArtifactHeadings)) {
    assertHeadings(baseDir, relativePath, headings, failures);
  }
  for (const [fileName, headings] of Object.entries(goalTemplateHeadings)) {
    assertHeadings(baseDir, `examples/tiny-repo-adoption/goals/health-check/${fileName}`, headings, failures);
  }
  assertAgentsContent(baseDir, failures);

  return failures;
}

function validateRepository(baseDir = root) {
  return validateHarnessRepository(baseDir);
}

function validateTargetProfile(baseDir) {
  const failures = [];

  for (const relativePath of targetProfileFiles) {
    assertExists(baseDir, relativePath, failures);
  }

  for (const [relativePath, headings] of targetProfileHeadingContracts) {
    assertHeadings(baseDir, relativePath, headings, failures);
  }

  return failures;
}

function validateTargetGoal(baseDir, goalId) {
  const failures = validateTargetProfile(baseDir);
  const goalDir = `.harness/goals/${goalId}`;

  for (const [fileName, headings] of Object.entries(goalTemplateHeadings)) {
    const relativePath = `${goalDir}/${fileName}`;
    assertExists(baseDir, relativePath, failures);
    assertHeadings(baseDir, relativePath, headings, failures);
  }

  return failures;
}

function parseValidateArgs(argv = []) {
  if (argv.length === 0) {
    return {
      mode: "harness-repository",
      baseDir: root
    };
  }

  if (argv[0] !== "--target") {
    return {
      usageErrors: [`Unsupported argument: ${argv[0]}`]
    };
  }

  if (argv.length < 2 || argv[1].startsWith("--")) {
    return {
      usageErrors: ["Missing required path after --target"]
    };
  }

  const baseDir = path.resolve(process.cwd(), argv[1]);
  let hasProfileOnly = false;
  let goalId = null;
  const usageErrors = [];

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--profile-only") {
      hasProfileOnly = true;
      continue;
    }

    if (arg === "--goal") {
      if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
        usageErrors.push("Missing required goal id after --goal");
        break;
      }
      goalId = argv[index + 1];
      index += 1;
      continue;
    }

    usageErrors.push(`Unsupported argument: ${arg}`);
    break;
  }

  if (hasProfileOnly && goalId) {
    usageErrors.push("--profile-only cannot be combined with --goal");
  }

  if (usageErrors.length > 0) {
    return { usageErrors };
  }

  if (goalId) {
    return {
      mode: "target-goal",
      baseDir,
      goalId
    };
  }

  return {
    mode: "target-profile",
    baseDir
  };
}

function main() {
  const args = parseValidateArgs(process.argv.slice(2));

  if (args.usageErrors && args.usageErrors.length > 0) {
    console.error("Validation usage error:");
    for (const error of args.usageErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const validationMode = args.mode;
  let failures;

  if (validationMode === "target-profile") {
    failures = validateTargetProfile(args.baseDir);
  } else if (validationMode === "target-goal") {
    failures = validateTargetGoal(args.baseDir, args.goalId);
  } else {
    failures = validateHarnessRepository(args.baseDir);
  }

  if (failures.length > 0) {
    console.error(
      validationMode === "target-profile" || validationMode === "target-goal"
        ? "Target repository validation failed:"
        : "Harness validation failed:"
    );
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  if (validationMode === "target-profile") {
    console.log("Target repository validation passed. Checked profile contract.");
    return;
  }

  if (validationMode === "target-goal") {
    console.log(`Target repository validation passed. Checked goal contract: ${args.goalId}.`);
    return;
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
  executionHeadings,
  gatesHeadings,
  goalArtifactHeadings,
  harnessHeadings,
  memoryHeadings,
  requiredFiles,
  parseValidateArgs,
  selectedSkillsHeadings,
  skillFiles,
  skillHeadings,
  skillTemplateHeadings,
  taskHeadings,
  teamHeadings,
  templateFiles,
  validateHarnessRepository,
  validateTargetGoal,
  validateTargetProfile,
  validateRepository
};
