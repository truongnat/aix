# Quality Rubric — 7 Criteria × 10 Points

When AI returns code, don't judge by vague feeling. Score using these 7 criteria, each 0-10 points.

## 1. Layout clarity

**0-3 points:** Confusing structure, unclear hierarchy, hard to follow
**4-6 points:** Basic structure visible but some confusion
**7-9 points:** Clear structure, obvious hierarchy
**10 points:** Excellent structure, perfectly clear hierarchy

**Questions:**
- Is the layout obvious?
- Can you quickly understand the screen structure?
- Is the visual flow clear?

---

## 2. Spacing consistency

**0-3 points:** Random spacing, inconsistent gaps, chaotic rhythm
**4-6 points:** Some consistency but still random values
**7-9 points:** Consistent spacing scale, even rhythm
**10 points:** Perfect spacing scale, flawless rhythm

**Questions:**
- Is spacing consistent?
- Is there a clear spacing scale?
- Is the rhythm even?

**Critical:** If spacing consistency < 7, redo.

---

## 3. Typography hierarchy

**0-3 points:** All text looks equal, no hierarchy
**4-6 points:** Some hierarchy but weak
**7-9 points:** Clear hierarchy, obvious primary vs supporting
**10 points:** Perfect hierarchy, excellent visual weight

**Questions:**
- Can you tell what's most important?
- Is there clear title/subtitle/body distinction?
- Is visual weight appropriate?

---

## 4. Component reuse quality

**0-3 points:** No components, everything inline
**4-6 points:** Some components but poorly defined
**7-9 points:** Good component separation, reusable
**10 points:** Excellent component architecture, highly reusable

**Questions:**
- Are components clearly defined?
- Can they be reused?
- Is the component structure clean?

---

## 5. Maintainability

**0-3 points:** Hard to modify, spaghetti code
**4-6 points:** Modifiable but with effort
**7-9 points:** Easy to modify, clean structure
**10 points:** Perfectly maintainable, clean architecture

**Questions:**
- Is it easy to change?
- Is the structure clean?
- Can you add features without breaking things?

---

## 6. Visual cleanliness

**0-3 points:** Cluttered, messy, too much noise
**4-6 points:** Some cleanliness but still cluttered
**7-9 points:** Clean, minimal noise
**10 points:** Perfectly clean, minimal distraction

**Questions:**
- Does it look clean?
- Is there unnecessary noise?
- Is the visual tone consistent?

---

## 7. Faithfulness to reference intent

**0-3 points:** Misses the spirit of the reference
**4-6 points:** Captures some spirit but misses key aspects
**7-9 points:** Captures the spirit well
**10 points:** Perfectly captures the reference spirit

**Questions:**
- Does it keep the reference's intent?
- Does it feel like the same design?
- Is the spirit preserved?

---

## Scoring Rules

- **Below 6/10** in any category → Not acceptable
- **Spacing consistency below 7** → Redo
- **Layout clarity below 7** → Drop style, return to skeleton

## Total Score

**0-35:** Poor — Major issues
**36-49:** Fair — Needs significant improvement
**50-63:** Good — Minor improvements needed
**64-70:** Excellent — Production ready

## Quick Pass/Fail

**Pass:** 7+ in layout clarity, spacing consistency, typography hierarchy
**Fail:** Below 7 in any of the three core categories
