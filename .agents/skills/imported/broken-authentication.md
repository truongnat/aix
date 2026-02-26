# Skill: broken-authentication
Schema: antigrav.skill@v1

```json
{
  "description": "This skill should be used when the user asks to \\\"test for broken authentication vulnerabilities\\\", \\\"assess session management security\\\", \\\"perform credential stuffing tests\\\", \\\"evaluate ...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154364,
  "model": "qwen3:8b",
  "name": "broken-authentication",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "broken-authentication/SKILL.md",
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
This skill should be used when the user asks to \"test for broken authentication vulnerabilities\", \"assess session management security\", \"perform credential stuffing tests\", \"evaluate ...

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Identify authentication type
- Password-based (forms, basic auth, digest)
- Token-based (JWT, OAuth, API keys)
- Certificate-based (mutual TLS)
- Multi-factor (SMS, TOTP, hardware tokens)

# Map authentication endpoints
/login, /signin, /authenticate
/register, /signup
/forgot-password, /reset-password
/logout, /signout
/api/auth/*, /oauth/*
- POST /login HTTP/1.1
Host: target.com
Content-Type: application/x-www-form-urlencoded

username=test&password=test123
- # Test minimum length (a, ab, abcdefgh)
# Test complexity (password, password1, Password1!)
# Test common weak passwords (123456, password, qwerty, admin)
# Test username as password (admin/admin, test/test)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `broken-authentication/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Broken Authentication Testing ## Purpose Identify and exploit authentication and session management vulnerabilities in web applications. Broken authentication consistently ranks in the OWASP Top 10 and can lead to account takeover, identity theft, and unauthorized access to sensitive systems. This skill covers testing methodologies for password policies, session handling, multi-factor authentication, and credential management. ## Prerequisites ### Required Knowledge - HTTP protocol and session mechanisms - Authentication types (SFA, 2FA, MFA) - Cookie and token handling - Common authentication frameworks ### Required Tools - Burp Suite Professional or Community - Hydra or similar brute-force tools - Custom wordlists for credential testing - Browser developer tools ### Required Access - T

{{input}}
