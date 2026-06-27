# PostgreSQL — integration map

| Combined skill | Why | `postgresql-pro` owns | Other skill owns |
|----------------|-----|----------------------|------------------|
| **`nestjs-pro`** / **`nextjs-pro`** | App talks to Postgres | Policies, migrations, query plans | ORM APIs, connection in request, serverless pool quirks |
| **`sql-data-access-pro`** | SQLite locally vs Postgres; portable SQL | MVCC/types/portability gaps vs server Postgres | Embedded file DB scripts |
| **`deployment-pro`** | Migrations in prod | Ordering, locks, `CONCURRENTLY`, rollback SQL | Pipeline gates, secrets for DB URLs |
| **`security-pro`** | Data protection | Least privilege roles, RLS, encryption at rest awareness | App-level authz, logging policy |
| **`auth-pro`** | Identity | RLS with `current_setting` / JWT claims mapped to DB | Token validation outside DB |
| **`caching-pro`** | Reduce DB load | Query correctness, invalidation boundaries | Cache keys, TTL, Redis |
| **`testing-pro`** | CI databases | Fixtures, transactions per test, templates | Test runner config |
| **`data-analysis-pro`** | Analytics export | `COPY`, read-only replicas for heavy SELECT | pandas / notebooks |
| **`performance-tuning-pro`** | End-to-end latency | Query shape, N+1, pool saturation narrative | Flame graphs outside DB |

**Handoff:** After schema and policies are clear, **`deployment-pro`** owns *when* migrations run; **`postgresql-pro`** owns *what* SQL runs safely.
