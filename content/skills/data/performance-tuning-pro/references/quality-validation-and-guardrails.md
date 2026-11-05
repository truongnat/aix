# Quality validation and guardrails (performance tuning)

## Contents

1. [Reproducible measurement](#reproducible-measurement)
2. [Statistical honesty](#statistical-honesty)
3. [Anti-fabrication](#anti-fabrication)
4. [Production parity](#production-parity)
5. [Review checklist](#review-checklist)

---

## Reproducible measurement

- Fix **environment**: runtime version, build mode (no dev-only fast paths), CPU governor where relevant, representative dataset **shape** and size.
- Record **scenario**: concurrency, ramp-up, duration, warmup policy — repeat runs before trusting deltas.
- Store **baseline artifacts**: numbers + commit hash + config snapshot — **`repo-tooling-pro`** for automation.

---

## Statistical honesty

- Report **multiple percentiles** (p50/p95/p99) plus **errors/timeouts**, not only averages.
- Understand variance: a few runs may hide instability — prefer enough samples or longer runs for tail metrics.
- Watch **coordinated omission**: load generators that stall when server stalls distort latency — **`failure-modes-detection-mitigation.md`**.

---

## Anti-fabrication

- **Do not invent** benchmark figures, SLA improvements, or hardware specs not measured or supplied by the user.
- Label **hypotheses** (“expected ~20% if…”) separately from **measured** results.
- When recommending tools (e.g., `wrk`, `k6`), cite **what** to observe (latency distribution, saturation), not vendor-specific unattributed claims.

---

## Production parity

- Prefer measurements that match **traffic mix** (read/write ratio), **payload sizes**, and **auth** overhead when those dominate.
- Cold start / JIT warmup called out explicitly when measuring serverless or short-lived workers — **`edge-cases.md`**.

---

## Review checklist

- [ ] Baseline and target metric named (latency percentiles, throughput, error budget).
- [ ] Bottleneck attributed (CPU vs I/O vs lock vs GC vs network).
- [ ] Change justified by profiler/trace evidence or clear algorithmic reduction.
- [ ] Cache/consistency trade-off documented if caching introduced.
- [ ] Rollback path and dashboards named for rollout.
