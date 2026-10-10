# Hybrid cloud troubleshooting and rollback matrix

Use this matrix after the compact workflow when the task involves a high-risk claim. Fixtures must use synthetic identifiers and redacted values. The domain skill produces evidence; `sk-tester` executes tests, `sk-review`/`sk-review-pr` records findings, and `sk-verify-pro` owns the final `pass`/`block`/`defer` decision.

| Scenario | Expected result | Evidence | Failure/limitation | Next owner |
|---|---|---|---|---|
| BGP convergence | A peer loss reconverges within the declared SLO and selects the intended route. | Routing table snapshots, timers and convergence duration. | Provider timing variance is recorded. | sk-tester -> sk-verify-pro |
| Dual-tunnel failover | One tunnel failure shifts traffic to the healthy tunnel without asymmetric return. | Tunnel state, flow trace and packet-loss window. | Do not call failover safe without return-path evidence. | sk-review -> sk-verify-pro |
| Asymmetric routing | A captured flow shows symmetric ingress/egress or identifies the exact policy causing asymmetry. | Path trace and firewall counters. | Routing owner must approve policy changes. | sk-hybrid-cloud-networking -> sk-review |
| MTU | Path MTU is measured and fragmentation/PMTUD behavior matches the service requirement. | Probe results at boundary sizes and interface config. | Application symptoms alone are insufficient. | sk-tester -> sk-verify-pro |
| Packet loss | Loss is localized by hop/segment and remediation is bounded before retrying traffic. | Time-series metrics and packet capture metadata. | Do not include customer payloads in evidence. | sk-review -> sk-verify-pro |
| DNS | Private/public resolution returns the intended endpoint in each environment with TTL behavior documented. | Resolver outputs and split-horizon matrix. | Stale caches are a limitation until expiry is observed. | sk-tester -> sk-verify-pro |
| Rollback | A route or policy change can be reverted from a versioned config with a health check. | Change ID, pre-change snapshot, rollback result. | Emergency changes still require a follow-up owner. | sk-deployment-pro -> sk-verify-pro |
| Limitation | Unknown provider-side state is marked defer with owner and exact evidence request. | Open-risk record and next investigation step. | Do not infer provider health from one probe. | sk-verify-pro |

## Verification response shape

Return exactly:

- **Claim:** the bounded domain claim being assessed.
- **Criteria:** scenario rows and acceptance thresholds.
- **Evidence:** paths, commands, fixture IDs, timestamps and reviewer findings.
- **Limitations:** untested environments, assumptions, stale inputs or residual risk.
- **Next owner:** `sk-tester`, `sk-review`, `sk-review-pr`, the named domain owner, or `sk-verify-pro`.

Do not claim final release status from this matrix; hand the packet to `sk-verify-pro`.
