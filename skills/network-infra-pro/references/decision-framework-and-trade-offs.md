# Decision framework and trade-offs

## Few hops vs mesh

| Approach | Upside | Downside |
|----------|--------|----------|
| **LB + SG only** | Simple ops | Manual mTLS/cross-service policy |
| **Service mesh** | Uniform east-west policy | Control plane tax — **`decision-tree.md`** |

## Internet egress strategies

| Strategy | Fits |
|----------|------|
| **NAT gateway per AZ** | HA egress; cost |
| **Egress proxy** | Strict allowlist for compliance |

## DNS strategies

| Choice | Trade-off |
|--------|-----------|
| **Low TTL** | Faster failover; more query load |
| **Geo DNS** | Latency win; harder debugging |

## Hybrid cloud connectivity

| Option | Notes |
|--------|-------|
| **VPN / DX / ExpressRoute** | Throughput vs ops burden |
| **Private Link / Private Service Connect** | Avoid public internet; vendor lock patterns — document — **`edge-cases.md`** |
