---
name: edge-case-brainstormer
description: "Brainstorm edge cases and 'what happens if…' questions for a business scenario, form, API, workflow, or rule. Use when a tester needs to think beyond the spec — exceptions, negative paths, boundaries, weird states, abnormal data — and needs questions to bring back to BA/PM/dev."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,edge-cases,brainstorm,test-design"
---

# Edge Case Brainstormer

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If brainstorm files are created, store them under:

```text
artifacts/YYYY-MM-DD/edge-case-brainstormer/HHmmss-scenario/
```

Every artifact must record `Session timestamp`, the original scenario, the edge-case list, risk levels, and open questions.

## Goal
Push a tester's thinking past the happy path — especially when the domain is unfamiliar or the spec is a two-liner. Output is a risk-ranked idea list plus the questions each idea raises, not a finished test suite.

## How to use this
Input: a feature description, a rule, a form, an endpoint, a workflow — even a single sentence.
Sweep each brainstorm group below, but only keep ideas that could plausibly break THIS scenario — quantity is not the goal, a short list of sharp cases beats a long generic one.

## Brainstorm groups

### Input abnormalities
- Empty, null, whitespace-only, leading/trailing spaces
- Emoji, accented characters, CJK, RTL text, zero-width characters
- Extremely long input, extremely short, control characters
- Wrong format: text in numeric field, HTML/script tags, SQL-ish strings
- Duplicated submission of identical input

### Boundaries
- min, max, min−1, max+1
- "Just enough" vs "just over" a limit (cart total = free-shipping threshold ± 0.01)
- Counter at limit: 100th item in a 100-item list

### Roles and permissions
- User without permission attempts the action directly (URL/API, not just hidden button)
- Owner vs non-owner of the record
- Role changes mid-session (demoted while logged in)

### States
- Acting on draft/pending/approved/rejected/cancelled/expired/deleted entities
- Transition attempted in the wrong order (approve a rejected item? delete an in-progress one?)

### Time
- Expiry boundary (exactly at deadline, 1 second before/after)
- Timezone crossings, DST switches, month-end/year-end, leap day
- Clock skew between client and server

### Concurrency
- Two users edit/submit the same entity simultaneously
- Double-click, double-submit, browser back + resubmit
- Retry after timeout — was the first request actually processed?

### Data relations
- Referenced data deleted mid-flow (product removed while it's in a cart)
- Duplicated data, migrated legacy data missing new required fields
- Foreign key dangling — child exists, parent gone

### Integration
- Downstream service slow/timing out/returning errors
- Partial success: payment taken, order not created
- Offline → back online with queued actions

### UI vs API mismatch
- UI allows what the API rejects (and vice versa)
- API returns fields the UI ignores or mishandles

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Scenario: [description]

| Group | Edge case | Why it matters | Priority | Question to ask |
|---|---|---|---|---|
| Concurrency | Two admins approve same request simultaneously | Double-approval may trigger duplicate side-effects | P1 | Should second approval be rejected or idempotent? |
```

## Priority guidance
- `P0`: touches the main flow, money, permissions, data integrity, or compliance.
- `P1`: realistic negative/edge path a user could hit.
- `P2`: rare, environment-dependent, or mostly speculative.
- Do NOT mark everything P0 — a list where everything is top priority is useless.

## Anti-patterns
- Listing generic cases that cannot plausibly apply to the scenario (e.g. timezone cases for a feature with no dates).
- Presenting speculation as confirmed requirements — mark inferred cases "needs confirmation" and generate the clarifying question.
- Stopping at input validation — most production bugs live in states, concurrency, and data relations.
