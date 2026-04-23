---
name: sql-data-access-pro
description: |
  Production-grade SQL data access for local and embedded workflows: SQLite (`sqlite3` stdlib), parameterized queries, schema discovery, safe read-only opens, CSV export, concurrency and locking model (WAL, writer serialization), and clear handoff to PostgreSQL for server-grade features — plus system model (single-file trust, connections/transactions, reader/writer rules), failure modes (injection, database locked, NFS/corruption, ATTACH path escape, dialect drift), decision trade-offs (SQLite vs PG, in-DB vs export, stdlib vs ORM stack), and quality guardrails (path trust, no fabricated PRAGMAs, PII on export).

  Use this skill when the user works with **`.db` / `.sqlite`** files, ad-hoc SQL in scripts, schema exploration, or exports — not when tuning **PostgreSQL** servers, **RLS**, replication, or large-scale migrations (**`postgresql-pro`**).

  Combine with **`postgresql-pro`** when the workload outgrows SQLite, **`data-analysis-pro`** for pandas-heavy work on exports, **`security-pro`** for injection and secrets, **`performance-tuning-pro`** for huge export/memory issues, and stack skills (**`nestjs-pro`**, **`nextjs-pro`**) when SQLite sits inside an app ORM.

  Triggers: "SQLite", ".db", "sqlite3", "SQL injection", "parameterized query", "SELECT", "schema", "export CSV", "read-only database", "embedded database", "local SQL", "database is locked", "WAL", "ATTACH", "sqlite_master".

metadata:
  short-description: SQL data access — SQLite model, safety, export, PostgreSQL handoff
  content-language: en
  domain: data-access
  level: professional
---

# SQL data access (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [SQLite](https://www.sqlite.org/docs.html) and [Python sqlite3](https://docs.python.org/3/library/sqlite3.html) for embedded truth; this skill encodes **safe access**, **concurrency realism**, and **PostgreSQL handoff** — not server DBA playbooks. Confirm **path trust**, **read-only** intent, and **dialect target** (SQLite-only vs future Postgres).

## Boundary

**`sql-data-access-pro`** owns **SQLite file access**, **stdlib-style** patterns, **portable SQL habits**, and **local export** workflows. **`postgresql-pro`** owns **PostgreSQL server** product: RLS, migrations at scale, vacuum, replication, `EXPLAIN` tuning in production.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`postgresql-pro`** | Server Postgres, RLS, migrations, ops, heavy concurrency |
| **`data-analysis-pro`** | Pandas / Parquet after SQL export |
| **`security-pro`** | Injection policy, credentials, PII |
| **`nestjs-pro`** / **`nextjs-pro`** | ORM and app connection lifecycle |
| **`performance-tuning-pro`** | Large exports, memory, I/O batching |
| **`content-analysis-pro`** | `.db` attached without SQL goal — clarify intent |

## When to use

- Open/query `.db` / `.sqlite` (stdlib or CLI).
- Discover schema; sample rows; safe aggregates.
- Export to CSV for downstream analysis.
- Teach or enforce **parameterized** SQL vs interpolation.

## When not to use

- **Primary topic is PostgreSQL production** — **`postgresql-pro`**.
- **Pure ORM** configuration without SQLite file context — stack skill may lead.
- **No SQL** — narrative-only file summary — **`content-analysis-pro`**.

## Required inputs

- **File path** and whether it is trusted.
- **Read-only** vs write/ETL intent.
- **Python / SQLite versions** when suggesting `PRAGMA` or URI flags.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm path trust, read vs write, and whether Postgres is the real target.
2. Apply summaries; open `references/`; use **`sqlite-access-and-concurrency-system-model.md`** for locks/WAL.
3. Respond with **Suggested response format**; include **injection** and **filesystem** failure modes.

### Operating principles

1. **Parameterized queries** — Default for user-influenced **values** — **`sql-safety-and-postgresql-handoff.md`**.
2. **Least privilege** — Read-only opens for inspection — **`decision-tree.md`**.
3. **Dialect awareness** — Hand off before RLS/JSONB/replication — **`postgresql-pro`**.
4. **No secrets** in URLs or shell history — **`security-pro`**.
5. **Export** heavy stats to **`data-analysis-pro`**.
6. **Integrity** — Corrupt file → backup/restore, not silent repair — **`edge-cases.md`**.

### SQLite and stdlib (summary)

`connect`, row factory, `sqlite_master`, PRAGMA, parameters — **`sqlite-and-stdlib.md`**.

Details: [references/sqlite-and-stdlib.md](references/sqlite-and-stdlib.md)

### SQLite access and concurrency — system model (summary)

Single-file trust, transactions, WAL, reader/writer limits — **`sqlite-access-and-concurrency-system-model.md`**.

Details: [references/sqlite-access-and-concurrency-system-model.md](references/sqlite-access-and-concurrency-system-model.md)

### SQL safety and PostgreSQL handoff (summary)

Injection, dialect, escalation criteria — **`sql-safety-and-postgresql-handoff.md`**.

Details: [references/sql-safety-and-postgresql-handoff.md](references/sql-safety-and-postgresql-handoff.md)

### Tips and tricks (summary)

`EXPLAIN QUERY PLAN`, WAL, `ATTACH` — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Concurrency, NFS, corruption, timezones, ATTACH — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

SQLite vs PG, export vs in-DB, stdlib vs ORM — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Interpolation, dialect confusion, writable opens for read jobs — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`postgresql-pro`**, **`data-analysis-pro`**, **`security-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

Python `sqlite3` / SQLite library; PG handoff types — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Path trust, read/write, Python/SQLite version, local vs future Postgres.
2. **Problem / goal** — Query, schema discovery, export, or safety review.
3. **System design** — Locking model, transactions, single-file trust — **`sqlite-access-and-concurrency-system-model.md`**.
4. **Decision reasoning** — Stay on SQLite vs handoff; export vs in-SQL — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Python `sqlite3` or CLI; parameters and read-only URI — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Concurrency ceiling, dialect portability, export size.
7. **Failure modes** — Injection, locked DB, NFS/corrupt, ATTACH — **`failure-modes-detection-mitigation.md`**.
8. **Residual risks** — PII in exports; delegate **`postgresql-pro`** / **`security-pro`** / **`data-analysis-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **SQLite access & concurrency model** | [references/sqlite-access-and-concurrency-system-model.md](references/sqlite-access-and-concurrency-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| SQLite & stdlib | [references/sqlite-and-stdlib.md](references/sqlite-and-stdlib.md) |
| Safety & PG handoff | [references/sql-safety-and-postgresql-handoff.md](references/sql-safety-and-postgresql-handoff.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple (common)

**Input:** Read `app.db` and list tables with row counts.  
**Expected output:** Full **Suggested response format** — `sqlite_master`, parameterized counts, read-only URI, perf note on large tables — **`sqlite-and-stdlib.md`**.

### 2 — Tricky (edge case)

**Input:** `SELECT * FROM ` + user table name.  
**Expected output:** Identifier allowlist; never raw concat; **`failure-modes-detection-mitigation.md`**; **`security-pro`**.

### 3 — Cross-skill

**Input:** Need RLS and replicas on SQLite file share.  
**Expected output:** Hand off **`postgresql-pro`**; SQLite limits — **`sql-safety-and-postgresql-handoff.md`**.

## Checklist before calling the skill done

### Safety

- [ ] Parameters bound for external **values**; identifiers allowlisted — **`quality-validation-and-guardrails.md`**.
- [ ] **PostgreSQL** topics delegated when applicable — **`integration-map.md`**.

### Operations

- [ ] **Read-only** when no writes — **`decision-tree.md`**.
- [ ] **Export** path PII-aware — **`quality-validation-and-guardrails.md`**.
- [ ] **Locking / WAL / NFS / corruption** mentioned if relevant — **`failure-modes-detection-mitigation.md`**.
- [ ] **Dialect** assumptions stated for future Postgres — **`sql-safety-and-postgresql-handoff.md`**.
- [ ] **Path trust** considered — **`quality-validation-and-guardrails.md`**.
