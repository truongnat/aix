# Review Axes

Use these axes to keep `discuss` narrow and decision-oriented. The goal is not to expand the option space; it is to pressure-test one concrete proposal before planning.

## Scope

Check whether the proposal changes only the intended surface.

- Does it quietly add adjacent work "while we're here"?
- Does it change success criteria, ownership, or required artifacts without saying so?
- Could the same value be achieved with a smaller reversible move?

## Compatibility

Check whether the proposal fits the repo's existing contracts and conventions.

- Does it break provider-specific behavior, file layout, or command expectations?
- Does it fight the current workflow, artifact model, or output contract?
- Is it reusing the established structure instead of inventing a parallel one?

## Verification

Check whether the proposal can actually be proven later.

- What evidence would `plan`, `execute`, or `verify` need in order to prove this worked?
- Is any success claim relying on a human assumption instead of a checkable artifact?
- Are there freshness concerns with reused review artifacts or older findings?

## Rollback Cost

Check how expensive it is to undo if the direction is wrong.

- If this choice fails, what files or contracts become expensive to revert?
- Does it create hidden migration work for later phases?
- Is there a smaller intermediate step that preserves an exit path?

## Decision Standard

The discussion is strong enough when each axis has been checked briefly, assumptions are labeled, and the note still ends with exactly one disposition: `approved`, `revise`, or `blocked`.
