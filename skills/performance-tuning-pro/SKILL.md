---
name: performance-tuning-pro
description: |
  Production-grade performance tuning: diagnose bottlenecks and tail latency across browser, API, data, and infra — plus system model (end-to-end latency chain, queues, saturation, on-CPU vs off-CPU), failure modes (wrong bottleneck, coordinated omission, cache stampede, retry storms, premature micro-optimization), decision trade-offs (latency vs throughput vs cost, consistency vs cache, scale-out vs fix-in-place), and quality guardrails (reproducible baselines, percentile honesty, no fabricated benchmarks).

  Use this skill when improving latency or throughput, reducing CPU/memory, investigating slow paths, profiling hotspots, tuning caches and pools, or reviewing performance-sensitive PRs.

  Combine with **`postgresql-pro`** for queries and indexes, **`caching-pro`** for CDN and cache layers, **`testing-pro`** for regression budgets, **`repo-tooling-pro`** for scripted benchmarks, **`deployment-pro`** / **`docker-pro`** for quotas and scaling, **`network-infra-pro`** for edge latency, **`algorithm-pro`** for complexity, and framework skills (**`nestjs-pro`**, **`nextjs-pro`**, **`react-pro`**) for stack-specific hooks.

  Triggers: "performance", "optimize", "bottleneck", "latency", "p99", "p95", "throughput", "cpu", "memory", "heap", "GC pause", "profiling", "flamegraph", "slow query", "N+1", "cache", "cold start", "tail latency", "saturation", "load test", "edge case", "INP", "LCP", "backpressure".

metadata:
  short-description: Performance — latency model, profiling, bottlenecks, failure modes, guardrails
  content-language: en
  domain: performance-engineering
  level: professional
---

# Performance tuning (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [MDN Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API), [Node.js diagnostics](https://nodejs.org/docs/latest/api/), and [web.dev performance](https://web.dev/explore/fast) for API facts; this skill encodes **measure-first optimization**, **queueing/tail-latency reasoning**, and **safeguards against benchmark traps** — not vendor-specific tuning recipes. Confirm **runtime** (browser/Node/container), **traffic profile**, **dataset scale**, and **targets** (SLO or informal percentiles).

## Boundary

**`performance-tuning-pro`** owns **diagnosis framing**, **optimization prioritization**, **trade-off articulation**, and **measurement hygiene**. **`postgresql-pro`** owns **SQL and database design**. **`caching-pro`** owns **distributed cache/CDN mechanics**. **`deployment-pro`** owns **release and capacity policy**. **`algorithm-pro`** owns **algorithm selection** once profiling proves compute-bound hotspots.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`postgresql-pro`** | Query plans, indexes, pagination, lock contention |
| **`caching-pro`** | TTL, eviction, CDN, stampede mitigation |
| **`testing-pro`** | Perf budgets, regression tests |
| **`repo-tooling-pro`** | Benchmark scripts, CI diagnostics |
| **`deployment-pro`** / **`docker-pro`** | CPU/mem limits, scaling, cold start |
| **`network-infra-pro`** | Edge latency, TLS, CDN behavior |
| **`algorithm-pro`** | Complexity and data-structure choices |
| **`nestjs-pro`** / **`nextjs-pro`** / **`react-pro`** | Framework-specific rendering and API paths |
| **`websocket-pro`** / **`stream-rtc-pro`** | Streaming backpressure |

## When to use

- Fixing slow endpoints, screens, jobs, cold starts, memory growth, or unstable p95/p99.
- Reviewing PRs that touch caching, batching, concurrency, pooling, or complexity.
- Choosing whether to optimize code, queries, network, rendering, or capacity first.
- Establishing baselines, budgets, and repeatable measurement scenarios.

## When not to use

- **Pure capacity planning or cloud billing** without app measurement — **`deployment-pro`** may lead.
- **Database schema migrations** as primary topic — **`postgresql-pro`**.
- **Threat modeling or security audit** — **`security-pro`** (pair when perf touches auth/caching).

## Required inputs

- **Symptom** (which metric regressed: p99, throughput, CPU, errors).
- **Environment class** when known (browser/mobile, Node version, container limits).
- **Rough scale** (RPS, row counts, payload sizes) if diagnosing tail latency.

## Expected output

Follow **Suggested response format** strictly — system model through residual risks.

## Workflow

1. Confirm versions, deployment shape, load pattern, and success metric (percentiles + errors).
2. Apply summaries below; open `references/` for depth; use **`latency-and-resources-system-model.md`** when explaining queues and tails.
3. Respond with **Suggested response format**; cite **failure modes** for load tests and caches.

### Operating principles

1. **Measure before changing** — Baseline p50/p95/p99, throughput, error rate, resource use — **`tips-and-tricks.md`**.
2. **Optimize the true bottleneck** — Profile and trace; split CPU vs wait — **`decision-tree.md`**.
3. **Prefer structural wins** — Fewer round trips, better indexes, less over-fetch before micro-tweaks — **`decision-framework-and-trade-offs.md`**.
4. **Trade-offs explicit** — Cost in complexity, consistency, or ops for every optimization.
5. **Guard regressions** — Repeatable scenarios and stable datasets — **`quality-validation-and-guardrails.md`**.
6. **Caches and auth** — Never “performance-cache” away authorization — **`anti-patterns.md`**.

### Latency and resources — system model (summary)

End-to-end path, queues, saturation, on-CPU vs off-CPU — **`latency-and-resources-system-model.md`**.

Details: [references/latency-and-resources-system-model.md](references/latency-and-resources-system-model.md)

### Performance tuning tips and tricks (summary)

Baselines, profilers, batching, frontend and backend leverage — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Performance edge cases (summary)

Warmup, toy data, GC, contention, coordinated omission — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision framework (summary)

Latency vs throughput, cache vs consistency, scale-out vs fix — **`decision-framework-and-trade-offs.md`** + **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Anti-patterns (summary)

Optimize without profile, unbounded cache, single metric — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`postgresql-pro`**, **`caching-pro`**, **`testing-pro`**, **`repo-tooling-pro`**, stack skills — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and environment (summary)

Re-baseline after runtime upgrades; env drift — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Stack, runtime, environment (browser/Node/container), traffic or dataset scale, target metric.
2. **Problem / goal** — Current vs target (p95/p99, throughput, CPU, memory); errors/timeouts included.
3. **System design** — Where time is spent (layered path, queueing, on-CPU vs wait) — **`latency-and-resources-system-model.md`**.
4. **Decision reasoning** — Structural vs micro; cache vs optimize path; scale-out vs code — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Concrete changes, queries, flags, benchmark commands — **`quality-validation-and-guardrails.md`** (measured or clearly labeled hypotheses).
6. **Trade-offs** — Consistency, memory, complexity, ops cost.
7. **Failure modes** — Benchmark bias, stampede, retry storms, coordinated omission — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Rollback, dashboards, hand off to **`postgresql-pro`** / **`caching-pro`** / **`deployment-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Latency / resources model** | [references/latency-and-resources-system-model.md](references/latency-and-resources-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Practical tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision trees | [references/decision-tree.md](references/decision-tree.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions / environment | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** API p95 regressed after a release; need the fastest safe path.  
**Expected output:** Full **Suggested response format** — attribution (trace/profiler), ordered fixes, cache invalidation notes, monitoring — **`tips-and-tricks.md`**.

### 2 — Tricky (edge case)

**Input:** CPU low but p99 spikes; GC logs show long pauses.  
**Expected output:** Allocation hotspots, heap vs churn; avoid blind thread expansion — **`edge-cases.md`**, **`failure-modes-detection-mitigation.md`**.

### 3 — Cross-skill

**Input:** Slow list endpoint loads 10k rows via ORM.  
**Expected output:** **`performance-tuning-pro`** pagination and N+1 — **`postgresql-pro`** index/plan — **`nestjs-pro`** DTO shape if applicable.

## Checklist before calling the skill done

### Measurement

- [ ] Baseline includes **percentiles and errors**, not only averages — **`quality-validation-and-guardrails.md`**.
- [ ] Bottleneck attributed (CPU, I/O, lock, GC, network) — **`latency-and-resources-system-model.md`**.

### Recommendations

- [ ] Changes ordered by **impact vs cost** — **`decision-framework-and-trade-offs.md`**.
- [ ] Cache or TTL choices include **staleness / invalidation** rationale — **`failure-modes-detection-mitigation.md`**.
- [ ] No fabricated benchmark numbers — **`quality-validation-and-guardrails.md`**.

### Safety

- [ ] At least one **edge-case** risk (warmup, scale, GC, coordinated omission) considered — **`edge-cases.md`**.
- [ ] Rollback + **what to monitor** after rollout stated.
- [ ] **Profiling evidence** before micro-optimizations — **`anti-patterns.md`**.

### Cross-skill

- [ ] **`integration-map.md`** used to route DB, cache, or infra ownership when dominant.
