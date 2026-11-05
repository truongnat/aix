# Code packaging — integration map

| Skill | When |
|-------|------|
| **`deployment-pro`** | Digest promotion, rollout, rollback, environments — **after** artifact exists |
| **`testing-pro`** | What runs in CI; flaky gates; coverage |
| **`security-pro`** | OIDC trust, SBOM/signing policy, fork PR workflows, secret scanning |
| **`ci-cd-pro`** | Workflow graph, concurrency, reusable workflows across repos |
| **`docker-pro`** | Dockerfile depth, BuildKit, layer/cache tuning beyond basics |
| **`javascript-pro`** / **`cli-pro`** | npm publish, `bin`/CLI entry when shipping JS tools |
| **`nestjs-pro`** / **`nextjs-pro`** | Framework-specific Docker or standalone bundles |

**Boundary:** **`code-packaging-pro`** owns **build reproducibility**, **artifact shape**, **registry push mechanics** in CI; **`deployment-pro`** owns **runtime** lifecycle and traffic.
