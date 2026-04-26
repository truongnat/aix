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

### Operating principles

1. **Think Before Coding** — Confirm the symptom, environment, load profile, and success metric before tuning. Ask before optimizing when the real bottleneck is still unknown.
2. **Simplicity First** — Start with measurement and the smallest intervention that targets the proven bottleneck. Do not optimize every layer speculatively.
3. **Surgical Changes** — Touch only the code path, query, cache, pool, or infra limit directly implicated by evidence. Avoid broad “performance cleanup” rewrites.
4. **Goal-Driven Execution** — Done = baseline, change, and post-change measurements are explicit and comparable.
5. **Bottlenecks move** — Fixes should be based on the current limiting factor, not assumptions from a different scale or environment.
6. **Tail latency is a first-class metric** — Averages can hide the failure mode you actually care about.
7. **Workload realism matters** — Synthetic tests that omit concurrency, payload size, or cache state can mislead more than they help.
8. **Optimization has trade-offs** — Latency, throughput, cost, and correctness often move together; say which one you are choosing.

## Default recommendations by scenario

- **Slow endpoint** — Measure query, CPU, network, and cache path before changing implementation.
- **Memory growth** — Separate leak, cache growth, and workload shift before tuning allocators or limits.
- **Frontend lag** — Check render path and user-centric metrics before adding generic memoization.
- **Infra saturation** — Confirm quota/limit effects before rewriting app code.

## Decision trees

Summary: choose the next performance action based on where evidence points: compute, IO, cache, queueing, rendering, or capacity limits.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: tuning without a baseline, chasing averages, coordinated omission, and fixing the wrong layer because it is easier to touch.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Latency and resources system model (summary)

How queues, saturation, on/off-CPU time, and end-to-end latency chains interact so bottlenecks are reasoned about structurally.

Details: [references/latency-and-resources-system-model.md](references/latency-and-resources-system-model.md)

### Failure modes and mitigation (summary)

Wrong-bottleneck diagnosis, retry storms, cache stampedes, cold starts, and measurement traps that can invalidate a tuning effort.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

How to choose between caching, batching, scaling, query fixes, and code-path optimization without hiding cost or correctness trade-offs.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Versions (summary)

Version notes that affect runtime profiling, framework hooks, and benchmark comparability.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Symptom, environment, load profile, scale, and target metric.
2. **Performance model** — Explain where the bottleneck likely sits in the latency/resource chain.
3. **Recommendation** — Minimum evidence-backed tuning change with rationale.
4. **Verification** — Baseline and post-change checks that prove the improvement.
5. **Residual risks** — Remaining measurement, scale, or trade-off caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Latency and resources system model | [references/latency-and-resources-system-model.md](references/latency-and-resources-system-model.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Our p99 API latency regressed after the last deploy."
- Start with baseline comparison and locate the bottleneck before changing code.
- Keep the first fix scoped to the proven slow path.
- **Verify:** Post-change p99 and error rate improve under the same load shape.

**Input (tricky):** "CPU is lower after optimization, but users still feel the app is slow."
- Recheck whether the target metric was user-visible latency rather than raw CPU.
- Avoid declaring success from the wrong metric.
- **Verify:** The user-facing percentile or interaction metric improves, not just internal counters.

**Input (cross-skill):** "A dashboard is slow because of caching and query behavior."
- Pair **`postgresql-pro`** and **`caching-pro`** for lower-layer truth while **`performance-tuning-pro`** owns cross-layer prioritization.
- Fix the highest-leverage bottleneck first instead of editing every layer.
- **Verify:** The combined measurement path shows which layer actually improved the outcome.

## Checklist before calling the skill done

- [ ] Symptom, environment, load shape, and target metric confirmed first (Think Before Coding)
- [ ] Minimum evidence-backed tuning change chosen; no speculative optimization sprawl (Simplicity First)
- [ ] Only the proven bottleneck path was changed (Surgical Changes)
- [ ] Success criteria and before/after measurements are explicit (Goal-Driven Execution)
- [ ] Tail-latency and workload realism are considered where relevant
- [ ] Bottleneck diagnosis is supported by evidence
- [ ] Trade-offs among latency, throughput, cost, and correctness are acknowledged
- [ ] Residual measurement or scaling risks are documented
