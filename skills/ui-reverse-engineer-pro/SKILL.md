---
name: ui-reverse-engineer-pro
description: |
  Professional skill for reverse-engineering UI from images, screenshots, mockups, or reference UIs into clean, maintainable, system-based code without blind pixel cloning.

  Use when rebuilding UI from a screenshot or mockup without a proper design file, extracting layout structure from a reference image, or translating a visual into maintainable system-based code.

  Triggers: "image to code", "screenshot to UI", "mockup implementation", "reverse engineer UI", "clone UI", "design from reference", "visual to code", "layout extraction", "reference UI", "screenshot rebuild".
metadata:
  short-description: UI reverse engineering from images to system-based code
  content-language: en
  domain: frontend-engineering
---

# UI Reverse Engineer (professional)

Transform images, screenshots, mockups, or reference UIs into clean, maintainable, system-based code without blind pixel cloning. This skill provides a structured methodology for converting visual references into production-ready UI with proper layout systems, spacing tokens, typography hierarchy, and component architecture.

## Boundary

**Owns:**
- Image-to-UI reverse engineering methodology
- Layout analysis from visual references
- Spacing scale estimation and standardization
- Typography hierarchy extraction
- Component identification and extraction
- L.A.S.T.C framework (Layout, Alignment, Spacing, Typography, Components)
- 7-step reverse engineering process
- Output quality rubric (7 criteria × 10 points)
- Prompt templates for AI-assisted UI generation

**Defers to:**
- **`design-system-pro`** — Design tokens, component library architecture, design system implementation
- **`react-pro`** — React-specific implementation, hooks, state management, SSR/hydration
- **`nextjs-pro`** — Next.js-specific patterns, routing, Server Components, RSC
- **`react-native-pro`** — React Native-specific layout, safe areas, mobile UX patterns
- **`flutter-pro`** — Flutter widget trees, platform-specific considerations
- **`image-processing-pro`** — Raster image manipulation (resize, crop, format conversion) before analysis
- **`content-analysis-pro`** — OCR, text extraction, chart reading from images (if needed)

**Related skills (this repo):**
- `design-system-pro` — Design system architecture and token systems
- `react-pro` — React implementation patterns
- `nextjs-pro` — Next.js-specific UI patterns
- `react-native-pro` — Mobile-specific UI considerations
- `flutter-pro` — Flutter widget architecture

## When to use

- Converting screenshots/mockups to UI code
- Analyzing reference UIs for design system extraction
- Working with visual-only references (PNG/JPG without design files)
- AI-generated mockups that need clean implementation
- Figma exports that are images only
- Building UI from customer-provided screenshots
- Extracting layout patterns from competitor UIs
- Reverse-engineering UI for component library development

- **Trigger keywords:** image to code, screenshot to UI, mockup implementation, reverse engineer UI, clone UI, design from reference, visual to code, pixel-perfect (avoid), UI analysis, layout extraction

## When not to use

- When you have proper design files (Figma, Sketch, Adobe XD) — use design tools instead
- When the reference is already code — refactor directly
- When you need only raster image manipulation (resize, crop, convert) — use `image-processing-pro`
- When the goal is pixel-perfect cloning — this skill focuses on system-based rebuild, not blind pixel matching
- When you need accessibility audit only — use dedicated accessibility tools
- When you need performance optimization of existing UI — use `performance-tuning-pro`

## Required inputs

- **Visual reference:** Image, screenshot, or mockup (PNG, JPG, etc.)
- **Target platform:** React, Next.js, React Native, Flutter, or other framework
- **Design system context:** Existing design system (if any) or need to create one
- **Component library preference:** Shadcn, Material UI, custom, etc. (if applicable)

## Expected output

- **Layout structure:** Tree/hierarchy of major sections and components
- **Spacing scale:** Standardized spacing tokens (e.g., 4, 8, 12, 16, 20, 24, 32, 40)
- **Typography hierarchy:** Title, subtitle, body, caption, label levels with sizing/weight
- **Component list:** Reusable components identified (card, button, list item, etc.)
- **Code implementation:** Clean, componentized code following the target framework
- **Quality score:** Self-assessment using the 7-criteria rubric (each 0-10 points)

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** **Analyze the image role** — Determine if it's layout reference, style reference, UX reference, or combined → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Operating principles

- Rebuild the UI as a **system**, not a blind pixel clone.
- Extract **layout, spacing, typography, and components** separately before coding.
- Normalize to **reusable scales and primitives** instead of preserving arbitrary measurements.
- Match the **reference intent** while adapting to the target platform’s constraints and conventions.
- Prefer the **smallest component structure** that can reproduce the main visual hierarchy cleanly.

## Suggested response format

Use this structure for UI reverse-engineering work:

1. **Reference read** — what the image is communicating and which parts are layout vs style cues.
2. **System breakdown** — layout tree, spacing scale, typography levels, reusable components.
3. **Implementation approach** — target framework structure and any platform adjustments.
4. **Main risks** — ambiguities, missing states, responsiveness, or inaccessible patterns in the reference.
5. **Verification** — how to compare the rebuilt UI against the reference without pixel-clone drift.

## Resources in this skill

- `references/core-methodology.md` — overall reverse-engineering approach.
- `references/lastc-framework.md` — layout, alignment, spacing, typography, component analysis.
- `references/7-step-process.md` — practical execution flow from reference to code.
- `references/quality-rubric.md` — scoring rubric for output quality.
- `references/anti-patterns.md` — common mistakes such as pixel cloning or arbitrary spacing.

## Quick example

User asks: "Turn this dashboard screenshot into a clean React implementation."

Response shape:
- Identify the main regions, dominant spacing rhythm, and typography hierarchy.
- Convert visual observations into a tokenized layout and a short component list.
- Explain where the code should intentionally diverge from the screenshot for responsiveness or accessibility.
- Verify by checking structural fidelity and hierarchy rather than copying every pixel.

## Checklist before calling the skill done

- The reference has been decomposed into layout, spacing, typography, and components.
- Arbitrary visual measurements were normalized into a reusable system.
- Platform-specific adjustments are explicit.
- Risks from missing states or unclear behaviors are called out.
- Verification focuses on hierarchy and intent, not blind cloning.
