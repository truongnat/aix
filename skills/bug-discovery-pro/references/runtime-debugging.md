# Runtime debugging

Most **production** defects surface in **telemetry**, not in static graphs alone.

## Logs

- **Structured logs** — JSON fields, **correlation/request id** — search by `trace_id`, `user_id`, `route`.
- **Level hygiene** — Error without context → add **dimensions** before guessing code paths.

## Traces (distributed)

- **Spans** — Latency cliffs, missing children, retries inside a trace.
- **Broken traces** — Lost **context propagation** → false “fast” child services — **`observability-integration.md`**.

## Metrics

- **RED/USE** style — Errors and latency vs deploys, queues, saturation.
- **Correlation** — Spike aligns with **flag**, **shard**, **version**?

## Profiling

- **CPU** — Hot paths, accidental O(n²), busy loops (infinite retry).
- **Memory** — Heap growth, GC pressure; **allocation** profiling for leaks.

## Dumps (when justified)

- **Heap dump** — Dominant retained objects (leak after hours).
- **Thread dump** — Deadlock, blocked pool, lock order.

## Limits

This skill **names** runtime strategies; **capturing** dumps may need SRE/on-call — pair **`deployment-pro`**, **`network-infra-pro`** for platform specifics.
