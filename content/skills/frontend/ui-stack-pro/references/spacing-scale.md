# Spacing Scale — 8px Grid System

## Why 8px Works

The 8px base unit divides evenly into common screen sizes (360, 375, 390, 414, 768, 1024, 1280, 1440px) and aligns with device pixel ratios (1x, 1.5x, 2x, 3x). 4px is useful as a half-unit for tight adjustments. Most design tools (Figma) and CSS frameworks default to rem-based scales that map cleanly onto 8px increments at 16px root font size.

Core insight: 8px = 0.5rem at 16px base. Everything from there is predictable.

---

## Full Spacing Scale

| Token    | px  | rem    | Tailwind class | Use case                          |
|----------|-----|--------|----------------|-----------------------------------|
| space-1  | 4   | 0.25   | `p-1`          | Icon gap, tight inline spacing    |
| space-2  | 8   | 0.5    | `p-2`          | Compact padding, badge padding    |
| space-3  | 12  | 0.75   | `p-3`          | Input padding (sm), chip padding  |
| space-4  | 16  | 1      | `p-4`          | Base padding unit, card inner     |
| space-5  | 20  | 1.25   | `p-5`          | Button padding (md)               |
| space-6  | 24  | 1.5    | `p-6`          | Card padding (sm), section gap    |
| space-8  | 32  | 2      | `p-8`          | Card padding (md), nav height     |
| space-10 | 40  | 2.5    | `p-10`         | Card padding (lg), modal padding  |
| space-12 | 48  | 3      | `p-12`         | Section header spacing            |
| space-16 | 64  | 4      | `p-16`         | Vertical gap between components   |
| space-20 | 80  | 5      | `p-20`         | Section vertical rhythm (min)     |
| space-24 | 96  | 6      | `p-24`         | Section vertical rhythm (max)     |

---

## Component-Level Padding Patterns

### Buttons

```
sm:  py-1.5 px-3   → 6px / 12px  (exception: 6px is allowed for compact buttons)
md:  py-2   px-4   → 8px / 16px
lg:  py-2.5 px-5   → 10px / 20px  (exception: 10px rounds to grid)
xl:  py-3   px-6   → 12px / 24px
```

Button heights target: 32px (sm), 40px (md), 48px (lg), 56px (xl). These hit 8px grid exactly when you account for border (2px).

### Input Fields

```
sm:  h-8  (32px) — py-1 px-2.5
md:  h-10 (40px) — py-2 px-3
lg:  h-12 (48px) — py-3 px-4
```

### Cards

```
sm card:  p-4     (16px all sides)
md card:  p-6     (24px all sides)
lg card:  p-8     (32px all sides)

Card gap (between cards in grid): gap-4 (16px) to gap-6 (24px)
```

### Modals

```
Header:  px-6 py-4  (24px / 16px)
Body:    px-6 py-4  (24px / 16px)
Footer:  px-6 py-4  (24px / 16px)
```

---

## Allowed Exceptions (Sub-8px Values)

Not everything needs to be 8px-aligned. These specific values are intentional:

- **2px** — divider lines, thin borders, outline offsets
- **6px** — icon-only button padding, avatar ring offset, badge padding
- **1px** — borders (do not use 0.5px — subpixel rendering is inconsistent)

If you find yourself using 3px, 5px, 7px, 9px, 11px — stop. These values are almost always a sign that the design intent is unclear or a component needs to be resized to the nearest grid unit.

---

## Layout: Vertical Rhythm Between Sections

Page-level vertical spacing should breathe. These are the target ranges:

```
Hero → first section:          py-20 to py-24  (80–96px)
Section → section:             py-16 to py-20  (64–80px)
Section header → content:      mb-10 to mb-12  (40–48px)
Feature grid row gap:          gap-8 to gap-12 (32–48px)
Footer top padding:            pt-20           (80px)
```

Use `section` elements with consistent vertical padding, not arbitrary margins on inner elements.

---

## Common Violations to Catch

**Arbitrary pixel values in Tailwind:**
```html
<!-- Bad -->
<div class="p-[13px] mt-[22px] gap-[7px]">

<!-- Good -->
<div class="p-3 mt-6 gap-2">
```

**Inconsistent internal padding:**
```html
<!-- Bad: mixing padding scales inside the same component -->
<div class="pt-5 pb-3 pl-4 pr-6">

<!-- Good: symmetric or intentionally asymmetric with grid values -->
<div class="py-4 px-6">
```

**Margin overuse to compensate for wrong component sizing:**
```html
<!-- Bad: button is wrong size, compensated with margin -->
<button class="h-[38px] mt-[1px]">

<!-- Good: button height is correct, no compensating margin needed -->
<button class="h-10">
```

**Nested components fighting each other's padding:**
Card has `p-6`, inner content also has `p-4` when it shouldn't — the card's padding is the container boundary. Inner content should use `gap` and `space-y`, not duplicate padding.
