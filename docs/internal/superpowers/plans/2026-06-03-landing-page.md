# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an animated GitHub Pages landing page for `ai-engineering-harness` — perspective grid background, glassmorphism panels, 3D artifact tilt, Framer Motion entrance animations, 9 content sections, GitHub Actions deploy.

**Architecture:** Vite + React + TypeScript static site in `site/`. One component per page section. `AnimatedGrid` renders fixed background (CSS perspective grid + ambient orbs). `src/index.css` owns all custom animation keyframes and glass-card utilities. Framer Motion handles scroll-triggered entrance animations with `useReducedMotion` fallback. CSS `perspective` + `rotateX/Y` handles 3D depth — no Three.js.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Framer Motion 11

---

## File Map

| File | Responsibility |
|---|---|
| `site/package.json` | deps, scripts |
| `site/index.html` | HTML shell, SEO meta |
| `site/vite.config.ts` | Vite + React plugin, base path |
| `site/tsconfig.json` | strict TS, react-jsx |
| `site/tailwind.config.ts` | content globs, custom font |
| `site/postcss.config.js` | tailwind + autoprefixer |
| `site/src/main.tsx` | ReactDOM.createRoot |
| `site/src/App.tsx` | section composition |
| `site/src/index.css` | Tailwind + keyframes + glass + grid CSS |
| `site/src/lib/animations.ts` | Framer Motion shared variants |
| `site/src/components/AnimatedGrid.tsx` | fixed bg: grid + orbs |
| `site/src/components/Navbar.tsx` | top nav bar |
| `site/src/components/Hero.tsx` | badge, headline, CTAs, command pipeline |
| `site/src/components/ProblemSection.tsx` | 3 pain cards + solution loop |
| `site/src/components/CommandFlow.tsx` | 8-step animated command flow |
| `site/src/components/ArtifactShowcase.tsx` | tabbed 3D artifact viewer |
| `site/src/components/DemoTerminal.tsx` | dogfood terminal block |
| `site/src/components/ProviderCards.tsx` | 4 provider cards |
| `site/src/components/FeatureGrid.tsx` | why markdown-first |
| `site/src/components/InstallSection.tsx` | install commands |
| `site/src/components/CTA.tsx` | final CTA |
| `.github/workflows/pages.yml` | GitHub Pages deploy |

---

## Task 1: Scaffold `site/` directory

**Files:**
- Create: `site/package.json`
- Create: `site/index.html`
- Create: `site/vite.config.ts`
- Create: `site/tsconfig.json`
- Create: `site/tailwind.config.ts`
- Create: `site/postcss.config.js`

- [ ] **Step 1: Create `site/package.json`**

```json
{
  "name": "ai-engineering-harness-site",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "framer-motion": "^11.3.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create `site/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ai-engineering-harness — Engineering discipline for AI coding agents</title>
    <meta name="description" content="A lightweight, markdown-first workflow kit that helps AI coding agents plan, build, verify, ship, and remember — without a heavy runtime." />
    <meta property="og:title" content="ai-engineering-harness" />
    <meta property="og:description" content="Engineering discipline for AI coding agents" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `site/vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai-engineering-harness/',
})
```

- [ ] **Step 4: Create `site/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `site/tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#060810',
        accent: {
          1: '#6366f1',
          2: '#7c3aed',
          3: '#0891b2',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: Create `site/postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Install deps and verify scaffold**

```bash
cd site
npm install
npm run typecheck
```

Expected: no TypeScript errors (no source files yet — command exits 0).

- [ ] **Step 8: Commit**

```bash
git add site/package.json site/index.html site/vite.config.ts site/tsconfig.json site/tailwind.config.ts site/postcss.config.js site/package-lock.json
git commit -m "feat(site): scaffold Vite+React+TS+Tailwind site"
```

---

## Task 2: Global styles and animation CSS

**Files:**
- Create: `site/src/index.css`
- Create: `site/src/main.tsx`

- [ ] **Step 1: Create `site/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

/* ── Design tokens ── */
:root {
  --bg: #060810;
  --surface: rgba(255, 255, 255, 0.03);
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(99, 102, 241, 0.35);
  --accent-1: #6366f1;
  --accent-2: #7c3aed;
  --accent-3: #0891b2;
  --text-muted: #94a3b8;
  --text-dim: #475569;
  --success: #4ade80;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: #e2e8f0;
  font-family: 'Inter', system-ui, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 2px; }

/* ── Perspective grid ── */
.grid-perspective {
  position: absolute;
  inset: -50%;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.12) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(600px) rotateX(55deg) translateY(-10%);
  transform-origin: center top;
  animation: gridScroll 8s linear infinite;
}

@keyframes gridScroll {
  from { transform: perspective(600px) rotateX(55deg) translateY(-10%); }
  to   { transform: perspective(600px) rotateX(55deg) translateY(calc(-10% + 60px)); }
}

/* ── Ambient orbs ── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: orbFloat 10s ease-in-out infinite;
  pointer-events: none;
}

.orb-1 { width: 500px; height: 500px; background: #4f46e5; top: -150px; left: -100px; animation-delay: 0s; }
.orb-2 { width: 400px; height: 400px; background: #7c3aed; top: 20%; right: -80px;  animation-delay: -4s; }
.orb-3 { width: 300px; height: 300px; background: #0891b2; bottom: 10%; left: 30%;  animation-delay: -7s; }

@keyframes orbFloat {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-30px) scale(1.05); }
}

/* ── Glass card ── */
.glass-card {
  background: var(--surface);
  border: 1px solid var(--border);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s;
}

/* Top highlight line */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
  pointer-events: none;
}

/* Liquid shimmer on hover */
.glass-card::after {
  content: '';
  position: absolute;
  top: -50%; left: -60%;
  width: 40%; height: 200%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
  pointer-events: none;
}

.glass-card:hover {
  border-color: var(--border-hover);
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.15);
}

.glass-card:hover::after { left: 160%; }

/* ── 3D artifact panel ── */
.artifact-3d {
  transform: perspective(800px) rotateX(6deg) rotateY(-4deg);
  transform-style: preserve-3d;
  box-shadow:
    0 40px 80px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: artifact3dBreath 6s ease-in-out infinite;
}

@keyframes artifact3dBreath {
  0%, 100% { transform: perspective(800px) rotateX(6deg) rotateY(-4deg); }
  50%       { transform: perspective(800px) rotateX(2deg) rotateY(4deg); }
}

/* ── Command card (pipeline) ── */
.cmd-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  transition: all 0.3s;
}

.cmd-card:hover,
.cmd-card.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
  transform: perspective(400px) rotateY(-6deg) translateY(-4px);
}

/* ── Pulsing dot ── */
.pulse-dot {
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px currentColor; }
  50%       { opacity: 0.4; box-shadow: none; }
}

/* ── Arrow pulse ── */
.arrow-pulse {
  animation: arrowColor 2s ease-in-out infinite;
}

@keyframes arrowColor {
  0%, 100% { color: #334155; }
  50%       { color: var(--accent-1); }
}

/* ── Terminal block ── */
.terminal {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow: hidden;
}

.terminal-header {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.terminal-dot {
  width: 10px; height: 10px; border-radius: 50%;
}

/* ── Section spacing ── */
.section-gap { padding: 80px 0; }

@media (max-width: 768px) {
  .section-gap { padding: 56px 0; }
  .orb-1 { width: 300px; height: 300px; }
  .orb-2 { width: 250px; height: 250px; }
  .artifact-3d { animation: none; transform: perspective(800px) rotateX(3deg) rotateY(-2deg); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .grid-perspective { animation: none; }
  .orb { animation: none; }
  .artifact-3d { animation: none; }
  .pulse-dot { animation: none; }
  .arrow-pulse { animation: none; }
}
```

- [ ] **Step 2: Create `site/src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Create placeholder `site/src/App.tsx` so typecheck passes**

```tsx
export default function App() {
  return <div />
}
```

- [ ] **Step 4: Verify**

```bash
cd site
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add site/src/index.css site/src/main.tsx site/src/App.tsx
git commit -m "feat(site): add global styles, CSS animations, and app entry"
```

---

## Task 3: Shared animation variants

**Files:**
- Create: `site/src/lib/animations.ts`

- [ ] **Step 1: Create `site/src/lib/animations.ts`**

```ts
import type { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
}

/** Returns no-op variants when reduced motion is preferred */
export function motionVariants(
  reduced: boolean | null,
  variants: Variants,
): Variants {
  if (reduced) return { hidden: {}, show: {} }
  return variants
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/lib/animations.ts
git commit -m "feat(site): add shared Framer Motion animation variants"
```

---

## Task 4: AnimatedGrid background

**Files:**
- Create: `site/src/components/AnimatedGrid.tsx`

- [ ] **Step 1: Create `site/src/components/AnimatedGrid.tsx`**

```tsx
export function AnimatedGrid() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="grid-perspective" />
      {/* Fade edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_40%,#060810_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_100%,#060810_0%,transparent_60%)]" />
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/AnimatedGrid.tsx
git commit -m "feat(site): add animated perspective grid background"
```

---

## Task 5: Navbar

**Files:**
- Create: `site/src/components/Navbar.tsx`

- [ ] **Step 1: Create `site/src/components/Navbar.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'

export function Navbar() {
  const reduced = useReducedMotion()

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      initial={reduced ? {} : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'rgba(6, 8, 16, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span className="font-mono text-sm text-slate-400">
        <span className="text-indigo-400">ai</span>-engineering-harness
      </span>
      <div className="flex items-center gap-6">
        <a
          href="#commands"
          className="text-sm text-slate-500 hover:text-slate-200 transition-colors hidden sm:block"
        >
          Commands
        </a>
        <a
          href="#demo"
          className="text-sm text-slate-500 hover:text-slate-200 transition-colors hidden sm:block"
        >
          Demo
        </a>
        <a
          href="https://github.com/truongnat/ai-engineering-harness"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </motion.nav>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Navbar.tsx
git commit -m "feat(site): add sticky frosted-glass navbar"
```

---

## Task 6: Hero section

**Files:**
- Create: `site/src/components/Hero.tsx`

- [ ] **Step 1: Create `site/src/components/Hero.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PIPELINE = [
  { id: 'harness-plan',     artifact: '→ PLAN.md',     active: true },
  { id: 'harness-run',      artifact: '→ impl',         active: false },
  { id: 'harness-verify',   artifact: '→ VERIFY.md',   active: false },
  { id: 'harness-ship',     artifact: '→ SHIP.md',     active: false },
  { id: 'harness-remember', artifact: '→ REMEMBER.md', active: false },
]

export function Hero() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-0"
        >
          {/* Badge */}
          <motion.div variants={item} className="mb-7">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-indigo-300"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot"
                style={{ boxShadow: '0 0 6px #818cf8' }}
              />
              v0.11.0 experimental
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Engineering discipline<br />
            for AI coding agents
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={item} className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
            A lightweight, markdown-first workflow kit. Agents plan, build,
            verify, ship, and remember — without a heavy runtime.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex gap-4 flex-wrap mb-16">
            <a
              href="#install"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 0 24px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  '0 0 40px rgba(99,102,241,0.55), 0 8px 24px rgba(0,0,0,0.3)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  '0 0 24px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)'
                ;(e.currentTarget as HTMLAnchorElement).style.transform = ''
              }}
            >
              Get started
            </a>
            <a
              href="#demo"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              View dogfood demo →
            </a>
          </motion.div>

          {/* Command pipeline */}
          <motion.div variants={item}>
            <p className="text-xs uppercase tracking-widest text-slate-600 mb-4">Workflow commands</p>
            <div className="flex flex-wrap items-center gap-2">
              {PIPELINE.map((cmd, i) => (
                <div key={cmd.id} className="flex items-center gap-2">
                  <div
                    className={`cmd-card px-4 py-3 relative cursor-default ${cmd.active ? 'active' : ''}`}
                    style={{ minWidth: '128px', textAlign: 'center' }}
                  >
                    {cmd.active && (
                      <span
                        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"
                        style={{ boxShadow: '0 0 6px #4ade80' }}
                      />
                    )}
                    <div className="font-mono text-xs text-indigo-300 mb-1">{cmd.id}</div>
                    <div className="text-xs text-slate-600">{cmd.artifact}</div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <span className="text-lg arrow-pulse select-none">›</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Hero.tsx
git commit -m "feat(site): add hero section with command pipeline"
```

---

## Task 7: Problem → Solution section

**Files:**
- Create: `site/src/components/ProblemSection.tsx`

- [ ] **Step 1: Create `site/src/components/ProblemSection.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PAINS = [
  {
    icon: '⚠',
    title: 'Agents skip planning',
    body: 'Without a goal contract, agents jump straight to code — and build the wrong thing confidently.',
  },
  {
    icon: '✗',
    title: 'Verification is optimistic prose',
    body: '"Tests pass" without evidence. No exit codes, no test counts, no proof the command actually ran.',
  },
  {
    icon: '◌',
    title: 'Context forgotten between sessions',
    body: 'Decisions, constraints, and prior work evaporate when the context window resets.',
  },
]

const SOLUTION = [
  { label: 'Goal', file: 'GOAL.md' },
  { label: 'Plan', file: 'PLAN.md' },
  { label: 'Tasks', file: 'TASKS.md' },
  { label: 'Verify', file: 'VERIFY.md' },
  { label: 'Ship', file: 'SHIP.md' },
  { label: 'Remember', file: 'REMEMBER.md' },
]

export function ProblemSection() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
            The problem
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-12">
            What breaks without discipline
          </motion.h2>

          {/* Pain cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
            {PAINS.map((pain) => (
              <motion.div key={pain.title} variants={item} className="glass-card p-6">
                <div
                  className="text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                >
                  {pain.icon}
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{pain.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{pain.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Solution loop */}
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-slate-600 mb-5">
            The solution
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-2 items-center">
            {SOLUTION.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className="px-4 py-2.5 rounded-xl text-center"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <div className="text-xs font-semibold text-indigo-300">{step.label}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">{step.file}</div>
                </div>
                {i < SOLUTION.length - 1 && (
                  <span className="text-slate-700 text-sm">→</span>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ProblemSection.tsx
git commit -m "feat(site): add problem/solution section"
```

---

## Task 8: Command Flow section

**Files:**
- Create: `site/src/components/CommandFlow.tsx`

- [ ] **Step 1: Create `site/src/components/CommandFlow.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const COMMANDS = [
  { id: 'harness-map',      reads: 'repo',           writes: 'MAP.md',       gate: false },
  { id: 'harness-start',    reads: 'MAP.md',         writes: 'GOAL.md',      gate: false },
  { id: 'harness-discuss',  reads: 'GOAL.md',        writes: 'DISCUSSION.md', gate: false },
  { id: 'harness-plan',     reads: 'DISCUSSION.md',  writes: 'PLAN.md',      gate: true  },
  { id: 'harness-run',      reads: 'PLAN.md',        writes: 'impl',         gate: false },
  { id: 'harness-verify',   reads: 'impl',           writes: 'VERIFY.md',    gate: false },
  { id: 'harness-ship',     reads: 'VERIFY.md',      writes: 'SHIP.md',      gate: true  },
  { id: 'harness-remember', reads: 'SHIP.md',        writes: 'REMEMBER.md',  gate: false },
]

export function CommandFlow() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="commands" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
            Command flow
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-12">
            Eight commands, one loop
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMANDS.map((cmd) => (
              <motion.div key={cmd.id} variants={item} className="glass-card p-5">
                {cmd.gate && (
                  <span
                    className="inline-block mb-3 text-xs px-2 py-0.5 rounded font-semibold"
                    style={{
                      background: 'rgba(234,179,8,0.1)',
                      color: '#facc15',
                      border: '1px solid rgba(234,179,8,0.2)',
                    }}
                  >
                    approval gate
                  </span>
                )}
                <div className="font-mono text-sm font-medium text-indigo-300 mb-3">
                  {cmd.id}
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex gap-2">
                    <span className="text-slate-700 w-10 shrink-0">reads</span>
                    <span className="font-mono text-slate-500">{cmd.reads}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-700 w-10 shrink-0">writes</span>
                    <span className="font-mono text-emerald-600">{cmd.writes}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/CommandFlow.tsx
git commit -m "feat(site): add 8-command flow section"
```

---

## Task 9: Artifact Showcase (3D tabbed viewer)

**Files:**
- Create: `site/src/components/ArtifactShowcase.tsx`

- [ ] **Step 1: Create `site/src/components/ArtifactShowcase.tsx`**

```tsx
import { useState, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

type Tab = 'verify' | 'plan' | 'ship' | 'remember'

const TABS: { id: Tab; label: string }[] = [
  { id: 'verify',   label: 'VERIFY.md' },
  { id: 'plan',     label: 'PLAN.md' },
  { id: 'ship',     label: 'SHIP.md' },
  { id: 'remember', label: 'REMEMBER.md' },
]

const CONTENT: Record<Tab, React.ReactNode> = {
  verify: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">status:</span> <span className="text-emerald-400 font-semibold">passed</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">| Command          | Exit | Result  |</div>
      <div className="text-slate-700">|------------------|-----:|---------|</div>
      <div><span className="text-slate-400">| npm test         |</span> <span className="text-emerald-400">0    | passed  |</span></div>
      <div><span className="text-slate-400">| node bin/validate.js |</span> <span className="text-emerald-400">0    | passed  |</span></div>
      <div className="text-slate-400">| cd dogfood &amp;&amp; npm test |</div>
      <div className="text-emerald-400">  0    | passed  |</div>
      <div className="text-slate-600 mt-3 pt-3 border-t border-white/5">tests: 2 · pass: 2 · fail: 0</div>
    </div>
  ),
  plan: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">goal:</span> <span className="text-blue-300">Add GET /health endpoint</span></div>
      <div><span className="text-slate-500">phase:</span> <span className="text-slate-400">build</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Tasks</div>
      <div className="text-slate-400">- [x] Create src/server.js</div>
      <div className="text-slate-400">- [x] Add GET /health route</div>
      <div className="text-slate-400">- [x] Write test/health.test.js</div>
      <div className="text-slate-400">- [x] npm test passes</div>
      <div className="text-slate-700">---</div>
      <div><span className="text-slate-500">gate:</span> <span className="text-yellow-400">approval required</span></div>
    </div>
  ),
  ship: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div><span className="text-slate-500">status:</span> <span className="text-emerald-400">shipped</span></div>
      <div><span className="text-slate-500">commit:</span> <span className="text-blue-300">feat: add /health endpoint</span></div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Checklist</div>
      <div className="text-slate-400">- [x] VERIFY.md status: passed</div>
      <div className="text-slate-400">- [x] All tests green</div>
      <div className="text-slate-400">- [x] No regressions</div>
      <div className="text-slate-400">- [x] Committed and pushed</div>
    </div>
  ),
  remember: (
    <div className="font-mono text-xs leading-relaxed space-y-1">
      <div className="text-indigo-400 font-semibold">## Key decisions</div>
      <div className="text-slate-400 mt-1">- Used Node built-in test runner (no Jest dep)</div>
      <div className="text-slate-400">- /health returns 200 + JSON, not plain text</div>
      <div className="text-slate-400">- Port from env var, defaults 3000</div>
      <div className="text-slate-700">---</div>
      <div className="text-indigo-400 font-semibold mt-2">## Next</div>
      <div className="text-slate-400">- Add /ready endpoint</div>
      <div className="text-slate-400">- Add request logging</div>
    </div>
  ),
}

export function ArtifactShowcase() {
  const [active, setActive] = useState<Tab>('verify')
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform =
      `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`
    cardRef.current.style.animation = 'none'
  }, [reduced])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(800px) rotateX(6deg) rotateY(-4deg)'
    cardRef.current.style.animation = ''
  }, [])

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Artifacts</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Agents show their work
          </h2>
          <p className="text-slate-500 mb-12 max-w-xl">
            Every phase produces a markdown artifact. <code className="font-mono text-indigo-400">VERIFY.md</code> requires exit codes and test counts — not prose.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className="px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all"
                style={
                  active === tab.id
                    ? {
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.4)',
                        color: '#a5b4fc',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#475569',
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 3D card */}
          <div
            ref={cardRef}
            className="artifact-3d glass-card p-8 max-w-xl"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2 mb-5">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 8px #4ade80' }}
              />
              <span className="font-mono text-xs text-emerald-400">
                .harness/{TABS.find(t => t.id === active)?.label}
              </span>
            </div>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {CONTENT[active]}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ArtifactShowcase.tsx
git commit -m "feat(site): add 3D tabbed artifact showcase"
```

---

## Task 10: Demo Terminal section

**Files:**
- Create: `site/src/components/DemoTerminal.tsx`

- [ ] **Step 1: Create `site/src/components/DemoTerminal.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

const LINES = [
  { text: '$ cd examples/dogfood-tiny-node-api', color: '#94a3b8' },
  { text: '$ npm test', color: '#94a3b8' },
  { text: '', color: '' },
  { text: '▶ test/health.test.js', color: '#6366f1' },
  { text: '', color: '' },
  { text: '  ✔ GET /health returns 200', color: '#4ade80' },
  { text: '  ✔ GET /health returns json body', color: '#4ade80' },
  { text: '', color: '' },
  { text: '  tests 2', color: '#94a3b8' },
  { text: '  pass  2', color: '#4ade80' },
  { text: '  fail  0', color: '#94a3b8' },
]

export function DemoTerminal() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="demo" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Dogfood demo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Real tests, real evidence
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl">
            The dogfood example ships a real <code className="font-mono text-indigo-400">GET /health</code> endpoint with harness artifacts and a passing CI run.
          </p>

          <div className="terminal max-w-2xl">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
              <span className="ml-3 text-xs text-slate-600 font-mono">dogfood-tiny-node-api</span>
            </div>
            <div className="p-5 space-y-0.5">
              {LINES.map((line, i) => (
                <div key={i} className="font-mono text-sm" style={{ color: line.color || 'transparent', minHeight: '1.5em' }}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-600 max-w-xl">
            This is workflow-artifact dogfood, not a full provider install demo. The harness artifacts (<code className="font-mono">GOAL.md</code>, <code className="font-mono">PLAN.md</code>, <code className="font-mono">VERIFY.md</code>) live in <code className="font-mono">examples/dogfood-tiny-node-api/.harness/</code>.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/DemoTerminal.tsx
git commit -m "feat(site): add dogfood demo terminal section"
```

---

## Task 11: Provider Cards section

**Files:**
- Create: `site/src/components/ProviderCards.tsx`

- [ ] **Step 1: Create `site/src/components/ProviderCards.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const PROVIDERS = [
  {
    name: 'Claude Code',
    tag: 'Primary',
    desc: 'Full native slash commands. Best-supported path.',
    tagStyle: { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' },
  },
  {
    name: 'Cursor',
    tag: 'Secondary',
    desc: 'Rules-based integration. Solid support.',
    tagStyle: { background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.25)' },
  },
  {
    name: 'Codex',
    tag: 'Experimental',
    desc: 'AGENTS.md entrypoint. Being validated.',
    tagStyle: { background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' },
  },
  {
    name: 'Gemini',
    tag: 'Experimental',
    desc: 'GEMINI.md entrypoint. Being validated.',
    tagStyle: { background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' },
  },
]

export function ProviderCards() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
            Providers
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Works where your agent lives
          </motion.h2>
          <motion.p variants={item} className="text-slate-500 mb-12 max-w-xl">
            v0.11.0 is experimental. Per-provider behavior is still being validated.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROVIDERS.map(p => (
              <motion.div key={p.name} variants={item} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2"
                    style={p.tagStyle}
                  >
                    {p.tag}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p variants={item} className="mt-6 text-xs text-slate-700">
            OpenCode is no longer part of the active provider scope.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ProviderCards.tsx
git commit -m "feat(site): add provider cards section"
```

---

## Task 12: FeatureGrid + InstallSection

**Files:**
- Create: `site/src/components/FeatureGrid.tsx`
- Create: `site/src/components/InstallSection.tsx`

- [ ] **Step 1: Create `site/src/components/FeatureGrid.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

const FEATURES = [
  {
    title: 'Easy to inspect',
    body: 'Every artifact is a plain markdown file. Open it in any editor, diff it in git, read it in code review.',
    icon: '◉',
    color: '#6366f1',
  },
  {
    title: 'Easy to version',
    body: 'Artifacts live in `.harness/` alongside your code. Git tracks every goal, plan, and verify decision.',
    icon: '◎',
    color: '#7c3aed',
  },
  {
    title: 'Easy for agents to follow',
    body: 'Agents read and write markdown reliably. No custom runtime, no API calls — just files with a known schema.',
    icon: '◈',
    color: '#0891b2',
  },
]

export function FeatureGrid() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-3">
            Why markdown-first?
          </motion.p>
          <motion.h2 variants={item} className="text-3xl sm:text-4xl font-bold text-white mb-12">
            The format that works everywhere
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={item} className="glass-card p-6">
                <div
                  className="text-xl mb-4 w-10 h-10 flex items-center justify-center rounded-lg font-mono"
                  style={{ background: f.color + '18', color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `site/src/components/InstallSection.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { fadeUp, motionVariants } from '../lib/animations'

export function InstallSection() {
  const reduced = useReducedMotion()
  const item = motionVariants(reduced, fadeUp)

  return (
    <section id="install" className="relative z-10 section-gap px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Install</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">Get started in seconds</h2>

          <div className="terminal max-w-xl mb-5">
            <div className="terminal-header">
              <span className="terminal-dot" style={{ background: '#ef4444' }} />
              <span className="terminal-dot" style={{ background: '#f59e0b' }} />
              <span className="terminal-dot" style={{ background: '#22c55e' }} />
            </div>
            <div className="p-5 space-y-1 font-mono text-sm">
              <div className="text-slate-400">npx ai-engineering-harness install</div>
              <div className="text-slate-400">npx ai-engineering-harness status</div>
              <div className="text-slate-400">npx ai-engineering-harness doctor</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-3">Non-interactive (CI / scripted):</p>
          <div className="terminal max-w-xl">
            <div className="p-5">
              <div className="font-mono text-sm text-slate-400">
                npx ai-engineering-harness install --provider claude --yes
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/FeatureGrid.tsx site/src/components/InstallSection.tsx
git commit -m "feat(site): add feature grid and install section"
```

---

## Task 13: CTA section

**Files:**
- Create: `site/src/components/CTA.tsx`

- [ ] **Step 1: Create `site/src/components/CTA.tsx`**

```tsx
import { motion, useReducedMotion } from 'framer-motion'
import { stagger, fadeUp, motionVariants } from '../lib/animations'

export function CTA() {
  const reduced = useReducedMotion()
  const container = motionVariants(reduced, stagger)
  const item = motionVariants(reduced, fadeUp)

  return (
    <section className="relative z-10 section-gap px-6 pb-32">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center gap-0"
        >
          <motion.p variants={item} className="text-xs uppercase tracking-widest text-indigo-400 mb-4">
            Ready?
          </motion.p>
          <motion.h2 variants={item} className="text-4xl sm:text-5xl font-extrabold mb-5"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 60%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Give your agents discipline
          </motion.h2>
          <motion.p variants={item} className="text-slate-500 mb-12 max-w-md text-lg">
            Lightweight. Markdown-first. No heavy runtime.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://github.com/truongnat/ai-engineering-harness"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 0 24px rgba(99,102,241,0.35)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
            <a
              href="#install"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Quickstart
            </a>
            <a
              href="#demo"
              className="px-7 py-3.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Dogfood demo
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck**

```bash
cd site && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/CTA.tsx
git commit -m "feat(site): add final CTA section"
```

---

## Task 14: Compose App.tsx

**Files:**
- Modify: `site/src/App.tsx`

- [ ] **Step 1: Replace placeholder `site/src/App.tsx` with full composition**

```tsx
import { AnimatedGrid } from './components/AnimatedGrid'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProblemSection } from './components/ProblemSection'
import { CommandFlow } from './components/CommandFlow'
import { ArtifactShowcase } from './components/ArtifactShowcase'
import { DemoTerminal } from './components/DemoTerminal'
import { ProviderCards } from './components/ProviderCards'
import { FeatureGrid } from './components/FeatureGrid'
import { InstallSection } from './components/InstallSection'
import { CTA } from './components/CTA'

export default function App() {
  return (
    <>
      <AnimatedGrid />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <CommandFlow />
        <ArtifactShowcase />
        <DemoTerminal />
        <ProviderCards />
        <FeatureGrid />
        <InstallSection />
        <CTA />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Typecheck and build**

```bash
cd site
npm run typecheck
npm run build
```

Expected: 0 type errors, `dist/` created successfully, no build warnings about missing modules.

- [ ] **Step 3: Smoke test in dev**

```bash
cd site && npm run dev
```

Open `http://localhost:5173/ai-engineering-harness/` — verify grid animates, navbar is visible, hero renders, no console errors. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add site/src/App.tsx
git commit -m "feat(site): compose full landing page"
```

---

## Task 15: GitHub Actions Pages workflow

**Files:**
- Create: `.github/workflows/pages.yml`

- [ ] **Step 1: Create `.github/workflows/pages.yml`**

```yaml
name: Pages

on:
  push:
    branches: [main]
    paths:
      - 'site/**'
      - '.github/workflows/pages.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json

      - name: Install site deps
        run: npm ci
        working-directory: site

      - name: Build site
        run: npm run build
        working-directory: site

      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deploy
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/pages.yml
git commit -m "ci(pages): add GitHub Pages deploy workflow for site/"
```

---

## Task 16: README update + final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add landing page link to README**

In `README.md`, after the badges line (line 11), add:

```markdown
![Landing Page](https://img.shields.io/badge/site-truongnat.github.io-818cf8)
```

And at the bottom of the nav links (line 14), add ` · [Landing Page](https://truongnat.github.io/ai-engineering-harness/)`.

- [ ] **Step 2: Run full validation suite**

```bash
# from repo root
npm ci
node bin/validate.js
npm test
cd examples/dogfood-tiny-node-api && npm test
cd ../..
cd site && npm ci && npm run build
```

Expected: all commands exit 0. `site/dist/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(site): link landing page in README"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Vite + React + TS + Tailwind + Framer Motion | Task 1 |
| Animated perspective grid | Task 2, 4 |
| Ambient orbs | Task 2, 4 |
| Glassmorphism cards with liquid shimmer | Task 2 |
| 3D artifact tilt with mouse tracking | Task 9 |
| Reduced motion support | Task 3, all components |
| Navbar | Task 5 |
| Hero: badge, headline, CTAs, pipeline | Task 6 |
| Problem section: 3 pain cards + solution | Task 7 |
| Command flow: 8 commands | Task 8 |
| Artifact showcase: tabbed VERIFY/PLAN/SHIP/REMEMBER | Task 9 |
| Dogfood demo terminal | Task 10 |
| Provider cards: 4 providers + OpenCode note | Task 11 |
| Why markdown-first: 3 feature cards | Task 12 |
| Install section | Task 12 |
| Final CTA | Task 13 |
| App composition | Task 14 |
| GitHub Pages Actions workflow | Task 15 |
| README update | Task 16 |
| base: '/ai-engineering-harness/' in vite.config | Task 1 |
| v0.11.0 experimental labeling | Task 6 |
| Hyphen-form command IDs only | Tasks 6, 8 |
| OpenCode removed note | Task 11 |

All spec requirements covered. No placeholders. Method names consistent across tasks (`fadeUp`, `stagger`, `motionVariants` defined in Task 3 and used identically in Tasks 6–13). ✓
