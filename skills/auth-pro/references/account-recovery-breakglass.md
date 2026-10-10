# Account recovery and break-glass

High-risk paths; majority of real-world compromises use **recovery** or **support** lanes. Pair with **`security-pro`**.

## User self-service recovery

- **Forgot password** — see **`passwords-and-verifiers.md`**.
- **Lost MFA device** — verify via **backup codes**, **second channel**, or **support** with identity proof.
- **Recovery codes** — store **hashed**; **rotate** after use; count remaining.

## High-assurance recovery

- Delayed recovery, video KYC, or in-person — for financial or regulated contexts.

## Support-assisted

- **MFA reset** by support is a **takeover vector** — require strong internal auth, ticket linkage, optional user callback.
- Log **who** performed **what** on **which** account.

## Break-glass / emergency

- **Break-glass admin** — time-bounded; **dual control** where possible; **mandatory post-incident review**.
- Distinct from normal admin — separate role and audit stream.

## Review checklist

- [ ] No **single weak channel** (e.g. SMS alone) for high-risk account recovery.
- [ ] **Support reset** paths are **audited** and **rate-limited** internally.
- [ ] **Break-glass** access cannot become **persistent** without review.
