# Decision framework and trade-offs

## Trade-off matrix

| Dimension | Optimize for speed | Optimize for safety / audit |
|-----------|---------------------|-----------------------------|
| **Dependencies** | Broad cache hit | `npm ci` strict; slower cold |
| **Parallelism** | Max matrix | Fewer shards; simpler triage |
| **Secrets** | Long-lived keys (easy) | OIDC + narrow IAM (setup cost) |
| **Deploy** | Push on green main | Manual approval + canary |
| **Fork PRs** | Full CI with secrets | Limited checks; no secrets |

## Defaults by scenario

| Scenario | Default pipeline posture |
|----------|--------------------------|
| **Small OSS library** | Lint → test matrix → publish on protected tag; OIDC to package registry |
| **Product web app** | Path filters for docs; env protection on prod; preview deploy from trusted workflows only |
| **Mobile release** | Signed artifact + store upload gates; manual promotion track |
| **Monorepo** | Path-based filters + targeted jobs; shared reusable workflow |
| **Regulated / SOC2** | Immutable artifacts; approval on prod; audit log export; SHA-pinned actions |
| **Data platform with DB** | Migrate job gated; backup verify in **pre-deploy** checklist — **`deployment-pro`** |

## When parallel jobs hurt

Startup **fixed cost** (clone, login) dominates on tiny repos — **measure** before splitting into 10 micro-jobs.

## Decision record (lightweight)

For contentious choices: **date**, **options**, **picked**, **rejected reason** — lives in ADR or team doc; link from workflow comment header.
