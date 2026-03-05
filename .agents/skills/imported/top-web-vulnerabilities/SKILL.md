# Skill: top-web-vulnerabilities
Schema: antigrav.skill@v1

```json
{
  "description": "This skill should be used when the user asks to \\\"identify web application vulnerabilities\\\", \\\"explain common security flaws\\\", \\\"understand vulnerability categories\\\", \\\"learn about inject...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154406,
  "model": "qwen3:8b",
  "name": "top-web-vulnerabilities",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "top-web-vulnerabilities/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported",
    "security",
    "top",
    "vulnerabilities",
    "web"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
This skill should be used when the user asks to \"identify web application vulnerabilities\", \"explain common security flaws\", \"understand vulnerability categories\", \"learn about inject...

## When to Use
- Use when the task matches this skill domain.

## Examples
- Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=()

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `top-web-vulnerabilities/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Top 100 Web Vulnerabilities Reference ## Purpose Provide a comprehensive, structured reference for the 100 most critical web application vulnerabilities organized by category. This skill enables systematic vulnerability identification, impact assessment, and remediation guidance across the full spectrum of web security threats. Content organized into 15 major vulnerability categories aligned with industry standards and real-world attack patterns. ## Prerequisites - Basic understanding of web application architecture (client-server model, HTTP protocol) - Familiarity with common web technologies (HTML, JavaScript, SQL, XML, APIs) - Understanding of authentication and authorization concepts - Access to web application security testing tools (Burp Suite, OWASP ZAP) - Knowledge of secure cod

{{input}}
