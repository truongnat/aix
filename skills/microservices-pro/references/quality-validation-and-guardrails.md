# Quality validation and guardrails (anti-hallucination)

## Topology

- [ ] Do **not fabricate** cloud ARNs, VPC IDs, cluster names — use placeholders.
- [ ] **Mesh / Istio / Linkerd** specifics depend on versions — cite “verify against your mesh doc” — **`versions.md`**.

## Patterns

- [ ] **“Use Kafka”** — Name trade-offs; don’t prescribe vendor without user context.
- [ ] **Saga** — Describe compensation explicitly; **no** hand-waving two-phase without failure cases.

## SLO claims

- [ ] Avoid promising **five nines** without error budget math — **`deployment-pro`**.

## Security

- [ ] **Internal trust** — Treat service-to-service as **zero trust** unless proven — **`security-pro`**.
