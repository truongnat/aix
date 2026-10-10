# Security — controls, trust boundaries, and system model

## Contents

1. [Trust boundaries](#trust-boundaries)
2. [CIA and priorities](#cia-and-priorities)
3. [Prevent, detect, respond](#prevent-detect-respond)
4. [Defense in depth](#defense-in-depth)
5. [Where truth lives](#where-truth-lives)

Pair with **[fundamentals-and-threat-model.md](fundamentals-and-threat-model.md)** for STRIDE-style decomposition.

---

## Trust boundaries

A **trust boundary** is where data or control crosses actors with **different privilege** (browser ↔ API, API ↔ DB, service ↔ cloud metadata, CI ↔ untrusted PR).

**Controls attach at boundaries** — validation, authn, authz, TLS, encoding, rate limits — **`attack-techniques-and-methods.md`** maps attacker moves to layers.

---

## CIA and priorities

| Goal | Examples |
|------|----------|
| **Confidentiality** | TLS, encryption at rest, least-privilege IAM |
| **Integrity** | Signatures, HMAC on webhooks, immutable audit logs |
| **Availability** | Rate limits, backoff, DDoS-aware edge |

Threat modeling picks **which CIA dimension** breaks first for your asset — **`fundamentals-and-threat-model.md`**.

---

## Prevent, detect, respond

- **Prevent** — default deny, input validation, safe defaults.
- **Detect** — logging with redaction, alerts on auth anomalies, WAF where appropriate.
- **Respond** — IR playbooks, credential rotation, containment.

No single layer is sufficient — **`failure-modes-detection-mitigation.md`**.

---

## Defense in depth

Assume **any layer can fail** (bug, misconfig, stolen laptop). Combine **network** (segmentation), **identity** (MFA), **application** (authz), **data** (RLS), and **operations** (patching, scanning) — **`osi-and-networking.md`** for network placement.

---

## Where truth lives

**Authorization and business invariants** must hold where the attacker cannot bypass: **server-side** API, **database** policies (RLS), **gateway** when used as enforcement point — not only UI — **`anti-patterns.md`**.
