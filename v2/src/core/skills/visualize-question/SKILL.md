---
name: visualize-question
description: Use when a decision inside another skill has a visual or structural shape — layout, diagram, multiple UI options — that's hard to compare correctly in plain text.
metadata:
  version: 0.3.0
---

## Skill name

visualize-question

## Instruction

Generate the choice page HTML dynamically — following the shared design guide — and hand it to the `tools/preview` engine, which serves it in a styled browser page and returns the user's pick over a local callback. There is no fixed template: you author the markup per decision, the engine owns transport, styling bundle, and capture.

## When to use

- a decision has multiple visual or structural options (layout, component shape, diagram) where rendering changes whether the user picks correctly
- another skill (e.g. `plan`) reaches a branch point that's genuinely visual, not just conceptual
- a text-only description of the options would require the user to imagine the result

## When not to use

- the choice is purely conceptual (naming, algorithm, data shape) with no visual form
- the user already stated a preference and there's nothing left to compare
- only one option exists — there's nothing to visualize a choice between

## Inputs

- `title` — the decision being made
- `choices` — `{ id, label }[]` driving the terminal fallback and validating the returned id
- `bodyHtml` — agent-generated page body, authored per `tools/preview/references/design-guide.md`, with a `data-choice="<id>"` trigger per choice

## Workflow

1. Confirm there are at least two real options worth rendering — if not, skip this skill (`askVisualQuestion` throws on fewer than two).
2. Read `tools/preview/references/design-guide.md`; generate `bodyHtml` for this specific decision using only the bundled class vocabulary, giving each option a `data-choice="<id>"` element.
3. Build the matching `choices: { id, label }[]` (ids must match the `data-choice` values).
4. Call `askVisualQuestion({ title, choices, bodyHtml })` from `tools/preview`; it serves the page, opens the browser, and waits for the user's click. On a headless host it falls back to a terminal selection automatically.
5. Record the returned `id` back into the calling skill's artifact (brief's options table, plan's `Visual Decisions`).

## Operating Principles

- You render; the engine transports. Generate the HTML per the design guide; let `tools/preview` own the browser, callback, and styling bundle.
- Generate markup that looks finished and represents the real shape — the design guide gives you a Claude-like vocabulary to do that.
- The selection comes back as the chosen `id`; persist it durably rather than relying on chat memory.

## Output Contract

This skill must produce:

- agent-generated `bodyHtml` rendered via `askVisualQuestion`, with a `data-choice` per option
- the user's selected `id`, recorded back into the calling artifact

## Common Failure Modes

| Excuse | Reality |
|---|---|
| "I'll just describe the two layouts in chat instead of rendering them" | That's the exact failure this skill exists to prevent. Generate the HTML and call `askVisualQuestion`. |
| "I'll use a class that isn't in the bundle, it'll probably be fine" | The offline bundle only has the curated vocabulary. Unbundled classes render unstyled. Stick to the design guide, or extend `safelist.html` and rebuild. |
| "The user will probably pick option A, I'll just go with that" | The chosen id comes back from the callback. Wait for it; don't pick on their behalf. |

## Checklist Before Done

- [ ] At least two real options existed before this skill ran
- [ ] `bodyHtml` was generated per the design guide, with a `data-choice` per option
- [ ] `choices` ids match the `data-choice` values
- [ ] The user's selected id came back from the callback (or terminal fallback)
- [ ] The selection was recorded back into the calling skill's artifact

## Example

`plan` reaches a branch on how the `doctor` command should report provider status: a flat list vs. a grouped table. This skill generates a two-column `bodyHtml` (each column a card with a `data-choice` button), passes `choices: [{id:'flat'},{id:'grouped'}]`, and calls `askVisualQuestion`; the user's browser shows both styled panels, they click "Choose this" on the grouped table, the call resolves with `"grouped"`, and `plan` records it. See `scripts/example.ts` for the exact invocation.

## Output

A returned option `id` plus the recorded selection in the calling artifact — consumed by whichever skill invoked it, not shown to an end user as a final deliverable.

## References

- `FORMS.md` — guide for building `choices` and the returned-id handling
- `scripts/example.ts` — runnable reference invocation of `askVisualQuestion`
- `references/rendering-guidelines.md` — skill-specific notes on top of the design guide
- `tools/preview/references/design-guide.md` — the authoritative style + contract reference
- `tools/preview` — the shared rendering + callback engine this skill calls
