# Decision tree — performance tuning

## Measure first

```
Have baseline (p50/p95, throughput, errors)?
├── No → add metrics/traces before changing code
└── Yes → profile hottest segment only
```

## CPU-bound vs waiting (off-CPU)

```
Profiler shows mostly on-CPU vs blocked on I/O / locks?
├── On-CPU heavy → algorithm, allocations, serialization — **`algorithm-pro`**, profiles
└── Waiting heavy → queries, network, pools, contention — **`postgresql-pro`**, **`caching-pro`**, infra limits
```

## Frontend vs backend vs data

```
Slow in browser (LCP, INP)?
└── Network, JS bundle, rendering — combine with **`react-pro`** / **`nextjs-pro`**

Slow API?
├── Single query dominates? → **`postgresql-pro`**
├── Many sequential calls? → batching, parallel, caching (`caching-pro`)
└── CPU-bound pure code? → algorithm (`algorithm-pro`)
```

## Cache or not?

```
Stale data acceptable for N seconds?
├── Yes → cache with explicit TTL + invalidation story
└── No → optimize path or scale read replicas; do not “cache away” consistency needs
```
