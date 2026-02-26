# Skill: api-fuzzing-bug-bounty
Schema: antigrav.skill@v1

```json
{
  "description": "This skill should be used when the user asks to \\\"test API security\\\", \\\"fuzz APIs\\\", \\\"find IDOR vulnerabilities\\\", \\\"test REST API\\\", \\\"test GraphQL\\\", \\\"API penetration testing\\\", \\\"bug b...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154354,
  "model": "qwen3:8b",
  "name": "api-fuzzing-bug-bounty",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "api-fuzzing-bug-bounty/SKILL.md",
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
This skill should be used when the user asks to \"test API security\", \"fuzz APIs\", \"find IDOR vulnerabilities\", \"test REST API\", \"test GraphQL\", \"API penetration testing\", \"bug b...

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Check for Swagger/OpenAPI documentation
/swagger.json
/openapi.json
/api-docs
/v1/api-docs
/swagger-ui.html

# Use Kiterunner for API discovery
kr scan https://target.com -w routes-large.kite

# Extract paths from Swagger
python3 json2paths.py swagger.json
- # Test different login paths
/api/mobile/login
/api/v3/login
/api/magic_link
/api/admin/login

# Check rate limiting on auth endpoints
# If no rate limit → brute force possible

# Test mobile vs web API separately
# Don't assume same security controls
- # Basic IDOR
GET /api/users/1234 → GET /api/users/1235

# Even if ID is email-based, try numeric
/?user_id=111 instead of /?user_id=user@mail.com

# Test /me/orders vs /user/654321/orders

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `api-fuzzing-bug-bounty/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# API Fuzzing for Bug Bounty ## Purpose Provide comprehensive techniques for testing REST, SOAP, and GraphQL APIs during bug bounty hunting and penetration testing engagements. Covers vulnerability discovery, authentication bypass, IDOR exploitation, and API-specific attack vectors. ## Inputs/Prerequisites - Burp Suite or similar proxy tool - API wordlists (SecLists, api_wordlist) - Understanding of REST/GraphQL/SOAP protocols - Python for scripting - Target API endpoints and documentation (if available) ## Outputs/Deliverables - Identified API vulnerabilities - IDOR exploitation proofs - Authentication bypass techniques - SQL injection points - Unauthorized data access documentation --- ## API Types Overview | Type | Protocol | Data Format | Structure | |------|----------|-------------|--

{{input}}
