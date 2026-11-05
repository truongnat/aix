# Failure modes — detection and mitigation (caching)

Operational catalogs and resilience patterns are in **[failure-modes-and-resilience.md](failure-modes-and-resilience.md)**. This file maps **symptoms → checks** quickly.

## Contents

1. [Stale reads](#stale-reads)
2. [Stampede / hot key](#stampede--hot-key)
3. [Dual-write incoherence](#dual-write-incoherence)
4. [Poisoned or cross-tenant entries](#poisoned-or-cross-tenant-entries)

---

## Stale reads

| Symptom | Check | Mitigation |
|---------|-------|------------|
| User sees old data post-deploy | TTL, purge, key version | **`invalidation-and-consistency.md`** |

---

## Stampede / hot key

| Symptom | Check | Mitigation |
|---------|-------|------------|
| Origin spike on expiry | Metrics for miss storm | Coalescing, jitter — **`failure-modes-and-resilience.md`** |

---

## Dual-write incoherence

| Symptom | Check | Mitigation |
|---------|-------|------------|
| DB and cache disagree | Ordering of writes | **`write-path-and-coherence.md`** |

---

## Poisoned or cross-tenant entries

| Symptom | Check | Mitigation |
|---------|-------|------------|
| Wrong user’s data | Key namespace missing tenant | **`cache-security-and-isolation.md`** |
