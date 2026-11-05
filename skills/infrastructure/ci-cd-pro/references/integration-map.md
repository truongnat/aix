# CI/CD — integration map

| Skill | When |
|-------|------|
| **`docker-pro`** | Image build, layer cache, BuildKit, digest references in deploy. |
| **`deployment-pro`** | Promotion stages, rollback, migration sequencing with releases. |
| **`testing-pro`** | Job ordering, flakes, coverage gates, contract/e2e depth. |
| **`security-pro`** | OIDC trust, fork policy, Sigstore/SBOM gates, secret scanning. |
| **`git-operations-pro`** | Triggers, protected branches, tags, merge queue semantics. |
| **`code-packaging-pro`** | Publish wheels/containers/npm from pipeline outputs. |
| **`postgresql-pro`** | Migration jobs, backwards-compatible schema rollout. |
| **`business-analysis-pro`** | Rare: regulatory gates / approval RACI mapped to env protection. |

**Boundary:** **`ci-cd-pro`** owns **workflow graph**, **runner execution model**, **secrets/OIDC wiring at YAML level**, **pipeline reliability patterns**, and **artifact handoff**; **`deployment-pro`** owns **runtime rollout** beyond the workflow step.
