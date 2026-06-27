# Quality validation and guardrails (anti-hallucination)

## Before publishing workflow advice

- [ ] **Platform named** — GitHub Actions vs GitLab vs other; **syntax differs**.
- [ ] **No invented secret names** — use placeholders like `AWS_ROLE_ARN` with “replace with your value.”
- [ ] **Pinning** — third-party `uses:` shown with **SHA** pattern, not mutable `@v4` only in **new** org policies.
- [ ] **Fork / untrusted PR** — explicitly state risk if user pastes workflow that uses secrets on `pull_request`.
- [ ] **Repro scope** — if user omits runner type, state **hosted ubuntu-latest** assumption.

## Validation points

1. **Trigger matches intent** — `pull_request` does not populate `secrets.GITHUB_TOKEN` the same as `push` for forks.
2. **Environment protection** — `environment: production` alone does not secure without **protection rules** in repo settings.
3. **OIDC** — requires `permissions: id-token: write` **and** cloud trust config — mention both halves.
4. **Deploy is not “free”** — link rollback and **deployment-pro** when changing delivery.

## Wrong-answer prevention

- Do not claim **“this YAML is secure”** without reviewing **fork policy**, **branch protection**, and **secret scope**.
- Do not recommend **`pull_request_target`** for convenience without **security-pro** review — high foot-gun.
