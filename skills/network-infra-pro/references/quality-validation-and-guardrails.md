# Quality validation and guardrails (anti-hallucination)

## Identity and numbers

- [ ] Do **not** invent **VPC IDs, subnet IDs, ARNs, static IPs** — use placeholders (`vpc-xxx`, `10.0.0.0/16`).
- [ ] **CIDR math** — Verify overlaps when suggesting new subnets; say “recalculate for your allocation” if unknown.

## Platform honesty

- [ ] **AWS vs Azure vs GCP** naming differs (SG vs NSG vs firewall rules) — name the **provider** or stay vendor-neutral.
- [ ] **K8s/CNI** behavior varies (NetworkPolicy enforcement depends on CNI) — qualify — **`versions.md`**.

## Security claims

- [ ] **“Private subnet = safe”** — false without **routing**, **SG**, and **identity** — **`security-pro`**.

## Commands

- [ ] CLI examples use **generic** resource names; user must substitute account/region.
