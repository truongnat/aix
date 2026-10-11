---
name: gap-analysis
description: >-
  BA quality: gap analysis (/gap) or change-request impact (/cr). Writes GAP.md
  or CR.md with impact on related project documentation and Confirm-first blockers. (Hard contract.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "analysis,requirements"
  roles: "researcher"
  compatible: "claude,cursor,codex,gemini"

---

# Gap analysis / Change request

## Shared preamble (do this first)

## Working principles

Use clear, concrete language. Cite paths and IDs, distinguish evidence from assumptions, and record open questions instead of inventing details.

## Purpose

Two quality modes:

| Mode | Alias | Output | Use when |
| --- | --- | --- | --- |
| `gap` | `/gap` | `GAP.md` | Feature missing flows/rules/AC/capabilities |
| `cr` | `/cr` | `CR.md` | Analyze a change’s impact and list project documentation to update |

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
| preferred_role | `critic` |
| Inputs | Mode; for `gap`: feature + specs; for `cr`: change description + affected artifacts. |
| Outputs | One mode file from the matching template. |
| Safety | Do NOT invent gaps without expectation source. Do NOT silently rewrite product project documentation in `cr` — list update plan and Confirm-first before bulk edits. Do NOT close Blocking items without user confirmation. |

### Required artifacts

- `gap` → seed `templates/GAP.template.md` → `GAP.md`
- `cr` → seed `templates/CR.template.md` → `CR.md`

## Workflow (detailed mechanics — order enforced by the step files)

### Mode `gap`
1. State subject + expectation baseline.
2. Inventory covered flows/rules/AC/UI/API.
3. List gaps with severity Critical/High/Medium/Low.
4. Ask Blocking questions; commit Work.

### Mode `cr`
1. State change request (who/what/why).
2. Impact matrix: process, data, UI, API, rules, AC, tests, ops.
3. List artifacts to update (path + action add/change/retire).
4. Residual risks + Confirm-first on scope; commit Work.
5. Only after user confirms: hand off to `sk-specify` / `sk-story-spec` / `project documentation` / etc. to apply updates.

## Quality Standards

- [ ] Correct mode file.
- [ ] Each gap/impact row has evidence + recommendation.
- [ ] `cr` includes artifact update plan (not silent rewrites).
      (or `no repository changes are required`).

## Output

Produce a reusable gap analysis artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-gap-analysis`** owns the current-versus-target capability or evidence gap register: missing flows, rules, acceptance criteria, documentation, dependencies, impact, and remediation priority.

It does **not** own applying fixes, inventing an unapproved target state, or accepting the final release. Route remediation sequencing to `sk-planning`, implementation to the domain owner, and evidence sufficiency to `sk-verify-pro`.

**Primary artifact:** `GAP.md` or `CR.md` with observed state, target state, gap evidence, impact, priority, and proposed next owner. **Handoff:** pass prioritized gaps to `sk-planning` or the responsible domain owner.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
