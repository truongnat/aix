# Command Guardrails

`ai-engineering-harness` uses command docs as execution contracts, not just suggestions.

**→ Read the complete rules: [`phase-discipline.md`](./phase-discipline.md)**

## Quick Reference

### Phase Order

```
Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember
```

See `phase-discipline.md` for preconditions and what blocks each phase.

### Hard Stops (No Exceptions)

- `harness-run` **must not** start if `PLAN.md` is missing or not approved
- `harness-verify` **must not** pass on "looks right" confidence — require real evidence
- `harness-ship` **must not** claim success without explicit verification evidence
- `harness-remember` **must not** run without a shipped result, failed attempt, or durable lesson

See `phase-discipline.md` for complete hard stops.

### Blocking Questions

When a command lacks required input, stop and ask instead of guessing.

Typical blockers:
- Approval missing
- Acceptance criteria unclear
- Verification command unknown
- Manual review required
- Failed test needs human judgment

Record blocked state in `.harness/BLOCKED.md` or `VERIFY.md`.

See `phase-discipline.md` → "Blocked State" for complete rules.

### Redirect Pattern

When preconditions fail:

1. **Stop immediately**
2. **Name the missing condition** (e.g., "PLAN.md not approved")
3. **Name the correct next command** (e.g., "Run harness-plan first")
4. **Ask for missing input if needed** (stop after asking)

Example:
```
Blocked: precondition failed.
Run harness-plan first.
```

---

**For complete rules, see [`phase-discipline.md`](./phase-discipline.md)**
