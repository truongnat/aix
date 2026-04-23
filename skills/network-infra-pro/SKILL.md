---
name: network-infra-pro
description: |
  Professional network and infrastructure: VPC/VNet segmentation, DNS and TLS, ingress/egress, load balancing, reverse proxy, service mesh trade-offs, hybrid connectivity — plus path/policy model (hops, trust zones, control vs data plane), failure modes (DNS, MTU, asymmetry, NAT/SNAT, cert expiry, partial region, control-plane throttling), decision trade-offs (mesh vs LB, private link vs VPN), quality guardrails (no fake ARNs/CIDR; multi-cloud naming).

  Use this skill for cloud/on-prem topology, connectivity diagnosis, mTLS east-west, hardening service-to-service paths, and rollout safety for network changes.

  Use **with** **`deployment-pro`**, **`security-pro`**, **`caching-pro`**, **`nextjs-pro`**, **`nestjs-pro`**, **`microservices-pro`**, **`postgresql-pro`**, **`ci-cd-pro`**, **`docker-pro`**.

  Triggers: "network", "infra", "VPC", "subnet", "NAT", "load balancer", "reverse proxy", "ingress", "egress", "DNS", "TLS", "service mesh", "connectivity", "latency", "firewall", "security group", "NACL", "MTU", "asymmetric routing", "private link", "mTLS east-west", "flow logs".

metadata:
  short-description: Network infra — path model, topology, traffic, failure modes, policies
  content-language: en
  domain: network
  level: professional
---

# Network and infrastructure (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [AWS VPC](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html), [Kubernetes networking](https://kubernetes.io/docs/concepts/cluster-administration/networking/), and cloud DNS docs for platform truth; this skill encodes **least-privilege paths**, **reliable edge design**, and **debuggable** operations.

## Boundary

**`network-infra-pro`** owns **routing**, **segmentation**, **DNS/TLS/LB**, and **path-level reliability**. **`deployment-pro`** owns **promotion mechanics** beyond connectivity; **`security-pro`** owns **full threat models** and identity systems; **`caching-pro`** owns **CDN cache policy** depth when not transport-only.

## Related skills (this repo)

| Skill | When to combine |
|-------|----------------|
| **`deployment-pro`** | Canary/rollback for DNS/LB/mesh changes |
| **`security-pro`** | Zero trust, WAF posture, segmentation policy |
| **`nextjs-pro`** | Edge/CDN/cache interaction |
| **`nestjs-pro`** | Proxy timeouts, upstream pools |
| **`caching-pro`** | CDN vs origin headers |
| **`microservices-pro`** | East-west architecture |
| **`postgresql-pro`** | Database subnets, RDS SG |
| **`docker-pro`** | Dev networking mismatches |
| **`ci-cd-pro`** | Runner egress to registries |

## When to use

- VPC/subnet/NAT design; private vs public tiers.
- Ingress/egress, SG/NSG/firewalls, Private Link patterns.
- DNS/TLS termination, LB health checks, failover.
- MTU/asymmetry/timeouts; cross-region paths.
- Blast radius review for infra changes.

## When not to use

- **Application-only** bug with no path hypothesis — framework skills first.
- **Kubernetes workload YAML** exclusive — pair **`deployment-pro`** when rollout dominates.

## Required inputs

- **Cloud/provider**, **regions**, **traffic profile**, **compliance** (egress constraints).

## Expected output

Follow **Suggested response format** strictly.

## Workflow

1. Confirm environment, zones, SLO, change blast radius.
2. Apply summaries; open `references/`; avoid vendor-specific fake IDs — **`quality-validation-and-guardrails.md`**.
3. Respond with **Suggested response format**; **failure modes** for DNS/LB/TLS/SG changes.

### Operating principles

1. **Default deny** — Allowlist intentionally — **`network-path-and-policy-model.md`**.
2. **Private-by-default** — Minimal public surface — **`topology-and-segmentation.md`**.
3. **Separate failure domains** — Control vs data traffic — **`network-path-and-policy-model.md`**.
4. **Rollback-friendly changes** — DNS TTL, staged SG — **`deployment-pro`**.
5. **Observable paths** — Correlate DNS/LB/app — **`reliability-and-observability.md`**.
6. **Document contracts** — Src/dst/proto/owner — **`tips-and-tricks.md`**.

### Network path and policy model (summary)

Hops, trust zones, policy attachment — **`network-path-and-policy-model.md`**.

Details: [references/network-path-and-policy-model.md](references/network-path-and-policy-model.md)

### Failure modes — detection and mitigation (summary)

DNS, MTU, asymmetry, NAT, certs, partial outage, API throttle — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Mesh vs LB, egress models, hybrid connectivity — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Placeholders for IDs; multi-cloud naming — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Topology and segmentation (summary)

**`topology-and-segmentation.md`**.

Details: [references/topology-and-segmentation.md](references/topology-and-segmentation.md)

### Traffic management and edge (summary)

**`traffic-management-and-edge.md`**.

Details: [references/traffic-management-and-edge.md](references/traffic-management-and-edge.md)

### Reliability and observability (summary)

**`reliability-and-observability.md`**.

Details: [references/reliability-and-observability.md](references/reliability-and-observability.md)

### Tips and tricks (summary)

**`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

**`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

**`decision-tree.md`** · **`anti-patterns.md`**.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions (summary)

**`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Provider/region, scope (VPC vs single service path), constraints.
2. **Problem / goal** — Outage, latency, security exposure, design review.
3. **System design** — Trust zones and hops — **`network-path-and-policy-model.md`**.
4. **Decision reasoning** — Mesh vs LB; Private Link vs VPN; egress — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Policy matrix / checklist — placeholders only — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Complexity vs uniform policy; DNS TTL vs failover speed.
7. **Failure modes** — Path-specific risks — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Rollback; **`deployment-pro`**, **`security-pro`** when exposure or rollout dominates.

## Resources in this skill

| Topic | File |
|-------|------|
| **Path & policy model** | [references/network-path-and-policy-model.md](references/network-path-and-policy-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Topology and segmentation | [references/topology-and-segmentation.md](references/topology-and-segmentation.md) |
| Traffic management and edge | [references/traffic-management-and-edge.md](references/traffic-management-and-edge.md) |
| Reliability and observability | [references/reliability-and-observability.md](references/reliability-and-observability.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

### 1 — Simple (common)

**Input:** API in private subnets times out after NAT route change.  
**Expected output:** Full **Suggested response format** — route/NAT path, flow logs, staged rollback — **`failure-modes-detection-mitigation.md`**.

### 2 — Tricky (edge case)

**Input:** Open SG `0.0.0.0/0` on 22 for debug.  
**Expected output:** Reject standing rule; break-glass + revert — **`security-pro`** alternatives — **`anti-patterns.md`**.

### 3 — Cross-skill

**Input:** CDN in front of Next — stale API errors.  
**Expected output:** **`nextjs-pro`** / **`caching-pro`** cache keys — **this skill** DNS/TLS/origin path — coordinated **Cache-Control** — **`integration-map.md`**.

## Checklist before calling the skill done

### Design

- [ ] Trust boundaries explicit — **`network-path-and-policy-model.md`**.
- [ ] Path documented (DNS → LB → app) — **`traffic-management-and-edge.md`**.

### Safety

- [ ] Rollback/failover before execution — **`deployment-pro`**.
- [ ] Least privilege SG/NSG — **`anti-patterns.md`**.
- [ ] **Failure modes** named for the change class — **`failure-modes-detection-mitigation.md`**.

### Ops

- [ ] Observability/alerts on path — **`reliability-and-observability.md`**.
- [ ] **MTU/asymmetry** when VPN/hybrid — **`edge-cases.md`**.
- [ ] Traffic contract documented for handoff — **`tips-and-tricks.md`**.
