# Authentication and authorization — trust and session model

## Contents

1. [Actors and trust boundaries](#actors-and-trust-boundaries)
2. [Credential classes](#credential-classes)
3. [Authorization enforcement surface](#authorization-enforcement-surface)
4. [Lifecycle states](#lifecycle-states)

Pair with **[authentication-methods-and-selection.md](authentication-methods-and-selection.md)** and **[token-session-lifecycle.md](token-session-lifecycle.md)**.

---

## Actors and trust boundaries

Browser, BFF, API gateway, IdP, and datastore sit in different **trust zones** — **`client-platform-matrix.md`**.

---

## Credential classes

Sessions, JWTs, opaque tokens, mTLS, API keys differ in **revocation**, **storage**, and **CSRF** posture — **`decision-tree.md`**.

---

## Authorization enforcement surface

**Server-side** checks on every mutation; **never** trust client-only role UI — **`authorization-models-and-policy.md`**.

---

## Lifecycle states

Issued → active → rotated/revoked → logged out; **recovery** and **break-glass** are explicit branches — **`identity-account-lifecycle.md`**, **`account-recovery-breakglass.md`**.
