# Sustainable Design Decision Tree

## Step 1 — Measure baseline

```
Run websitecarbon.com on key pages
  ↓
Rating?
├── A+ / A → Already good; focus on maintaining (Step 5: CI gate)
├── B / C  → Meaningful improvements possible (Step 2)
└── D / E / F → Significant work needed; start with hosting (Step 2)
```

## Step 2 — Hosting check

```
Check current host at thegreenwebfoundation.org
  ↓
Result?
├── Green ✅ → Move to Step 3 (asset optimization)
└── Grey ❌  →
    Site type?
    ├── Static / JAMstack → Migrate to Cloudflare Pages, Netlify, or Vercel (free)
    ├── Node.js / serverless → Vercel or Netlify Functions
    └── Custom server → Hetzner (EU), GreenGeeks, or AWS eu-west-1
    → Expected impact: 50–80% CO2 reduction from hosting change alone
```

## Step 3 — Asset audit

```
Run Lighthouse > Network tab, sort by size
  ↓
Largest assets?
├── Images (> 100KB each) →
│   Step 3a: Image optimization
├── Video (autoplay) →
│   Step 3b: Video optimization
├── Fonts (> 50KB each) →
│   Step 3c: Font optimization
└── JavaScript bundles (> 200KB) →
    Step 3d: JS optimization
```

## Step 3a — Image optimization

```
Current format?
├── PNG/JPG → Convert to AVIF (primary) + WebP (fallback)
├── WebP only → Add AVIF source in <picture>
└── Already AVIF → Check compression quality; target < 100KB for hero

Lazy loading?
├── No → Add loading="lazy" to all below-fold images
└── Yes → Done

Responsive sizes?
├── No → Add srcset with 400w, 800w, 1200w variants
└── Yes → Done
```

## Step 3b — Video optimization

```
Video placement?
├── Autoplay background → Replace with poster image + play button (90% savings)
└── User-triggered →
    Format?
    ├── .mp4 (H.264) → Re-encode: AV1 > H.265 > H.264
    └── Already AV1/H.265 → Check file size; target < 2MB for web clips
    Preload?
    ├── preload="auto" → Change to preload="none" or preload="metadata"
    └── OK
```

## Step 3c — Font optimization

```
Source?
├── Google Fonts → Self-host + subset
└── Self-hosted →
    Subset applied?
    ├── No → Apply subsetting (pyftsubset) to used character ranges
    └── Yes → Check font-display: swap is set

Format?
├── TTF/OTF → Convert to WOFF2 (30–40% smaller)
└── WOFF2 → Done
```

## Step 3d — JS optimization

```
Bundle size > 500KB?
├── Yes →
│   Run: npx webpack-bundle-analyzer
│   Identify heaviest dependencies
│   Replace large libs (moment.js → date-fns, lodash → lodash-es)
│   Apply code splitting: dynamic import() for non-critical routes
└── No → Done

Third-party scripts?
├── > 3 analytics/tracking scripts → Audit; remove unused; lazy-load remainder
└── OK
```

## Step 4 — UX energy patterns

```
Dark mode?
├── Not implemented → Add prefers-color-scheme with true black (#000) for OLED
└── Uses grey (#1a1a1a) → Update to #000000 for OLED power saving

Animations?
├── Heavy JS animations → Replace with CSS animations (GPU-composited)
└── Video backgrounds → See Step 3b

Service worker?
├── Not implemented → Add basic cache-first for static assets
└── Implemented → Verify cache hit ratio in DevTools > Application > Service Workers
```

## Step 5 — CI gate

```
Add Lighthouse CI to prevent regression:
  npm install -g @lhci/cli

  lighthouserc.yml:
    ci:
      assert:
        assertions:
          performance: ['error', { minScore: 0.85 }]

Run Scripts/measure-carbon.js monthly; track CO2/view trend
```
