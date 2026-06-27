# Green Hosting Guide

## Why hosting matters

The data centre running your server accounts for ~14% of a website's total carbon. Switching to a host powered by 100% renewable energy can reduce this to near zero — the single biggest one-time improvement.

## Verification

Check any domain at [thegreenwebfoundation.org/green-web-check/](https://www.thegreenwebfoundation.org/green-web-check/).

```bash
# CLI check
npx @tgwf/co2 website https://example.com
```

## Recommended green providers

| Provider | Renewable | Best for | Notes |
|----------|-----------|----------|-------|
| **Cloudflare Pages** | 100% renewable | Static sites, JAMstack | Free tier, global CDN |
| **Netlify** | 100% renewable | Static + serverless | Free tier, easy CI/CD |
| **Vercel** | 100% renewable | Next.js, React | Free tier, edge functions |
| **Hetzner** | 100% renewable (DE/FI) | VPS, dedicated | Very affordable |
| **Infomaniak** | 100% renewable | Full hosting | Swiss, privacy-focused |
| **GreenGeeks** | 3x renewable offset | Shared/VPS hosting | Carbon-negative claim |
| **OVHcloud** (EU zones) | Partially renewable | VPS, dedicated | Check specific DC |

## AWS / GCP / Azure green options

```
AWS:     us-west-2 (Oregon), eu-west-1 (Ireland), eu-central-1 (Frankfurt)
         → Use AWS Customer Carbon Footprint Tool
GCP:     All regions (100% matched with renewables since 2017)
         → Carbon-free energy % varies by region; use asia-east1 (Taiwan) or europe-west1
Azure:   Sweden Central, Norway East (near 100% carbon-free)
         → Use Azure Emissions Impact Dashboard
```

## CDN impact

CDNs dramatically reduce carbon by:
1. Serving from the closest edge node (less network distance = less energy)
2. Caching responses (fewer origin server requests)
3. Compressing transfers (Brotli/gzip automatic)

```
Origin server request:   ~10ms RTT, full compute
CDN cache hit:           ~1ms RTT, near-zero compute
Caching ratio target:    > 90% for static assets
```

## Self-reporting carbon

Disclose your sustainability metrics in a public statement:

```markdown
## Our environmental commitment

- Hosted on Cloudflare Pages (100% renewable energy)
- Average page weight: 180KB (industry median: 2.3MB)
- Carbon rating: A+ on websitecarbon.com (0.03g CO2/view)
- Estimated annual CO2: ~1.2kg (vs. median ~80kg for same traffic)
- Last audited: 2025-01
```

## Measuring your hosting carbon

```bash
# websitecarbon.com API
curl "https://api.websitecarbon.com/site?url=https://example.com"

# Or use Scripts/measure-carbon.js (this skill)
node Scripts/measure-carbon.js https://example.com

# Expected response fields:
# c: CO2 grams per page view
# rating: A+/A/B/C/D/E/F
# green: true/false (green hosting verified)
# bytes: page transfer size
# cleanerThan: percentile vs. all tested sites
```

## Green hosting migration checklist

- [ ] Check current host at thegreenwebfoundation.org
- [ ] If grey: identify replacement (Cloudflare Pages / Netlify / Vercel for static)
- [ ] Test deployment on new host (staging environment)
- [ ] Update DNS (TTL to 60s before migration, restore after)
- [ ] Verify SSL/TLS certificates transferred
- [ ] Run websitecarbon.com after migration; confirm `green: true`
- [ ] Update public sustainability statement
