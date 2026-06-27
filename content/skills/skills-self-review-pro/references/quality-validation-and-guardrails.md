# Quality validation and guardrails (skills self-review)

## Contents

1. [Evidence discipline](#evidence-discipline)
2. [No invented script flags](#no-invented-script-flags)
3. [Reproducible commands](#reproducible-commands)
4. [Review checklist](#review-checklist)

---

## Evidence discipline

- Command lines must match **`scripts/README.md`** / actual `dist/tools.js` — do not guess flags.

---

## No invented script flags

- If unsure, read CLI **`--help`** output or repo docs before recommending.

---

## Reproducible commands

- State **cwd = repo root** and Node/npm prerequisites — **`versions.md`**.

---

## Review checklist

- [ ] `validate-skills` outcome recorded.
- [ ] `analyze-skills` flags documented.
- [ ] Manual authoring checks listed when heuristics pass.
- [ ] `build-skill-index` / `build-kb` follow-ups when content changed.
