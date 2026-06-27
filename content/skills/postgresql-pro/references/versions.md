# PostgreSQL — version notes

Run `SELECT version();` and treat **server major** as the contract (client drivers and ORMs vary). Official docs are versioned: [postgresql.org/docs](https://www.postgresql.org/docs/).

| Version line | Examples of behavior to verify in docs |
|--------------|----------------------------------------|
| **15** | `MERGE`, improved `UNIQUE` / null behavior in some patterns, **MERGE** for upserts |
| **16** | Logical replication improvements; monitoring views; performance work — check upgrade notes |
| **17+** | Follow release notes for planner, replication, and security changes |

| Topic | Check when upgrading |
|-------|---------------------|
| **Replication** | Slots, WAL, standby conflicts |
| **RLS** | Policy evaluation order, `FORCE ROW LEVEL SECURITY` |
| **Partitioning** | Pruning, default partition pitfalls |
| **Extensions** | `pgvector`, PostGIS — binary compatibility per PG major |

**When NOT to assume:** Features described in blog posts without a major number — always match docs to your **exact** server version.
