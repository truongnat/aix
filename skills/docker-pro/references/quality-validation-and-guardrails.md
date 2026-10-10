# Quality validation and guardrails (anti-hallucination)

## Images and tags

- [ ] **Do not invent** `registry/org/name:tag@sha256:…` — use placeholders (`your-registry/app`) or ask the user.
- [ ] **Pin bases** — Prefer `node:22-bookworm-slim` **major** pinned with explicit bump policy; avoid silent `latest` for production deploy references — **`versions.md`**.

## Dockerfile snippets

- [ ] **`COPY` paths** match user repo layout — confirm `package.json` vs `pnpm-lock.yaml` location.
- [ ] **Package manager** matches project (`npm ci` vs `pnpm install --frozen-lockfile` vs `yarn`).

## Commands

- [ ] **Engine API / CLI flags** — prefer patterns from official Docker docs; when unsure, say **“verify against your Engine version.”**

## Security claims

- [ ] **Non-root** — show `USER` **after** file ownership is correct (`COPY --chown`).
- [ ] **“Distroless is always best”** — false if operators need shell or native libs conflict — **`decision-tree.md`**.
