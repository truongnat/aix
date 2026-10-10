# Deployment — integration map

| Skill | When |
|-------|------|
| **`testing-pro`** | CI gates, test layers, flaky policy — quality pre-promote |
| **`security-pro`** | OIDC deploy, secrets, signing, fork PR pipelines, SBOM admission |
| **`postgresql-pro`** | Migration ordering, expand/contract, locking under deploy |
| **`code-packaging-pro`** | Immutable image/wheel build before promotion |
| **`git-operations-pro`** | Tags, release branches, merge hygiene |
| **`ci-cd-pro`** | Workflow graph, concurrency, reusable deploy jobs |
| **`network-infra-pro`** | LB, DNS, TLS, topology for traffic shift / multi-region |
| **`nextjs-pro`** / **`nestjs-pro`** | Framework-specific deploy targets (Vercel, Node containers) |
| **`electron-pro`** / **`tauri-pro`** | Desktop release channels and auto-update |
| **`caching-pro`** | CDN cache invalidation, rollout interaction with edge cache |
| **`api-design-pro`** | Contract compatibility across rolling deploys |

**Boundary:** **`deployment-pro`** owns **promotion topology**, **release strategies**, **runtime rollout**, and **operational rollback narrative**; **`ci-cd-pro`** focuses **pipeline YAML mechanics** when not strategy-specific.
