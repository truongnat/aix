# Memory Profile

## Status: draft — review before first harness-run

## Recall Before Planning

Before planning non-trivial work, check:

| Artifact | What to look for |
|---|---|
| `.harness/DECISIONS.md` | Decisions that constrain the solution space |
| `.harness/HAZARDS.md` | Fragile areas, regression risks, external constraints |
| `.harness/INDEX.md` | Reusable commands and verification recipes |

## Remember After Shipping

After verified work ships, record:

| Lesson type | Where to record |
|---|---|
| Architectural decision with lasting consequences | `DECISIONS.md` |
| Fragile area that caused a regression or had hidden constraints | `HAZARDS.md` |
| Command or check worth reusing in future sessions | `INDEX.md` |
| Goal-level lesson (may promote later) | `REMEMBER.md` |

## Memory Types

| Type | Examples | Artifact |
|---|---|---|
| Architecture decision | "We use event sourcing for audit history" | `DECISIONS.md` |
| Recurring hazard | "Migrations against this DB require a maintenance window" | `HAZARDS.md` |
| Reusable command | "Inspect queue depth: `redis-cli llen queue:jobs`" | `INDEX.md` |
| Delegated worker note | "Reviewer repeatedly misses delta-spec validation" | `.harness/memory/workers/<agent>.md` |
| Goal lesson | "Root cause of the rate limit bug was missing retry-after header handling" | `REMEMBER.md` |

## Forbidden Content

Never write into `.harness/` memory files:
- Secrets, API keys, tokens, passwords, connection strings
- Customer data, PII, private business information
- Credentials or access details of any kind
- Temporary state or work-in-progress status (use session artifacts instead)
