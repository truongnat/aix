# WebSocket — anti-patterns

## No heartbeat

- Silent half-open connections; LB timeouts surprise you.
- **Fix:** App ping/pong + server idle timeout aligned with infra.

## Unbounded per-connection queues

- Slow client takes down server RAM.
- **Fix:** Drop policy, backpressure, max queue, disconnect abusive peers.

## Assuming message order across reconnect

- Network and client logic can reorder.
- **Fix:** Sequence numbers + idempotent handlers or CRDT-style merge.

## Auth only at upgrade

- Stolen socket sends forever.
- **Fix:** Periodic revalidation or short-lived channel tokens.

## Same binary message type for everything

- Hard to evolve and monitor.
- **Fix:** Typed envelope with version field.

## Thundering herd on reconnect

- All clients reconnect at once after outage.
- **Fix:** Jittered exponential backoff; server-side admission control.
