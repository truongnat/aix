---
name: api-design-pro
description: |
  Professional API design guidance: contract-first REST/RPC/event interfaces, resource and action modeling, mutation semantics and concurrency (PUT/PATCH/DELETE, upsert, soft delete, bulk), workflow and state-transition APIs, query/filter/search/projection, async jobs and webhooks, consistency and conflicts, versioning, pagination, error models, idempotency, backward compatibility, observability and governance, and production edge cases.

  Use this skill when designing new APIs, reviewing API changes, improving contract consistency, or planning backward-compatible evolution.

  Triggers: "api design", "rest api", "endpoint", "contract", "versioning", "pagination", "error model", "idempotency", "backward compatibility", "schema evolution", "openapi", "swagger", "429", "400 vs 500", "webhook", "HATEOAS", "rate limit", "resource modeling", "nested resource", "bulk api", "ETag", "If-Match", "workflow api", "state transition", "cursor pagination", "async job", "202 accepted", "webhook signing", "projection", "sparse fieldset", "include expand".

  Combine with `security-pro` for threat-focused hardening and `testing-pro` for contract and integration verification.

metadata:
  short-description: API design — contracts, resources, mutations, workflows, async, consistency, versioning, edge cases
  content-language: en
  domain: api-design
  level: professional
---

# API design (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use official [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [OpenAPI Specification](https://spec.openapis.org/oas/latest.html), and [JSON Schema](https://json-schema.org/specification) for standards truth; this skill encodes **contract-first design**, **resource and action modeling**, **evolution safety**, and **operationally practical API conventions**. Confirm **API style** (REST/RPC/event), **client ecosystem**, and **compatibility constraints** from the project.

## Boundary

**`api-design-pro`** owns **contract shape**, **resource/action model**, **mutation and query semantics**, **versioning**, **pagination**, **error/idempotency/retry story**, **workflow-oriented endpoints**, **async and webhook patterns** at the design level, and **integration maps** to other skills. It does **not** replace **`nestjs-pro`** / **`nextjs-pro`** for framework wiring, **`graphql-pro`** for GraphQL-only schema work, or **`security-pro`** for full threat modeling — pair as needed.

## Related skills (this repo)

| Skill | When to combine |
|-------|------------------|
| `security-pro` | Validate auth, data exposure, abuse paths, and sensitive endpoint hardening. |
| `testing-pro` | Add contract, integration, and regression tests for API behavior over time. |
| `graphql-pro` | GraphQL schema, resolvers, and errors vs HTTP mapping. |
| `deployment-pro` | Rollouts, mixed versions during deploy — client behavior. |

## When to use

- Designing new public/internal APIs with clear request/response contracts.
- Reviewing breaking-change risk in endpoint/schema updates.
- Modeling **resources vs actions**, **state machines**, **bulk/long-running** operations.
- Standardizing pagination, filtering, sorting, error handling, and idempotency behavior.
- Planning API versioning and deprecation strategy without disrupting clients.

## When not to use

- **Framework-specific** routing, middleware, DI — stack skills first, then align HTTP semantics here.
- **Pure product requirements** with no API surface yet — clarify domain before contract detail.

## Required inputs (when reviewing or designing)

- API **style** and **consumers** (mobile, third parties, internal services).
- **Compatibility window** (how long old clients must work).
- **Consistency** expectations (read-your-writes, search index lag) if non-default.

## Expected output

Follow **Suggested response format** — from context through residual risks, including at least one **concrete spec or payload** example when inventing or changing a contract.

## Workflow

1. **Confirm** versions / environment / stack (API style, transport, auth model, client expectations, compatibility window).
2. **Apply** the principles and topic summaries below; open `references/` when you need depth.
3. **Respond** using **Suggested response format**; note main risks (breaking changes, ambiguous contracts, insecure defaults, inconsistent errors, consistency model gaps).

### Operating principles

1. **Contract clarity first** — every field and status code should have explicit meaning and stable behavior.
2. **Model domain before verbs** — resources, aggregates, and explicit actions (**cancel**, **capture**) where CRUD obscures transitions.
3. **Backward compatibility by default** — additive evolution preferred; breaking change must be intentional and managed.
4. **Consistency over endpoint-by-endpoint style** — shared patterns for naming, errors, pagination, and filtering.
5. **Idempotency where retry is expected** — safe retry semantics for network and client failures; scope **Idempotency-Key** correctly.
6. **Observability-ready APIs** — traceability and actionable errors without leaking sensitive internals — **`observability-and-api-governance.md`**.

### Resource modeling and action design (summary)

Aggregates, nesting, canonical URLs, public vs internal ids, bulk and long-running operations.

Details: [references/resource-modeling-and-actions.md](references/resource-modeling-and-actions.md)

### Mutation semantics and concurrency control (summary)

POST/PUT/PATCH/DELETE semantics, upsert, soft delete, bulk, **ETag** / **If-Match**, replay and idempotency scope.

Details: [references/mutation-semantics-and-concurrency.md](references/mutation-semantics-and-concurrency.md)

### Workflow and state-transition APIs (summary)

State machines, transition guards, action endpoints vs blind PATCH, auditability.

Details: [references/workflow-and-state-transitions.md](references/workflow-and-state-transitions.md)

### Query, filtering, and projection design (summary)

Allow-listed filters/sorts, search endpoints, stable pagination tie-breakers, projection and expand cost bounds.

Details: [references/query-filtering-and-projection.md](references/query-filtering-and-projection.md)

### Async APIs, webhooks, and job patterns (summary)

**202 Accepted**, operation resources, webhook signing, retries, deduplication, ordering guarantees.

Details: [references/async-webhooks-and-jobs.md](references/async-webhooks-and-jobs.md)

### Consistency and conflict handling (summary)

Read-after-write, stale reads, **409**/**412**, eventual consistency documentation, event ordering.

Details: [references/consistency-and-conflicts.md](references/consistency-and-conflicts.md)

### Observability and API governance (summary)

**requestId** / trace propagation, error code taxonomy, audit metadata, deprecation monitoring.

Details: [references/observability-and-api-governance.md](references/observability-and-api-governance.md)

### API design tips and tricks (summary)

Model resources and actions using clear nouns/verbs; standardize error envelope; cursor pagination for large mutable sets; explicit **null** vs omitted.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### API edge cases (summary)

Retries, patch ambiguity, time zones, compatibility drift, pagination, security — plus mutation, query, async, and exposure edges.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision tree (summary)

REST vs RPC vs events; pagination model; versioning; error envelope; resource vs action; sync vs async — see reference.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Wrong status codes, ambiguous null semantics, missing idempotency on mutating POST.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

Pair with **`security-pro`**, **`testing-pro`**, **`graphql-pro`**, stack skills for implementation.

Details: [references/integration-map.md](references/integration-map.md)

### Versioning (summary)

URL vs header versioning; deprecation headers; OpenAPI per major version.

Details: [references/versions.md](references/versions.md)

## Suggested response format (implement / review)

1. **Context and client constraints** — consumers, compatibility window, auth/sensitivity, consistency expectations.
2. **Resource and action model** — aggregates, identifiers, canonical paths, domain actions vs CRUD (**workflow** reference when relevant).
3. **Proposed contract** — endpoints, verbs, schemas, status codes at a glance.
4. **Evolution and compatibility plan** — additive vs breaking; versioning/deprecation; migration notes.
5. **Error, retry, and idempotency semantics** — envelope, codes, **429**, **Idempotency-Key**, concurrency (**ETag** / conflicts).
6. **Spec / payload examples** — OpenAPI fragments, JSON request/response/error examples (**label as Code** when showing snippets).
7. **Residual risks** — rollout, monitoring, ambiguous PATCH, replica lag, webhook delivery, governance gaps.

## Resources in this skill

| Topic | File |
|-------|------|
| Resource modeling and actions | [references/resource-modeling-and-actions.md](references/resource-modeling-and-actions.md) |
| Mutation semantics and concurrency | [references/mutation-semantics-and-concurrency.md](references/mutation-semantics-and-concurrency.md) |
| Workflow and state transitions | [references/workflow-and-state-transitions.md](references/workflow-and-state-transitions.md) |
| Query, filtering, projection | [references/query-filtering-and-projection.md](references/query-filtering-and-projection.md) |
| Async, webhooks, jobs | [references/async-webhooks-and-jobs.md](references/async-webhooks-and-jobs.md) |
| Consistency and conflicts | [references/consistency-and-conflicts.md](references/consistency-and-conflicts.md) |
| Observability and governance | [references/observability-and-api-governance.md](references/observability-and-api-governance.md) |
| Practical patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versioning | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Design v2 order API with backward compatibility and consistent error model."  
**Expected output:** Full **Suggested response format**: resource model, contract, evolution, idempotency for payments, spec examples, risks.

**Input:** "Clients retry POST /payments on timeout — we see duplicate charges."  
**Expected output:** **Idempotency-Key** pattern or natural keys; document 409 vs 200 semantics; webhook reconciliation — pair **`security-pro`** for abuse.

**Input:** "Should cancel be PATCH status or POST /cancel?"  
**Expected output:** **Workflow** guidance: explicit **cancel** action, guards, **409** on illegal transition; avoid silent PATCH foot-guns.

## Checklist before calling the skill done

### Core contract

- [ ] Contract semantics (fields, status codes, error model) are explicit.
- [ ] **Resource vs action** modeling addressed for non-CRUD domains; **canonical URL** policy clear.
- [ ] Backward compatibility impact is assessed and documented.
- [ ] At least one **idempotency/retry** and one **schema-evolution** edge case addressed.
- [ ] **Mutation semantics** (PUT vs PATCH vs DELETE, soft delete if applicable) stated for changing resources.
- [ ] **Spec / payload** section includes concrete snippets or migration checklist.
- [ ] Residual risks include rollout/monitoring and client migration concerns.

### Lists and queries

- [ ] Pagination and filtering semantics are stated if list/search endpoints exist; **stable sort / cursor tie-breaker** if cursor used.
- [ ] **429** / abuse stance for public or expensive queries.

### Safety and ops

- [ ] PII and sensitive fields called out for logging and error payloads.
- [ ] If **async/webhooks**: signing, retries, deduplication expectations mentioned.
- [ ] If **concurrent edits**: **ETag** / version policy or explicit **lost-update** acceptance.
- [ ] **Consistency** model (read-after-write, search lag) mentioned when non-obvious.
- [ ] **Trace/correlation** (**requestId**, **traceparent**) noted for production APIs.
