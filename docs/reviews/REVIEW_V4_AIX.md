# Code Review — `aix` v4 (post-V3-remediation)

**Reviewed:** 2026-06-27
**Scope:** verify V3 fixes (kb-server auth, schema, KB correctness)
**Decision:** **APPROVE** (with minor notes) — no CRITICAL/HIGH remaining. kb-server auth is now real.

## Summary

The auth layer that blocked v3 is genuinely fixed and verified. API keys are now generated server-side (`kb_live_` + 32 random bytes), stored as **bcrypt hashes**, and validated via `bcrypt.compare` against an `ApiKey` node — the shape-only bypass is gone. The master password is **fail-closed** (returns false when `KB_MASTER_PASSWORD` is unset) and uses `timingSafeEqual`. `neo4j.int()` wraps LIMIT, `tags` round-trips as a real array, and the §7.2 graph model is explicitly documented as deferred to v2 (a recorded decision, which is what was asked). Build + lint remain 14/14.

## V3 fix verification

| Finding | Status | Evidence |
|---|---|---|
| V3-C1 API-key auth bypass | ✅ Fixed | `AuthService.validateKey` → format check + `MATCH (k:ApiKey)` + `bcrypt.compare`; `bcryptjs` dep added |
| V3-H1 default master password | ✅ Fixed | `validateMasterPassword` returns false if env unset; `timingSafeEqual` |
| V3-M1 `neo4j.int()` on LIMIT | ✅ Fixed | `{ query, k: neo4j.int(k) }` |
| V3-M2 graph schema | ✅ Documented | comment: "v1 scope: single flat Memory node … §7.2 deferred to v2" |
| V3-M3 tags array round-trip | ✅ Fixed | push `tags: [...rec.tags]`; read `Array.isArray ? … : split(',')` |
| Build + Lint | ✅ 14/14 | `pnpm lint`/`build` |

## Remaining notes (LOW — non-blocking)

- **V4-L1 — `validateKey` is O(n) bcrypt per request.** It fetches *all* `ApiKey` nodes and `bcrypt.compare`s each in a loop. Correct and safe for a handful of keys, but doesn't scale and is a mild DoS surface (each request = N bcrypt ops). When key count grows, add a lookup id (e.g. store a fast non-secret key-id prefix and `MATCH` on it, then bcrypt-compare the single candidate).
- **V4-L2 — `KEY_TOTAL_LENGTH` comment is misleading.** `randomBytes(32).toString('hex')` is 64 hex chars; the comment says "hex (32)". The constant value (72) is correct and matches generation, so behavior is fine — just fix the comment.
- **V4-L3 — carried from v3, not re-verified this round:** `ApiRuntimeProvider` default model id (V3-L1) and ensuring provider error bodies pass through `policy.redact` before any persistence (V3-L3). Confirm or close.

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | **Pass** (14/14) |
| Build (`turbo run build`) | **Pass** (14/14) |
| kb-server auth (bcrypt + fail-closed) | **Pass** (code-verified) |
| KB correctness (neo4j.int, tags array) | **Pass** |
| kb-server runtime smoke (`docker compose up` + authed push→search) | **Not run** — recommended before first deploy |

## Trajectory

- v1: skeleton; redaction unwired (CRITICAL); kb-server/migration absent.
- v2: redaction fixed; migration invalid; kb-server empty.
- v3: V2 fixed; kb-server built but auth a no-op (CRITICAL).
- **v4: auth real, KB correct, schema scope documented → ship-ready pending a live smoke test.**

## Recommended before declaring done

1. **Run the live smoke** the static reviews couldn't: `docker compose up` → generate a key → authed `push` → `search`/`get` returns it → forged `kb_live_<random>` is **rejected** (locks in V3-C1) → request without `KB_MASTER_PASSWORD` set is **rejected** (locks in V3-H1).
2. Close the three V4-L notes.
3. Then the v1→v4 remediation arc is complete; remaining work is feature scope (real LLM provider end-to-end, §7.2 graph model in v2), not defects.
