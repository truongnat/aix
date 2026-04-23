---
name: seo-pro
description: |
  Production-grade SEO: organic search lifecycle system model, failure modes (index bloat, JS rendering gaps, soft 404, mis-attribution), decision trade-offs (SSR vs client, indexing aggressiveness, rich results vs maintenance), quality guardrails (no guaranteed rankings; cite Search Central / Bing).

  Use this skill when the user asks about organic search visibility, Google Search Console, Bing Webmaster, robots.txt, XML sitemaps, canonical and hreflang, meta titles/descriptions, structured data (JSON-LD), E-E-A-T, internal linking, JavaScript SEO, duplicate content, pagination, international SEO, or Core Web Vitals vs SEO.

  Use **with** **`nextjs-pro`** (Metadata API, `sitemap.ts`, `robots.ts`, RSC/SSR for crawlable HTML), **`react-pro`** (SPA rendering constraints, document head), **`deployment-pro`** (CDN, caching, TTFB). This skill (`seo-pro`) owns **search strategy and SEO mechanics**; framework skills own **framework-specific implementation**.

  Triggers: "SEO", "organic search", "Google Search Console", "GSC", "sitemap", "robots.txt", "canonical", "hreflang", "meta title", "meta description", "structured data", "schema", "JSON-LD", "Core Web Vitals", "LCP", "CLS", "INP", "indexing", "crawl", "noindex", "duplicate content", "international SEO", "E-E-A-T", "rich results", "Bing Webmaster", "faceted navigation SEO", "soft 404", "crawl budget", "JS rendering SEO", "snippet".

metadata:
  short-description: SEO — lifecycle, technical crawl, failure modes, measurement
  content-language: en
  domain: seo
  level: professional
---

# SEO (professional)

Skill text is **English**; answer in the user’s preferred language when rules or the conversation specify it.

Use [Google Search Central](https://developers.google.com/search/docs) and [Bing Webmaster guidelines](https://www.bing.com/webmasters/help/webmasters-guidelines-30fba23a) for platform rules; rankings are **not guaranteed**. This skill encodes **lifecycle discipline**, **technical discoverability**, and **intent-aligned** content patterns. Confirm **market** (locales, domains), **CMS/framework**, and whether **search** is a primary channel.

## Boundary

**`seo-pro`** owns **search strategy**, **technical/on-page SEO patterns**, **measurement framing**, and **lifecycle**. **`nextjs-pro`** / **`react-pro`** own **implementation** of metadata, routing, and rendering. **`deployment-pro`** owns **CDN/edge** operations as primary topic.

## Related skills (this repo)

| Skill | When to combine with `seo-pro` |
|-------|--------------------------------|
| **`nextjs-pro`** | `generateMetadata`, `sitemap.ts` / `robots.ts`, App Router SSR/SSG, URL structure |
| **`react-pro`** | Client-heavy apps; head management; hydration and crawlable output |
| **`deployment-pro`** | CDN, edge caching, headers affecting TTFB and global crawl |
| **`testing-pro`** | Contract or smoke tests for critical meta/HTTP status in CI (optional) |

Do **not** duplicate framework API tutorials; state **SEO requirement** here and **implementation hook** in the sibling skill.

## When to use

- Running or reviewing the **full SEO flow**: baseline → audit → strategy → ship → measure → iterate.
- **Technical SEO**: indexing, robots, sitemaps, canonical, `hreflang`, structured data, CWV.
- **On-page** templates: titles, headings, internal links, snippet-oriented copy.
- **Edge cases**: SPAs, faceted nav, staging leaks, international, algorithm quality.

## When not to use

- **Pure paid acquisition** (SEM/PPC campaign ops) as the only topic — different playbook unless landing page SEO is in scope.
- **Black-hat or guideline-violating** tactics — refuse; cite risk.

## Required inputs

- **Locales/domains** and whether **GSC/Bing** access exists for diagnosis.
- **Primary channel** hypothesis (SEO vs other growth).

## Expected output

Follow **Suggested response format (STRICT)** — eight sections including measurement honesty.

## Workflow

1. Confirm search goals, locales, tech stack, and **which framework skill** implements HTML/routing.
2. Apply the principles and topic summaries below; open `references/` when you need depth; defer **Next.js/React wiring** to **`nextjs-pro`** / **`react-pro`** when the task is code-specific.
3. Respond using **Suggested response format (STRICT)**; note measurement lag, algorithm uncertainty, and **residual** technical/content risks.

### Operating principles

1. **Intent first** — Match page type to **query intent**; avoid thin doorway pages.
2. **One canonical URL per piece of content** — Consolidate duplicates with redirects and canonicals.
3. **Crawl budget is real** — Fix **404** chains, soft 404s, and infinite parameterized URLs.
4. **Technical + quality** — Fast, crawlable sites still need **trustworthy** content for competitive queries.
5. **Measure before and after** — Attribute changes to **deploy/content** dates; avoid ten changes at once.
6. **Guidelines compliance** — Structured data and snippets must reflect **visible** content.

### Organic search lifecycle (system model) (summary)

Lifecycle phases, technical gate, intent, measurement — **`organic-search-lifecycle-system-model.md`** (pairs with **`seo-flow-and-lifecycle.md`**).

Details: [references/organic-search-lifecycle-system-model.md](references/organic-search-lifecycle-system-model.md)

### Failure modes — detection and mitigation (summary)

Index bloat, JS rendering gaps, soft 404, mis-attribution — **`failure-modes-detection-mitigation.md`**.

Details: [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md)

### Decision framework and trade-offs (summary)

SSR vs client, indexing aggressiveness, rich results, locale strategy — **`decision-framework-and-trade-offs.md`**.

Details: [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md)

### Quality validation and guardrails (summary)

No guaranteed rankings; guideline-sensitive language — **`quality-validation-and-guardrails.md`**.

Details: [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md)

### SEO flow and lifecycle (summary)

Phases: **baseline → audit → strategy → implement → measure → iterate**; roles and KPIs; GSC as primary diagnostic surface.

Details: [references/seo-flow-and-lifecycle.md](references/seo-flow-and-lifecycle.md)

### Technical SEO and crawl (summary)

**robots**, **sitemaps**, **canonical**, **hreflang**, rendering considerations, **CWV**, **mobile-first**, structured data basics.

Details: [references/technical-seo-and-crawl.md](references/technical-seo-and-crawl.md)

### Tips and tricks (summary)

Template-level **titles/H1**, internal linking, **E-E-A-T** orientation, image/alt discipline, GSC segmentation.

Details: [references/tips-and-tricks.md](references/tips-and-tricks.md)

### Edge cases (summary)

**SPA/JS** indexing, duplicate faceted URLs, pagination/infinite scroll, staging **noindex**, paywalls, core updates.

Details: [references/edge-cases.md](references/edge-cases.md)

### Decision flow and anti-patterns (summary)

Channel priority, rendering model, duplicate URL policy; thin pages and attribution mistakes.

Details: [references/decision-tree.md](references/decision-tree.md) · [references/anti-patterns.md](references/anti-patterns.md)

### Cross-skill handoffs (summary)

**`nextjs-pro`**, **`react-pro`**, **`deployment-pro`**, **`market-research-pro`**.

Details: [references/integration-map.md](references/integration-map.md)

### Guidelines and metric versions (summary)

Search Central updates, CWV field lag, framework majors.

Details: [references/versions.md](references/versions.md)

## Suggested response format (STRICT — implement / review)

1. **Context** — Locales, domains, stack, GSC/Bing availability, search goal.
2. **Problem / goal** — Coverage, CWV, duplicates, or snippet quality.
3. **System design** — Lifecycle step you are in + technical gate status — **`organic-search-lifecycle-system-model.md`** / **`seo-flow-and-lifecycle.md`**.
4. **Decision reasoning** — Canonical/faceted policy, rendering approach — **`decision-framework-and-trade-offs.md`** / **`decision-tree.md`**.
5. **Implementation sketch** — Checklist, meta/sitemap/robots sketch — **Code** when showing concrete snippets.
6. **Trade-offs** — Aggressive indexing vs risk; rich results vs maintenance.
7. **Failure modes** — Index bloat, JS gap, attribution — **`failure-modes-detection-mitigation.md`** themes.
8. **Residual risks** — Algorithm uncertainty; delegate framework work to **`nextjs-pro`** / **`react-pro`**.

## Resources in this skill

| Topic | File |
|-------|------|
| **Organic search lifecycle model** | [references/organic-search-lifecycle-system-model.md](references/organic-search-lifecycle-system-model.md) |
| Failure modes | [references/failure-modes-detection-mitigation.md](references/failure-modes-detection-mitigation.md) |
| Decision framework & trade-offs | [references/decision-framework-and-trade-offs.md](references/decision-framework-and-trade-offs.md) |
| Quality guardrails | [references/quality-validation-and-guardrails.md](references/quality-validation-and-guardrails.md) |
| Flow & lifecycle | [references/seo-flow-and-lifecycle.md](references/seo-flow-and-lifecycle.md) |
| Technical SEO & crawl | [references/technical-seo-and-crawl.md](references/technical-seo-and-crawl.md) |
| Tips and patterns | [references/tips-and-tricks.md](references/tips-and-tricks.md) |
| Edge cases | [references/edge-cases.md](references/edge-cases.md) |
| Decision tree | [references/decision-tree.md](references/decision-tree.md) |
| Anti-patterns | [references/anti-patterns.md](references/anti-patterns.md) |
| Integration map | [references/integration-map.md](references/integration-map.md) |
| Versions | [references/versions.md](references/versions.md) |

## Quick examples

**Input (simple):** Next.js site: `/products?color=red` and `/products?color=blue` both indexed with thin differences.  
**Expected output:** Full **Suggested response format (STRICT)** — canonical/faceted policy; **`nextjs-pro`** hooks.

**Input (tricky):** “Ship 10 SEO fixes Friday” — GSC already noisy.  
**Expected output:** Sequence changes; one lever per window; attribution limits.

**Input (cross-skill):** “Core Web Vitals failed — fix for SEO.”  
**Expected output:** Map metrics to likely paths; **`nextjs-pro`** / **`react-pro`** / **`deployment-pro`**; measurement framing here.

## Checklist before calling the skill done

- [ ] **Intent** and URL scope clear; duplicate/cluster strategy stated.
- [ ] **Technical** basics: indexability, canonical, sitemap/robots where relevant.
- [ ] **Measurement** plan (GSC segments, before/after) — not only keyword positions.
- [ ] Framework-specific work **delegated** to **`nextjs-pro`** / **`react-pro`** when applicable.
- [ ] **Residual** uncertainty (algorithm, competition) acknowledged honestly.
- [ ] **Structured data** matches visible content.
- [ ] **Staging** / **preview** leak risks addressed when relevant.
