# Sustainable Design Integration Map

## Skill handoffs

```
sustainable-design-pro
├── → performance-tuning-pro
│     When: Carbon reduction goals overlap with Core Web Vitals (LCP, TBT, CLS)
│     Handoff: Lighthouse report; performance budget per page type
│
├── → deployment-pro
│     When: Migrating to green hosting or configuring CDN caching headers
│     Handoff: Green host selection; Cache-Control header config
│
├── → design-system-pro
│     When: Sustainable color/font choices need to become design tokens
│     Handoff: Accepted color palette; subset font files; typography scale
│
├── → a11y-design-pro
│     When: Dark mode palettes and low-saturation colors need WCAG validation
│     Handoff: Dark mode color pairs to contrast-check
│
└── → ai-design-pro
      When: AI-generated images/videos need optimization before deployment
      Handoff: Raw assets → Scripts/optimize-images.js → CDN
```

## Toolchain

```
Measurement
  websitecarbon.com API → Scripts/measure-carbon.js
  Lighthouse CI         → Performance score + transfer size
  WebPageTest           → Waterfall + byte breakdown

Asset Optimization
  Images: sharp / squoosh-cli / Scripts/optimize-images.js
  Fonts:  fonttools pyftsubset
  Video:  FFmpeg (AV1 / H.265)
  JS:     webpack-bundle-analyzer / vite-bundle-visualizer

Hosting & CDN
  thegreenwebfoundation.org check
  Cloudflare Pages / Netlify / Vercel (all green by default)
  Cache-Control headers via platform config or nginx

CI Gate
  Lighthouse CI (lhci) → fail if performance < 0.85
  Pa11y-ci → fail if new a11y violations
  Custom: scripts/measure-carbon.js in CI → alert if rating degrades
```

## Typical project workflow

```
1. Baseline audit
   └── websitecarbon.com + Lighthouse + WebPageTest
       → Record: rating, page weight, TTFB, hosting provider

2. Green hosting (if needed)
   └── Check thegreenwebfoundation.org
   └── Migrate to Cloudflare Pages / Netlify / Vercel
       → Re-check: confirm green: true

3. Image optimization
   └── Scripts/optimize-images.js → AVIF + WebP + lazy loading
       → Re-check: page weight reduction %

4. Font optimization
   └── pyftsubset + self-hosting + font-display: swap
       → Re-check: render-blocking resources = 0

5. JS bundle audit
   └── webpack-bundle-analyzer → remove unused deps
       → Re-check: JS transfer < 200KB gzipped

6. Caching
   └── Cache-Control: immutable for versioned assets
       → Re-check: Lighthouse cache score = 100

7. CI gate
   └── Lighthouse CI in GitHub Actions
       → Fail if performance < 85 or new regressions

8. Public reporting
   └── Add sustainability statement to /about or footer
```

## Carbon metrics reference

| Metric | Formula | Target |
|--------|---------|--------|
| CO2/view | (bytes/GB) × 0.44g × green_factor | < 0.2g (rating B+) |
| Annual CO2 | CO2/view × monthly_visits × 12 | Disclose publicly |
| Page weight | Total transfer (KB) | < 500KB for landing |
| Green hosting | thegreenwebfoundation.org | ✅ Verified |
| Lighthouse perf | Score 0–100 | ≥ 85 |
