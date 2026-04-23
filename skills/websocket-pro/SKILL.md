---
name: websocket-pro
description: |
  Production-grade WebSocket guidance: connection/message lifecycle and scaling model, failure modes (reconnect storms, proxy/LB idle drops, token leakage, duplicates), decision trade-offs (WebSocket vs SSE vs long poll, sticky vs pub/sub, binary vs text), quality guardrails (no fabricated timeout/connection limits; cite RFC/library and deployment assumptions).

  Use this skill when implementing or reviewing WebSocket architecture, message contracts, connection lifecycle, reconnection behavior, and realtime operational reliability.

  Triggers: "websocket", "realtime", "ws", "wss", "connection lifecycle", "heartbeat", "ping", "pong", "reconnect", "backpressure", "pubsub", "socket auth", "delivery guarantee", "edge case", "socket.io", "upgrade", "502", "proxy timeout".

  Combine with **`security-pro`** (authZ, abuse), **`performance-tuning-pro`** (throughput/latency), **`deployment-pro`** / **`network-infra-pro`** (ingress timeouts, TLS), **`api-design-pro`** (idempotency, dedup), **`stream-rtc-pro`** (signaling vs media).

metadata:
  short-description: WebSocket — lifecycle, scaling, failure modes, security pairing
  content-language: en
  domain: realtime-networking
  level: professional
---

# WebSocket (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455), [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket), and [WHATWG WebSockets](https://websockets.spec.whatwg.org/) for standards truth; this skill encodes **production reliability defaults**, **message-contract discipline**, and **operational failure modes**. Confirm **deployment topology** (single node vs cluster), **client behavior**, and **delivery/latency requirements** from the project.

## Boundary

**`websocket-pro`** owns **connection semantics**, **message contracts**, **reconnect/backpressure patterns**, and **transport vs SSE/long-poll** choice at the architecture level. **`deployment-pro`** / **`network-infra-pro`** own **ingress/LB/proxy** specifics; **`security-pro`** owns **threat/abuse** depth; **`api-design-pro`** owns **idempotent command** design for duplicate delivery.

## Related skills (this repo)

| Skill | When to combine |
|-------|------------------|
| **`security-pro`** | Channel auth, token/session handling, abuse controls, rate limits |
| **`performance-tuning-pro`** | Fan-out, throughput, latency under load |
| **`deployment-pro`** | Ingress idle timeouts, TLS termination, sticky sessions |
| **`network-infra-pro`** | L4/L7 timeouts, TCP vs app heartbeat |
| **`api-design-pro`** | Idempotent handlers, dedup keys for at-least-once |
| **`stream-rtc-pro`** | WebRTC signaling vs media path |

## When to use

- Designing realtime features with persistent client-server socket connections.
- Reviewing WebSocket reliability (heartbeat, reconnect, ordering, duplicate handling).
- Scaling pub/sub fan-out across instances and regions.
- Hardening WebSocket endpoints against abuse, leaks, and operational instability.

## When not to use

- **Primary topic is Kubernetes networking policy** — **`deployment-pro`** / **`network-infra-pro`** with this skill as a secondary reference for heartbeat alignment.
- **Full WebRTC media path** — **`stream-rtc-pro`**; use this skill for **signaling channel** patterns only.

## Required inputs

- **Scale target** (concurrent connections, fan-out pattern).
- **Proxy/LB** class if known (vendor shapes idle timeout behavior).

## Expected output

Follow **Suggested response format (STRICT)** — context through residual risks.

## Workflow

1. Confirm runtime, gateway/proxy behavior, load balancer policy, connection scale target, and reliability guarantees.
2. Apply summaries; open `references/` when you need depth.
3. Respond with **Suggested response format (STRICT)**; include **failure modes** (message loss/duplication, unauthorized access, reconnect storms, resource exhaustion).

### Operating principles

1. **Define message contracts early** — stable event names, payload schema, error semantics — **`tips-and-tricks.md`**.
2. **Treat network as unreliable** — reconnect, retry, idempotency, ordering strategy — **`failure-modes-detection-mitigation.md`**, **`decision-tree.md`**.
3. **Control lifecycle and resources** — heartbeat, timeout, cleanup, connection limits — **`websocket-connection-and-message-system-model.md`**.
4. **Scale with backpressure awareness** — protect server and downstream from burst fan-out — **`edge-cases.md`**.
5. **Secure every channel** — authenticate upgrade, authorize events, limit abuse — pair **`security-pro`** — **`integration-map.md`**.

### Connection and message lifecycle (summary)

Lifecycle, framing assumptions, backpressure, scaling mental model — **`websocket-connection-and-message-system-model.md`**.

Details: [references/websocket-connection-and-message-system-model.md](references/websocket-connection-and-message-system-model.md)

### Failure modes — detection and mitigation (summary)

Reconnect storms, proxy idle drops, token leakage, ordering/duplicates — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

WS vs SSE vs long poll; sticky vs shared bus; binary vs text; library vs raw — **`decision-framework-and-trade-offs.md`**, **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No fabricated ingress limits; infra assumptions explicit — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Tips and tricks (summary)

Envelope shape, heartbeat, backoff, command vs event — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Reconnect races, proxy idle drops, slow consumers, multi-instance consistency — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision tree (summary)

Raw WS vs libraries; WS vs SSE; cluster; delivery; auth — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Missing heartbeat, unbounded queues, auth only at upgrade, reconnect storm — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and infra (summary)

Library majors, proxy idle timeouts, upgrade path — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Topology (single vs cluster), client class, proxy/LB known behavior, scale target.
2. **Problem / goal** — Reliability, security review, scaling, or incident follow-up.
3. **System design** — Lifecycle, heartbeat/timeout alignment, fan-out pattern — **`websocket-connection-and-message-system-model.md`**.
4. **Decision reasoning** — WS vs SSE; sticky vs pub/sub; library choice — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Event contract, reconnect policy, backpressure caps — **`quality-validation-and-guardrails.md`** (no fabricated limits).
6. **Trade-offs** — Latency vs operational complexity; sticky fragility vs bus cost.
7. **Failure modes** — Storms, idle drops, dup delivery — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Monitoring gaps, hand off to **`deployment-pro`** / **`security-pro`** / **`api-design-pro`** as needed.

## Resources in this skill

| Topic | File |
|-------|------|
| **Connection & message model** | [references/websocket-connection-and-message-system-model.md](references/websocket-connection-and-message-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Practical patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions / infra | [references/versions.md](references/versions.md) |

## Quick example

**Input:** “Design websocket architecture for realtime notifications at 100k concurrent connections.”  
**Expected output:** Full **Suggested response format (STRICT)** — contract, lifecycle, scaling, security, backpressure, ops.

**Input:** “LB silently drops idle sockets — stale UI until refresh.”  
**Expected output:** Align app heartbeat with **`deployment-pro`** / **`network-infra-pro`** timeouts; document ping/pong; optional SSE read path — **`failure-modes-detection-mitigation.md`**.

**Input:** “WebRTC signaling — same as chat websocket?”  
**Expected output:** Separate concerns; **`stream-rtc-pro`** for ICE/session; typed events + rate limits on signaling — **`integration-map.md`**.

## Checklist before calling the skill done

- [ ] Message contract and lifecycle states explicit — **`tips-and-tricks.md`**.
- [ ] Reconnect/retry/ordering/idempotency documented — **`decision-tree.md`**, **`failure-modes-detection-mitigation.md`**.
- [ ] At least one scaling edge case and one security edge case addressed — **`edge-cases.md`** + **`security-pro`** pairing.
- [ ] Heartbeat interval aligned with load balancer / proxy assumptions — **`integration-map.md`**.
- [ ] Backpressure or max queue policy for slow consumers — **`websocket-connection-and-message-system-model.md`**.
- [ ] Multi-instance strategy (pub/sub vs sticky) explicit — **`decision-tree.md`**.
- [ ] **No fabricated** numeric limits; cite assumptions — **`quality-validation-and-guardrails.md`**.
