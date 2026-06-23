# Rendering Guidelines

The authoritative style and contract reference is
`.ai-harness/tools/preview/references/design-guide.md` (palette, vocabulary, the `data-choice`
contract, what the engine provides). Read that first. This file only adds
notes specific to authoring a **choice** page.

## Choice-page specifics

- Give every option exactly one `data-choice="<id>"` trigger. A whole card can be
  the trigger, or a "Choose this" button inside it — either works, the engine
  wires any element with the attribute.
- Keep ids identical between `bodyHtml` and the `choices` array you pass. A mismatch
  makes the callback return an id `askVisualQuestion` will reject.

## Make options genuinely distinct

- If two options render the same in substance, there's only one option — drop the
  duplicate rather than padding the comparison.
- **Hard limit: 2-3 options.** `askVisualQuestion` throws if `choices` has fewer
  than 2 or more than 3 — it's not a style preference, the call fails. If a
  decision genuinely has more than 3 candidates, narrow it to the 3 strongest
  before calling this skill, or split it into two sequential decisions.

## Represent the real shape

- Use real sample data and labels, not lorem ipsum — the user is choosing between
  actual outcomes, so each option should look like its actual outcome.
- Lay options out side by side (`grid gap-6 md:grid-cols-2`) so they compare at a
  glance; stack only when there are more than two.
