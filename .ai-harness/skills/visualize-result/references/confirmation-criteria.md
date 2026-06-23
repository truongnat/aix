# Confirmation Criteria

Reference for step 4 of the `visualize-result` `Workflow`. For the page styling and
the `#confirm` / `#reject` contract, see `.ai-harness/tools/preview/references/design-guide.md`.

## What counts as a confirmation

- The `{ confirmed: true }` value returned by `confirmVisualResult` after the user
  clicked Confirm on the rendered comparison (or confirmed in the terminal fallback).
- A `{ confirmed: false, reason }` with a real reason — "no" without a reason can't
  route back to `plan`/`execute` with anything actionable.

## What does not count

- No response, or the conversation moving on — the call hasn't resolved; that's not a yes.
- "Looks fine I guess" without the user having seen the rendered comparison — confirm
  after rendering, not before.
- The author of the change confirming their own work on the user's behalf.

## Why this matters

This mirrors the acceptance-criteria step in a standard Definition of Done: a story
isn't done because the developer believes it matches the spec, it's done when the
spec owner says it does. `visualize-result` is that acceptance step, made concrete
with a rendered artifact and a captured decision instead of a verbal description.
