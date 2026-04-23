# Quality validation and guardrails (API design)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [Spec alignment](#spec-alignment)
3. [Security pairing](#security-pairing)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Do **not** invent **HTTP status** semantics or header names — cite **RFC 9110** / OpenAPI — **`versions.md`**.

---

## Spec alignment

- Example payloads should match **declared** schema and **null** vs omitted policy — **`tips-and-tricks.md`**.

---

## Security pairing

AuthZ on **every** sensitive action belongs with **`security-pro`** — this skill states **contract** hooks (scopes, audience).

---

## Review checklist

- [ ] Idempotency story for mutating endpoints — **`mutation-semantics-and-concurrency.md`**.
- [ ] Breaking vs additive change classified — **`versions.md`**.
- [ ] Consistency class documented — **`consistency-and-conflicts.md`**.
