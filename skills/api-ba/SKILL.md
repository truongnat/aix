---
name: api-ba
description: >-
  BA API work: api-doc, api-map, api-assess, api-design, api-checklist,
  api-test, api-readiness. Business-facing; never invent endpoints. (Hard contract.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "api,requirements"
  roles: "researcher"
  compatible: "claude,cursor,codex,gemini"

---

# API BA

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Produce a **business-facing** API artifact — not a full OpenAPI rewrite unless
asked. Prefer citing partner project documentation; never invent endpoints.

## Modes

| Mode | Alias | Focus | Primary sections |
| --- | --- | --- | --- |
| `api-doc` | `/api-doc` | Business summary of partner API | Business summary |
| `api-map` | `/api-map` | API ↔ system ↔ screen | Mapping |
| `api-assess` | `/api-assess` | Build vs buy/integrate | Assess |
| `api-design` | `/api-design` | Integration collaboration | Design |
| `api-checklist` | `/api-checklist` | What to test on the API | Checklist |
| `api-test` | `/api-test` | Executable API cases + Bruno/Postman outline | Test plan |
| `api-readiness` | `/api-readiness` | Pre-prod gate | Readiness |

Write **one** `API_BA.md` per invocation (mode recorded). Re-run to deepen another mode or append a clearly labeled section if the user asks to extend the same file.

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (the skill-local `steps/` directory).
Invoking it **is** executing every step below, in order, one at a time.

| Rule | Requirement |
| --- | --- |
| Invoke | Read `steps/step-01-init.md` immediately, finish it, then open the next step file. |
| Sequence | Finish each step, update the **progress checklist** in ``artifacts/<task-id>/PROGRESS.md`` with evidence, then read the next file. |
| No skipping | NEVER skip a step, never jump straight to the final artifact, never claim complete while any ledger row is `todo`/`blocked`. |
| Blocked | A `blocked` step stops the skill: ask (Confirm-first), resume from the earliest incomplete step. |

| Step | File | Output |
| --- | --- | --- |
| 01 | [step-01-init.md](./steps/step-01-init.md) | Init (mode + ledger) |
| 02 | [step-02-frame.md](./steps/step-02-frame.md) | Frame (inputs + scope) |
| 03 | [step-03-fill.md](./steps/step-03-fill.md) | Fill (produce artifact) |
| 04 | [step-04-self-check.md](./steps/step-04-self-check.md) | Self-check & handoff |

## Contract (mandatory)

| Field | Requirement |
|-------|-------------|
| preferred_role | `researcher` |
| Inputs | Mode, API project documentation/URL/spec, consumer screens/flows, system entities, auth constraints. |
| Outputs | `API_BA.md` from template (fill sections for the chosen mode). |
| Safety | Do NOT invent endpoints/fields. Do NOT copy secrets/tokens into artifacts. Do NOT claim production readiness or “tests passed” without evidence. **Confirm-first** when project documentation missing. |

### Required artifacts

#### `API_BA.md`
- Seed `templates/API_BA.template.md`
- Always: executive_summary, developer_overview, mode, sources, open_questions, handoff
- Mode-specific tables as labeled in the template

## Workflow (detailed mechanics — order enforced by the step files)

1. Confirm mode + source project documentation.
2. Fill the mode’s sections; leave others as `N/A (wrong mode)` or omit empty noise.
3. For `api-test`: outline cases + collection structure (Bruno/Postman); do not paste secrets.
4. For `api-readiness`: checklist with Pass/Fail/Unknown + evidence.

## Quality Standards

- [ ] Sources cited; invented bits marked Assumption.
- [ ] `api-map` rows have all three layers.
- [ ] `api-readiness` has no silent Pass.

## Output

Produce a reusable api ba artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-api-ba`** owns business analysis for API products and integrations: consumer goals, resource/action vocabulary, workflow rules, error semantics, lifecycle states, permissions assumptions, and API acceptance scenarios.

It does **not** own general business discovery, API technical design, implementation, security review, or test execution. Route cross-domain business discovery to `sk-business-analysis`, API contracts to `sk-api-design-pro`, security to `sk-api-security-pro`, and evidence to `sk-tester`/`sk-verify-pro`.

**Primary artifact:** an API business requirements packet with actors, workflows, state transitions, error outcomes, and acceptance examples. **Handoff:** pass the business contract to `sk-api-design-pro` and the scenarios to the test owner.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
