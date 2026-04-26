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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** runtime, gateway/proxy behavior, load balancer policy, connection scale target, and reliability guarantees. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

- Start with the **connection lifecycle** and delivery guarantees before discussing libraries.
- Be explicit about **proxy/load balancer behavior**, because many production failures come from the network edge.
- Prefer the **simplest transport** that satisfies the product need; do not force WebSocket where SSE is enough.
- Treat **heartbeat, reconnect, duplicate handling, and backpressure** as core design concerns.
- Keep transport concerns separate from application command semantics and authorization depth.

## Suggested response format

Use this structure for WebSocket work:

1. **Context** — runtime, scale, topology, latency/reliability requirements.
2. **Connection model** — handshake, auth, heartbeat, reconnect, message flow.
3. **Primary risks** — idle timeout, reconnect storms, duplicate delivery, auth leakage, fan-out bottlenecks.
4. **Recommended changes** — transport, protocol, or infra adjustments in priority order.
5. **Verification plan** — what to test under disconnects, retries, proxies, and load.
6. **Residual risks** — remaining assumptions or behaviors still not proven.

## Resources in this skill

- `references/websocket-connection-and-message-system-model.md` — connection and message lifecycle model.
- `references/decision-framework-and-trade-offs.md` — WebSocket vs SSE/long-poll and scaling choices.
- `references/failure-modes-detection-mitigation.md` — common production failure modes and mitigations.
- `references/edge-cases.md` — timeout, reconnection, and deployment edge conditions.
- `references/quality-validation-and-guardrails.md` — validation and correctness guardrails.

## Quick example

User asks: "Our clients reconnect in a loop every few minutes behind the CDN."

Response shape:
- Inspect heartbeat cadence, proxy idle timeout, and reconnect policy separately.
- Determine whether the problem is edge timeout, auth refresh, or client retry behavior.
- Recommend the smallest transport and infra changes first.
- Validate with controlled disconnect tests and production telemetry.

## Checklist before calling the skill done

- Topology, scale, and network-edge assumptions are explicit.
- The answer distinguishes transport issues from app-level semantics.
- Retry, duplicate, and backpressure behavior are covered when relevant.
- Verification includes adverse network or proxy scenarios.
- Remaining assumptions are stated.
