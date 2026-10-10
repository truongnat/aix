# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Wrong wheel ABI** | Built on OS ≠ target | Install fails on user machine | manylinux/cibuildwheel; test matrix — **`edge-cases.md`** |
| **Huge Docker context** | Missing `.dockerignore` | Slow CI; giant tar | `.dockerignore`; context audit |
| **Secret in layer / build log** | `ARG`/`ENV` misuse | scanners; image history | BuildKit secrets; no secrets in final stage — **`anti-patterns.md`** |
| **Publish partial / retry** | Network flake mid-upload | Broken index state | Idempotent workflows; verify artifact listing |
| **Trusted publishing mis-OIDC** | Audience/sub mismatch | Auth failure in job | Align workflow + registry trust — **`security-pro`** |
| **Cache restores wrong deps** | Bad cache key | Nondeterministic CI | Key on lockfile hash — **`github-actions-and-ci.md`** |
| **Fork PR exfiltration** | Workflow uses secrets on untrusted code | Secret scanning | OIDC only on tag/main; no secrets on fork builds |
| **Unpinned base image drift** | `latest` label moves | Sudden breakage | Digest pin — **`versions.md`** |
| **PEP 668 / extern-managed-environment** | System Python blocked `pip install` | CI fails on Debian/Ubuntu images | Use venv in Docker/CI or official Python image |
