# Authorization models and policy

For **audit matrices**, impersonation, tenant enforcement, and caching pitfalls, see **`authorization-architecture-review.md`**.

Authentication proves **who**; authorization decides **what** they may do — **server-side truth**.

## Models

- **RBAC** — Role → permissions; simple audits; watch **role explosion** and coarse roles.
- **ABAC** — Decisions from **attributes** (tenant, region, clearance, time); flexible; needs disciplined policy testing.
- **ReBAC** — **Relationships** (document shared with user, org hierarchy); fits collaboration; often pairs with graph-style checks — scale and caching matter.

## Enforcement surfaces

- **API gateway / service** — Central deny/allow, JWT validation, coarse scopes.
- **Application layer** — Resource ownership, workflow state, business rules.
- **Data layer** — **RLS**, row grants — last line of defense when app bugs slip — **`postgresql-pro`**.

## OAuth scopes vs application permissions

- **OAuth scopes** — Delegation from user to client (what the **token** may represent at APIs).
- **Application RBAC/ABAC** — What the **user** may do inside your product; reconcile explicitly (scope may gate **which APIs** exist; policy gates **which rows/actions**).

## Multi-tenant SaaS

- Carry **tenant** in signed context (token claim or internal session) and enforce in **every** authz path — UI hiding is insufficient.
- **Cross-tenant admin** (“support impersonation”) needs **super-audit**, time bounds, and break-glass rules — **`security-pro`**.

## Policy hygiene

1. **Deny by default** — explicit grants only.
2. **Separate admin** from user-facing permissions.
3. **Log authz denies** with stable reason codes (no PII in logs beyond ids).
4. Version permission changes when customers rely on stable behavior.

## Admin and impersonation

- **Never** trust `role` strings from access tokens alone for destructive actions — verify against **policy store** or **DB** at request time.
- Impersonation sessions should be **short**, **audited**, and **visible** to the customer where regulations require.
