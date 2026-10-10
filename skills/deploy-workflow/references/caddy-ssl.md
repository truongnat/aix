# Caddy & SSL Management

Caddy serves as the reverse proxy with automatic HTTPS for dev.truongsoftware.com.

## Configuration

### Main Caddy config

Caddy uses a conf.d pattern for modular site configs:

- Main config: `/etc/caddy/Caddyfile`
- Site config: `/etc/caddy/conf.d/kb.caddy`

The main Caddyfile imports all conf.d files:

```
# /etc/caddy/Caddyfile
{
    email truongdq.dev@gmail.com
}

import /etc/caddy/conf.d/*.caddy
```

### Site configuration

```
# /etc/caddy/conf.d/kb.caddy
dev.truongsoftware.com {
    reverse_proxy localhost:3456

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }

    log {
        output file /var/log/caddy/kb-access.log {
            roll_size 10mb
            roll_keep 5
        }
    }
}
```

## SSL Certificate Management

### How it works

Caddy automatically:
1. Obtains SSL certificates from Let's Encrypt (or ZeroSSL as fallback)
2. Renews certificates 30 days before expiry
3. Handles ACME challenges (HTTP-01 by default)
4. Redirects HTTP to HTTPS

No manual certificate management is needed under normal conditions.

### Check certificate status

```bash
# Check certificate expiry
echo | openssl s_client -connect dev.truongsoftware.com:443 -servername dev.truongsoftware.com 2>/dev/null | openssl x509 -noout -dates

# Check from Caddy's perspective
caddy list-certificates

# Check Caddy certificate storage
ls -la /var/lib/caddy/.local/share/caddy/certificates/
```

### Force certificate renewal

```bash
# Usually not needed, but if certificate is stuck:
systemctl stop caddy
rm -rf /var/lib/caddy/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/dev.truongsoftware.com/
systemctl start caddy
# Caddy will re-obtain the certificate on next request
```

## Common Operations

### Reload configuration (no downtime)

```bash
# After editing any .caddy file:
caddy reload --config /etc/caddy/Caddyfile

# Or via systemd:
systemctl reload caddy
```

### Restart Caddy

```bash
systemctl restart caddy
```

### Check Caddy status

```bash
systemctl status caddy
journalctl -u caddy --since="10 minutes ago"
```

### Validate configuration before applying

```bash
caddy validate --config /etc/caddy/Caddyfile
```

### View access logs

```bash
tail -f /var/log/caddy/kb-access.log

# Filter for errors
grep -E '"status":[45]' /var/log/caddy/kb-access.log | tail -20
```

## Troubleshooting SSL Issues

### Certificate not issuing

**Symptoms:** Browser shows "Not Secure", Caddy logs show ACME errors.

**Checklist:**
1. DNS points to this server: `dig +short dev.truongsoftware.com` should return `62.146.238.102`
2. Port 80 is open (needed for ACME HTTP-01 challenge): `curl -I http://dev.truongsoftware.com`
3. No firewall blocking: `ufw status` or `iptables -L -n | grep 80`
4. Caddy has permission to bind port 80/443

```bash
# Check if port 80 is in use by something else
ss -tlnp | grep :80

# Check Caddy errors
journalctl -u caddy --since="1 hour ago" | grep -i "error\|acme\|challenge"
```

### Certificate expired

This should never happen with Caddy's auto-renewal. If it does:

1. Check Caddy is running: `systemctl status caddy`
2. Check Caddy can reach Let's Encrypt: `curl -I https://acme-v02.api.letsencrypt.org/directory`
3. Check disk space (certificates need writable storage): `df -h /var/lib/caddy/`
4. Force renewal (see above)

### Mixed content or redirect loops

If the API returns HTTP URLs instead of HTTPS:

- Ensure the API trusts the proxy headers. In NestJS, this is usually handled by the `trust proxy` setting.
- Caddy sets `X-Forwarded-Proto: https` automatically for reverse_proxy targets.

### Caddy not routing to API

```bash
# Test internal connectivity
curl -v http://localhost:3456/auth/keys -H "x-master-password: ${MASTER_PASSWORD}"

# If that works but external doesn't, Caddy is the issue
journalctl -u caddy -f  # Watch while making a request

# Common fix: port mismatch in kb.caddy
grep reverse_proxy /etc/caddy/conf.d/kb.caddy
# Should show: reverse_proxy localhost:3456
```

## Adding a New Subdomain

If you need to add another service behind Caddy:

1. Create a new conf file:
```bash
cat > /etc/caddy/conf.d/newservice.caddy << 'EOF'
newservice.truongsoftware.com {
    reverse_proxy localhost:<PORT>
}
EOF
```

2. Validate and reload:
```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

3. Ensure DNS A record points to 62.146.238.102.

## Security Headers

The current config includes:
- `X-Content-Type-Options: nosniff` — Prevents MIME sniffing
- `X-Frame-Options: DENY` — Prevents clickjacking
- `Strict-Transport-Security` — Forces HTTPS for future visits

To add more headers, edit `/etc/caddy/conf.d/kb.caddy` and reload.

## Rate Limiting (if needed)

Caddy supports rate limiting via the `rate_limit` directive (requires the caddy-ratelimit plugin):

```
dev.truongsoftware.com {
    rate_limit {
        zone api {
            key {remote_host}
            events 100
            window 1m
        }
    }
    reverse_proxy localhost:3456
}
```

Install the plugin if needed: rebuild Caddy with `xcaddy build --with github.com/mholt/caddy-ratelimit`.
