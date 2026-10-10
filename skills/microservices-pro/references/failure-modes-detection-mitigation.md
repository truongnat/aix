# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Distributed monolith** | Deploy coupled; shared DB | Joint releases | Redraw boundaries — **`anti-patterns.md`** |
| **Retry storm** | Blind retries | CPU/RPS spike | Jitter + circuit breaker — **`edge-cases.md`** |
| **Cascade timeout** | Pool exhaustion | Latency cascade | Bulkhead; shed load — **`tips-and-tricks.md`** |
| **Dual writes** | Two writers same row | Integrity bugs | Single writer + saga/outbox — **`anti-patterns.md`** |
| **Poison message** | Bad payload loops DLQ | Consumer stuck | DLQ + skip policy + alert |
| **Contract skew** | Producer faster than consumer | Deserialize errors | Schema registry; compat tests — **`versions.md`** |
| **Trust internal network** | Forged headers | Lateral movement | mTLS / signed tokens — **`security-pro`** |
| **Tracing gap** | Missing propagation | Mystery latency | Middleware standard — **`edge-cases.md`** |
| **Split brain partition** | CAP trade | Divergent writes | Leader election / quorum discipline |
| **Backpressure absent** | Unbounded queue RAM | OOM broker | Bounded channels; drop policy — **`edge-cases.md`** |
