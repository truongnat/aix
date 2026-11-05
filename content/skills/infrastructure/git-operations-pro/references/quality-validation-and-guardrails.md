# Quality validation and guardrails (anti-hallucination)

## Commands and output

- [ ] **Do not fabricate** remote URLs, SHAs, or branch names — use placeholders (`origin/main`, `<sha>`) unless the user provided them.
- [ ] **Git version** — Prefer stable CLI patterns; exotic flags depend on client version — **`versions.md`**.

## Secret incidents

- [ ] **Rotating credentials** is mandatory for leaked live keys — history rewrite **alone** is insufficient — **`security-pro`**.
- [ ] Do **not** paste **real** tokens or keys into examples.

## Claims

- [ ] **“Rebase is always safe”** — false on shared branches without coordination — **`failure-modes-detection-mitigation.md`**.
- [ ] **“Revert undoes everything”** — does not remove secrets from all forks/clones; rotate + scan.

## Host-specific features

- [ ] **Merge queue**, **rulesets**, **required checks** — name the **host** (GitHub/GitLab/…) or say “see your provider docs” — avoid inventing UI paths.
