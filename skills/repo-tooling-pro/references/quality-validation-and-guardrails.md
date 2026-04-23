# Quality validation and guardrails (repo tooling)

## Contents

1. [Canonical sources of truth](#canonical-sources-of-truth)
2. [Anti-fabrication](#anti-fabrication)
3. [Reproducible runs](#reproducible-runs)
4. [Review checklist](#review-checklist)

---

## Canonical sources of truth

- **Command flags and script names** — root **`scripts/README.md`** and **`package.json`** `scripts` block.
- **Skill layout rules** — `SKILL_AUTHORING_RULES.md` (if present) + **`validate-skills`** output.

Do not duplicate long flag tables into chat without verifying they still match **`scripts/README.md`** after upstream edits.

---

## Anti-fabrication

- **Do not invent** `npm run` script names, CLI subcommands, or JSON fields not documented in this repo.
- When uncertain, instruct to run **`node dist/tools.js --help`** (or the subcommand help) from **repo root** after **`npm run build`**.

---

## Reproducible runs

- Record **Node version**, **commit SHA**, and whether **`build-kb`** / **`index-project`** was run before **`query-kb*`**.
- CI should pin **Node** and cache **`node_modules`** / **`dist`** deliberately — see **`failure-modes-detection-mitigation.md`**.

---

## Review checklist

- [ ] cwd is repo root; `dist/tools.js` exists or build step documented.
- [ ] After doc edits: `build-kb` + `verify-kb` called out when RAG matters.
- [ ] After skill edits: `validate-skills` + `build-skill-index` called out.
- [ ] Batch jobs: RAM / split-batch warning when large.
