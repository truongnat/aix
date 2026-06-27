---
name: nestjs-neo4j-pro
description: >
  NestJS + Neo4j integration: neo4j-driver lifecycle, parameterized Cypher,
  MERGE idempotency, centralized constraints in OnModuleInit, sessions, and
  graph modeling.


  Use this skill when integrating Neo4j with NestJS, writing Cypher, creating
  constraints, managing sessions/transactions, or mapping graph data to DTOs.


  Combine with **`docker-compose-pro`** for Neo4j container setup,
  **`kb-workflow`** for solution graph patterns in this monorepo.


  Triggers: "neo4j", "graph database", "cypher", "MERGE", "constraint",
  "neo4j-driver", "bolt", "relationship", "graph modeling", "neo4j session",
  "Cannot resolve dependencies", "OnModuleInit", "DETACH DELETE"
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# NestJS + Neo4j (professional)

Use official [neo4j-driver docs](https://neo4j.com/docs/javascript-manual/current/) and [Cypher manual](https://neo4j.com/docs/cypher-manual/current/) for API truth; this skill encodes **parameterized Cypher**, **centralized constraint init**, and **session discipline** from production KB API work.

## Boundary

**`nestjs-neo4j-pro`** owns **application-layer Neo4j in NestJS**: driver module, Cypher in services, constraints, sessions, transactions, record mapping. Defers to **`docker-compose-pro`** for Neo4j container/orchestration and **`vps-devops-pro`** for backup and VPS operations.

## When to use

- Graph data modeling for NestJS apps
- Cypher: MATCH, MERGE, CREATE, relationships
- `neo4j-driver` lifecycle in NestJS modules
- Uniqueness constraints and indexes at startup
- Session/transaction patterns and DTO mapping
- Trigger keywords: `neo4j`, `cypher`, `MERGE`, `bolt`, `graph`, `constraint`

## When not to use

- **SQL / TypeORM / Prisma** — relational patterns
- **Neo4j cluster ops** — causal clustering, enterprise admin
- **Frontend graph viz** — D3/vis.js
- **General NestJS** without Neo4j

## Required inputs

- **Neo4j version** (4.x vs 5.x syntax)
- **NestJS** module layout
- **Entity relationships** and access patterns
- **Community vs Enterprise** edition

## Expected output

1. **Issue or goal** — modeling or query task
2. **Recommendation** — graph shape, MERGE vs CREATE, constraint plan
3. **Code** — NestJS service with parameterized Cypher
4. **Residual risks** — pool leaks, integer precision, race on constraints

## Workflow

1. **Confirm** Neo4j version, edition, and whether constraints already exist. Verify: `driver.verifyConnectivity()`, list constraints in Browser or `SHOW CONSTRAINTS`.
2. **Apply** model nodes/relationships; centralize constraints in one `OnModuleInit`; use `$params` and `neo4j.int()` for integers (**Simplicity First**).
3. **Verify** MERGE idempotency, session closed in `finally`, no `RETURN *` (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — confirm schema and natural keys before writing MERGE.
2. **Simplicity First** — use neo4j-driver directly; avoid ORMs that hide Cypher.
3. **Surgical Changes** — only the service/query under change; constraints stay centralized.
4. **Goal-Driven Execution** — test upsert twice; confirm constraint creation is idempotent.
5. **Parameterized everything** — never interpolate user input into Cypher strings.
6. **MERGE for idempotency** — `ON CREATE SET` before trailing `SET` after MERGE.
7. **One onModuleInit for constraints** — all `CREATE CONSTRAINT IF NOT EXISTS` in `Neo4jService` only.

## Default recommendations by scenario

| Scenario | Recommendation |
|----------|----------------|
| Single entity upsert | MERGE + ON CREATE SET + SET |
| Batch import | UNWIND + MERGE |
| Read query | `session.run()` auto-commit |
| Multi-step write | `executeWrite` / explicit write transaction |
| Pagination | `SKIP`/`LIMIT` with `neo4j.int()` |
| Delete with edges | DETACH DELETE |

## Anti-patterns

- **String interpolation in Cypher** — injection risk; use `$params`
- **Missing session.close()** — pool exhaustion; use `finally`
- **RETURN \*** — over-fetching; explicit properties
- **Constraints in multiple services** — race; centralize in `Neo4jService`
- **JS numbers > 2^53** — use `neo4j.int()`

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Graph modeling (summary)

- Nodes, relationships, properties; KB domain (Solution, Tag, Project)

Details: [references/graph-modeling.md](references/graph-modeling.md)

### Cypher patterns (summary)

- MATCH/MERGE, pagination, UNWIND batches, aggregation

Details: [references/cypher-patterns.md](references/cypher-patterns.md)

### Module initialization (summary)

- Driver verify, centralized constraints, startup order

Details: [references/module-initialization.md](references/module-initialization.md)

### Transaction patterns (summary)

- Auto-commit vs explicit write tx; error handling

Details: [references/transaction-patterns.md](references/transaction-patterns.md)

### Edge cases (summary)

- Integers, nulls, concurrency, streaming, pool limits

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision tree (summary)

- Graph vs relational; Community vs Enterprise; when APOC is needed

Details: [references/decision-tree.md](references/decision-tree.md)

## Suggested response format (implement / review)

1. **Issue or goal** — modeling or query need
2. **Recommendation** — approach and constraint implications
3. **Code** — NestJS service + parameterized Cypher
4. **Residual risks** — leaks, races, performance

## Resources in this skill

| Topic | File |
|-------|------|
| Graph modeling | [references/graph-modeling.md](references/graph-modeling.md) |
| Cypher patterns | [references/cypher-patterns.md](references/cypher-patterns.md) |
| Module init | [references/module-initialization.md](references/module-initialization.md) |
| Transactions | [references/transaction-patterns.md](references/transaction-patterns.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |

## Quick example

**Input:** "Upsert Solution with tags in NestJS"

**Expected output:**

1. Issue or goal: Idempotent solution + tag relationships
2. Recommendation: MERGE on `id`; UNWIND tags; constraints on `Solution.id` and `Tag.name` in `Neo4jService.onModuleInit`
3. Code: `session.run` with `$id`, `$title`, `$tags`; `finally { session.close() }`
4. Residual risks: duplicate constraint creation if split across services

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] All Cypher uses `$parameters`
- [ ] Constraints only in centralized `Neo4jService.onModuleInit`
- [ ] Every `session.run()` has `session.close()` in `finally`
- [ ] `neo4j.int()` for SKIP/LIMIT and large integers
- [ ] `driver.close()` in `onModuleDestroy`
- [ ] No `RETURN *`; connectivity verified on startup
