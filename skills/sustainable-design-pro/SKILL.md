---
name: sustainable-design-pro
description: Use this skill whenever the user wants to implement sustainable design practices, zero-waste design, eco-friendly design, or green design principles. This includes reducing digital waste, optimizing for energy efficiency, sustainable color palettes, eco-friendly typography, minimal resource usage, carbon footprint reduction, and environmentally conscious design decisions. If the user mentions sustainable design, eco-friendly design, zero-waste design, or green design principles, use this skill.
license: MIT
metadata:
  short-description: "Sustainable Design — zero-waste, eco-friendly, energy efficiency, carbon footprint reduction"
---

## Boundary

This skill handles sustainable design tasks including zero-waste design, eco-friendly design practices, energy efficiency optimization, sustainable color palettes, eco-friendly typography, minimal resource usage, carbon footprint reduction, and environmentally conscious design decisions. It focuses on using sustainable design principles and tools (carbon calculators, performance optimization tools, sustainable design frameworks). It does NOT cover general design principles or traditional design aesthetics.

## When to use

Use this skill when:
- Implementing zero-waste design practices
- Optimizing for energy efficiency and performance
- Creating sustainable color palettes and typography
- Reducing digital waste and carbon footprint
- Implementing eco-friendly design decisions
- Optimizing assets for minimal resource usage
- Choosing sustainable hosting and infrastructure
- Measuring and reducing environmental impact

DO NOT use this skill for:
- General design principles (use design-system-pro)
- Traditional design aesthetics (use design-system-pro)
- Performance optimization only (use performance-tuning-pro)
- Accessibility (use a11y-design-pro)

## Workflow

1. **Identify sustainability goals** (zero-waste, energy efficiency, carbon reduction)
2. **Audit current environmental impact** (carbon footprint, resource usage)
3. **Implement sustainable design practices** (minimal assets, efficient code)
4. **Optimize for energy efficiency** (performance, lazy loading, caching)
5. **Choose sustainable resources** (green hosting, eco-friendly fonts)
6. **Measure and track** environmental impact
7. **Iterate and improve** based on measurements
8. **Document sustainable decisions** and their impact

### Operating principles

- **Minimize resource usage** (smaller assets, efficient code)
- **Optimize for energy efficiency** (performance, caching, lazy loading)
- **Choose sustainable infrastructure** (green hosting, renewable energy)
- **Reduce carbon footprint** through efficient design
- **Implement zero-waste practices** (reusable components, minimal dependencies)
- **Measure and track** environmental impact
- **Educate stakeholders** on sustainable design benefits
- **Balance sustainability** with user experience

## Suggested response format

```
Sustainability Goal: [zero-waste / energy efficiency / carbon reduction]
Current Impact: [carbon footprint, resource usage]
Implemented Practices: [sustainable design techniques]
Optimizations: [performance, asset optimization, infrastructure]
Measured Results: [carbon reduction, energy savings]
Recommendations: [further sustainability improvements]
```

## Resources in this skill

- **Carbon Calculators**: Carbon API, Website Carbon Calculator
- **Performance Tools**: Lighthouse, WebPageTest, GTmetrix
- **Sustainable Frameworks**: Sustainable Web Design, Green Web Foundation
- **Green Hosting**: GreenGeeks, AWS Green Regions, Google Cloud Carbon
- **Reference Documentation**: REFERENCE.md for advanced sustainable techniques

## Quick example

**Optimize for energy efficiency:**

```
1. Measure current carbon footprint using carbon calculator
2. Identify high-impact areas (large assets, inefficient code)
3. Optimize images and assets (compression, modern formats)
4. Implement lazy loading and code splitting
5. Add caching and CDN for faster delivery
6. Choose green hosting provider
7. Re-measure and track improvements
```

## Checklist before calling the skill done

- [ ] Sustainability goals are defined
- [ ] Current environmental impact is measured
- [ ] Sustainable design practices are identified
- [ ] Performance requirements are understood
- [ ] Green infrastructure options are available
- [ ] Carbon measurement tools are accessible
- [ ] Stakeholder buy-in is secured
- [ ] Tracking and reporting plan is established

---

# Sustainable Design Guide

## Overview

This guide covers essential sustainable design techniques for reducing environmental impact through design decisions. For advanced sustainable techniques and real-world examples, see REFERENCE.md.

## Quick Start

```javascript
// Calculate carbon footprint
import { calculateCarbon } from '@carbon/api';

const carbon = await calculateCarbon({
  url: 'https://example.com',
  green: true
});
console.log(`Carbon footprint: ${carbon.co2}g CO2`);
```

## Zero-Waste Design

### Minimal Assets
```javascript
// Use modern image formats
const imageFormats = ['webp', 'avif'];

// Lazy load images
<img loading="lazy" src="image.webp" alt="Description">

// Responsive images
<picture>
  <source srcset="image-avif.avif" type="image/avif">
  <source srcset="image-webp.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

### Reusable Components
```javascript
// Create reusable components
const Button = ({ children, variant = 'primary' }) => {
  return <button className={`btn btn-${variant}`}>{children}</button>;
};

// Use throughout application
<Button variant="primary">Click me</Button>
```

### Minimal Dependencies
```javascript
// Use tree shaking
import { debounce } from 'lodash-es';

// Use smaller alternatives
// Instead of moment.js (67KB)
import { format } from 'date-fns'; // (2KB)
```

## Energy Efficiency

### Performance Optimization
```javascript
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Lazy loading routes
const Home = React.lazy(() => import('./Home'));
const About = React.lazy(() => import('./About'));
```

### Caching Strategies
```javascript
// Service worker for caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js'
      ]);
    })
  );
});
```

### Efficient Animations
```javascript
// Use CSS animations instead of JavaScript
.animated {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

## Sustainable Color Palettes

### Dark Mode
```css
/* Dark mode reduces energy on OLED screens */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --text: #ffffff;
  }
}
```

### Energy-Efficient Colors
```javascript
// Use darker colors on OLED screens
const energyEfficientColors = {
  background: '#000000',  // 0 energy on OLED
  text: '#ffffff',
  accent: '#00ff00'
};
```

## Carbon Footprint Measurement

### Website Carbon Calculator
```javascript
async function measureCarbonFootprint(url) {
  const response = await fetch(`https://api.websitecarbon.com/site?url=${url}`);
  const data = await response.json();
  
  return {
    co2: data.c,
    rating: data.rating,
    green: data.green
  };
}
```

### Carbon API
```javascript
import { calculateCarbon } from '@carbon/api';

const carbon = await calculateCarbon({
  bytes: 1024000,
  green: true,
  duration: 1000
});
```

## Green Infrastructure

### Sustainable Hosting
```javascript
// Choose green hosting providers
const greenHosts = [
  'GreenGeeks',      // 300% renewable energy
  'Kinsta',          // Google Cloud green regions
  'Netlify',         // Carbon neutral
  'Vercel',          // Carbon neutral
  'AWS',             // Green regions available
  'Google Cloud'     // Carbon neutral since 2017
];
```

### Green CDNs
```javascript
// Use green CDNs
const greenCDNs = [
  'Cloudflare',      // Renewable energy commitment
  'Fastly',          // Carbon neutral
  'Akamai',          // Green initiatives
  'KeyCDN'           // Green hosting
];
```

## Typography Optimization

### System Fonts
```css
/* Use system fonts to avoid loading web fonts */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Variable Fonts
```css
/* Use variable fonts for flexibility and smaller file size */
@font-face {
  font-family: 'Inter';
  font-weight: 100 900;
  font-style: normal;
  src: url('inter-variable.woff2') format('woff2-variations');
}
```

### Font Subsetting
```javascript
// Subset fonts to include only needed characters
const fontSubset = new FontSubset('Inter', 'Latin');
fontSubset.generate('inter-subset.woff2');
```

## Asset Optimization

### Image Optimization
```javascript
// Use sharp for image optimization
import sharp from 'sharp';

await sharp('input.jpg')
  .resize(800, 600)
  .webp({ quality: 80 })
  .toFile('output.webp');
```

### Video Optimization
```javascript
// Use efficient video formats
const videoFormats = ['webm', 'mp4'];

// Lazy load videos
<video loading="lazy" controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

## Sustainable Design Metrics

### Key Metrics to Track
- Carbon footprint (CO2 emissions)
- Page size (total bytes transferred)
- Load time (time to interactive)
- Energy consumption (device energy use)
- Green hosting usage (percentage of green infrastructure)

### Measurement Tools
```javascript
// Lighthouse for performance
const lighthouse = require('lighthouse');

const results = await lighthouse('https://example.com', {
  onlyCategories: ['performance']
});

// Website Carbon Calculator
const carbon = await measureCarbonFootprint('https://example.com');

// Custom tracking
const metrics = {
  pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
  totalBytes: performance.getEntriesByType('resource')
    .reduce((total, entry) => total + entry.transferSize, 0)
};
```

## Quick Reference

| Task | Best Tool | Key Benefit |
|------|-----------|-------------|
| Carbon Measurement | Website Carbon Calculator | Easy carbon footprint tracking |
| Performance | Lighthouse | Performance optimization |
| Image Optimization | Sharp | Efficient image compression |
| Green Hosting | GreenGeeks | Renewable energy |
| Font Optimization | Variable Fonts | Smaller file sizes |

## Next Steps

- For advanced sustainable techniques, see REFERENCE.md
- For carbon tracking, explore Carbon API documentation
- For sustainable hosting, consult green hosting providers
