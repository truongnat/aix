# Container build, image, and runtime (system model)

## What is what

| Concept | Role |
|--------|------|
| **Build context** | Files sent to the daemon; size and layout affect speed and **cache** — **`.dockerignore`**. |
| **Image** | Immutable **layer stack** + config (env, `CMD`, `USER`); identified by **digest** in registries. |
| **Container** | Writable layer + cgroup/isolation around one (usually) process tree from the image **config**. |
| **Registry** | Stores images by **repository + digest**; tags are mutable pointers — **`versions.md`**. |

## Build pipeline (mental model)

```text
Dockerfile + context → [BuildKit] → layer graph → tagged image → push → deploy/pull → run
```

- **Layer order** = **cache key order**: change early layer → invalidates downstream — **`dockerfile.md`**, **`image-optimization.md`**.
- **Immutable artifact for prod** — promote **digest**, not mutable `latest` — **`deployment-pro`**.

## Runtime expectations (orchestrator-aligned)

- **PID 1** — graceful shutdown and signal semantics — **`edge-cases.md`**.
- **Health** — `HEALTHCHECK` or platform probe maps to **restart/replace** policy — **`deployment-pro`**.
- **Filesystem** — read-only root + `tmpfs` for writable dirs is common in **Kubernetes**; Compose must mirror constraints when rehearsing prod.
