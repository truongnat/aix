# Visualize-Question — Form-Filling Guide

How to build the call to `askVisualQuestion` (from `.ai-harness/tools/preview`) so it satisfies the `Output Contract` in `SKILL.md`. You generate the HTML; this guide covers the inputs and the contract you must honor.

## title

State the actual decision being made, not a generic label. "doctor status: flat list vs. grouped table" is a title; "Comparison" is not.

## choices

A `{ id, label }[]`:

- `id` — a short stable key (`"flat"`, `"grouped"`). This is what comes back from the callback, so make it meaningful, not `"1"`/`"2"`.
- `label` — the human name, used by the terminal fallback when no browser is available. Make it read well on its own.

Every `id` here must have a matching `data-choice="<id>"` element in `bodyHtml`, and vice versa. `askVisualQuestion` rejects a returned id that isn't in `choices`.

## bodyHtml

The page body you generate, following `.ai-harness/tools/preview/references/design-guide.md`:

- Use only the bundled class vocabulary (see the design guide / `safelist.html`).
- Give each option a clickable `data-choice="<id>"` element.
- Show real sample data, not placeholders — the user judges the actual shape.
- Don't add `<style>` blocks, external stylesheets, `<head>`, scripts, or a done banner — the engine's shell provides those.

## Recording the selection

`askVisualQuestion` resolves with the chosen `id`. Write that id back into the calling skill's artifact — the brief's `Options Considered` section or the plan's `Visual Decisions` table — not just into chat, which the calling skill can't read back later.

## Validation

A run is acceptable only if `choices` had at least two distinct ids, every id mapped to a `data-choice` in `bodyHtml`, and the returned id got recorded somewhere durable.
