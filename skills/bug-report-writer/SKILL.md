---
name: bug-report-writer
description: "Turn a messy or incomplete bug description into a structured, dev-ready bug report. Use right after the user spots a bug and needs to file it — the skill proactively asks for exactly the missing pieces (environment, repro steps, expected/actual, frequency, severity, evidence) instead of writing a report full of gaps."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,bug-report,defect,documentation"
---

# Bug Report Writer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If bug report files are created, store them under:

```text
artifacts/YYYY-MM-DD/bug-report-writer/HHmmss-short-bug-title/
```

Every artifact must record `Session timestamp`, input source, the final report, and any still-missing information. All main chat output must also show `Session timestamp`.

## Core principle
The user's description may be chaotic or thin. This skill's job is to PROACTIVELY ask for exactly the missing pieces against a fixed checklist — not to silently produce a report with holes based on whatever the user happened to mention.

## Support scripts
If input includes log files, text evidence, or URLs, prefer `--report` mode first:

- `safe_download.py` for logs/specs/evidence at a URL
- `evidence_manifest.py` to normalize the attachment list (logs, HAR, screenshots)
- `session_timeline_builder.py` to build a chronological evidence timeline
- `artifact_packager.py` to compress the whole bug artifact before sending
- `redact_sensitive.py` before storing/quoting logs containing tokens, emails, phones, secrets
- `artifact_init.py` to create a standard artifact folder for the report

## Information checklist

### Required for the report to have value
1. **Environment**: web or app, which version/build, which browser/device, which OS (if relevant)
2. **Steps to reproduce**: concrete, numbered, no multiple actions merged into one step
3. **Expected result**: what should have happened
4. **Actual result**: what actually happened
5. **Frequency**: always or intermittent — if intermittent, is there a pattern?

### Nice to have, not blocking
6. **Severity**: does it block the main flow or is it minor/cosmetic? If the user doesn't know, propose a severity based on impact and mark it "proposed."
   - `Critical`: crash, data loss, core flow dead, security issue
   - `High`: major feature broken, no workaround
   - `Medium`: feature impaired, workaround exists
   - `Low`: cosmetic, copy errors, minor annoyance
7. **Attachments**: screenshots/video/logs — if none exist yet, say "no attachments yet" instead of leaving the field blank.

## Process

### Step 1 — Read the initial description
Long or short, clear or messy — immediately map it against the 7-item checklist above.

### Step 2 — Ask only for what is missing, as specific questions
Never ask a blanket "can you give me more info." Ask directly, e.g.:
- "Is this on web or app? Which version?"
- "Can you reproduce it right now, or did it happen once?"
- "Before you pressed Save, what steps did you do? List them in order."

Ask at most the 3 highest-impact questions first. If required info is still missing after answers, ask again. Do NOT block the report over nice-to-have items like attachments or formal severity.

Exception: if the user says "just write it with what we have, I'll fill in later", produce the report with missing items marked `[To fill in: ...]` — never fabricate them.

### Step 3 — Output the report in the standard template

```text
## [Bug title — one line, states the phenomenon clearly]

**Environment:** [web/app, version, browser/device, OS]
**Session timestamp:** [YYYY-MM-DD HH:mm:ss Z]
**Severity:** [Critical/High/Medium/Low — mark "proposed" if inferred]
**Frequency:** [Always / Intermittent — pattern if any]

**Steps to reproduce:**
1. ...
2. ...
3. ...

**Expected result:**
[description]

**Actual result:**
[description]

**Attachments:** [screenshots/video/logs if any]

**Additional notes:** [anything relevant — e.g. "only happens for admin role"]
```

## Handoffs
- If the user previously ran `browser-investigator` and has console/network findings, fold them into "Additional notes" or "Attachments" automatically — never make them retype it.
- Many attachments? Run `evidence_manifest.py --report` first to list files, MIME types, and sensitive-data flags.
- Sending the whole artifact bundle? `session_timeline_builder.py --report` checks evidence completeness; `artifact_packager.py --report` prepares the zip.
- Sensitive data in logs? `redact_sensitive.py --report` before quoting or storing.

## Anti-patterns
- Writing expected/actual as the same sentence ("it should work but it doesn't") — force concrete statements of both.
- Steps like "log in and do the test" — expand implied steps into numbered actions.
- Title that names the feature instead of the failure ("Login page" → "Login fails with valid credentials, shows blank screen").
- Inventing environment details or frequency to make the report look complete.
