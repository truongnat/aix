/** Harness skeleton generator for project-local `.harness/` files. */

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

function skeletonHarnessMd(): string {
  return `# Harness Profile

> Do not include credentials, tokens, customer data, or private business data.

## Purpose

Describe the repository-specific harness operating model, the artifacts it owns, and the workflow it enforces.

## Current Status

- Status: draft
- Last updated: YYYY-MM-DD
- Owner: team-or-person
- Review cadence: weekly | release-based | ad hoc

## Scope

- This harness owns \`.harness/\` profile artifacts, session state, and verification records.
- This harness does not own production architecture decisions; document those in \`DECISIONS.md\` and source code.
- Primary artifacts: session goal, plan, verify, blocked, ship, and remember files under \`.harness/sessions/\`
- Optional durable behavior specs live under \`.harness/specs/\` when the spec layer is enabled.
- Optional delegated-worker memory lives under \`.harness/memory/workers/\` when worker memory is enabled.

## Operating Model

This repository uses the core loop:
\`harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember\`

Working rules:
1. Start every session by reading state and goal artifacts.
2. Record scope and plan before editing code.
3. Verify with commands and evidence before claiming completion.
4. Capture durable lessons only after verified work ships.

## Assumptions

| Assumption | Why it matters | How to verify |
| --- | --- | --- |
| CI is the main release gate | local pass alone is not enough | link CI run in \`VERIFY.md\` |
| \`.harness/\` is project-local state | users may have multiple concurrent goals | keep artifacts scoped to one repo |

## Unknowns

| Question | Blocking? | Owner | Next step |
| --- | --- | --- | --- |
| What are this repo's real test, lint, and build commands? | yes/no |  | update \`GATES.md\` before first ship |

## Human Review

List any policy, scope, or release decisions that still need a human sign-off.

## Example Profile

- Repository: example-service
- Purpose: keep API changes tied to written goals, explicit verification, and release notes
- Active artifacts: active session \`GOAL.md\`, \`PLAN.md\`, \`VERIFY.md\`, \`SHIP.md\`
- Default verification: \`npm test\`, contract validation, and CI confirmation before ship
`;
}

function skeletonTeamMd(): string {
  return `# Team Profile

## Purpose

Describe who owns the repository, who reviews changes, and how handoffs work.

## Current Status

- Status: draft
- Primary maintainer:
- Backup reviewer:
- Escalation channel:

## Selected Pattern

- Small scoped changes with explicit verification
- Human approval for scope changes and destructive actions
- Evidence-first ship decisions

## Roles

| Role | Responsibilities | Notes |
| --- | --- | --- |
| Maintainer | approves plan and ship decisions |  |
| Implementer | edits code and records verification |  |
| Reviewer | checks regressions and risks |  |

## Handoff Rules

- Update \`STATE.md\` with current phase
- Link the active \`GOAL.md\` and \`PLAN.md\`
- Record unfinished checks in \`VERIFY.md\` or \`BLOCKED.md\`

## Escalation Rules

- Acceptance criteria change
- Destructive migration or data loss risk appears
- Verification is blocked by missing credentials, infra, or production access

## Human Review

List pending staffing, ownership, or escalation gaps that need human review.
`;
}

function skeletonSkillsMd(): string {
  return `# Skills Profile

## Purpose

Describe which skills or skill packs are available in this repository.

## Current Status

- Status: draft
- Last reviewed: YYYY-MM-DD
- Review before first \`harness-run\`

## Selected Core Skills

| Skill | When to use it | Owner | Notes |
| --- | --- | --- | --- |
| using-harness | every harness session |  | keep phase discipline intact |
| mapping-codebase | before planning non-trivial code changes |  | identify impacted files first |
| discussing-goals | when goal or scope is ambiguous |  | resolve acceptance criteria before planning |
| writing-plans | before implementation |  | create ordered tasks and stop before coding |
| executing-plans | after plan approval |  | make small, scoped changes only |
| verification | after implementation |  | gather fresh evidence |
| remembering | after verified work ships |  | promote durable lessons only |

## Selected Domain Skills

| Domain | Coverage | Notes |
| --- | --- | --- |
| frontend | UI, browser behavior, accessibility | add when repository has user-facing surfaces |
| backend | APIs, services, auth, persistence | add when repository has server-side behavior |
| devops | CI/CD, deployment, infrastructure | add when repository has release or environment logic |
| mobile | iOS, Android, React Native | add when repository has native or cross-platform app work |
| debugging | root-cause investigation and flaky behavior | add when diagnosis dominates implementation |
| data-ai | data engineering, ML, LLM workflows | add when repository has dataset, pipeline, or model work |
| security | auth, secrets, trust boundaries | add when repository has sensitive flow or policy work |
| cloud | cloud providers and hosted integrations | add when repository has provider-specific integration work |

## Selected Skill Packs

| Pack | Coverage | Notes |
| --- | --- | --- |
| backend | APIs, services, auth, persistence | add when repository has server-side behavior |
| frontend | UI, browser behavior, accessibility | add when repository has user-facing surfaces |
| debugging | root-cause investigation and flaky behavior | add when diagnosis dominates implementation |
| data-ai | data engineering, ML, LLM workflows | add when repository has dataset or model work |
| security | auth, secrets, trust boundaries | add when repository has sensitive flow or policy work |
| cloud | cloud providers and hosted integrations | add when repository has provider-specific integration work |

## Excluded Skills Or Packs

- Release automation that requires private credentials
- Direct production access without human approval
- Optional generated domain skills that do not match the selected repo surface
- Packs with no clear repository domain owner

## Human Review

List missing skills, overlaps, or deprecations that need a decision.
`;
}

function skeletonWorkflowMd(): string {
  return `# Workflow Profile

## Purpose

Describe the workflow stages, command loop, and how the repository uses them.

## Current Status

- Status: draft
- Primary workflow: Start -> Discuss -> Plan -> Run -> Verify -> Ship -> Remember

## Selected Workflow

- Default path: \`harness-start\` -> \`harness-discuss\` -> \`harness-plan\` -> \`harness-run\` -> \`harness-verify\` -> \`harness-ship\` -> \`harness-remember\`
- Compatibility command: \`harness-map\` for manual context refresh only

## Domain Selection

- Domain skills may be generated under \`.harness/skills/\` after init
- Selected domains are recorded in \`.harness/config.json\`
- Keep generated domain skills aligned with the detected repository stack

## Command Sequence

| # | Command | Required | Purpose | Skip when |
| --- | --- | --- | --- | --- |
| 1 | \`harness-start\` | always | restore context and identify the next legal command | never |
| 2 | \`harness-discuss\` | non-trivial work | clarify goal, constraints, and success criteria | truly trivial typo-only work |
| 3 | \`harness-plan\` | implementation work | break work into ordered tasks and stop before coding | never |
| 4 | \`harness-run\` | after plan approval | implement the approved scope in small steps | never |
| 5 | \`harness-verify\` | after implementation | run gates and record evidence | never |
| 6 | \`harness-ship\` | after verification | summarize outcome; chain to remember when \`shipped\` | when no ship artifact is needed |
| 7 | \`harness-remember\` | default: chained after successful ship | capture durable lessons worth reusing | ship-only handoff, gaps/failure, or nothing reusable |

## Default Phase Chaining

- **Ship → Remember**: when ship status is \`shipped\`, run remember in the same turn unless the user requests ship-only or skip conditions in \`docs/phase-discipline.md\` apply.

## Execution Rules

- Never skip plan approval for non-trivial changes
- Record blocked state instead of guessing
- Ship summary must link verification evidence
- Return to planning if implementation discovers a real scope gap

## Human Review

List repo-specific workflow exceptions that still need approval.

## Concrete Example

\`harness-start\` -> refresh \`STATE.md\` and confirm the active goal
\`harness-discuss\` -> capture open questions and tradeoffs
\`harness-plan\` -> write an approved \`PLAN.md\`
\`harness-run\` -> implement the scoped change and update \`TASKS.md\`
\`harness-verify\` -> record commands, results, and gaps in \`VERIFY.md\`
\`harness-ship\` -> summarize outcome in \`SHIP.md\`
\`harness-remember\` -> promote durable lessons into \`DECISIONS.md\`, \`HAZARDS.md\`, or \`INDEX.md\`
`;
}

function skeletonConfigJson(): string {
  return `{
  "telemetry": {
    "export": {
      "enabled": false,
      "anonymize": true,
      "remoteUpload": {
        "enabled": false,
        "endpointEnv": "HARNESS_TELEMETRY_ENDPOINT"
      }
    }
  },
  "memory": {
    "backend": "files",
    "sessionStrategy": "date-title",
    "sourceOfTruth": "files",
    "graph": {
      "enabled": false,
      "provider": "neo4j",
      "uriEnv": "NEO4J_URI",
      "userEnv": "NEO4J_USER",
      "passwordEnv": "NEO4J_PASSWORD"
    }
  },
  "specs": {
    "enabled": false,
    "sourceOfTruth": "delta-specs",
    "directory": ".harness/specs"
  },
  "workerMemory": {
    "enabled": false,
    "directory": ".harness/memory/workers"
  },
  "domains": []
}
`;
}

function skeletonGatesMd(): string {
  return `# Quality Gates

## Purpose

Describe the quality gates that protect repository changes.

## Current Status

- Status: draft
- Last calibrated: YYYY-MM-DD
- Replace example commands with this repository's real commands before first ship

## Quality Gates

| Gate | Command | Pass condition | Evidence |
| --- | --- | --- | --- |
| Tests | \`npm test\` | exit 0, all required tests pass | command output in \`VERIFY.md\` |
| Type check | \`tsc --noEmit\` | exit 0, no type errors | command output |
| Lint | \`eslint .\` | exit 0 or explicitly accepted warnings | command output |
| Build | \`npm run build\` | exit 0, no build errors | command output |
| CI | repo CI workflow | required checks conclude success | linked run id or URL |

## Evidence Requirements

- Record the exact commands executed
- Capture pass/fail status, not intent
- Note skipped checks and why they were skipped
- Treat "looks good" or "should pass" as non-evidence

## Stop Conditions

- Plan missing or not approved
- Acceptance criteria unclear
- Verification failed or is blocked
- Required human sign-off is missing

## Human Review

List temporary waivers and who approved them.

## Example Gates

| Gate | Command | Pass condition | Evidence |
| --- | --- | --- | --- |
| Regression tests pass | \`npm test\` | target behavior passes without new failures | test output copied into \`VERIFY.md\` |
| Shipping evidence is concrete | review \`VERIFY.md\` | every required check has proof or documented gap | CI run id plus exact verification commands |
`;
}

function skeletonMemoryMd(): string {
  return `# Memory Profile

## Purpose

Describe what long-lived memory this repository should retain.

## Current Status

- Status: draft
- Storage model: markdown files in \`.harness/\`

## Recall Before Planning

- Relevant entries in \`DECISIONS.md\`
- Known regression areas in \`HAZARDS.md\`
- Reusable commands in \`INDEX.md\`
- Active session remember notes if the current goal is a continuation

## Remember After Shipping

- Root causes worth reusing
- Verification recipes that saved time
- Project-level decisions that affect future plans
- Hazards that should change planning or verification next time
- Approved delta specs that should be promoted into \`.harness/specs/\` when enabled
- Delegated worker observations that should be compacted into \`.harness/memory/workers/<agent>.md\` when enabled

## Memory Types

| Artifact | Stores | When to update |
| --- | --- | --- |
| \`DECISIONS.md\` | durable project decisions | after approval |
| \`HAZARDS.md\` | recurring failure modes | after confirmed incident or review |
| \`INDEX.md\` | reusable commands and references | after a repeatable workflow is proven |
| \`.harness/specs/\` | optional durable behavior specs | after approved delta-spec changes |
| \`.harness/memory/workers/<agent>.md\` | optional delegated-worker notes | after enabled worker runs |
| \`REMEMBER.md\` | goal-level lessons | after shipping verified work |

## Forbidden Content

- Secrets, credentials, tokens
- Customer data or private business data
- One-off notes that belong only in a local scratchpad
- Temporary task status that belongs in active session artifacts

## Human Review

List borderline memory items that may need promotion or deletion.

## Example Entry

- Lesson: release-facing doc changes must update validator assertions in the same patch
- Why it matters: docs can drift silently while tests stay green
- Where to store it: promote to \`INDEX.md\` if repeated across multiple goals
- Verification impact: run \`node bin/validate.js\` whenever docs or templates move
`;
}

function skeletonDecisionsMd(): string {
  return `# Decisions

> Store durable, project-level decisions here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Record only decisions that future planning, implementation, or verification work should recall.
- Prefer one entry per decision.
- Link related hazards, verification expectations, or follow-up work when relevant.

## Entry Template

### DECISION-000

- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded
- Area: runtime | docs | release | tooling
- Decision: one-sentence statement
- Rationale: what pain, constraint, or tradeoff this decision resolves
- Alternatives considered: rejected options and why they were not chosen
- Consequences: follow-on costs, migration impact, or rollback expectations
- What changes if revisited: migration cost, breaking surface, or rollback path
- Related hazards: \`HAZARD-###\`, if any
- Verification impact: what checks become required
- Follow-up: owner + next review date

## Example

### DECISION-001

- Date: 2026-06-07
- Status: accepted
- Area: install
- Decision: Keep provider-specific entrypoints project-local instead of copying root-level command packs.
- Rationale: avoids stale duplicated surfaces and keeps uninstall predictable.
- Alternatives considered: keeping the flat-root fallback or provider-specific shims for backward compatibility.
- Consequences: install, update, and uninstall stay smaller, but manual fallback must stay AGENTS-based.
- What changes if revisited: install/update/uninstall contracts and docs must change together.
- Related hazards: \`HAZARD-002\`
- Verification impact: install smoke tests and package surface checks must pass.
- Follow-up: review after the next release cut.
`;
}

function skeletonHazardsMd(): string {
  return `# Hazards

> Store durable, project-level hazards here. Do not include credentials, tokens, customer data, or private business data.

## How To Use This Artifact

- Put recurring failure modes, fragile integrations, and regression-prone areas here.
- Keep entries specific enough to change planning or verification behavior.
- Prefer confirmed hazards over vague worries.

## Entry Template

### HAZARD-000

- Date: YYYY-MM-DD
- Severity: low | medium | high
- Area: install | runtime | release | docs | evals
- Trigger: what condition causes the hazard
- Failure mode: what breaks
- Early warning signs: first signals to watch
- Mitigation: how to reduce or prevent the risk
- Verification focus: exact checks to run
- Related decisions: \`DECISION-###\`, if any
- Notes: links, incidents, or follow-up

## Example

### HAZARD-001

- Date: 2026-06-07
- Severity: medium
- Area: install
- Trigger: worktree repo or non-standard \`.git\` layout
- Failure mode: git hygiene writes to the wrong exclude path or silently skips it
- Early warning signs: install says success but \`status\` still shows missing exclude block
- Mitigation: resolve the effective git dir before reading or writing \`.git/info/exclude\`
- Verification focus: install into a normal repo and a worktree-backed repo
- Related decisions: \`DECISION-001\`
- Notes: keep one shared helper for git-dir resolution
`;
}

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
| Full test suite | \`npm test\` | before shipping behavior changes | records build + test coverage of the public surface |
| Package validation | \`node bin/validate.js\` | when docs/templates/contracts move | catches repo-surface drift |

## Verification Recipes

| Area | Check | Evidence To Capture | Notes |
| --- | --- | --- | --- |
| Install flow | dry-run + real install in temp repo | created files and warnings | cover private and shared modes |
| Runtime docs | read rendered markdown in target | key headings and commands | verify wording, not just file existence |

## Useful References

| Topic | Artifact Or Doc | Why It Matters |
| --- | --- | --- |
| Workflow rules | \`docs/phase-discipline.md\` | defines hard phase stops |
| Session start | \`docs/session-start.md\` | explains state restoration contract |
| Context engineering | \`docs/context-engineering.md\` | explains compaction, retrieval, and spec discipline |
| Token budget | \`docs/token-budget.md\` | explains why the harness stays lightweight |
| Delta specs | \`templates/CHANGE_SPEC.md\` | captures behavior-changing deltas before folding them into durable memory |
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

/** Map of relative path (under `.harness/`) to content generator. */
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
  { rel: ".harness/config.json", content: skeletonConfigJson },
  { rel: ".harness/policies.json", content: skeletonPoliciesJson },
  { rel: ".harness/skills/.gitkeep", content: () => "" },
  { rel: ".harness/memory/workers/.gitkeep", content: () => "" },
  { rel: ".harness/specs/.gitkeep", content: () => "" },
  { rel: ".harness/goals/.gitkeep", content: () => "" },
];

/**
 * Write one skeleton file and report whether it was created, skipped, or overwritten.
 *
 * All generated markdown ends with a trailing newline. Repositories that were
 * initialized by older installers may therefore show a first overwrite even
 * when the visible text is unchanged.
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

/** Scaffolds the `.harness/` skeleton directory under `ctx.targetAbs`. */
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
