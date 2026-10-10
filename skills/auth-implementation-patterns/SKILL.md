---
name: auth-implementation-patterns
description: Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC to build secure, scalable access control systems. Use when implementing auth systems, securing APIs, or debugging security issues.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "security,testing,reliability"
  roles: "security-engineer,qa-engineer"
  compatible: "claude,cursor,codex,gemini"

---

# Authentication & Authorization Implementation Patterns

## Boundary

**`sk-auth-implementation-patterns`** owns **framework-agnostic authentication and authorization implementation patterns, credential/session safety, and policy enforcement**. It does not own **auth architecture selection as the sole concern, vendor-console administration, or deep penetration testing**; route those concerns to the appropriate specialist skill.


Build secure, scalable authentication and authorization systems using industry-standard patterns and modern best practices.

## When to Use This Skill

- Implementing user authentication systems
- Securing REST or GraphQL APIs
- Adding OAuth2/social login
- Implementing role-based access control (RBAC)
- Designing session management
- Migrating authentication systems
- Debugging auth issues
- Implementing SSO or multi-tenancy

For regression planning, use `references/auth-regression-matrix.md` and record clock assumptions, invalidation results, audit events, and redaction evidence.

## Core Concepts

### 1. Authentication vs Authorization

**Authentication (AuthN)**: Who are you?

- Verifying identity (username/password, OAuth, biometrics)
- Issuing credentials (sessions, tokens)
- Managing login/logout

**Authorization (AuthZ)**: What can you do?

- Permission checking
- Role-based access control (RBAC)
- Resource ownership validation
- Policy enforcement

### 2. Authentication Strategies

**Session-Based:**

- Server stores session state
- Session ID in cookie
- Traditional, simple, stateful

**Token-Based (JWT):**

- Stateless, self-contained
- Scales horizontally
- Can store claims

**OAuth2/OpenID Connect:**

- Delegate authentication
- Social login (Google, GitHub)
- Enterprise SSO

## Detailed patterns and worked examples

Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Never Store Plain Passwords**: Always hash with bcrypt/argon2
2. **Use HTTPS**: Encrypt data in transit
3. **Short-Lived Access Tokens**: 15-30 minutes max
4. **Secure Cookies**: httpOnly, secure, sameSite flags
5. **Validate All Input**: Email format, password strength
6. **Rate Limit Auth Endpoints**: Prevent brute force attacks
7. **Implement CSRF Protection**: For session-based auth
8. **Rotate Secrets Regularly**: JWT secrets, session secrets
9. **Log Security Events**: Login attempts, failed auth
10. **Use MFA When Possible**: Extra security layer

## Common Pitfalls

- **Weak Passwords**: Enforce strong password policies
- **JWT in localStorage**: Vulnerable to XSS, use httpOnly cookies
- **No Token Expiration**: Tokens should expire
- **Client-Side Auth Checks Only**: Always validate server-side
- **Insecure Password Reset**: Use secure tokens with expiration
- **No Rate Limiting**: Vulnerable to brute force
- **Trusting Client Data**: Always validate on server

## Output

Produce a reusable auth implementation patterns artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## When not to use

- When the request is outside `sk-auth-implementation-patterns`'s boundary or another specialist is the primary owner.
- When the user needs an attestation, exploit authorization, or production claim that requires separate human approval or evidence.

## Required inputs

- actors, client types, trust boundaries, credential model, framework, and assurance requirements.

## Cross-skill handoffs

- sk-auth-pro for architecture; sk-api-security-pro and sk-security-pro for abuse controls; stack skills for framework wiring; sk-testing-pro for auth regression.
