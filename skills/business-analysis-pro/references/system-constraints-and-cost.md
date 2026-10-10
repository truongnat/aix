# System constraints, architecture, and cost

NFRs become actionable when tied to **feasibility** and **cost of compliance**.

## Dimensions

| Dimension | BA question | Typical handoff |
|-----------|-------------|------------------|
| **Scale / load** | Peak users, data volume growth? | Stack **`*-pro`**, **`deployment-pro`** |
| **Architecture** | Monolith vs services — constraints on autonomy, sync calls? | **`planning-pro`**, architects |
| **Latency / reliability** | p95/p99 targets; availability SLO | **`api-design-pro`** contracts, infra |
| **Data model** | Migration risk, GDPR retention, canonical entity | **`postgresql-pro`**, **`security-pro`** |
| **Cost** | Infra run-rate, vendor fees, support load | Finance, **`deployment-pro`** |

## “How hard / how much”

- Capture **order-of-magnitude** bands (**S/M/L** effort, **rough** monthly cost) when stakeholders must trade **scope vs cost** — label as **estimate**, owner **`planning-pro`** / engineering.
- **Constraint traceability** — Link FR/NFR to **design assumptions** (“assumes single-region”).

## Anti-pattern

- **NFR soup** — “Performant and scalable” without measurable targets or owner.
