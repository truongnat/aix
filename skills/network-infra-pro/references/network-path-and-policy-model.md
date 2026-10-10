# Network path and policy model

## End-to-end path (mental map)

```text
Client → DNS → Edge (CDN/WAF) → LB/Ingress → Service mesh (optional) → Pod/VM → Dependency (DB/API)
```

Each hop adds **latency**, **failure domain**, and **policy surface** — document **owner** per segment — **`traffic-management-and-edge.md`**.

## Planes

| Plane | Examples |
|-------|----------|
| **Management / control** | API calls that change routes, SGs, DNS records |
| **Data** | Application bytes on established flows |

**Blast radius:** A bad control-plane change can black-hole traffic without host-level “down” — **`failure-modes-detection-mitigation.md`**.

## Policy attachment points

| Layer | Typical controls |
|-------|------------------|
| **Edge** | WAF, rate limit, TLS |
| **LB** | Path route, health check, stickiness |
| **SG / NSG / firewall** | IP/port allowlists — **`topology-and-segmentation.md`** |
| **Mesh** | mTLS + L7 policy — **`decision-tree.md`** |

## Trust zones

- **Public / DMZ / private / data** — Move laterally only through **explicit** bridges — **`topology-and-segmentation.md`**.
