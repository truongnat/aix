---
name: repro-steps-verifier
description: "Audit a written set of bug reproduction steps for clarity: find merged steps, vague words, missing preconditions, missing concrete data, illogical ordering, and weak expected/actual anchoring. Use when the user already wrote repro steps and wants certainty a dev can follow them without misreading or failing to reproduce."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,bug-report,repro-steps,review"
---

# Repro Steps Verifier

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If review files are created, store them under:

```text
artifacts/YYYY-MM-DD/repro-steps-verifier/HHmmss-short-bug-title/
```

Every artifact must record `Session timestamp`, the original steps, per-step review notes, and the proposed rewrite. All main chat output must also show `Session timestamp`.

## Goal
Review an existing set of steps (this skill reviews — `bug-report-writer` writes from scratch) and pinpoint the ambiguous spots that would make a dev reproduce the wrong thing or nothing at all.

## Review checklist

Apply to each step:

1. **Multiple actions merged?** — "Log in and go to settings" should be two steps. One step = one actor action + its immediate effect.
2. **Hidden precondition?** — step 3 assumes a state set up by an unwritten step 0 ("open the order you created earlier" — which order? created how?).
3. **Vague wording?** — "select any product" (does the bug need a specific one?), "enter a large quantity" (how large?), "wait a bit" (how long?), "it should work" (what does 'work' look like on screen?).
4. **Missing concrete data?** — actual usernames, values, file names, option names as used during the real reproduction.
5. **Logical order?** — later steps genuinely depend on earlier ones in the order a real user performs them; nothing relies on something done "before step 1" that isn't listed.
6. **Expected/actual anchored?** — is it clear at WHICH step the failure appears, not just a trailing "but it doesn't work"?
7. **Handoff complete?** — environment/build, account/role, test data, expected vs actual, evidence, reproduction frequency.

## Process

### Step 1 — Read and renumber
Read the provided steps; number them if not already numbered clearly.

### Step 2 — Mark each step
- `OK` — clear enough for a dev to execute exactly.
- `NEEDS CLARIFICATION` — state the exact ambiguity and how a dev could misread it.

### Step 3 — Output

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Step 1: [original text] → OK / NEEDS CLARIFICATION: [reason + suggested rewrite]
Step 2: ...

Missing handoff info:
- [environment/build/account/test data/evidence/frequency if absent]

Proposed rewrite (only if some steps need fixing):
1. ...
2. ...
```

## Good vs bad examples
- BAD: `3. Go to checkout and pay` → merged actions, no data.
  GOOD: `3. Open the cart. 4. Click "Checkout". 5. Select payment method "Credit card". 6. Enter test card 4111 1111 1111 1111. 7. Click "Pay".`
- BAD: `2. Select any item` → GOOD: `2. Select item "Blue T-shirt, size M" (SKU SHIRT-M-BLUE)`.
- BAD: `5. An error appears` at the end → GOOD: expected/actual stated at the step where it happens: `6. Expected: confirmation screen. Actual: page reloads, cart still full.`

## Notes
- Do NOT rewrite all the steps when most are fine — only propose fixes for steps marked `NEEDS CLARIFICATION`, so the user can diff before/after.
- If steps are fine but handoff info is missing, say the steps pass and list only the missing context — don't manufacture step issues that aren't there.
