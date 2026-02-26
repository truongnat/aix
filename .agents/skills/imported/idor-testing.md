# Skill: idor-testing
Schema: antigrav.skill@v1

```json
{
  "description": "This skill should be used when the user asks to \\\"test for insecure direct object references,\\\" \\\"find IDOR vulnerabilities,\\\" \\\"exploit broken access control,\\\" \\\"enumerate user IDs or obje...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154382,
  "model": "qwen3:8b",
  "name": "idor-testing",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "idor-testing/SKILL.md",
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
This skill should be used when the user asks to \"test for insecure direct object references,\" \"find IDOR vulnerabilities,\" \"exploit broken access control,\" \"enumerate user IDs or obje...

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Original URL (authenticated as User A)
example.com/user/profile?id=2023

# Manipulation attempt (accessing User B's data)
example.com/user/profile?id=2022
- # Original URL (User A's receipt)
example.com/static/receipt/205.pdf

# Manipulation attempt (User B's receipt)
example.com/static/receipt/200.pdf
- Account 1: "attacker" - Primary testing account
Account 2: "victim" - Account whose data we attempt to access

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `idor-testing/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# IDOR Vulnerability Testing ## Purpose Provide systematic methodologies for identifying and exploiting Insecure Direct Object Reference (IDOR) vulnerabilities in web applications. This skill covers both database object references and static file references, detection techniques using parameter manipulation and enumeration, exploitation via Burp Suite, and remediation strategies for securing applications against unauthorized access. ## Inputs / Prerequisites - **Target Web Application**: URL of application with user-specific resources - **Multiple User Accounts**: At least two test accounts to verify cross-user access - **Burp Suite or Proxy Tool**: Intercepting proxy for request manipulation - **Authorization**: Written permission for security testing - **Understanding of Application Flow

{{input}}
