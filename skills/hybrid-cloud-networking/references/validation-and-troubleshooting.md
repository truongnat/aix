# Hybrid networking validation and troubleshooting

Use this reference after choosing VPN, dedicated connectivity, or a multi-cloud topology. Validate the design in a non-production environment before rollout and record provider, region, CIDR, BGP ASN, MTU, SLA, and rollback assumptions.

## Failure-mode matrix

| Failure | Expected behavior | Evidence |
|---|---|---|
| Primary tunnel down | Traffic converges through secondary path within the stated RTO | Tunnel events, route table, packet probe |
| BGP session reset | Routes withdraw safely and reconverge without blackholing | BGP logs and convergence time |
| Asymmetric route | Flow logs identify the path; policy blocks or corrects it | Trace in both directions |
| MTU/fragmentation issue | Large-packet probe fails predictably or PMTUD works; application remains safe | Sized ping/probe and packet capture |
| Packet loss/latency spike | Alert fires at threshold; traffic fails over or is rate-limited | Metrics and incident record |
| DNS/private endpoint failure | Resolver fallback or explicit failure; no public data-plane leak | DNS query trace |
| CIDR overlap | Design rejected before provisioning | Address-plan validation |
| Provider/API outage | Runbook identifies degraded mode and rollback owner | Incident checklist |

## BGP and route checks

Confirm advertised and accepted prefixes, maximum-prefix limits, route filters, local preference, AS-path behavior, and propagation to every intended spoke. Reject default-route propagation unless it is explicitly required. Keep control-plane and data-plane tests separate: a healthy BGP session does not prove application reachability.

## Rollout and rollback

Use staged activation: establish the secondary path, validate control-plane routes, run bidirectional probes, shift a small traffic slice, observe loss/latency, then increase traffic. Roll back by withdrawing the new path or restoring the previous route preference; document how to avoid route flapping.

## Evidence checklist

Capture topology and CIDR map, route advertisements, tunnel status, failover timing, packet-loss/latency measurements, DNS resolution, flow-log samples, alert firing, and the exact rollback decision. Redact public credentials and customer payloads.
