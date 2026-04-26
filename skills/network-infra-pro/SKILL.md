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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** environment, zones, SLO, change blast radius. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm provider, regions/zones, path shape, and compliance or egress constraints before proposing network changes. Ask when the actual traffic path is unclear.
2. **Simplicity First** — Prefer the smallest topology or policy change that solves the connectivity or reliability issue. Do not introduce mesh, multi-region, or extra tiers without pressure.
3. **Surgical Changes** — Touch only the relevant path, segment, DNS/TLS layer, or policy boundary. Avoid broad infra redesigns without explicit scope.
4. **Goal-Driven Execution** — Done = the traffic path, trust boundary, and verification checks are explicit and the blast radius is understood.
5. **Path truth first** — Hops, NAT, MTU, TLS, and DNS behavior should be mapped before theorizing about application bugs.
6. **Control plane and data plane differ** — A green management plane does not guarantee runtime traffic health.
7. **Least-privilege paths are structural** — Segmentation, egress rules, and exposure boundaries should reflect actual service trust needs.
8. **Network changes need rollback logic** — DNS, LB, and routing changes can fail partially and require safe reversal paths.

## Default recommendations by scenario

- **Connectivity issue** — Trace the path and narrow the failing hop before redesigning topology.
- **New service exposure** — Start with the narrowest ingress/egress and trust boundary needed.
- **Latency issue** — Check path length, TLS/DNS/LB behavior, and region placement before scaling app instances.
- **Topology review** — Clarify blast radius and segmentation goals before adding new network components.

## Decision trees

Summary: choose topology, policy, and traffic-management changes based on path shape, blast radius, and trust requirements.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: overcomplicated meshes, flat networks with accidental exposure, DNS as an afterthought, and debugging by policy guess instead of path evidence.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Network path and policy model (summary)

How hops, zones, policy layers, and control/data planes interact so infra changes stay explainable.

Details: [references/network-path-and-policy-model.md](references/network-path-and-policy-model.md)

### Topology and segmentation (summary)

How to structure private/public tiers, trust zones, and east-west boundaries with least-privilege intent.

Details: [references/topology-and-segmentation.md](references/topology-and-segmentation.md)

### Traffic management and edge (summary)

How DNS, TLS termination, LBs, ingress, and edge routing influence reliability and latency.

Details: [references/traffic-management-and-edge.md](references/traffic-management-and-edge.md)

### Reliability and observability (summary)

How flow logs, health checks, and path-level signals should validate network behavior before and after change.

Details: [references/reliability-and-observability.md](references/reliability-and-observability.md)

### Failure modes and mitigation (summary)

NAT/SNAT limits, MTU issues, asymmetry, cert expiry, and partial-region failures that often hide behind generic “network” symptoms.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version or provider notes that affect networking features, defaults, and safe assumptions.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Provider, regions/zones, traffic profile, compliance, and the path or change in scope.
2. **Network model** — Explain the relevant path, policy, or trust-boundary logic.
3. **Recommendation** — Minimum topology, routing, or policy change with rationale.
4. **Verification** — Path, log, health-check, or rollback checks that prove the network behavior.
5. **Residual risks** — Remaining blast-radius, provider, or observability caveats.

## Resources in this skill

| Topic | File |
|-------|------|
| Network path and policy model | [references/network-path-and-policy-model.md](references/network-path-and-policy-model.md) |
| Topology and segmentation | [references/topology-and-segmentation.md](references/topology-and-segmentation.md) |
| Traffic management and edge | [references/traffic-management-and-edge.md](references/traffic-management-and-edge.md) |
| Reliability and observability | [references/reliability-and-observability.md](references/reliability-and-observability.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Our private service cannot reach the database after a subnet change."
- Trace the actual path and policy boundary before changing app code or scaling.
- Fix the narrowest routing or security-group issue responsible.
- **Verify:** Connectivity succeeds and the path is validated with the intended controls.

**Input (tricky):** "Latency spikes happen only in one region behind the load balancer."
- Separate edge, DNS, LB, and backend path possibilities before calling it an app issue.
- Preserve rollback options for regional traffic changes.
- **Verify:** Regional path metrics and health checks isolate or resolve the problematic hop.

**Input (cross-skill):** "We need east-west mTLS for services in Kubernetes."
- Pair **`security-pro`** for trust policy and **`microservices-pro`** for service-boundary implications.
- Keep network transport and service contract concerns explicit.
- **Verify:** The path enforces the intended trust policy without breaking service reachability.

## Checklist before calling the skill done

- [ ] Provider, zones, path shape, and compliance constraints confirmed first (Think Before Coding)
- [ ] Minimum topology/policy change chosen; no unnecessary infra complexity added (Simplicity First)
- [ ] Only the relevant network path or boundary was changed (Surgical Changes)
- [ ] Success criteria and path-level verification are explicit (Goal-Driven Execution)
- [ ] Traffic path and blast radius are understood
- [ ] Trust boundaries and least-privilege path intent are stated
- [ ] Rollback or reversal path is considered for risky changes
- [ ] Residual provider or observability caveats are documented
