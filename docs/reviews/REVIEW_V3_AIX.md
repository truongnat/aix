# Code Review — `aix` v3 (post-V2-remediation + first kb-server review)

**Reviewed:** 2026-06-27
**Scope:** verify V2 fixes; **first review of net-new code** (`services/kb-server/`, `@x/providers` runtime)
**Decision:** **REQUEST CHANGES (BLOCK on merge of kb-server)** — 1 CRITICAL (auth bypass), 1 HIGH (default admin credential). All prior V2 findings confirmed fixed.

## Summary

Every V2 finding is genuinely resolved — verified, not taken on faith: lint+build **14/14**, kb-server now has 17 source files, **0/163 skills skipped** with `catalog.json` holding 163 entries, memory writes land in `.ai/memory/` (no doubling), and `ApiRuntimeProvider`/`createProvider` read `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` with a clean mock fallback. Good work.

**However**, the kb-server is being reviewed for the first time (it was empty in v1/v2), and its auth layer is **cosmetic** — it validates the *shape* of an API key but never actually authenticates. Anyone who sends `x-api-key: kb_live_<any 32 chars>` is admitted, and the admin guard defaults to a published password. The graph "KB" is also a single flat `Memory` node, not the schema in §7.2. The runtime provider is solid.

## V2 fix verification

| Finding | Claimed | Verified | Evidence |
|---|---|---|---|
| V2-H1 kb-server | Done | ✅ | 17 files; `app.module.ts`, `neo4j/`, `auth/`, `kb/`, `docker-compose.yml` present |
| V2-H2 migration | Done | ✅ | `aix skills list` → 0 SKIP; `catalog.json.length` = 163 |
| V2-M1 doubled path | Done | ✅ | 0 paths under `.ai/.ai/`; records in `.ai/memory/` |
| V2-M2 mock provider | Done | ✅ | `ApiRuntimeProvider` + `createProvider()` read env keys, mock fallback |
| V2-L1 eval surface | Done | ✅ (not re-tested deeply) | `loadSuite` + `eval list` dir scan reported |
| Build + Lint | 14/14 | ✅ | `pnpm lint`/`build` → 14 successful, 14 total |

## Findings (net-new code)

### CRITICAL

**V3-C1 — kb-server API-key auth is a no-op; trivially bypassable.**
`services/kb-server/src/auth/api-key.guard.ts` authorizes **any** request whose header merely *looks* like a key:
```ts
return typeof key === 'string' && key.startsWith('kb_live_') && key.length === 40;
```
There is **no database lookup and no bcrypt verification** — `kb_live_` + any 32 chars (e.g. `kb_live_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`) is accepted. The design §7.2 explicitly requires "`x-api-key` (`kb_live_<32hex>`, **bcrypt-hash**) → ApiKeyGuard". `MasterGuard` has the same shape-only bypass for admin routes. Effect: every KB endpoint (`push`/`search`/`get`/`list`) is effectively unauthenticated to anyone who knows the trivial format. Since this is a network-exposed service holding memory/solution data, this is a **must-fix before the server is run anywhere reachable**.
- Fix: generate keys server-side (`kb_live_<32hex>`), store a **bcrypt hash**, and have the guard look up + `bcrypt.compare`. No bcrypt dependency or key store exists yet — this layer must be built, not patched.

### HIGH

**V3-H1 — Admin master password defaults to a published constant; fails open.**
`master.guard.ts`: `const MASTER_PASSWORD = process.env.KB_MASTER_PASSWORD ?? 'aix-master-change-me';`. If the env var is unset, the admin password is a value committed to the repo — full admin access with a known credential. Also `pwd === MASTER_PASSWORD` is a non-constant-time compare (minor timing leak).
- Fix: **fail closed** — if `KB_MASTER_PASSWORD` is unset, refuse to start (throw in `onModuleInit`/bootstrap) rather than fall back to a default. Use `crypto.timingSafeEqual`.

### MEDIUM

**V3-M1 — `LIMIT $k` not wrapped in `neo4j.int()` (§7.2 violation; runtime risk).**
`kb.service.ts search()` passes `k: Number(k)`. Neo4j requires integer types for SKIP/LIMIT; a JS number can trigger *"It is not allowed to pass a floating point number in the LIMIT clause"* at runtime. §7.2 explicitly mandates `neo4j.int()` for SKIP/LIMIT. Wrap: `{ query, k: neo4j.int(k) }`.

**V3-M2 — Graph schema is a single flat `Memory` node, not the §7.2 model.**
`ensureSchema()` creates only `CREATE CONSTRAINT … FOR (m:Memory) REQUIRE m.id IS UNIQUE`. The design's Graph KB (§7.2) calls for nodes `Solution, Skill, SkillVersion, Tag, Project, Technology, AITool` and relationships `TAGGED_WITH, BELONGS_TO, USES, RELATED_TO (auto-link by tag), HAS_VERSION, COMPATIBLE_WITH`. As built it's a flat key-value store with substring search — it satisfies `MemoryStore` CRUD but delivers none of the "graph" value (related-by-tag, versioning, skill links). Acceptable as a v1 KB *if descoped on purpose*; otherwise it's a design gap. Decide and document.

**V3-M3 — `tags` round-trips as a string, not an array (data-integrity / type lie).**
`push()` stores `tags: rec.tags.join(',')` (a string), but `Neo4jRecord.tags` is `readonly string[]` and `search`/`get`/`list` return `r.get('m').properties as unknown as Neo4jRecord` — so `tags` comes back as `"a,b"` (string) while the type claims `string[]`. The `as unknown as` cast hides the mismatch from the compiler. Either store a native array (`SET m.tags = $tags` with the array) or split on read. Client-side `@x/memory` consumers iterating `tags` will misbehave.

### LOW

- **V3-L1** — `ApiRuntimeProvider` default model `claude-sonnet-4-20250514` is stale; prefer a current id (e.g. `claude-sonnet-4-6`) or require it via env. USD pricing constants are hardcoded magic numbers.
- **V3-L2** — `Neo4jService` falls back to `NEO4J_PASSWORD ?? 'password'`; fine for local dev, but pair with the fail-closed posture of V3-H1 for any non-local deploy.
- **V3-L3** — Provider thrown errors include `await res.text()` (raw upstream body) — ensure these aren't persisted to KB/transcript without going through `policy.redact`.

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | **Pass** (14/14) |
| Build (`turbo run build`) | **Pass** (14/14) |
| `aix skills list` / catalog | **Pass** (0 skip, 163 entries) |
| Memory path / redaction | **Pass** (`.ai/memory/`, `••••`) |
| kb-server auth | **Fail** (V3-C1 bypass, V3-H1 default cred) |
| kb-server runtime smoke (`docker compose up` + push→search) | **Not run this round** |

## Trajectory

- v1: skeleton, redaction unwired (CRITICAL), kb-server/migration absent.
- v2: redaction fixed; migration produced invalid skills; kb-server still empty.
- **v3: all V2 items fixed; new kb-server code works functionally but its auth is unsafe.**

The pattern to watch: each round, newly-written code arrives unreviewed. Recommend wiring `aix skills validate` into CI (would have caught V2-H2) and adding at least a smoke test for kb-server auth (would catch V3-C1).

## Fix order (v3 → v4)

1. **V3-C1** — real API-key auth: server-side key-gen, bcrypt store, `bcrypt.compare` in the guard. Do not run kb-server on any reachable interface until done.
2. **V3-H1** — fail closed on missing `KB_MASTER_PASSWORD`; `timingSafeEqual`.
3. **V3-M1** — `neo4j.int()` for LIMIT.
4. **V3-M3** — fix `tags` array round-trip.
5. **V3-M2** — decide: build the §7.2 graph model, or document the flat KB as intentional v1 scope.
