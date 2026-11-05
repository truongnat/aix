# Sustainable Design Anti-patterns

## 1. Uncompressed images

**Symptom**: PNG hero images at 3MB; JPEGs at 800KB.
**Fix**: Convert to AVIF (best) or WebP. Use `<picture>` for browser negotiation. Target < 100KB for hero images. Use `Scripts/optimize-images.js` for batch conversion.

## 2. Autoplay video

**Symptom**: Background video loops at 50MB; plays on every page visit.
**Fix**: Replace with a poster image (< 100KB). Provide a "Watch" button that loads the video on demand. If video is required, compress to H.265/AV1 and serve < 2MB.

## 3. Google Fonts without subsetting

**Symptom**: Loading full Inter font family from Google Fonts = 300KB per variant.
**Fix**: Self-host with `fonttools` subsetting to used character ranges. Result: 5–20KB per font. Use `font-display: swap` to prevent render blocking.

## 4. No caching headers

**Symptom**: Static assets re-downloaded on every visit; repeat visitors transfer the same MB every time.
**Fix**: Set `Cache-Control: public, max-age=31536000, immutable` for versioned assets. CDN caches serve subsequent visits without hitting the origin.

## 5. Grey hosting

**Symptom**: Site runs on AWS US-East-1 with no renewable energy commitment.
**Fix**: Check at [thegreenwebfoundation.org](https://www.thegreenwebfoundation.org/). Migrate to Cloudflare Pages, Netlify, Vercel, or Hetzner (all 100% renewable). This alone can cut CO2/view by 50–80%.

## 6. Unused third-party scripts

**Symptom**: 8 analytics/tracking/marketing scripts load on every page = 400KB extra.
**Fix**: Audit with WebPageTest or Chrome DevTools Coverage. Remove scripts with < 1% utilization. Lazy-load the rest (load after user interaction).

## 7. Eager-loading all images

**Symptom**: 30 product images all load on page load, even those below the fold.
**Fix**: Add `loading="lazy"` to all images below the fold. Saves 80%+ of image transfer on pages with long lists.

## 8. Heavy JavaScript frameworks for static content

**Symptom**: 2MB React bundle for a marketing page that's 95% static text.
**Fix**: Use Astro, 11ty, or plain HTML for static content. Reserve React/Vue for interactive components. Reduces JS transfer by 60–90%.

## 9. Dark mode that's actually just dark grey

**Symptom**: Dark mode uses `#1a1a1a` instead of `#000000` — doesn't save OLED power.
**Fix**: Use true black (`#000000`) backgrounds for dark mode. OLED pixels are physically off for black, consuming near-zero energy.

## 10. Optimizing once, never re-measuring

**Symptom**: Images were optimized in 2022; new team members added 5MB of unoptimized assets since.
**Fix**: Add Lighthouse CI to your pipeline. Fail the build if performance score drops below 85. Run `Scripts/measure-carbon.js` in CI to track CO2/view over time.
