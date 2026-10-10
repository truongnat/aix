# Failure modes — detection and mitigation (planning)

## Contents

1. [Schedule and estimation](#schedule-and-estimation)
2. [Dependencies and handoffs](#dependencies-and-handoffs)
3. [Process and governance](#process-and-governance)
4. [People and clarity](#people-and-clarity)

---

## Schedule and estimation

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Planning fallacy** — best-case-only dates | Estimates cluster on “happy path”; no buffers | Three-point or range estimates; explicit assumptions — **`estimation-and-risk-controls.md`** |
| **Fake precision** — single date for uncertain work | No confidence interval; no spike for unknowns | Label T-shirt / ranges; time-box discovery — **`decision-tree.md`** |
| **Milestone theater** — demos without integrated value | Green status but no shippable slice | Vertical slices; DoD tied to integration — **`quality-validation-and-guardrails.md`** |
| **Optimistic concurrency** — everyone “80% done” | Many in-progress; low completion | WIP limits; definition of done — **`edge-cases.md`** |

---

## Dependencies and handoffs

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Hidden dependency** — surprise blockers mid-phase | Tasks “ready” without interface contracts | Upfront dependency map + interface owners — **`sequencing-and-dependencies.md`** |
| **Critical path denial** — soft dependencies treated as parallel | Frequent surprises from assumed “other team” work | Surface external deps in risk register with dates — **`integration-map.md`** |
| **Big-bang integration** — long branch, late merge pain | Late integration milestone; spike in defects | Thin vertical slices early; CI smoke per slice — **`ci-cd-pro`**, **`testing-pro`** |

---

## Process and governance

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Scope creep without re-baseline** | Informal additions; unchanged end date | Change log + re-estimate ritual — **`edge-cases.md`** |
| **Fixed date + fixed scope** | Pressure to “just add it” | Explicit trade-off table — stakeholders sign lever — **`edge-cases.md`** |
| **Stale plan** — document not updated after reality shifts | Plan references obsolete tasks | Rolling wave + revision triggers — **`plan-system-model-and-feedback-loops.md`** |
| **Analysis-paralysis** — endless planning, no execution | Plans without shipped increments | Cap planning time; exit with MVP cut — **`decision-framework-and-trade-offs.md`** |

---

## People and clarity

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Unclear goal / DoD** — rework loops | Retros cite “didn’t know what done meant” | Goal-backward criteria — **`business-analysis-pro`**, **`scope-and-decomposition.md`** |
| **Single point of failure** — key person on critical path | No backup; tribal knowledge | Bus factor > 1; docs + pairing — **`edge-cases.md`** |
| **Stakeholder conflict unresolved** — competing priorities | Roadmap churn without decisions | Decision log + escalation tree — **`decision-tree.md`** |
