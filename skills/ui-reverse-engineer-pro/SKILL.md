---
name: ui-reverse-engineer-pro
description: Professional skill for reverse-engineering UI from images, screenshots, mockups, or reference UIs into clean, maintainable, system-based code without blind pixel cloning
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

1. **Analyze the image role** — Determine if it's layout reference, style reference, UX reference, or combined
2. **Extract layout wireframe** — Break image into blocks (header, hero, stats, list, CTA, etc.)
3. **Estimate spacing scale** — Map visual gaps to standardized spacing tokens (not pixel values)
4. **Identify typography hierarchy** — Determine title, subtitle, body, caption, emphasis levels
5. **Recognize components** — Identify reusable components (card, button, input, badge, etc.)
6. **Build layout skeleton first** — Create layout-only version (flex/stack/grid, spacing, grouping)
7. **Polish visual details later** — Add color, radius, border, shadow, effects after layout is solid

### Operating principles

1. **Image is signal, not spec** — Screenshots lack auto-layout, spacing tokens, grid rules, responsive rules, interaction logic, component architecture. Use image as visual reference, mood, hierarchy hint, layout hint — not absolute specification.

2. **Rebuild system, don't clone pixel** — Wrong approach: measure every px, match every shadow, force AI to clone details. Result: dirty code, chaotic spacing, non-reusable components, poor responsive, "looks like but feels cheap". Correct approach: Image → Layout → Structure → Token → Component → Code.

3. **Layout before visual** — UI beauty comes from clear layout, even spacing, proper typography hierarchy, good visual rhythm, minimal conflict. Analysis order: 1. Layout, 2. Spacing, 3. Typography, 4. Components, 5. Colors, 6. Effects. Never reverse this.

4. **Consistency beats precision** — Map all spacing to a unified scale (4, 8, 12, 16, 20, 24, 32, 40). Read spacing from image: very close → 4/8, close → 12, light group separation → 16, section separation → 24, strong separation → 32/40. Golden rule: evenness matters more than pixel accuracy.

5. **Component thinking, not piece thinking** — Don't think "this shape, that text, that icon". Think "card, button, input, list item, badge, stat tile, tab bar, modal block". Component thinking yields cleaner code, reusability, easier style updates, better AI support.

6. **Layout skeleton first, style later** — Phase 1: Layout only (flex/stack/grid, width/height, spacing, grouping, order). Phase 2: Typography + components. Phase 3: Visual polish (color, radius, border, shadow, effects). Styling before layout is solid leads to painful patching and messy code.

7. **Judge by perceived quality, not pixel matching** — When comparing to reference, ask: Is spacing rhythm good? Do eyes know where to look first? Is the screen cramped? Too many elements competing for attention? Is overall tone clean? Don't ask: why is this 2px off from the image? Is shadow exactly 37% opacity?

## Default recommendations by scenario

### **Screenshot to React + Tailwind**
- Use 8-based spacing scale (8, 16, 24, 32, 40, 48, 64)
- Prioritize flex/grid clarity
- Separate components early
- Consider shadcn if design system aligns

### **Mockup to React Native**
- Emphasize strong hierarchy
- Ensure even spacing
- Avoid over-forcing web style
- Check vertical rhythm
- Use SafeArea for mobile edges

### **Reference to Flutter**
- Clean widget tree
- Proper use of Column, Row, Padding, SizedBox, Expanded
- Don't hardcode everything per screenshot
- Separate widget by section first, style after

### **Competitor UI analysis**
- Focus on layout patterns
- Extract spacing scale
- Note typography hierarchy
- Identify reusable components
- Document UX flow and CTA placement

## Decision trees

### **How detailed should the analysis be?**

- **Quick (5 min):** 3-7 major components, basic spacing scale, layout skeleton only → See "5-minute quick run" in references
- **Standard (15-30 min):** Full L.A.S.T.C analysis, component list, spacing scale, typography hierarchy → Standard workflow
- **Deep (45-60 min):** Complete analysis with state considerations, responsive strategy, edge cases, full quality rubric → Production-critical UI

### **Should I use AI or manual analysis?**

- **Manual:** Simple layouts, clear hierarchy, familiar patterns, tight deadline
- **AI-assisted:** Complex layouts, ambiguous hierarchy, unfamiliar patterns, need component extraction, time available for iteration
- **Hybrid:** Manual layout skeleton + AI for component generation and polish

### **What if AI produces bad code?**

- **Spacing inconsistent:** Ask AI to use 8-based spacing scale, no random values
- **Hierarchy weak:** Provide explicit typography levels (H1: 24/semibold, H2: 20/semibold, etc.)
- **Components not clean:** Explicitly name components (SettingsListItem, not "white box with icon")
- **Visual clutter:** Remove effects, focus on layout, add polish later
- **Clone-like appearance:** Emphasize "capture spirit, not pixels", ask for system-based rebuild

### **When to reject AI output?**

- Random spacing values (13, 19, 11) without justification
- Style before layout is solid
- Nested div soup without component structure
- Visual na-na but lacks product sense
- Fails 7-criteria rubric below 6/10 in any category

## Anti-patterns

- **Blind pixel cloning** — Measuring px, matching shadows, forcing exact details → dirty code, chaotic spacing, non-reusable components
- **Style-first approach** — Adding gradient, shadow, effects before layout is solid → painful patching
- **Image as absolute spec** — Treating screenshot as complete specification → misses responsive, states, interactions
- **Early visual overload** — Gradient, glow, glass, blur, strong shadows before layout is solid → non-quality UI
- **Trusting AI output blindly** — AI often guesses wrong grouping, component split, spacing, nested div, visual na-na without product sense
- **Random spacing values** — Using values like 13, 19, 11 without clear justification → sign of clone-based thinking
- **Component-blind thinking** — Thinking in shapes and text instead of components → non-reusable, hard-to-maintain code

## Cross-skill handoffs

- **To `design-system-pro`:** When you need to formalize extracted spacing scales, typography hierarchy, and component definitions into a proper design system with tokens and documentation.
- **To `react-pro` / `nextjs-pro`:** When layout analysis is complete and you need framework-specific implementation guidance (hooks, state management, SSR, RSC).
- **To `react-native-pro` / `flutter-pro`:** When moving from web-based analysis to mobile-specific implementation considerations (safe areas, platform conventions).
- **To `content-analysis-pro`:** When you need OCR, text extraction, or chart data reading from images before UI analysis.

## Quick example

### **Example 1 — Simple screenshot to React + Tailwind**

**Input:** Screenshot of a dashboard with header, 3 stat cards in a row, and a list below.

**Analysis:**
- Layout: Column (header) → Row (3 stat cards) → Column (list)
- Spacing: 8 (card internal), 16 (between cards), 24 (sections)
- Typography: H2 (20/semibold), Body (14/regular), Caption (12/regular)
- Components: StatCard, ListItem, Header

**Output:** React components with Tailwind, 8-based spacing, clean component structure.

---

### **Example 2 — Complex mockup with multiple sections**

**Input:** Full-page mockup with hero, features grid, testimonials, CTA, footer.

**Analysis:**
- Layout: Hero → Features (grid) → Testimonials (row of cards) → CTA → Footer
- Spacing: 16 (internal), 24 (between sections), 32 (major sections)
- Typography: H1 (32/bold), H2 (24/semibold), H3 (20/medium), Body (16/regular)
- Components: HeroSection, FeatureCard, TestimonialCard, CTABanner, Footer

**Output:** Structured React components with proper hierarchy, responsive grid, reusable components.

---

### **Example 3 — Mobile app screenshot to React Native**

**Input:** Mobile app screenshot with app bar, list items, bottom navigation.

**Analysis:**
- Layout: App bar (fixed) → Scrollable content → Bottom nav (fixed)
- Spacing: 8 (internal), 12 (between items), 16 (sections)
- Typography: Title (18/semibold), Body (14/regular), Caption (12/regular)
- Components: AppBar, ListItem, BottomNav

**Output:** React Native with SafeArea, proper scrolling, component structure.

## Checklist before calling the skill done

- [ ] Visual reference provided (image, screenshot, mockup)
- [ ] Target platform specified (React, Next.js, React Native, Flutter, etc.)
- [ ] Design system context clear (existing or new)
- [ ] Component library preference stated (if applicable)
- [ ] Analysis depth agreed (quick/standard/deep)
- [ ] AI vs manual approach decided
- [ ] Output format expectations clear (layout structure, code, quality score)
- [ ] 7-criteria quality rubric understood (layout clarity, spacing consistency, typography hierarchy, component reuse, maintainability, visual cleanliness, faithfulness to intent)

## Resources in this skill

| Topic | File |
|-------|-------|
| Core methodology | `references/core-methodology.md` |
| L.A.S.T.C framework | `references/lastc-framework.md` |
| 7-step process | `references/7-step-process.md` |
| Prompt templates | `references/prompt-templates.md` |
| Quality rubric | `references/quality-rubric.md` |
| Quick run (5 min) | `references/quick-run.md` |
| Platform-specific guidance | `references/platform-specific.md` |
| Common anti-patterns | `references/anti-patterns.md` |
| Blur & Box technique | `references/blur-and-box.md` |
| Golden formulas | `references/golden-formulas.md` |
