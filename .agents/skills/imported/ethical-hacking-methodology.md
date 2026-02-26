# Skill: ethical-hacking-methodology
Schema: antigrav.skill@v1

```json
{
  "description": "This skill should be used when the user asks to \\\"learn ethical hacking\\\", \\\"understand penetration testing lifecycle\\\", \\\"perform reconnaissance\\\", \\\"conduct security scanning\\\", \\\"exploit ...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154377,
  "model": "qwen3:8b",
  "name": "ethical-hacking-methodology",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "ethical-hacking-methodology/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
This skill should be used when the user asks to \"learn ethical hacking\", \"understand penetration testing lifecycle\", \"perform reconnaissance\", \"conduct security scanning\", \"exploit ...

## When to Use
- Use when the task matches this skill domain.

## Examples
- # WHOIS lookup
whois target.com

# DNS enumeration
nslookup target.com
dig target.com ANY
dig target.com MX
dig target.com NS

# Subdomain discovery
dnsrecon -d target.com

# Email harvesting
theHarvester -d target.com -b all
- # Find exposed files
site:target.com filetype:pdf
site:target.com filetype:xls
site:target.com filetype:doc

# Find login pages
site:target.com inurl:login
site:target.com inurl:admin

# Find directory listings
site:target.com intitle:"index of"

# Find configuration files
site:target.com filetype:config
site:target.com filetype:env
- # Ping sweep
nmap -sn 192.168.1.0/24

# ARP scan (local network)
arp-scan -l

# Discover live hosts
nmap -sP 192.168.1.0/24

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `ethical-hacking-methodology/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Ethical Hacking Methodology ## Purpose Master the complete penetration testing lifecycle from reconnaissance through reporting. This skill covers the five stages of ethical hacking methodology, essential tools, attack techniques, and professional reporting for authorized security assessments. ## Prerequisites ### Required Environment - Kali Linux installed (persistent or live) - Network access to authorized targets - Written authorization from system owner ### Required Knowledge - Basic networking concepts - Linux command-line proficiency - Understanding of web technologies - Familiarity with security concepts ## Outputs and Deliverables 1. **Reconnaissance Report** - Target information gathered 2. **Vulnerability Assessment** - Identified weaknesses 3. **Exploitation Evidence** - Proof

{{input}}
