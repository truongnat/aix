# PostgreSQL — anti-patterns

1. **Superuser or owner role in application code** — Bypasses RLS; hides policy bugs. Use a dedicated app role with explicit `GRANT`.

2. **Unindexed foreign keys** — Deletes and updates on parent tables scan full child tables.

3. **`SELECT *` in hot paths** — Breaks when columns change; increases I/O; prefer explicit columns and covering indexes.

4. **Long transactions “holding the world”** — Blocks vacuum; causes bloat. Keep transactions short; avoid interactive sessions in migration roles.

5. **RLS policies without matching indexes** — Predicate columns in `USING` / `WITH CHECK` need indexes like any WHERE clause.

6. **Serial / identity for security-sensitive tokens** — Predictable; use `gen_random_uuid()` or opaque strings for public identifiers when exposure matters.

7. **Running `VACUUM FULL` casually** — Locks table; use routine autovacuum tuning first.

8. **Mixing session `SET` with PgBouncer transaction pooling** — Session state disappears between transactions; use `SET LOCAL` in the same transaction as queries or fix pool mode.

9. **Nullable unique constraints without careful NULL handling** — Multiple NULLs often allowed; use partial unique indexes if business rule is “one non-null value.”

10. **Migrations that rewrite whole tables at peak** — Prefer batch updates, `CONCURRENTLY`, and expand/contract patterns.

When NOT to add an index: rare queries and write-heavy tables may be cheaper with sequential scans after `ANALYZE` — prove with `EXPLAIN (ANALYZE, BUFFERS)`.
