# Quality validation and guardrails (WebSocket)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [Infra-dependent claims](#infra-dependent-claims)
3. [Security pairing](#security-pairing)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Do not invent **ingress timeout** values or **max connections** — they are deployment-specific — **`deployment-pro`**.
- Cite **RFC 6455** / library docs for protocol behavior — **`versions.md`**.

---

## Infra-dependent claims

State assumptions: **TLS termination**, **HTTP/2 vs WS upgrade path**, **Kubernetes ingress** vendor — **`integration-map.md`**.

---

## Security pairing

AuthZ, rate limits, and abuse cases belong with **`security-pro`** — this skill owns **connection semantics** only — **`integration-map.md`**.

---

## Review checklist

- [ ] Transport choice justified (WS vs SSE) — **`decision-tree.md`**.
- [ ] Reconnect, heartbeat, close codes addressed — **`edge-cases.md`**.
- [ ] Cluster strategy documented — **`failure-modes-detection-mitigation.md`**.
- [ ] No fabricated limits; cross-check deployment skill when needed.
