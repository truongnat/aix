# Pipeline observability and governance

## Signals to track

| Signal | Use |
|--------|-----|
| **Lead time** | Commit → green main |
| **Pick time / queue time** | Runner capacity health |
| **Mean time to recovery (pipeline)** | Re-run success after fix |
| **Failure rate per job** | Flaky vs systematic |
| **Minutes consumed** | Cost — especially self-hosted electricity + amortized hardware |

## Failure visibility

- **JUnit / test reports** uploaded with `if: always()` — not only green runs.
- **Annotations** — surface file/line from static analysis in PR UI.

## Governance

- **Required status checks** — branch protection; no direct push bypass for protected envs.
- **CODEOWNERS** on `.github/workflows/**` — infrastructure changes reviewed.
- **Separation of duties** — approver for production **environment** ≠ last committer when policy requires.

## Cost governance

- **Cancel superseded runs** — `concurrency`.
- **Skip expensive jobs** — `paths`, `paths-ignore`, draft PR detection.
- **Retention** — artifact TTL; log size limits.

## Audit

Export workflow run metadata (who, what SHA, outcome) for compliance — platform APIs or SIEM — pair **`security-pro`**.
