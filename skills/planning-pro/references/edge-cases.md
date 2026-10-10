# Planning — edge cases

## Vague or shifting goals

**Symptom:** Work starts before “done” is defined; replanning every week for the same feature set.

**Mitigation:** Stabilize **acceptance criteria** with **`business-analysis-pro`** before deep sequencing — **`quality-validation-and-guardrails.md`**.

---

## Scope churn

**Symptom:** Requirements change mid-phase; downstream tasks are obsolete.

**Mitigation:** Freeze **scope** per milestone; new work goes to a **change log** with explicit re-estimate and re-sequence. Re-run dependency graph before promising dates.

## Cross-team dependency delay

**Symptom:** Another team misses a delivery window; your critical path blocks.

**Mitigation:** Surface the dependency in **risk register** early; negotiate **buffer**, **parallel path**, or **reduced scope** (MVP) before the delay becomes a crisis.

## Unknown unknowns (legacy)

**Symptom:** Hidden constraints (data quality, perf, compliance) appear late.

**Mitigation:** Front-load **spikes** with time-boxed exit criteria; add a **“known unknowns”** section to the plan with budget for discovery.

## Resource volatility

**Symptom:** Key owner unavailable during a milestone.

**Mitigation:** **Bus factor** > 1: document handoff; split tasks so no single person is on the critical path without backup.

## Partial completion trap

**Symptom:** Many tasks started; few **done**; schedule looks green until it does not.

**Mitigation:** Enforce **WIP limits**; track **throughput** (completed units per week), not only “started.”

## Over-planning uncertain phases

**Symptom:** Detailed tasks for month 4 while month 1 is still fuzzy.

**Mitigation:** **Rolling wave** — plan next 2–4 weeks in detail; later phases stay milestone-level until prerequisites clear.

## Fixed date + fixed scope

**Symptom:** Both impossible without quality trade-offs.

**Mitigation:** Explicit **trade-off** table: cut scope, add people (if helpful), extend date, or lower quality bar — document which lever the stakeholder chose.

## Example — scope change entry (template)

```markdown
### Change 2026-04-10 — Add export to CSV
- **Impact:** +3 days; pushes P2 by 1 week unless we drop P1 polish.
- **Decision:** Approve / Defer — signed: ______
- **Plan updates:** Tasks AUTH-12, AUTH-13 added; milestone M3 date → YYYY-MM-DD
```

See also [decision-tree.md](decision-tree.md) and [anti-patterns.md](anti-patterns.md).
