# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **CrashLoopBackOff** | Bad image, missing env, migration not run | Pod events; logs | Rollback digest; fix forward; readiness gates — **`edge-cases.md`** |
| **Deploy hangs** | PDB blocks eviction; insufficient quota | `kubectl describe`; pipeline timeout | Relax PDB temporarily (risk); scale quota |
| **Partial regional outage** | Bad canary region only | Region-scoped error budget | Automated rollback trigger; traffic shift |
| **Migration broke prod** | Contract phase skipped | Errors after migrate job | Forward-fix migration; avoid `down` panic — **`postgresql-pro`** |
| **Cannot rollback image** | Registry GC; tag mutated | Missing digest | Pin digests; retention policy |
| **Traffic to wrong version** | Ingress/cache stale | Header/version mismatch | Purge CDN; verify service selector |
| **Secret rotation overlap** | Only one key valid | 401 spikes mid-deploy | Dual-key window — **`edge-cases.md`** |
| **GitOps sync fight** | Manual kubectl + Git drift | Drift alerts | Freeze manual changes; reconcile |
| **Quota / limit burst** | New pods need CPU | Pending pods | Requests/limits tuning; cluster autoscaler |
| **Helm hook failure** | Job timeout | Helm status | Hook deadlines; idempotent hooks |
