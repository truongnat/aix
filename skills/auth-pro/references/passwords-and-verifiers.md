# Passwords and verifier handling

Architecture and review checklist — **algorithm selection**, **secret storage**, and **reset flows**. Pair with **`security-pro`** for credential-stuffing defenses and regulatory wording.

## Verifier storage (server)

- Use **modern password hashing** (memory-hard parameters appropriate to your hardware); tune cost; avoid deprecated algorithms for new systems.
- **Salt per password** — mandatory; **pepper** (optional global secret) adds defense-in-depth if rotation story exists.
- Store **never** plaintext; compare with **constant-time** APIs provided by crypto libraries.

## Password policy (high level)

- Prefer **length over complexity theater**; block **breached/common** lists where feasible (Have IBeenPwned-style integration at signup/change).
- Discourage **password reuse** across your product vs consumer reuse — communicate risk.
- **Change password** flows should require **current password** or fresh MFA where risk demands.

## Reset and recovery

- **Forgot password** — single-use tokens; short TTL; rate limits; same notification channels as security alerts.
- Never leak **whether email exists** if product policy requires it — balance UX vs enumeration (document trade-off).
- After reset — **invalidate other sessions** depending on threat model.

## Operational prohibitions

- No passwords or tokens in **logs**, **URLs**, **referrers**, or **error messages**.
- Admin/support **must not** read plaintext passwords — only trigger reset flows.

## Review checklist

- [ ] Hashing parameters reviewed for current hardware.
- [ ] Reset tokens are **single-use**, **short-lived**, **rate-limited**.
- [ ] Verification compares secrets with **timing-safe** primitives only.
