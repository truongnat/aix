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