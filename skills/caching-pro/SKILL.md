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

Follow **Suggested response format (STRICT)** — eight sections with explicit **flows** and **consistency class**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** consistency target, freshness SLA, **write rate**, hot-key risk, **layers** → verify: [requirements documented].
2. **State assumptions** about cache needs, data access patterns (**Think Before Coding**).
3. **Apply** minimum caching first; add layers only when justified (**Simplicity First**).
4. **Make surgical changes** — only modify caching code directly related to the request (**Surgical Changes**).
5. **Define success criteria** (hit ratio, latency targets, consistency verification); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format (STRICT)**; pair **`security-pro`** when user-specific data at edge.

### Operating principles

1. **Think Before Coding** — State assumptions: cache needs, data patterns, consistency requirements. Ask when uncertain.
2. **Simplicity First** — Start without caching; add only when profiling justifies.
3. **Surgical Changes** — Only touch caching code related to the request. Don't refactor unrelated data access.
4. **Goal-Driven Execution** — Define hit ratio, latency targets, consistency verification upfront.
5. **Do not cache by default** — Remove obvious query/API inefficiencies first — **`sql-data-access-pro`**.
6. **Design invalidation before storage** — Stale-data risk usually dominates miss cost.
7. **Prefer deterministic keys** — Namespacing, versioning — reduces collision and aids migration.
8. **Choose consistency intentionally** — Per read model; document **bounded staleness** — **`distributed-consistency-models.md`**.
9. **Protect origin systems** — Coalescing, jittered TTL, backpressure, circuit breakers — **`failure-modes-and-resilience.md`**.
10. **Instrument outcomes** — Hit ratio, latency, evictions, stale-serve rate, **invalidation job** health — **`performance-and-observability.md`**.
11. **Secure shared caches** — Tenant/auth scope in keys — **`cache-security-and-isolation.md`**.

### Cache layers and consistency (system model) (summary)

Layer stack, read/write paths, consistency class, degradation — **`cache-consistency-layer-system-model.md`**.

Details: [references/cache-consistency-layer-system-model.md](/skills/caching-pro/references/cache-consistency-layer-system-model.md)

### Failure modes — detection and mitigation (summary)

Symptom→check mapping; deep resilience in **`failure-modes-and-resilience.md`** — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](/skills/caching-pro/references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Cache vs origin fix, TTL vs active invalidation, edge vs origin — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](/skills/caching-pro/references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Measured hit rates; PII boundaries — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](/skills/caching-pro/references/quality-validation-and-guardrails.md)

### Cache architecture and data flows (summary)

Client → edge → app → L1/L2 → origin — **read**, **write**, **invalidate**, **warm** paths.

Details: [references/cache-architecture-and-data-flows.md](/skills/caching-pro/references/cache-architecture-and-data-flows.md)

### Distributed consistency models (summary)

Read-after-write, bounded staleness, eventual, session/monotonic hints — paired with **`invalidation-and-consistency.md`**.

Details: [references/distributed-consistency-models.md](/skills/caching-pro/references/distributed-consistency-models.md)

### Write path and coherence (summary)

Dual-write ordering, write-through cost, write-behind loss, txn boundaries — **`write-path-and-coherence.md`**.

Details: [references/write-path-and-coherence.md](/skills/caching-pro/references/write-path-and-coherence.md)

### Multi-layer cache (summary)

L1 / L2 / CDN — propagation, coherence, effective staleness — **`multi-layer-cache.md`**.

Details: [references/multi-layer-cache.md](/skills/caching-pro/references/multi-layer-cache.md)

### Failure modes and resilience (summary)

Outage, partition hints, eviction storm, circuit breaker, fallback — **`failure-modes-and-resilience.md`**.

Details: [references/failure-modes-and-resilience.md](/skills/caching-pro/references/failure-modes-and-resilience.md)

### Cost and capacity modeling (summary)

Memory, network, serialization, cache vs fixing origin — **`cost-and-capacity-modeling.md`**.

Details: [references/cost-and-capacity-modeling.md](/skills/caching-pro/references/cost-and-capacity-modeling.md)

### Cache security and isolation (summary)

Poisoning, key scope, auth-aware keys, tenant isolation — **`cache-security-and-isolation.md`**.

Details: [references/cache-security-and-isolation.md](/skills/caching-pro/references/cache-security-and-isolation.md)

### Cache lifecycle (summary)

Cold → warm → active → refresh → expire/evict → rebuild — **`cache-lifecycle.md`**.

Details: [references/cache-lifecycle.md](/skills/caching-pro/references/cache-lifecycle.md)

### Cache pattern selection (summary)

cache-aside, read-through, write-through/behind, HTTP/CDN fit — **`pattern-selection.md`**.

Details: [references/pattern-selection.md](/skills/caching-pro/references/pattern-selection.md)

### Invalidation and consistency (summary)

Authoritative source, TTL, jitter, fallback on cache outage — **`invalidation-and-consistency.md`**.

Details: [references/invalidation-and-consistency.md](/skills/caching-pro/references/invalidation-and-consistency.md)

### Performance and observability (summary)

Hit/miss, p95, hot keys, eviction rate — **`performance-and-observability.md`**.

Details: [references/performance-and-observability.md](/skills/caching-pro/references/performance-and-observability.md)

### Tips and tricks (summary)

Key format, jitter, warming, rollout — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](/skills/caching-pro/references/tips-and-tricks.md)

### Edge cases (summary)

Consistency, write-path, distributed, perf, security edge cases — expanded — **`edge-cases.md`**.

Details: [references/edge-cases.md](/skills/caching-pro/references/edge-cases.md)

### Decision trees (summary)

Workload, layers, consistency strictness, failure — **`decision-tree.md`**.

Details: [references/decision-tree.md](/skills/caching-pro/references/decision-tree.md)

### Anti-patterns (summary)

Cache before query fix, stampede, caching errors — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](/skills/caching-pro/references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`deployment-pro`**, **`network-infra-pro`**, **`nextjs-pro`**, **`postgresql-pro`**, **`security-pro`**, **`api-design-pro`**, **`performance-tuning-pro`**.

Details: [references/integration-map.md](/skills/caching-pro/references/integration-map.md)

### Versions (summary)

CDN features, Redis/Memcached majors — **`versions.md`**.

Details: [references/versions.md](/skills/caching-pro/references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Read/write ratio, latency budget, regions, hot-key risk, **consistency SLA** per surface.
2. **Problem / goal** — Stale reads, cost reduction, incident hardening, or new surface to cache.
3. **System design** — Layer stack and consistency class — **`cache-consistency-layer-system-model.md`**.
4. **Decision reasoning** — Pattern and invalidation strategy — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Keys, TTL, invalidation triggers — **Code** for config/header matrices.
6. **Trade-offs** — Freshness vs origin load; edge vs complexity.
7. **Failure modes** — Stampede, dual-write, tenant bleed — **`failure-modes-detection-mitigation.md`** / **`failure-modes-and-resilience.md`** themes.
8. **Residual risks** — Cost, security, rollout — **`cost-and-capacity-modeling.md`**, **`deployment-pro`** when needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Cache & consistency model** | [references/cache-consistency-layer-system-model.md](/skills/caching-pro/references/cache-consistency-layer-system-model.md) |
| Failure modes (quick map) | [references/failure-modes-detection-mitigation.md](/skills/caching-pro/references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](/skills/caching-pro/references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](/skills/caching-pro/references/quality-validation-and-guardrails.md) |
| Architecture & data flows | [references/cache-architecture-and-data-flows.md](/skills/caching-pro/references/cache-architecture-and-data-flows.md) |
| Distributed consistency models | [references/distributed-consistency-models.md](/skills/caching-pro/references/distributed-consistency-models.md) |
| Write path & coherence | [references/write-path-and-coherence.md](/skills/caching-pro/references/write-path-and-coherence.md) |
| Multi-layer cache | [references/multi-layer-cache.md](/skills/caching-pro/references/multi-layer-cache.md) |
| Failure modes & resilience | [references/failure-modes-and-resilience.md](/skills/caching-pro/references/failure-modes-and-resilience.md) |
| Cost & capacity | [references/cost-and-capacity-modeling.md](/skills/caching-pro/references/cost-and-capacity-modeling.md) |
| Security & isolation | [references/cache-security-and-isolation.md](/skills/caching-pro/references/cache-security-and-isolation.md) |
| Lifecycle | [references/cache-lifecycle.md](/skills/caching-pro/references/cache-lifecycle.md) |
| Pattern selection | [references/pattern-selection.md](/skills/caching-pro/references/pattern-selection.md) |
| Invalidation & consistency | [references/invalidation-and-consistency.md](/skills/caching-pro/references/invalidation-and-consistency.md) |
| Performance & observability | [references/performance-and-observability.md](/skills/caching-pro/references/performance-and-observability.md) |
| Tips | [references/tips-and-tricks.md](/skills/caching-pro/references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](/skills/caching-pro/references/edge-cases.md) |
| Decision trees | [references/decision-tree.md](/skills/caching-pro/references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](/skills/caching-pro/references/anti-patterns.md) |
| Integration map | [references/integration-map.md](/skills/caching-pro/references/integration-map.md) |
| Versions | [references/versions.md](/skills/caching-pro/references/versions.md) |

## Quick example

### 1 — Simple

**Input:** Product list API slow, DB spikes.  
**Expected output:** Cache-aside, keys + TTL + jitter, **write path** invalidates on admin update, stampede guard, metrics, **fallback** if Redis down — full **Suggested response format (STRICT)**.

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
