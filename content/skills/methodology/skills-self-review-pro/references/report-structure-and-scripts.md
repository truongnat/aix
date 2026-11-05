# Automation gap report (`analyze-skills`)

## What it measures

- **Signals:** Keywords suggesting CLI, CI, FFmpeg, shell, OCR, batch work.
- **Mitigation:** Mentions of `scripts/`, `query-kb`, `validate-skills`, `repo-tooling-pro`, `analyze-skills`, etc.
- **Tiers:** `strong` / `consider` / `low` / `ok` / `exempt` / `unknown`.

## How to run

From **repo root** (`npm install` and `npm run build` if `dist/` is missing):

```bash
# Full self-review for THIS repo (tier counts, all skills, manual checklist)
node dist/tools.js analyze-skills --self-review

# Heuristic only (tiers + table); use --with-references for stronger signals
node dist/tools.js analyze-skills --markdown

# Actionable tiers only; if empty, the script still prints tier distribution + full table
node dist/tools.js analyze-skills --with-references --only-actionable --markdown
```

## Interpreting gaps

| Tier | Typical action |
|------|----------------|
| **strong** | Add or link a helper under `scripts/`, or document repeatable commands in `SKILL.md`. |
| **consider** | Score **≥ 6** (after weights); if users repeat the same steps, add a workflow or script link. |
| **low** | Includes **domain** skills (`deployment-pro`, `testing-pro`, …) where CI/automation words are **expected** in prose — not a defect. |
| **ok** | Already references repo tooling — no automation gap from this heuristic. |
| **exempt** | `repo-tooling-pro` — meta skill. |

Heuristic details: the **`analyze-skills`** implementation uses low weight for generic **CI/pipeline** mentions to reduce false positives.

## Limits

- Does **not** check section order, frontmatter quality, or duplicate scope — use **`validate-skills`** + **`SKILL_AUTHORING_RULES.md`** for that.
