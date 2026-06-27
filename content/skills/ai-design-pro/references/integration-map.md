# AI Design Integration Map

## Skill handoffs

```
ai-design-pro
├── → design-system-pro
│     When: AI-generated colors/typography need to become design tokens
│     Handoff: Accepted hex values, type scale, spacing rhythm
│
├── → a11y-design-pro
│     When: AI-generated palette must pass WCAG contrast
│     Handoff: Color pairs to audit; generated image alt-text requirements
│
├── → motion-design-pro
│     When: AI video clips need compositing, timing, or easing refinement
│     Handoff: Raw clips from Runway/Pika; animation brief
│
├── → 3d-motion-pro
│     When: AI generates 3D-style images that need to become actual 3D assets
│     Handoff: Reference images; style guide for 3D modeling
│
└── → frontend-design-pro
      When: AI assets are ready to be integrated into a React/Next.js codebase
      Handoff: Optimized WebP/AVIF files; Figma component specs
```

## Tool integrations

```
Figma AI → exports to → React (via Figma-to-code plugins)
DALL-E 3 API → outputs → image files → sharp (optimize) → CDN
Stable Diffusion → outputs → local files → rembg (bg remove) → Figma
Runway Gen-2 → outputs → video clips → FFmpeg (optimize) → S3/CDN
Adobe Firefly → integrated with → Photoshop / Illustrator / Express
```

## Typical pipeline

```
Brief → Prompt Engineering → AI Generation → Human QA Review
      ↓                                            ↓
  Document prompts                           Approve / Reject
      ↓                                            ↓
  Version control                          Post-processing (sharp, rembg)
                                                   ↓
                                         Design system integration
                                                   ↓
                                           Accessibility check
                                                   ↓
                                              Publish to CDN
```

## API integration points

```javascript
// OpenAI DALL-E 3
import OpenAI from 'openai';
const client = new OpenAI();
const image = await client.images.generate({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' });

// Stability AI
const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.STABILITY_API_KEY}` },
  body: formData
});

// Runway (via API)
const runway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });
const task = await runway.imageToVideo.create({ model: 'gen3a_turbo', promptImage: imageUrl });
```
