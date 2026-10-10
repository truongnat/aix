# Pipeline system architecture

CI/CD is a **control plane** orchestrating **ephemeral workers** — design it as a distributed system.

## Control vs execution

| Plane | Responsibility |
|-------|----------------|
| **Control** | Git host (GitHub/GitLab), workflow parser, scheduling, secrets resolution, approvals |
| **Execution** | Runners: checkout, compile, test, push artifacts |

Runs are **immutable snapshots** of a **commit SHA** + **workflow file at that ref** (GitHub: workflow from default branch for some events — verify docs for `pull_request` vs `push`).

## End-to-end data flow

```text
VCS event → trigger filter → workflow graph → job queue → runner acquire
    → checkout @ SHA → env + secrets inject → steps (build → test → scan)
    → artifacts / reports → registry or deploy hook → external CD receives digest/version
```

## State management

- **Ephemeral** — Runner disk between jobs is not durable unless you upload **artifacts**.
- **Secrets** — Resolved at runtime; never assume secrets persist across jobs unless passed via **needs + outputs** (prefer OIDC refresh per job).
- **Cache** — Best-effort acceleration; **not** source of truth — lockfile defines deps.
- **Deploy state** lives in **Kubernetes/Helm/Spinnaker/etc.** — pipeline only **invokes**; rollback is **platform** concern — **`deployment-pro`**.

## Scaling constraints

- **Concurrency caps** — Org/repo limits; parallel jobs queue.
- **Runner pool** — Hosted minute quotas; self-hosted capacity and **queue latency**.
- **Matrix explosion** — `M×N` jobs multiply minutes and fan-out noise.

## Idempotency

- **Re-run workflow** must not corrupt production if deploy steps are **digest-addressed** and deployment system rejects duplicate revisions safely.
- Tag **`v1.2.3`** twice is a process failure — use **immutable tags** or **release assets** keyed by SHA.

## Consistency model

- **Per-run** consistency: one commit, one workflow definition (with known exceptions for reusable workflow `ref`).
- **Cross-run** ordering **not** guaranteed with merge queue except **within** queue semantics — **`edge-cases.md`**.
