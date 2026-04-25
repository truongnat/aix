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

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** search goals, locales, tech stack, and **which framework skill** implements HTML/routing. → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.