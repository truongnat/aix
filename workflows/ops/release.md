# Workflow: release

Turn **release notes** (bullets, changelog intent, stakeholder summary) into **actionable implementation detail**: scoped work items, dependencies, ship path, and verification. Uses **`planning-pro`**, **`business-analysis-pro`**, **`deployment-pro`**, **`git-operations-pro`**, **`testing-pro`**, **`code-packaging-pro`**, and stack **`*-pro`** as needed.

**Domain:** `dev` — lives under **`workflows/dev/`** alongside [`ticket.md`](ticket.md) and [`hotfix.md`](hotfix.md). **Filename** **`w-<slug>.md`** — [`workflows/README.md`](../README.md#naming).

**Invoke:** `/release` (see [`.claude/commands/release.md`](../../.claude/commands/release.md)).

## Metadata

| Field | Value |
|-------|-------|
| **id** | `release` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `release_notes` | Yes | What ships (Markdown, bullets, link to doc, or pasted text) |
| `version_target` | No | Semver or release name (e.g. `2.4.0`, `2026-Q2`) — ask if unclear |
| `stack` | No | Primary runtime(s) for mapping tasks to `*-pro` skills |

## Decision paths

- **`release_notes` vague:** Loop Step 1–2 until acceptance criteria and **must-ship** vs **defer** are explicit.
- **No `version_target`:** Infer from branch/tag policy or ask once; do not invent semver without confirmation.
- **Hotfix-level urgency:** If prod is down, switch mentally to [`hotfix.md`](hotfix.md) instead of full release sequencing.

## Error handling

- **Conflicting must-ship items:** Surface trade-off table; do not silently drop scope.
- **CI/deploy steps unknown:** Document **assumptions** and verification gaps in `verification` output.
- **Rollback undefined:** Block `ship_definition` completion until rollback lever is named (even high-level).

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** — use tables for scope/themes, 🔴/🟡/🟢 or progress emojis for risk/gates where helpful, and **[!NOTE]** / **[!WARNING]** for rollout assumptions.  
Structured plans can align with **[`templates/report/architecture-decision-record.md`](../../templates/report/architecture-decision-record.md)** when the release encodes a major decision.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Patch release, narrow notes | < 4 h |
| **Standard** | Minor/minor+ with several workstreams | 1–3 days |
| **Deep** | Major version, multi-team, migrations | > 1 week |

## Escalation

- **Autonomous:** Decomposing notes into tasks, skill mapping, checklist drafts.
- **Human:** Release calendar, customer comms, **freeze** policy, budget for infra/QA.

## Outputs

| Variable | Description |
|----------|-------------|
| `parsed_scope` | Themes, must-ship vs nice-to-have, dependencies |
| `implementation_plan` | Phased tasks with owners/skills, risks |
| `ship_definition` | Environments, ordering, rollback, feature flags if any |
| `verification` | Test/QA gates and sign-off checklist |

## Steps

### Step 1 — `notes-to-requirements`

- **Type:** skill
- **Skill:** **`business-analysis-pro`** (+ **`content-analysis-pro`** if `release_notes` is only an attachment/PDF)
- **Input:** `release_notes` — extract **scope**, **acceptance signals**, **constraints**, **out of scope** — [references/requirements-and-reasoning.md](../../skills/business-analysis-pro/references/requirements-and-reasoning.md)

### Step 2 — `decompose-to-work`

- **Type:** skill
- **Skill:** **`planning-pro`**
- **Input:** `parsed_scope` — milestones, **dependency order**, estimates band — [references/scope-and-decomposition.md](../../skills/planning-pro/references/scope-and-decomposition.md), [references/sequencing-and-dependencies.md](../../skills/planning-pro/references/sequencing-and-dependencies.md)
- **Output:** `implementation_plan` — each item has verifiable **done** and mapped **`*-pro`** where applicable

### Step 3 — `implementation-detail`

- **Type:** skill
- **Skill:** domain **`*-pro`** per task in `implementation_plan` (e.g. `nestjs-pro`, `nextjs-pro`, `postgresql-pro`)
- **Input:** tasks — concrete files, APIs, migrations, config; no hand-wavy bullets
- **Output:** `implementation_plan` with **implementation detail** attached per task (still one coherent plan)

### Step 4 — `branching-and-versioning`

- **Type:** skill
- **Skill:** **`git-operations-pro`**
- **Input:** `version_target` — release branch / tag policy, merge order, **conventional commits** for changelog — [references/commits-and-branching.md](../../skills/git-operations-pro/references/commits-and-branching.md)

### Step 5 — `ci-and-artifacts`

- **Type:** skill
- **Skill:** **`code-packaging-pro`** + **`testing-pro`**
- **Input:** what must pass before promote — lint, tests, build artifact, container image — [references/github-actions-and-ci.md](../../skills/code-packaging-pro/references/github-actions-and-ci.md), [references/automation-and-ci.md](../../skills/testing-pro/references/automation-and-ci.md)

### Step 6 — `deploy-and-release-strategy`

- **Type:** skill
- **Skill:** **`deployment-pro`** (+ **`security-pro`** if infra/secrets change)
- **Input:** stages (staging → prod), **rollback**, **canary**/traffic if applicable — [references/flows-and-pipelines.md](../../skills/deployment-pro/references/flows-and-pipelines.md), [references/methods-and-environments.md](../../skills/deployment-pro/references/methods-and-environments.md)
- **Output:** `ship_definition`

### Step 7 — `verify-and-ship`

- **Type:** skill
- **Skill:** **`testing-pro`** + **`deployment-pro`** (smoke)
- **Input:** release checklist — monitoring, feature flags off, DB migrations applied in order — [references/edge-cases.md](../../skills/deployment-pro/references/edge-cases.md)
- **Output:** `verification`

## Notes

- This workflow is for **planned releases** with notes upfront; use [`hotfix.md`](hotfix.md) for **prod emergencies** and [`ticket.md`](ticket.md) for **Kanban / ticket-shaped** feature work (bundled skills + `kanban/` layout in that workflow).
- If `release_notes` are vague, return to Step 1 with explicit **acceptance criteria** before large implementation work.
