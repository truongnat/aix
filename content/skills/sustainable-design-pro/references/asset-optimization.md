# Asset Optimization for Sustainable Web

## Why asset size = carbon

Every byte transferred requires energy: data centres, network infrastructure, and device processing. The equation is simple:

```
CO2 per page view ≈ (page weight in GB) × 0.44g CO2/GB × visits/year
```

A 3MB page viewed 100K times/month ≈ **158g CO2/month** — vs. a 300KB page ≈ **15.8g CO2/month**.

## Images (biggest lever)

### Format selection

```html
<!-- Serve AVIF with WebP and JPEG fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image" width="1200" height="600"
       loading="lazy" decoding="async">
</picture>
```

**Format size comparison** (same quality):
- JPEG: 800KB baseline
- WebP: ~320KB (60% smaller)
- AVIF: ~180KB (77% smaller)

### Lazy loading

```html
<!-- All images below the fold -->
<img loading="lazy" src="product.avif" alt="Product">

<!-- Above-the-fold: eager (default) -->
<img loading="eager" src="hero.avif" alt="Hero">
```

### Responsive images

```html
<img
  srcset="image-400.avif 400w, image-800.avif 800w, image-1200.avif 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  src="image-800.avif"
  alt="Responsive image"
  loading="lazy"
>
```

### Batch optimization

```bash
# Using sharp (Node.js)
npx sharp-cli --input "./images/**/*.{jpg,png}" --output "./optimized" \
  --format avif --quality 80

# Using squoosh CLI
npx @squoosh/cli --avif '{"quality":80}' images/*.jpg

# Using Scripts/optimize-images.js (this skill)
node Scripts/optimize-images.js ./public/images --format avif --quality 80
```

## Fonts

### Subsetting

```bash
# Install fonttools
pip install fonttools brotli zopfli

# Subset to Latin characters only (covers most Western languages)
pyftsubset Inter.ttf \
  --output-file=Inter-subset.woff2 \
  --flavor=woff2 \
  --unicodes="U+0020-007F,U+00A0-00FF"

# Result: Inter full = 300KB → Inter-subset = 18KB
```

### Self-hosting + font-display

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;     /* Show fallback immediately, swap when loaded */
  unicode-range: U+0020-007F, U+00A0-00FF;
}
```

### Variable fonts (one file for all weights)

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;   /* Entire weight range from one file */
  font-display: swap;
}
```

## Video

### Never autoplay

```html
<!-- Bad: autoplay loads video immediately -->
<video autoplay muted loop src="hero.mp4"></video>

<!-- Good: poster loads fast; video only on user intent -->
<video poster="hero-poster.avif" controls preload="none">
  <source src="hero.av1.mp4" type="video/mp4; codecs=av01">
  <source src="hero.h265.mp4" type="video/mp4; codecs=hvc1">
  <source src="hero.h264.mp4" type="video/mp4">
</video>
```

### Compression with FFmpeg

```bash
# AV1 (best compression, broad support 2024+)
ffmpeg -i input.mp4 -c:v libaom-av1 -crf 35 -b:v 0 output.av1.mp4

# H.265 (good compression, wide support)
ffmpeg -i input.mp4 -c:v libx265 -crf 28 -preset slow output.h265.mp4

# Scale down for web
ffmpeg -i input.mp4 -vf scale=1280:-2 -c:v libx265 -crf 28 output-web.mp4
```

## JavaScript bundles

```javascript
// next.config.js — bundle analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: true });
module.exports = withBundleAnalyzer({});

// Dynamic imports — code splitting
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false });

// Tree shaking — import only what you use
import { format } from 'date-fns';  // 2KB vs moment.js 67KB
import { debounce } from 'lodash-es'; // tree-shakeable

// Preload critical, prefetch non-critical
<link rel="preload" href="/fonts/Inter.woff2" as="font" crossOrigin="anonymous">
<link rel="prefetch" href="/dashboard" as="document">
```

## Caching headers

```nginx
# nginx — immutable assets (hashed filenames)
location ~* \.(js|css|woff2|avif|webp)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML — always revalidate
location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

## Service Worker (offline + cache)

```javascript
// sw.js — cache-first for assets, network-first for API
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached ?? fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open('images-v1').then(cache => cache.put(event.request, clone));
          return response;
        })
      )
    );
  }
});
```
