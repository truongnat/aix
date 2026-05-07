# Workflow: hotfix

**Production-urgent** fix: minimal change set, short branch lifetime, promote to prod, then merge back to ongoing dev lines. Uses **`git-operations-pro`**, **`deployment-pro`**, **`testing-pro`**, and stack **`*-pro`** as needed.

**Domain:** `dev` — this file lives under **`workflows/dev/`** alongside [`ticket.md`](ticket.md). **Filename** follows the repo rule **`w-<slug>.md`** (see [`workflows/README.md`](../README.md#naming)).

**Invoke:** `/hotfix` (see [`.claude/commands/hotfix.md`](../../.claude/commands/hotfix.md)).

## Metadata

| Field | Value |
|-------|-------|
| **id** | `hotfix` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `symptom` | Yes | What broke in prod (error, Sentry, customer report, metric) |
| `prod_ref` | No | Branch or tag to branch from (e.g. `main`, `release/x.y`, deploy tag) — ask if unclear |
| `stack` | No | Runtime/framework for the fix (for the right `*-pro` skill) |

## Decision paths

- **Symptom unclear:** Extend Step 1 until impact and blast radius are known; do not branch until scope is minimal.
- **Fix requires feature work:** Stop hotfix path; use [`ticket.md`](ticket.md) or [`release.md`](release.md).
- **DB migration in hotfix:** Extra care — involve **`postgresql-pro`** + **`deployment-pro`**; prefer reversible or expand/contract ordering.

## Error handling

- **Cannot reproduce in non-prod:** Document **what** was verified in staging vs **assumption** for prod; label confidence.
- **Rollback failed:** Escalate immediately; preserve **previous** artifact/tag references in `deploy_notes`.
- **Cherry-pick conflicts on merge-back:** Prefer explicit merge commit with conflict resolution notes; do not drop the fix.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** for risk callouts and status tables (fix status, deploy step, verification).  
`deploy_notes` and `merge_followup` should be skimmable bullets with **owner** and **timestamp** where relevant.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | One-file config/data fix, tests green | < 4 h |
| **Standard** | Code path + deploy + smoke | 4–24 h |
| **Deep** | Multi-service, migration, coordinated rollback | > 1 day |

## Escalation

- **Autonomous:** Branch naming, minimal diff, test addition, conventional commit message.
- **Human:** Customer-visible outage, **security** incident, **data** repair, executive comms; on-call approval for prod.

## Outputs

| Variable | Description |
|----------|-------------|
| `hotfix_branch` | Branch name and base ref |
| `fix` | Minimal code/config change + tests |
| `deploy_notes` | How/where promoted; rollback lever |
| `merge_followup` | Back-merge or cherry-pick plan to `develop` / feature branches |

## Steps

### Step 1 — `triage-and-scope`

- **Type:** skill
- **Skill:** `planning-pro` + **`bug-discovery-pro`** (if impact/blast-radius unclear)
- **Input:** `symptom`, `prod_ref`
- **Output:** smallest fix that resolves prod; explicit **non-goals** — [references/scope-and-decomposition.md](../../skills/planning-pro/references/scope-and-decomposition.md), [references/bug-candidates-and-confidence.md](../../skills/bug-discovery-pro/references/bug-candidates-and-confidence.md)

### Step 2 — `branch-from-production`

- **Type:** skill
- **Skill:** **`git-operations-pro`**
- **Input:** `prod_ref` — create **`hotfix/*`** (or team convention) from production line only; no unrelated commits — [references/commits-and-branching.md](../../skills/git-operations-pro/references/commits-and-branching.md)

### Step 3 — `fix-and-test`

- **Type:** skill
- **Skill:** domain **`*-pro`** from `stack` + **`testing-pro`**
- **Input:** scoped fix — regression or unit test proving the bug; avoid drive-by refactors.
- **Output:** `fix` — [references/test-pyramid-and-strategy.md](../../skills/testing-pro/references/test-pyramid-and-strategy.md)

### Step 4 — `review-and-merge-to-release`

- **Type:** skill
- **Skill:** **`git-operations-pro`**
- **Input:** PR to the branch that tracks production (or policy equivalent); fast review; conventional commit message — [references/collaboration-and-safety.md](../../skills/git-operations-pro/references/collaboration-and-safety.md)

### Step 5 — `deploy-and-verify`

- **Type:** skill
- **Skill:** **`deployment-pro`** (+ **`security-pro`** if secrets/config change)
- **Input:** release channel for hotfix — [references/flows-and-pipelines.md](../../skills/deployment-pro/references/flows-and-pipelines.md), [references/methods-and-environments.md](../../skills/deployment-pro/references/methods-and-environments.md); smoke/health check after deploy; **`rollback`** plan if regression — [references/edge-cases.md](../../skills/deployment-pro/references/edge-cases.md)

### Step 6 — `merge-back`

- **Type:** skill
- **Skill:** **`git-operations-pro`**
- **Input:** bring hotfix into **`develop`** / **`main`** as per team policy (merge vs cherry-pick) so drift does not reintroduce the bug — [references/commits-and-branching.md](../../skills/git-operations-pro/references/commits-and-branching.md)
- **Output:** `merge_followup`

## Notes

- Hotfix is **not** a substitute for full **`ticket`** / Kanban process — use [`ticket.md`](ticket.md) when the change can follow normal planning and `kanban/<ticket>/` artifacts.
- If DB migrations are involved, use **`postgresql-pro`** (ordering, `CONCURRENTLY`, rollback) and **`deployment-pro`** zero-downtime cautions.
