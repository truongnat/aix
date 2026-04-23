# API design — decision tree

## REST vs RPC vs events

- **Resource-oriented CRUD, cacheable reads** → REST-style + HTTP verbs + standard status codes.
- **Procedure-heavy, tight coupling to server actions** → RPC (gRPC, JSON-RPC) or GraphQL mutations — pair with **`graphql-pro`** if GraphQL.
- **Fan-out notifications, audit streams** → Events/webhooks; document idempotency and signing — **`async-webhooks-and-jobs.md`**.

## Resource shape

- **Stable aggregate + child collection** → Prefer shallow nesting; document canonical collection URL — **`resource-modeling-and-actions.md`**.
- **Same entity reachable by multiple paths** → Pick **one canonical** href; deprecate alternates.

## Modeling mutations

- **Full replacement at URI** → PUT; **partial update** → PATCH with documented merge/null rules — **`mutation-semantics-and-concurrency.md`**.
- **Domain transition (cancel, capture)** → Explicit **action** endpoint or `POST .../actions/{name}` — **`workflow-and-state-transitions.md`**.
- **Long-running work** → **202** + operation resource — **`async-webhooks-and-jobs.md`**.

## Pagination

- **Stable large lists, frequent updates** → Cursor-based; document sort key + **tie-breaker** stability — **`query-filtering-and-projection.md`**.
- **Simple admin UIs, small datasets** → Offset/limit acceptable; warn on deep pages.

## Query surface

- **Rich filtering** → Allow-listed fields/operators; cap complexity — **`query-filtering-and-projection.md`**.
- **Mobile / bandwidth** → Projection (`fields=`) or sparse responses.

## Consistency expectations

- **Clients need read-your-writes** → Document tokens, sticky routing, or polling — **`consistency-and-conflicts.md`**.
- **Search/index lags writes** → Document eventual visibility separately from primary GET.

## Versioning

- **Public many clients** → URL path or header version; deprecation timeline + telemetry.
- **Internal only** → Coordinated deploys; still document breaking fields.

## Error model

- **Machine clients** → Stable `code` + optional `details`; include `requestId`; govern taxonomy — **`observability-and-api-governance.md`**.
- **Human-only** → Still avoid leaking stack traces; log server-side.
