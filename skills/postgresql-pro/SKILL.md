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

1. Confirm server version, extensions, and pooler mode (session vs transaction) when relevant.
2. Apply summaries below; open `references/`; for RLS, reason about **real app role**, not superuser.
3. Respond with **Suggested response format**; call out **locks**, **replica consistency**, and **EXPLAIN** safety.

### Operating principles

1. **Explicit types and constraints** — `NOT NULL` + defaults where domain implies; document nullable columns.
2. **Indexes with a reason** — Write amplification; verify with `EXPLAIN` — **`schema-and-query-design.md`**.
3. **Migrations are contracts** — Reversible steps; avoid long `ACCESS EXCLUSIVE` on hot paths; batch backfills — **`failure-modes-detection-mitigation.md`**.
4. **Least privilege** — App roles minimal `GRANT`; separate migration role when feasible — **`quality-validation-and-guardrails.md`**.
5. **RLS is explicit** — Policies per command/role; index predicates; test `WITH CHECK` — **`row-level-security.md`**.
6. **MVCC awareness** — Long transactions block vacuum; isolation choice matches invariants — **`postgresql-mvcc-storage-and-transaction-system-model.md`**.

### Schema and query design (summary)

Normalization baseline; selective denorm; PK/FK/JSONB patterns — **`schema-and-query-design.md`**.

Details: [references/schema-and-query-design.md](references/schema-and-query-design.md)

### PostgreSQL MVCC, storage, and transactions (summary)

Snapshots, tuple versions, vacuum, isolation, WAL at a glance — **`postgresql-mvcc-storage-and-transaction-system-model.md`**.

Details: [references/postgresql-mvcc-storage-and-transaction-system-model.md](references/postgresql-mvcc-storage-and-transaction-system-model.md)

### Tips and tricks (summary)

`CONCURRENTLY`, partial/`INCLUDE` indexes, CTE planner behavior by version, PgBouncer modes — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

MVCC, isolation, locks, sequences, replication, TOAST, RLS — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Row Level Security (summary)

`USING` / `WITH CHECK`, owner vs `BYPASSRLS`, `FORCE`, pooling, restrictive policies (15+) — **`row-level-security.md`**.

Details: [references/row-level-security.md](references/row-level-security.md)

### Decision framework (summary)

Normalize vs denorm, RLS vs app-only, partition vs index, isolation vs retries — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

App superuser, unindexed FKs, RLS without predicate indexes — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`nestjs-pro`**, **`deployment-pro`**, **`security-pro`**, **`caching-pro`**, **`testing-pro`**, **`performance-tuning-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Version notes (summary)

Planner, replication, RLS details vary by major — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Postgres version, extensions, pooler, workload (OLTP vs analytics), replica use.
2. **Problem / goal** — Slow query, migration, RLS bug, incident, or schema evolution.
3. **System design** — MVCC / isolation / replication angle when relevant — **`postgresql-mvcc-storage-and-transaction-system-model.md`**.
4. **Decision reasoning** — Index type, RLS vs app, expand–migrate–contract, primary vs replica reads — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — SQL, migration order, `EXPLAIN` approach — **`quality-validation-and-guardrails.md`** (no fabricated plans).
6. **Trade-offs** — Locks, bloat, RLS cost, consistency vs replicas.
7. **Failure modes** — Lock waits, RLS empty result, stale replica, pool prepared statements — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — Monitoring (`pg_stat_statements`, lag), rollback, hand off to **`deployment-pro`** / **`performance-tuning-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **MVCC / storage / transaction model** | [references/postgresql-mvcc-storage-and-transaction-system-model.md](references/postgresql-mvcc-storage-and-transaction-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Schema and query design | [references/schema-and-query-design.md](references/schema-and-query-design.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases and ops | [references/edge-cases.md](references/edge-cases.md) |
| **Row Level Security (RLS)** | [references/row-level-security.md](references/row-level-security.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** After enabling RLS, app role cannot `SELECT` any rows.  
**Expected output:** Full **Suggested response format** — default-deny, `CREATE POLICY`, owner/`BYPASSRLS`, minimal policy examples — **`row-level-security.md`**.

### 2 — Tricky (edge case)

**Input:** Large table needs new index; `CREATE INDEX` would block writes for minutes.  
**Expected output:** `CREATE INDEX CONCURRENTLY`, invalid index retry, load window — **`failure-modes-detection-mitigation.md`**, **`tips-and-tricks.md`**.

### 3 — Cross-skill

**Input:** Nest sets tenant in middleware but RLS sees wrong `current_setting`.  
**Expected output:** **`postgresql-pro`** — `SET LOCAL` + transaction boundary + PgBouncer mode — **`nestjs-pro`** — ORM session/prepared statement compatibility — **`integration-map.md`**.

## Checklist before calling the skill done

### Schema and queries

- [ ] Indexes justified; `EXPLAIN` at realistic scale — **`quality-validation-and-guardrails.md`**.
- [ ] Constraints and FK `ON DELETE` semantics match app expectations — **`schema-and-query-design.md`**.

### Migrations and ops

- [ ] Tested on prod-like volume; rollback or forward-fix documented — **`failure-modes-detection-mitigation.md`**.
- [ ] Hot DDL uses safe patterns (`CONCURRENTLY`, expand phase) — **`decision-tree.md`**.
- [ ] Long DML batched; `lock_timeout` considered where appropriate — **`edge-cases.md`**.

### Security and RLS

- [ ] No superuser in app; least privilege — **`anti-patterns.md`**.
- [ ] RLS tested as **app role**; `WITH CHECK` on writes; predicate indexes where needed — **`row-level-security.md`**.

### Integrity

- [ ] No invented `EXPLAIN` output or version-specific claims without docs — **`quality-validation-and-guardrails.md`**.
- [ ] **`integration-map.md`** used when rollout, cache, or ORM dominates.
