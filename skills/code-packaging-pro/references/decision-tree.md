# Code packaging — decision tree

## Artifact type

```
Published library wheel?
├── Semver + CHANGELOG; matrix Python/OS; PyPI OIDC publish — python-packaging-and-containers.md
└── Long-running service?
    └── Multi-stage Docker + digest promotion — deployment-pro after push
```

## Dependencies discipline

```
Application / deployable?
├── Lockfile (uv/pip-tools/poetry lock) — decision-framework-and-tradeoffs.md
└── Library?
    └── Compatible ranges + CI matrix across supported Pythons
```

## Publish mechanism

```
PyPI from GitHub?
├── Trusted publishing (OIDC) preferred — supply-chain-and-provenance-hooks.md
└── Legacy token?
    └── Rotate; minimal scope; never on fork PR workflows
```

## CI layout

```
Single package repo?
├── lint → test → build → (release on tag)
└── Monorepo?
    └── path filters + targeted workflows — edge-cases.md
```

## Build backend (Python)

```
Greenfield library?
├── hatchling common path — decision-framework-and-tradeoffs.md
└── Need setuptools plugins / legacy?
    └── setuptools — document why
```

## Scope boundary

```
Where does image run (K8s/Lambda/nomad)?
└── deployment-pro — not decided by Dockerfile alone — artifact-build-and-registry-model.md
```

## Further reading

- [artifact-build-and-registry-model.md](artifact-build-and-registry-model.md), [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md)
