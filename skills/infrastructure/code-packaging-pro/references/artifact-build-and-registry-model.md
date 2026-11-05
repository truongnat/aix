# Artifact, build graph, and registry model

Packaging connects **source** → **deterministic-ish build** → **immutable-ish artifact** → **registry** → **deployment-pro** consumes reference.

## Build graph (conceptual)

```text
Repo @ SHA → lint/test (quality gates)
         → build (wheel | sdist | container layers)
         → sign/attest (optional)
         → push to registry / index (PyPI, GHCR, npm, …)
```

**Promotion** (dev → staging → prod) uses **same digest/tag discipline** — **`deployment-pro`** — not rebuilding per env without cause.

## Artifact types

| Type | Identity | Typical consumer |
|------|-----------|------------------|
| **Wheel / sdist** | Name + version (+ Python tags) | `pip`, internal index |
| **OCI image** | Repo + **digest** (`sha256:…`) | Kubernetes, ECS, Lambda container |
| **npm tarball** | Name + version | `npm install` |

Treat **version strings** as **public API** for libraries — semver — **`tips-and-tricks.md`**.

## Immutability

- **Published** wheel version **cannot** be overwritten on PyPI — failed publish vs partial upload → understand retry/idempotency — **`failure-modes-detection-mitigation.md`**.
- **Image** by digest is the stable handle; moving **`latest`** tag is operational policy — **`deployment-pro`**.

## State

- **CI** produces ephemeral workspace; **artifacts** persist in blob/registry.
- **Secrets** exist only during job — OIDC preferred — **`security-pro`**.
