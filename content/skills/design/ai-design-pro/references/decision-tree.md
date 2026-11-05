# AI Design Decision Tree

## Step 1 — What type of asset?

```
Asset needed?
├── Static image (photo, illustration, icon)
│   └── → Step 2a: Image Generation
├── Motion / animation / video clip
│   └── → Step 2b: Video Generation
├── UI wireframe / prototype
│   └── → Step 2c: AI Prototyping
└── Color palette / typography
    └── → Step 2d: AI Styling
```

## Step 2a — Image Generation

```
Is copyright safety critical? (commercial, enterprise)
├── Yes → Adobe Firefly (commercially trained) or DALL-E 3
└── No →
    Best aesthetics needed?
    ├── Yes → Midjourney v6
    └── No →
        Need local / offline / customization?
        ├── Yes → Stable Diffusion (LoRA, ControlNet)
        └── No → DALL-E 3 (easiest API integration)
```

## Step 2b — Video Generation

```
Source type?
├── Text prompt only → Runway Gen-2 or Pika Labs
├── Existing image → Runway image-to-video or Stable Video Diffusion
└── Video + modification → Runway Inpaint/Repaint
Duration needed?
├── < 4s → Any tool
├── 4–16s → Runway Gen-2
└── > 16s → Stitch multiple clips; consider Sora (when available)
```

## Step 2c — AI Prototyping

```
Output format?
├── Figma-compatible → Galileo AI or Figma AI
├── HTML/React code → Uizard or v0.dev
└── Wireframe image only → DALL-E 3 with wireframe prompt style
```

## Step 2d — AI Styling

```
Need for color palette?
├── Brand-safe, curated → Adobe Firefly color wheel or Khroma
└── Algorithmic from base color → Scripts/generate-color-palette.js

Need for typography pairing?
├── → Fontjoy (AI font pairing) or Google Fonts AI recommendations
```

## Step 3 — Prompt strategy

```
First attempt?
└── Yes → Minimal prompt: [subject] + [style] + [format]
    Result unsatisfactory?
    ├── Wrong style → Add style modifiers (see prompt-engineering.md)
    ├── Unwanted elements → Add negative prompts
    ├── Wrong composition → Add composition keywords (close-up, overhead, etc.)
    └── Brand drift → Lock palette with hex codes in prompt; use reference image
```

## Step 4 — Post-processing

```
Output has background?
├── Need transparent → rembg (background removal)
└── Need different background → Stable Diffusion inpainting

Output needs resizing/format change?
└── → Scripts/generate-dalle-image.js --format or sharp CLI

Batch pipeline?
└── → OpenAI API batch + human QA sample (10% review minimum)
```
