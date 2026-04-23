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

1. Confirm orchestrator, environments, downtime tolerance, migration coupling.
2. Apply summaries; open `references/`; avoid **fake ARNs** — **`quality-validation-and-guardrails.md`**.
3. Respond using **Suggested response format**; route DB detail to **`postgresql-pro`**.

### Operating principles

1. **Build once, deploy many** — Same digest across envs; config per stage — **`deployment-runtime-system-model.md`**.
2. **Rollback first-class** — Know previous good revision before shipping — **`failure-modes-detection-mitigation.md`**.
3. **Migrations coordinate with rollouts** — Expand/contract — **`postgresql-pro`**.
4. **Observe releases** — Markers, golden signals, automated abort — **`anti-patterns.md`**.
5. **Least privilege pipelines** — OIDC — **`security-pro`**.
6. **GitOps / IaC** — Reduce click-ops drift — **`flows-and-pipelines.md`**.

### Deployment runtime system model (summary)

Control vs data plane; promotion graph; consistency — **`deployment-runtime-system-model.md`**.

Details: [references/deployment-runtime-system-model.md](references/deployment-runtime-system-model.md)

### Failure modes — detection and mitigation (summary)

CrashLoop, PDB, partial canary, forward-only DB — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Strategy matrix; staging trade-off; hosting orientation — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Platform honesty; no false “zero downtime” — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Methods and environments (summary)

Static, PaaS, K8s, serverless — **`methods-and-environments.md`**.

Details: [references/methods-and-environments.md](references/methods-and-environments.md)

### Flows and pipelines (summary)

Stages, GitOps, DORA orientation — **`flows-and-pipelines.md`**.

Details: [references/flows-and-pipelines.md](references/flows-and-pipelines.md)

### Tips and tricks (summary)

12-factor, health checks, digests — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Ordering, CDN mixed assets, GitOps — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision trees (summary)

Runtime, DB, strategy, staging — **`decision-tree.md`**.

Details: [references/decision-tree.md](references/decision-tree.md)

### Anti-patterns (summary)

Build-per-env, silent rollback, no observability — **`anti-patterns.md`**.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Integration map (summary)

**`ci-cd-pro`**, **`network-infra-pro`**, **`caching-pro`**, **`postgresql-pro`** — **`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Platform versions (summary)

Pin runtimes, IaC — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Platform(s), envs, regions, workload type, schema change yes/no.
2. **Problem** — Goal (first rollout, fix stuck deploy, reduce blast radius) and constraints (SLO, budget).
3. **System design / architecture** — Promotion path; control vs workload; traffic + migration ordering — **`deployment-runtime-system-model.md`**.
4. **Decision reasoning** — Strategy (canary vs rolling vs blue-green); staging policy; GitOps vs imperative — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Stage list, gates, rollback trigger, pseudo-config — **no fabricated resource names** — **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Speed vs safety; cost of canary; regional complexity.
7. **Failure modes** — Top risks for this design — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Migration forward-fix, **`security-pro`** for IAM, **`postgresql-pro`** for schema, **`network-infra-pro`** for traffic.

## Resources in this skill

| Topic | File |
|-------|------|
| Deployment runtime model | [references/deployment-runtime-system-model.md](references/deployment-runtime-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Methods & environments | [references/methods-and-environments.md](references/methods-and-environments.md) |
| Flows & pipelines | [references/flows-and-pipelines.md](references/flows-and-pipelines.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

**Input:** API + SPA + DB drop column — outage.  
**Expected output:** Expand/contract; deploy order; **`postgresql-pro`**; rolling + readiness — full **Suggested response format**.

**Input:** No staging — leadership.  
**Expected output:** Risk; canary + synth; **`testing-pro`** minimum — **`decision-framework-and-trade-offs.md`**.

**Input:** Rotate registry creds in Actions.  
**Expected output:** **`security-pro`** OIDC; **this skill** rollback if push fails; **`code-packaging-pro`** build wiring.

## Checklist before calling the skill done

### Strategy & runtime

- [ ] **Hosting model** and **environments** clear; **promotion** path sketched — **`deployment-runtime-system-model.md`**.
- [ ] **Release strategy** matches observability and capacity — **`decision-framework-and-trade-offs.md`**.
- [ ] **Rollback** / forward-fix path for migrations addressed — **`failure-modes-detection-mitigation.md`**.

### Safety & integration

- [ ] **Secrets/pipeline permissions** not hand-waved — **`security-pro`** when non-trivial.
- [ ] **Schema changes** coordinated — **`postgresql-pro`** when relevant.
- [ ] **Artifact immutability** (digest) stated — **`tips-and-tricks.md`**.

### Operations

- [ ] **Observability** after promote (markers, signals, abort) when prod — **`anti-patterns.md`**.
- [ ] **Failure modes** section present — not only happy path.
- [ ] **`ci-cd-pro`** / **`network-infra-pro`** cited when workflow or traffic path dominates.
