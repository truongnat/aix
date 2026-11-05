# MFA, step-up, and phishing-resistant authentication

Use with **`security-pro`** for fraud modeling, lockout policy, and abuse detection.

## Factor categories (conceptual)

| Category | Examples | Notes |
|----------|----------|--------|
| Knowledge | Password, PIN | Susceptible to phishing; still common baseline |
| Possession | TOTP app, SMS, email OTP | SMS/email weaker (SIM swap, inbox compromise) |
| Inherence | Biometrics (local) | Often unlocks a device key, not sent as password |
| Cryptographic proof | **WebAuthn / passkeys**, smart cards | Phishing-resistant when used as **discoverable credentials** with correct RP ID |

## When to require MFA

- **Privileged** accounts (org admin, billing, production deploy).
- **High-value** actions: wire transfer, delete tenant, change IdP/SSO settings.
- **Sensitive data** per policy (health, financial) even for normal users.

## Step-up vs session MFA

- **Session MFA** — user proved MFA at login; session represents that assurance level until expiry or risk event.
- **Step-up** — additional factor **inside** a session for specific routes (re-auth or WebAuthn assertion). Use when **session hijack** or **shared workstation** risk matters.

## Passkeys / WebAuthn (architecture)

- Relying party (**RP ID**) must align with **real origin** — misconfiguration breaks login or enables phishing if users can be tricked to wrong domains (pair with UX and **`security-pro`**).
- Plan **credential backup** / multi-device story (platform vs roaming passkeys) for account recovery — recovery is often the weak link.

## Magic links and OTP email

- Convenient but **email compromise = account access**; shorten link TTL; rate-limit; treat as **single-factor** unless combined with device or MFA policy.

## Recovery and account takeover

- **Separate** auth strength for “change password”, “add MFA”, “disable MFA” — often require fresh MFA or support channel with verification.
- Avoid **SMS as sole** recovery for high-risk accounts when alternatives exist.

## Re-authentication

- Require **current password** or **fresh WebAuthn/TOTP** before: **add/change email**, **add MFA**, **remove MFA**, **change payment instrument**, **export all data**, **delete org**.
- **Session age** alone is a weak signal; combine with **sensitivity of action** and **AAL** target (NIST-style assurance levels at policy level — see official NIST 800-63 for program details).

## Step-up trigger catalog (examples)

| Trigger | Typical step-up |
|---------|-----------------|
| High-value payment or transfer | WebAuthn or fresh TOTP + policy |
| Add admin or change IdP/SSO | Re-auth + maybe out-of-band approval |
| View full PII / health / financial | Policy engine + step-up or role check |
| **Impersonation** start | Audited, time-bounded, second approver if required |
| **API key** creation for production | Re-auth + approval workflow |

## Backup codes and “remember device”

- **Backup codes** — treat like **passwords** (hashed, one-time, rotate set after use).
- **Remember device** — reduce friction for **low-risk** read paths; **never** skip step-up for **privilege** or **money** based on device trust alone.

## Review checklist (quick)

- [ ] MFA required where policy demands it (not only “available”).
- [ ] **Step-up** on sensitive mutations when session alone is insufficient; **re-auth** on account security changes.
- [ ] Privileged roles cannot bypass MFA via alternate legacy endpoints.
- [ ] **Fallback** factors (SMS) not the only path for high-assurance users when better options exist.
