# Sustainable Design Reference

## Advanced Sustainable Design Techniques

This reference provides advanced techniques and real-world examples for implementing sustainable and eco-friendly design practices.

## Table of Contents

1. [Carbon Footprint Measurement](#carbon-footprint-measurement)
2. [Green Infrastructure](#green-infrastructure)
3. [Sustainable Asset Optimization](#sustainable-asset-optimization)
4. [Energy-Efficient Design Patterns](#energy-efficient-design-patterns)
5. [Real-World Examples](#real-world-examples)

## Carbon Footprint Measurement

### Website Carbon Calculator API

```javascript
// Using Website Carbon Calculator API
async function measureWebsiteCarbon(url) {
  const response = await fetch(`https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  
  return {
    co2: data.c, // grams of CO2
    rating: data.rating, // A+, A, B, C, D, E, F
    green: data.green, // whether hosting is green
    bytes: data.bytes,
    cleanerThan: data.cleanerThan
  };
}

// Example usage
const carbon = await measureWebsiteCarbon('https://example.com');
console.log(`Carbon footprint: ${carbon.co2}g CO2`);
console.log(`Rating: ${carbon.rating}`);
console.log(`Green hosting: ${carbon.green ? 'Yes' : 'No'}`);
```

### Carbon API Integration

```javascript
// Using Carbon API for precise measurement
import { calculateCarbon } from '@carbon/api';

async function calculatePageCarbon(pageSize, greenHosting = true, duration = 1000) {
  const carbon = await calculateCarbon({
    bytes: pageSize,
    green: greenHosting,
    duration: duration
  });
  
  return {
    co2: carbon.co2, // grams of CO2
    emissions: carbon.emissions, // kg CO2e
    energy: carbon.energy // kWh
  };
}

// Example: Calculate carbon for 1MB page
const carbon = await calculatePageCarbon(1024 * 1024);
console.log(`CO2: ${carbon.co2}g`);
console.log(`Energy: ${carbon.energy}kWh`);
```

### Custom Carbon Tracking

```javascript
class CarbonTracker {
  constructor() {
    this.measurements = [];
  }
  
  measureResource(resourceUrl, size) {
    const carbonPerGB = 0.44; // grams of CO2 per GB
    const carbon = (size / (1024 * 1024 * 1024)) * carbonPerGB;
    
    this.measurements.push({
      url: resourceUrl,
      size: size,
      carbon: carbon,
      timestamp: new Date()
    });
    
    return carbon;
  }
  
  getTotalCarbon() {
    return this.measurements.reduce((total, m) => total + m.carbon, 0);
  }
  
  generateReport() {
    const total = this.getTotalCarbon();
    const byResource = this.measurements.reduce((acc, m) => {
      const url = new URL(m.url).hostname;
      acc[url] = (acc[url] || 0) + m.carbon;
      return acc;
    }, {});
    
    return {
      totalCarbon: total.toFixed(2),
      totalMeasurements: this.measurements.length,
      byResource,
      timestamp: new Date()
    };
  }
}
```

## Green Infrastructure

### Green Hosting Providers

```javascript
// Green hosting provider comparison
const greenHosts = {
  'GreenGeeks': {
    renewableEnergy: 300, // 300% renewable energy
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia']
  },
  'Kinsta': {
    renewableEnergy: 100, // Google Cloud green regions
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia']
  },
  'Netlify': {
    renewableEnergy: 100, // Carbon neutral
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia']
  },
  'Vercel': {
    renewableEnergy: 100, // Carbon neutral
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia']
  },
  'AWS': {
    renewableEnergy: 50, // Some regions are green
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia'],
    greenRegions: ['us-west-2', 'eu-west-1', 'ap-southeast-1']
  },
  'Google Cloud': {
    renewableEnergy: 100, // Carbon neutral since 2017
    carbonOffset: true,
    dataCenters: ['US', 'EU', 'Asia']
  }
};

function selectGreenHost(location) {
  // Select best green host based on location
  const regionMap = {
    'US': ['GreenGeeks', 'Netlify', 'Vercel', 'AWS', 'Google Cloud'],
    'EU': ['GreenGeeks', 'Netlify', 'Vercel', 'AWS', 'Google Cloud'],
    'Asia': ['GreenGeeks', 'Netlify', 'Vercel', 'AWS', 'Google Cloud']
  };
  
  const options = regionMap[location] || regionMap['US'];
  
  // Sort by renewable energy percentage
  return options.sort((a, b) => {
    return greenHosts[b].renewableEnergy - greenHosts[a].renewableEnergy;
  })[0];
}
```

### Green CDN Configuration

```javascript
// Configure CDN for green delivery
const greenCDNConfig = {
  'Cloudflare': {
    renewableEnergy: true,
    edgeLocations: 200,
    features: ['image-optimization', 'http3', 'brotli']
  },
  'Fastly': {
    renewableEnergy: true,
    edgeLocations: 80,
    features: ['image-optimization', 'http2', 'tls-1.3']
  },
  'Akamai': {
    renewableEnergy: true,
    edgeLocations: 300,
    features: ['image-optimization', 'http2', 'tls-1.3']
  },
  'KeyCDN': {
    renewableEnergy: true,
    edgeLocations: 50,
    features: ['image-optimization', 'http2', 'tls-1.3']
  }
};

function configureGreenCDN(cdnName) {
  const config = greenCDNConfig[cdnName];
  
  if (!config) {
    throw new Error(`CDN ${cdnName} not found in green CDN list`);
  }
  
  return {
    cdn: cdnName,
    renewableEnergy: config.renewableEnergy,
    features: config.features,
    configuration: {
      // Enable Brotli compression
      compression: 'br',
      // Enable HTTP/3
      httpVersion: 3,
      // Enable TLS 1.3
      tlsVersion: '1.3'
    }
  };
}
```

### Green Region Selection

```javascript
// AWS green regions
const awsGreenRegions = {
  'us-west-2': { region: 'Oregon', renewable: 95 },
  'eu-west-1': { region: 'Ireland', renewable: 100 },
  'eu-central-1': { region: 'Frankfurt', renewable: 100 },
  'ap-southeast-1': { region: 'Singapore', renewable: 100 }
};

// Google Cloud green regions
const gcpGreenRegions = {
  'us-west1': { region: 'Oregon', renewable: 100 },
  'europe-west1': { region: 'Belgium', renewable: 100 },
  'europe-west4': { region: 'Netherlands', renewable: 100 },
  'asia-southeast1': { region: 'Singapore', renewable: 100 }
};

function selectGreenRegion(cloudProvider, userLocation) {
  const regions = cloudProvider === 'aws' ? awsGreenRegions : gcpGreenRegions;
  
  // Find closest region with highest renewable energy
  const sortedRegions = Object.entries(regions)
    .sort((a, b) => b[1].renewable - a[1].renewable);
  
  return sortedRegions[0][0];
}
```

## Sustainable Asset Optimization

### Image Optimization Pipeline

```javascript
import sharp from 'sharp';

class SustainableImageOptimizer {
  constructor() {
    this.optimizations = [];
  }
  
  async optimizeImage(inputPath, outputPath, options = {}) {
    const {
      format = 'webp',
      quality = 80,
      width = 800,
      height = 600,
      stripMetadata = true
    } = options;
    
    let pipeline = sharp(inputPath);
    
    // Strip metadata to reduce file size
    if (stripMetadata) {
      pipeline = pipeline.metadata();
    }
    
    // Resize
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });
    
    // Convert to modern format
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality });
    } else {
      pipeline = pipeline.jpeg({ quality });
    }
    
    // Save optimized image
    await pipeline.toFile(outputPath);
    
    // Calculate savings
    const originalSize = require('fs').statSync(inputPath).size;
    const optimizedSize = require('fs').statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    
    this.optimizations.push({
      input: inputPath,
      output: outputPath,
      format,
      quality,
      originalSize,
      optimizedSize,
      savings: `${savings}%`,
      carbonSaved: this.calculateCarbonSaved(originalSize - optimizedSize)
    });
    
    return {
      outputPath,
      originalSize,
      optimizedSize,
      savings
    };
  }
  
  calculateCarbonSaved(bytesSaved) {
    const carbonPerGB = 0.44; // grams of CO2 per GB
    return (bytesSaved / (1024 * 1024 * 1024)) * carbonPerGB;
  }
  
  generateReport() {
    const totalCarbonSaved = this.optimizations.reduce((total, opt) => total + opt.carbonSaved, 0);
    const totalSizeSaved = this.optimizations.reduce((total, opt) => total + opt.originalSize - opt.optimizedSize, 0);
    
    return {
      totalOptimizations: this.optimizations.length,
      totalSizeSaved: (totalSizeSaved / 1024 / 1024).toFixed(2) + ' MB',
      totalCarbonSaved: totalCarbonSaved.toFixed(4) + 'g CO2',
      optimizations: this.optimizations
    };
  }
}
```

### Video Optimization

```javascript
// Optimize video for web
function optimizeVideo(inputPath, outputPath, options = {}) {
  const {
    codec = 'libx264',
    crf = 28, // Constant Rate Factor (lower = better quality, larger file)
    preset = 'medium',
    format = 'mp4'
  } = options;
  
  const command = `ffmpeg -i ${inputPath} -vcodec ${codec} -crf ${crf} -preset ${preset} ${outputPath}`;
  
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ outputPath, command });
      }
    });
  });
}
```

### Font Optimization

```javascript
// Subset fonts to include only needed characters
function subsetFont(inputFont, outputFont, characters) {
  const { exec } = require('child_process');
  
  const command = `pyftsubset ${inputFont} --output-file=${outputFont} --unicodes=${characters}`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ outputFont, characters });
      }
    });
  });
}

// Use variable fonts for flexibility
function useVariableFont(fontFamily) {
  return `
  @font-face {
    font-family: '${fontFamily}';
    font-weight: 100 900;
    font-style: normal;
    src: url('${fontFamily}-variable.woff2') format('woff2-variations');
  }
  
  body {
    font-family: '${fontFamily}', sans-serif;
    font-weight: 400;
  }
  `;
}
```

## Energy-Efficient Design Patterns

### Dark Mode Implementation

```css
/* Dark mode reduces energy on OLED screens */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --text: #ffffff;
    --accent: #00ff00;
  }
  
  body {
    background-color: var(--background);
    color: var(--text);
  }
}

/* Manual dark mode toggle */
[data-theme="dark"] {
  --background: #000000;
  --text: #ffffff;
}
```

### Lazy Loading Implementation

```javascript
// Intersection Observer for lazy loading
const lazyLoadObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      
      // Load image
      if (element.dataset.src) {
        element.src = element.dataset.src;
        element.removeAttribute('data-src');
      }
      
      // Load iframe
      if (element.dataset.srcdoc) {
        element.srcdoc = element.dataset.srcdoc;
        element.removeAttribute('data-srcdoc');
      }
      
      lazyLoadObserver.unobserve(element);
    }
  });
}, {
  rootMargin: '50px 0px',
  threshold: 0.01
});

// Observe lazy elements
document.querySelectorAll('[data-src], [data-srcdoc]').forEach(element => {
  lazyLoadObserver.observe(element);
});
```

### Code Splitting

```javascript
// Dynamic imports for code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Route-based code splitting
const Home = React.lazy(() => import('./routes/Home'));
const About = React.lazy(() => import('./routes/About'));

function Routes() {
  return (
    <Suspense fallback={<Loading />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Suspense>
  );
}
```

### Service Worker for Caching

```javascript
// Service worker for offline caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/main.css',
        '/scripts/main.js',
        '/images/logo.webp'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache-first for static assets
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff2)$/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open('v1').then(cache => cache.put(event.request, responseClone));
          return response;
        });
      })
    );
  }
});
```

## Real-World Examples

### Case Study: BBC Sustainable Design

```javascript
// BBC's approach to sustainable design
class BBCSustainableDesign {
  constructor() {
    this.carbonTracker = new CarbonTracker();
    this.imageOptimizer = new SustainableImageOptimizer();
  }
  
  async optimizePage(pageUrl) {
    // Measure current carbon footprint
    const carbon = await measureWebsiteCarbon(pageUrl);
    
    // Optimize images
    const images = document.querySelectorAll('img');
    for (const img of images) {
      if (img.dataset.src) {
        await this.imageOptimizer.optimizeImage(
          img.dataset.src,
          img.src,
          { format: 'webp', quality: 80 }
        );
      }
    }
    
    // Enable lazy loading
    images.forEach(img => {
      img.loading = 'lazy';
    });
    
    // Re-measure carbon after optimization
    const newCarbon = await measureWebsiteCarbon(pageUrl);
    
    return {
      originalCarbon: carbon.co2,
      optimizedCarbon: newCarbon.co2,
      carbonSaved: carbon.co2 - newCarbon.co2,
      percentImprovement: ((carbon.co2 - newCarbon.co2) / carbon.co2 * 100).toFixed(2)
    };
  }
}
```

### Case Study: Google Green Design

```javascript
// Google's green design principles
class GoogleGreenDesign {
  static async implementGreenDesign() {
    // Use system fonts to avoid loading web fonts
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });
    
    // Use modern image formats
    const pictureElements = document.querySelectorAll('picture');
    pictureElements.forEach(picture => {
      const img = picture.querySelector('img');
      if (img) {
        const webpSource = document.createElement('source');
        webpSource.srcset = img.src.replace(/\.(jpg|png)$/, '.webp');
        webpSource.type = 'image/webp';
        picture.insertBefore(webpSource, img);
      }
    });
    
    // Minimize JavaScript bundle size
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (script.src.includes('.min.js')) {
        // Use minified versions
      }
    });
    
    // Enable caching headers
    // This would be done on the server side
  }
}
```

### Case Study: Microsoft Carbon Awareness

```javascript
// Microsoft's carbon-aware computing
class CarbonAwareScheduler {
  constructor() {
    this.greenHours = this.calculateGreenHours();
  }
  
  calculateGreenHours() {
    // Calculate when grid is greenest (most renewable energy)
    // This varies by region
    return {
      'us-west': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 12am-12pm
      'eu-west': [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] // 12pm-12am
    };
  }
  
  isGreenHour(region) {
    const currentHour = new Date().getHours();
    const greenHours = this.greenHours[region] || [];
    return greenHours.includes(currentHour);
  }
  
  scheduleTask(task, region) {
    if (this.isGreenHour(region)) {
      // Run task now
      return task();
    } else {
      // Schedule for next green hour
      const nextGreenHour = this.getNextGreenHour(region);
      const delay = this.getDelayUntil(nextGreenHour);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(task());
        }, delay);
      });
    }
  }
  
  getNextGreenHour(region) {
    const currentHour = new Date().getHours();
    const greenHours = this.greenHours[region] || [];
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      if (greenHours.includes(hour)) {
        return hour;
      }
    }
    
    return currentHour;
  }
  
  getDelayUntil(hour) {
    const currentHour = new Date().getHours();
    const delay = hour - currentHour;
    return delay > 0 ? delay * 60 * 60 * 1000 : (24 + delay) * 60 * 60 * 1000;
  }
}
```

## Resources

### Documentation
- [Sustainable Web Design](https://www.sustainablewebdesign.com/)
- [Green Web Foundation](https://www.thegreenwebfoundation.org/)
- [Website Carbon Calculator](https://www.websitecarbon.com/)
- [Carbon API](https://www.carboninterface.com/)

### Tools
- [Carbon API](https://www.carboninterface.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

### Hosting
- [GreenGeeks](https://www.greengeeks.com/)
- [Google Cloud Carbon](https://cloud.google.com/sustainability)
- [AWS Sustainability](https://aws.amazon.com/sustainability/)
- [Microsoft Sustainability](https://www.microsoft.com/sustainability)
