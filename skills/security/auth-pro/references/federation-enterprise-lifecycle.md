# Federation and enterprise authentication lifecycle

OIDC/SAML patterns beyond “use SSO” — **mapping**, **provisioning**, **outage**, **rotation**. Vendor consoles stay out of scope; architecture and failure modes belong here.

## Protocol selection (reminder)

- **OIDC** — modern SaaS default; **SAML** — legacy enterprise; plan **metadata** and **clock** discipline.

## Claim and group mapping

- Map **`sub` + iss** as stable user key; **email** alone is dangerous for linking.
- **Groups / roles from IdP** — transform to internal permissions explicitly; avoid **stale entitlement** when IdP groups change — periodic sync or event-driven **`authorization-architecture-review.md`**.

## Provisioning

- **JIT** — first login creates user; define uniqueness and race handling.
- **SCIM** — **deprovision lag** vs session validity — users may retain API tokens until revoked.

## Flows

- **SP-initiated vs IdP-initiated** — CSRF and deep-link handling differ; document expected behavior.

## Operational resilience

- **IdP outage** — fail closed for new login vs allow cached sessions — business decision; document **`edge-cases.md`**.
- **JWKS / signing key rotation** — cache TTL vs availability — **`versions.md`**.

## Review checklist

- [ ] **Account linking** rules prevent takeover via IdP email collision.
- [ ] **Group mapping** changes propagate to authz layer within defined SLA or event.
- [ ] **Logout** semantics include federated session where product promises Global Logout.
