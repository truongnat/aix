# Decision framework and trade-offs

## Library vs application

| Aspect | Library (published) | Application (image/binary) |
|--------|---------------------|----------------------------|
| **Deps** | Broad compatible ranges + CI matrix | Pinned lockfile |
| **Versioning** | Semver + CHANGELOG | Often calendar/git SHA + image digest |
| **Artifact** | Wheel/sdist on index | Container / single binary |

## Build backend / tool (Python)

| Choice | When |
|--------|------|
| **hatchling** | Modern default for many greenfield libs |
| **setuptools** | Legacy compatibility, plugins |
| **Poetry / uv** | App-style lock + export; team workflow preference |

Pick **one** story per repo; document in README — avoid mixing without reason.

## Image trade-offs

| Choice | Upside | Downside |
|--------|--------|----------|
| **Slim + multi-stage** | Small attack surface | Slower cold debug |
| **Fat dev image** | Easy local parity | Never ship as prod |

## Publish trade-offs

| Choice | Upside | Downside |
|--------|--------|----------|
| **OIDC trusted publishing** | No long-lived PyPI token | IAM/setup complexity |
| **Long-lived token** | Simple | Rotation burden; leak risk |

Default **OIDC** for PyPI/GitHub-hosted registries when available — **`security-pro`**.
