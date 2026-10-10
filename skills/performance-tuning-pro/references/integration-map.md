# Integration map — performance-tuning-pro

| Combined skill | Why | This skill owns | Other skill owns |
|----------------|-----|-----------------|------------------|
| **`postgresql-pro`** | Query latency | When to index, batch, paginate, paginate shapes | SQL, plans, migrations, RLS |
| **`caching-pro`** | Hit rate / stampede | Cache layer choice, TTL vs staleness narrative | Redis/CDN ops, eviction policy detail |
| **`network-infra-pro`** | Tail at edge | CDN/cache headers awareness, latency vs hops | VPC, firewall rules, capacity planning |
| **`algorithm-pro`** | Complexity | Picking lower-complexity structures after profiling | Formal proofs |
| **`testing-pro`** | Regressions | Perf budgets, regression scenarios | Test layout, fixtures |
| **`repo-tooling-pro`** | Repeatability | Scripted benchmarks / CI hooks | Pipeline wiring |
| **`nestjs-pro`** / **`nextjs-pro`** | Framework hot paths | Measurement placement, tracing hooks | Framework APIs, RSC/server split |
| **`websocket-pro`** / **`stream-rtc-pro`** | Real-time backpressure | Latency under sustained streams | Protocol semantics |
| **`docker-pro`** / **`deployment-pro`** | Runtime limits | CPU/mem impact on tail latency | Orchestration, rollout |

**Handoff:** When bottleneck is purely **business rules** or **requirements**, route to **`business-analysis-pro`** for trade-offs — **`performance-tuning-pro`** stays on measurable system behavior.
