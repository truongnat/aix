# Docker — decision trees

## Base image: distroless vs Alpine vs slim vs full

```
Need shell/package manager in final image?
├── No — static binary or single runtime binary?
│   └── scratch / distroless — minimal attack surface
├── Yes — debugging and small libc (musl OK)?
│   └── Alpine — watch DNS/SSL and libc compatibility
└── Need glibc compatibility and wide package support?
    └── Debian slim / Ubuntu minimal — larger but fewer musl surprises
```

**Decision:** Prefer **smallest image that runs your binary**; validate **musl vs glibc** for native Node/Python wheels.

## Multi-stage: when required

```
Production image includes compiler, devDependencies, or tests?
├── Yes
│   └── Multi-stage: build in full image, copy artifacts to runtime stage
└── Single static binary (Go)?
    └── May use scratch + binary only
```

## Compose vs Kubernetes

```
Single host dev/staging with a few services?
├── Docker Compose — fast iteration, profiles for optional services
└── Multi-cluster production with policy, autoscaling, network policies?
    └── Kubernetes — Compose is not a substitute for prod orchestration
```

## Bind mount vs named volume (development)

```
Need host to edit files live?
├── Bind mount source into container
└── Database or opaque data the container owns?
    └── Named volume — avoid host UID issues for Postgres data dirs
```

## Rootless Docker / desktop VM

```
Host is macOS/Windows?
├── Engine runs in Linux VM (Docker Desktop, Colima, Rancher Desktop)
└── Bind mount paths and performance differ from Linux bare metal — test on CI Linux when prod is Linux
```

## Further reading

- [dockerfile.md](dockerfile.md), [image-optimization.md](image-optimization.md)
