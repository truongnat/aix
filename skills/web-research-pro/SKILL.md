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