---
name: visualize-result
description: Use when completed or planned work has a visual or structural shape that's easier to confirm by showing it than by describing it in text.
metadata:
  version: 0.3.0
---

## Skill name

visualize-result

## Instruction

Generate the confirmation page HTML dynamically — following the shared design guide — and hand it to the `tools/preview` engine, which serves it in a styled browser page and returns the user's confirm/reject decision over a local callback. There is no fixed template: you author the comparison markup, the engine owns transport, styling bundle, and capture.

## When to use

- `plan` has finalized a result with a visual or structural shape the user hasn't seen rendered yet
- work is complete and its outcome can be shown directly (CLI output, generated file, rendered page) rather than just described
- a prior visual decision (from `visualize-question`) needs to be confirmed in its final, assembled form

## When not to use

- the result is purely internal logic with no visual or structural shape to show
- the result was already rendered and confirmed earlier in this same session with no changes since
- automated verification (tests, typecheck) already fully proves correctness and no visual judgment is needed

## Inputs

- `title` — what is being confirmed
- `bodyHtml` — agent-generated page body, authored per `tools/preview/references/design-guide.md`, containing `#confirm` and `#reject` controls and the expected-vs-actual comparison

## Workflow

1. Identify what changed and whether it has a visual or structural shape worth showing.
2. Read `tools/preview/references/design-guide.md`; generate `bodyHtml` showing expected vs. actual from real captured content, using only the bundled class vocabulary, with `#confirm` and `#reject` controls.
3. Call `confirmVisualResult({ title, bodyHtml })` from `tools/preview`; it serves the comparison, opens the browser, and waits for the user's decision. On a headless host it falls back to a terminal prompt automatically.
4. Receive `{ confirmed, reason? }` over the callback.
5. If rejected, record the `reason` and route back to `plan` or `execute` — do not silently adjust and re-ask.

## Operating Principles

- You render; the engine transports. Generate the comparison per the design guide; let `tools/preview` own the browser, callback, and styling bundle.
- Show the actual result, captured directly, rather than a description of it.
- A rejection's `reason` is information to route on, not a failure to paper over.

## Output Contract

This skill must produce:

- agent-generated `bodyHtml` rendered via `confirmVisualResult`, with `#confirm` and `#reject` controls
- an explicit `{ confirmed, reason? }` decision, recorded into the calling artifact

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "It matches the plan, so it's fine, no need to render it" | Matching on paper isn't matching what the user pictured. Generate the comparison and call `confirmVisualResult`. |
| "I'll use a class that isn't in the bundle, it'll probably be fine" | The offline bundle only has the curated vocabulary. Unbundled classes render unstyled. Stick to the design guide, or extend `safelist.html` and rebuild. |
| "They didn't reject, so it's confirmed" | The decision comes back as `confirmed: boolean`. Wait for the real value; absence is not a yes. |

## Checklist Before Done

- [ ] The result had a visual/structural shape worth showing
- [ ] `bodyHtml` was generated per the design guide from real content, with `#confirm` and `#reject`
- [ ] An explicit `{ confirmed, reason? }` came back from the callback (or terminal fallback)
- [ ] Any rejection's reason was recorded with a route back to `plan`/`execute`

## Example

After `execute` finishes the `--force` flag work, this skill generates a two-column `bodyHtml` (expected vs. actual `--help` output) with `#confirm`/`#reject` controls and calls `confirmVisualResult`; the user's browser shows them side by side, they click "Confirm", the call resolves with `{ confirmed: true }`, and the work proceeds to `verify`. See `scripts/example.ts` for the exact invocation.

## Output

A returned `{ confirmed, reason? }` plus its record in the calling artifact — gates handoff to `verify`; it is not itself the final proof of correctness.

## References

- `FORMS.md` — guide for authoring the comparison and recording the decision
- `scripts/example.ts` — runnable reference invocation of `confirmVisualResult`
- `references/confirmation-criteria.md` — what counts as an explicit confirmation
- `tools/preview/references/design-guide.md` — the authoritative style + contract reference
- `tools/preview` — the shared rendering + callback engine this skill calls
