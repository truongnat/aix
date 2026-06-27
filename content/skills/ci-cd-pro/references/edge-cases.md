# CI/CD — edge cases

## Merge queue / reordering

- **Merge queue / batch merges:** Order of commits differs from local; ensure migrations and feature flags tolerate interleaved deploys.
- **Concurrent deploys** — Two pipelines finish near same time — deploy system must **serialize** or use **optimistic locking** on release version.

## Time and crypto

- **Clock skew:** JWT between systems or signed URLs may fail near boundaries; use NTP on runners.
- **Short-lived tokens expire mid-job** — Long integration tests may need refresh step or chunked jobs.

## External dependencies

- **Rate limits:** npm, Docker Hub, GitHub API — add retries with backoff and authenticated pulls where possible.
- **Vendor outage** — npm/CDN down — pipeline fails without fault; surface **retry** + **status page** link in runbook.

## Tests and quality

- **Flaky tests:** Retry only as a temporary measure; quarantine and fix root cause; mark known flakes — **`testing-pro`**.
- **Conditional secrets:** `if:` on steps referencing secrets — empty secrets can still be “defined”; validate behavior.
- **Coverage gates gaming** — Exclude paths to fake coverage — pair human review — **`testing-pro`**.

## Platform portability

- **Windows vs Linux paths:** matrix builds need path separators and shell differences (`bash` vs `pwsh`).
- **Shell defaults** — GitHub Actions defaults differ; specify `shell:` explicitly for cross-platform.

## Logs and repo shape

- **Large logs:** truncate verbose test output; some CI systems truncate or fail huge logs.
- **Submodule / subtree clones:** shallow clone depth can miss tags needed for versioning.
- **Sparse checkout / filter** — Breaks assumptions in scripts expecting full tree.

## Schedules and lifecycle

- **Scheduled workflows on inactive repos:** GitHub disables scheduled workflows after repo inactivity — document re-enable.
- **Timezone confusion** — `cron` UTC vs local — document in workflow comment.

## OIDC / identity

- **OIDC audience / subject:** Misconfigured trust relationship causes cryptic auth failures — align IdP claims with cloud IAM.
- **Multiple cloud accounts** — Wrong `audience` routes deploy to unintended account — separate environments.

## Secrets and trust

- **pull_request_target + checkout of PR head** — Dangerous combo — treat as **`security-pro`** incident-class pattern.
- **Dependabot / bot PRs** — Same fork boundary issues; often need **restricted** workflows.

## Artifacts and storage

- **Artifact near retention delete** — Downstream repro of old release fails — pin **release assets** not only workflow artifacts.
- **Same artifact name race** — Matrix overwrite without unique `name:` — lost debug data.

## Self-hosted runners

- **Poisoned runner** — Compromised box can exfiltrate secrets — isolate per-repo or ephemeral — **`secrets-security.md`**.
- **Stale runner image** — Old Docker / kernel — “works on my runner” drift — **`versions.md`**.

## Database and data plane

- **Destructive migration in parallel with old code** — Expand/contract phases — **`deployment-pro`**, **`postgresql-pro`**.
- **Seed data in CI** — Accidental prod connection string in test job — **`quality-validation-and-guardrails.md`**.

## Mobile / signing

- **Signing keys in CI** — Prefer HSM / short-lived signing service; never long-lived PKCS#12 in repo secrets.

## Cost and abuse

- **Crypto miners in PR** — Public repo abuse hosted minutes — approval for first-time contributors; path filters.

Pair with **`testing-pro`** for flake strategy and **`security-pro`** for secret exposure review.
