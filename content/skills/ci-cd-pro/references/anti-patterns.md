# CI/CD — anti-patterns

1. **Unpinned third-party actions** — Tag drift and supply-chain risk; pin to full commit SHA.

2. **Secrets in workflow `env` for fork PRs** — Never expose production secrets to untrusted forks; use `pull_request_target` only with extreme care (often avoid).

3. **Caching without a lockfile key** — Stale dependencies; key caches on lockfile hash.

4. **No concurrency control** — Queued runs pile up; use `concurrency` to cancel superseded pushes.

5. **`npm install` in CI** — Prefer `npm ci` with lockfile for reproducible builds.

6. **Integration tests without service containers or mocks** — Flaky network; use `services:` in Actions or testcontainers with fixed versions.

7. **Deploy on green unit tests only** — Missing contract/e2e gates for critical paths.

8. **Logging secrets in `run:` steps** — Echo, debug print, or verbose flags can leak tokens; use masking.

9. **Same pipeline for every branch** — Waste on feature branches; use path filters or conditional jobs.

10. **Manual production deploy without rollback documented** — Every deploy path needs a known revert.

When NOT to add parallel jobs: small repos with setup cost higher than savings — profile first.
