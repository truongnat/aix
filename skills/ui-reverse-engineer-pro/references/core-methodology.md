# Core Methodology — Image to UI Reverse Engineering

## Core Principles

### 1. Image is signal, not spec

A screenshot does not contain:
- Auto layout
- Spacing tokens
- Grid rules
- Responsive rules
- Interaction logic
- Component architecture

**Therefore:** Never treat image as absolute specification.

Image is only:
- Visual reference
- Mood
- Hierarchy hint
- Layout hint

---

### 2. Rebuild system, don't clone pixel

**Wrong approach:**
- Measure every px
- Match every shadow
- Force AI to clone details

**Result:**
- Dirty code
- Chaotic spacing
- Non-reusable components
- Poor responsive
- "Looks like but feels cheap"

**Correct approach:**
```
Image → Layout → Structure → Token → Component → Code
```

---

### 3. Layout before visual

UI beauty comes from:
- Clear layout
- Even spacing
- Proper typography hierarchy
- Good visual rhythm
- Minimal conflict

**Analysis order:**
1. Layout
2. Spacing
3. Typography
4. Components
5. Colors
6. Effects

Never reverse this.

---

### 4. Consistency beats precision

**System spacing:**
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

### 5. Component thinking

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

**Why?**
- Cleaner code
- Reusable
- Easier style updates
- Better AI support

---

### 6. Layout skeleton first

**Phase 1: Layout only**
- Flex/stack/grid
- Width/height
- Spacing
- Grouping
- Order

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
Styling before layout is solid leads to painful patching and messy code.

---

### 7. Perceived quality

**Ask:**
- Is spacing rhythm good?
- Do eyes know where to look first?
- Is the screen cramped?
- Too many elements competing?
- Is overall tone clean?

**Don't ask:**
- Why is this 2px off from image?
- Is shadow exactly 37% opacity?
