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

### Operating principles

1. **Think Before Coding** — Confirm platform, environment topology, rollback tolerance, and whether schema changes are coupled to the release. Ask before assuming production constraints.
2. **Simplicity First** — Default to the least risky rollout pattern that meets the objective. Do not introduce canary, multi-region choreography, or GitOps machinery unless the problem requires it.
3. **Surgical Changes** — Touch only the release path, environment config, or rollout step directly involved. Do not redesign unrelated CI or runtime architecture.
4. **Goal-Driven Execution** — Done = the release path, health checks, rollback/forward-fix path, and migration compatibility are explicitly verified.
5. **Artifact immutability first** — Promote the same built artifact across environments whenever possible; rebuilding per environment weakens traceability.
6. **Rollout order is part of correctness** — App, schema, cache, and client rollout sequencing can create incidents even when each piece is individually correct.
7. **Observability is a deploy dependency** — Health signals, deploy markers, and rollback criteria should exist before traffic shifts.
8. **Prefer reversible moves** — When reversal is impossible, say so early and design an explicit forward-only mitigation path.

## Default recommendations by scenario

- **Simple service deploy** — Prefer rolling or phased rollout with explicit health gates before introducing blue-green complexity.
- **Schema-coupled release** — Use expand/migrate/contract unless proven safe otherwise.
- **High-blast-radius change** — Limit scope with canary or targeted traffic shift before global promotion.
- **Static asset/API mix** — Coordinate cache busting and backward-compatible contracts before client traffic moves.

## Decision trees

Summary: choose rollout strategy based on blast radius, rollback ability, migration coupling, and observability maturity rather than platform fashion.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: rebuilding per environment, rollbacks that ignore schema state, global cache purges without versioning, and deploys without clear health gates.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Deployment runtime system model (summary)

How artifacts move through registries, environments, traffic layers, and health checks so rollout reasoning is tied to the real runtime.

Details: [references/deployment-runtime-system-model.md](references/deployment-runtime-system-model.md)

### Flows and pipelines (summary)

How promotion, approvals, concurrency, and release stages should fit together so deployments stay auditable and reproducible.

Details: [references/flows-and-pipelines.md](references/flows-and-pipelines.md)

### Methods and environments (summary)

How rolling, blue-green, canary, recreate, and environment strategy choices trade off speed, safety, and complexity.

Details: [references/methods-and-environments.md](references/methods-and-environments.md)

### Failure modes and mitigation (summary)

Crash loops, probe mistakes, drift, mixed assets, failed canaries, and forward-only migration traps to detect before impact widens.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

Version-sensitive deployment notes that affect runtime support, rollout tooling, and environment compatibility.

Details: [references/versions.md](references/versions.md)

## Suggested response format

1. **Context** — Runtime/orchestrator, environments, traffic shape, downtime tolerance, and schema coupling.
2. **Release model** — Explain the deployment path, ordering, and health signals that matter.
3. **Recommendation** — Minimum rollout or rollback-safe change with rationale.
4. **Verification** — Exact checks for promotion, health, rollback, and migration compatibility.
5. **Residual risks** — Remaining blast radius, observability gaps, or irreversible steps.

## Resources in this skill

| Topic | File |
|-------|------|
| Deployment runtime system model | [references/deployment-runtime-system-model.md](references/deployment-runtime-system-model.md) |
| Flows and pipelines | [references/flows-and-pipelines.md](references/flows-and-pipelines.md) |
| Methods and environments | [references/methods-and-environments.md](references/methods-and-environments.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "We need zero-downtime rollout for a normal stateless API."
- Prefer rolling deploy with readiness gates and immutable artifact promotion before blue-green complexity.
- Keep rollback criteria explicit and verify health before broad traffic shift.
- **Verify:** New pods pass readiness, error rate stays flat, and rollback can restore the prior artifact quickly.

**Input (tricky):** "A deploy adds a non-null column and the team expects instant rollback."
- Call out that rollback is not safe unless schema compatibility is designed up front.
- Use expand/migrate/contract instead of a one-shot breaking migration.
- **Verify:** Old and new app versions both operate during rollout and rollback window.

**Input (cross-skill):** "A Next.js release shows new HTML but stale JS in some regions."
- Pair **`caching-pro`** and **`nextjs-pro`** to reason about asset versioning and CDN/router behavior.
- Fix the release ordering and cache strategy instead of masking the issue with blanket purges.
- **Verify:** HTML and asset versions stay aligned across regions after promotion.

## Checklist before calling the skill done

- [ ] Platform, environment topology, downtime tolerance, and schema coupling confirmed first (Think Before Coding)
- [ ] Minimum rollout strategy chosen; no unnecessary deployment complexity added (Simplicity First)
- [ ] Only the affected release path or rollout step was changed (Surgical Changes)
- [ ] Success criteria and promotion/rollback verification are explicit and validated (Goal-Driven Execution)
- [ ] Artifact provenance and environment promotion path are clear
- [ ] Health signals and rollback or forward-fix path are defined
- [ ] Cache/client/schema compatibility is addressed where relevant
- [ ] Residual irreversible steps or observability gaps are documented
