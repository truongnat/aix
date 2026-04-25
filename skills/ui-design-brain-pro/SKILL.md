---
name: ui-design-brain-pro
description: "Production-grade UI component knowledge from 60+ documented interface\
  \ patterns.\nBest practices, layout guidance, and usage rules from component.gallery.\n\
  Replaces generic AI output with real design-system knowledge.\n\nUse when building\
  \ web interfaces, dashboards, forms, navigation, or any UI \nthat needs modern,\
  \ minimal, SaaS-quality output grounded in conventions.\n"
metadata:
  content-language: en
  level: professional
---

## Boundary

[Define boundary with related skills]

## When to use

- Building web interfaces or pages
- Creating dashboards or admin panels
- Designing forms and inputs
- Building navigation systems
- Creating data tables or lists
- Designing cards, modals, dialogs
- Need component selection guidance
- Reviewing existing UI for best practices

## When not to use

- Mobile native apps (use platform-design-pro)
- Highly customized artistic designs (use frontend-design-pro)
- Brand-new component inventions (research first)

## Required inputs

- **component_type**: Button, card, modal, table, etc.
- **context**: Dashboard, marketing, e-commerce, etc.
- **tech_stack**: React, Vue, HTML/CSS, etc.

## Expected output

- **component_pattern**: Specific pattern with rationale
- **layout_guidance**: Responsive behavior, spacing
- **interaction_rules**: States, accessibility
- **code_structure**: Recommended implementation


## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** component needs → verify: [type, context, tech stack].
2. **State assumptions** about user flow, data density, platform constraints.
3. **Apply** standard pattern first; variant only when justified.
4. **Make surgical changes** — only modify the requested component.
5. **Define success criteria** (consistent, accessible, scalable); verify.
6. **Respond** with component pattern, layout guidance, code structure.

## Operating principles

1. **Think Before Coding** — State assumptions: user flow, data density, platform.
2. **Simplicity First** — Standard pattern first; custom variant only when justified.
3. **Surgical Changes** — Only touch the component, not unrelated UI.
4. **Goal-Driven Execution** — Consistent, accessible, scalable; verify with checklist.

### Component Philosophy

**Patterns over invention:**
- Use proven solutions from 60+ documented components
- Follow naming conventions from major design systems
- Adapt to context, don't reinvent

**Quality standards:**
- Semantic HTML
- 5 interaction states (default, hover, active, focus, disabled)
- Accessible by default
- Responsive without media queries where possible

### Component Categories

**Navigation:**
- Top navigation, sidebar, tabs, breadcrumbs, pagination
- Mobile: hamburger, bottom nav, floating action button

**Content:**
- Cards, lists, tables, trees, accordions
- Empty states, loading states, error states

**Forms:**
- Inputs, selects, checkboxes, radios, switches
- Validation, helper text, error messages

**Feedback:**
- Alerts, toasts, modals, tooltips, popovers
- Progress indicators, skeleton screens

**Data Display:**
- Tables, data grids, charts, statistics
- Filters, search, sorting

## Suggested response format

```markdown
## Component: [Name]

### Pattern Selection
**Standard:** [Primary/Secondary/Variant]
**Rationale:** [Why this pattern fits context]

### Layout
**Structure:** [HTML/CSS/React structure]
**Responsive:** [Mobile → Desktop behavior]
**Spacing:** [8px grid compliance]

### Interactions
**States:** Default, Hover, Active, Focus, Disabled
**Keyboard:** [Tab order, Enter/Space behavior]
**Accessibility:** [ARIA labels, roles]

### Implementation
```tsx
// Code here
```

### Anti-patterns to avoid
- [List common mistakes]
```

## Quick examples

### Example 1: Dashboard Data Table

**User:** "Create a data table for user management"

**Agent workflow:**
1. **Confirm:** Admin dashboard, user data, React
2. **State assumptions:** 10-100 rows, sorting needed, bulk actions
3. **Apply:** Standard table with sortable headers
4. **Surgical:** Only table component, not entire page
5. **Goal:** Accessible, responsive, performant

**Output:**
- Sticky headers
- Sortable columns
- Row selection with checkboxes
- Pagination (not infinite scroll for admin)
- Responsive: horizontal scroll on mobile

### Example 2: Onboarding Modal

**User:** "Build onboarding modal with 3 steps"

**Agent workflow:**
1. **Confirm:** First-time user flow, web app
2. **State assumptions:** Progressive disclosure, can skip
3. **Apply:** Step indicator modal pattern
4. **Surgical:** Modal only, content from user
5. **Goal:** Clear progress, easy skip, accessible

**Output:**
- Step indicator (1 of 3)
- Next/Previous navigation
- Skip option
- Focus trap inside modal
- Close on Escape

### Example 3: Form Validation Pattern

**User:** "Add validation to this signup form"

**Agent:** Apply real-time validation pattern, error placement, success indicators.

## References

- `/skills/ui-design-brain-pro/references/components-catalog.md` — 60+ components
- `/skills/ui-design-brain-pro/references/layout-patterns.md` — Grid, spacing, responsive
- `/skills/ui-design-brain-pro/references/interaction-states.md` — 5-state model
- `/skills/ui-design-brain-pro/references/anti-patterns.md` — Common mistakes

## Checklist

### Component selection
- [ ] Right component for the job (not reinventing)
- [ ] Pattern from catalog matches context
- [ ] Responsive strategy defined

### Implementation
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (user flow, data, platform)
  - [ ] Standard pattern applied (custom only when justified)
  - [ ] Surgical changes only (component only)
  - [ ] Success criteria defined (consistent, accessible)
- [ ] Semantic HTML
- [ ] 5 interaction states implemented
- [ ] Keyboard accessible
- [ ] ARIA labels where needed

### Quality
- [ ] 8px grid spacing
- [ ] Consistent with design system
- [ ] Responsive behavior documented
- [ ] Performance considered (virtualization for long lists)

### Anti-patterns avoided
- [ ] Not using div for buttons
- [ ] Not relying on color alone
- [ ] Not skipping focus states
- [ ] Not forgetting empty states
