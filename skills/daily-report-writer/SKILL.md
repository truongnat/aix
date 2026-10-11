---
name: daily-report-writer
description: "Compile the day's (or week's) QA work into a clear report for the lead, from the user's scattered recollection of tasks done, bugs found, and test cases written. Use when the user must send a daily or end-of-week progress report but only remembers fragments of what they did."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,report,daily-report,progress"
---

# Daily Report Writer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If report files are created, store them under:

```text
artifacts/YYYY-MM-DD/daily-report-writer/HHmmss-report-scope/
```

Every artifact must record `Session timestamp`, `Report date`, activity sources used, any activity excluded for belonging to a different date, and the final report. All main chat output must also show `Session timestamp`.

## Goal
Take a fragmented, unordered, context-thin list of what the user did and produce a structured, lead-readable progress report.

## Support scripts
- `artifact_init.py --report` to create the output folder for the final report.
- `artifact_index.py --report REPORT_DATE` to index the day's activity from `artifacts/REPORT_DATE/*/` when summarizing from prior artifacts.
- `artifact_packager.py --report` on the daily-report run folder when the whole bundle goes to the lead or to archive.

## Process

### Step 1 — Collect content
Fix `Report date` first. If the user doesn't specify a date, use the current date in the user's/project's timezone.

Only use activity belonging to `Report date` for a daily report. When reading from artifacts, only read:

```text
artifacts/REPORT_DATE/*/
```

Never blend other days' activity into a daily report unless the user explicitly asks for a weekly report or names specific extra dates. When indexing artifacts, runs from other dates must be listed separately as excluded — not silently ignored.

Ask the user (if not already provided): which tasks/features were worked on that day, any bugs found, anything blocked or waiting on someone.

If the user gives only a brief list, don't interrogate — compose a draft from what's there, then ask one follow-up only if an important section is missing (e.g. user never mentioned blockers).

### Step 2 — Classify content into groups
- **Completed**: tasks/features fully tested, bugs reported
- **In progress**: unfinished tasks — include rough progress
- **Issues found**: bugs/blockers discovered, with impact
- **Needs help / waiting on**: waiting for dev fix, waiting for info, blocked by what
- **Test metrics**: cases executed/passed/failed/blocked — only if the user provided numbers
- **Risks & next plan**: remaining risk, owner, ETA, next action

### Step 3 — Output in a short, scannable format

```text
## Report [date/week]

**Session timestamp:** [YYYY-MM-DD HH:mm:ss Z]
**Report date:** [YYYY-MM-DD]

**Completed:**
- [task/feature] — [short result]

**In progress:**
- [task] — [progress]

**Issues found:**
- [bug/issue] — [severity, reported yet?]

**Needs help:**
- [what is needed / waiting on]

**Test metrics:**
- [executed/pass/fail/blocked if provided]

**Risks / next plan:**
- [risk, owner, ETA, next action]
```

## Writing rules
- One idea per line — the lead scans, nobody wants a narrative essay.
- Never add tasks the user didn't mention.
- Never mix in activity from other dates; if spotted, list it separately as "excluded — different date."
- If a section is genuinely empty (e.g. nothing blocked), drop the section entirely rather than writing "None" everywhere.
- For weekly reports, state the date range explicitly and aggregate rather than listing every day separately.

## Anti-patterns
- Inflating "worked on X" into "completed X" — keep the user's actual status.
- Fabricating test metrics the user never gave.
- Copying the user's raw messy list into the report without classification — classification IS the value.
