const fs = require("node:fs");
const path = require("node:path");
const { fileReferencesActivation } = require("./runtime-command-catalog.js");

const root = path.resolve(__dirname, "..");

const requiredFiles = [
  "CHANGELOG.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "SECURITY.md",
  "TARGET.md",
  "PACK.md",
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
  "docs/v0.5.0-release-notes.md",
  "docs/v0.5.0-release-scope.md",
  "docs/v0.6.0-plan.md",
  "docs/v0.7.0-plan.md",
  "docs/v0.7.0-readiness.md",
  "docs/v0.7.0-release-scope.md",
  "docs/v0.7.0-release-notes.md",
  "docs/v0.8.0-plan.md",
  "docs/v0.8.0-readiness.md",
  "docs/v0.8.0-release-scope.md",
  "docs/v0.8.0-release-notes.md",
  "docs/v0.9.0-plan.md",
  "docs/v0.9.0-readiness.md",
  "docs/v0.9.0-release-scope.md",
  "docs/v0.9.0-release-notes.md",
  "docs/plugin-install-ux.md",
  "docs/runtime-install-matrix-research.md",
  "docs/interactive-installer-design.md",
  "docs/project-state-policy.md",
  "docs/harness-init-usage.md",
  "install-runtime.js",
  "runtime/README.md",
  "docs/runtime-native-install.md",
  "docs/runtime-native-install-audit.md",
  "docs/runtime-native-install-dogfood-plan.md",
  "docs/one-line-installer-design.md",
  "docs/plugin-install-security.md",
  "docs/install-sh-usage.md",
  "aih.sh",
  "aih.ps1",
  "bin/aih.js",
  "docs/npx-cli-ux.md",
  "docs/terminal-wizard-ux.md",
  "docs/runtime-command-surface.md",
  "docs/provider-native-command-research.md",
  "docs/provider-command-matrix.md",
  "docs/command-guardrails.md",
  "docs/codex-plugin-support.md",
  "docs/harness-command-behavior.md",
  "docs/workflow-visualization.md",
  "docs/distillation-superpowers-gsd.md",
  "docs/forensics-lite.md",
  ".cursor-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  "gemini-extension.json",
  "hooks/hooks-cursor.json",
  "docs/v0.10.0-release-notes.md",
  "docs/v0.10.2-release-notes.md",
  "docs/v0.10.6-release-notes.md",
  "docs/v0.10.7-release-notes.md",
  "docs/v0.10.8-release-notes.md",
  "docs/v0.11.0-release-notes.md",
  "docs/npm-publish.md",
  "runtime-command-catalog.js",
  "install.sh",
  "docs/stable-contract-index.md",
  "docs/breaking-change-policy.md",
  "docs/minimal-install-tier-decision.md",
  "docs/frozen-pack-contract.md",
  "docs/frozen-installed-surface-contract.md",
  "docs/frozen-target-profile-contract.md",
  "docs/frozen-goal-artifact-contract.md",
  "docs/frozen-validation-contract.md",
  "docs/frozen-runtime-consumption-contract.md",
  "docs/frozen-packaging-release-contract.md",
  "docs/frozen-source-target-boundary-contract.md",
  "docs/pack-dogfood-scenarios.md",
  "docs/pack-dogfood-report-template.md",
  "docs/pack-dogfood-friction-log.md",
  "docs/pack-dogfood-follow-up-backlog.md",
  "docs/harness-example-to-target-layout.md",
  "docs/pack-dogfood-reports/scenario-a-tiny-health-check.md",
  "docs/pack-dogfood-reports/scenario-b-frontend-mobile-feature.md",
  "docs/pack-dogfood-reports/scenario-c-one-line-installer.md",
  "docs/pack-dogfood-reports/scenario-d1-generic-project.md",
  "docs/pack-dogfood-reports/scenario-d2-codex-project.md",
  "docs/pack-dogfood-reports/scenario-d3-cursor-project.md",
  "docs/pack-dogfood-reports/scenario-d4-opencode-project.md",
  "docs/pack-dogfood-reports/scenario-d5-gemini.md",
  "docs/pack-dogfood-reports/scenario-d6-claude.md",
  "docs/pack-dogfood-reports/scenario-e1-cursor-private-git-hygiene.md",
  "docs/pack-dogfood-reports/scenario-f1-simple-cli-lifecycle.md",
  "docs/runtime-dogfood-summary.md",
  "docs/v0.9.x-readiness.md",
  "docs/v0.9.x-release-scope.md",
  "docs/v0.9.1-release-notes.md",
  "docs/v0.9.2-release-notes.md",
  "docs/installer-ux-v0.9.2-plan.md",
  "docs/git-hygiene-policy.md",
  "docs/install-command-model.md",
  "docs/uninstall-update-design.md",
  "docs/uninstall-usage.md",
  "docs/update-usage.md",
  "docs/simple-cli-ux.md",
  "docs/antigravity-provider-research.md",
  "docs/private-install-git-hygiene.md",
  "docs/private-capability-cache.md",
  "docs/runtime-aware-validation.md",
  "docs/packaging-model.md",
  "docs/pack-manifest-spec.md",
  "docs/pack-verification-checklist.md",
  "docs/manual-packaging-guide.md",
  "docs/v0.6.0-readiness.md",
  "docs/v0.6.0-release-notes.md",
  "docs/v0.6.0-release-scope.md",
  "docs/runtime-consumption-model.md",
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
  "docs/runtimes/comparison.md",
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
  "examples/tiny-repo-adoption/DECISIONS.md",
  "examples/tiny-repo-adoption/HAZARDS.md",
  "examples/tiny-repo-adoption/INDEX.md",
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
  "examples/harness-build/flutter-google-login/DECISIONS.md",
  "examples/harness-build/flutter-google-login/HAZARDS.md",
  "examples/harness-build/flutter-google-login/INDEX.md",
  "examples/harness-build/flutter-google-login/goals/google-login/GOAL.md",
  "examples/harness-build/flutter-google-login/goals/google-login/PLAN.md",
  "examples/harness-build/flutter-google-login/goals/google-login/TASKS.md",
  "examples/harness-build/flutter-google-login/goals/google-login/VERIFY.md",
  "examples/harness-build/flutter-google-login/goals/google-login/REMEMBER.md",
  "examples/dogfood-tiny-node-api/README.md",
  "examples/dogfood-tiny-node-api/TRANSCRIPT.md",
  ".github/workflows/ci.yml",
  "examples/dogfood-tiny-node-api/package.json",
  "examples/dogfood-tiny-node-api/src/server.js",
  "examples/dogfood-tiny-node-api/test/health.test.js",
  "examples/dogfood-tiny-node-api/.harness/GOAL.md",
  "examples/dogfood-tiny-node-api/.harness/DISCUSSION.md",
  "examples/dogfood-tiny-node-api/.harness/PLAN.md",
  "examples/dogfood-tiny-node-api/.harness/TASKS.md",
  "examples/dogfood-tiny-node-api/.harness/VERIFY.md",
  "examples/dogfood-tiny-node-api/.harness/SHIP.md",
  "examples/dogfood-tiny-node-api/.harness/REMEMBER.md",
  "commands/harness-build.md",
  "templates/HARNESS.md",
  "templates/TEAM.md",
  "templates/SKILLS.md",
  "templates/WORKFLOW.md",
  "templates/GATES.md",
  "templates/MEMORY.md",
  "templates/DECISIONS.md",
  "templates/HAZARDS.md",
  "templates/INDEX.md",
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
  "skills/brainstorming/SKILL.md",
  "skills/writing-plans/SKILL.md",
  "skills/executing-plans/SKILL.md",
  "skills/using-git-worktrees/SKILL.md",
  "skills/test-driven-development/SKILL.md",
  "skills/code-review/SKILL.md",
  "skills/requesting-code-review/SKILL.md",
  "skills/verification/SKILL.md",
  "skills/verification-before-completion/SKILL.md",
  "skills/remembering/SKILL.md",
  "skills/writing-skills/SKILL.md"
];

const commandHeadings = [
  "## Purpose",
  "## Minimum Read Set",
  "## Preconditions",
  "## Required Outputs",
  "## Redirect Behavior",
  "## Failure Conditions",
  "## Completion Gate"
];

const skillHeadings = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Workflow",
  "## Operating Principles",
  "## Output Contract",
  "## Common Failure Modes",
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
  "templates/BLOCKED.md",
  "templates/TASKS.md",
  "templates/REVIEW.md",
  "templates/VERIFY.md",
  "templates/SHIP.md",
  "templates/REMEMBER.md"
];

const agentsRequiredHeadings = [
  "## Completion Gate",
  "## Stop Conditions",
  "## Wrong Phase Behavior",
  "## Memory Discipline"
];
const packRequiredHeadings = [
  "## Pack Name",
  "## Pack Version",
  "## Pack Type",
  "## Purpose",
  "## Included Surface",
  "## Consumption Modes",
  "## Runtime Compatibility",
  "## Validation Commands",
  "## Safety Boundaries",
  "## Non-Goals"
];
const skillTemplateHeadings = [
  "## Purpose",
  "## Boundary",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Workflow",
  "## Output Contract",
  "## Common Failure Modes",
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
const decisionsHeadings = ["## How To Use This Artifact", "## Entry Template"];
const hazardsHeadings = ["## How To Use This Artifact", "## Entry Template"];
const indexHeadings = [
  "## How To Use This Artifact",
  "## Reusable Commands",
  "## Verification Recipes",
  "## Useful References"
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
    "## Approval Status",
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
    "## Status",
    "## Tests Run",
    "## Manual Checks",
    "## Evidence",
    "## Known Gaps"
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
const VALID_TARGET_RUNTIMES = [
  "generic",
  "codex",
  "cursor",
  "gemini",
  "claude",
  "manual"
];

const targetHarnessProfileFiles = [
  ".harness/",
  ".harness/HARNESS.md",
  ".harness/TEAM.md",
  ".harness/SKILLS.md",
  ".harness/WORKFLOW.md",
  ".harness/GATES.md",
  ".harness/MEMORY.md"
  ,".harness/DECISIONS.md"
  ,".harness/HAZARDS.md"
  ,".harness/INDEX.md"
];

const targetProfileFiles = ["AGENTS.md", ...targetHarnessProfileFiles];

function normalizeTargetRuntime(runtime) {
  return runtime;
}

function getRuntimeBootstrapPaths(runtime) {
  const normalized = normalizeTargetRuntime(runtime);
  switch (normalized) {
    case "generic":
    case "codex":
    case "manual":
      return ["AGENTS.md"];
    case "cursor":
      return [".cursor/rules/ai-engineering-harness.mdc"];
    case "gemini":
      return [
        ".gemini/extensions/ai-engineering-harness/gemini-extension.json",
        ".gemini/extensions/ai-engineering-harness/GEMINI.md"
      ];
    case "claude":
      return [".claude/CLAUDE.md", ".claude/settings.json"];
    default:
      return null;
  }
}

function isValidTargetRuntime(runtime) {
  return VALID_TARGET_RUNTIMES.includes(runtime);
}
const targetProfileHeadingContracts = [
  [".harness/HARNESS.md", harnessHeadings],
  [".harness/TEAM.md", teamHeadings],
  [".harness/SKILLS.md", selectedSkillsHeadings],
  [".harness/WORKFLOW.md", workflowHeadings],
  [".harness/GATES.md", gatesHeadings],
  [".harness/MEMORY.md", memoryHeadings],
  [".harness/DECISIONS.md", decisionsHeadings],
  [".harness/HAZARDS.md", hazardsHeadings],
  [".harness/INDEX.md", indexHeadings]
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

const CONTRACT_PLACEHOLDER_BULLETS = new Set([
  "tbd",
  "todo",
  "fixme",
  "n/a",
  "na",
  "none",
  "-",
  "—",
  "...",
  "placeholder",
  "[ ]",
  "[]"
]);

const HARNESS_COMMAND_PATTERN = /harness-[a-z][a-z0-9-]*/;

function extractMarkdownSection(content, heading) {
  const index = content.indexOf(heading);
  if (index === -1) {
    return null;
  }
  const bodyStart = index + heading.length;
  const rest = content.slice(bodyStart);
  const nextHeading = rest.search(/\n## /);
  const body = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return body.trim();
}

function isPlaceholderBullet(text) {
  const bullet = text.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
  if (bullet.length < 2) {
    return true;
  }
  const lower = bullet.toLowerCase();
  if (CONTRACT_PLACEHOLDER_BULLETS.has(lower)) {
    return true;
  }
  if (/^tbd\b/i.test(bullet)) {
    return true;
  }
  if (/^\[?\s*\]?\s*$/.test(bullet)) {
    return true;
  }
  return false;
}

function hasSubstantiveSectionBody(sectionBody, options = {}) {
  const minChars = options.minChars ?? 12;
  if (!sectionBody || !sectionBody.trim()) {
    return false;
  }
  const lines = sectionBody
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  let substantiveChars = 0;
  let substantiveLines = 0;
  for (const line of lines) {
    if (isPlaceholderBullet(line)) {
      continue;
    }
    const bullet = line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim();
    if (bullet.length < 3) {
      continue;
    }
    substantiveLines += 1;
    substantiveChars += bullet.length;
  }
  return substantiveLines > 0 && substantiveChars >= minChars;
}

function hasConcreteFailureRule(sectionBody) {
  if (!sectionBody || !sectionBody.trim()) {
    return false;
  }
  const lines = sectionBody.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.some((line) => {
    if (isPlaceholderBullet(line)) {
      return false;
    }
    const text = line.replace(/^[-*]\s*/, "").trim();
    return /^(?:Do not|Never|Must not|Stop|Block|Reject|Avoid)\b/i.test(text);
  });
}

function assertCommandContractStructure(relativePath, content, failures) {
  const sections = [
    { heading: "## Preconditions", label: "Preconditions" },
    { heading: "## Required Outputs", label: "Required Outputs" }
  ];
  for (const { heading, label } of sections) {
    const body = extractMarkdownSection(content, heading);
    if (body === null) {
      continue;
    }
    if (!hasSubstantiveSectionBody(body)) {
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
      `${relativePath}: Failure Conditions must include at least one concrete negative rule (e.g. Do not …)`
    );
  }

  if (/commands\/harness-(plan|run|verify|ship)\.md$/.test(relativePath)) {
    const blockingBody = extractMarkdownSection(content, "## Blocking Questions");
    if (blockingBody === null || !hasSubstantiveSectionBody(blockingBody, { minChars: 24 })) {
      failures.push(
        `${relativePath}: Blocking Questions must explain when the agent must stop and ask the user`
      );
    }
    if (blockingBody !== null && !/ask the user|stop/i.test(blockingBody)) {
      failures.push(
        `${relativePath}: Blocking Questions must explicitly require stop-and-ask behavior`
      );
    }
  }
}

const skillContractSubstanceHeadings = [
  "## When Not To Use",
  "## Inputs",
  "## Output Contract",
  "## Common Failure Modes"
];

function assertSkillContractStructure(relativePath, content, failures) {
  for (const heading of skillContractSubstanceHeadings) {
    const body = extractMarkdownSection(content, heading);
    if (body === null) {
      continue;
    }
    if (!hasSubstantiveSectionBody(body, { minChars: 10 })) {
      failures.push(
        `${relativePath}: ${heading.replace("## ", "")} must contain substantive contract content`
      );
    }
  }
}

function assertVerifyTemplateContract(baseDir, failures) {
  const relativePath = "templates/VERIFY.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  assertVerifyArtifactContent(relativePath, content, failures, { isTemplate: true });
}

function assertVerifyArtifactContent(relativePath, content, failures, options = {}) {
  const isTemplate = options.isTemplate ?? false;

  if (!/status:\s*(pending|passed|failed|blocked|partial|pending human verification)/i.test(content)) {
    failures.push(
      `${relativePath} must include a machine-readable status field (status: pending|passed|failed|blocked|partial|pending human verification)`
    );
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
    const onlyNone =
      /^\s*-?\s*None\s*\.?\s*$/im.test(gapsBody.trim()) ||
      (gapsBody.trim().toLowerCase() === "none");
    if (onlyNone) {
      failures.push(
        `${relativePath}: Known Gaps must not default to "None" (use pending wording such as "Not assessed yet.")`
      );
    }
    if (!hasSubstantiveSectionBody(gapsBody, { minChars: 8 })) {
      failures.push(`${relativePath}: Known Gaps must contain substantive pending wording`);
    }
  }

  const blockersBody = extractMarkdownSection(content, "## Ship Blockers");
  if (blockersBody === null || !hasSubstantiveSectionBody(blockersBody, { minChars: 12 })) {
    failures.push(`${relativePath}: Ship Blockers must contain an explicit blocker statement`);
  }

  if (isTemplate) {
    const evidenceBody = extractMarkdownSection(content, "## Evidence");
    if (evidenceBody === null || !hasSubstantiveSectionBody(evidenceBody, { minChars: 20 })) {
      failures.push(`${relativePath}: Evidence must contain structured summary prompts`);
    }
    const humanChecksBody = extractMarkdownSection(content, "## Deferred Human Checks");
    if (humanChecksBody === null || !hasSubstantiveSectionBody(humanChecksBody, { minChars: 20 })) {
      failures.push(`${relativePath}: Deferred Human Checks must contain structured prompts`);
    }
  }
}

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
  "docs/command-guardrails.md",
  "docs/workflow-visualization.md",
  "runtime-command-catalog.js",
  "lib/command-surface-report.js",
  "lib/cli-ui.js"
];

const FORBIDDEN_COLON_COMMAND_PATTERNS = [
  { pattern: /\/harness:[a-z][a-z0-9-]*/, label: "/harness:…" },
  { pattern: /\bharness:[a-z][a-z0-9-]*\b/, label: "harness:…" },
  { pattern: /\/harness [a-z][a-z0-9-]*/i, label: "/harness …" },
  { pattern: /\bharness_[a-z][a-z0-9-]*\b/i, label: "harness_…" }
];

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

  const commandsDir = resolvePath(baseDir, "commands");
  if (!fs.existsSync(commandsDir)) {
    return;
  }
  for (const fileName of fs.readdirSync(commandsDir)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }
    const relativePath = `commands/${fileName}`;
    const content = readFile(baseDir, relativePath);
    for (const { pattern, label } of FORBIDDEN_COLON_COMMAND_PATTERNS) {
      if (pattern.test(content)) {
        failures.push(
          `${relativePath} must use hyphen-form command IDs, not colon form (${label})`
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
  if (!readme.includes("actions/workflows/ci.yml/badge.svg")) {
    failures.push(`${readmePath} must include CI workflow badge for ci.yml`);
  }

  const ciPath = ".github/workflows/ci.yml";
  if (!fs.existsSync(resolvePath(baseDir, ciPath))) {
    failures.push(`Missing required path: ${ciPath}`);
    return;
  }
  const ci = readFile(baseDir, ciPath);
  for (const snippet of ["node validate.js", "npm test", "examples/dogfood-tiny-node-api"]) {
    if (!ci.includes(snippet)) {
      failures.push(`${ciPath} must run: ${snippet}`);
    }
  }
}

function assertDogfoodDemoContract(baseDir, failures) {
  const planPath = `${DOGFOOD_DEMO_PREFIX}/.harness/PLAN.md`;
  const verifyPath = `${DOGFOOD_DEMO_PREFIX}/.harness/VERIFY.md`;
  const rememberPath = `${DOGFOOD_DEMO_PREFIX}/.harness/REMEMBER.md`;

  if (!fs.existsSync(resolvePath(baseDir, planPath))) {
    return;
  }

  const plan = readFile(baseDir, planPath);
  if (!/status:\s*approved/i.test(plan)) {
    failures.push(`${planPath} must include status: approved for dogfood demo`);
  }
  if (!/approved_by:\s*dogfood maintainer/i.test(plan)) {
    failures.push(`${planPath} must include approved_by: dogfood maintainer`);
  }
  if (!/approved_at:\s*2026-06-03/i.test(plan)) {
    failures.push(`${planPath} must include approved_at: 2026-06-03`);
  }

  if (!fs.existsSync(resolvePath(baseDir, verifyPath))) {
    return;
  }

  const verify = readFile(baseDir, verifyPath);
  if (!/status:\s*passed/i.test(verify)) {
    failures.push(`${verifyPath} must include status: passed with real verification evidence`);
  }
  if (!/npm test/i.test(verify)) {
    failures.push(`${verifyPath} Tests Run must reference npm test with results`);
  }
  if (!/## Evidence/i.test(verify) || !hasSubstantiveSectionBody(extractMarkdownSection(verify, "## Evidence"), { minChars: 20 })) {
    failures.push(`${verifyPath} Evidence must summarize real command output`);
  }

  const shipPath = `${DOGFOOD_DEMO_PREFIX}/.harness/SHIP.md`;
  if (fs.existsSync(resolvePath(baseDir, shipPath))) {
    const ship = readFile(baseDir, shipPath);
    if (/production deployment complete/i.test(ship) && !/not shipped/i.test(ship)) {
      failures.push(`${shipPath} must not overclaim beyond VERIFY evidence`);
    }
  }

  if (fs.existsSync(resolvePath(baseDir, rememberPath))) {
    const remember = readFile(baseDir, rememberPath);
    if (!hasSubstantiveSectionBody(extractMarkdownSection(remember, "## Reuse Guidance"), { minChars: 15 })) {
      failures.push(`${rememberPath} must capture at least one durable lesson in Reuse Guidance`);
    }
  }
}

function assertPlanTemplateContract(baseDir, failures) {
  const relativePath = "templates/PLAN.md";
  if (!fs.existsSync(resolvePath(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
    return;
  }
  const content = readFile(baseDir, relativePath);
  if (!content.includes("## Approval Status")) {
    failures.push(`${relativePath} is missing heading: ## Approval Status`);
  }
  for (const heading of ["## Success Criteria", "## Approval Checkpoints"]) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
  if (!/status:\s*(draft|approved|blocked)/i.test(content)) {
    failures.push(
      `${relativePath} must include approval status field (status: draft|approved|blocked)`
    );
  }
  if (!/approved_by:/i.test(content) || !/approved_at:/i.test(content)) {
    failures.push(`${relativePath} must include approved_by: and approved_at: fields`);
  }
  if (!/Verification for this task cluster:/i.test(content)) {
    failures.push(`${relativePath} must prompt for task-level verification expectations`);
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
  if (!/status:\s*blocked/i.test(content)) {
    failures.push(`${relativePath} must include status: blocked`);
  }
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
    agentsRequiredHeadings.length +
    packRequiredHeadings.length
  );
}

function validateHarnessRepository(baseDir = root) {
  const failures = [];

  for (const relativePath of requiredFiles) {
    assertExists(baseDir, relativePath, failures);
  }

  for (const relativePath of commandFiles) {
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing required path: ${relativePath}`);
      continue;
    }
    const content = readFile(baseDir, relativePath);
    assertHeadings(baseDir, relativePath, commandHeadings, failures);
    assertCommandContractStructure(relativePath, content, failures);
  }

  for (const relativePath of skillFiles) {
    const fullPath = resolvePath(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing required path: ${relativePath}`);
      continue;
    }
    const content = readFile(baseDir, relativePath);
    assertHeadings(baseDir, relativePath, skillHeadings, failures);
    assertSkillContractStructure(relativePath, content, failures);
  }

  assertVerifyTemplateContract(baseDir, failures);
  assertPlanTemplateContract(baseDir, failures);
  assertBlockedTemplateContract(baseDir, failures);
  assertReviewTemplateContract(baseDir, failures);
  assertDogfoodDemoContract(baseDir, failures);
  assertHyphenCommandNamingInActiveDocs(baseDir, failures);
  assertPublicDemoPolish(baseDir, failures);

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
  assertHeadings(baseDir, "templates/DECISIONS.md", decisionsHeadings, failures);
  assertHeadings(baseDir, "templates/HAZARDS.md", hazardsHeadings, failures);
  assertHeadings(baseDir, "templates/INDEX.md", indexHeadings, failures);
  assertHeadings(baseDir, "templates/TASK.md", taskHeadings, failures);
  assertHeadings(baseDir, "templates/EXECUTION.md", executionHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/HARNESS.md", harnessHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/TEAM.md", teamHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/SKILLS.md", selectedSkillsHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/WORKFLOW.md", workflowHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/GATES.md", gatesHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/MEMORY.md", memoryHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/DECISIONS.md", decisionsHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/HAZARDS.md", hazardsHeadings, failures);
  assertHeadings(baseDir, "examples/harness-build/flutter-google-login/INDEX.md", indexHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/HARNESS.md", harnessHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/TEAM.md", teamHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/SKILLS.md", selectedSkillsHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/WORKFLOW.md", workflowHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/GATES.md", gatesHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/MEMORY.md", memoryHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/DECISIONS.md", decisionsHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/HAZARDS.md", hazardsHeadings, failures);
  assertHeadings(baseDir, "examples/tiny-repo-adoption/INDEX.md", indexHeadings, failures);
  for (const [relativePath, headings] of Object.entries(goalArtifactHeadings)) {
    assertHeadings(baseDir, relativePath, headings, failures);
  }
  for (const [fileName, headings] of Object.entries(goalTemplateHeadings)) {
    assertHeadings(baseDir, `examples/tiny-repo-adoption/goals/health-check/${fileName}`, headings, failures);
  }
  assertAgentsContent(baseDir, failures);
  assertHeadings(baseDir, "PACK.md", packRequiredHeadings, failures);

  return failures;
}

function validateRepository(baseDir = root) {
  return validateHarnessRepository(baseDir);
}

function validateRuntimeCommandSurface(baseDir, failures) {
  const cacheDir = path.join(baseDir, ".ai-harness");
  if (!fs.existsSync(cacheDir)) {
    return;
  }

  assertExists(baseDir, ".ai-harness/activation.md", failures);
  assertExists(baseDir, ".ai-harness/manifest.json", failures);
  assertExists(baseDir, ".ai-harness/runtime-commands/harness-plan.md", failures);

  const planCatalog = path.join(baseDir, ".ai-harness/runtime-commands/harness-plan.md");
  if (fs.existsSync(planCatalog)) {
    const text = fs.readFileSync(planCatalog, "utf8");
    if (!text.includes(".ai-harness/activation.md")) {
      failures.push(
        ".ai-harness/runtime-commands/harness-plan.md must reference .ai-harness/activation.md"
      );
    }
    if (!text.includes(".ai-harness/commands/harness-plan.md")) {
      failures.push(
        ".ai-harness/runtime-commands/harness-plan.md must reference .ai-harness/commands/harness-plan.md"
      );
    }
  }

  const claudePlan = path.join(baseDir, ".claude/commands/harness-plan.md");
  if (fs.existsSync(claudePlan) && !fileReferencesActivation(claudePlan)) {
    failures.push(".claude/commands/harness-plan.md must reference .ai-harness/activation.md");
  }

  const cursorRule = path.join(baseDir, ".cursor/rules/ai-engineering-harness-commands.mdc");
  if (fs.existsSync(cursorRule) && !fileReferencesActivation(cursorRule)) {
    failures.push(
      ".cursor/rules/ai-engineering-harness-commands.mdc must reference .ai-harness/activation.md"
    );
  }
}

function validateTargetHarnessProfile(baseDir) {
  const failures = [];

  for (const relativePath of targetHarnessProfileFiles) {
    assertExists(baseDir, relativePath, failures);
  }

  for (const [relativePath, headings] of targetProfileHeadingContracts) {
    assertHeadings(baseDir, relativePath, headings, failures);
  }

  validateRuntimeCommandSurface(baseDir, failures);

  return failures;
}

function validateRuntimeBootstrap(baseDir, runtime) {
  const failures = [];
  const bootstrapPaths = getRuntimeBootstrapPaths(runtime);

  if (!bootstrapPaths) {
    failures.push(`Unsupported runtime: ${runtime}`);
    return failures;
  }

  for (const relativePath of bootstrapPaths) {
    assertExists(baseDir, relativePath, failures);
  }

  return failures;
}

function validateTargetProfile(baseDir, runtime) {
  const failures = validateTargetHarnessProfile(baseDir);

  if (runtime) {
    failures.push(...validateRuntimeBootstrap(baseDir, runtime));
  } else {
    assertExists(baseDir, "AGENTS.md", failures);
  }

  return failures;
}

function validateTargetGoal(baseDir, goalId, runtime) {
  const failures = validateTargetProfile(baseDir, runtime);
  const goalDir = `.harness/goals/${goalId}`;

  for (const [fileName, headings] of Object.entries(goalTemplateHeadings)) {
    const relativePath = `${goalDir}/${fileName}`;
    assertExists(baseDir, relativePath, failures);
    assertHeadings(baseDir, relativePath, headings, failures);
    if (fileName === "VERIFY.md" && fs.existsSync(resolvePath(baseDir, relativePath))) {
      assertVerifyArtifactContent(relativePath, readFile(baseDir, relativePath), failures);
    }
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
  let runtime = null;
  const usageErrors = [];

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--profile-only") {
      hasProfileOnly = true;
      continue;
    }

    if (arg === "--runtime") {
      if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
        usageErrors.push("Missing required runtime name after --runtime");
        break;
      }
      runtime = argv[index + 1];
      index += 1;
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

  if (runtime && !isValidTargetRuntime(runtime)) {
    usageErrors.push(
      `Unsupported runtime: ${runtime} (expected: ${VALID_TARGET_RUNTIMES.join(", ")})`
    );
  }

  if (usageErrors.length > 0) {
    return { usageErrors };
  }

  if (goalId) {
    return {
      mode: "target-goal",
      baseDir,
      goalId,
      runtime
    };
  }

  return {
    mode: "target-profile",
    baseDir,
    runtime
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
    failures = validateTargetProfile(args.baseDir, args.runtime);
  } else if (validationMode === "target-goal") {
    failures = validateTargetGoal(args.baseDir, args.goalId, args.runtime);
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
    if (args.runtime) {
      console.log(
        `Target repository validation passed. Checked profile contract (runtime: ${args.runtime}).`
      );
    } else {
      console.log("Target repository validation passed. Checked profile contract.");
    }
    return;
  }

  if (validationMode === "target-goal") {
    if (args.runtime) {
      console.log(
        `Target repository validation passed. Checked goal contract: ${args.goalId} (runtime: ${args.runtime}).`
      );
    } else {
      console.log(`Target repository validation passed. Checked goal contract: ${args.goalId}.`);
    }
    return;
  }

  console.log(`Harness validation passed. Checked ${countCheckedContracts()} required files/contracts.`);
}

module.exports = {
  DOGFOOD_DEMO_PREFIX,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  ACTIVE_COMMAND_NAMING_PATHS,
  assertPublicDemoPolish,
  assertCommandContractStructure,
  assertSkillContractStructure,
  assertVerifyTemplateContract,
  assertVerifyArtifactContent,
  assertPlanTemplateContract,
  assertBlockedTemplateContract,
  commandFiles,
  commandHeadings,
  countCheckedContracts,
  extractMarkdownSection,
  hasSubstantiveSectionBody,
  hasConcreteFailureRule,
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
  packRequiredHeadings,
  skillTemplateHeadings,
  taskHeadings,
  teamHeadings,
  templateFiles,
  validateHarnessRepository,
  getRuntimeBootstrapPaths,
  isValidTargetRuntime,
  validateRuntimeBootstrap,
  validateTargetGoal,
  validateRuntimeCommandSurface,
  validateTargetHarnessProfile,
  validateTargetProfile,
  validateRepository,
  VALID_TARGET_RUNTIMES,
  main
};
