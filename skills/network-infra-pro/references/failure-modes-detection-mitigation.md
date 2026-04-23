# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **DNS stale/cache** | Low TTL vs resolver | Wrong region after cutover | Lower TTL pre-migrate; monitor answers — **`edge-cases.md`** |
| **Asymmetric routing** | Return path ≠ forward | Silent drops / TCP weird | Symmetric paths or stateful FW rules — **`edge-cases.md`** |
| **MTU black hole** | Tunnel overhead | PMTUD fails | MSS clamp / raise MTU knowingly — **`edge-cases.md`** |
| **LB unhealthy targets** | Bad health check | Flapping 502 | Check protocol/path; grace period — **`traffic-management-and-edge.md`** |
| **SG sprawl** | `0.0.0.0/0` creep | Audit fail | Replace with prefix sets — **`anti-patterns.md`** |
| **NAT exhaustion / SNAT port** | Many egress connections | Ephemeral errors | More IPs / PAT tuning — **`topology-and-segmentation.md`** |
| **Partial region outage** | DNS still points in | User subset broken | Health-based DNS / failover — **`reliability-and-observability.md`** |
| **Certificate expiry** | Ops drift | TLS handshake fail | Automation + alert — **`traffic-management-and-edge.md`** |
| **Mesh misconfig** | Wrong subset | Intermittent 503 | Staged rollout; canaries — **`deployment-pro`** |
| **Observability gap** | No path metrics | Long MTTR | Trace IDs through LB — **`reliability-and-observability.md`** |
