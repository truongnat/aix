---
title: Landing Page Design
date: 2026-06-03
status: approved
---

# Landing Page Design — ai-engineering-harness

## Goal

A polished GitHub Pages landing page that communicates the product in 10 seconds, looks visually premium, and is honest about experimental status.

Target URL: `https://truongnat.github.io/ai-engineering-harness/`

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Bundler | Vite | Fast dev, static output to `dist/` |
| UI | React + TypeScript | Component isolation, type safety |
| Styles | Tailwind CSS | Utility-first, no runtime overhead |
| Animation | Framer Motion | Entrance animations, stagger, hover |
| 3D/depth | CSS only | No Three.js — lighter, no fallback risk |
| Deploy | GitHub Pages via Actions | Standard, no extra infra |

Root: `site/` directory in repo root. Build output: `site/dist/`.

---

## Visual Design System

### Color palette

```
Background:   #060810  (near-black)
Surface:      rgba(255,255,255,0.03–0.06) (glass panels)
Border:       rgba(255,255,255,0.08–0.12)
Accent-1:     #6366f1  (indigo — primary glow)
Accent-2:     #7c3aed  (violet — secondary orb)
Accent-3:     #0891b2  (cyan — third orb / terminal)
Text-primary: #e2e8f0
Text-muted:   #94a3b8
Text-dim:     #475569
Success:      #4ade80  (evidence/verify green)
Warning:      #facc15  (experimental badge)
```

### Grid background

- CSS perspective grid: `rotateX(55deg)` on a repeating `60px` line pattern
- Scrolls toward viewer via `translateY` animation (8s loop)
- Radial gradient fade at top and bottom edges

### Ambient orbs

Three fixed blurred circles (filter: blur 80px):
- Indigo (top-left, 500px)
- Violet (top-right, 400px)  
- Cyan (bottom-center, 300px)

Slow float animation, 10s, staggered.

### Glass cards

```css
background: rgba(255,255,255,0.03);
border: 1px solid rgba(255,255,255,0.08);
backdrop-filter: blur(24px);
border-radius: 20px;
```

Hover: border glow, lift, liquid shimmer (pseudo-element sweep).

### 3D command pipeline cards

Hover: `perspective(400px) rotateY(-8deg) translateY(-4px)` + indigo glow.

### 3D artifact panel

Breathing `rotateX(6deg) rotateY(-4deg)` tilt animation (6s ease loop).  
Mouse-tracking tilt on desktop via JS event listener.

---

## Page Sections

### 1. Hero

- Badge: `v0.11.0 experimental` (pulsing dot)
- H1: `Engineering discipline for AI coding agents`
- Subtitle: `A lightweight, markdown-first workflow kit...`
- CTAs: `Get started` (indigo) + `View dogfood demo →` (ghost)
- Hero visual: animated command pipeline  
  `harness-plan → harness-run → harness-verify → harness-ship → harness-remember`  
  with glowing active card, artifact labels, and CSS arrows

### 2. Problem → Solution

Three pain cards (glass, stagger reveal):
- "Agents skip planning"
- "Verification becomes optimistic prose"
- "Context forgotten between sessions"

Arrow down to solution loop:
`Goal → Plan → Tasks → Verify → Ship → Remember`

### 3. Command Flow

Vertical or horizontal animated flow of all 8 commands:
`harness-map` · `harness-start` · `harness-discuss` · `harness-plan` · `harness-run` · `harness-verify` · `harness-ship` · `harness-remember`

Each card shows: command name, artifact read/written, gate indicator.

### 4. Artifact Showcase

Tabbed or animated card switcher:
- `PLAN.md` — goal + tasks table
- `VERIFY.md` — status: passed + evidence table (most prominent)
- `SHIP.md` — summary + checklist
- `REMEMBER.md` — key decisions

3D tilt panel, mouse-tracking on desktop.

### 5. Dogfood Demo

Terminal-style block:
```bash
cd examples/dogfood-tiny-node-api
npm test
# tests 2 · pass 2 · fail 0
```

Note: "This is workflow-artifact dogfood, not a full provider install demo."

### 6. Providers

Four cards (glass grid):
- Claude Code — Primary
- Cursor — Secondary  
- Codex — Experimental
- Gemini — Experimental

Note: "OpenCode is no longer part of the active provider scope."

### 7. Why markdown-first?

Three feature cards:
- Easy to inspect
- Easy to version
- Easy for agents to follow

### 8. Install

```bash
npx ai-engineering-harness install
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Non-interactive variant shown below.

### 9. Final CTA

Three buttons: GitHub · Quickstart · Dogfood Demo

---

## File Structure

```
site/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  src/
    main.tsx
    App.tsx
    index.css
    components/
      Hero.tsx            — badge, headline, CTAs, pipeline
      AnimatedGrid.tsx    — CSS perspective grid background
      CommandFlow.tsx     — 8-step command flow section
      ArtifactShowcase.tsx — tabbed VERIFY/PLAN/SHIP/REMEMBER
      DemoTerminal.tsx    — dogfood terminal block
      ProviderCards.tsx   — 4 provider cards
      FeatureGrid.tsx     — problem cards + why markdown
      CTA.tsx             — final CTA section
      Navbar.tsx          — top nav (minimal)
```

---

## GitHub Actions Workflow

File: `.github/workflows/pages.yml`

```yaml
name: Pages
on:
  push:
    branches: [main]
    paths: [site/**]
  workflow_dispatch:
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: site/package-lock.json }
      - run: npm ci
        working-directory: site
      - run: npm run build
        working-directory: site
      - uses: actions/upload-pages-artifact@v3
        with: { path: site/dist }
      - uses: actions/deploy-pages@v4
        id: deploy
```

Existing `.github/workflows/ci.yml` is untouched.

---

## Animation Constraints

- All entrance animations via Framer Motion `fadeInUp` + stagger
- Cards: `whileHover` lift + glow
- Reduced motion: `useReducedMotion()` hook — skip all motion when true
- No particle systems, no heavy canvas loops
- Mobile: disable mouse-tracking tilt, keep CSS animations

---

## Validation

After build, verify:
```bash
cd site && npm ci && npm run build
```

Root validation and tests are unchanged. `validate.js` is not modified.

---

## Constraints Confirmed

- v0.11.0 is experimental — stated in badge and hero
- Not called an agent framework, runtime platform, or harness OS
- No universal slash-command claim
- Command IDs: hyphen form only (`harness-plan`, not `harness:plan`)
- OpenCode: mentioned as removed, not listed as a provider
- Dogfood demo labeled as workflow-artifact only, not full provider demo
