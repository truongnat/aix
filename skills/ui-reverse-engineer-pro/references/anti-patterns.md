# Anti-Patterns — What to Avoid

## Anti-Pattern 1: Random spacing values

**Example:**
```css
padding: 13px;
gap: 19px;
border-radius: 11px;
```

**Why it's bad:**
- Sign of clone-based thinking
- Breaks consistency
- Hard to maintain
- No system

**Fix:**
Use unified spacing scale:
```css
padding: 16px;  /* from scale: 4, 8, 12, 16, 20, 24, 32, 40 */
gap: 16px;
border-radius: 12px;
```

**Exception:** Only use random values with clear justification.

---

## Anti-Pattern 2: Style before layout

**Example:**
```jsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl blur-sm border-2 border-white/20">
  {/* content */}
</div>
```
...before layout structure is verified.

**Why it's bad:**
- Painful patching
- Layout issues hidden by visual noise
- Hard to fix structure problems
- Code becomes messy

**Fix:**
```jsx
// Phase 1: Layout only
<div className="flex flex-col gap-4 p-6">
  {/* content */}
</div>

// Phase 2: Add components
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg">
  {/* content */}
</div>

// Phase 3: Polish
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  {/* content */}
</div>
```

---

## Anti-Pattern 3: Image as absolute spec

**Example:**
- "This screenshot says padding is exactly 27px"
- "The shadow is exactly #00000026"
- "The border radius is exactly 11.5px"

**Why it's bad:**
- Screenshots don't contain:
  - Responsive rules
  - Hover states
  - Empty states
  - Disabled states
  - Loading states
  - Interaction flow

**Fix:**
Treat image as visual reference, not specification. Extract:
- Layout structure
- Spacing ratios
- Visual hierarchy
- Component patterns
- Design intent

---

## Anti-Pattern 4: Early visual overload

**Example:**
Adding all effects at once:
- Gradient backgrounds
- Glow effects
- Glassmorphism
- Blur filters
- Strong shadows
- Complex animations

...before layout is solid.

**Why it's bad:**
- Hides layout issues
- Makes UI look "non-quality"
- Hard to debug structure problems
- Performance impact

**Fix:**
1. Layout skeleton first
2. Typography + components
3. Basic colors
4. Subtle shadows
5. Polish effects last

---

## Anti-Pattern 5: Trusting AI output blindly

**Common AI mistakes:**
- Wrong grouping of elements
- Incorrect component split
- Non-standard spacing choices
- Nested div soup
- Visual "na-na" but lacks product sense
- Missing edge cases
- No consideration for states

**Why it's bad:**
- AI doesn't have product sense
- AI often clones blindly
- AI misses UX considerations
- AI doesn't understand maintainability

**Fix:**
Always review AI output using the 7-criteria rubric. Ask AI to:
- Use 8-based spacing scale
- Name components explicitly
- Focus on structure first
- Consider edge cases
- Think about states

---

## Anti-Pattern 6: Component-blind thinking

**Example:**
Prompting:
> Create a white box with an icon on the left, two lines of text, and an arrow on the right

**Why it's bad:**
- No component abstraction
- No reusability
- Hard to maintain
- Inconsistent across screens

**Fix:**
Think in components:
> Create a SettingsListItem component with icon, title, subtitle, and chevron

---

## Anti-Pattern 7: Pixel-perfect obsession

**Example:**
- "This is 2px off from the screenshot"
- "The shadow is not exactly 37% opacity"
- "The border radius should be 11.5px not 12px"

**Why it's bad:**
- Wastes time on unimportant details
- Misses the bigger picture
- Sacrifices system for precision
- Not maintainable

**Fix:**
Focus on:
- Spacing rhythm
- Visual hierarchy
- Component consistency
- Overall feel
- System-based approach
