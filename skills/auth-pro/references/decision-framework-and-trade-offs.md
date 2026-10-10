# Decision framework and trade-offs (auth)

## Contents

1. [Session vs bearer](#session-vs-bearer)
2. [BFF vs public SPA tokens](#bff-vs-public-spa-tokens)
3. [RBAC vs ABAC vs ReBAC](#rbac-vs-abac-vs-rebac)
4. [MFA friction vs assurance](#mfa-friction-vs-assurance)

See **`decision-tree.md`** for selection trees.

---

## Session vs bearer

Cookies enable **HttpOnly** session but need **CSRF** strategy; bearer simplifies mobile but **XSS** risk shifts — **`oauth-oidc-patterns.md`**, **`session-management.md`**.

---

## BFF vs public SPA tokens

BFF improves **token storage** posture at cost of **extra hop** — **`authentication-methods-and-selection.md`**.

---

## RBAC vs ABAC vs ReBAC

RBAC is operable; ABAC/ReBAC add expressiveness and **audit** complexity — **`authorization-models-and-policy.md`**.

---

## MFA friction vs assurance

Step-up MFA balances **UX** vs **risk** for sensitive actions — **`mfa-and-assurance.md`**.
