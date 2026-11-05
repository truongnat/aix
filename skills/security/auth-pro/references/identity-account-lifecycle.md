# Identity and account lifecycle

Architecture-level concerns for **accounts** (distinct from **authenticators** and **sessions**). Align lifecycle policy with **`security-pro`** (abuse, privacy) and stack skills for implementation.

## Stages and events

| Phase | Design questions |
|-------|------------------|
| **Registration** | Identity proofing level; invite-only vs open signup; bot resistance |
| **Verification** | Email/phone confirmation; token TTL; retry limits |
| **Activation** | Admin approval; payment or contract gates |
| **Active use** | Linking additional IdPs; profile changes that affect auth (email change) |
| **Suspension** | Fraud, payment, compliance — can user still export data? |
| **Lockout** | Brute-force vs admin lock vs risk engine — differentiate events in logs |
| **Deletion / deprovisioning** | Hard delete vs soft delete; tenant offboarding; **SCIM** or HR sync lag |
| **Merge / duplicate resolution** | Same human, two accounts — authoritative merge rules |

## Linking and federation

- **Account linking** — Same person, multiple subject IDs (Google + corporate IdP); require verified flow to avoid takeover.
- **JIT provisioning** — First SSO login creates user; map immutable **`sub`** + issuer, not email alone.
- **Deprovisioning** — Offboarding: disable login, revoke sessions, API keys, and **schedule** data handling per policy.

## Invitations and B2B

- **Invited user** — Tokenized invite; role pre-baked; expiry; prevent invite reuse/enumeration.

## Review checklist

- [ ] Each transition (register → verify → active) has **clear failure and retry** behavior.
- [ ] **Email/phone change** retriggers verification and invalidates risky sessions where appropriate.
- [ ] **Deprovision** path revokes credentials, tokens, and service access — not only UI disable.
