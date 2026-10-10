# Distributed services system model

## Mental map

```text
Bounded context (ownership)
    → Service API (sync) OR Message topic (async)
        → Dependency services / brokers
            → Shared-nothing data per owner (ideal)
```

**Network hop** adds latency variance and failure modes — minimize **critical path** depth — **`tips-and-tricks.md`**.

## Ownership planes

| Plane | Question |
|-------|-----------|
| **Compute** | Who deploys which service artifact? |
| **Data** | Single writer store per aggregate (ideal) — **`edge-cases.md`** |
| **Contract** | Who publishes schema/OpenAPI/async schema? — **`api-design-pro`** |

## Interaction classes

| Class | Fits when |
|-------|-----------|
| **Synchronous RPC/HTTP/gRPC** | Need answer now; bound with **timeouts** — **`decision-tree.md`** |
| **Events / messages** | Notify, integrate; pair **idempotency** — **`tips-and-tricks.md`** |

## Operational spine

- **Tracing** correlation ID end-to-end; **metrics** RED/USE per service — **`failure-modes-detection-mitigation.md`** blind spots.
