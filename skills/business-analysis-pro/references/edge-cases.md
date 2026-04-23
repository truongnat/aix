# Business analysis edge cases

## Vague or shifting requirements

- **Sign-off scope** — Re-baseline when “small change” accumulates; use **change request** with impact (time, cost, risk).
- **HiPPO** — Highest paid person’s opinion; still document **criteria** and **trade-offs** for audit trail.

## Conflicting stakeholders

- **Facilitated decision** — Same options and scores visible to all; **escalation** path if deadlock.
- **Hidden stakeholder** — Late blocker (security, legal, brand) — use **`stakeholder-dynamics.md`** power/interest review.
- **Silent veto** — “I didn’t know I had to approve” — RACI + **written** decision checkpoints.

## Technical unknowns

- **Spike / POC** — Time-boxed; **hypothesis** and **success criteria** before build; feed results back into requirements.

## Regulatory and security

- **Legal wording** — Don’t paraphrase compliance; **reference** clause + plain-language summary; involve **`security-pro`** for threat framing.
- **Ambiguous regulation** — External counsel; BA documents **questions**, not fake legal certainty.
- **Conflicting jurisdictions** — Flag for legal; requirements may need **region-specific** variants.

## Documentation debt

- **Living doc** — Owner and **review cadence**; stale BRD worse than none (wrong decisions).

## Offshore / async

- **Written decisions** — Chat decisions copied into **decision log**; timezone-friendly **RFC** process for large changes.

## AI-generated drafts

- **Verify** facts, IDs, and dates; AI is a **draft** assistant, not signatory.

---

## Product / business metrics

- **Wrong optimization** — Team hits local KPI while **north star** degrades — **`metrics-hierarchy-and-guardrails.md`**.
- **Vanity metrics** — Volume without quality or revenue linkage.
- **Conflicting KPIs** between teams — portfolio escalation; explicit trade-off in decision record.

## Requirements quality

- **Correct but useless** — Satisfies wording but no user outcome — tie to **`product-thinking-and-outcomes.md`**.
- **Over-specification** — Locks UX/engineering unnecessarily; prefer **outcome + constraints**.
- **Under-specification** — Untestable or “TBD everywhere” — spike or defer with **risk** logged.

## Delivery and dependencies

- **Scope creep via “tiny change”** — Change control; impact on **`planning-pro`** timeline.
- **Upstream team delay** — Dependency risk register — **`risk-modeling.md`**.
- **Contract mismatch** — BA doc says X, dev backlog says Y — single **traceability** source of truth.

## Politics

- **Political override** — Decision goes against analysis; document **accepted risk** and sponsor sign-off.
