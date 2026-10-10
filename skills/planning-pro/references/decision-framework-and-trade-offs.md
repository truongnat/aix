# Decision framework and trade-offs (planning)

## Contents

1. [Outcome-first vs activity-first](#outcome-first-vs-activity-first)
2. [Depth vs breadth (MVP)](#depth-vs-breadth-mvp)
3. [Predictive vs adaptive planning](#predictive-vs-adaptive-planning)
4. [Central plan vs empowered teams](#central-plan-vs-empowered-teams)
5. [When to prefer spikes](#when-to-prefer-spikes)

Pair with **`decision-tree.md`** for quick branches and **`plan-system-model-and-feedback-loops.md`** for ongoing revision.

---

## Outcome-first vs activity-first

| Approach | Strength | Weakness |
|----------|----------|----------|
| **Outcome-first** (goal-backward) | Aligns tasks to measurable value | Requires clear success metrics |
| **Activity-first** (task lists) | Easy to generate | Risk of busywork without validation |

**Default:** Define **done** and **acceptance signals** before expanding task lists — **`scope-and-decomposition.md`**.

---

## Depth vs breadth (MVP)

| Pressure | Lean toward |
|----------|-------------|
| Hard deadline for user value | **Vertical slice MVP** — thin end-to-end path |
| Strong integration risk | **Foundation-first** only when dependencies truly block slices |

Trade-off: shipping thin slices early vs reducing rework from wrong foundations — **`sequencing-and-dependencies.md`**.

---

## Predictive vs adaptive planning

| Context | Lean toward |
|---------|-------------|
| Stable requirements, compliance-heavy | More upfront milestones; formal gates |
| High discovery, shifting priorities | Rolling wave; shorter horizons; frequent re-plan |

Neither is “correct” — mismatch causes waste (over-planning chaos zones or under-planning stable zones) — **`edge-cases.md`**.

---

## Central plan vs empowered teams

| Pattern | Fit |
|---------|-----|
| **Single roadmap** | Strong dependency coordination; regulatory alignment |
| **Team-owned backlogs** with interfaces | Parallel squads; needs contract discipline |

**Risk:** Interface drift — mitigate with explicit API / UX contracts — **`api-design-pro`**, **`business-analysis-pro`** when ambiguous.

---

## When to prefer spikes

Use **time-boxed spikes** when:

- Feasibility is uncertain (integration, perf, unknown legacy).
- Choice has irreversible cost (technology lock-in).

**Exit criteria:** ADR, prototype, measurement, or go/no-go — **`decision-tree.md`** (Spike vs implement).
