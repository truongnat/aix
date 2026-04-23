# Planning — decision trees (support tier)

Lightweight trees for **when to choose** a planning approach — not a replacement for full domain skills.

## Spike vs direct implementation

```
Uncertainty high on feasibility or integration?
├── Yes → Time-boxed spike (exit: ADR, prototype, or go/no-go)
└── No → Implement directly with normal task breakdown
```

## MVP vs full scope first

```
Must ship value before hard deadline?
├── Yes → Vertical slice MVP; defer non-critical backlog
└── No → Can sequence foundation-first if dependencies require it
```

## Parallel vs sequential workstreams

```
Tasks share same files or same production subsystem?
├── Yes → Serialize or strict ownership per area
└── No → Parallelize with clear interface contracts
```

## When to escalate

```
Slip exceeds agreed buffer OR critical path risk realized?
├── Yes → Escalate with options (scope, date, resources)
└── No → Update plan at next checkpoint only
```

## Rolling wave vs big design upfront

```
Certainty high for next month but fuzzy beyond?
├── Yes → Detail 2–4 weeks; later phases stay milestone-only — **`edge-cases.md`**
└── No → Short spikes first; avoid fake task lists — **`plan-system-model-and-feedback-loops.md`**
```

## When NOT to use a Gantt chart

- One-person tasks with no cross-team dependencies — a simple ordered list + milestones is enough.
