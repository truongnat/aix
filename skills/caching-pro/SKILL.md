---
name: caching-pro
description: |
  Professional distributed and multi-layer caching: patterns (cache-aside, read/write-through, write-behind), end-to-end data flows (read, write, invalidate, warm, refresh), formal consistency models (read-after-write, bounded staleness, eventual, session/monotonic hints), write-path ordering and dual-write risks, L1/L2/CDN architectures and cross-layer invalidation, failure modes (outage, partition, eviction storm, stale forever), stampede and resilience (circuit breaker, backoff), cost and capacity modeling, security (tenant isolation, poisoning, auth-aware keys), lifecycle (warm, expire, evict, rebuild), key/TTL design, observability, and operational rollout.

  Use when speeding reads, cutting DB/API load, designing Redis or in-memory tiers, troubleshooting stale data, reviewing cache safety, or aligning HTTP/CDN behavior with correctness.

  Use with nextjs-pro, postgresql-pro, sql-data-access-pro, deployment-pro, security-pro, api-design-pro as needed.

  Triggers: "caching", "cache strategy", "Redis", "TTL", "invalidation", "stale data", "cache miss", "cache-aside", "write-through", "write-behind", "dual write", "ETag", "CDN cache", "L1 L2", "distributed cache", "cache stampede", "thundering herd", "circuit breaker cache", "read-after-write", "eventual consistency cache", "hot key", "cache poisoning", "multi-layer cache", "Redis cluster".

metadata:
  short-description: Caching — architecture, flows, consistency, writes, layers, failures, cost, security
  content-language: en
  domain: caching
  level: professional
---

# Caching strategy (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [Redis docs](https://redis.io/docs/latest/) and [HTTP caching docs (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching) for protocol/API truth; this skill encodes **distributed caching system thinking**: **flows**, **consistency**, **write-path hazards**, **multi-layer coherence**, **failure degradation**, **cost**, and **security** — plus **invalidation-first** defaults and observability. Confirm **stack**, **traffic profile**, **read/write ratio**, **consistency SLA**, and **deployment topology** before prescribing implementation.

## Boundary

**`caching-pro`** owns **cache architecture**, **correctness boundaries** (staleness, isolation), **invalidation strategy**, **resilience** when cache or origin struggles, and **capacity/cost framing**. Paired skills own **framework cache APIs** (**`nextjs-pro`**), **SQL tuning** (**`postgresql-pro`**, **`sql-data-access-pro`**), **deployment mechanics** (**`deployment-pro`**), and **abuse/threat models** (**`security-pro`**).

## Related skills (this repo)

| Skill | When to combine with `caching-pro` |
|-------|------------------------------------|
| **`nextjs-pro`** | App Router, ISR, RSC, framework-level cache controls |
| **`postgresql-pro`** | Query shape, replicas, consistency vs read scaling |
| **`sql-data-access-pro`** | Fix data access before masking with cache |
| **`deployment-pro`** | Rollout, canary, purge, feature-flagged cache changes |
| **`network-infra-pro`** | Edge, LB, TLS, partition scenarios |
| **`security-pro`** | Auth-aware caching, poisoning, PII in cache |
| **`api-design-pro`** | HTTP caching semantics, evolution-safe headers |
| **`performance-tuning-pro`** | Profile-driven validation of wins |

## When to use

- Choosing patterns and **multi-layer** placement (process, Redis, CDN).
- Designing **read/write/invalidate** paths and **key/TTL** policy.
- Formalizing **consistency** per entity (prices vs static assets).
- **Write-path** review (ordering, dual write, write-behind risk).
- **Failure** and **degradation** design; **cost** justification.
- Investigating stale data, miss ratio, hot keys, eviction storms.

## When not to use

- **Only** CDN vendor button-click without **semantic** cache policy — still need **`caching-pro`** for headers and invalidation story, unless purely ops (**`deployment-pro`**).

## Required inputs

- **Consistency** requirement per surface (public catalog vs account balance).
- **Topology** (instances, regions, CDN yes/no).

## Expected output

Follow **Suggested response format** — workload through risks — with explicit **flows** and **consistency class**.

## Workflow

1. Confirm consistency target, freshness SLA, **write rate**, hot-key risk, and **layers** in use (L1/L2/edge).
2. Apply summaries; open `references/`; **invalidate-before-storage mindset** — **`pattern-selection.md`**, **`invalidation-and-consistency.md`**.
3. Respond using **Suggested response format**; pair **`security-pro`** when user-specific data at edge.

### Operating principles

1. **Do not cache by default** — Remove obvious query/API inefficiencies first — **`sql-data-access-pro`**.
2. **Design invalidation before storage** — Stale-data risk usually dominates miss cost.
3. **Prefer deterministic keys** — Namespacing, versioning — reduces collision and aids migration.
4. **Choose consistency intentionally** — Per read model; document **bounded staleness** — **`distributed-consistency-models.md`**.
5. **Protect origin systems** — Coalescing, jittered TTL, backpressure, circuit breakers — **`failure-modes-and-resilience.md`**.
6. **Instrument outcomes** — Hit ratio, latency, evictions, stale-serve rate, **invalidation job** health — **`performance-and-observability.md`**.
7. **Secure shared caches** — Tenant/auth scope in keys — **`cache-security-and-isolation.md`**.

### Cache architecture and data flows (summary)

Client → edge → app → L1/L2 → origin — **read**, **write**, **invalidate**, **warm** paths.

Details: [references/cache-architecture-and-data-flows.md](references/cache-architecture-and-data-flows.md)

### Distributed consistency models (summary)

Read-after-write, bounded staleness, eventual, session/monotonic hints — paired with **`invalidation-and-consistency.md`**.

Details: [references/distributed-consistency-models.md](references/distributed-consistency-models.md)

### Write path and coherence (summary)

Dual-write ordering, write-through cost, write-behind loss, txn boundaries — **`write-path-and-coherence.md`**.

Details: [references/write-path-and-coherence.md](references/write-path-and-coherence.md)

### Multi-layer cache (summary)

L1 / L2 / CDN — propagation, coherence, effective staleness — **`multi-layer-cache.md`**.

Details: [references/multi-layer-cache.md](references/multi-layer-cache.md)

### Failure modes and resilience (summary)

Outage, partition hints, eviction storm, circuit breaker, fallback — **`failure-modes-and-resilience.md`**.

Details: [references/failure-modes-and-resilience.md](references/failure-modes-and-resilience.md)

### Cost and capacity modeling (summary)

Memory, network, serialization, cache vs fixing origin — **`cost-and-capacity-modeling.md`**.

Details: [references/cost-and-capacity-modeling.md](references/cost-and-capacity-modeling.md)

### Cache security and isolation (summary)

Poisoning, key scope, auth-aware keys, tenant isolation — **`cache-security-and-isolation.md`**.

Details: [references/cache-security-and-isolation.md](references/cache-security-and-isolation.md)

### Cache lifecycle (summary)

Cold → warm → active → refresh → expire/evict → rebuild — **`cache-lifecycle.md`**.

Details: [references/cache-lifecycle.md](references/cache-lifecycle.md)

### Cache pattern selection (summary)

cache-aside, read-through, write-through/behind, HTTP/CDN fit — **`pattern-selection.md`**.

Details: [references/pattern-selection.md](references/pattern-selection.md)

### Invalidation and consistency (summary)

Authoritative source, TTL, jitter, fallback on cache outage — **`invalidation-and-consistency.md`**.

Details: [references/invalidation-and-consistency.md](references/invalidation-and-consistency.md)

### Performance and observability (summary)

Hit/miss, p95, hot keys, eviction rate — **`performance-and-observability.md`**.

Details: [references/performance-and-observability.md](references/performance-and-observability.md)

### Tips and tricks (summary)

Key format, jitter, warming, rollout — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Consistency, write-path, distributed, perf, security edge cases — expanded — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Workload, layers, consistency strictness, failure — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Cache before query fix, stampede, caching errors — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`deployment-pro`**, **`network-infra-pro`**, **`nextjs-pro`**, **`postgresql-pro`**, **`security-pro`**, **`api-design-pro`**, **`performance-tuning-pro`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

CDN features, Redis/Memcached majors — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (implement / review)

1. **Workload & constraints** — Read/write ratio, latency budget, regions, hot-key risk, **consistency SLA** per surface.
2. **Cache architecture** — Layers (L1/L2/edge), origin topology, single vs multi-region sketch.
3. **Read/write flows** — Hit/miss path, mutation → invalidation/update order — **`cache-architecture-and-data-flows.md`**, **`write-path-and-coherence.md`**.
4. **Key & TTL design** — Namespace, versioning, TTL + jitter, admission limits.
5. **Invalidation strategy** — Sync vs async triggers; fan-out (tags vs keys); **`multi-layer-cache.md`** if stacked.
6. **Consistency model** — Class per entity (**read-your-writes** vs **bounded stale**); replica/CDN caveats — **`distributed-consistency-models.md`**.
7. **Observability & metrics** — Hit ratio, staleness signals, eviction rate, invalidation job health — **`performance-and-observability.md`**.
8. **Risks & trade-offs** — Dual-write, outage fallback, cost, security (**`cache-security-and-isolation.md`**), rollout — **`failure-modes-and-resilience.md`**, **`cost-and-capacity-modeling.md`**.

*(Implementation snippets, config tables, or header matrices — present as **Code** when showing concrete artifacts.)*

## Resources in this skill

| Topic | File |
|-------|------|
| Architecture & data flows | [references/cache-architecture-and-data-flows.md](references/cache-architecture-and-data-flows.md) |
| Distributed consistency models | [references/distributed-consistency-models.md](references/distributed-consistency-models.md) |
| Write path & coherence | [references/write-path-and-coherence.md](references/write-path-and-coherence.md) |
| Multi-layer cache | [references/multi-layer-cache.md](references/multi-layer-cache.md) |
| Failure modes & resilience | [references/failure-modes-and-resilience.md](references/failure-modes-and-resilience.md) |
| Cost & capacity | [references/cost-and-capacity-modeling.md](references/cost-and-capacity-modeling.md) |
| Security & isolation | [references/cache-security-and-isolation.md](references/cache-security-and-isolation.md) |
| Lifecycle | [references/cache-lifecycle.md](references/cache-lifecycle.md) |
| Pattern selection | [references/pattern-selection.md](references/pattern-selection.md) |
| Invalidation & consistency | [references/invalidation-and-consistency.md](references/invalidation-and-consistency.md) |
| Performance & observability | [references/performance-and-observability.md](references/performance-and-observability.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick example

### 1 — Simple

**Input:** Product list API slow, DB spikes.  
**Expected output:** Cache-aside, keys + TTL + jitter, **write path** invalidates on admin update, stampede guard, metrics, **fallback** if Redis down — full **Suggested response format**.

### 2 — Tricky

**Input:** High hit ratio but stale prices minutes after update.  
**Expected output:** **Invalidate path** audit; failed job; shorten TTL for price keys; never cache **error** bodies — **`edge-cases.md`**.

### 3 — Cross-skill

**Input:** Next.js global HTML at CDN.  
**Expected output:** **`nextjs-pro`** semantics + **`caching-pro`** headers/purge + **`security-pro`** if personalized.

## Checklist before calling the skill done

### Strategy & correctness

- [ ] Pattern and **layers** fit workload and **consistency** SLA.
- [ ] **Read/write/invalidate** flows explicit; **write-order** hazards addressed for mutations.
- [ ] Key format, TTL, **invalidation triggers** documented; **private** vs **shared** cache boundaries for auth routes.

### Operations

- [ ] **Fallback** for cache outage; **origin protection** (breaker, concurrency cap) where needed.
- [ ] Observability: hit/miss, p95, **eviction**, optional **staleness** signal — **`performance-and-observability.md`**.
- [ ] Rollout/rollback for cache policy changes — **`deployment-pro`**.

### Economics & safety

- [ ] **Cost/capacity** sanity — **`cost-and-capacity-modeling.md`** when scaling tier.
- [ ] **Tenant/auth** isolation for shared Redis — **`cache-security-and-isolation.md`**.
- [ ] Query/index optimization considered before **only** caching away DB load.
