# Authorization architecture — review matrix

Extends **`authorization-models-and-policy.md`** with structures used in real audits. OWASP Authorization / Broken Access Control risk requires **explicit** subject–resource–action modeling.

## Core model

- **Subject** — user, service principal, impersonation actor.
- **Action** — verb (read, delete, impersonate).
- **Resource** — API object type and instance id.
- **Context** — tenant, region, ownership, time, ABAC attributes.

## Enforcement layers (all may apply)

| Layer | Typical checks |
|-------|----------------|
| **Edge / gateway** | AuthN, coarse scopes, rate limits |
| **Service** | Business rules, ownership, workflow state |
| **Data** | **RLS**, row predicates — **`postgresql-pro`** |

## Depth of control

- **Object-level** — can user access this row?
- **Field-level** — mask or strip fields (PII) — often app layer.
- **Admin boundary** — tenant admin vs **global** admin; separate roles and audit.

## Sensitive patterns

- **Impersonation / support access** — time-bounded, visible to customer where required, fully audited.
- **Break-glass** — emergency access; dual control; retroactive review.
- **Temporary elevation** — JIT admin; expiry; notification.
- **Policy versioning** — permissions change; old tokens vs new policy — define behavior.

## Caching and denials

- **Authz decision cache** — tenant and version in key; TTL; invalidation on role change.
- **Deny reasons** — stable codes for logs and UX (avoid leaking existence of resources in public APIs).

## Auditability

- Log **decision outcome** with **rule id** or role path; no PII beyond ids; correlate with **`auth-observability-and-detection.md`**.

## Review checklist

- [ ] Every sensitive route has **one authoritative** enforcement point (not duplicated inconsistent rules).
- [ ] **Tenant** always in evaluation path for multi-tenant data.
- [ ] **Role downgrade** forces re-check or session invalidation for elevated operations.
