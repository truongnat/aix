# Typography Scale — Modular Scale and Typographic Rules

## Why the 1.25 Ratio (Minor Third)

The Minor Third (1.25x) creates a scale where each step is 25% larger than the previous. It's tight enough to feel cohesive and distinct enough to establish clear hierarchy. Compare:

- 1.067 (Minor Second): steps too close — sizes feel arbitrary at small values
- 1.25 (Minor Third): readable hierarchy, maps to common UI size conventions
- 1.414 (Augmented Fourth): too aggressive for dense UI — jumps feel uncontrolled

Tailwind's default type scale approximates this ratio closely, which is why the framework scale works in practice.

---

## Full Type Scale

| Name       | px  | rem   | Tailwind      | Primary use                         |
|------------|-----|-------|---------------|-------------------------------------|
| text-xs    | 12  | 0.75  | `text-xs`     | Labels, badges, helper text, captions|
| text-sm    | 14  | 0.875 | `text-sm`     | Secondary text, table cells, nav items|
| text-base  | 16  | 1     | `text-base`   | Body text — the baseline            |
| text-lg    | 18  | 1.125 | `text-lg`     | Lead paragraph, card titles (sm)    |
| text-xl    | 20  | 1.25  | `text-xl`     | Section subheadings, card titles    |
| text-2xl   | 24  | 1.5   | `text-2xl`    | H3, sidebar section headers         |
| text-3xl   | 30  | 1.875 | `text-3xl`    | H2, page section titles             |
| text-4xl   | 36  | 2.25  | `text-4xl`    | H1 (page), hero subheading          |
| text-5xl   | 48  | 3     | `text-5xl`    | Hero heading, marketing headline    |

For display-scale headings (landing pages): `text-6xl` (60px), `text-7xl` (72px) — use sparingly and only at viewport widths where they won't overflow.

---

## Line Height Rules

Line height is not one-size-fits-all. It depends on the size and purpose of the text.

| Role              | Line height | Tailwind class    | Why                                      |
|-------------------|-------------|-------------------|------------------------------------------|
| Body text (16px)  | 1.6         | `leading-relaxed` | Long reading — eyes need vertical space  |
| Body text (14px)  | 1.5         | `leading-normal`  | Secondary/compact text                   |
| Headings          | 1.2         | `leading-tight`   | Large text — tight feels intentional     |
| Display (48px+)   | 1.1         | `leading-none`+   | Prevent runaway vertical size            |
| UI labels         | 1.0         | `leading-none`    | Buttons, badges — no extra line gap      |
| Code blocks       | 1.7         | `leading-7`       | Readability in code                      |

```css
/* In practice */
p         { line-height: 1.6; }
h1, h2    { line-height: 1.2; }
h3, h4    { line-height: 1.3; }
button, label, .badge { line-height: 1; }
```

---

## Letter Spacing

Tracking (letter spacing) is applied by text role, not by size alone:

| Role              | Value    | Tailwind          | Example context              |
|-------------------|----------|-------------------|------------------------------|
| Display headings  | -0.02em  | `tracking-tight`  | Hero titles, large H1        |
| Body text         | 0em      | `tracking-normal` | Paragraph text               |
| UI labels (sm)    | 0em      | `tracking-normal` | Button labels, nav items     |
| ALLCAPS labels    | 0.08em   | `tracking-widest` | Section dividers, overlines  |
| Monospace/code    | 0em      | `tracking-normal` | Code snippets                |

Never apply positive tracking to large headings — it reads as amateur. The tighter tracking at large sizes compensates for optical spacing between characters at high point sizes.

---

## Font Weight Roles

Use weight to communicate hierarchy, not decoration:

| Weight | Numeric | Tailwind         | Role                                        |
|--------|---------|------------------|---------------------------------------------|
| Regular| 400     | `font-normal`    | Body text, secondary descriptions           |
| Medium | 500     | `font-medium`    | UI labels, nav items, table headers         |
| Semibold| 600    | `font-semibold`  | Card titles, H3-H4, button labels (md/lg)   |
| Bold   | 700     | `font-bold`      | H1-H2, emphasis, strong callouts            |
| Extra bold| 800  | `font-extrabold` | Marketing display text only                 |

Avoid using `font-black` (900) in product UI. It reads heavy and aggressive unless specifically designed for.

---

## Line Length (Measure)

Optimal reading line length is **45–75 characters per line** for body text. This maps to a container width of approximately 45–65ch.

```css
/* Tailwind: constrain prose width */
.prose        { max-width: 65ch; }
.prose-narrow { max-width: 52ch; }
```

For UI panels (sidebars, cards), shorter measure is fine — the content is scanned, not read linearly. For documentation, legal text, or long-form content, always apply `max-w-prose` or equivalent.

Full-width body text in a 1280px container is a readability failure. A paragraph spanning 120+ characters per line requires excessive horizontal eye movement.

---

## Component Typography Patterns

### Button text

```
sm:   text-sm font-medium
md:   text-sm font-semibold
lg:   text-base font-semibold
xl:   text-base font-bold
```

### Form labels and help text

```
label:      text-sm font-medium text-slate-700
help text:  text-xs text-slate-500 leading-normal
error msg:  text-xs text-red-600 leading-normal
```

### Card hierarchy

```
eyebrow:    text-xs font-semibold tracking-widest uppercase text-slate-400
title:      text-xl font-semibold text-slate-900
body:       text-sm text-slate-600 leading-relaxed
```

---

## Anti-Patterns

**Too many font sizes in one component:**
A card that uses text-xs, text-sm, text-base, text-lg, and text-xl is not hierarchical — it's chaotic. Limit to 2–3 distinct sizes per component.

**Inconsistent weights for the same role:**
Button labels should all be the same weight. If one button is `font-medium` and another is `font-semibold`, it reads as inconsistent product quality.

**Relying on size alone for hierarchy:**
Two items at text-sm with different weights (regular vs semibold) create better hierarchy than two items at text-sm vs text-xs with the same weight.

**Uppercase everywhere:**
ALLCAPS should be rare — overlines, category labels, navigation section dividers. Never apply it to body copy, headings, or button labels in product UI.

**Tight line height on body text:**
`leading-tight` on a paragraph is a common copy-paste error. Always use `leading-relaxed` for body text.
