# Plan system model and feedback loops

## Contents

1. [System view](#system-view)
2. [Inputs and constraints](#inputs-and-constraints)
3. [Artifacts (outputs of planning)](#artifacts-outputs-of-planning)
4. [Execution feedback](#execution-feedback)
5. [Plan revision triggers](#plan-revision-triggers)

---

## System view

Treat planning as a **control loop**, not a one-time document:

```
Goals & constraints → Decomposition → Sequencing & allocation
        ↑                                      ↓
   Re-plan / gates                    Execution & measurement
```

**Why:** Plans fail when feedback from reality (velocity, defects, dependency slips) never updates the model — **`failure-modes-detection-mitigation.md`**.

---

## Inputs and constraints

| Input | Used to |
|-------|---------|
| **Outcome / success criteria** | Anchor backward planning — **`scope-and-decomposition.md`** |
| **Deadline, budget, capacity** | Bound parallelism and scope — **`estimation-and-risk-controls.md`** |
| **Dependency graph** (technical + org) | Order work — **`sequencing-and-dependencies.md`** |
| **Risk tolerance** | Spike vs implement — **`decision-tree.md`** |

Missing inputs produce **fantasy schedules** — **`quality-validation-and-guardrails.md`**.

---

## Artifacts (outputs of planning)

Typical durable artifacts:

- **Work breakdown** — verifiable units with acceptance signals.
- **Milestone map** — dates or order with **explicit assumptions**.
- **Dependency / critical path view** — what blocks what.
- **Risk register** — triggers, mitigations, owners.
- **Decision log** — trade-offs when scope/date/quality conflict.

Granularity should support **weekly** or **per-sprint** checkpointing without requiring false precision months out — **`edge-cases.md`** (rolling wave).

---

## Execution feedback

Signals that should feed the next plan revision:

- **Throughput** — completed units per interval; WIP vs done.
- **Defect / rework rate** — quality drain on estimates.
- **Dependency health** — external deliverables on track.
- **Estimate error** — actual vs planned for similar task classes.

Without feedback, the plan is **decorative** — **`anti-patterns.md`**.

---

## Plan revision triggers

Re-baseline when any of:

- Scope change over agreed threshold.
- Critical path slip beyond buffer.
- New blocker or compliance gate discovered.
- Spikes invalidate a key assumption.

Document **what changed** and **which levers** (scope, date, people, quality) moved — **`edge-cases.md`** change template.
