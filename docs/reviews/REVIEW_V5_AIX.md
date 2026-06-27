# Code Review — `aix` v5 (post-V4-remediation)

**Reviewed:** 2026-06-27
**Scope:** verify V4-L notes
**Decision:** **APPROVE** — no CRITICAL/HIGH/MEDIUM open. One LOW remains (non-blocking). The defect arc v1→v5 is closed.

## V4 note verification

| Note | Status | Evidence |
|---|---|---|
| V4-L2 key-length comment | ✅ Fixed | `const KEY_TOTAL_LENGTH = 8 + 64; // prefix (kb_live_) + hex (randomBytes(32))` |
| V4-L3 stale model id | ✅ Fixed | default `claude-sonnet-4-6`; OpenAI `gpt-4o` |
| V4-L3 provider error redaction | ✅ Fixed | both API error paths now `redact(await res.text())` before surfacing |
| Build + Lint | ✅ 14/14 | `pnpm lint`/`build` |

## Still open (LOW — non-blocking)

- **V4-L1 — `validateKey` still O(n) bcrypt per request.** Unchanged: `MATCH (k:ApiKey) RETURN k.hashedKey` + a `for` loop calling `bcrypt.compare` on every stored key. Functionally correct and safe at small key counts; only matters at scale (each request = N bcrypt ops = mild DoS surface). Defer with a tracked TODO, or add a non-secret key-id prefix to `MATCH` the single candidate, then compare once. Not a blocker.

## The one thing every round has deferred

No **live smoke test** has been run in any review — all five rounds are static/code verification. The behaviors most worth confirming can only be seen at runtime:

1. `docker compose up` (kb-server) → `/health` green.
2. Generate a key → authed `push` → `search`/`get` returns it.
3. Forged `kb_live_<random>` → **rejected** (locks in V3-C1 behaviorally).
4. Request with `KB_MASTER_PASSWORD` unset → **rejected** (locks in V3-H1).
5. `aix run --auto` with a real `ANTHROPIC_API_KEY` → end-to-end (closes the mock-provider gap).

## Recommendation: stop the paper-review loop

The remaining defect surface is one LOW perf note. Further static review rounds have diminishing returns — the marginal value now lives in **(a) the live smoke test** and **(b) feature scope** (real-LLM end-to-end, §7.2 graph model in v2), neither of which another read-through produces. Suggested close-out:

1. Run the 5-step smoke above; fix anything it surfaces.
2. Convert V4-L1 into a backlog TODO.
3. Fold `REVIEW_V1..V5_*.md` into `docs/reviews/` and treat the arc as complete.

If you want, I can run the live smoke (needs Docker + a test `ANTHROPIC_API_KEY`) rather than produce a v6 paper review.
