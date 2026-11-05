# Latency, throughput, and resources — system model

## Contents

1. [End-to-end path](#end-to-end-path)
2. [Queues and saturation](#queues-and-saturation)
3. [Utilization and tail latency](#utilization-and-tail-latency)
4. [Layers to attribute time](#layers-to-attribute-time)
5. [Feedback loops](#feedback-loops)

---

## End-to-end path

User-perceived latency is the **sum** (often non-linear) of segments:

**Client** → **DNS/TLS/network** → **Edge (CDN/WAF)** → **App tier** → **Dependency services** → **Data stores** → back.

Optimization must **attribute time** per segment (RUM, traces, logs, profilers). A fast app with a slow query still loses — **`tips-and-tricks.md`**.

---

## Queues and saturation

Under load, systems behave as **networks of queues**:

- Rising **utilization** on a component increases **queueing delay** — tail latency grows before CPU hits 100%.
- **Backpressure** (limits, timeouts, shedding) protects upstream; lack of it causes **retry storms** and cascading failure — **`failure-modes-detection-mitigation.md`**.

Conceptual link: heavier load often hurts **p99** more than **p50** — watch both — **`anti-patterns.md`**.

---

## Utilization and tail latency

High average CPU with low p50 can still mean bad p99 if **locks**, **GC**, or **bursts** dominate. Separate:

- **Service time** (work per request)
- **Wait time** (queue, I/O blocking, locks)

Profiling must distinguish **on-CPU** vs **off-CPU wait** — otherwise you optimize the wrong layer.

---

## Layers to attribute time

| Layer | Typical signals | Often paired skill |
|-------|-----------------|--------------------|
| Browser | LCP, INP, long tasks | **`react-pro`**, **`nextjs-pro`** |
| API / app | CPU samples, spans, event loop lag | **`nestjs-pro`**, framework skills |
| Data | Query time, locks, buffer pool | **`postgresql-pro`** |
| Cache | Hit rate, stampede, TTL | **`caching-pro`** |
| Infra | CPU/mem quotas, cold start | **`docker-pro`**, **`deployment-pro`**, **`network-infra-pro`** |

---

## Feedback loops

Performance work is iterative:

**Baseline → change → measure → compare** — one variable at a time when possible.

Regressions return to **same scenario and dataset shape** — **`quality-validation-and-guardrails.md`**.
