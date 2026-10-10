# Failure modes — detection and mitigation

| What breaks | Why | How to detect | Mitigation |
|-------------|-----|---------------|------------|
| **Hosted runner starvation** | Queue depth, org limits | Pending jobs spike; SLA on “time to start” | Self-hosted pool; trim matrix; priority labels |
| **Bad cache restore** | Wrong key or poisoned tarball | Wrong lockfile resolved; nondeterministic builds | Key on `hashFiles(lock)`; `fail-on-cache-miss` where supported; periodic cache bust |
| **Fork PR secret leak** | Workflow uses secrets on untrusted code | Audit `pull_request` vs `pull_request_target`; secret scanning alerts | No secrets on fork builds; `workflow_run` from trusted default branch |
| **OIDC auth fails** | Audience/subject mismatch | CloudTrail / IAM deny logs; opaque 403 in step | Align trust policy with `sub` claim; document audience |
| **Green CI, broken prod** | Weak gates; prod-only bugs | Post-deploy error spike; synthetic checks | Contract tests; smoke after deploy; canary — **`deployment-strategies.md`** |
| **Upload artifact OOM / timeout** | Huge reports | Step fails at end of long job | Trim logs; split artifacts; retention policies |
| **Rate limits** | npm/Docker/GitHub API | Intermittent 429 in logs | Auth to registries; mirrors; exponential backoff |
| **Flaky tests pass eventually** | Retries hide defects | Same test fails randomly | Quarantine; fix root — **`testing-pro`** |
| **Migration runs twice** | Double deploy from two branches | DB constraint violations in prod | Leader election for migrate job; migration idempotency — **`postgresql-pro`** |
| **Pinned action gone** | Upstream force-push (rare) or SHA invalid | Checkout step fails | Vendor critical actions; mirror org |
| **Clock skew** | Runner NTP drift | JWT / signed URL failures | Managed runners; short-lived tokens |
| **Workflow disabled** | Inactive repo (`schedule`) | Silent absence of nightly jobs | Monitoring on expected schedules |

## Blast radius

Treat pipeline **write** credentials as **production-powerful** — compromise = deploy arbitrary code — **`secrets-security.md`**.
