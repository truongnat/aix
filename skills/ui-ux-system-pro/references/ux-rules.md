# UX Rules Database - 99 Guidelines by Priority

## Priority 1: CRITICAL - Accessibility

### A11y-1: Color Contrast
**Rule:** All text must meet WCAG 2.1 contrast requirements
**Standard:** 4.5:1 for normal text, 3:1 for large text
**Check:** `npx @adev/colors-check`

### A11y-2: Keyboard Navigation
**Rule:** All interactive elements reachable via Tab
**Implementation:**
```tsx
<button tabIndex={0} onKeyDown={handleKeyDown}>
// Not: <div onClick={handleClick}>
```

### A11y-3: Focus Indicators
**Rule:** Visible focus ring on all interactive elements
**Standard:** 3px outline, 2px offset minimum
```css
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### A11y-4: Alt Text
**Rule:** All images have descriptive alt text
**Exception:** Decorative images use `alt=""`
**Test:** Turn off images, content still understandable

### A11y-5: Form Labels
**Rule:** Every input has associated label
**Implementation:**
```html
<!-- Good -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- Or -->
<input aria-label="Email address" type="email">
```

### A11y-6: Error Prevention
**Rule:** Destructive actions require confirmation
**Pattern:** Modal dialog with clear consequence statement

### A11y-7: Screen Reader Support
**Rule:** Semantic HTML, ARIA only when necessary
**Priority:**
1. Native semantic elements
2. ARIA attributes if semantic not possible
3. Screen reader testing with NVDA/VoiceOver

### A11y-8: Motion Sensitivity
**Rule:** Respect `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Priority 2: CRITICAL - Touch & Interaction

### Touch-1: Target Size
**Rule:** Minimum 44x44px touch targets
**Exception:** Inline links in text (but still generous)

### Touch-2: Feedback
**Rule:** Immediate visual feedback on interaction
**Pattern:**
- Hover: Cursor change, subtle lift
- Active: Pressed state
- Loading: Spinner or skeleton
- Success: Checkmark or toast
- Error: Shake or red highlight

### Touch-3: Gesture Alternatives
**Rule:** All gestures have button alternatives
**Example:** Swipe to delete → Delete button in menu

### Touch-4: Hover-Only Reveals
**Rule:** Never hide critical content behind hover only
**Bad:** Tooltip with essential info
**Good:** Always visible or clickable

---

## Priority 3: HIGH - Performance

### Perf-1: Load Time
**Rule:** First contentful paint < 1.8s, LCP < 2.5s
**Check:** Lighthouse performance audit

### Perf-2: Animation Performance
**Rule:** Animate only `transform` and `opacity`
**Avoid:** `width`, `height`, `top`, `left` (layout thrashing)

### Perf-3: Lazy Loading
**Rule:** Images below fold lazy loaded
```html
<img loading="lazy" src="image.jpg" alt="Description">
```

### Perf-4: Skeleton Screens
**Rule:** Show skeleton during async loading, not just spinner
**Pattern:** Content-shaped placeholder with shimmer

### Perf-5: Debounced Inputs
**Rule:** Search inputs debounced (300ms)
**Implementation:**
```ts
const debouncedSearch = debounce(handleSearch, 300);
```

---

## Priority 4: HIGH - Layout & Responsive

### Layout-1: Mobile-First
**Rule:** Design mobile, enhance for desktop
**Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

### Layout-2: Readable Line Length
**Rule:** 60-75 characters per line for body text
```css
.readable {
  max-width: 65ch;
}
```

### Layout-3: Consistent Spacing
**Rule:** Use 8px grid system (4px base)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Layout-4: Responsive Typography
**Rule:** Fluid type scale with clamp()
```css
.headline {
  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);
}
```

---

## Priority 5: MEDIUM - Typography

### Type-1: Hierarchy
**Rule:** Clear visual hierarchy (H1 > H2 > H3 > body)
**Scale:** 1.25 (Major Third) or 1.333 (Perfect Fourth)

### Type-2: Line Height
**Rule:** 1.5-1.7 for body, 1.2-1.4 for headings
```css
body { line-height: 1.6; }
h1, h2 { line-height: 1.2; }
```

### Type-3: No Emoji as Icons
**Rule:** Use SVG icons, not emoji
**Why:** Inconsistent across platforms, accessibility issues

---

## Priority 6: MEDIUM - Forms

### Form-1: Label Position
**Rule:** Labels above inputs (not inside, not left)
**Exception:** Checkboxes/radio: label to right

### Form-2: Error Timing
**Rule:** Validate on blur, not on every keystroke
**Exception:** Password strength indicator real-time

### Form-3: Clear Errors
**Rule:** Error messages explain how to fix
**Bad:** "Invalid input"
**Good:** "Password must be at least 8 characters with a number"

### Form-4: Progress Indicators
**Rule:** Multi-step forms show progress
**Pattern:** Step indicator (1 of 3) + next/previous

---

## Priority 7: MEDIUM - Navigation

### Nav-1: Consistent Placement
**Rule:** Navigation same position on all pages
**Mobile:** Hamburger (top left or right)
**Desktop:** Horizontal or vertical, consistent

### Nav-2: Current State
**Rule:** Show current page in navigation
**Pattern:** Active link different color/underline

### Nav-3: Breadcrumbs
**Rule:** Deep hierarchies (> 2 levels) need breadcrumbs
**Pattern:** Home > Category > Page

---

## Priority 8: LOW - Charts & Data

### Chart-1: Clear Legends
**Rule:** All data series labeled
**Pattern:** Legend or direct labeling on chart

### Chart-2: Proper Scales
**Rule:** Y-axis starts at 0 for bar charts
**Exception:** Line charts for trends can truncate

### Chart-3: Empty States
**Rule:** No data shows helpful empty state
**Pattern:** "No data available" + action to add

---

## Common Anti-Patterns

### ❌ Violations of Critical Rules

1. **Modal without close button** — Traps keyboard users
2. **Color-only status indicators** — Colorblind users can't see
3. **Autoplay videos** — Violates user control, accessibility
4. **Infinite scroll without footer access** — Breaks navigation
5. **CAPTCHA without audio alternative** — Blocks screen reader users

### ⚠️ Violations of High Rules

1. **Layout shift on load** — Cumulative Layout Shift (CLS) issues
2. **No loading states** — Users don't know system is working
3. **Tiny touch targets** — Mobile frustration
4. **Breakpoints at device widths** — Design for content, not devices

---

## Checklist Summary

### Pre-launch CRITICAL check
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast verified
- [ ] Alt text on images
- [ ] Form labels associated
- [ ] Touch targets 44x44px minimum

### Pre-launch HIGH check
- [ ] Lighthouse performance > 90
- [ ] Mobile-first responsive
- [ ] Loading states implemented
- [ ] Line length < 75 characters
- [ ] Debounced search/inputs

### Ongoing MEDIUM check
- [ ] Typography hierarchy clear
- [ ] Form validation helpful
- [ ] Navigation consistent
- [ ] Empty states designed
