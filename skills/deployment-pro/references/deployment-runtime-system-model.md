# Deployment runtime system model

Deployment is the path from **versioned artifact** to **running workload** with **config** and **routing** — a control loop, not a single button.

## Planes

| Plane | Role | Examples |
|-------|------|----------|
| **Control** | Declares desired state; drives rollouts | GitOps controller, K8s API, PaaS API, CloudFormation/TF apply, CodeDeploy |
| **Data / workload** | Runs containers, functions, static origin | Pods, Lambdas, Cloud Run services, CDN origins |

**Drift** = control state ≠ actual (GitOps, config rot) — detect and reconcile.

## Promotion graph (conceptual)

```text
Build artifact (immutable digest)
    → registry / artifact store
    → dev deploy (config overlay A)
    → staging (gates + tests)
    → prod (approval + strategy: rolling/canary/blue-green)
    → observe (SLO) → rollback or forward-fix
```

**Config** varies per env; **artifact** should not when following **build once, deploy many** — **`tips-and-tricks.md`**.

## Consistency expectations

- **Kubernetes** — eventual readiness of Deployment; **not** all pods flip atomically unless traffic layer coordinates.
- **Serverless** — alias/traffic shifting may lag; **cold start** after deploy.
- **Static** — CDN propagation delay; stale assets until purge/TTL — **`edge-cases.md`**.

## State coupling

- **DB schema** version must stay compatible with **both** old and new app during rolling deploy — **`postgresql-pro`** expand/contract.
