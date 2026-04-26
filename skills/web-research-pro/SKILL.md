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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** scope (library, version), **local KB** availability, and **freshness** needs. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

1. **Think Before Coding** — Confirm product, version, freshness needs, and whether local KB should be checked first. Ask when citation or recency requirements materially change the answer.
2. **Simplicity First** — Use the smallest trustworthy source set that answers the question. Do not over-research when one primary source is sufficient.
3. **Surgical Changes** — Gather only the sources relevant to the user’s question. Do not sprawl into adjacent topics or citation dumps.
4. **Goal-Driven Execution** — Done = claims are traceable to sources, confidence is clear, and stale or conflicting evidence is called out explicitly.
5. **Primary sources first** — Official docs, standards, repos, and changelogs outrank blogs, SEO content, or forum summaries for factual claims.
6. **Freshness is part of truth** — For unstable topics, publication date and version context are required, not optional.
7. **Citations are evidence, not decoration** — Every critical claim should be attributable, especially when the answer could drift.
8. **Local and web have different jobs** — In-repo KB answers project truth; the web answers external truth or freshness.

## Default recommendations by scenario

- **API or framework question** — Start with official docs and versioned changelogs.
- **Project-specific + external question** — Check local KB first, then verify external facts on the web.
- **Conflicting sources** — Prefer primary/official sources and explain the conflict explicitly.
- **Moved or dead docs** — Use changelogs, repo history, or archive context before trusting SEO mirrors.

## Decision trees

Summary: decide when to stay local, when to browse externally, and how many sources are needed based on drift risk and claim criticality.

Details: [references/decision-tree.md](references/decision-tree.md)

## Anti-patterns

Summary: trusting a single weak source, citing outdated SEO pages over official docs, and presenting unverified memory as current fact.

Details: [references/anti-patterns.md](references/anti-patterns.md)

### Web research verification system model (summary)

How source hierarchy, triangulation, and confidence framing should work so research stays reliable under drift.

Details: [references/web-research-verification-system-model.md](references/web-research-verification-system-model.md)

### Workflow, sources, and evaluation (summary)

How to search, compare, and evaluate sources without confusing authority, freshness, and relevance.

Details: [references/workflow-sources-and-evaluation.md](references/workflow-sources-and-evaluation.md)

### Citations and stale URLs (summary)

How to handle moved docs, archives, stale links, and citation hygiene for answers that need traceability.

Details: [references/citations-and-stale-urls.md](references/citations-and-stale-urls.md)

### Failure modes and mitigation (summary)

Single-source errors, version drift, broken links, and fabricated or stale citations to avoid.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Versions (summary)

How version context changes the interpretation of docs, changelogs, and deprecations.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT)

1. **Context** — Product/library, version, freshness needs, and whether local KB was relevant.
2. **Source strategy** — Which source classes were used and why they were sufficient.
3. **Findings** — Source-backed answer with clear attribution and confidence.
4. **Conflicts or caveats** — Any source disagreement, stale docs, or version ambiguity.
5. **Residual risks** — What may still drift or need deeper verification.

## Resources in this skill

| Topic | File |
|-------|------|
| Web research verification system model | [references/web-research-verification-system-model.md](references/web-research-verification-system-model.md) |
| Workflow, sources, and evaluation | [references/workflow-sources-and-evaluation.md](references/workflow-sources-and-evaluation.md) |
| Citations and stale URLs | [references/citations-and-stale-urls.md](references/citations-and-stale-urls.md) |
| Failure modes and mitigation | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework and trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Tips and tricks | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Quality validation and guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Version notes | [references/versions.md](references/versions.md) |

## Quick example

**Input:** "Is this React API still current in the latest docs?"
- Confirm version sensitivity and go to the official docs or changelog first.
- Do not answer from memory when the API could have shifted recently.
- **Verify:** The response cites the current official source and notes any version boundary.

**Input (tricky):** "This blog says a config flag exists, but the docs 404."
- Prefer official repos/changelogs and note that the weak source may be stale or wrong.
- Do not preserve the claim just because it is repeated across SEO pages.
- **Verify:** The final answer states whether the flag exists and where that conclusion came from.

**Input (cross-skill):** "Use local KB and official docs to verify our skill references are still current."
- Pair **`repo-tooling-pro`** or **`skills-self-review-pro`** for local state, and use **`web-research-pro`** for external freshness.
- Keep project truth and external truth clearly separated.
- **Verify:** Each refreshed claim has both local context and external citation where needed.

## Checklist before calling the skill done

- [ ] Product, version, freshness needs, and local-KB relevance confirmed first (Think Before Coding)
- [ ] Minimum trustworthy source set used; no unnecessary research sprawl (Simplicity First)
- [ ] Only sources relevant to the current question were gathered (Surgical Changes)
- [ ] Success criteria, source attribution, and confidence are explicit (Goal-Driven Execution)
- [ ] Primary sources are preferred for critical claims
- [ ] Version/date context is stated where drift matters
- [ ] Conflicting or stale sources are called out explicitly
- [ ] Residual uncertainty is documented rather than hidden
