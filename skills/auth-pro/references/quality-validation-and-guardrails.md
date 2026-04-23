# Quality validation and guardrails (auth)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [No invented protocol steps](#no-invented-protocol-steps)
3. [Vendor-specific claims](#vendor-specific-claims)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Cite **RFC/OIDC** sections or vendor docs for flow steps — do not guess **PKCE**, **redirect URI**, or **scope** behavior — **`versions.md`**.

---

## No invented protocol steps

- If IdP configuration is unknown, list **required** portal fields as **questions**, not answers.

---

## Vendor-specific claims

- Azure AD / Okta / Cognito differ — label **product** when giving console guidance.

---

## Review checklist

- [ ] Authn strength matches data sensitivity — **`mfa-and-assurance.md`**.
- [ ] Authz enforced server-side — **`authorization-models-and-policy.md`**.
- [ ] Revocation/rotation story for tokens in scope — **`token-session-lifecycle.md`**.
- [ ] **`security-pro`** engaged for abuse programs beyond patterns here.
