# Report Template Discovery

> Auto-detected ship/report templates. Prefer **project** templates over harness defaults.

status: fallback

## Primary templates

- **prMessage:** `templates/PR_MESSAGE.md` (harness-pack, harness) — Harness default template
- **report:** `templates/REPORT.md` (harness-pack, harness) — Harness default template
- **changeSummary:** `templates/CHANGE_SUMMARY.md` (harness-pack, harness) — Harness default template

## PR template candidates

- none — using harness fallback

## Harness fallback paths

- PR: `templates/PR_MESSAGE.md`
- Report: `templates/REPORT.md`
- Change summary: `templates/CHANGE_SUMMARY.md`

## Ship rule

Fill session `PR_MESSAGE.md` using the **primary prMessage** template structure. Only use harness defaults when no project template exists.
