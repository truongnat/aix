const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");

const requiredFiles = [
  "AGENTS.md",
  "PACK.md",
  "README.md",
  "package.json",
  "validate.js",
  "install.js",
  "install-cache.js",
  "commands/harness-map.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
  "prompt-templates/harness-plan.md",
  "prompt-templates/harness-run.md",
  "prompt-templates/harness-verify.md",
  "prompt-templates/harness-ship.md",
  "prompt-templates/code-reviewer.md",
  "templates/INDEX.md",
  "templates/STATE.md",
  "templates/MEMORY.md",
  "templates/SESSION.md",
  "templates/PLAN.md",
  "templates/VERIFY.md",
  "templates/BLOCKED.md",
  "templates/NOTES.md",
  "templates/DECISION.md",
  "templates/HAZARD.md",
  "templates/harness-config.json",
  "templates/REVIEW.md",
  "templates/TOOL_CONTEXT.md",
  "tool-capabilities/TOOL_DISCOVERY.md",
  "tool-capabilities/TOOL_ROUTING.md",
  "tool-capabilities/tools/git.md",
  "tool-capabilities/tools/grep-ripgrep.md",
  "tool-capabilities/tools/git-worktree.md",
  "tool-capabilities/tools/markitdown.md",
  "tool-capabilities/tools/code-graph.md",
  "tool-capabilities/tools/git-nexus.md",
  "scripts/discover-tools.js",
  "docs/tool-discovery-and-routing.md",
  "docs/session-memory.md",
  "docs/memory-migration.md"
];

const commandFiles = [
  "commands/harness-map.md",
  "commands/harness-start.md",
  "commands/harness-discuss.md",
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

const templateFiles = [
  "templates/PROJECT.md",
  "templates/HARNESS.md",
  "templates/TEAM.md",
  "templates/SKILLS.md",
  "templates/WORKFLOW.md",
  "templates/GATES.md",
  "templates/MEMORY.md",
  "templates/INDEX.md",
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
  "templates/REMEMBER.md",
  "templates/TOOL_CONTEXT.md",
  "templates/SESSION.md",
  "templates/NOTES.md",
  "templates/DECISION.md",
  "templates/HAZARD.md",
  "templates/harness-config.json"
];

const sessionMemoryDocFiles = ["docs/session-memory.md", "docs/memory-migration.md"];

const sessionAwareCommandFiles = [
  "commands/harness-start.md",
  "commands/harness-map.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md"
];

const promptTemplateFiles = [
  "prompt-templates/harness-plan.md",
  "prompt-templates/harness-run.md",
  "prompt-templates/harness-verify.md",
  "prompt-templates/harness-ship.md",
  "prompt-templates/blocker-question.md",
  "prompt-templates/code-reviewer.md"
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

const promptTemplateHeadings = [
  "## Use Case",
  "## Purpose",
  "## Prompt",
  "## Placeholders",
  "## Returns",
  "## Critical Rules"
];

const toolFileHeadings = [
  "## Purpose",
  "## Detect",
  "## Use When",
  "## Do Not Use When",
  "## Example Commands",
  "## Fallback"
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

const targetHarnessProfileFiles = [
  ".harness/",
  ".harness/HARNESS.md",
  ".harness/TEAM.md",
  ".harness/SKILLS.md",
  ".harness/WORKFLOW.md",
  ".harness/GATES.md",
  ".harness/MEMORY.md",
  ".harness/DECISIONS.md",
  ".harness/HAZARDS.md",
  ".harness/INDEX.md"
];

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

const goalArtifactHeadings = {
  "GOAL.md": [
    "## Goal",
    "## Scope",
    "## In Scope",
    "## Out Of Scope",
    "## Acceptance Criteria"
  ],
  "PLAN.md": [
    "## Goal",
    "## Scope",
    "## Tasks",
    "## Verification Strategy",
    "## Risks",
    "## Approval Status",
    "## Human Approval"
  ],
  "TASKS.md": [
    "## Goal",
    "## Task List",
    "## Review Notes",
    "## Current State"
  ],
  "VERIFY.md": [
    "## Goal",
    "## Status",
    "## Tests Run",
    "## Manual Checks",
    "## Evidence",
    "## Known Gaps"
  ],
  "REMEMBER.md": [
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

const TOOL_DISCOVERY_KEYS = [
  "git",
  "gitWorktree",
  "rg",
  "gitGrep",
  "grep",
  "find",
  "markitdown",
  "joern",
  "sourcegraph",
  "repograph",
  "gitNexus"
];

module.exports = {
  root,
  requiredFiles,
  commandFiles,
  skillFiles,
  templateFiles,
  promptTemplateFiles,
  sessionMemoryDocFiles,
  sessionAwareCommandFiles,
  commandHeadings,
  skillHeadings,
  promptTemplateHeadings,
  toolFileHeadings,
  packRequiredHeadings,
  harnessHeadings,
  teamHeadings,
  selectedSkillsHeadings,
  workflowHeadings,
  gatesHeadings,
  memoryHeadings,
  decisionsHeadings,
  hazardsHeadings,
  indexHeadings,
  targetHarnessProfileFiles,
  targetProfileHeadingContracts,
  goalArtifactHeadings,
  VALID_TARGET_RUNTIMES,
  TOOL_DISCOVERY_KEYS
};
