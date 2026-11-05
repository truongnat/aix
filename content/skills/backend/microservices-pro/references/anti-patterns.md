# Anti-patterns — microservices

1. **Distributed monolith** — Many services, one shared DB, tight sync chains.
2. **Chatty fine-grained HTTP** — Death by latency; use batching or events.
3. **No timeouts / bulkheads** — Cascading failures across the graph.
4. **Dual writes without saga** — Inconsistent state between services.
5. **Breaking API without versioning** — Consumer outages; use contracts (`api-design-pro`).
6. **Ops before observability** — Cannot debug cross-service without tracing IDs.
7. **Premature mesh** — Complexity before simple gateway + standards work.

See [decision-tree.md](decision-tree.md) and [edge-cases.md](edge-cases.md).
