# Workload and machine-to-machine authentication

Service identity, short-lived credentials, and **audit by caller** — extends API key / mTLS decision trees.

## Concepts

- **Service identity** — principal is the workload, not a human; map to deployment, namespace, or team.
- **Secretless where possible** — workload identity from platform (cloud/K8s) reduces long-lived keys.

## Patterns

| Pattern | When |
|---------|------|
| **mTLS** | Mutual trust; cert **rotation** and **identity in SAN** must be automated |
| **Signed JWT / token exchange** | Audience (**`aud`**) per downstream; short TTL |
| **API keys** | Narrow scope; rotation; never shared across unrelated services |

## Controls

- **Audience scoping** — internal token for service A must not work at B.
- **Replay** — short TTL + idempotent APIs or **`jti`** where needed — **`security-pro`** threat model.
- **Certificate rollover** — overlap validity to avoid thundering herd failures.

## Audit

- Log **caller service id** on sensitive operations — not only end-user context.

## Review checklist

- [ ] No **shared god key** across environments or teams without break-glass process.
- [ ] **Rotation** cadence defined for certs and signing keys used for service tokens.
