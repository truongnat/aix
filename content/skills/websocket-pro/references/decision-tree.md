# WebSocket — decision tree

## Raw WebSocket vs opinionated libraries

- **Need rooms, fallbacks, reconnect UX** → evaluate Socket.IO/engine.io (or stack-native gateway) — document semantics vs RFC 6455 alone.
- **Full control + minimal deps** → raw `ws` / platform WebSocket — you own heartbeat, framing, and backpressure.

## WebSocket vs SSE vs long poll

- **Server push one-way, HTTP-friendly** → SSE (simpler ops, reconnect built-in).
- **Bidirectional low latency** → WebSocket; plan proxies and auth.
- **Rare updates** → Long poll may suffice — avoid permanent sockets.

## Single node vs cluster

- **Single** → In-memory fan-out OK with connection caps.
- **Cluster** → Shared pub/sub (Redis, NATS) or sticky sessions + documented trade-offs.

## Delivery guarantees

- **At-most-once** default on network — document if business needs dedup keys.
- **Exactly-once** end-to-end → Usually needs idempotent handlers + durable outbox — pair with **`api-design-pro`**.

## Auth

- **Token in query** — often leaks via logs; prefer secure handshake or short-lived post-handshake upgrade pattern per stack.
