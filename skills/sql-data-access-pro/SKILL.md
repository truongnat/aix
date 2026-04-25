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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** path trust, read vs write, and whether Postgres is the real target. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.