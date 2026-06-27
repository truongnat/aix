# Color System — 60-30-10 Rule and Semantic Tokens

## The 60-30-10 Rule

A stable color composition that works across UI, print, and interior design:

- **60% dominant**: background surfaces, large empty space — usually neutral (white, gray-50, slate-950)
- **30% secondary**: cards, sidebars, text blocks, secondary UI elements — slightly differentiated from dominant
- **10% accent**: CTAs, links, highlights, selected states, active indicators — your brand color

In a typical dashboard: 60% is the page background, 30% is the sidebar + cards, 10% is primary buttons + active nav items + focus rings.

Violating this (e.g. 40% accent) creates visual fatigue. The accent color loses meaning when overused.

---

## Semantic Token Definitions

Define tokens by role, not by value. The value can change; the role should not.

```css
:root {
  /* Brand */
  --color-primary:        #2563eb;  /* Blue 600 */
  --color-primary-hover:  #1d4ed8;  /* Blue 700 */
  --color-primary-light:  #eff6ff;  /* Blue 50 — tinted backgrounds */

  /* Secondary */
  --color-secondary:      #64748b;  /* Slate 500 */
  --color-secondary-hover:#475569;  /* Slate 600 */

  /* Accent (use sparingly — the 10%) */
  --color-accent:         #7c3aed;  /* Violet 600 */

  /* Surfaces (the 60% + 30%) */
  --color-background:     #ffffff;
  --color-surface-1:      #f8fafc;  /* Slate 50 — page background */
  --color-surface-2:      #f1f5f9;  /* Slate 100 — card background */
  --color-surface-3:      #e2e8f0;  /* Slate 200 — popover, hover bg */
  --color-surface-4:      #cbd5e1;  /* Slate 300 — tooltip, overlay */

  /* Text */
  --color-text-primary:   #0f172a;  /* Slate 950 */
  --color-text-secondary: #475569;  /* Slate 600 */
  --color-text-muted:     #94a3b8;  /* Slate 400 */
  --color-text-on-dark:   #f8fafc;  /* On dark backgrounds */

  /* Border */
  --color-border:         #e2e8f0;  /* Slate 200 */
  --color-border-strong:  #94a3b8;  /* Slate 400 */

  /* Status */
  --color-success:        #16a34a;  /* Green 600 */
  --color-success-bg:     #f0fdf4;  /* Green 50 */
  --color-warning:        #d97706;  /* Amber 600 */
  --color-warning-bg:     #fffbeb;  /* Amber 50 */
  --color-error:          #dc2626;  /* Red 600 */
  --color-error-bg:       #fef2f2;  /* Red 50 */
  --color-info:           #0284c7;  /* Sky 600 */
  --color-info-bg:        #f0f9ff;  /* Sky 50 */
}
```

---

## Status Colors — Standard Values

| Status  | Text/Icon hex | Background hex | Tailwind text     | Tailwind bg        |
|---------|--------------|----------------|-------------------|--------------------|
| success | `#16a34a`    | `#f0fdf4`      | `text-green-600`  | `bg-green-50`      |
| warning | `#d97706`    | `#fffbeb`      | `text-amber-600`  | `bg-amber-50`      |
| error   | `#dc2626`    | `#fef2f2`      | `text-red-600`    | `bg-red-50`        |
| info    | `#0284c7`    | `#f0f9ff`      | `text-sky-600`    | `bg-sky-50`        |

Always pair the tinted background with the dark text color — never use a light text color on a tinted background in light mode (contrast fails).

---

## Surface Hierarchy (Elevation via Color)

In light mode, elevation goes lighter → slightly tinted (no shadows needed for most surfaces):

```
Page background:   --color-surface-1   (#f8fafc) — the canvas
Card:              --color-background  (#ffffff)  — cards sit above the canvas
Popover/Dropdown:  --color-background  (#ffffff) + shadow-lg
Tooltip:           --color-surface-4   (#cbd5e1) or dark (#1e293b)
Modal overlay:     rgba(0,0,0,0.4)     — scrim behind modal
```

Shadows are for modals, popovers, and dropdowns. Cards on a white background use a subtle border (`border border-slate-200`), not a shadow.

---

## Generating a Palette from One Brand Color

Given a brand hex (e.g. `#2563eb`), generate a full scale:

1. Convert to HSL: `hsl(221, 83%, 53%)`
2. Keep hue fixed (221), vary lightness in steps:
   - 50: L=97%, S=90%   (very light tint)
   - 100: L=93%, S=85%
   - 200: L=85%, S=80%
   - 300: L=75%, S=78%
   - 400: L=63%, S=80%
   - 500: L=60%, S=83%
   - 600: L=53%, S=83%  ← brand color
   - 700: L=43%, S=82%
   - 800: L=34%, S=80%
   - 900: L=25%, S=78%
   - 950: L=16%, S=75%

Saturation slightly decreases at extremes to avoid muddy darks and washed-out lights.

---

## Dark Mode: Maintain 60-30-10 in Dark Palette

Don't just invert the light palette. The ratios must hold:

```
Light:  60% white/near-white → Dark: 60% slate-950/slate-900
Light:  30% slate-50/slate-100 → Dark: 30% slate-800/slate-700
Light:  10% blue-600 → Dark: 10% blue-400 (lighter to show on dark bg)
```

Dark mode adjustments for status colors — shift to lighter values:
- success: `text-green-400` on `bg-green-950`
- warning: `text-amber-400` on `bg-amber-950`
- error: `text-red-400` on `bg-red-950`

---

## WCAG AA Contrast Requirements

These token pairs MUST meet 4.5:1 for normal text, 3:1 for large text (18px+):

| Foreground token          | Background token        | Min ratio | Notes                    |
|--------------------------|-------------------------|-----------|--------------------------|
| `--color-text-primary`   | `--color-background`    | 4.5:1     | Body text — non-negotiable|
| `--color-text-secondary` | `--color-background`    | 4.5:1     | Must still pass AA        |
| `--color-text-on-dark`   | `--color-primary`       | 4.5:1     | White text on brand button|
| `--color-primary`        | `--color-background`    | 3:1       | Interactive UI component  |
| `--color-text-muted`     | `--color-background`    | Check!    | Slate 400 on white FAILS  |

`text-slate-400` (`#94a3b8`) on white has a 2.5:1 ratio — it fails WCAG AA. Only use it for purely decorative text (placeholder hints inside already-labeled inputs) or increase it to `text-slate-500`.
