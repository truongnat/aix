# CI/CD — tips and tricks

See [pipeline-system-architecture.md](pipeline-system-architecture.md) for control/execution planes, artifact flow, and scaling limits before micro-optimizing YAML.

- **Fail fast:** lint → typecheck → unit tests before expensive integration or visual tests.

- **Artifacts:** upload test reports and coverage even on failure (`if: always()` where appropriate) for debugging.

- **Job outputs:** pass image digests and version strings between jobs with `outputs` instead of re-deriving.

- **Matrix includes/excludes:** trim combinations (e.g. Windows only on release branches) to save minutes.

- **Self-hosted runners:** isolate with ephemeral VMs; treat runner compromise as high severity.

- **Required status checks:** align branch protection with the checks that actually gate quality.

- **Deployment environments:** use GitHub `environment` with reviewers for production; separate secrets per env.

- **Cache warming:** for Docker, registry-backed layer cache beats only `actions/cache` for large images.

- **YAML anchors:** DRY repeated config in GitLab CI; GitHub Actions uses reusable workflows instead.

- **Timeout everywhere:** set `timeout-minutes` on jobs to avoid hung runners eating quota.

Details also in [github-actions.md](github-actions.md) and [optimization.md](optimization.md).
