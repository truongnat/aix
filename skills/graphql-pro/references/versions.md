# GraphQL — server stack versions

## Apollo Server / Mercurius / others

- Confirm **major** for plugin APIs, federation package names, and default behavior (e.g. landing pages, CSRF).
- **Subscriptions** — transport (WebSocket vs SSE) differs by library and deployment.

## Federation

- **Router/gateway** and **subgraph** versions must be compatible per vendor matrix.
- `@key`, `@requires`, `@external` — validate composition in CI.

## Client

- **codegen** target (TS operations) must match server schema; pin `graphql` package major if using overlapping tooling.
