# 7-Step Process — Standard Reverse Engineering Workflow

## Step 1 — Determine image role

Before coding, identify what type of reference this is:

### A. Layout reference
You only need:
- Layout
- Flow
- Hierarchy

### B. Style reference
You need:
- Colors
- Card style
- Border radius
- Shadow

### C. UX reference
You need to learn:
- Flow
- CTA placement
- Interaction priority

### D. Combined reference
Image provides both layout and visual.

**Critical question:**
> What am I extracting from this image? Layout? Mood? UX? Component style?

If you can't answer this, you will clone blindly.

---

## Step 2 — Extract layout wireframe

Before touching code, break image into blocks.

**Example structure:**
```
Screen
- Header
  - Title
  - Subtitle
  - Action icon
- Main content
  - Summary card
  - 2 stat cards in row
  - Recent activity list
- Bottom CTA
```

**Each block must answer:**
- Column or row layout?
- Fixed or scrollable?
- Full width or constrained?
- Parent or child relationship?
- Primary visual focus?

**If you can't write this structure, don't code yet.**

---

## Step 3 — Estimate spacing by scale, not pixel

**Don't:**
- See gap ~19px → code 19
- See padding ~27px → code 27

**Do:**
Map to unified spacing scale:
- 4, 8, 12, 16, 20, 24, 32, 40

**Read spacing from image:**
- Very close together → 4/8
- Close together → 12
- Light group separation → 16
- Section separation → 24
- Strong separation → 32/40

**Golden rule:**
> Evenness matters more than pixel accuracy.

---

## Step 4 — Identify typography hierarchy

You don't need exact font initially. You need to know:

- Which is title
- Which is subtitle
- Which is body
- Which is caption
- Which is label
- Which is emphasis

**Example system:**
- Heading 1: 24 / semibold
- Heading 2: 20 / semibold
- Title: 16 / medium
- Body: 14 / regular
- Caption: 12 / regular

**Questions to answer:**
- What must user see first?
- What is supporting text?
- What is just metadata?

If all text looks equal, the UI is dead.

---

## Step 5 — Recognize components

**Don't think:**
- This shape
- That text
- That icon

**Think:**
- Card
- Button
- Input
- List item
- Badge
- Stat tile
- Tab bar
- Modal block

**Why component thinking?**
- Cleaner code
- Reusable
- Easier style updates
- Better AI support

**Example:**
Don't prompt:
> Create a white box with icon on left, 2 lines of text, arrow on right

Think:
> Create a SettingsListItem component

---

## Step 6 — Build layout skeleton first

**Extremely important.**

**Phase 1: Layout only**
- Flex/stack/grid
- Width/height
- Spacing
- Grouping
- Order

**No:**
- Gradient
- Shadow
- Exact colors
- Exact icons
- Animation

**Phase 2: Typography + components**
- Apply hierarchy
- Component shell

**Phase 3: Visual polish**
- Color
- Radius
- Border
- Shadow
- Effects

**Why?**
If layout is wrong and you style early, you'll:
- Patch painfully
- Code becomes battlefield

---

## Step 7 — Refine by perceived quality

When comparing to reference, ask:

- Is spacing rhythm good?
- Do eyes know where to look first?
- Is screen cramped?
- Too many elements competing?
- Is overall tone clean?

**Don't ask:**
- Why is this 2px off from image?
- Is shadow exactly 37% opacity?

---

## Process Summary

1. **Identify role** — What am I extracting?
2. **Wireframe layout** — Block structure
3. **Standardize spacing** — Scale, not pixels
4. **Define typography** — Hierarchy levels
5. **Name components** — Reusable patterns
6. **Build skeleton** — Layout first, style later
7. **Refine quality** — Perceived over pixel
