# Skill: auth-implementation-patterns
Schema: antigrav.skill@v1

```json
{
  "description": "Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems. Use when implementing auth systems, securing A...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154362,
  "model": "qwen3:8b",
  "name": "auth-implementation-patterns",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "auth-implementation-patterns/SKILL.md",
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
Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems. Use when implementing auth systems, securing A...

## When to Use
- Implementing user authentication systems
- Securing REST or GraphQL APIs
- Adding OAuth2/social login or SSO
- Designing session management or RBAC
- Debugging authentication or authorization issues

## Examples
- Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `auth-implementation-patterns/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Authentication & Authorization Implementation Patterns Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices. ## Use this skill when - Implementing user authentication systems - Securing REST or GraphQL APIs - Adding OAuth2/social login or SSO - Designing session management or RBAC - Debugging authentication or authorization issues ## Do not use this skill when - You only need UI copy or login page styling - The task is infrastructure-only without identity concerns - You cannot change auth policies or credential storage ## Instructions - Define users, tenants, flows, and threat model constraints. - Choose auth strategy (session, JWT, OIDC) and token lifecycle. - Design authorization model and policy enforcement points.

{{input}}
