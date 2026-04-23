# Workflow: arch-review

Structured **architecture / design review** before or after a significant change: boundaries, coupling, failure modes, and alignment with NFRs (scalability, operability, security).

**Domain:** `dev` — **`workflows/dev/`**. **Filename:** `arch-review.md`.

**Invoke:** `/arch-review`

## Metadata

| Field | Value |
|-------|-------|
| **id** | `arch-review` |
| **version** | 1.0 |

## Inputs

| Variable | Required | Description |
|----------|----------|-------------|
| `design_artifact` | Yes | Diagram link, ADR draft, RFC, or prose description |
| `constraints` | No | Latency, cost, compliance, team size |
| `domain_stack` | No | For skill routing |

## Outputs

| Variable | Description |
|----------|-------------|
| `review_summary` | Strengths, risks, open questions |
| `decision_recommendation` | Proceed / revise / split / defer |
| `adr_snippets` | Bullet list suitable for ADR sections |

## Decision paths

- **Greenfield vs brownfield:** Brownfield — start with **current state** inventory (Step 2).
- **Too vague:** Stop after Step 1 with **questions list**; do not invent architecture.
- **Monolith vs microservices:** Use `microservices-pro` only if boundaries are in scope.

## Error handling

- **Missing diagrams:** Produce **textual component list** and **dependency table** before judging.
- **Conflicting requirements:** Surface trade-offs explicitly; avoid single “best” answer without weights.

## Output format

Use **[`OUTPUT_CONVENTIONS.md`](../../OUTPUT_CONVENTIONS.md)** for severity of risks.  
For **decisions to record**, use **[`templates/report/architecture-decision-record.md`](../../templates/report/architecture-decision-record.md)**.

## Time estimate

| Depth | When | Rough time |
|-------|------|------------|
| **Quick** | Single service change | < 1 h |
| **Standard** | Cross-team feature | 2–4 h |
| **Deep** | Platform or multi-region | > 1 day |

## Escalation

- **Human:** Org-wide standards, vendor selection, budget.
- **Autonomous:** Trade-off tables, risk registers, ADR drafting.

## Steps

### Step 1 — `frame-problem`

- **Type:** skill
- **Skill:** `planning-pro`
- **Input:** `design_artifact`, `constraints`
- **Output:** Goals, non-goals, NFRs, **in scope / out of scope**.

### Step 2 — `map-structure-and-dependencies`

- **Type:** skill
- **Skill:** `clean-code-architecture-pro` + `microservices-pro` (if distributed)
- **Input:** Components, data flows, external systems
- **Output:** Boundary critique; coupling/cohesion notes.

### Step 3 — `stress-failure-and-ops`

- **Type:** skill
- **Skill:** `planning-pro` + `deployment-pro` (or `api-design-pro` for API-heavy designs)
- **Input:** Failure scenarios (dependency down, traffic spike, bad deploy)
- **Output:** Blast radius, rollback, observability gaps.

### Step 4 — `security-and-privacy-pass`

- **Type:** skill
- **Skill:** `security-pro` (lightweight pass; deep dive → `w-security-audit`)
- **Input:** Trust boundaries, data classification
- **Output:** Threat notes and **must-fix** architectural controls.

### Step 5 — `synthesize-and-record`

- **Type:** skill
- **Skill:** `feedback-pro`
- **Input:** Steps 1–4
- **Output:** `review_summary`, `decision_recommendation`, `adr_snippets`.

## Notes

- Prefer **options with pros/cons** over a single narrative when stakeholders disagree.
