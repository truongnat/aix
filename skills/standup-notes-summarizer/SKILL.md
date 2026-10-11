---
name: standup-notes-summarizer
description: "Produce an ultra-short standup update for a tester: what was done yesterday, what's planned today, what blockers exist. Use when the user needs a 30–60 second spoken update or a quick chat message — deliberately shorter and more conversational than a daily-report-writer report."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,standup,scrum,summary"
---

# Standup Notes Summarizer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If note files are created, store them under:

```text
artifacts/YYYY-MM-DD/standup-notes-summarizer/HHmmss-standup/
```

Every artifact must record `Session timestamp`, the report date, and the final note.

## Goal
A standup note you can say out loud in 30–60 seconds. This is NOT a substitute for `daily-report-writer`, which produces the fuller document sent to a lead — standup is the spoken-word version.

## Process

1. Fix the standup date; if the user doesn't specify, use today. Note the common edge case: a Monday standup covers FRIDAY's work, not Sunday's — use the last working day unless the user says otherwise.
2. Use only activity relevant to yesterday / today / blockers — the three standup questions.
3. Compress into natural spoken sentences, not report prose.
4. If no blocker was mentioned, don't invent one — either omit the section or write "no blockers" only if the user confirms that.
5. If the user gives a long task list, pick what a team actually needs to hear: outcomes and blockers, not every sub-task.
6. If the user provides ticket IDs (e.g. PROJ-123, BUG-456), keep them — IDs make the update traceable in tools like Jira.

## What belongs in each line
- **Yesterday**: completed, outcome-level items. "Finished testing the checkout flow — found 2 bugs" beats "worked on checkout."
- **Today**: concrete plan, 1–3 items max. If the user lists 6 things, ask which matter or pick the ones tied to sprint goals.
- **Blockers**: only real impediments or things waiting on someone — name what you're waiting for and from whom if known. "Waiting on staging credentials from DevOps" is a blocker; "task is hard" is not.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Yesterday:
- [...]

Today:
- [...]

Blockers:
- [...]

Quick spoken version:
"Yesterday I..., today I'll..., my blocker is..."
```

The written bullets are for chat-based/async standups (Slack threads); the "quick spoken version" is one flowing sentence set for a live call.

## Examples
- Weak: "Yesterday: testing. Today: more testing."
- Good: "Yesterday: finished regression on the payment flow, reported BUG-1234 for the double-charge issue. Today: retesting the fix and starting exploratory on the new promo module. Blocker: still waiting on staging credentials from DevOps."
- Async/chat variant (Bullets only):
  - Yesterday: Payment regression done, filed BUG-1234
  - Today: Retest fix + exploratory on promo module
  - Blocker: staging credentials (DevOps)

## Notes and anti-patterns
- No detailed metrics — spoken updates don't carry tables; if numbers matter, one number at most ("12 of 15 cases passed").
- Don't pad to look busy — a quiet day is a valid standup: "Yesterday: finished X early, reviewed test cases for Y. Today: start Z."
- Don't soften real blockers ("a bit of an issue" → if it stops work, it's a blocker, name it plainly).
- If the user needs the full written report, hand off to `daily-report-writer` instead of stretching this format.
