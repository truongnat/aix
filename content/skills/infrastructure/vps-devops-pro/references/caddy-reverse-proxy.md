# Caddy Reverse Proxy

## Why Caddy

- **Zero-config SSL**: auto-provisions Let's Encrypt certs, auto-renews
- **Simple config**: 3 lines for a full reverse proxy with HTTPS
- **HTTP/2 and HTTP/3** out of the box
- **No certbot cron** needed
- **Graceful reload**: `systemctl reload caddy` — no downtime

## Installation

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

## Multi-Site Pattern (conf.d)

Main Caddyfile imports a directory:

```bash
# /etc/caddy/Caddyfile
import /etc/caddy/conf.d/*.caddy
```

Each site gets its own file:

```bash
# /etc/caddy/conf.d/kb.caddy
dev.truongsoftware.com {
    reverse_proxy localhost:3456
    encode gzip zstd
}

# /etc/caddy/conf.d/portfolio.caddy
portfolio.example.com {
    reverse_proxy localhost:3000
    encode gzip zstd
}
```

## Common Configurations

### Basic reverse proxy
```
domain.com {
    reverse_proxy localhost:PORT
}
```

### With compression
```
domain.com {
    reverse_proxy localhost:PORT
    encode gzip zstd
}
```

### With custom headers
```
domain.com {
    reverse_proxy localhost:PORT
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }
}
```

### With path-based routing
```
domain.com {
    handle /api/* {
        reverse_proxy localhost:3456
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

### HTTP-only (no SSL, for internal)
```
:8080 {
    reverse_proxy localhost:3456
}
```

## Operations

```bash
# Reload config (no downtime)
systemctl reload caddy

# Check config syntax
caddy validate --config /etc/caddy/Caddyfile

# View logs
journalctl -u caddy -f

# Check certificate status
caddy trust    # Trust local CA (dev only)

# Restart (if reload fails)
systemctl restart caddy

# Status
systemctl status caddy
```

## SSL Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Certificate not provisioning | DNS not pointing to VPS | Check `dig domain.com` returns VPS IP |
| ACME challenge failing | Port 80 blocked | `ufw allow 80/tcp` |
| ERR_SSL_PROTOCOL_ERROR | Port 443 blocked | `ufw allow 443/tcp` |
| Too many requests | Let's Encrypt rate limit | Wait 1 hour, check staging first |
| Certificate expired | Caddy not running | `systemctl start caddy` |

## Prerequisites for Auto-SSL

1. DNS A record pointing domain to VPS IP: `dig +short domain.com` → `VPS_IP`
2. Ports 80 AND 443 open in firewall
3. Caddy running: `systemctl status caddy`
4. No other service on port 80/443 (no nginx, no apache)

## Caddy vs Nginx

| Feature | Caddy | Nginx |
|---------|-------|-------|
| SSL setup | Automatic | Manual (certbot + cron) |
| Config syntax | Simple | Complex |
| Reload | Graceful | Graceful |
| Performance | Good | Slightly better at high scale |
| HTTP/3 | Built-in | Requires module |
| Community | Growing | Massive |

**Recommendation:** Use Caddy for single-VPS setups. Consider Nginx only at high scale (10k+ req/s) or when you need specific Nginx modules.
