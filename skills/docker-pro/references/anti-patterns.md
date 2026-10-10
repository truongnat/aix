# Docker — anti-patterns

1. **Root user in production** — Container escape and write exploits are worse; use `USER` and non-root UIDs.

2. **Secrets in `ARG` / image env** — Visible in `docker history` and registries; use BuildKit secrets and runtime env from orchestrator.

3. **`COPY . .` before dependency install** — Destroys layer cache; copy lockfiles first, install, then copy source.

4. **Missing `.dockerignore`** — Sends `node_modules`, `.git`, and secrets context; slower builds and leak risk.

5. **No `HEALTHCHECK` for long-running services** — Orchestrators cannot detect stuck processes.

6. **Installing `apt` packages in separate `RUN` layers without cleanup** — Bloats image; chain `apt-get update && install && rm -rf /var/lib/apt/lists`.

7. **Using `latest` tags in production** — Non-reproducible deploys; pin digests or semver tags.

8. **PID 1 without signal handling** — Node/Java as PID 1 may not reap zombies; use `tini` or `dumb-init` when needed.

9. **Development-only Compose files in prod** — Exposed ports, debug envs; use override files and separate prod compose.

10. **Huge context uploads to remote builders** — Trim context; use `.dockerignore` aggressively.

When NOT to containerize: one-shot CLI tools with no server benefit may be simpler as native binaries in CI.
