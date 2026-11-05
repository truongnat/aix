# Failure modes — detection and mitigation (auth)

## Contents

1. [Token leakage](#token-leakage)
2. [Weak or missing authz](#weak-or-missing-authz)
3. [Session fixation and CSRF](#session-fixation-and-csrf)
4. [Refresh token reuse](#refresh-token-reuse)

Pair with **`token-session-lifecycle.md`**, **`threat-controls-mapping.md`**.

---

## Token leakage

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Logs / referrers** | Secrets in access logs | Redact; short-lived tokens — **`tips-and-tricks.md`** |

---

## Weak or missing authz

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **IDOR** | Cross-tenant access | Server checks + tests — **`authorization-architecture-review.md`**, **`testing-pro`** |

---

## Session fixation and CSRF

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Cookie session without CSRF** | State-changing forgery | CSRF tokens / SameSite — **`session-management.md`** |

---

## Refresh token reuse

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Replayed refresh** | Anomaly alerts | Rotation + reuse detection — **`token-session-lifecycle.md`** |
