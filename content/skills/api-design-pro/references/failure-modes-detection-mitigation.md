# Failure modes — detection and mitigation (API design)

## Contents

1. [Ambiguous mutations](#ambiguous-mutations)
2. [Retry and duplicate side effects](#retry-and-duplicate-side-effects)
3. [Pagination and unstable sorts](#pagination-and-unstable-sorts)
4. [Webhook delivery](#webhook-delivery)

---

## Ambiguous mutations

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **PATCH meaning drift** | Clients interpret differently | JSON Merge vs JSON Patch explicit; **If-Match** — **`mutation-semantics-and-concurrency.md`** |

---

## Retry and duplicate side effects

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **POST retry duplicates** | Double charges | **Idempotency-Key** or natural keys — **`async-webhooks-and-jobs.md`** |

---

## Pagination and unstable sorts

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Cursor skips/duplicates** | Data moves under cursor | Stable sort + tie-breaker — **`query-filtering-and-projection.md`** |

---

## Webhook delivery

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **At-least-once storms** | Partner retries flood | Verify signature; dedup by event id — **`async-webhooks-and-jobs.md`** |
