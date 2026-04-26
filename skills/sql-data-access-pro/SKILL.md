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

### Operating principles

1. **Think Before Coding** — Confirm file trust, read/write intent, and whether SQLite is the real target or just a stepping stone to Postgres. Ask before assuming writes are safe.
2. **Simplicity First** — Prefer the smallest parameterized query or export path that solves the request. Do not introduce ORM or migration machinery for simple local access.
3. **Surgical Changes** — Touch only the relevant query, schema inspection, export, or connection mode. Do not broaden into unrelated app persistence changes.
4. **Goal-Driven Execution** — Done = the access path is safe, the query/export works against the actual file, and concurrency/path risks are explicit.
5. **Path trust is a security boundary** — Local files and `ATTACH` targets should be treated as inputs, not assumed safe.
6. **Read-only by default** — When the user did not ask to mutate data, prefer read-only access and explicit transaction control.
7. **SQLite concurrency is real** — WAL, writer serialization, and lock behavior should shape guidance instead of being hand-waved away.
8. **Know when to hand off** — If the problem is truly server-grade scale, policy, or replication, escalate to **`postgresql-pro`** instead of stretching SQLite guidance.

## Default recommendations by scenario

- **Schema exploration** — Open read-only, inspect tables/indexes, and sample rows before writing queries.
- **Simple export** — Use parameterized read queries and explicit CSV shape before adding analysis tooling.
- **Locking issue** — Check WAL mode, transaction scope, and concurrent writer assumptions before retry hacks.
- **Migration pressure** — Clarify whether SQLite is still the right storage boundary or whether Postgres handoff is the real fix.

## Decision trees

Summary: determine whether the job is safe local access, export, mutation, locking, or a signal that the workload should move beyond SQLite.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: string-interpolated SQL, unsafe writable opens by default, blind `ATTACH`, and pretending SQLite locking or dialect drift behaves like server Postgres.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### SQLite access and concurrency system model (summary)

How connections, journaling mode, and reader/writer rules affect safe access and lock behavior.

Details: [references/sqlite-access-and-concurrency-system-model.md](references/sqlite-access-and-concurrency-system-model.md)

### SQLite and stdlib patterns (summary)

How to use Python `sqlite3` and local SQL workflows safely and predictably without unnecessary abstraction.

Details: [references/sqlite-and-stdlib.md](references/sqlite-and-stdlib.md)

### SQL safety and PostgreSQL handoff (summary)

How parameterization, trusted paths, and eventual migration boundaries should be handled when SQLite stops fitting the workload.

Details: [references/sql-safety-and-postgresql-handoff.md](references/sql-safety-and-postgresql-handoff.md)

### Failure modes and mitigation (summary)

Injection, lock contention, corruption risks, NFS problems, and dialect mismatch patterns to catch early.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version notes that affect URI flags, `PRAGMA` support, stdlib behavior, and portability assumptions.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — File trust, read/write intent, SQLite/Python version context, and whether Postgres handoff is in play.
2. **System model** — Explain the relevant SQLite access, locking, or dialect behavior.
3. **Solution** — Minimum query, connection, export, or migration-handoff recommendation.
4. **Verification** — How to prove the query/export/access path works safely on the target file.
5. **Residual risks** — Remaining lock, trust, portability, or scale caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| SQLite access and concurrency system model | [references/sqlite-access-and-concurrency-system-model.md](references/sqlite-access-and-concurrency-system-model.md) |
| SQLite and stdlib | [references/sqlite-and-stdlib.md](references/sqlite-and-stdlib.md) |
| SQL safety and PostgreSQL handoff | [references/sql-safety-and-postgresql-handoff.md](references/sql-safety-and-postgresql-handoff.md) |
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

**Input:** "Open this `.db` and export active users to CSV safely."
- Prefer read-only access and a parameterized `SELECT` before any writable operation.
- Keep export scope explicit and avoid pulling unnecessary sensitive columns.
- **Verify:** The query runs against the target file and the CSV contains only the intended rows/fields.

**Input (tricky):** "We keep seeing `database is locked` during nightly writes."
- Check WAL mode, transaction duration, and concurrent writer assumptions before adding retries.
- Tighten transaction scope or scheduling instead of masking the lock semantics.
- **Verify:** The write path completes reliably under the actual contention pattern.

**Input (cross-skill):** "This local SQLite workflow is turning into a shared production service."
- Pair **`postgresql-pro`** to assess migration/handoff boundaries instead of stretching SQLite past its safety envelope.
- Separate immediate data-access needs from the longer-term storage migration path.
- **Verify:** The current local access is stable and the reasons for handoff are explicit.

## Checklist before calling the skill done

- [ ] File trust, read/write intent, and true storage target confirmed first (Think Before Coding)
- [ ] Minimum safe query/access path chosen; no unnecessary ORM or migration machinery added (Simplicity First)
- [ ] Only the relevant query/export/connection surface was changed (Surgical Changes)
- [ ] Success criteria and safe verification path are explicit and validated (Goal-Driven Execution)
- [ ] Queries are parameterized and writable access is intentional
- [ ] Locking/journaling assumptions are stated where concurrency matters
- [ ] Sensitive exports and path trust boundaries are handled explicitly
- [ ] Postgres handoff is recommended when SQLite is no longer the right fit
