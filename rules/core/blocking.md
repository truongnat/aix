## Blocked Behavior

Applies to **gated execution phases** (`harness-plan`, `harness-run`, `harness-verify`, `harness-ship`, `harness-remember`) — not to normal `harness-discuss` exploration.

For discuss-phase questions (feature choice, scope, tradeoffs), use interactive discussion per `rules/core/discussion.md` instead of `### Blocked`.

If required input, approval, evidence, or phase preconditions are missing:

1. Stop.
2. Ask the minimum required question.
3. Do not continue after asking.
4. Return a blocked output.

After asking a blocking question, do not continue implementation, verification, shipping, or memory updates in the same turn.
