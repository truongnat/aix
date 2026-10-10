# PostgreSQL — decision trees

## Index type: B-tree vs GIN vs GiST vs BRIN vs partial

```
Query pattern?
├── Equality or range on scalar column (id, created_at, status)?
│   └── Default B-tree index — CREATE INDEX … ON t (col)
├── JSONB containment / existence, full-text, array overlap?
│   └── GIN (often) — verify with EXPLAIN ANALYZE
├── Geometric or nearest-neighbor (PostGIS)?
│   └── GiST or SP-GiST (domain-specific)
├── Very large table, filter on naturally ordered block-correlated column?
│   └── Consider BRIN — small size, narrow use cases
└── Hot subset of rows (e.g. WHERE deleted_at IS NULL AND tenant_id = $1)?
    └── Partial index — smaller, faster for that predicate
```

**Decision:** Start from **workload + EXPLAIN**; add **partial** indexes when a stable predicate slices most queries.

## Row-level security vs application checks

```
Must enforce tenant isolation in DB regardless of app bugs?
├── Yes (multi-tenant SaaS, compliance)
│   └── RLS + least-privilege role; test as app role, not superuser
└── Single-tenant with trusted app layer only?
    └── FK + CHECK may suffice — still document trust boundary
```

## Migration strategy (expand → migrate → contract)

```
Schema change could lock or rewrite a hot table?
├── Additive change (new nullable column, new table)?
│   └── Expand: deploy compatible schema first; backfill in batches
├── Destructive or type change?
│   └── Dual-write or backfill phase before removing old column
└── Index on large table in prod?
    └── CREATE INDEX CONCURRENTLY; monitor invalid index and retry pattern
```

## Reads: primary vs replica

```
Need read-your-writes or just-saved consistency?
├── Yes → route those reads to primary (or sync replica) — **`edge-cases.md`**
└── Tolerate lag → replica OK; measure replication delay — **`failure-modes-detection-mitigation.md`**
```

## Connection: PgBouncer transaction vs session mode

```
Need session variables (SET LOCAL, prepared statements pinned to session)?
├── Yes
│   └── Session pooling or direct connections — align ORM settings
└── Stateless short queries only?
    └── Transaction pooling OK for many apps — verify ORM compatibility
```

## Further reading

- SQL design: [schema-and-query-design.md](schema-and-query-design.md)
- RLS: [row-level-security.md](row-level-security.md)
