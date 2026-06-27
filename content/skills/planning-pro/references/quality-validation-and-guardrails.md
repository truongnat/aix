# Quality validation and guardrails (planning)

## Contents

1. [Verifiable plans](#verifiable-plans)
2. [Estimation honesty](#estimation-honesty)
3. [Assumption hygiene](#assumption-hygiene)
4. [Anti-fabrication](#anti-fabrication)
5. [Review checklist](#review-checklist)

---

## Verifiable plans

- Each milestone should have **observable evidence** of completion (demo, metric, signed UAT, deployed artifact — context-dependent).
- **Definition of Done** is shared before work starts — no “we thought it was done.”
- Avoid **planning-only deliverables** that do not reduce delivery risk unless in a discovery-only phase.

---

## Estimation honesty

- Prefer **ranges** or **T-shirt sizes** with documented assumptions — not false single-point precision — **`estimation-and-risk-controls.md`**.
- Separate **known work** from **explicit discovery budget** for unknown-unknown buckets — **`failure-modes-detection-mitigation.md`**.
- Track **forecast vs actual** for feedback — **`plan-system-model-and-feedback-loops.md`**.

---

## Assumption hygiene

Maintain a visible **assumption list**: dependency deliverables, staffing, vendor responsiveness, infra capacity. When an assumption breaks, trigger **re-baseline**, not silent overload.

---

## Anti-fabrication

- **Do not invent** team size, deadlines, or external dates not given by the user — mark as *TBD* and list what is needed to firm them.
- **Do not present** generated calendar dates as commitments unless framed as **illustrative** under stated assumptions.
- **Cite** when recommendations come from generic practice vs project-specific facts.

---

## Review checklist

- [ ] Goal and success criteria are stated in **measurable** or **user-verifiable** terms.
- [ ] Critical path and external dependencies are named with owners or escalation path.
- [ ] Estimates include uncertainty; spikes exist where feasibility is open.
- [ ] Trade-offs (scope / time / quality / cost) are explicit when constraints conflict.
- [ ] Next checkpoint date and **what signal** will trigger re-planning are clear.
