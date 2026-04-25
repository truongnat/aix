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