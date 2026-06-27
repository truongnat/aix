# Decision framework and trade-offs (security)

## Contents

1. [Session cookies vs bearer tokens (web)](#session-cookies-vs-bearer-tokens-web)
2. [RLS vs application-only authz](#rls-vs-application-only-authz)
3. [Strict CSP vs third-party scripts](#strict-csp-vs-third-party-scripts)
4. [Certificate pinning](#certificate-pinning)
5. [Depth vs velocity](#depth-vs-velocity)

Use **`decision-tree.md`** for token storage and IDOR branches.

---

## Session cookies vs bearer tokens (web)

| Lean **HttpOnly session cookie** | Lean **bearer (API/mobile)** |
|----------------------------------|------------------------------|
| First-party web with same-site model | SPAs with API-only backends; mobile native |

**Trade-off:** cookies need **CSRF** strategy; bearer in browser needs **XSS** discipline — **`decision-tree.md`**, **`nextjs-pro`**.

---

## RLS vs application-only authz

| Add **RLS** | App-only checks |
|-------------|-----------------|
| Multi-tenant SaaS, defense in depth, compliance | Single-tenant with trusted monolith |

**Trade-off:** RLS complexity and perf vs bypass risk — **`postgresql-pro`**.

---

## Strict CSP vs third-party scripts

Stricter **CSP** reduces XSS blast radius but can **break** analytics, payment widgets, or A/B scripts — document **nonce/hash** policy and exceptions — **`nextjs-pro`**.

---

## Certificate pinning

Pins reduce **MITM** risk for mobile but **break** on cert rotation mistakes — operational burden — **`edge-cases.md`**.

---

## Depth vs velocity

Heavy gates (manual pen-test every PR) **slow** shipping; lightweight **SAST/SCA + abuse-case tests** give faster feedback — balance per risk — **`offensive-simulation-and-self-assessment.md`**.
