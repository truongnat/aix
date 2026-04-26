---
name: ui-ux-system-pro
description: |
  Comprehensive design system intelligence with searchable database of 50+ UI styles,
  97 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types.
  Generates complete design systems with rationale, best practices, and accessibility compliance.

  Use when building design systems, creating comprehensive style guides, or need
  data-driven design decisions with professional rationale.

  Triggers: "UI/UX system", "design system", "accessible palette", "UX rules", "fintech design system", "healthcare design system", "component primitives", "typography system", "spacing system", "accessibility checklist".
metadata:
  short-description: UX system design — color palettes, font pairings, UX guidelines, component patterns, accessibility
  content-language: en
  domain: ux-systems
  level: professional
---

# UX System (professional)

## Boundary

**`ui-ux-system-pro`** owns **comprehensive UX system design** — building design systems from scratch with data-backed color palette selection (97 palettes), font pairings (57 options), UX rule prioritization (99 guidelines), chart type guidance (25 types), and industry-specific compliance rationale. **`ui-stack-pro`** owns ongoing enforcement of design system rules against generated components; `ui-ux-system-pro` establishes the system, `ui-stack-pro` polices it. **`platform-design-pro`** takes over when platform-native guidelines (HIG, Material Design 3) constrain the system. **`frontend-design-pro`** handles aesthetic direction for web-specific visual personality when the full system architecture is not needed.

## When to use

- Building a complete design system from scratch
- Creating style guides for teams
- Need color palette with accessibility compliance
- Choosing typography for specific industry
- Designing complex data visualizations
- Building SaaS, dashboards, or enterprise apps
- Need UX rationale for design decisions
- Multi-platform design (web + mobile)

## When not to use

- Quick prototypes without design requirements
- One-off landing pages (use frontend-design-pro)
- Strictly following existing brand guidelines
- Need creative/aesthetic direction only

## Required inputs

- **product_type**: SaaS, e-commerce, dashboard, etc.
- **industry**: Fintech, healthcare, education, etc.
- **target_users**: B2B, B2C, internal, public
- **platforms**: Web, mobile, desktop
- **accessibility_level**: AA, AAA

## Expected output

- **design_system**: Complete design tokens and rationale
- **component_library**: Patterns for buttons, forms, tables, etc.
- **color_palette**: Accessible color system with contrast ratios
- **typography_scale**: Type ramp with font pairings
- **ux_guidelines**: 99 UX rules prioritized by impact


## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** product context → verify: [type, industry, users, platforms documented].
2. **State assumptions** about user needs, competitive landscape, brand position (**Think Before Coding**).
3. **Apply** minimum design system first (core tokens only); expand when justified (**Simplicity First**).
4. **Make surgical changes** — only touch design tokens directly related to component (**Surgical Changes**).
5. **Define success criteria** (accessible, consistent, scalable); loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format** with prioritized UX rationale.

### Operating principles

1. **Think Before Coding** — State assumptions: user personas, business goals, technical constraints. Ask when uncertain.
2. **Simplicity First** — Start with core tokens (color, type, space); add complexity only when justified.
3. **Surgical Changes** — Only modify tokens/components directly related to the request.
4. **Goal-Driven Execution** — Define success criteria (accessible, consistent, scalable); verify with checklists.

### Design System Architecture

**Core Tokens (Level 1):**
```
Color: Primary, Secondary, Background, Text, Accent
Typography: Font families, sizes (xs-xl), weights, line heights
Spacing: Scale (4px-64px), component gaps, section padding
Shadows: Elevation levels (0-5)
Border: Radius scale, widths
```

**Semantic Tokens (Level 2):**
```
--color-action-primary: var(--color-primary-600);
--color-action-primary-hover: var(--color-primary-700);
--color-surface-elevated: var(--color-white);
--color-text-primary: var(--color-gray-900);
```

**Component Tokens (Level 3):**
```
--button-padding: var(--space-3) var(--space-4);
--button-radius: var(--radius-md);
--button-primary-bg: var(--color-action-primary);
```

### UX Rule Priority

| Priority | Category | Impact | Examples |
|----------|----------|--------|----------|
| 1 | Accessibility | CRITICAL | 4.5:1 contrast, focus rings, alt text |
| 2 | Touch & Interaction | CRITICAL | 44px touch targets, clear feedback |
| 3 | Performance | HIGH | Load time < 3s, 60fps animations |
| 4 | Layout & Responsive | HIGH | Mobile-first, readable line length |
| 5 | Typography & Color | MEDIUM | Hierarchy, brand consistency |
| 6 | Animation | MEDIUM | Purposeful, not distracting |
| 7 | Style Selection | MEDIUM | Industry-appropriate |
| 8 | Charts & Data | LOW | Clear legends, proper scales |

### Industry-Specific Guidelines

**SaaS / B2B:**
- Dense information display
- Data tables, filters, bulk actions
- Keyboard shortcuts
- Dark mode support
- Focus on efficiency

**E-commerce:**
- High-quality product imagery
- Clear pricing and CTAs
- Trust signals (reviews, security)
- Guest checkout option
- Mobile-first purchasing

**Healthcare:**
- High contrast (accessibility AAA)
- Calming color palettes
- Clear error prevention
- HIPAA-compliant forms
- Emergency information priority

**Fintech:**
- Security indicators
- Real-time data updates
- Transaction confirmations
- Regulatory compliance notes
- Trust and credibility focus

**Education:**
- Progressive disclosure
- Clear progress indicators
- Multiple content formats
- Accessibility first
- Engagement metrics

## Suggested response format

### For design system creation:

```markdown
## Design System: [Product Name]

### Foundation
**Product Type:** [SaaS/B2C/etc]
**Industry:** [Fintech/Healthcare/etc]
**Target Users:** [Personas]

### Color System
**Primary Palette:**
- 50: #[hex] — backgrounds
- 100-400: tints
- 500: primary action
- 600-900: shades for states

**Accessibility Verification:**
- Primary 500 on White: [ratio]:1 [Pass/Fail]
- Primary 600 on Gray 100: [ratio]:1 [Pass/Fail]

### Typography
**Scale:** Major Third (1.25)
- Display: [Font] — headlines
- Body: [Font] — paragraphs
- Mono: [Font] — code/data

### Spacing
**Base unit:** 4px
- xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px

### Component Primitives
**Buttons:**
- Padding: [value]
- Radius: [value]
- States: default, hover, active, disabled, loading

**Forms:**
- Label positioning: above
- Error display: inline with icon
- Validation: real-time after blur

### UX Guidelines (Priority Order)
**CRITICAL:**
1. All interactive elements keyboard accessible
2. Focus indicators visible (3px outline)
3. Touch targets minimum 44x44px
4. Error prevention for destructive actions

**HIGH:**
5. Loading states for async actions
6. Empty states with guidance
7. Consistent navigation placement
...

### Usage Examples
[Code snippets for key components]
```

### For design system audit:

```markdown
## Design System Audit

### Scorecard
| Category | Score | Issues |
|----------|-------|--------|
| Accessibility | [x]/100 | [list] |
| Consistency | [x]/100 | [list] |
| Completeness | [x]/100 | [list] |
| Documentation | [x]/100 | [list] |

### Critical Issues
1. [Issue] — [Fix recommendation]

### Recommendations
[Prioritized by impact]
```

## Quick example

### Example 1: SaaS dashboard design system

**User:** "Create design system for B2B analytics dashboard"

**Agent workflow:**
1. **Confirm:** B2B, analytics, data-heavy, desktop-first
2. **State assumptions:**
   - Users: Data analysts, managers
   - Efficiency > aesthetics
   - Dark mode preferred
   - Keyboard power users
3. **Apply minimum:**
   - Color: Slate dark mode + cyan accent
   - Typography: Inter (body), JetBrains Mono (data)
   - Spacing: Compact (4px-32px scale)
4. **Surgical:** Core tokens only, no components yet
5. **Goal:** Pass accessibility audit, consistent spacing

**Output:**
- Dark mode design system
- Data table patterns
- Filter/sort interactions
- Keyboard shortcut spec

### Example 2: E-commerce style guide

**User:** "Design system for fashion e-commerce"

**Agent workflow:**
1. **Confirm:** B2C, fashion, mobile-first, visual-heavy
2. **State assumptions:**
   - Users: Browse on mobile, buy impulse
   - Imagery is primary
   - Trust critical
3. **Apply:**
   - Color: Warm neutrals + bold accent
   - Typography: Playfair (brand), Inter (UI)
   - Components: Product cards, cart, checkout
4. **Surgical:** Start with product card pattern
5. **Goal:** Conversion-optimized, accessible

**Output:**
- Product card variants
- Image gallery patterns
- Checkout flow UX
- Trust signal placement

### Example 3: Healthcare compliance check

**User:** "Audit our design system for healthcare compliance"

**Agent:** Run accessibility check, HIPAA considerations, high contrast verification.

## Resources in this skill

- `/skills/ui-ux-system-pro/references/color-database.md` — 97 accessible palettes
- `/skills/ui-ux-system-pro/references/typography-database.md` — 57 font pairings by industry
- `/skills/ui-ux-system-pro/references/ux-rules.md` — 99 guidelines prioritized
- `/skills/ui-ux-system-pro/references/component-patterns.md` — SaaS, e-commerce, dashboard patterns
- `/skills/ui-ux-system-pro/references/accessibility-checklist.md` — WCAG 2.1 AA/AAA compliance
- `/skills/ui-ux-system-pro/references/data-visualization.md` — 25 chart types with best practices

## Checklist before calling the skill done

### Before starting
- [ ] Product type defined (SaaS, e-commerce, etc.)
- [ ] Industry identified (fintech, healthcare, etc.)
- [ ] Target users documented
- [ ] Platform requirements (web, mobile, desktop)
- [ ] Accessibility target (AA/AAA)

### Design system core
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (users, business goals, constraints)
  - [ ] Minimum tokens applied (expand only when justified)
  - [ ] Surgical changes only (tokens related to request)
  - [ ] Success criteria defined (accessible, consistent, scalable)
- [ ] Color palette: 9-step scale (50-900) + semantic mapping
- [ ] Typography: Scale defined, fonts chosen with rationale
- [ ] Spacing: Base unit established, component gaps defined
- [ ] Elevation: Shadow levels for layering
- [ ] Border: Radius scale consistent

### Component library
- [ ] Buttons: All states (default, hover, active, disabled, loading)
- [ ] Forms: Labels, validation, error states
- [ ] Navigation: Desktop + mobile patterns
- [ ] Data display: Tables, lists, cards
- [ ] Feedback: Alerts, toasts, modals, loading

### UX guidelines
- [ ] Accessibility: 4.5:1 contrast, focus rings, ARIA labels
- [ ] Touch: 44px targets, feedback on interaction
- [ ] Performance: Lazy loading, skeleton screens
- [ ] Responsive: Mobile-first, breakpoints defined

### Documentation
- [ ] Design tokens documented with usage
- [ ] Component API documented (props, variants)
- [ ] Usage examples for each pattern
- [ ] Migration guide from existing system
