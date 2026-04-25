---
name: deployment-pro
description: |
  Production-grade software deployment and release engineering: deployment runtime model (control plane vs workloads, artifact promotion graph, drift, consistency expectations per platform), CI/CD flows and gates, hosting trade-offs (static, PaaS, containers, serverless, VM), release strategies (rolling, blue-green, canary, recreate, feature flags), GitOps promotion, environments and rollback literacy, coordinated DB migrations (expand/contract handoff), failure modes (crash loops, PDB blocks, regional canary failure, forward-only migrations, CDN mixed assets), decision frameworks (staging vs prod-only mitigation), observability-linked deploy markers, OIDC/supply-chain pointers — cross-stack orchestration narrative, not vendor-docs paste.

  Use when designing pipelines, promoting builds, choosing rollout strategies, debugging failed deploys, zero-downtime migrations, rollback, GitOps drift, multi-region concerns.

  Combine with testing-pro, security-pro, postgresql-pro, code-packaging-pro, ci-cd-pro, git-operations-pro, network-infra-pro, caching-pro, api-design-pro, framework skills as needed.

  Triggers: "deploy", "deployment", "rollback", "canary", "blue-green", "rolling", "Kubernetes", "Helm", "GitOps", "Argo CD", "Flux", "promote", "staging", "production", "immutable artifact", "digest", "readiness probe", "liveness", "PDB", "crashloop", "drift", "zero downtime", "migration deploy", "expand contract", "traffic shift", "Lambda alias", "CloudFront", "rollout undo", "SLO deploy".

metadata:
  short-description: Deployment — runtime model, pipelines, strategies, rollback, failures, migrations
  content-language: en
  domain: deployment
  level: professional
---

# Deployment (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use your cloud or platform **official docs** for exact syntax; this skill encodes **runtime system behavior** (promotion, consistency, drift), **release strategy trade-offs**, **failure modes**, and **safe rollback/migration coupling** — not documentation duplicates. Confirm **orchestrator** (K8s, serverless, PaaS), **environments**, **SLO/downtime tolerance**, and **schema change** presence.

## Boundary

**`deployment-pro`** owns **ship path**: artifact → registry → environment promotion → traffic/routing → observe → rollback/forward-fix. **`testing-pro`** owns **what runs in CI** as quality gates. **`ci-cd-pro`** owns **workflow YAML patterns** when the question is pipeline mechanics without strategy depth. **`code-packaging-pro`** owns **build** of artifacts. **`postgresql-pro`** owns **migration mechanics**. **`security-pro`** owns **secrets and threat model** detail.

## Related skills (this repo)

| Skill | When to combine with `deployment-pro` |
|-------|----------------------------------------|
| **`testing-pro`** | CI gates, artifacts, flaky policy |
| **`security-pro`** | OIDC deploy, secrets, signing, fork PR safety |
| **`postgresql-pro`** | Migration ordering, expand/contract |
| **`code-packaging-pro`** | Image/wheel build before promotion |
| **`git-operations-pro`** | Tags, release branches |
| **`ci-cd-pro`** | Reusable workflows, concurrency, job graph |
| **`network-infra-pro`** | LB, DNS, TLS, multi-region traffic |
| **`caching-pro`** | CDN purge, cache busting with deploy |
| **`api-design-pro`** | Backward-compatible contracts during rollouts |
| **`nextjs-pro`** / **`nestjs-pro`** | Framework deploy targets |
| **`electron-pro`** / **`tauri-pro`** | Desktop release channels |

## When to use

- Hosting comparison, env promotion, release strategy, rollback design.
- GitOps/drift, canary health gates, zero-downtime with DB.
- Blast radius, ordering (API vs clients), operational deploy failures.

## When not to use

- **Pure pandas analysis** — **`data-analysis-pro`**.
- **Dockerfile layer optimization only** — **`docker-pro`** / **`code-packaging-pro`**.

## Required inputs

- **Runtime** class, **regions**, **whether schema changes**, **observability maturity**.

## Expected output

Follow **Suggested response format** strictly — runtime design through residual risks.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** orchestrator, environments, downtime tolerance, migration coupling. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.