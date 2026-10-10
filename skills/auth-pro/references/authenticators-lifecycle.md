# Authenticator lifecycle

Separate **account** from **authenticator** (something you know/have/are/prove cryptographically). NIST *Authenticator Assurance* concepts inform policy; implementation details pair with **`security-pro`**.

## Lifecycle operations

| Operation | Risk if wrong |
|-----------|----------------|
| **Enroll / bind** | Attacker enrolls second factor before victim |
| **Activate** — confirm possession | Weak channel → takeover |
| **Replace / rotate** — new phone, new security key | Old factor left active |
| **Revoke** — lost device | Delayed revoke → continued access |
| **Reset** — admin/support | Social engineering into account |

## Factor types (operations vary)

- **Password** — change, reset, breach check — see **`passwords-and-verifiers.md`**.
- **TOTP / OTP app** — backup codes; clock drift support.
- **SMS / email OTP** — weaker; rate-limit; SIM-swap awareness.
- **WebAuthn / passkey** — credential ID stored; backup credentials; RP ID discipline.
- **Hardware keys** — attestation policies if you rely on them for assurance.
- **Recovery codes** — generate, store hashed, single-use, rotate after recovery.

## Lost / stolen device

- Prefer **another strong factor** or **verified human channel** before disabling MFA.
- After reset, **invalidate sessions** and **audit** support actions.

## Review checklist

- [ ] Cannot **disable all factors** without high-assurance path.
- [ ] **Enrollment** requires authenticated session or verified channel.
- [ ] **Replacing** primary MFA invalidates or requires old factor where feasible.
