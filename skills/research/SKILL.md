---
name: research
description: "Research internal or external sources before making technical/product decisions. Source-backed findings, comparison matrix, recommendations with citations and caveats. (Hard contract in this SKILL.md — MUST follow.)"
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "documentation,research,business"
  roles: "writer,analyst,product-manager"
  compatible: "claude,cursor,codex,gemini"

---

# Research

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Collect, verify, and synthesize evidence to support technical, product, or operational decisions.

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (`the skill-local `steps/` directory`).
Invoking it **is** executing every step below, in order, one at a time.

| Rule | Requirement |
| --- | --- |
| Invoke | Read `steps/step-01-init.md` immediately, finish it, then open the next step file. |
| Sequence | Finish each step, update the **progress checklist** in ``artifacts/<task-id>/PROGRESS.md`` with evidence, then read the next file. |
| No skipping | NEVER skip a step, never jump straight to the final artifact, never claim complete while any ledger row is `todo`/`blocked`. |
| Blocked | A `blocked` step stops the skill: ask (Confirm-first), resume from the earliest incomplete step. |

| Step | File | Output |
| --- | --- | --- |
| 01 | [step-01-init.md](./steps/step-01-init.md) | Init (seed + question) |
| 02 | [step-02-evidence.md](./steps/step-02-evidence.md) | Evidence (sources + findings) |
| 03 | [step-03-synthesize.md](./steps/step-03-synthesize.md) | Synthesize (matrix + recommendation) |
| 04 | [step-04-self-check.md](./steps/step-04-self-check.md) | Self-check & handoff |

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts.

| Field | Requirement |
|-------|-------------|
| preferred_role | `researcher` (routing hint for multi-CLI; fallback main). |
| Inputs | Research question, decision context, local evidence, external source constraints, freshness requirement, quality bar. |
| Outputs | `RESEARCH.md` (prefer template) with **keywords**, source strategy, evidence, findings, comparison matrix, recommendation, confidence, caveats, residual risks. |
| Safety | Do NOT fabricate citations. Do NOT copy long source content. Do NOT use stale sources for decisions needing fresh information. Do NOT present inference as fact. Do NOT omit caveats, residual risks, or Spec quality challenges (feasibility/correctness/capability gaps). Do NOT leave opaque domain terms unexplained — fill Keywords or mark none. **Confirm-first:** Blocking gaps → STOP, classify Ask method, ask in chat before finishing RESEARCH as a quiz-as-document. |

### Required artifacts

#### `RESEARCH.md`
- Required: yes
- Prefer seed: `templates/RESEARCH.template.md`
- **executive_summary** (required, array): Maximum five bullets with answer, strongest evidence, caveat/risk, recommendation, and next action.
- **developer_overview** (required, object): Research status, answer confidence, top caveat, next action.
- **keywords** (required, object): Term \| Meaning (`the user-requested language`) \| Where seen; or `_(none — plain language)_`. Cap 3–12. See the skill instructions → Keywords.
- **charts** (optional, array): Mermaid comparison chart when useful; otherwise N/A.
- **question** (required, string): Research question.
- **decision_context** (required, string): What decision this sk-research supports.
- **status** (required, string): Complete / Complete with caveats / Partial / Blocked.
- **source_strategy** (required, array): Source type, purpose, notes.
- **sources_reviewed** (required, array): Source ID, name, type, date/version, relevance.
- **findings** (required, array): Finding, evidence, confidence.
- **comparison_matrix** (optional, table): Option columns x criteria rows.
- **recommendation** (required, string): Recommended option, confidence, reason, why not alternatives.
- **spec_quality_sk-review** (required when sk-research supports a feature/spec decision, object): Feasibility, Correctness, Capability recommendations inferred from evidence.
- **caveats** (optional, array): Caveat with impact and mitigation.
- **residual_risks** (optional, array): Risk, impact, suggested follow-up.
- **handoff** (required, string): Ready for sk-planning/sk-execution? Required verification?

### Reference

## Quality Standards

- [ ] Source quality is noted (Primary/Secondary/Community/Marketing/Unknown).
- [ ] Keywords filled (or none) for opaque terms in findings/recommendation.
- [ ] Freshness is checked for time-sensitive information (API versions, pricing, features).
- [ ] Facts, inferences, and opinions are separated.
- [ ] Comparison matrix exists when multiple options are evaluated.
- [ ] Recommendation includes confidence level (High/Medium/Low).
- [ ] When researching a feature/spec, Spec quality sk-review covers Feasibility, Correctness, and Capability gaps suggested by evidence.
- [ ] Caveats and residual risks are documented.

Use `references/source-evidence-and-reproducibility.md` to preserve source IDs, claim support, search method, conflicts, confidence, reproducibility notes, and handoff evidence.

- [ ] Confirm-first: on Blocking need, STOP immediately; classify Ask method (`confirm`/`choice`/`fact`/`table`/`diagram`/`html`); ask that way; finished artifact is not a quiz — residual Open questions non-blocking only (the skill instructions).

## WRONG vs CORRECT

```markdown
// WRONG — no source, no freshness check
React 19 supports server components.

// CORRECT — sourced and versioned
Fact (source: react.dev blog, 2026-03): React 19.1 stable supports server components.
Freshness: checked 2026-07-13.
Caveat: The recommendation only applies if the repo uses React 19+.
```

```markdown
// WRONG — no comparison, just listing
Option A and B are both good.

// CORRECT — comparison matrix with criteria
| Criteria | Option A (Library X) | Option B (Library Y) |
|---|---|---|
| License | MIT | AGPL (⚠️ restriction) |
| Bundle size | 12KB | 45KB |
| Last release | 2026-06 | 2025-03 (⚠️ stale) |
| Native ESM | Yes | No |
Recommendation: Option A. Lower risk, better license, lighter bundle.
```

## Edge Cases

| Situation | Handling |
|---|---|
| Official sk-docs contradict community sources | Prefer official sk-docs. Document the conflict and why the official source was chosen. |
| Pricing page does not list pricing | Document as caveat. Do NOT guess pricing. |
| Source is too old (>1 year for fast-moving tools) | Lower confidence, recommend verification before implementation. |
| No external sources available (offline) | Mark as "offline sk-research only". Document limitations. |
| Research question is too broad | Narrow to 2-3 sub-questions. Recommend sk-planning the sk-research scope. |

## Limitations

- Does NOT implement.
- Does NOT replace sk-planning or sk-investigate.
- Does NOT guarantee external sources are always correct.

## Output

Produce a reusable research artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary

**`sk-research`** owns **source-backed research planning, evidence evaluation, synthesis, comparison, recommendation, and caveat discipline**. It does not own **implementation, unsupported citation claims, or decisions without source/freshness evidence**; route those concerns to the appropriate specialist skill.

## When not to use

- When the request is outside `sk-research`'s documented scope or another specialist is the primary owner.
- When the requested result would require unsupported format guarantees, fabricated evidence, or an unverified external claim.

## Required inputs

- research question, decision context, local/external source constraints, freshness requirement, quality bar, and output language.
- State assumptions, evidence gaps, confidence, and limitations explicitly.

## Cross-skill handoffs

- sk-web-research-pro for source collection; sk-market-research-pro for market sizing; sk-business-analysis for requirements; sk-planning for execution.

## Wave 3 evidence pack

Read [`references/wave3-evidence-pack.md`](./references/wave3-evidence-pack.md) when the task requires the Wave 3 positive/negative fixture and evidence packet. The skill prepares bounded evidence; `sk-verify-pro` owns the final claim-to-evidence decision.
