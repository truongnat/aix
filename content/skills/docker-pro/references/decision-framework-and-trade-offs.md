# Decision framework and trade-offs

## Image size vs debuggability

| Choice | Upside | Downside |
|--------|--------|----------|
| **distroless / scratch** | Minimal attack surface, small pull | No shell — harder `kubectl exec` debug |
| **Alpine** | Small | **musl** breaks some native wheels — **`edge-cases.md`** |
| **Debian slim / Ubuntu minimal** | **glibc**, broad packages | Larger image |

**Rule:** Smallest image that **passes integration tests** on the target arch; verify **native deps** early.

## Build speed vs reproducibility

- **Cache mounts** (`RUN --mount=type=cache`) speed CI; lockfiles still pin versions.
- **`--no-cache` in prod** occasionally to catch drift — pair with **`ci-cd-pro`** policy.

## Compose vs cluster

| Context | Prefer |
|---------|--------|
| **Local/dev** stack, few services | Compose + **profiles** — **`compose.md`** |
| **Prod** policy, HA, scale | Orchestrator — **`deployment-pro`**; Compose models **topology**, not HA |

## Dev bind mounts vs prod volumes

- **Bind** for hot reload locally; avoid production-only assumptions (paths, UID).
- **Named volumes** for data owned by the container; document backup — **`compose.md`**.
