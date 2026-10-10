# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Cache always cold** | `COPY . .` before deps; fat context | `--progress=plain`; build time flat across commits | Order `COPY` lockfiles → install → source; slim context — **`image-optimization.md`** |
| **Secret in layer/history** | `ARG`/`ENV` for secrets; copied files | `docker history`; SBOM scanners | BuildKit `--secret`; runtime secrets only — **`edge-cases.md`** |
| **SIGTERM hang** | PID 1 ignores signals | Stop timeout exceeded | `tini`/`dumb-init` or app handlers — **`edge-cases.md`** |
| **Wrong libc / arch** | Alpine musl vs glibc wheels; ARM vs AMD | Crash at import or exec | Match base to wheels; `buildx` platforms — **`decision-tree.md`** |
| **Volume permission denied** | Bind mount UID mismatch | EACCES on writes | Align UID/GID or named volume — **`edge-cases.md`** |
| **OOM / ulimits** | JVM/Node heap vs cgroup limit | Exit 137; logs | Tune heap; compose `deploy.resources` / K8s limits |
| **Compose race** | `depends_on` without health | Intermittent connection refused | `condition: service_healthy` — **`compose.md`** |
| **Disk exhaustion** | Layer/cache growth | Daemon errors | Prune policy; CI cache retention — **`tips-and-tricks.md`** |
| **`latest` drift** | Tag moved | Prod != tested | Pin by digest in deploy — **`deployment-pro`**, **`versions.md`** |
