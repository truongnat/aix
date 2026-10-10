# Planning — anti-patterns (support tier)

1. **Fake precision** — Single-point estimates (“exactly 37 hours”) without assumptions; use ranges and document what would change them.

2. **Big-bang integration** — All components merge at the end; use incremental integration and checkpoints.

3. **Planning without a definition of done** — Tasks complete without verifiable output; reviewers cannot tell if success happened.

4. **Ignoring the critical path** — Optimizing non-critical tasks while the real blocker sits unstaffed.

5. **Hidden dependencies** — “We’ll figure out API later” on the critical path; surface and assign owners early.

6. **Optimistic concurrency** — Assuming everyone can work in parallel without merge conflicts or coordination.

7. **No rollback story** — Especially for migrations and flag rollouts; plan must include “how we undo.”

8. **Planning as commitment** — Treating the first draft as a promise; plans are **living** documents until execution proves them.

**When NOT to over-plan:** One-off scripts or trivial fixes — use a ticket and a single acceptance line, not a multi-phase roadmap.
