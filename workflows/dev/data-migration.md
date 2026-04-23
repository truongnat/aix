# Workflow: data-migration

Structured **database / data migration** planning and execution: schema changes, backfills, cutovers, and rollback — with explicit risk tiers and verification gates.

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `data-migration.md`.

**Invoke:** `/data-migration`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `data-migration` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `migration_goal` | Yes | What changes (tables, columns, data rewrite, platform move) |
| `environment` | No | dev / staging / prod constraints; maintenance windows |
| `domain_stack` | No | e.g. PostgreSQL, MySQL, SQLite — routes to `*-pro` skills |

## Outputs

| Variable | Description |
|----------|-------------|
| `migration_plan` | Ordered steps; forward + rollback; idempotency notes |
| `verification_checklist` | Pre/post checks, row counts, invariants |
| `residual_risks` | What cannot be fully validated in lower envs |

## Decision paths

- **Zero-downtime required:** Prefer expand → backfill → contract; avoid long locks; use `postgresql-pro` patterns for concurrent index / batched updates.
- **One-way destructive step:** Require explicit backup + tested restore **before** Step 4.
- **PII / regulated data:** Involve `security-pro` in Step 2; redact examples in docs.
- **Small, reversible change:** Still document rollback; skip heavy rollout machinery only if team policy allows.

## Error handling

- **Migration fails mid-run:** Stop; assess partial state; use documented rollback or forward-fix script; **do not** re-run blindly without idempotency proof.
- **Lock timeout / contention:** Pause; reduce batch size; schedule off-peak; consider `SET lock_timeout` strategy per `postgresql-pro`.
- **Drift between envs:** Reconcile schema from source of truth before retry.

## Output format

Follow **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** (severity for risks, progress tables).  
Include: **scope**, **ordering**, **rollback**, **verification**, **residual risks** callouts.  
Record major decisions in **[`templates/report/architecture-decision-record.md`](../../templates/report/architecture-decision-record.md)** when the migration encodes a lasting design choice.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single column add, nullable, backfill optional | < 2 h |
| **Standard** | Multi-table + backfill + deploy coordination | 1–3 days |
| **Deep** | Large table rewrite, cross-region, or platform move | > 1 week |

## Escalation

- **Human:** Prod data correction, compliance sign-off, customer-visible downtime approval.
- **Autonomous:** Plan draft, staging verification, checklist generation.

## Steps

### Step 1 — `frame-and-risk`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** `migration_goal`, `environment`
- **Output:** Goals, non-goals, blast radius, maintenance window needs.

### Step 2 — `schema-and-data-design`

- **Type:** skill
- **Skill:** `postgresql-pro` or `sql-data-access-pro` (match stack)
- **Input:** Current vs target schema; volume estimates
- **Output:** DDL ordering; index strategy (including partial / concurrent where relevant); backfill batches.

### Step 3 — `safety-and-secrets`

- **Type:** skill
- **Skill:** `security-pro`
- **Input:** Data sensitivity, credentials in migration paths, logs
- **Output:** Redaction rules; least-privilege DB role for migration.

### Step 4 — `rollout-and-rollback`

- **Type:** skill
- **Skill:** `deployment-pro`
- **Input:** Release coupling (app + DB), feature flags, blue/green if any
- **Output:** Ordered deploy steps; **rollback** procedure tied to app version + schema.

### Step 5 — `verify-and-document`

- **Type:** skill
- **Skill:** `testing-pro` + `feedback-pro`
- **Input:** Plan from Steps 1–4
- **Output:** `migration_plan`, `verification_checklist`, `residual_risks`.

## Notes

- Pair with **`prompts/generation/migration-script.md`** for script-oriented migrations.
- For application-level data fixes without DDL, still use verification gates from Step 5.
