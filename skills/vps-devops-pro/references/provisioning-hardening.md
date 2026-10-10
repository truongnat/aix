# Provisioning & Hardening

## Base Provisioning Script Pattern

```bash
#!/bin/bash
set -euo pipefail

# Idempotent checks
[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }

# 1. System packages
apt-get update -qq
apt-get install -y -qq curl git openssl ufw fail2ban unattended-upgrades

# 2. Docker (check before install)
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# 3. Docker Compose plugin
if ! docker compose version &>/dev/null; then
  apt-get install -y -qq docker-compose-plugin
fi
```

## SSH Hardening

Edit `/etc/ssh/sshd_config`:

```bash
# Disable password authentication
PasswordAuthentication no
PubkeyAuthentication yes

# Disable root login with password (key-only)
PermitRootLogin prohibit-password

# Limit login attempts
MaxAuthTries 3
LoginGraceTime 30

# Disable unused auth methods
ChallengeResponseAuthentication no
UsePAM yes
```

Apply: `systemctl restart sshd`

**Before disabling passwords:** Ensure your SSH key is already added to `~/.ssh/authorized_keys`.

## Unattended Upgrades

```bash
# Install
apt-get install -y unattended-upgrades

# Enable security updates only
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

# Enable automatic checking
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
```

## Fail2ban

```bash
# Install and enable
apt-get install -y fail2ban
systemctl enable fail2ban

# SSH jail config
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
findtime = 600
EOF

systemctl restart fail2ban
```

## User Management

For production, create a dedicated user:

```bash
# Create deploy user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Copy SSH keys
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

## Swap Space (for low-RAM VPS)

```bash
# Create 2GB swap if none exists
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
```

## Verification Checklist

```bash
# Check SSH config
sshd -t                          # Syntax check
grep PasswordAuthentication /etc/ssh/sshd_config

# Check fail2ban
fail2ban-client status sshd

# Check unattended-upgrades
apt-config dump | grep Periodic

# Check Docker
docker info
docker compose version
```
