# Quality validation and guardrails (PostgreSQL)

## Contents

1. [Version and docs honesty](#version-and-docs-honesty)
2. [EXPLAIN discipline](#explain-discipline)
3. [Production safety](#production-safety)
4. [RLS and privilege testing](#rls-and-privilege-testing)
5. [Review checklist](#review-checklist)

---

## Version and docs honesty

- **Do not invent** planner output, timing numbers, or version-specific behavior — cite `SELECT version();` and [versioned docs](https://www.postgresql.org/docs/).
- Extension behavior (`pg_trgm`, `postgis`, etc.) varies by **extension version** — verify on target cluster.

---

## EXPLAIN discipline

- Prefer **`EXPLAIN (ANALYZE, BUFFERS)`** on **staging** or **copied** data near prod scale — **`EXPLAIN ANALYZE` executes** the query and can load production.
- When only structure is needed on prod, use **`EXPLAIN`** without `ANALYZE` to reduce risk — pair **`performance-tuning-pro`** for interpretation hygiene.
- Do not paste fabricated `EXPLAIN` trees — describe **shape** (seq scan vs index) when hypothetical.

---

## Production safety

- Long DDL: plan **locks**, **replicas**, and **application timeouts** — **`failure-modes-detection-mitigation.md`**.
- Destructive migrations: require **backup / PITR** awareness and **expand–migrate–contract** — **`decision-tree.md`**.

---

## RLS and privilege testing

- Always validate as **`SET ROLE app_role`** (or equivalent), not superuser.
- Test **`INSERT`/`UPDATE`/`DELETE`** with **`WITH CHECK`**, not only `SELECT` — **`row-level-security.md`**.

---

## Review checklist

- [ ] Server **major** and extensions stated or confirmed.
- [ ] Critical queries have **`EXPLAIN`** evidence at realistic cardinality.
- [ ] Migrations list **lock level** and **rollback** / forward-fix path.
- [ ] App role is **least privilege**; no superuser in application.
- [ ] RLS policies + indexes on predicates where performance matters.
