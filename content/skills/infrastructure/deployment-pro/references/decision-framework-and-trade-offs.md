# Decision framework and trade-offs

## Release strategy matrix

| Strategy | Best when | Cost / risk |
|----------|-----------|-------------|
| **Rolling** | Default K8s/stateful-ish | Slow rollback if wave misconfigured |
| **Blue-green** | Need instant switch + capacity for two stacks | Infra cost |
| **Canary** | Metric-gated promotion | Observability maturity required |
| **Recreate** | Maintenance window acceptable | Downtime |
| **Feature flags** | Frequent deploys; risky behavior toggled | Flag debt without lifecycle |

## Hosting choice (orientation)

| Factor | Lean serverless | Lean containers |
|--------|------------------|------------------|
| **Traffic shape** | Spiky, event-heavy | Steady HTTP, complex networking |
| **Cold start SLA** | Problem if strict | Warm pools / always-on |
| **Vendor lock concern** | Higher abstraction | Portable images |

No universal winner — **`methods-and-environments.md`**.

## Staging trade-off

| Stance | Upside | Downside |
|--------|--------|----------|
| **Full staging** | Parity testing | Cost + drift from prod |
| **Prod-only testing** leadership | Saves env | Highest blast radius — mitigate with **canary + synth checks** — never pretend safe |

## IaC vs click-ops

- **Git-reviewed** infra changes scale; console edits cause **snowflakes** — **`tips-and-tricks.md`**.
