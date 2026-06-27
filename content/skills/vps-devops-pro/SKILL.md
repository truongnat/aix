---
name: vps-devops-pro
description: >
  VPS-level operations: server provisioning, hardening, Caddy reverse proxy with
  auto-SSL, UFW firewall, automated backups, deployment automation, and
  monitoring. Covers single-server production patterns.


  Use this skill when setting up a new VPS, configuring reverse proxies,
  managing firewalls, automating backups, provisioning SSL certificates, or
  writing deploy scripts.


  Combine with **`docker-compose-pro`** for container orchestration,
  **`deploy-workflow`** for project-specific deployment.


  Triggers: "VPS", "server", "Caddy", "UFW", "firewall", "certbot", "SSL",
  "backup", "provision", "SSH", "systemd", "cron", "reverse proxy", "Let's
  Encrypt", "hardening", "Ubuntu"
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# VPS DevOps (professional)

Use official [Caddy docs](https://caddyserver.com/docs), [UFW man pages](https://manpages.ubuntu.com/manpages/jammy/man8/ufw.8.html), and [Docker docs](https://docs.docker.com) for API truth; this skill encodes **production-safe provisioning patterns**, **idempotent automation**, and **defense-in-depth security**. Confirm **OS version** (Ubuntu ••••+) and **existing services** on the target VPS.

## Boundary

**`vps-devops-pro`** owns **server-level operations**: provisioning, hardening, reverse proxy, firewall, SSL, backups, and deploy automation. Defers to **`docker-compose-pro`** for container orchestration patterns, and to **`deploy-workflow`** for project-specific deployment procedures.

## When to use

- Setting up a fresh VPS from scratch
- Configuring Caddy as reverse proxy with auto-SSL
- Managing UFW firewall rules
- Writing automated backup scripts with rotation
- Creating deploy scripts (git-pull + rebuild + restart)
- Hardening SSH access
- Setting up systemd services or cron jobs
- Trigger keywords: `VPS`, `server`, `Caddy`, `UFW`, `firewall`, `backup`, `provision`, `SSL`

## When not to use

- **Container orchestration details** — use **`docker-compose-pro`**
- **Kubernetes or cloud-managed services** — not covered (single-VPS scope)
- **Application-level security** (auth, injection) — use **`security-pro`**
- **Project-specific deploy steps** — use **`deploy-workflow`**

## Required inputs

- **Target OS** (Ubuntu ••••+ assumed)
- **Services to expose** (ports, domains)
- **Existing infrastructure** on VPS (other Docker projects, existing Caddy/Nginx)
- **Domain name** and DNS status

## Expected output

1. **Issue or goal** — what server operation is needed
2. **Recommendation** — approach with security considerations
3. **Code** — shell scripts, config files, commands
4. **Residual risks** — what could fail, recovery steps

## Workflow

1. **Confirm** target OS, existing services, ports in use, DNS status. Verify: `uname -a`, `docker ps`, `ss -tlnp`, `dig domain`. State assumptions explicitly (**Think Before Coding**).
2. **Apply** minimum changes to achieve the goal. Use idempotent patterns (check-before-install, IF NOT EXISTS). Only modify what is needed (**Simplicity First**, **Surgical Changes**).
3. **Verify** with health checks: `systemctl status`, `curl`, `ufw status`. Define success criteria before starting (**Goal-Driven Execution**).

### Operating principles

1. **Think Before Coding** — check existing state before changing anything. What is already running? What ports are taken?
2. **Simplicity First** — one script, one purpose. Don't combine provisioning with application deployment.
3. **Surgical Changes** — modify only the specific config/service needed. Don't reset entire firewall for one rule.
4. **Goal-Driven Execution** — every operation ends with a verification step (health check, status command).
5. **Idempotent scripts** — safe to re-run. Use `command -v`, `[ -f ]`, `[ -d ]` checks.
6. **Defense in depth** — firewall + SSH hardening + minimal ports + principle of least privilege.
7. **Automate everything** — if you did it twice manually, script it.
8. **Test recovery** — a backup you have never restored is not a backup.

## Default recommendations by scenario

| Scenario | Recommendation |
|----------|---------------|
| Fresh VPS | Full provisioning script: packages → Docker → firewall → app → proxy → backup cron |
| Add new service | Caddy conf.d site + UFW port rule + Docker service + health check |
| SSL issues | Check DNS A record → Caddy logs → port 80/443 accessible → reload Caddy |
| Backup setup | Cron at low-traffic hour + rotation + offsite copy + test restore |
| Security audit | SSH keys only + UFW deny default + minimal ports + unattended-upgrades |

## Anti-patterns

- **Running everything as root** without service users
- **No firewall** — all ports exposed to internet
- **Manual deployments** — SSH + hand-edit = drift and mistakes
- **Untested backups** — backup exists but never verified restoration works
- **No health checks** — deploy completes but service is actually down

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Provisioning and hardening (summary)

- Base packages: curl, git, openssl, ufw, fail2ban
- SSH: key-only auth, disable password login, change default port (optional)
- Auto-updates: unattended-upgrades for security patches
- User management: dedicated service user, not root for applications

Details: [references/provisioning-hardening.md](references/provisioning-hardening.md)

### Caddy reverse proxy (summary)

- Caddyfile imports `conf.d/*.caddy` for multi-site management
- Each site: `domain.com { reverse_proxy localhost:PORT; encode gzip zstd }`
- Auto-SSL via Let's Encrypt — zero config beyond DNS A record
- Reload: `systemctl reload caddy`

Details: [references/caddy-reverse-proxy.md](references/caddy-reverse-proxy.md)

### Firewall (UFW) (summary)

- Default deny incoming, allow outgoing
- Allow: SSH (22), HTTP (80), HTTPS (443)
- Never expose database ports (••••, ••••, ••••, ••••) to internet
- Rate limiting on SSH: `ufw limit ssh`

Details: [references/firewall-ufw.md](references/firewall-ufw.md)

### Backup automation (summary)

- Cron job at 2AM: dump databases, tar+gz, rotate 7 days
- Verify: test restore periodically
- Offsite: rsync or S3 copy for disaster recovery

Details: [references/backup-automation.md](references/backup-automation.md)

### Deploy strategies (summary)

- Git-pull deploy: `git pull → docker compose build → docker compose up -d --no-deps service`
- Health check after deploy: curl endpoint, check HTTP status
- Rollback: `git checkout previous-commit → rebuild → restart`

Details: [references/deploy-strategies.md](references/deploy-strategies.md)

### Monitoring and logging (summary)

- Docker logs: `docker compose logs -f --tail 100 service`
- Systemd journal: `journalctl -u caddy -f`
- Health endpoints: curl with expected HTTP 200
- Disk space: `df -h`, alert at 80%

Details: [references/monitoring-logging.md](references/monitoring-logging.md)

## Suggested response format (implement / review)

1. **Issue or goal** — what server operation is needed and why
2. **Recommendation** — approach with security and idempotency considerations
3. **Code** — shell commands, scripts, or config files (copy-pasteable)
4. **Residual risks** — what could fail, how to detect, recovery steps

## Resources in this skill

| Topic | File |
|-------|------|
| Provisioning & hardening | [references/provisioning-hardening.md](references/provisioning-hardening.md) |
| Caddy reverse proxy | [references/caddy-reverse-proxy.md](references/caddy-reverse-proxy.md) |
| Firewall (UFW) | [references/firewall-ufw.md](references/firewall-ufw.md) |
| Backup automation | [references/backup-automation.md](references/backup-automation.md) |
| Deploy strategies | [references/deploy-strategies.md](references/deploy-strategies.md) |
| Monitoring & logging | [references/monitoring-logging.md](references/monitoring-logging.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |

## Quick example

**Input:** "Set up Caddy to reverse proxy my API running on port •••• with domain dev.example.com"

**Expected output:**
1. Issue or goal: Route dev.example.com to localhost:•••• with auto-SSL
2. Recommendation: Add Caddy conf.d site file, ensure DNS A record points to VPS, reload Caddy
3. Code:
   ```bash
   cat > /etc/caddy/conf.d/api.caddy << 'EOF'
   dev.example.com {
       reverse_proxy localhost:••••
       encode gzip zstd
   }
   EOF
   systemctl reload caddy
   ```
4. Residual risks: DNS propagation delay (check with `dig`), port •••• must be listening, firewall must allow 80/443

## Checklist before calling the skill done

- [ ] Assumptions stated explicitly; asked when uncertain (Think Before Coding)
- [ ] Started with minimum solution; no speculative complexity (Simplicity First)
- [ ] Only touched code/content directly related to the request (Surgical Changes)
- [ ] Success criteria defined and verified before marking done (Goal-Driven Execution)
- [ ] Scripts are idempotent (safe to re-run)
- [ ] Firewall rules reviewed (no unnecessary ports exposed)
- [ ] Health check included to verify success
- [ ] Backup/rollback plan documented for destructive operations
