---
name: frontend-design-pro
description: |
  Anti-slop frontend design with distinctive aesthetics, motion, and spatial composition. 
  Breaks AI-generated clichés (no Inter/Roboto, no purple-on-white) for memorable, 
  professional interfaces with character and purpose.
  
  Use when building landing pages, marketing sites, portfolios, dashboards, or any 
  interface where visual personality matters.
when_to_use:
  - Building landing pages or marketing sites
  - Creating portfolio projects
  - Designing dashboards with visual identity
  - Breaking out of generic AI-generated aesthetics
  - Need distinctive typography, color, and motion
  - Client work requiring professional polish
when_not_to_use:
  - Internal tools where consistency > creativity
  - Strict corporate design systems already defined
  - Rapid prototyping without aesthetic requirements
  - Accessibility-first projects (use accessibility-pro first)
inputs:
  - target_audience: Who uses this and why
  - aesthetic_direction: Desired tone (minimalist, brutalist, playful, elegant, etc.)
  - content_type: Landing page, dashboard, form, e-commerce, etc.
  - tech_stack: React, Vue, vanilla HTML, Next.js, etc.
outputs:
  - design_decisions: Documented aesthetic choices with rationale
  - component_code: Styled components following design principles
  - css_variables: Cohesive color palette and typography system
  - motion_spec: Animation timing and choreography notes
---

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** project context → verify: [audience, purpose, constraints documented].
2. **State assumptions** about aesthetic direction, brand personality (**Think Before Coding**).
3. **Apply** minimum design system first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — touch only components directly related to design task (**Surgical Changes**).
5. **Define success criteria** (distinctive aesthetic, no AI slop); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note visual hierarchy and motion strategy.

## Operating principles

1. **Think Before Coding** — State assumptions: target audience, brand personality, competitive landscape. Ask when uncertain.
2. **Simplicity First** — Start with minimum viable aesthetic; add complexity only when justified.
3. **Surgical Changes** — Only touch design tokens and components directly related to the request.
4. **Goal-Driven Execution** — Define success criteria (distinctive, memorable, professional); loop until verified.

### Design philosophy (Anti-Slop Manifesto)

**Typography - Ban List (Overused by AI):**
- ❌ Inter, Roboto, Arial, system fonts
- ❌ Space Grotesk (especially overused)
- ✅ Choose distinctive, characterful fonts
- ✅ Unexpected pairings: display font + refined body font
- ✅ Variable fonts for dynamic weight/width

**Color and Theme:**
- ❌ Clichéd purple-on-white gradients
- ❌ Timid, evenly distributed palettes
- ✅ Dominant colors with sharp accents
- ✅ CSS variables for consistency (`--color-primary`, `--color-accent`)
- ✅ Accessible contrast (WCAG AA minimum)

**Motion - Prioritize Impact:**
- One well-orchestrated page load > scattered micro-interactions
- Staggered reveals create delight
- CSS-only solutions for vanilla HTML
- Motion library (Framer Motion) for React
- Timing: 150-300ms for transitions

**Spatial Composition:**
- Asymmetry over rigid grids
- Overlap and layering
- Diagonal flow and grid-breaking elements
- Generous negative space
- Unexpected layout proportions (golden ratio variants)

**Backgrounds and Visual Details:**
- Gradient meshes and noise textures
- Geometric patterns (subtle)
- Layered transparencies
- Dramatic shadows (not flat design)
- Decorative borders and custom cursors
- Grain overlays for texture

### Technology Guidelines

**CSS Architecture:**
```css
:root {
  /* Color system */
  --color-bg: #fafaf9;
  --color-text: #1c1917;
  --color-primary: #dc2626;
  --color-accent: #f59e0b;
  
  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans 3', sans-serif;
  
  /* Spacing scale */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2.5rem;
  --space-xl: 4rem;
  
  /* Motion */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
}
```

**Component Structure:**
- BEM naming or CSS-in-JS
- Data attributes for variants (`data-variant="primary"`)
- CSS custom properties for theming
- Container queries for responsive

## Suggested response format

### For new designs:

```markdown
## Design Decisions

**Aesthetic Direction:** [minimalist/brutalist/playful/elegant/dark]
**Target Audience:** [who and why]
**Differentiation Strategy:** [what makes this memorable]

### Typography
- Display: [Font] — [rationale]
- Body: [Font] — [rationale]

### Color System
- Primary: [hex] — [usage]
- Accent: [hex] — [usage]
- Background: [hex]
- Text: [hex]

### Motion Strategy
- Page load: [stagger pattern]
- Interactions: [hover/focus states]
- Transitions: [timing]

## Implementation

[Code blocks with styled components]
```

### For design reviews:

```markdown
## Anti-Slop Audit

**Typography:** [Pass/Needs work] — [feedback]
**Color:** [Pass/Needs work] — [feedback]
**Motion:** [Pass/Needs work] — [feedback]
**Layout:** [Pass/Needs work] — [feedback]

### Recommendations
1. [Specific actionable change]
2. [Specific actionable change]

### Risk Assessment
- [Visual hierarchy issues]
- [Accessibility concerns]
- [Performance impact of motion]
```

## Quick examples

### Example 1: Landing page for creative agency

**User:** "Build a landing page for a creative agency"

**Agent workflow:**
1. **Confirm:** Target audience (potential clients looking for distinctive work)
2. **State assumptions:** 
   - Aesthetic: Bold, artistic, memorable
   - Must avoid: Corporate/generic look
   - Tech: Next.js + Tailwind
3. **Apply minimum:**
   - Typography: Playfair Display (headings) + Source Sans 3 (body)
   - Color: Deep burgundy (#7c2d12) + warm cream (#fafaf9) + gold accent (#f59e0b)
   - Motion: Staggered hero text reveal
4. **Surgical:** Only create hero section first, verify aesthetic
5. **Goal:** Distinctive enough to stand out from template sites?

**Output:** Hero with asymmetric layout, overlapping elements, custom cursor, grain texture overlay.

### Example 2: Dashboard with personality

**User:** "Redesign this admin dashboard to not look generic"

**Agent workflow:**
1. **Confirm:** Internal tool but needs visual identity
2. **State assumptions:**
   - Can break some conventions for better UX
   - Data density required
   - Dark mode preference
3. **Apply:**
   - Typography: JetBrains Mono (data) + Plus Jakarta Sans (UI)
   - Color: Slate dark mode + vibrant accent per section
   - Motion: Subtle data update animations
4. **Surgical:** Update design tokens only, keep component structure

**Output:** Dark mode dashboard with section-coded accents, monospace data, smooth transitions.

### Example 3: Component audit

**User:** "Review this hero component for anti-slop compliance"

**Agent:** Run checklist against 5 dimensions, flag issues, suggest fixes.

## References

- `/skills/frontend-design-pro/references/typography-guide.md` — Curated font pairings
- `/skills/frontend-design-pro/references/color-palettes.md` — Distinctive palettes
- `/skills/frontend-design-pro/references/motion-patterns.md` — CSS & JS animation specs
- `/skills/frontend-design-pro/references/layout-principles.md` — Asymmetry, overlap, grid-breaking
- `/skills/frontend-design-pro/references/anti-slop-checklist.md` — Review checklist

## Checklist

### Before starting
- [ ] Target audience and purpose defined
- [ ] Aesthetic direction chosen (with rationale)
- [ ] Tech stack confirmed
- [ ] Accessibility requirements noted

### During design
- [ ] Typography avoids ban list
- [ ] Color system has dominant + accent (not timid)
- [ ] Motion has orchestrated moments
- [ ] Layout has intentional asymmetry
- [ ] Visual details add texture/depth

### Before delivery
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated explicitly (audience, tone, constraints)
  - [ ] Minimum design system applied (escalated only when justified)
  - [ ] Surgical changes only (design tokens, not unrelated code)
  - [ ] Success criteria defined (distinctive, memorable, professional)
- [ ] Accessibility: WCAG AA contrast ratios
- [ ] Responsive: Mobile-first, container queries
- [ ] Performance: Animation uses transforms/opacity only
- [ ] No AI slop detected (typography, color, layout review)

### Design system documentation
- [ ] CSS variables documented
- [ ] Typography scale defined
- [ ] Color palette rationale written
- [ ] Motion timing spec provided
- [ ] Component variants listed
