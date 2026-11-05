# Decision framework and trade-offs (WebSocket)

## Contents

1. [WebSocket vs SSE vs long poll](#websocket-vs-sse-vs-long-poll)
2. [Sticky sessions vs shared bus](#sticky-sessions-vs-shared-bus)
3. [Binary vs text payloads](#binary-vs-text-payloads)
4. [Library vs raw RFC](#library-vs-raw-rfc)

See **`decision-tree.md`** for transport choice and cluster patterns.

---

## WebSocket vs SSE vs long poll

| WebSocket | SSE | Long poll |
|-----------|-----|-----------|
| Bidirectional, lowest latency for push+command | One-way server push, simpler HTTP | Rare updates, minimal infra |

**Trade-off:** operational complexity vs simplicity — **`decision-tree.md`**.

---

## Sticky sessions vs shared bus

| Sticky + local fan-out | Redis/NATS pub/sub |
|------------------------|-------------------|
| Simpler initially | Survives node churn; more moving parts |

**Trade-off:** session affinity fragility vs infra cost — **`integration-map.md`**.

---

## Binary vs text payloads

Text (JSON) is debuggable; binary saves bandwidth — document **schema/version** for either — **`tips-and-tricks.md`**.

---

## Library vs raw RFC

Libraries (Socket.IO, ws, etc.) add **features and semantics** — do not mix RFC details with library defaults without labeling — **`versions.md`**.
