---
name: exploratory-charter-builder
description: "Create an exploratory testing charter for a focused, timeboxed session. Use when a tester must explore a new feature, an unclear business area, or a high-risk zone using session-based testing — defining mission, scope, duration, test data, test ideas, and evidence to collect."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,exploratory-testing,charter,session-based"
---

# Exploratory Charter Builder

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If charter files are created, store them under:

```text
artifacts/YYYY-MM-DD/exploratory-charter-builder/HHmmss-feature-or-area/
```

Every artifact must record `Session timestamp`, the feature/area, the charter, session notes, and bugs/questions found.

## Goal
Turn vague "poke around the feature" work into a session-based exploratory test with a clear mission, scope, and timebox — so findings are reportable and the session doesn't drift.

## Process

### Step 1 — Define the charter
Clarify:
- **Feature or area** to explore — one session covers one coherent area, not the whole release.
- **Why**: brand-new feature, historically buggy, vague requirements, regression risk, unowned area?
- **Context**: which role/account, which test data, which environment.
- **Timebox**: typically 30, 45, or 60 minutes. More than ~90 minutes without a new charter is a session drifting, not exploring.

If the user only gives a short description, still build the charter — but mark assumptions explicitly.

### Step 2 — Generate exploration angles
Suggest directions matched to the area, not a generic dump:
- Happy path and its obvious variants (different order, skipped optional steps, back-button paths)
- Roles/permissions — what does a lesser-privileged user see/can do?
- Different data states — empty, minimal, full, legacy-looking, edge-shaped records
- Error/empty/loading states — force a failure mid-flow and observe
- Boundaries and abnormal operations — limits, rapid repeated actions, unusual-but-legal input
- Interaction with neighboring features — what shared state does this touch?
- What to capture as evidence: screenshots, console output, network traces, notes

### Step 3 — Write the charter
The mission statement should name what to explore AND what to look for, e.g. *"Explore the bulk-import flow with malformed CSVs to discover how validation errors are surfaced"* — not just "test the import feature."

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

# Exploratory Charter: [Feature/Area]

Mission:
[session goal — explore X to discover Y]

Scope:
- In scope: [...]
- Out of scope: [...]

Timebox: [30/45/60 min]

Setup needed:
- Environment/accounts: [...]
- Test data: [...]

Test ideas:
- [...]

Evidence to collect:
- [...]

Debrief questions:
- What bugs were found?
- What business questions arose?
- Which area needs a deeper follow-up session?
```

## Session execution guidance (for the tester)
- Keep a running note of paths tried and anything surprising, with timestamps — this becomes the session report.
- When a bug is found, note it, capture quick evidence, and CONTINUE the charter — deep-diving one bug burns the whole timebox.
- At the end, answer the debrief questions; that's the deliverable.

## Anti-patterns
- Charter so broad it cannot be finished ("explore the whole admin module") — split it.
- Charter that is secretly a scripted test case — charters give a mission and freedom, not numbered steps.
- No timebox, no debrief — then it's just unstructured clicking, not session-based testing.
- Replacing formal test cases: charters find risk and questions early; they don't substitute the regression suite.
