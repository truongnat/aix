import path from "node:path";
import fs from "node:fs";

function resolveRepositoryRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not resolve repository root from ${startDir}`);
    }
    current = parent;
  }
}

const root = resolveRepositoryRoot(__dirname);

const requiredFiles = [
  "AGENTS.md",
  "PACK.md",
  "README.md",
  "package.json",
  "bin/validate.js",
  "agent-system/SYSTEM_PROMPT.md",
  "agent-system/RESPONSE_CONTRACT.md",
  "agent-system/TONE_AND_FORMAT.md",
  "agent-system/OUTPUT_PATTERNS.md",
  "skills/PROMPT_FORMAT_STANDARD.md",
  "skills/README.md",
  "skills/packs/README.md",
  "skills/packs/data-ai.md",
  "skills/packs/security.md",
  "skills/packs/cloud.md",
  "src/shared/stack-detect/index.ts",
  "src/features/domains/application/domain-skill-generation.ts",
  "docs/context-engineering.md",
  "docs/token-budget.md",
  "agent-system/provider-adapters/claude.md",
  "agent-system/provider-adapters/cursor.md",
  "agent-system/provider-adapters/codex.md",
  "agent-system/provider-adapters/gemini.md",
  "commands/harness-map.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
  "prompt-templates/harness-plan.md",
  "prompt-templates/harness-run.md",
  "prompt-templates/harness-verify.md",
  "prompt-templates/harness-ship.md",
  "prompt-templates/domain-analysis.md",
  "prompt-templates/code-reviewer.md",
  "templates/INDEX.md",
  "templates/STATE.md",
  "templates/MEMORY.md",
  "templates/SESSION.md",
  "templates/PLAN.md",
  "templates/CHANGE_SPEC.md",
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
  "scripts/generate-report-context.js",
  "docs/tool-discovery-and-routing.md",
  "docs/session-memory.md",
  "docs/memory-migration.md",
  "dist/workers/registry.js",
  "workers/explorer.md",
  "workers/reviewer.md",
  "workers/verifier.md",
  "workers/gatekeeper.md",
  "workers/fixer.md",
  "templates/WORKER_RUN.md",
  "docs/delegated-workers.md",
  "docs/provider-rule-configuration.md",
  "rules/core/command-naming.md",
  "rules/core/phase-guards.md",
  "rules/core/blocking.md",
  "rules/core/session-memory.md",
  "rules/core/tool-routing.md",
  "dist/features/install/infrastructure/provider-rule-renderer.js",
  "rules/providers/claude/CLAUDE.md",
  "rules/providers/cursor/ai-engineering-harness.mdc",
  "hooks/README.md",
  "dist/hooks/core/guard-phase.js",
  "dist/hooks/core/record-tool-output.js",
  "dist/hooks/core/record-subagent-result.js",
  "dist/hooks/core/compact-session-memory.js",
  "dist/hooks/core/record-skill-run.js",
  "dist/hooks/core/archive-session-skill.js",
  "docs/hooks-and-skills-layer.md",
  "docs/skill-lifecycle.md",
  "workflows/create-skill.md",
  "workflows/compose-skills.md",
  "workflows/review-and-verify.md",
  "workflows/release-readiness.md",
  "workflows/daily-dev-report.md",
  "templates/SKILL.md",
  "templates/SESSION_SKILL.md",
  "templates/SKILL_DISPOSAL.md",
  "templates/SKILL_RUN.md",
  "templates/WORKFLOW_RUN.md",
  "templates/REPORT.md",
  "templates/PR_MESSAGE.md",
  "templates/CHANGE_SUMMARY.md",
  "docs/daily-dev-report.md",
  "docs/session-start.md",
  "templates/SESSION_START.md",
];

const commandFiles = [
  "commands/harness-map.md",
  "commands/harness-start.md",
  "commands/harness-discuss.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
  "commands/harness-remember.md",
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
  "skills/writing-skills/SKILL.md",
  "skills/debugging-investigation/SKILL.md",
  "skills/security-review/SKILL.md",
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
  "templates/CHANGE_SPEC.md",
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
  "templates/harness-config.json",
  "templates/WORKER_RUN.md",
  "templates/SKILL.md",
  "templates/SESSION_SKILL.md",
  "templates/SKILL_DISPOSAL.md",
  "templates/SKILL_RUN.md",
  "templates/WORKFLOW_RUN.md",
  "templates/REPORT.md",
  "templates/PR_MESSAGE.md",
  "templates/CHANGE_SUMMARY.md",
  "templates/SESSION_START.md",
];

const sessionMemoryDocFiles = ["docs/session-memory.md", "docs/memory-migration.md"];

const sessionAwareCommandFiles = [
  "commands/harness-start.md",
  "commands/harness-map.md",
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
];

const promptTemplateFiles = [
  "prompt-templates/harness-plan.md",
  "prompt-templates/harness-run.md",
  "prompt-templates/harness-verify.md",
  "prompt-templates/harness-ship.md",
  "prompt-templates/domain-analysis.md",
  "prompt-templates/blocker-question.md",
  "prompt-templates/discussion-question.md",
  "prompt-templates/option-scoring.md",
  "prompt-templates/code-reviewer.md",
];

const commandHeadings = [
  "## Purpose",
  "## Minimum Read Set",
  "## Preconditions",
  "## Required Outputs",
  "## Redirect Behavior",
  "## Failure Conditions",
  "## Completion Gate",
];

const skillHeadings = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Workflow",
  "## Operating Principles",
  "## Reasoning Procedure",
  "## Action Loop",
  "## Examples",
  "## Output Contract",
  "## Common Failure Modes",
  "## Checklist Before Done",
];

const promptTemplateHeadings = [
  "## Use Case",
  "## Purpose",
  "## Prompt",
  "## Reasoning Procedure",
  "## Action Loop",
  "## Examples",
  "## Placeholders",
  "## Returns",
  "## Critical Rules",
];

const toolFileHeadings = [
  "## Purpose",
  "## Detect",
  "## Use When",
  "## Do Not Use When",
  "## Example Commands",
  "## Fallback",
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
  "## Non-Goals",
];

const harnessHeadings = [
  "## Purpose",
  "## Current Status",
  "## Scope",
  "## Operating Model",
  "## Assumptions",
  "## Unknowns",
  "## Human Review",
];

const teamHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Pattern",
  "## Roles",
  "## Handoff Rules",
  "## Escalation Rules",
  "## Human Review",
];

const selectedSkillsHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Core Skills",
  "## Selected Domain Skills",
  "## Selected Skill Packs",
  "## Excluded Skills Or Packs",
  "## Human Review",
];

const workflowHeadings = [
  "## Purpose",
  "## Current Status",
  "## Selected Workflow",
  "## Domain Selection",
  "## Command Sequence",
  "## Execution Rules",
  "## Human Review",
];

const gatesHeadings = [
  "## Purpose",
  "## Current Status",
  "## Quality Gates",
  "## Evidence Requirements",
  "## Stop Conditions",
  "## Human Review",
];

const memoryHeadings = [
  "## Purpose",
  "## Current Status",
  "## Recall Before Planning",
  "## Remember After Shipping",
  "## Memory Types",
  "## Forbidden Content",
  "## Human Review",
];

const decisionsHeadings = ["## How To Use This Artifact", "## Entry Template"];
const hazardsHeadings = ["## How To Use This Artifact", "## Entry Template"];
const indexHeadings = [
  "## How To Use This Artifact",
  "## Reusable Commands",
  "## Verification Recipes",
  "## Useful References",
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
  ".harness/INDEX.md",
  ".harness/config.json",
  ".harness/skills/.gitkeep",
];

const targetProfileHeadingContracts: [string, string[]][] = [
  [".harness/HARNESS.md", harnessHeadings],
  [".harness/TEAM.md", teamHeadings],
  [".harness/SKILLS.md", selectedSkillsHeadings],
  [".harness/WORKFLOW.md", workflowHeadings],
  [".harness/GATES.md", gatesHeadings],
  [".harness/MEMORY.md", memoryHeadings],
  [".harness/DECISIONS.md", decisionsHeadings],
  [".harness/HAZARDS.md", hazardsHeadings],
  [".harness/INDEX.md", indexHeadings],
];

const goalArtifactHeadings: Record<string, string[]> = {
  "SESSION.md": [
    "## ID",
    "## Title",
    "## Status",
    "## Started At",
    "## Current Phase",
    "## Current Command",
    "## Summary",
    "## Links",
  ],
  "GOAL.md": [
    "## Request",
    "## Desired Outcome",
    "## Boundaries",
    "## Constraints",
    "## Completion Signal",
  ],
  "PLAN.md": [
    "## Goal",
    "## Scope",
    "## In Scope",
    "## Out Of Scope",
    "## Success Criteria",
    "## Tasks",
    "## Verification Strategy",
    "## Risks",
    "## Approval Status",
    "## Human Approval",
  ],
  "TASKS.md": [
    "## Active Tasks",
    "## Blocked Tasks",
    "## Completed Tasks",
    "## Deferred Tasks",
    "## Notes",
  ],
  "VERIFY.md": [
    "## Goal",
    "## Status",
    "## Tests Run",
    "## Manual Checks",
    "## Evidence",
    "## Known Gaps",
  ],
  "REMEMBER.md": [
    "## Date",
    "## Project",
    "## Problem",
    "## Root Cause",
    "## Decision",
    "## Solution",
    "## Commands",
    "## Edge Cases",
    "## Reuse Guidance",
    "## Sensitive Data Check",
  ],
};

const sessionStateHeadings = [
  "## Active Session",
  "## Current Goal",
  "## Current Phase",
  "## Current Command",
  "## Current Plan",
  "## Last Updated",
  "## Last Session Start",
  "## Next Allowed Commands",
  "## Blocked",
];

const VALID_TARGET_RUNTIMES = ["generic", "codex", "cursor", "gemini", "claude", "manual"];

const TOOL_DISCOVERY_KEYS = [
  "git",
  "gitWorktree",
  "rg",
  "gitGrep",
  "grep",
  "find",
  "markitdown",
  "codegraph",
  "gitNexus",
];

export {
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
  sessionStateHeadings,
  VALID_TARGET_RUNTIMES,
  TOOL_DISCOVERY_KEYS,
};
