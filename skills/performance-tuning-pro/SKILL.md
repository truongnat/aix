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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** versions, deployment shape, load pattern, and success metric (percentiles + errors). → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.