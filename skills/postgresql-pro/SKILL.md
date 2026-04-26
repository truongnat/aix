---
name: postgresql-pro
description: |
  Production-grade PostgreSQL: schema design, SQL performance, migrations, MVCC and vacuum awareness, replication and pooling edge cases, and Row Level Security (RLS) — plus system model (snapshots, tuple versions, isolation, WAL at a glance), failure modes (migration locks, RLS visibility, replica lag, PgBouncer prepared statements), decision trade-offs (normalize vs denorm, RLS vs app-only, partition vs index, isolation vs retries), and quality guardrails (version-accurate docs, EXPLAIN discipline, least privilege, RLS tested as app role).

  Use this skill when the user works on PostgreSQL, SQL, migrations (Flyway, Prisma, TypeORM, knex, raw SQL), indexing, EXPLAIN ANALYZE, transactions, isolation levels, replication, vacuum, connection pooling, partitioning, full-text search, JSONB, LISTEN/NOTIFY, or asks for DB review, slow query tuning, or deadlock investigation.

  RLS-focused: row-level security, policies (USING / WITH CHECK), ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY, BYPASSRLS, multi-tenant isolation, tenant_id policies, Supabase RLS, JWT claims in policies, session variables for tenant context, restrictive policies, or debugging "no rows" / wrong visibility after enabling RLS.

  Combine with **`nestjs-pro`** / **`nextjs-pro`** for ORM integration, **`deployment-pro`** for migration rollout, **`security-pro`** / **`auth-pro`** for identity boundaries, **`caching-pro`** for cache invalidation, **`testing-pro`** for CI databases, **`performance-tuning-pro`** for end-to-end latency, and **`sql-data-access-pro`** when SQLite portability matters.

  Triggers: "PostgreSQL", "Postgres", "SQL", "migration", "EXPLAIN", "ANALYZE", "index", "bloat", "VACUUM", "MVCC", "transaction", "isolation", "deadlock", "lock", "replication", "read replica", "JSONB", "CTE", "partition", "pg_stat", "autovacuum", "connection pool", "RLS", "row level security", "policy", "USING", "WITH CHECK", "BYPASSRLS", "tenant", "multi-tenant", "Supabase RLS", "listen notify", "serialization failure", "40P01".

metadata:
  short-description: PostgreSQL — MVCC model, schema, RLS, migrations, failure modes, guardrails
  content-language: en
  domain: database
  level: professional
---

# PostgreSQL (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [PostgreSQL documentation](https://www.postgresql.org/docs/) for version-specific behavior; this skill encodes **design discipline**, **MVCC-aware operations**, **query and index patterns**, and **RLS correctness** — not a replacement for the manual. Confirm **server major** (`SELECT version();`) when behavior differs across releases.

## Boundary

**`postgresql-pro`** owns the **PostgreSQL server** product: DDL/DML design, policies, migrations, plans, locks, vacuum/replication semantics. **`sql-data-access-pro`** owns **embedded SQLite** and portable SQL habits. **`performance-tuning-pro`** owns **cross-tier latency diagnosis** when the DB is only one segment. **`deployment-pro`** owns **when and how** migrations run in pipelines.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`sql-data-access-pro`** | SQLite locally; SQL portability vs Postgres |
| **`nestjs-pro`** / **`nextjs-pro`** | ORM, request-scoped connections, serverless pools |
| **`deployment-pro`** | Migration windows, secrets, rollout |
| **`security-pro`** | Threat model beyond DB roles |
| **`auth-pro`** | Tokens and identity feeding RLS context |
| **`caching-pro`** | Redis/CDN; invalidation with DB truth |
| **`testing-pro`** | CI DB fixtures and templates |
| **`performance-tuning-pro`** | p99 across app + DB; load shape |
| **`data-analysis-pro`** | Heavy read/export to analytics tools |

## When to use

- Designing or evolving schemas, constraints, indexes, and migrations.
- Tuning queries, interpreting `EXPLAIN (ANALYZE, BUFFERS)`, reducing lock contention.
- Zero-downtime or low-risk migrations (expand/migrate/contract, `CONCURRENTLY`).
- Vacuum bloat, replication lag, pool exhaustion, deadlocks.
- **`ENABLE ROW LEVEL SECURITY`**, policies, tenant isolation, Supabase-style JWT policies, RLS performance.

## When not to use

- **SQLite or file-embedded DB** as primary topic — **`sql-data-access-pro`**.
- **Pure ORM framework API** without SQL/plan/migration — **`nestjs-pro`** / Prisma docs (pair **`postgresql-pro`** for SQL).
- **Cloud-only IAM / network topology** — **`deployment-pro`** / **`network-infra-pro`** (pair for DB connectivity).

## Required inputs

- **PostgreSQL major version** (or permission to assume from user).
- **Migration tool** when relevant (Prisma, Flyway, raw SQL).
- For RLS: **application role** and **how tenant context** is set (`SET`, JWT, etc.).

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** server version, extensions, and pooler mode (session vs transaction) when relevant. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm Postgres major, workload shape, migration tooling, and pool mode before proposing changes. Ask whether the problem is schema, query, transaction, or operational.
2. **Simplicity First** — Start with the smallest schema/query/policy change that solves the issue. Avoid premature partitioning, denormalization, or lock-heavy rewrites.
3. **Surgical Changes** — Touch only the affected table, index, migration, role, or query path. No opportunistic redesign of unrelated data models.
4. **Goal-Driven Execution** — Done = the change is verified with real query plans, locking behavior, or policy outcomes instead of intuition alone.
5. **Plans before opinions** — Performance advice should be grounded in `EXPLAIN`/`EXPLAIN ANALYZE`, row counts, and workload characteristics.
6. **MVCC is the default reality** — Snapshot visibility, vacuum, and concurrent writes are part of every correctness decision.
7. **Least privilege is structural** — RLS, roles, and grants must be validated using the real application role, not superuser shortcuts.
8. **Rollout safety matters** — Migration lock scope, replica lag, and pool behavior can turn a correct SQL change into an operational incident.

## Default recommendations by scenario

- **Slow query** — Inspect the real plan and row estimates before editing indexes or rewriting SQL.
- **Migration risk** — Prefer expand/migrate/contract and low-lock operations before table rewrites.
- **RLS bug** — Test with the actual app role and tenant context path before changing policies.
- **Pool/replica issue** — Confirm session vs transaction pooling and read/write routing before changing application logic.

## Decision trees

Summary: determine whether the issue is schema design, query planning, transaction semantics, policy visibility, or rollout safety, then choose the smallest verifiable fix.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: indexing without plan evidence, superuser-only RLS testing, migration DDL that blocks production traffic, and using application conventions as a substitute for database guarantees.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### PostgreSQL MVCC, storage, and transaction model (summary)

How tuple versions, snapshots, locks, and WAL shape correctness and performance decisions.

Details: [references/postgresql-mvcc-storage-and-transaction-system-model.md](references/postgresql-mvcc-storage-and-transaction-system-model.md)

### Schema and query design (summary)

How to structure tables, constraints, indexes, and query patterns for maintainability and planner friendliness.

Details: [references/schema-and-query-design.md](references/schema-and-query-design.md)

### Row level security (summary)

How policies, roles, and tenant context interact, and the mistakes that cause invisible rows or accidental exposure.

Details: [references/row-level-security.md](references/row-level-security.md)

### Failure modes and mitigation (summary)

Migration locks, replica lag, deadlocks, pooler mismatches, and policy mistakes to detect before production impact.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect planner behavior, DDL options, extensions, and operational guidance.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Postgres version, workload, migration tool, pool mode, and app-role constraints.
2. **System model** — Explain the relevant MVCC, locking, planner, replication, or RLS behavior.
3. **Solution** — Minimum schema/query/policy/migration change with rationale.
4. **Verification** — `EXPLAIN`, lock observation, policy test, or rollout check that proves the change.
5. **Residual risks** — Remaining operational, compatibility, or workload caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| PostgreSQL MVCC, storage, and transaction model | [references/postgresql-mvcc-storage-and-transaction-system-model.md](references/postgresql-mvcc-storage-and-transaction-system-model.md) |
| Schema and query design | [references/schema-and-query-design.md](references/schema-and-query-design.md) |
| Row level security | [references/row-level-security.md](references/row-level-security.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "A query became slow after adding a new filter."
- Check the real plan and row estimates before adding indexes blindly.
- Add or adjust the narrowest useful index or query shape only if plan evidence supports it.
- **Verify:** `EXPLAIN (ANALYZE, BUFFERS)` shows the intended access path and improved timing under representative data.

**Input (tricky):** "RLS blocks valid rows only in production behind PgBouncer."
- Confirm pool mode and how tenant/session state is set; transaction pooling changes what session-local assumptions are safe.
- Test policy behavior with the real application role and the actual context propagation path.
- **Verify:** The same tenant sees the correct rows under production-equivalent pooling, while cross-tenant access still fails.

**Input (cross-skill):** "A NestJS deploy adds a column and backfill without downtime."
- Pair **`deployment-pro`** for rollout order and **`nestjs-pro`** for app-read/write compatibility while the schema is in transition.
- Use expand/migrate/contract instead of a one-shot lock-heavy migration.
- **Verify:** Old and new app versions both work during rollout, and migration lock/replica impact stays within bounds.

## Checklist before calling the skill done

- [ ] Postgres version, workload shape, migration tool, and pool mode confirmed before proposing changes (Think Before Coding)
- [ ] Minimum schema/query/policy change chosen; no speculative denormalization or partitioning (Simplicity First)
- [ ] Only the affected table/query/migration/policy surface was changed (Surgical Changes)
- [ ] Success criteria and verification path are explicit and based on real plans, locks, or policy behavior (Goal-Driven Execution)
- [ ] Performance claims are backed by `EXPLAIN` or equivalent evidence
- [ ] RLS and privilege behavior are validated with the real application role/context
- [ ] Migration and rollout risk is addressed for lock scope, replicas, and poolers
- [ ] Residual workload or operational caveats are documented clearly
