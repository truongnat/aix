# Prompt Templates — AI-Assisted UI Generation

## Prompt 1 — Analyze image to structure

```
Analyze the UI in this image from a frontend engineer perspective.

Requirements:
- Do not clone pixel-perfect.
- Break down the screen into:
  1. Layout tree
  2. Major sections
  3. Estimated spacing scale
  4. Typography hierarchy
  5. Reusable components
- Answer in a way that can be used to rebuild with a design system.
- Prioritize system, consistency, maintainability.
```

---

## Prompt 2 — Build layout first

```
Based on the UI analysis from the image, rebuild the screen layout using React + Tailwind.

Requirements:
- Focus only on layout and spacing initially.
- No shadow, gradient, detailed icons yet.
- Use consistent spacing scale.
- Separate into logical components.
- No random values unless absolutely necessary.
- Goal: rebuild clean, beautiful, maintainable structure.
```

---

## Prompt 3 — Polish visual details

```
Continue from the current layout and polish the UI in a modern, clean, production-ready direction.

Requirements:
- Keep structure and spacing logic.
- Improve visual quality with typography, radius, border, subtle shadow.
- Don't over-style.
- Prioritize clean, bright, clear hierarchy.
```

---

## Prompt 4 — Review AI output

```
Review this UI code as a senior frontend engineer with product design eye.

Point out:
- Spacing inconsistencies
- Weak hierarchy
- Unclean components
- Non-visual areas
- Where it looks like machine cloning from image

Then propose a better version.
```

---

## Prompt 5 — Extract components

```
From the UI in this image, identify and name all reusable components.

For each component:
- Give it a descriptive name (e.g., StatCard, ListItem, UserProfile)
- Describe its internal structure
- Note any variants
- List props it would need

Focus on componentization, not visual details.
```

---

## Prompt 6 — Define design tokens

```
Based on the UI in this image, extract a design system.

Provide:
- Spacing scale (e.g., 4, 8, 12, 16, 20, 24, 32, 40)
- Typography hierarchy (H1, H2, H3, Body, Caption with size/weight)
- Color palette (primary, secondary, background, text, border)
- Border radius scale
- Shadow scale

Focus on system, not exact pixel values.
```

---

## Prompt 7 — Responsive strategy

```
Based on the desktop UI in this image, define a responsive strategy.

For each breakpoint:
- How does layout change?
- What becomes stacked vs side-by-side?
- What spacing adjustments are needed?
- What typography adjustments are needed?

Provide a mobile-first approach.
```
