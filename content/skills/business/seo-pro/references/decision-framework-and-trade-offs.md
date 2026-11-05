# Decision framework and trade-offs (SEO)

## Contents

1. [SSR/SSG vs client render for SEO](#ssrssg-vs-client-render-for-seo)
2. [Aggressive vs conservative indexing](#aggressive-vs-conservative-indexing)
3. [Rich results vs maintenance](#rich-results-vs-maintenance)
4. [Global vs locale-first](#global-vs-locale-first)

See **`decision-tree.md`**.

---

## SSR/SSG vs client render for SEO

SSR/SSG improves **first paint** for crawlers; SPA acceptable only with verified rendering — **`nextjs-pro`**, **`react-pro`**.

---

## Aggressive vs conservative indexing

Staging and preview should default **noindex**; prod **index** only valuable URLs — **`edge-cases.md`**.

---

## Rich results vs maintenance

Structured data adds **snippet** upside and **validation** burden — **`technical-seo-and-crawl.md`**.

---

## Global vs locale-first

`hreflang` and ccTLD choices trade **ops cost** vs **local relevance** — **`technical-seo-and-crawl.md`**.
