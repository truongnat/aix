# SQL data access — integration map

| Skill | Combine when |
|-------|----------------|
| **`postgresql-pro`** | Server Postgres, migrations, `EXPLAIN (ANALYZE)`, RLS, vacuum/replication, concurrency at scale. |
| **`data-analysis-pro`** | Post-export pandas, charts, Parquet pipelines, statistical validation. |
| **`security-pro`** | Injection in apps, credential handling, PII in exports, path trust. |
| **`nestjs-pro`** / **`nextjs-pro`** | ORM and app-layer connection lifecycle — this skill for **raw** SQLite in scripts/tests. |
| **`performance-tuning-pro`** | Very large exports, memory pressure, batching I/O. |
| **`content-analysis-pro`** | User attached `.db` without SQL goal — clarify schema vs narrative summary. |

**Boundary:** **`sql-data-access-pro`** = **SQLite file workflows** + portable SQL habits; **`postgresql-pro`** = **production server** Postgres.
