# Deployment — decision tree

## Runtime / hosting

```
Pure static frontend?
├── CDN + immutable asset naming + purge strategy — methods-and-environments.md
└── Stateful API / DB?
    └── Containers / PaaS / serverless — pick primary model — decision-framework-and-trade-offs.md
```

## Blast radius / safety

```
Weak observability or immature tests?
├── Smaller steps: canary, feature flags, synth checks — flows-and-pipelines.md
└── Strong gates and metrics?
    └── Faster promotion; still rehearse rollback
```

## DB schema change present

```
Any column/table change?
├── expand/contract plan before traffic — postgresql-pro
└── App-only deploy?
    └── Still verify backward compatibility of API
```

## Release strategy pick

```
Need metric-gated gradual traffic?
├── Canary (+ auto rollback) — decision-framework-and-trade-offs.md
├── Need instant cut or instant revert with two full stacks?
│   └── Blue-green
└── Accept brief restart / maintain window?
    └── Recreate or single-instance restart
```

## Pipeline shape

```
GitOps / declarative cluster?
├── PR promotion between env overlays — flows-and-pipelines.md
└── Imperative CI deploy script?
    └── Document idempotency + secrets — security-pro
```

## Staging stance

```
No staging org policy?
├── Smallest substitute: prod canary + feature flags + monitoring — decision-framework-and-trade-offs.md
└── Staging available?
    └── Prod-like data policy; don’t fake parity silently
```

## Artifact source

```
Image built where?
├── code-packaging-pro / CI build once — deployment-runtime-system-model.md
└── Rebuild per env?
    └── Anti-pattern — anti-patterns.md
```

## Further reading

- [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md), [deployment-runtime-system-model.md](deployment-runtime-system-model.md)
