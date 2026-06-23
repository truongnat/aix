# Evidence Standards

Reference for step 2 of the `verify` `Workflow`.

## Counts as evidence

- A test that was actually re-run in this verify pass, with its output checked.
- A captured command output, log line, or diff that directly shows the claimed behavior.
- A rendered comparison from `visualize-result` with an explicit user confirmation attached.

## Does not count as evidence

- "It passed earlier in `execute`" without re-checking — state passed earlier as evidence, but re-running is what makes it current.
- "I'm confident this works" — confidence is not evidence; it is the thing evidence is supposed to replace.
- A status field that says `done` with no evidence note attached to it.

## Why this matters

This is the same standard a Definition of Done enforces in mainstream SDLC practice: a criterion is only satisfied when there's a checkable artifact behind it, not when the implementer believes it's satisfied. `verify` is where that standard gets applied one last time before the work is finalized and committed.

## Downgrading rule

If evidence is missing, partial, or stale, the `Result` column is `unproven` — never round it up to `pass` because the task is "probably fine."
