# Network infra — decision tree

## Exposure

- **Public API** → LB + WAF + TLS at edge; app private.
- **Internal only** → Private endpoints; no public SG rules.

## Egress

- **SaaS dependencies** → Explicit egress allowlist vs wide `0.0.0.0/0`.

## Mesh vs simple LB

- **Few services** → LB + SG may suffice.
- **Many east-west hops** → Consider mesh — cost/complexity trade-off.

## SaaS connectivity (hybrid)

```
Need private access to PaaS (DB, APIs) without public internet?
├── Private Link / Private Service Connect style endpoints — **`decision-framework-and-trade-offs.md`**
└── VPN only when link product unavailable or cost wins
```
