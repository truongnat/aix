# Feedback — edge cases

## Conflicting reviewer feedback

**Symptom:** Two reviewers suggest incompatible changes.

**Mitigation:** Author or lead **consolidates** in one thread; choose one direction with explicit **rationale**; avoid ping-pong rewrites. Escalate if product/architecture decision is needed.

## Low-confidence evidence

**Symptom:** Suspected issue, not reproduced.

**Mitigation:** Label as **“needs verification”**; suggest concrete repro steps or logging; do not block merge on **speculation** unless risk is catastrophic.

## Deadline pressure

**Symptom:** Must ship; cannot fix everything.

**Mitigation:** Explicit **must-fix** vs **follow-up ticket** with owners; document **accepted risk** for deferred items.

## Cross-file coupling

**Symptom:** Fix in one module may regress another.

**Mitigation:** Call out **blast radius**; recommend **integration test** or **smoke checklist** in the PR description.

## Spec ambiguity

**Symptom:** “Correct” behavior is unclear.

**Mitigation:** Separate **feedback on code quality** from **product clarification**; route the latter to PM/spec with a **question block**, not a verdict.

## Feedback overload

**Symptom:** Dozens of nits obscure blockers.

**Mitigation:** **Summary first** (3–5 bullets); group nits into one “polish” section or optional commit; use **severity** labels consistently.

## Tool and AI-generated suggestions

**Symptom:** Copilot/linter emits many low-value comments; hides a real defect.

**Mitigation:** Reviewer **triage**: adopt batch fixes in one commit; preserve **human summary** with severity ordering — **`failure-modes-detection-mitigation.md`**.

## Distributed teams / timezone lag

**Symptom:** Round-trip per comment takes days.

**Mitigation:** **Written merge gate** at top of PR; async OK for nits; **sync** only for blocker disagreements — **`decision-framework-and-trade-offs.md`**.

## Example — triage under pressure

```markdown
## Merge gate (today)
- [ ] F1 (High) — SQL injection — MUST fix
- [ ] F2 (High) — PII in logs — MUST fix

## Follow-up (next sprint)
- F3–F7: test coverage, naming, refactor duplication — ticket AUTH-200
```

## Example — conflicting feedback resolution note

```markdown
We’ll follow Reviewer A’s approach (use repository pattern) for consistency with Module X.
Reviewer B’s inline approach is deferred to a separate refactor ticket.
```

See [decision-tree.md](decision-tree.md) and [anti-patterns.md](anti-patterns.md).
