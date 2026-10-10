# GitHub Actions workflow validation matrix

Use this matrix after the compact workflow when the task involves a high-risk claim. Fixtures must use synthetic identifiers and redacted values. The domain skill produces evidence; `sk-tester` executes tests, `sk-review`/`sk-review-pr` records findings, and `sk-verify-pro` owns the final `pass`/`block`/`defer` decision.

| Scenario | Expected result | Evidence | Failure/limitation | Next owner |
|---|---|---|---|---|
| YAML parse | Workflow parses and resolves referenced actions/jobs before execution. | Parser output and workflow-lint result. | Generated YAML is inspected, not trusted. | sk-tester -> sk-verify-pro |
| Least privilege | Each job receives only required permissions; write access is justified. | Permission diff and review finding. | Broad write-all blocks pass. | sk-review-pr -> sk-verify-pro |
| Fork secrets | Untrusted fork workflows cannot access protected secrets or publish artifacts. | Fork-event fixture and secret-availability assertion. | Never test with real secrets. | sk-security-review -> sk-verify-pro |
| Concurrency | Superseded runs are canceled only where safe; release jobs are serialized. | Concurrency trace and cancellation policy. | Cancellation of migrations requires rollback plan. | sk-review -> sk-verify-pro |
| Matrix failure | A failed matrix leg blocks promotion and reports the exact axis/value. | Matrix run log and required-check result. | Allow-failure must be explicit. | sk-tester -> sk-verify-pro |
| Cache miss/corruption | A cache miss rebuilds safely; corrupted or untrusted cache content is discarded rather than executed. | Cache-hit/miss trace, checksum or provenance result, rebuild log. | Cache behavior is not evidence of dependency integrity without pinning and review. | sk-tester -> sk-verify-pro |
| Artifact retention | Artifacts retain logs/results for the declared investigation window without sensitive files. | Retention config and artifact inventory. | Retention policy is not evidence of secrecy. | sk-review -> sk-verify-pro |
| Pinning/approval | Third-party actions are pinned and protected environments require approval. | Action reference scan and environment policy output. | Floating tags block release evidence. | sk-security-review -> sk-verify-pro |
| Reusable workflow inputs | Required inputs, secrets, and outputs are type-correct, least-privilege, and documented at the caller boundary. | Reusable-workflow invocation fixture, schema/lint result, input/output contract review. | Undeclared defaults or secret forwarding blocks reuse. | sk-review-pr -> sk-verify-pro |
| Rollback | A failed deployment exposes a tested rollback path and preserves the previous artifact. | Rollback run, artifact IDs, post-rollback health check. | No rollback evidence means defer. | sk-deployment-pro -> sk-verify-pro |

## Verification response shape

Return exactly:

- **Claim:** the bounded domain claim being assessed.
- **Criteria:** scenario rows and acceptance thresholds.
- **Evidence:** paths, commands, fixture IDs, timestamps and reviewer findings.
- **Limitations:** untested environments, assumptions, stale inputs or residual risk.
- **Next owner:** `sk-tester`, `sk-review`, `sk-review-pr`, the named domain owner, or `sk-verify-pro`.

Do not claim final release status from this matrix; hand the packet to `sk-verify-pro`.
