/**
 * Harness skeleton generator: scaffolds a project-local `.harness/` directory
 * of markdown stubs when the user runs `aih init` or installs the harness.
 *
 * Mirrors the shell functions in aih.sh:
 *   - write_target_file         (1479-1511)
 *   - harness_skeleton_harness_md   (1513-1549)
 *   - harness_skeleton_team_md      (1551-1583)
 *   - harness_skeleton_skills_md    (1585-1613)
 *   - harness_skeleton_workflow_md  (1615-1643)
 *   - harness_skeleton_gates_md     (1645-1673)
 *   - harness_skeleton_memory_md    (1675-1707)
 *   - harness_skeleton_decisions_md (1709-1735)
 *   - harness_skeleton_hazards_md   (1737-1763)
 *   - harness_skeleton_index_md     (1766-1796)
 *   - harness_policies_json         (policy engine defaults)
 *   - init_harness_profile          (1798-1811)
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface SkeletonContext {
  targetAbs: string;
  dryRun: boolean;
  force?: boolean;
}

/**
 * Describes the planned/performed actions for each skeleton file.
 * These arrays are populated identically in dryRun and real mode —
 * dryRun just does not touch disk.
 *
 * - `created`    – file did not exist; it was (or would be) written.
 * - `overwritten` – file existed and force was true; it was (or would be) replaced.
 * - `skipped`    – file existed and force was false; it was left untouched.
 */
export interface SkeletonResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}

/** Mirrors aih.sh harness_skeleton_harness_md (1513-1549). */
function skeletonHarnessMd(): string {
  return `# Harness Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

Describe the repository-specific harness operating model, the artifacts it owns, and the workflow it enforces.

## Current Status

- Status: draft
- Last updated:
- Owner:

## Scope

List the commands, artifacts, and validation gates this harness owns in this repository.

## Operating Model

Describe the command loop, artifact update rules, and any repository-specific exceptions.

## Assumptions

Record assumptions that affect planning, implementation, or verification.

## Unknowns

Record open questions that still need human input or future investigation.

## Human Review

Record anything that should be reviewed by a human before shipping.
`;
}

/** Mirrors aih.sh harness_skeleton_team_md (1551-1583). */
function skeletonTeamMd(): string {
  return `# Team Profile

## Purpose

Describe who owns the repository, who reviews changes, and how handoffs work.

## Current Status

Record whether the team profile is draft, adopted, or needs attention.

## Selected Pattern

Describe the operating pattern the team follows by default.

## Roles

List the roles and responsibilities that matter for this repository.

## Handoff Rules

Describe what must be handed off in markdown before work changes owners.

## Escalation Rules

Describe when a human must be consulted or a decision must be escalated.

## Human Review

Record the specific items that need human review before shipping.
`;
}

/** Mirrors aih.sh harness_skeleton_skills_md (1585-1613). */
function skeletonSkillsMd(): string {
  return `# Skills Profile

## Purpose

Describe which skills or skill packs are available in this repository.

## Current Status

Record whether the selected skills are complete, partial, or still being defined.

## Selected Core Skills

List the core skills that are actively expected in this workspace.

## Selected Skill Packs

List any broader skill packs that are intentionally enabled.

## Excluded Skills Or Packs

List capabilities that are intentionally not part of this repository setup.

## Human Review

Record any missing or pending skill decisions for human review.
`;
}

/** Mirrors aih.sh harness_skeleton_workflow_md (1615-1643). */
function skeletonWorkflowMd(): string {
  return `# Workflow Profile

## Purpose

Describe the workflow stages, command loop, and how the repository uses them.

## Current Status

Record whether the workflow is draft, adopted, or needs review.

## Selected Workflow

Describe the workflow pattern in use for this repository.

## Command Sequence

List the command sequence that the repository expects operators to follow.

## Execution Rules

Describe how state changes, plan approval, verification, and shipping are handled.

## Human Review

Record workflow exceptions or unresolved process questions for human review.
`;
}

/** Mirrors aih.sh harness_skeleton_gates_md (1645-1673). */
function skeletonGatesMd(): string {
  return `# Quality Gates

## Purpose

Describe the quality gates that protect repository changes.

## Current Status

Record whether the gate set is draft, adopted, or needs review.

## Quality Gates

List the gates that must pass before shipping or remembering lessons.

## Evidence Requirements

Describe the evidence required for verification and shipping decisions.

## Stop Conditions

Describe the conditions that force the workflow to stop.

## Human Review

Record gate exceptions or missing evidence that still need human review.
`;
}

/** Mirrors aih.sh harness_skeleton_memory_md (1675-1707). */
function skeletonMemoryMd(): string {
  return `# Memory Profile

## Purpose

Describe what long-lived memory this repository should retain.

## Current Status

Record whether memory capture is draft, active, or needs review.

## Recall Before Planning

Describe what should be reviewed before planning new work.

## Remember After Shipping

Describe what durable lessons should be recorded after shipping work.

## Memory Types

List the types of memory this repository captures.

## Forbidden Content

Describe what must never be written into repository memory.

## Human Review

Record memory items that need human review before they are committed.
`;
}

/** Mirrors aih.sh harness_skeleton_decisions_md (1709-1735). */
function skeletonDecisionsMd(): string {
  return `# Decisions

> Store durable, project-level decisions here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Record only decisions that future planning, implementation, or verification work should recall.
- Prefer one entry per decision.
- Link related hazards, verification expectations, or follow-up work when relevant.

## Entry Template

### DECISION-000

- Date:
- Status: proposed | accepted | superseded
- Area:
- Decision:
- Why this decision exists:
- What changes if revisited:
- Related hazards:
- Verification impact:
- Follow-up:
`;
}

/** Mirrors aih.sh harness_skeleton_hazards_md (1737-1763). */
function skeletonHazardsMd(): string {
  return `# Hazards

> Store durable, project-level hazards here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Put recurring failure modes, fragile integrations, and regression-prone areas here.
- Keep entries specific enough to change planning or verification behavior.
- Prefer confirmed hazards over vague worries.

## Entry Template

### HAZARD-000

- Date:
- Severity: low | medium | high
- Area:
- Trigger:
- Failure mode:
- Early warning signs:
- Mitigation:
- Verification focus:
- Related decisions:
- Notes:
`;
}

/** Mirrors aih.sh harness_skeleton_index_md (1766-1796). */
function skeletonIndexMd(): string {
  return `# Memory Index

> Index reusable project memory here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Capture reusable commands, verification recipes, and lookup pointers that future work can apply safely.
- Use this file as the first stop for repeatable checks before re-deriving commands from scratch.
- Link out to DECISIONS.md, HAZARDS.md, goal artifacts, or repo docs when that is more durable than copying content.

## Reusable Commands

| Name | Command | When To Use | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Verification Recipes

| Area | Check | Evidence To Capture | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Useful References

| Topic | Artifact Or Doc | Why It Matters |
| --- | --- | --- |
|  |  |  |
`;
}

function skeletonPoliciesJson(): string {
  return `{
  "version": "1.0.0",
  "rules": [
    {
      "id": "phase-gate-plan",
      "name": "Plan Approval Required",
      "description": "harness-run requires an approved plan before implementation can begin",
      "severity": "error",
      "conditions": [
        { "type": "command", "operator": "equals", "value": "harness-run" },
        { "type": "state", "operator": "not_exists", "value": "current_plan:approved" }
      ],
      "action": {
        "type": "block",
        "message": "Plan must be approved before implementation",
        "nextCommand": "harness-plan",
        "questions": ["Which plan should be approved before implementation?"]
      }
    },
    {
      "id": "phase-gate-verify",
      "name": "Verification Required Before Ship",
      "description": "harness-ship requires verified VERIFY.md with explicit status and evidence",
      "severity": "error",
      "conditions": [
        { "type": "command", "operator": "equals", "value": "harness-ship" },
        { "type": "state", "operator": "not_exists", "value": "verify:approved" }
      ],
      "action": {
        "type": "block",
        "message": "Verification must be completed and approved before shipping",
        "nextCommand": "harness-verify",
        "questions": ["What verification evidence is still missing?"]
      }
    },
    {
      "id": "phase-gate-implementation-evidence",
      "name": "Implementation Evidence Required",
      "description": "harness-verify requires implementation evidence (completed tasks or tool runs)",
      "severity": "error",
      "conditions": [
        { "type": "command", "operator": "equals", "value": "harness-verify" },
        { "type": "state", "operator": "not_exists", "value": "implementation_evidence" }
      ],
      "action": {
        "type": "block",
        "message": "No implementation evidence found for verification",
        "nextCommand": "harness-run",
        "questions": ["What implementation work should be verified?"]
      }
    },
    {
      "id": "test-first-enforcement",
      "name": "Test-First Discipline",
      "description": "Source file edits require corresponding test file with failing assertion",
      "severity": "error",
      "conditions": [
        { "type": "file_pattern", "operator": "matches", "value": "src/**" }
      ],
      "action": {
        "type": "block",
        "message": "Test-first discipline violated: editing source without corresponding test",
        "questions": ["Create or update the corresponding test file first"]
      }
    }
  ]
}
`;
}

/** Map of relative path (under .harness/) to content generator. */
const SKELETON_FILES: Array<{ rel: string; content: () => string }> = [
  { rel: ".harness/HARNESS.md", content: skeletonHarnessMd },
  { rel: ".harness/TEAM.md", content: skeletonTeamMd },
  { rel: ".harness/SKILLS.md", content: skeletonSkillsMd },
  { rel: ".harness/WORKFLOW.md", content: skeletonWorkflowMd },
  { rel: ".harness/GATES.md", content: skeletonGatesMd },
  { rel: ".harness/MEMORY.md", content: skeletonMemoryMd },
  { rel: ".harness/DECISIONS.md", content: skeletonDecisionsMd },
  { rel: ".harness/HAZARDS.md", content: skeletonHazardsMd },
  { rel: ".harness/INDEX.md", content: skeletonIndexMd },
  { rel: ".harness/policies.json", content: skeletonPoliciesJson },
  { rel: ".harness/goals/.gitkeep", content: () => "" },
];

/**
 * Mirrors aih.sh write_target_file (1479-1511).
 *
 * - If the file exists and force is false: SKIP (print "SKIP <rel>").
 * - If the file exists and force is true: OVERWRITE (print "OVERWRITE <rel>").
 * - If the file does not exist: CREATE (print "CREATE <rel>").
 * - In dryRun mode: prints "WOULD CREATE/SKIP/OVERWRITE <rel>" without writing.
 *
 * Returns "created", "skipped", or "overwritten".
 *
 * NOTE: All skeleton file content strings end with a trailing `\n` (POSIX text
 * file convention). The original shell functions in aih.sh use `$()` command
 * substitution which silently strips the final newline. A byte-for-byte diff
 * against shell-generated output will therefore show a 1-byte difference.
 *
 * That means a repository initialized by the shell-era path can see the first
 * TypeScript-backed install or re-init treat those files as changed/overwrite
 * candidates even when the visible markdown content is otherwise identical.
 * This is intentional and an improvement over the shell behaviour.
 */
function writeTargetFile(
  rel: string,
  content: string,
  targetAbs: string,
  dryRun: boolean,
  force: boolean
): "created" | "skipped" | "overwritten" {
  const dest = path.join(targetAbs, rel);
  const destDir = path.dirname(dest);

  if (fs.existsSync(dest)) {
    if (force) {
      if (dryRun) {
        process.stdout.write(`WOULD OVERWRITE ${rel}\n`);
      } else {
        fs.mkdirSync(destDir, { recursive: true });
        fs.writeFileSync(dest, content, "utf8");
        process.stdout.write(`OVERWRITE ${rel}\n`);
      }
      return "overwritten";
    } else {
      if (dryRun) {
        process.stdout.write(`WOULD SKIP ${rel}\n`);
      } else {
        process.stdout.write(`SKIP ${rel}\n`);
      }
      return "skipped";
    }
  }

  if (dryRun) {
    process.stdout.write(`WOULD CREATE ${rel}\n`);
  } else {
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(dest, content, "utf8");
    process.stdout.write(`CREATE ${rel}\n`);
  }
  return "created";
}

/**
 * Scaffolds the `.harness/` skeleton directory under `ctx.targetAbs`.
 *
 * Mirrors aih.sh init_harness_profile (1798-1811).
 *
 * @returns which relative paths were created vs skipped.
 */
export function initHarnessProfile(ctx: SkeletonContext): SkeletonResult {
  const { targetAbs, dryRun, force = false } = ctx;
  const created: string[] = [];
  const overwritten: string[] = [];
  const skipped: string[] = [];

  process.stdout.write("\n--- .harness/ init ---\n");

  for (const entry of SKELETON_FILES) {
    const outcome = writeTargetFile(entry.rel, entry.content(), targetAbs, dryRun, force);
    if (outcome === "created") {
      created.push(entry.rel);
    } else if (outcome === "overwritten") {
      overwritten.push(entry.rel);
    } else {
      skipped.push(entry.rel);
    }
  }

  process.stdout.write("--- .harness/ init complete ---\n");

  return { created, overwritten, skipped };
}
