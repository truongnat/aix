---
name: web-research-pro
description: |
  Production-grade multi-step web and technical research: verification model (source hierarchy, triangulation), failure modes (single weak source, SEO drift, 404/link rot, fabricated citations), decision trade-offs (depth vs time, KB-first vs web-first, archive vs live), quality guardrails (no invented URLs or benchmarks; uncertainty explicit).

  Use this skill when the user needs **reliable** answers from **external** sources (framework docs, APIs, standards), **not** only local Markdown — or when combining **local KB** with **web** verification. Complements **`repo-tooling-pro`** (local RAG scripts) but does not replace **reading** `knowledge-base/documents/` when the answer is already in-repo.

  Use **with** **`repo-tooling-pro`** when the corpus is **this** repo’s KB; **`security-pro`** when sources might touch **secrets** or **unsafe** links; **`planning-pro`** when research informs release decisions.

  Triggers: "search the docs", "official documentation", "404", "source evaluation", "citation", "compare sources", "multi-step research", "API reference", "changelog", "is this still true", "link rot", "query_kb", "Wayback", "SEO blog wrong", "breaking change", "deprecation", "RFC", "MDN", "Stack Overflow outdated".

metadata:
  short-description: Web research — verification, sources, failure modes, citations
  content-language: en
  domain: research-methods
  level: professional
---

# Web research (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use **vendor official documentation** and **primary** repositories for **API truth**; this skill encodes **how** to search, **verify**, and **cite** — not a replacement for **`security-pro`** or legal advice. Confirm **product**, **version**, and whether **local** KB (this repo) should be queried first.

## Boundary

**`web-research-pro`** owns **research method, source hierarchy, and citation hygiene**. **`repo-tooling-pro`** owns **running** local RAG scripts on **indexed** Markdown. Stack **`*-pro`** skills own **implementation truth** for a framework once sources are verified.

## Related skills (this repo)

| Skill | When to combine with `web-research-pro` |
|-------|----------------------------------------|
| **`repo-tooling-pro`** | **`query_kb` / `query_kb_batch`** when **`knowledge-base`** is built and relevant |
| **`security-pro`** | Untrusted links, paste from unknown sites, supply chain |
| **`data-analysis-pro`** / **`content-analysis-pro`** | Research supports analysis — not the same as EDA |
| **`skills-self-review-pro`** | After **`analyze_skills`**, tech-refresh bundled references from official docs |
| **`planning-pro`** | Research feeds scope/risk decisions — keep citations traceable |

## When to use

- **Framework** or **API** behavior **not** in the local project.
- **Comparing** multiple sources or **resolving** a **404** / moved doc path.
- **Version-specific** questions (release notes / changelog).
- **Citations** — user wants **links** and **traceable** claims.

## When not to use

- **Answer is already authoritative in-repo** and freshness is not in doubt — read project docs first.
- **Legal interpretation** or **licensing** final calls — point to counsel; this skill only surfaces sources.

## Required inputs

- **Product/library name** and **version** when API behavior matters.
- Whether **`build_kb`** / **`query_kb`** applies for this repo.

## Expected output

Follow **Suggested response format (STRICT)** — context through residual risks.

## Workflow

1. Confirm scope (library, version), **local KB** availability, and **freshness** needs.
2. Apply summaries; open `references/` for depth; run **`query_kb`** when **`knowledge-base`** may already hold the answer (**`repo-tooling-pro`**).
3. Respond with **Suggested response format (STRICT)**; include **failure modes** when source quality is mixed.

### Operating principles

1. **Official first** — Primary docs and source repos beat random tutorials — **`web-research-verification-system-model.md`**.
2. **Version pinned** — Match runtime and doc generation when possible — **`versions.md`**.
3. **Verify** — Cross-check signatures and defaults; breaking changes in changelogs — **`failure-modes-detection-mitigation.md`**.
4. **Cite** — Stable URLs; short quotes when precision matters — **`citations-and-stale-urls.md`**.
5. **404s** — Search vendor site for symbol; do not assume first hit is current — **`workflow-sources-and-evaluation.md`**.
6. **Local KB** — Prefer indexed `documents/` when authoritative **for this project**; **web** when upstream or external — **`decision-framework-and-trade-offs.md`**.

### Verification and source model (summary)

Source hierarchy, triangulation, KB vs web — **`web-research-verification-system-model.md`**.

Details: [references/web-research-verification-system-model.md](references/web-research-verification-system-model.md)

### Failure modes — detection and mitigation (summary)

Single-source, SEO drift, stale pages, fabricated citations — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

Depth vs time, KB-first vs web-first, archive vs live — **`decision-framework-and-trade-offs.md`**, **`decision-tree.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

Evidence discipline, citation hygiene, uncertainty language — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### Workflow and source evaluation (summary)

Decomposition, authority, recency, cross-check; relation to **`query_kb`** — **`workflow-sources-and-evaluation.md`**.

Details: [references/workflow-sources-and-evaluation.md](references/workflow-sources-and-evaluation.md)

### Citations and stale URLs (summary)

Canonical links, 404 handling, KB rebuild vs stale vectors — **`citations-and-stale-urls.md`**.

Details: [references/citations-and-stale-urls.md](references/citations-and-stale-urls.md)

### Tips and tricks (summary)

Query log, `site:` filters, version in search strings — **`tips-and-tricks.md`**.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

Conflicting sources, SEO spam, AI summaries as unreliable primary — **`edge-cases.md`**.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Source hierarchy, freshness, KB-first vs web-first — **`decision-tree.md`**, **`anti-patterns.md`**.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`integration-map.md`**.

Details: [references/integration-map.md](references/integration-map.md)

### Versions and archives (summary)

Pin runtime to doc generation; archive date when live site diverges — **`versions.md`**.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Target library/product, version, region or access limits, whether local KB was queried.
2. **Problem / goal** — Exact API/behavior to verify; tolerance for ambiguity.
3. **System design** — Source plan (primary → secondary → tertiary) and triangulation — **`web-research-verification-system-model.md`**.
4. **Decision reasoning** — KB-first vs web-first; depth vs time — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Search queries, stable URLs, optional **`query_kb`** command lines — still labeled **implementation sketch**; meet **`quality-validation-and-guardrails.md`**.
6. **Trade-offs** — Freshness vs time spent; archive vs live claim strength.
7. **Failure modes** — Single-source, SEO mirrors, stale KB — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Conflicting sources, low confidence areas, hand off to **`security-pro`** or stack **`*-pro`** for implementation follow-through.

## Resources in this skill

| Topic | File |
|-------|------|
| **Verification & source model** | [references/web-research-verification-system-model.md](references/web-research-verification-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Workflow & evaluation | [references/workflow-sources-and-evaluation.md](references/workflow-sources-and-evaluation.md) |
| Citations & stale URLs | [references/citations-and-stale-urls.md](references/citations-and-stale-urls.md) |
| Tips | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions & archives | [references/versions.md](references/versions.md) |

## Quick examples

**Input (simple):** “Does `fetch` in Next.js 15 cache by default?” — official doc returns **404**.  
**Expected output:** Full **Suggested response format (STRICT)** — site search, current page, App Router vs Pages caveat, version-tagged link.

**Input (tricky):** Two blogs disagree; no changelog hit.  
**Expected output:** Prefer source repo / types / release notes; rank sources; **low confidence** + verification steps.

**Input (cross-skill):** “Refresh `nestjs-pro` references from official docs.”  
**Expected output:** **`skills-self-review-pro`** scope; this skill for NestJS current docs + changelog; **`repo-tooling-pro`** only if checking in-repo KB.

## Checklist before calling the skill done

- [ ] **Primary** or triangulated secondary for API facts — **`workflow-sources-and-evaluation.md`**.
- [ ] **Version** aligned with user runtime when it matters — **`versions.md`**.
- [ ] **Local** `knowledge-base` considered when **`build_kb`** has been run — **`decision-tree.md`**.
- [ ] **404** / moved path handled with search or archive as labeled secondary — **`citations-and-stale-urls.md`**.
- [ ] **Conflicting** sources triangulated; single weak source flagged — **`failure-modes-detection-mitigation.md`**.
- [ ] **Citations** stable enough for follow-up — **`quality-validation-and-guardrails.md`**.
- [ ] **Untrusted** links / paste risks noted (**`security-pro`**) when relevant.
