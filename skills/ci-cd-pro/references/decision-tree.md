# CI/CD — decision trees

## GitHub Actions: reusable workflow vs composite action vs matrix

```
Same pipeline repeated across many repos?
├── Reusable workflow (`workflow_call`)
├── Repeated steps inside one repo (setup Node, cache)?
│   └── Composite action
└── Test across Node/OS/browser versions?
    └── `strategy.matrix` — keep jobs parallel where possible
```

## OIDC to cloud vs long-lived secrets

```
Deploying to AWS/GCP/Azure from GitHub?
├── Prefer OIDC (`id-token: write`) — no static cloud keys in repo secrets
└── Legacy systems requiring static keys?
    └── Short-lived tokens where possible; rotate; scope IAM narrowly
```

## Canary vs blue-green vs rolling

```
Need instant rollback with double capacity acceptable?
├── Blue-green
├── Gradual risk reduction with metrics gates?
│   └── Canary + automated promotion/rollback
└── Cost-sensitive, slower rollback OK?
    └── Rolling
```

## Hosted vs self-hosted runners

```
Need GPUs, huge RAM, VPC to on-prem artifact?
├── Self-hosted / larger custom runner pool
└── Standard Linux/macOS build?
    └── Hosted — simpler ops; watch minute quotas
```

Self-hosted adds **security and patching** burden — document in **`pipeline-system-architecture.md`**.

## Path filters (monorepo)

```
Only /docs changed?
├── Skip build/test via paths/paths-ignore
└── Touches shared package?
    └── Run affected-project graph — build tools vary (Nx/Turborepo/Bazel)
```

## Database migration gate

```
Schema change in PR?
├── Migration job in staging pipeline before prod promote
└── Breaking change requiring two-phase deploy?
    └── Coordinate **expand/contract** — **`postgresql-pro`**, **`deployment-pro`**
```

## GitLab vs GitHub (platform pick)

```
Org standardized on GitLab?
├── Mirror concepts via gitlab-ci-overview.md — stages, rules, includes
└── GitHub-centric examples still valid conceptually — translate keywords
```

## When to block the merge queue

```
Change touches auth, migrations, infra, or license compliance?
├── Required checks + optional manual approval for production
└── Docs-only?
    └── Fast path — still run spelling/link checks if configured
```

## Further reading

- [github-actions.md](github-actions.md), [secrets-security.md](secrets-security.md), [deployment-strategies.md](deployment-strategies.md)
- [decision-framework-and-tradeoffs.md](decision-framework-and-tradeoffs.md), [pipeline-system-architecture.md](pipeline-system-architecture.md)
