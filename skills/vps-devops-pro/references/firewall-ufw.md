# Firewall (UFW)

## Default Setup

```bash
# Reset to clean state (idempotent start)
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Essential rules
ufw allow ssh          # Port 22
ufw allow 80/tcp       # HTTP (for Caddy ACME)
ufw allow 443/tcp      # HTTPS

# Optional: rate limit SSH
ufw limit ssh          # Max 6 connections in 30 seconds

# Enable
ufw --force enable
```

## Common Rules

```bash
# Allow specific port
ufw allow 3456/tcp

# Allow from specific IP only
ufw allow from 192.168.1.100 to any port 7474

# Allow subnet
ufw allow from 10.0.0.0/24

# Deny specific port (explicit)
ufw deny 6379/tcp

# Delete a rule
ufw delete allow 3456/tcp

# Status with rule numbers
ufw status numbered
```

## Port Exposure Strategy

### Expose to Internet
- 22 (SSH) — with rate limiting
- 80 (HTTP) — required for Let's Encrypt ACME
- 443 (HTTPS) — main traffic

### NEVER Expose to Internet
- 7474/7687 (Neo4j) — admin interface, no auth by default
- 6379/6380 (Redis) — no encryption, password only
- 7700 (Meilisearch) — master key auth but no encryption
- 5432 (PostgreSQL) — use SSH tunnel if remote access needed
- 27017 (MongoDB) — same

### Internal Only (Docker handles internally)
Docker containers communicate via bridge network. Host firewall doesn't affect container-to-container traffic. Only host port mappings are affected by UFW.

## Checking Status

```bash
# Full status
ufw status verbose

# Numbered list (for deletion)
ufw status numbered

# Application profiles
ufw app list

# Check if enabled
ufw status | head -1
```

## UFW with Docker Caveat

Docker modifies iptables directly, bypassing UFW. Published ports (`-p HOST:CONTAINER`) are accessible even if UFW denies them.

**Mitigation:**
1. Don't publish ports you don't want exposed: remove `ports:` from docker-compose.yml for internal services
2. Or bind to localhost only: `"127.0.0.1:7474:7474"`
3. Or use Docker's `DOCKER-USER` chain (advanced)

## Troubleshooting

| Issue | Command | Fix |
|-------|---------|-----|
| Locked out of SSH | Use VPS console | `ufw allow ssh` from console |
| Can't reach HTTPS | `ufw status` | `ufw allow 443/tcp` |
| Docker port exposed despite UFW | `docker ps` | Remove port mapping or bind to 127.0.0.1 |
| UFW not starting | `systemctl status ufw` | `systemctl enable ufw && ufw --force enable` |
